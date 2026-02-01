import React from 'react';
// import { useStore } from '../stores/useStore'; // 暂时未使用

export const DevTools: React.FC = () => {
  const isDevMode = process.env.NODE_ENV === 'development';
  
  if (!isDevMode) {
    return null;
  }

  const clearAllData = () => {
    if (window.confirm('确定要清除所有本地数据吗？')) {
      localStorage.removeItem('piggy-bank-storage');
      window.location.reload();
    }
  };

  const clearAchievements = () => {
    if (window.confirm('确定要重置所有成就吗？')) {
      const currentData = localStorage.getItem('piggy-bank-storage');
      if (currentData) {
        const parsed = JSON.parse(currentData);
        parsed.state.achievements = parsed.state.achievements.map((ach: any) => ({
          ...ach,
          unlocked: false,
          unlockedDate: undefined
        }));
        localStorage.setItem('piggy-bank-storage', JSON.stringify(parsed));
        window.location.reload();
      }
    }
  };

  const forceNewVersion = () => {
    const currentData = localStorage.getItem('piggy-bank-storage');
    if (currentData) {
      const parsed = JSON.parse(currentData);
      parsed.version = 0; // 强制触发迁移
      localStorage.setItem('piggy-bank-storage', JSON.stringify(parsed));
      window.location.reload();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50">
      <h3 className="text-sm font-bold mb-2">🛠️ 开发工具</h3>
      <div className="space-y-2">
        <button
          onClick={clearAllData}
          className="block w-full text-left px-3 py-1 text-xs bg-red-600 hover:bg-red-700 rounded"
        >
          清除所有数据
        </button>
        <button
          onClick={clearAchievements}
          className="block w-full text-left px-3 py-1 text-xs bg-orange-600 hover:bg-orange-700 rounded"
        >
          重置成就
        </button>
        <button
          onClick={forceNewVersion}
          className="block w-full text-left px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded"
        >
          强制数据迁移
        </button>
        <button
          onClick={() => console.log(JSON.parse(localStorage.getItem('piggy-bank-storage') || '{}'))}
          className="block w-full text-left px-3 py-1 text-xs bg-green-600 hover:bg-green-700 rounded"
        >
          查看存储数据
        </button>
      </div>
      <div className="text-xs mt-2 text-gray-300">
        版本: v2 | 仅开发模式可见
      </div>
    </div>
  );
};