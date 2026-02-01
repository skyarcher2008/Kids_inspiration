// 更新后的 TodayStats.tsx - 添加解锁成就统计
import React from 'react';

interface TodayStatsProps {
  totalStars: number;
  todayProgress: any;
  currentStreak: number;
  unlockedCount: number;
  totalAchievements: number;
}

export const TodayStats: React.FC<TodayStatsProps> = ({
  totalStars,
  todayProgress,
  currentStreak,
  unlockedCount,
  totalAchievements
}) => {
  return (
    <div className="flex justify-center items-center gap-4 flex-wrap">
      {/* 总星星 */}
      <div className="bg-yellow-400 text-white px-6 py-3 rounded-full shadow-lg transform hover:scale-105 transition-transform cursor-pointer">
        <span className="text-2xl font-bold">⭐ {totalStars}</span>
        <span className="block text-sm">总星星</span>
      </div>
      
      {/* 今日完成率 */}
      <div className="bg-piggy-blue text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-shadow">
        <span className="text-2xl font-bold">{todayProgress.toFixed(0)}%</span>
        <span className="block text-sm">今日完成</span>
      </div>
      
      {/* 连续天数 */}
      <div className="bg-piggy-green text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-shadow">
        <span className="text-2xl font-bold">🔥 {currentStreak}</span>
        <span className="block text-sm">连续天数</span>
      </div>
      
      {/* 解锁成就 */}
      <div className="bg-purple-500 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-shadow">
        <span className="text-2xl font-bold">🏆 {unlockedCount}</span>
        <span className="block text-sm">解锁成就</span>
      </div>
    </div>
  );
};