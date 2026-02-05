import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Upload, RefreshCw, Sparkles } from 'lucide-react';
import { WordItem } from '../../types';

interface WordsViewProps {
  words: WordItem[];
  onAnswer: (wordId: string, isCorrect: boolean) => void;
  onReveal: (wordId: string) => void;
  onImport: (file: File) => void;
  streak: number;
  bestStreak: number;
  accuracy: number;
  luckValue: number;
  envelopeCountdown: number;
}

const hashSeed = (text: string) => {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) % 100000;
  }
  return hash;
};

const maskWord = (word: string, stage: number, seedText: string) => {
  if (stage >= 3) return '_ '.repeat(word.length).trim();
  const letters = word.split('');
  const hideCount = stage === 0 ? 1 : stage === 1 ? 2 : 3;
  const indexes = new Set<number>();
  let seed = hashSeed(seedText);
  while (indexes.size < Math.min(hideCount, word.length - 1)) {
    seed = (seed * 9301 + 49297) % 233280;
    const idx = seed % word.length;
    if (idx !== 0) indexes.add(idx);
  }
  return letters
    .map((letter, idx) => (idx === 0 || !indexes.has(idx) ? letter : '_'))
    .join(' ');
};

export const WordsView: React.FC<WordsViewProps> = ({ words, onAnswer, onReveal, onImport, streak, bestStreak, accuracy, luckValue, envelopeCountdown }) => {
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<{ correct: boolean; answer: string } | null>(null);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [pendingRevealId, setPendingRevealId] = useState<string | null>(null);
  const [inlineLetters, setInlineLetters] = useState<string[]>([]);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const dueWords = useMemo(() => {
    const now = Date.now();
    return words.filter(word => word.nextReview <= now);
  }, [words]);

  const learningCount = useMemo(() => words.filter(word => word.stage > 0 && word.familiarity !== 'known').length, [words]);
  const notStartedCount = useMemo(
    () => words.filter(word => word.stage === 0 && !word.lastReview && word.correctCount === 0 && word.wrongCount === 0).length,
    [words]
  );
  const completedCount = useMemo(() => words.filter(word => word.familiarity === 'known').length, [words]);

  const currentWord = dueWords[0] || words[0];
  const masked = useMemo(() => {
    if (!currentWord) return '';
    return maskWord(currentWord.word, currentWord.stage, `${currentWord.id}-${currentWord.stage}`);
  }, [currentWord]);

  const maskedTokens = useMemo(() => masked.split(' ').filter(Boolean), [masked]);

  const findNextBlank = (startIndex: number) => {
    for (let i = startIndex + 1; i < maskedTokens.length; i += 1) {
      if (maskedTokens[i] === '_') return i;
    }
    return -1;
  };

  const findPrevBlank = (startIndex: number) => {
    for (let i = startIndex - 1; i >= 0; i -= 1) {
      if (maskedTokens[i] === '_') return i;
    }
    return -1;
  };

  useEffect(() => {
    if (!currentWord) return;
    const letters = currentWord.word.split('').map((letter, idx) => (maskedTokens[idx] === '_' ? '' : letter));
    setInlineLetters(letters);
    setInput('');
    setFeedback(null);
    setShowAnswerModal(false);
    setPendingRevealId(null);
  }, [currentWord, maskedTokens]);

  const getMissingLetters = (word: string, maskedText: string) => {
    const letters = word.split('');
    const tokens = maskedText.split(' ');
    const missing: string[] = [];
    for (let i = 0; i < Math.min(letters.length, tokens.length); i += 1) {
      if (tokens[i] === '_' && letters[i].trim()) {
        missing.push(letters[i]);
      }
    }
    return missing.join('');
  };

  const normalize = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[.!,?，。！？'’“”"()]/g, '')
      .replace(/\s+/g, ' ');

  const buildAcceptableAnswers = (word: string) => {
    const answers: string[] = [];
    const base = word.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
    if (base) answers.push(base);
    const match = word.match(/\(([^)]+)\)/);
    if (match?.[1]) {
      match[1].split(/[\/，,]/).forEach(part => {
        const cleaned = part.trim();
        if (cleaned) answers.push(cleaned);
      });
    }
    return Array.from(new Set(answers.map(item => normalize(item))));
  };

  const buildInlineAnswer = () => inlineLetters.join('');

  const handleSubmit = () => {
    if (!currentWord) return;
    const candidate = input.trim() ? input : buildInlineAnswer();
    const normalized = normalize(candidate);
    const targets = buildAcceptableAnswers(currentWord.word);
    const missingLetters = normalize(getMissingLetters(currentWord.word, masked)).replace(/\s+/g, '');
    const compact = normalized.replace(/\s+/g, '');
    const correct =
      targets.some(target => target === normalized || target.replace(/\s+/g, '') === compact) ||
      (missingLetters.length > 0 && compact === missingLetters);
    onAnswer(currentWord.id, correct);
    setFeedback({ correct, answer: currentWord.word });
    setShowAnswerModal(true);
  };

  const handleNext = () => {
    setInput('');
    if (currentWord) {
      const letters = currentWord.word.split('').map((letter, idx) => (maskedTokens[idx] === '_' ? '' : letter));
      setInlineLetters(letters);
    }
    setFeedback(null);
    setShowAnswerModal(false);
  };

  if (!currentWord) {
    return (
      <div className="py-10 text-center text-slate-400">请先导入单词表。</div>
    );
  }

  return (
    <div className="py-4 pb-24 animate-slide-up">
      <div className="px-4 mb-4">
        <h2 className="text-xl font-cute text-slate-700 flex items-center">
          <span className="bg-emerald-100 p-2 rounded-xl mr-3 shadow-sm"><Sparkles className="text-emerald-500 w-5 h-5" /></span>
          英语单词记忆
        </h2>
        <p className="text-xs text-slate-400 mt-1 ml-12">艾宾浩斯记忆曲线安排复习时间</p>
        <p className="text-xs text-slate-400 mt-1 ml-12">答对一题 +10 分，连对 5 题有奖励，每天前 10 题双倍积分。</p>
      </div>

      <div className="px-4 flex gap-2 mb-4 flex-wrap">
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-100 text-slate-600 cursor-pointer">
          <Upload size={16} /> 导入词库（PDF/Excel/CSV）
          <input
            type="file"
            className="hidden"
            accept=".pdf,.xlsx,.xls,.csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImport(file);
              e.currentTarget.value = '';
            }}
          />
        </label>
        <button
          onClick={handleNext}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-600"
        >
          <RefreshCw size={16} /> 换一题
        </button>
      </div>

      <div className="bg-white rounded-[2rem] mx-4 p-6 shadow-sm border border-slate-100 text-center">
        <div className="text-base text-slate-500 mb-2">中文意思</div>
        <div className="text-2xl font-cute text-slate-800 mb-4">{currentWord.meaning}</div>
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {currentWord.word.split('').map((letter, idx) => {
            const token = maskedTokens[idx];
            if (token === '_') {
              return (
                <input
                  key={`input-${idx}`}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  value={inlineLetters[idx] || ''}
                  maxLength={1}
                  onChange={(e) => {
                    const value = e.target.value.slice(-1);
                    setInlineLetters(prev => {
                      const next = [...prev];
                      next[idx] = value;
                      return next;
                    });
                    if (value) {
                      const nextIndex = findNextBlank(idx);
                      if (nextIndex >= 0) {
                        inputRefs.current[nextIndex]?.focus();
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !inlineLetters[idx]) {
                      const prevIndex = findPrevBlank(idx);
                      if (prevIndex >= 0) {
                        inputRefs.current[prevIndex]?.focus();
                      }
                    }
                  }}
                  className="w-10 h-12 text-center text-xl font-bold text-emerald-600 border-2 border-emerald-200 rounded-lg bg-white focus:border-emerald-400 outline-none"
                />
              );
            }
            return (
              <div
                key={`fixed-${idx}`}
                className="w-10 h-12 flex items-center justify-center text-xl font-bold text-emerald-500 border-b-2 border-emerald-200"
              >
                {letter}
              </div>
            );
          })}
        </div>
        <div className="text-xs text-slate-400 mb-2">在空格里输入缺失字母即可提交</div>
        <div className="flex justify-center gap-3 mt-4">
          <button
            onClick={handleSubmit}
            disabled={!inlineLetters.some(letter => letter.trim())}
            className="px-6 py-2 rounded-xl font-cute text-white bg-gradient-to-r from-emerald-400 to-green-400 shadow-md disabled:opacity-50"
          >
            提交答案
          </button>
          <button
            onClick={() => {
              setFeedback({ correct: false, answer: currentWord.word });
              setPendingRevealId(currentWord.id);
              setShowAnswerModal(true);
            }}
            className="px-5 py-2 rounded-xl font-cute text-slate-600 bg-slate-100 shadow-sm"
          >
            不会，显示答案
          </button>
        </div>

        {feedback && (
          <div className={`mt-4 font-bold ${feedback.correct ? 'text-emerald-500' : 'text-rose-400'}`}>
            {feedback.correct ? '正确！继续保持～' : `正确答案：${feedback.answer}`}
          </div>
        )}
      </div>

      {showAnswerModal && feedback && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-6 text-center">
            <div className={`text-2xl font-cute mb-2 ${feedback.correct ? 'text-emerald-500' : 'text-rose-400'}`}>
              {feedback.correct ? '太棒了！' : '再努力一下～'}
            </div>
            <div className="text-slate-500 mb-4">正确答案</div>
            <div className="text-xl font-bold text-slate-700 mb-6">{feedback.answer}</div>
            <button
              onClick={() => {
                if (pendingRevealId) {
                  onReveal(pendingRevealId);
                }
                setPendingRevealId(null);
                setShowAnswerModal(false);
              }}
              className="w-full py-2 rounded-xl bg-slate-100 text-slate-600 font-bold"
            >
              我知道了
            </button>
          </div>
        </div>
      )}

      <div className="px-4 mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
          <div className="text-xs text-slate-400 font-bold">连对</div>
          <div className="text-2xl font-cute text-amber-400">{streak}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
          <div className="text-xs text-slate-400 font-bold">最佳连对</div>
          <div className="text-2xl font-cute text-amber-400">{bestStreak}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
          <div className="text-xs text-slate-400 font-bold">正确率</div>
          <div className="text-2xl font-cute text-emerald-500">{accuracy}%</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
          <div className="text-xs text-slate-400 font-bold">红包倒计时</div>
          <div className="text-2xl font-cute text-rose-400">{envelopeCountdown} 题</div>
        </div>
      </div>

      <div className="px-4 mt-5 text-xs text-slate-400 text-center">
        幸运值 {luckValue.toFixed(2)}，答题越多红包越丰厚～
      </div>

      <div className="px-4 mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
          <div className="text-xs text-slate-400 font-bold">学习中</div>
          <div className="text-2xl font-cute text-amber-500">{learningCount}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
          <div className="text-xs text-slate-400 font-bold">待复习</div>
          <div className="text-2xl font-cute text-emerald-500">{dueWords.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
          <div className="text-xs text-slate-400 font-bold">未开始</div>
          <div className="text-2xl font-cute text-slate-600">{notStartedCount}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
          <div className="text-xs text-slate-400 font-bold">已完成</div>
          <div className="text-2xl font-cute text-slate-600">{completedCount}</div>
        </div>
      </div>
    </div>
  );
};
