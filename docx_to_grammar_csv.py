import argparse
import csv
import os
import re
import tempfile
from typing import Dict, List, Tuple

from docx import Document


def read_docx_text(path: str) -> str:
    doc = Document(path)
    parts: List[str] = []
    for paragraph in doc.paragraphs:
        text = paragraph.text.strip()
        if text:
            parts.append(text)
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                text = cell.text.strip()
                if text:
                    parts.append(text)
    return "\n".join(parts)


def normalize_text(text: str) -> str:
    text = text.replace("．", ".")
    text = re.sub(r"\[来源[:：][^\]]+\]", "", text)
    text = re.sub(r"\[[^\]]*学科网[^\]]*\]", "", text)
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    normalized_lines = []
    for line in lines:
        line = line.replace("\t", " ")
        line = re.sub(r"_{2,}", " ____ ", line)
        line = re.sub(r"[\(（]\s+[\)）]", "( )", line)
        if not re.match(r"^[A-D]\s*[\.．]", line):
            line = re.sub(r"\s{3,}", " ____ ", line)
        line = re.sub(r"\s+", " ", line)
        line = re.sub(r"\s*([A-D])\.", r" \1.", line)
        normalized_lines.append(line.strip())
    return " ".join(normalized_lines).strip()


def extract_answer_key(text: str) -> Dict[int, str]:
    key = {}
    answer_match = re.search(r"答案[:：]", text)
    if not answer_match:
        return key
    tail = text[answer_match.end():]
    for match in re.finditer(r"(\d+)\s*[.:：]?\s*([A-D])", tail):
        key[int(match.group(1))] = match.group(2).upper()
    return key


def split_questions(text: str) -> List[Tuple[int, str]]:
    pattern = re.compile(r"[\(（]\s*[\)）]\s*(\d+)[\.．]?")
    matches = list(pattern.finditer(text))
    blocks: List[Tuple[int, str]] = []
    for idx, match in enumerate(matches):
        start = match.end()
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(text)
        number = int(match.group(1))
        block = text[start:end].strip()
        if block:
            blocks.append((number, block))
    return blocks


def parse_block(block: str) -> Tuple[str, List[str]]:
    option_matches = list(re.finditer(r"([A-D])\s*[\.．]\s*", block))
    if len(option_matches) < 3:
        return "", []
    stem = block[: option_matches[0].start()].strip()
    options: List[str] = []
    for i in range(len(option_matches)):
        start = option_matches[i].end()
        end = option_matches[i + 1].start() if i + 1 < len(option_matches) else len(block)
        options.append(block[start:end].strip())
    if len(options) == 3:
        options.append("N/A")
    return stem, options


def parse_docx_to_rows(input_path: str) -> Tuple[List[List[str]], Dict[str, int], List[Tuple[int, str]]]:
    raw_text = read_docx_text(input_path)
    if not raw_text.strip():
        return [], {
            "raw_lines": 0,
            "question_blocks": 0,
            "parsed": 0,
            "skipped": 0
        }, []
    normalized = normalize_text(raw_text)
    answer_key = extract_answer_key(normalized)
    questions = split_questions(normalized)

    rows = []
    skipped = 0
    skipped_blocks: List[Tuple[int, str]] = []
    for number, block in questions:
        stem, options = parse_block(block)
        if not stem or len(options) != 4:
            skipped += 1
            skipped_blocks.append((number, block))
            continue
        answer = answer_key.get(number, "")
        rows.append([stem, options[0], options[1], options[2], options[3], answer, ""])
    return rows, {
        "raw_lines": len(raw_text.splitlines()),
        "question_blocks": len(questions),
        "parsed": len(rows),
        "skipped": skipped
    }, skipped_blocks


def collect_word_files(input_path: str) -> List[str]:
    input_path = os.path.abspath(input_path)
    if os.path.isdir(input_path):
        files = [
            os.path.join(input_path, name)
            for name in os.listdir(input_path)
            if name.lower().endswith((".docx", ".doc"))
        ]
        return sorted(files)
    return [input_path]


