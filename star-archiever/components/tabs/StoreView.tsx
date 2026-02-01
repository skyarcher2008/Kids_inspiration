
import React, { useState } from 'react';
import { ShoppingBag, Star, Check, AlertCircle } from 'lucide-react';
import { Reward } from '../../types';
import { Theme } from '../../styles/themes';

interface StoreViewProps {
  rewards: Reward[];
  balance: number;
  onRedeem: (reward: Reward) => void;
  theme: Theme;
}

export const StoreView: React.FC<StoreViewProps> = ({ rewards, balance, onRedeem, theme }) => {
  const [confirmId, setConfirmId] = useState<string | null>(null);

    const normalizeLink = (link: string) => {
        let cleaned = link.trim();
        let guard = 0;
        while (cleaned.includes('%25') && guard < 3) {
            try {
                cleaned = decodeURIComponent(cleaned);
            } catch {
                break;
            }
            guard += 1;
        }
        return cleaned;
    };

  const handleClick = (reward: Reward) => {
    if (balance < reward.cost) return;

    if (confirmId === reward.id) {
        // Execute redemption
        onRedeem(reward);
        setConfirmId(null);
    } else {
        // Enter confirmation state
        setConfirmId(reward.id);
        // Auto-reset after 3 seconds
        setTimeout(() => {
            setConfirmId(prev => prev === reward.id ? null : prev);
        }, 3000);
    }
  };

  return (
    <div className="py-4 animate-slide-up pb-20">
      <div className="px-4 mb-4">
          <h2 className={`text-xl font-cute flex items-center ${theme.accent}`}>
              <span className={`${theme.light} p-2 rounded-xl mr-3 shadow-sm rotate-3`}><ShoppingBag className={`w-5 h-5 ${theme.accent}`} /></span>
              兑换商城
          </h2>
             <p className="text-xs text-slate-400 mt-1 ml-12 flex items-center gap-1">
                 <AlertCircle size={12} /> 点击按钮两次以确认兑换
             </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 px-2">
          {rewards.map(reward => {
              const isConfirming = confirmId === reward.id;
              const canAfford = balance >= reward.cost;
                            const rewardLink = reward.link ? normalizeLink(reward.link) : null;
                            const viewerLink = rewardLink
                                ? `/mhtml-viewer.html?file=${encodeURIComponent(rewardLink.replace(/^\//, ''))}`
                                : null;
              
              return (
                  <div key={reward.id} className={`bg-white rounded-[1.8rem] p-4 flex flex-col items-center shadow-[0_4px_0_0_rgba(0,0,0,0.04)] border-2 border-slate-100 relative overflow-hidden hover:${theme.border} transition-all duration-300 group`}>
                      <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-sm mt-2">
                          {reward.icon}
                      </div>
                      <h3 className="font-bold text-slate-700 text-center mb-3 text-base h-10 flex items-center justify-center leading-tight px-1">
                                                    {viewerLink ? (
                                                        <a
                                                            href={viewerLink}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-emerald-600 hover:text-emerald-500 underline decoration-dotted"
                                                        >
                                                            {reward.title}
                                                        </a>
                                                    ) : (
                                                        reward.title
                                                    )}
                      </h3>
                                            {viewerLink && (
                                                <a
                                                    href={viewerLink}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs text-emerald-500 mb-2 hover:text-emerald-400"
                                                >
                                                    查看详情
                                                </a>
                                            )}
                      
                      <button 
                          onClick={() => handleClick(reward)}
                          className={`
                              w-full py-2.5 rounded-xl font-cute text-lg text-white flex items-center justify-center gap-2 transition-all bounce-click shadow-md
                              ${!canAfford 
                                  ? 'bg-slate-200 cursor-not-allowed text-slate-400 shadow-none' 
                                  : isConfirming 
                                      ? 'bg-emerald-500 shadow-emerald-200 scale-105 ring-2 ring-emerald-100' 
                                      : `${theme.button} ${theme.shadow}`
                              }
                          `}
                          disabled={!canAfford}
                      >
                          {isConfirming ? (
                              <span className="flex items-center gap-1 animate-pulse">
                                  确认 <Check size={18} strokeWidth={3} />
                              </span>
                          ) : (
                              <>
                                  <span>{reward.cost}</span>
                                  <Star size={16} fill="currentColor" />
                              </>
                          )}
                      </button>
                  </div>
              );
          })}
      </div>
      
      {rewards.length === 0 && (
        <div className="text-center p-10 text-slate-300">
            <div className="text-4xl mb-2">🎁</div>
                        <p className="font-cute">还没有设置奖励哦</p>
        </div>
      )}
    </div>
  );
};
