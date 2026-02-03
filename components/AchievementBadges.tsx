import React from 'react';
import { Achievement } from '../types';

interface AchievementBadgesProps {
  achievements: Achievement[];
}

export const AchievementBadges: React.FC<AchievementBadgesProps> = ({ achievements }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {achievements.map(achievement => (
        <div
          key={achievement.id}
          className={`rounded-2xl p-4 text-center shadow-sm border-2 transition-transform hover:scale-[1.02] ${
            achievement.unlocked
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-slate-50 border-slate-100 opacity-70'
          }`}
        >
          <div className={`text-4xl mb-2 ${achievement.unlocked ? 'animate-pulse' : ''}`}>{achievement.icon}</div>
          <div className="font-bold text-slate-700 text-sm mb-1">{achievement.name}</div>
          <div className="text-xs text-slate-500 leading-snug">{achievement.description}</div>
          {achievement.unlocked && achievement.unlockedDate && (
            <div className="text-[10px] text-emerald-500 font-bold mt-2">
              ✅ {new Date(achievement.unlockedDate).toLocaleDateString('zh-CN')}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