def convert_doc_to_docx(word_app, input_path: str, temp_dir: str) -> str:
    input_path = os.path.abspath(input_path)
    base = os.path.splitext(os.path.basename(input_path))[0]
    output_path = os.path.join(temp_dir, f"{base}.docx")
    document = word_app.Documents.Open(input_path, ReadOnly=True)
    try:
        document.SaveAs(output_path, FileFormat=16)
    finally:
        document.Close(False)
    return output_path


def write_debug_files(debug_dir: str, file_name: str, normalized: str, skipped_blocks: List[Tuple[int, str]]) -> None:
    if not debug_dir:
        return
    os.makedirs(debug_dir, exist_ok=True)
    normalized_path = os.path.join(debug_dir, f"{file_name}.normalized.txt")
    with open(normalized_path, "w", encoding="utf-8") as f:
        f.write(normalized)
    if skipped_blocks:
        skipped_path = os.path.join(debug_dir, f"{file_name}.skipped.txt")
        with open(skipped_path, "w", encoding="utf-8") as f:
            for number, block in skipped_blocks:
                f.write(f"[{number}] {block}\n")


def convert_docx_to_csv(input_path: str, output_path: str, debug_dir: str) -> int:
    files = collect_word_files(input_path)
    rows: List[List[str]] = []
    warnings: List[str] = []
    word_app = None
    temp_dir = None
    try:
        needs_word = any(path.lower().endswith(".doc") for path in files)
        if needs_word:
            import win32com.client  # type: ignore

            word_app = win32com.client.Dispatch("Word.Application")
            word_app.Visible = False
            word_app.DisplayAlerts = 0
            temp_dir = tempfile.mkdtemp(prefix="docx_tmp_")

        for file_path in files:
            file_name = os.path.basename(file_path)
            source_path = file_path
            try:
                if file_path.lower().endswith(".doc"):
                    if not word_app or not temp_dir:
                        raise RuntimeError("Word COM is not available for .doc conversion")
                    source_path = convert_doc_to_docx(word_app, file_path, temp_dir)

                file_rows, stats, skipped_blocks = parse_docx_to_rows(source_path)

                normalized = normalize_text(read_docx_text(source_path))
                write_debug_files(debug_dir, os.path.splitext(file_name)[0], normalized, skipped_blocks)
            except Exception as exc:
                warnings.append(f"[ERROR] {file_name}: {exc}")
                continue

            rows.extend(file_rows)
            if stats["question_blocks"] == 0:
                warnings.append(
                    f"[WARN] {file_name}: no question markers like '( )1.' detected (lines={stats['raw_lines']})."
                )
            elif stats["parsed"] == 0:
                warnings.append(
                    f"[WARN] {file_name}: question blocks found but options not parsed (blocks={stats['question_blocks']})."
                )
            elif stats["skipped"] > 0:
                warnings.append(
                    f"[WARN] {file_name}: skipped {stats['skipped']} block(s) due to missing options (parsed={stats['parsed']})."
                )
    finally:
        if word_app:
            word_app.Quit()
        if temp_dir and os.path.isdir(temp_dir):
            for name in os.listdir(temp_dir):
                try:
                    os.remove(os.path.join(temp_dir, name))
                except OSError:
                    pass
            try:
                os.rmdir(temp_dir)
            except OSError:
                pass

    with open(output_path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerows(rows)

    if warnings:
        print("\n".join(warnings))

    return len(rows)


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert grammar questions from DOCX to CSV for import.")
    parser.add_argument("input", help="Input .docx path or folder containing .docx files")
    parser.add_argument("-o", "--output", default="grammar-import.csv", help="Output CSV path")
    parser.add_argument("--debug-dir", default="", help="Write normalized text and skipped blocks per file")
    args = parser.parse_args()

    count = convert_docx_to_csv(args.input, args.output, args.debug_dir)
    print(f"Saved {count} questions to {args.output}")


if __name__ == "__main__":
    main()
