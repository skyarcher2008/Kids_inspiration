import React from 'react';

interface RedEnvelopeModalProps {
  reward: {
    points: number;
    luck?: number;
    kind?: 'normal' | 'signin';
    sourceLabel?: string;
    signInDay?: number;
  } | null;
  onClaim: () => void;
}

export const RedEnvelopeModal: React.FC<RedEnvelopeModalProps> = ({ reward, onClaim }) => {
  if (!reward) return null;

  const title = reward.kind === 'signin' ? '签到红包' : '恭喜获得红包';
  const subtitle = reward.kind === 'signin'
    ? `${reward.sourceLabel || ''}第${reward.signInDay || 1}天签到奖励`
    : `幸运值 ${(reward.luck ?? 0).toFixed(2)}，积分更容易高哦！`;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
      <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-8 text-center animate-pop border-4 border-rose-200">
        <div className="text-6xl mb-3">🧧</div>
        <h2 className="font-cute text-2xl text-slate-800 mb-2">{title}</h2>
        <p className="text-slate-500 mb-6 text-sm">{subtitle}</p>
        <button
          onClick={onClaim}
          className="w-full py-3 rounded-xl font-cute text-xl text-white shadow-xl transition-transform hover:scale-105 active:scale-95 bg-gradient-to-r from-rose-400 to-orange-400"
        >
          打开红包
        </button>
      </div>
    </div>
  );
};
