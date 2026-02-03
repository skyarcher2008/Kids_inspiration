import React, { useMemo, useState } from 'react';
import { Upload, RefreshCw, FileText } from 'lucide-react';
import { GrammarQuestion } from '../../types';

interface GrammarViewProps {
  questions: GrammarQuestion[];
  onAnswer: (questionId: string, isCorrect: boolean) => void;
  onImport: (file: File) => void;
}

export const GrammarView: React.FC<GrammarViewProps> = ({ questions, onAnswer, onImport }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = useMemo(() => questions[currentIndex], [questions, currentIndex]);

  const handleSubmit = () => {
    if (!currentQuestion || selectedIndex === null) return;
    const correct = selectedIndex === currentQuestion.answerIndex;
    onAnswer(currentQuestion.id, correct);
    setShowExplanation(true);
  };

  const handleNext = () => {
    setSelectedIndex(null);
    setShowExplanation(false);
    setCurrentIndex((prev) => (prev + 1) % questions.length);
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
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`p-3 rounded-xl border-2 text-left font-bold transition-all ${
                selectedIndex === idx
                  ? 'border-purple-400 bg-purple-50 text-purple-600'
                  : 'border-slate-100 bg-slate-50 text-slate-600'
              }`}
            >
              {String.fromCharCode(65 + idx)}. {option}
            </button>
          ))}
        </div>
        <div className="flex justify-center gap-3 mt-4">
          <button
            onClick={handleSubmit}
            disabled={selectedIndex === null}
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

        {showExplanation && (
          <div className="mt-4 bg-purple-50 border border-purple-100 rounded-xl p-4 text-sm text-purple-700">
            <div className="font-bold mb-1">解析</div>
            <div>正确答案：{String.fromCharCode(65 + currentQuestion.answerIndex)}</div>
            <div>{currentQuestion.explanation}</div>
          </div>
        )}
      </div>
    </div>
  );
};
