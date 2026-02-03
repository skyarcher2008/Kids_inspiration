import React, { useState } from 'react';
import { Calculator, RotateCcw } from 'lucide-react';
import { MathDifficulty, MathQuestion } from '../../types';

interface MathViewProps {
  question: MathQuestion;
  difficulty: MathDifficulty;
  onChangeDifficulty: (level: MathDifficulty) => void;
  onCheckAnswer: (question: MathQuestion, answer: string) => { correct: boolean; correctAnswer: number };
  onNextQuestion: () => void;
  streak: number;
  bestStreak: number;
  accuracy: number;
  luckValue: number;
  envelopeCountdown: number;
}

export const MathView: React.FC<MathViewProps> = ({
  question,
  difficulty,
  onChangeDifficulty,
  onCheckAnswer,
  onNextQuestion,
  streak,
  bestStreak,
  accuracy,
  luckValue,
  envelopeCountdown
}) => {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);

  const handleSubmit = () => {
    const result = onCheckAnswer(question, answer);
    if (result.correct) {
      setFeedback({ correct: true, message: '答对啦！奖励已到账～' });
    } else {
      setFeedback({ correct: false, message: `答错了，正确答案是 ${result.correctAnswer}` });
    }
  };

  const handleNext = () => {
    setAnswer('');
    setFeedback(null);
    onNextQuestion();
  };

  const difficultyOptions: { label: string; value: MathDifficulty }[] = [
    { label: '简单', value: 'easy' },
    { label: '中等', value: 'medium' },
    { label: '挑战', value: 'challenge' }
  ];

  return (
    <div className="py-4 pb-24 animate-slide-up">
      <div className="px-4 mb-4">
        <h2 className="text-xl font-cute text-slate-700 flex items-center">
          <span className="bg-sky-100 p-2 rounded-xl mr-3 shadow-sm"><Calculator className="text-sky-500 w-5 h-5" /></span>
          数学口算闯关
        </h2>
        <p className="text-xs text-slate-400 mt-1 ml-12">答对一题 +10 分，连对还有加成哦！时间题可以输入 12:30 或 1230。</p>
      </div>

      <div className="px-4 mb-4 text-sm text-slate-500">
        难度固定：两/三位数 × 1 位数、两/三位数 ÷ 1 位数及其加减混合运算
      </div>

      <div className="bg-white rounded-[2rem] mx-4 p-6 shadow-sm border border-slate-100 text-center">
        <div className="text-2xl sm:text-3xl font-cute text-slate-700 mb-6">{question.prompt}</div>
        <input
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="输入答案"
          className="w-full max-w-xs mx-auto text-center text-xl font-bold bg-slate-50 rounded-xl border-2 border-slate-100 p-3 outline-none focus:border-sky-300"
        />
        <div className="flex justify-center gap-3 mt-4">
          <button
            onClick={handleSubmit}
            disabled={!answer.trim()}
            className="px-6 py-2 rounded-xl font-cute text-white bg-gradient-to-r from-sky-400 to-blue-400 shadow-md disabled:opacity-50"
          >
            提交答案
          </button>
          <button
            onClick={handleNext}
            className="px-5 py-2 rounded-xl font-cute text-slate-600 bg-slate-100 shadow-sm flex items-center gap-1"
          >
            <RotateCcw size={16} /> 下一题
          </button>
        </div>

        {feedback && (
          <div className={`mt-4 font-bold ${feedback.correct ? 'text-emerald-500' : 'text-rose-400'}`}>
            {feedback.message}
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
