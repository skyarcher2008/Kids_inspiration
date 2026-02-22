import argparse
import csv
import json
import os
import re
import time
from pathlib import Path
from typing import List, Tuple
from urllib import request
from urllib.error import HTTPError, URLError

VALID_ANSWERS = {"A", "B", "C", "D"}


def read_csv_rows(path: Path) -> Tuple[List[List[str]], str]:
    for encoding in ("utf-8-sig", "utf-8", "gbk"):
        try:
            with path.open("r", encoding=encoding, newline="") as f:
                rows = list(csv.reader(f))
                return rows, encoding
        except UnicodeDecodeError:
            continue
    raise UnicodeDecodeError("csv", b"", 0, 1, "Unable to decode CSV with utf-8/gbk")


def normalize_row(row: List[str]) -> List[str]:
    padded = [str(cell or "").strip() for cell in row]
    while len(padded) < 7:
        padded.append("")
    return padded[:7]


def is_valid_answer(value: str) -> bool:
    return value.strip().upper() in VALID_ANSWERS


def extract_json(text: str) -> dict:
    text = text.strip()
    code_block = re.search(r"```(?:json)?\s*(\{[\s\S]*?\})\s*```", text)
    if code_block:
        text = code_block.group(1)
    else:
        object_match = re.search(r"\{[\s\S]*\}", text)
        if object_match:
            text = object_match.group(0)
    return json.loads(text)


def ask_deepseek(
    api_key: str,
    model: str,
    sentence: str,
    options: List[str],
    base_url: str,
    timeout: int,
) -> Tuple[str, str]:
    prompt = (
        "你是小学英语单选题助手。请只返回JSON，不要任何额外文本。"
        "JSON格式: {\"answer\":\"A|B|C|D\",\"explanation\":\"100字以内中文解释\"}。"
        "题目如下：\n"
        f"题干: {sentence}\n"
        f"A. {options[0]}\n"
        f"B. {options[1]}\n"
        f"C. {options[2]}\n"
        f"D. {options[3]}\n"
        "要求：explanation控制在100字以内，语言简单，适合小朋友理解。"
    )

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "你擅长小学英语语法选择题讲解。"},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.2,
    }

    req = request.Request(
        url=base_url,
        method="POST",
        headers={
            "Authorization": f"Bearer {api_key.strip()}",
            "Content-Type": "application/json",
        },
        data=json.dumps(payload).encode("utf-8"),
    )

    with request.urlopen(req, timeout=timeout) as resp:
        body = resp.read().decode("utf-8")
        data = json.loads(body)

    content = data["choices"][0]["message"]["content"]
    parsed = extract_json(content)
    answer = str(parsed.get("answer", "")).strip().upper()
    explanation = str(parsed.get("explanation", "")).strip()

    if answer not in VALID_ANSWERS:
        raise ValueError(f"Invalid answer from DeepSeek: {answer}")

    explanation = explanation[:100] if explanation else "请根据语法规则选择正确答案。"
    return answer, explanation


def main() -> None:
    parser = argparse.ArgumentParser(description="Use DeepSeek API to fill grammar CSV answers and explanations.")
    parser.add_argument("input", help="Input grammar CSV path")
    parser.add_argument("-o", "--output", default="grammar-import-with-answers.csv", help="Output CSV path")
    parser.add_argument("--api-key", default=os.getenv("DEEPSEEK_API_KEY", ""), help="DeepSeek API key")
    parser.add_argument("--model", default="deepseek-chat", help="DeepSeek model name")
    parser.add_argument("--base-url", default="https://api.deepseek.com/v1/chat/completions", help="DeepSeek chat completions URL")
    parser.add_argument("--timeout", type=int, default=60, help="HTTP timeout seconds")
    parser.add_argument("--sleep", type=float, default=0.2, help="Sleep seconds between API calls")
    parser.add_argument("--overwrite-existing-explanation", action="store_true", help="Also refresh rows that already have explanation")
    args = parser.parse_args()

    if not args.api_key:
        raise SystemExit("Missing API key. Use --api-key or set DEEPSEEK_API_KEY.")

    input_path = Path(args.input).resolve()
    output_path = Path(args.output).resolve()

    rows, _ = read_csv_rows(input_path)
    
    processed_count = 0
    if output_path.exists():
        try:
            existing_rows, _ = read_csv_rows(output_path)
            processed_count = len(existing_rows)
            print(f"发现已存在的输出文件，包含 {processed_count} 行。将从第 {processed_count + 1} 行继续...")
        except Exception:
            pass

    api_calls = 0
    updated_rows = 0
    failed_rows = 0

    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    mode = "a" if processed_count > 0 else "w"
    with output_path.open(mode, encoding="utf-8-sig", newline="") as f:
        writer = csv.writer(f)

        for idx, raw_row in enumerate(rows, start=1):
            if idx <= processed_count:
                continue

            row = normalize_row(raw_row)
            sentence, a, b, c, d, answer, explanation = row

            if not sentence:
                writer.writerow(row)
                f.flush()
                continue

            for i, opt in enumerate((a, b, c, d)):
                if not opt or opt.upper() == "N/A":
                    row[1 + i] = f"选项{chr(65 + i)}"

            need_answer = not is_valid_answer(row[5])
            need_explanation = args.overwrite_existing_explanation or (not row[6])

            if need_answer or need_explanation:
                print(f"正在处理第 {idx}/{len(rows)} 行...")
                
                max_retries = 3
                for attempt in range(max_retries):
                    try:
                        answer_new, explanation_new = ask_deepseek(
                            api_key=args.api_key,
                            model=args.model,
                            sentence=row[0],
                            options=row[1:5],
                            base_url=args.base_url,
                            timeout=args.timeout,
                        )
                        api_calls += 1
                        if need_answer:
                            row[5] = answer_new
                        if need_explanation:
                            row[6] = explanation_new
                        updated_rows += 1
                        time.sleep(args.sleep)
                        break
                    except Exception as exc:
                        if isinstance(exc, HTTPError) and exc.code == 401:
                            print(f"\n[致命错误] API Key 无效或未授权 (HTTP 401)。请检查您的 DEEPSEEK_API_KEY。")
                            raise SystemExit(1)
                        
                        if attempt < max_retries - 1:
                            print(f"[警告] 第 {idx} 行第 {attempt + 1} 次尝试失败: {exc}。2秒后重试...")
                            time.sleep(2)
                        else:
                            failed_rows += 1
                            if not is_valid_answer(row[5]):
                                row[5] = "A"
                            if not row[6]:
                                row[6] = f"自动补全失败：{str(exc)[:80]}"
                            print(f"[错误] 第 {idx} 行在 {max_retries} 次尝试后失败: {exc}")

            writer.writerow(row)
            f.flush()

    print(f"保存至: {output_path}")
    print(f"本次处理行数: {len(rows) - processed_count}")
    print(f"更新行数: {updated_rows}")
    print(f"API调用次数: {api_calls}")
    print(f"失败行数: {failed_rows}")


if __name__ == "__main__":
    main()
