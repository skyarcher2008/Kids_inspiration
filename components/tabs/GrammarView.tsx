import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Upload, RefreshCw, FileText } from 'lucide-react';
import { GrammarQuestion } from '../../types';

interface GrammarViewProps {
  questions: GrammarQuestion[];
  onAnswer: (questionId: string, isCorrect: boolean) => void;
  onImport: (file: File) => void;
  streak: number;
  bestStreak: number;
  accuracy: number;
  luckValue: number;
  envelopeCountdown: number;
}

export const GrammarView: React.FC<GrammarViewProps> = ({ questions, onAnswer, onImport, streak, bestStreak, accuracy, luckValue, envelopeCountdown }) => {
  const WRONG_RETRY_GAP = 10;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);

  const retryQueueRef = useRef<Map<string, number>>(new Map());
  const masteredRoundRef = useRef<Set<string>>(new Set());

  const currentQuestion = useMemo(() => questions[currentIndex], [questions, currentIndex]);

  useEffect(() => {
    setCurrentIndex(0);
    setSelectedIndex(null);
    setShowExplanation(false);
    setSubmitted(false);
    setFeedback(null);
    setAnsweredCount(0);
    retryQueueRef.current.clear();
    masteredRoundRef.current.clear();
  }, [questions]);

  const isDisabledOption = (option: string, index: number) => {
    if (index < 2) return false;
    const normalized = (option || '').trim();
    return (
      !normalized ||
      normalized === '/' ||
      normalized === '／' ||
      normalized.toUpperCase() === 'N/A' ||
      /^选项[A-D]$/i.test(normalized)
    );
  };

  const pickNextQuestionIndex = (fromIndex: number, tick: number) => {
    if (!questions.length) return fromIndex;

    const currentId = questions[fromIndex]?.id;

    for (const [questionId, dueTick] of retryQueueRef.current.entries()) {
      if (dueTick > tick || questionId === currentId) continue;
      const retryIndex = questions.findIndex(question => question.id === questionId);
      if (retryIndex >= 0) {
        if (masteredRoundRef.current.has(questionId)) {
          retryQueueRef.current.delete(questionId);
          continue;
        }
        retryQueueRef.current.delete(questionId);
        return retryIndex;
      }
      retryQueueRef.current.delete(questionId);
    }

    const total = questions.length;
    for (let step = 1; step <= total; step += 1) {
      const candidateIndex = (fromIndex + step) % total;
      const questionId = questions[candidateIndex]?.id;
      if (!questionId) continue;
      if (!masteredRoundRef.current.has(questionId)) {
        return candidateIndex;
      }
    }

    masteredRoundRef.current.clear();
    retryQueueRef.current.clear();
    return 0;
  };

  const handleNext = (tickForSelection?: number) => {
    setSelectedIndex(null);
    setShowExplanation(false);
    setSubmitted(false);
    setFeedback(null);
    setCurrentIndex((prev) => pickNextQuestionIndex(prev, tickForSelection ?? answeredCount));
  };

  const handleSubmit = () => {
    if (!currentQuestion || selectedIndex === null || submitted) return;
    if (isDisabledOption(currentQuestion.options[selectedIndex] || '', selectedIndex)) return;
    setSubmitted(true);
    const correct = selectedIndex === currentQuestion.answerIndex;
    onAnswer(currentQuestion.id, correct);
    const nextAnsweredCount = answeredCount + 1;
    setAnsweredCount(nextAnsweredCount);

    if (correct) {
      retryQueueRef.current.delete(currentQuestion.id);
      masteredRoundRef.current.add(currentQuestion.id);
    } else {
      masteredRoundRef.current.delete(currentQuestion.id);
      retryQueueRef.current.set(currentQuestion.id, nextAnsweredCount + WRONG_RETRY_GAP);
    }

    setShowExplanation(true);
    if (correct) {
      setFeedback({ correct: true, message: '答对啦！继续保持～' });
    } else {
      const answerLabel = String.fromCharCode(65 + currentQuestion.answerIndex);
      const answerText = currentQuestion.options[currentQuestion.answerIndex] || '';
      setFeedback({ correct: false, message: `答错了，正确答案是 ${answerLabel}. ${answerText}` });
    }
    if (correct) {
      setTimeout(() => {
        handleNext(nextAnsweredCount);
      }, 1500);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="py-10 text-center text-slate-400">请先导入语法题库。</div>
    );
  }

  return (
    <div className="py-4 pb-24 animate-slide-up">
      <div className="px-4 mb-4">
        <h2 className="text-xl font-cute text-slate-700 flex items-center">
          <span className="bg-purple-100 p-2 rounded-xl mr-3 shadow-sm"><FileText className="text-purple-500 w-5 h-5" /></span>
          英语语法训练
        </h2>
        <p className="text-xs text-slate-400 mt-1 ml-12">选择正确答案，系统会给出解析</p>
        <p className="text-xs text-slate-400 mt-1 ml-12">答对一题 +15 分，连对 5 题有奖励，每天前 10 题双倍积分。</p>
      </div>

      <div className="px-4 flex gap-2 mb-4 flex-wrap">
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-100 text-slate-600 cursor-pointer">
          <Upload size={16} /> 导入题库（PDF/Excel/CSV）
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

      <div className="bg-white rounded-[2rem] mx-4 p-6 shadow-sm border border-slate-100">
        <div className="text-base text-slate-600 mb-4">{currentQuestion.sentence}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentQuestion.options.map((option, idx) => {
            const disabledOption = isDisabledOption(option, idx);
            const selected = selectedIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => {
                  if (!disabledOption) setSelectedIndex(idx);
                }}
                disabled={disabledOption}
                className={`p-3 rounded-xl border-2 text-left font-bold transition-all ${
                  disabledOption
                    ? 'border-slate-300 bg-slate-300 text-slate-500 cursor-not-allowed'
                    : selected
                    ? 'border-purple-400 bg-purple-50 text-purple-600'
                    : 'border-slate-100 bg-slate-50 text-slate-600'
                }`}
              >
                {String.fromCharCode(65 + idx)}. {option}
              </button>
            );
          })}
        </div>
        <div className="flex justify-center gap-3 mt-4">
          <button
            onClick={handleSubmit}
            disabled={selectedIndex === null || submitted}
            className="px-6 py-2 rounded-xl font-cute text-white bg-gradient-to-r from-purple-400 to-indigo-400 shadow-md disabled:opacity-50"
          >
            提交答案
          </button>
          <button
            onClick={handleNext}
            className="px-5 py-2 rounded-xl font-cute text-slate-600 bg-slate-100 shadow-sm"
          >
            下一题
          </button>
        </div>

        {feedback && (
          <div className={`mt-4 font-bold ${feedback.correct ? 'text-emerald-500' : 'text-rose-400'}`}>
            {feedback.message}
          </div>
        )}

        {showExplanation && (
          <div className="mt-4 bg-purple-50 border border-purple-100 rounded-xl p-4 text-sm text-purple-700">
            <div className="font-bold mb-1">解析</div>
            <div>
              正确答案：
              {String.fromCharCode(65 + currentQuestion.answerIndex)}.
              {currentQuestion.options[currentQuestion.answerIndex] || ''}
            </div>
            <div>{currentQuestion.explanation}</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-4 mt-6">
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
    </div>
  );
};
