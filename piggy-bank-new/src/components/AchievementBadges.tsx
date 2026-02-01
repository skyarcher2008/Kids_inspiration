// 创建 src/components/AchievementBadges.tsx
import React from 'react';
import { Achievement } from '../stores/useStore';

interface AchievementBadgesProps {
  achievements: Achievement[];
  unlockedCount: number;
}

export const AchievementBadges: React.FC<AchievementBadgesProps> = ({
  achievements,
  unlockedCount
}) => {
  // 根据屏幕宽度动态调整显示数量
  const getGroupSize = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      
      // 手机端：统一显示4个徽章
      if (width < 640) {
        return 4; // 手机显示4个徽章，2x2布局
      }
      
      // 平板和桌面：保持5个徽章
      return 5;
    }
    return 4;
  };

  const [groupSize, setGroupSize] = React.useState(getGroupSize());
  const [currentGroupIndex, setCurrentGroupIndex] = React.useState(0);

  React.useEffect(() => {
    const handleResize = () => {
      setGroupSize(getGroupSize());
      setCurrentGroupIndex(0); // 重置到第一组
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const achievementGroups: Achievement[][] = [];
  for (let i = 0; i < achievements.length; i += groupSize) {
    achievementGroups.push(achievements.slice(i, i + groupSize));
  }

  const handlePrevious = () => {
    setCurrentGroupIndex((prev) => (prev > 0 ? prev - 1 : achievementGroups.length - 1));
  };

  const handleNext = () => {
    setCurrentGroupIndex((prev) => (prev < achievementGroups.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-piggy-blue">成就徽章</h2>
        <span className="text-sm sm:text-base text-piggy-orange font-bold">
          {unlockedCount}/{achievements.length} 已解锁
        </span>
      </div>
      
      <div className="relative">
        {achievementGroups.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 sm:-translate-x-4 z-10 bg-white rounded-full shadow-lg p-1 sm:p-2 hover:bg-gray-100 transition-colors"
              aria-label="上一组成就"
            >
              <svg className="w-4 h-4 sm:w-6 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2 sm:translate-x-4 z-10 bg-white rounded-full shadow-lg p-1 sm:p-2 hover:bg-gray-100 transition-colors"
              aria-label="下一组成就"
            >
              <svg className="w-4 h-4 sm:w-6 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* 响应式网格布局 */}
        <div className={`grid gap-3 p-2 ${
          groupSize === 4 ? 'grid-cols-2 min-h-[240px]' : 
          'grid-cols-5 min-h-[120px]'
        }`}>
          {Array.from({ length: groupSize }, (_, index) => {
            const achievement = achievementGroups[currentGroupIndex]?.[index];
            return (
              <div
                key={achievement?.id || `placeholder-${index}`}
                className={`${
                  groupSize === 4 ? 'aspect-square' : 'aspect-square'
                } flex flex-col items-center justify-center p-3 sm:p-3 rounded-lg transition-all duration-300 hover:scale-105 ${
                  achievement ? (
                    achievement.unlocked
                      ? 'bg-yellow-100 scale-105 shadow-md border-2 border-yellow-300'
                      : 'bg-gray-100 opacity-50 hover:opacity-75'
                  ) : 'bg-transparent'
                }`}
              >
                {achievement && (
                  <>
                    <div className={`${
                      groupSize === 4 ? 'text-3xl' : 'text-lg sm:text-2xl'
                    } mb-2 ${achievement.unlocked ? 'animate-pulse' : ''}`}>
                      {achievement.icon}
                    </div>
                    <h3 className={`font-bold text-center leading-tight mb-2 ${
                      groupSize === 4 ? 'text-sm' : 'text-xs'
                    }`}>
                      {achievement.name}
                    </h3>
                    <p className={`text-gray-600 text-center leading-tight line-clamp-2 mb-1 ${
                      groupSize === 4 ? 'text-xs block' : 'text-xs hidden sm:block'
                    }`}>
                      {achievement.description}
                    </p>
                    {achievement.unlocked && achievement.unlockedDate && (
                      <p className={`text-piggy-green font-medium text-center ${
                        groupSize === 4 ? 'text-xs block' : 'text-xs hidden sm:block'
                      }`}>
                        ✅ {new Date(achievement.unlockedDate).toLocaleDateString('zh-CN')}
                      </p>
                    )}
                    {!achievement.unlocked && (
                      <p className={`text-gray-400 text-center ${
                        groupSize === 4 ? 'text-xs block' : 'text-xs hidden sm:block'
                      }`}>🔒 未解锁</p>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {achievementGroups.length > 1 && (
          <div className="flex justify-center mt-3 sm:mt-4 gap-1">
            {achievementGroups.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentGroupIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentGroupIndex ? 'bg-piggy-orange' : 'bg-gray-300'
                }`}
                aria-label={`显示第${index + 1}组成就`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};