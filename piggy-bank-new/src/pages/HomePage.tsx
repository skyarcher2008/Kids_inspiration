// 简化版 HomePage.tsx - 暂时移除 Supabase 功能
import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../stores/useStore';
import { TodayStats } from '../components/TodayStats';
import { TodayTasks } from '../components/TodayTasks';
import { WeeklyChart } from '../components/WeeklyChart';
import { PiggyBankCelebration } from '../components/PiggyBankCelebration';
import { AchievementBadges } from '../components/AchievementBadges';
import { TaskManager } from '../components/TaskManager';
import { DailyReport } from '../components/DailyReport';
import { InstallPrompt } from '../components/InstallPrompt';
import { initializeTodayTasks } from '../stores/useStore';
import { useDialog } from '../contexts/DialogContext';
// 暂时注释掉 Supabase 相关导入
// import { AuthModal } from '../components/AuthModal';
// import { SyncStatus } from '../components/SyncStatus';

export const HomePage: React.FC = () => {
  const { showConfirm } = useDialog();
  const {
    totalStars,
    getTodayTasks,
    completeTask,
    uncompleteTask,
    deleteTask,
    getTodayProgress,
    // getWeeklyStats, // 暂时未使用
    achievements,
    dailyRecords,
    currentStreak,
    syncTotalStarsWithHistory
  } = useStore();

  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [celebrationStars, setCelebrationStars] = useState(0);
  // 暂时注释掉认证相关状态
  // const [showAuthModal, setShowAuthModal] = useState(false);
  // const [user, setUser] = useState(null);
  
  const todayTasks = getTodayTasks();
  const todayProgress = getTodayProgress();
  // const weeklyStats = getWeeklyStats(); // 暂时未使用
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  useEffect(() => {
    initializeTodayTasks();
    // 同步总星星数与历史记录，确保数据一致性
    syncTotalStarsWithHistory();
  }, [syncTotalStarsWithHistory]);

  // 任务操作处理函数
  const handleCompleteTask = useCallback((taskId: string) => {
    console.log('完成任务:', taskId);
    
    try {
      // 找到任务并获取星星数
      const task = todayTasks.find(t => t.id === taskId);
      const stars = task?.stars || 1;
      
      completeTask(taskId);
      
      // 显示猪猪存钱罐庆祝动画
      setCelebrationStars(stars);
      setCelebrationVisible(true);
      
    } catch (error) {
      console.error('完成任务时出错:', error);
    }
  }, [completeTask, todayTasks]);

  const handleUncompleteTask = useCallback((taskId: string) => {
    console.log('恢复任务:', taskId);
    
    try {
      uncompleteTask(taskId);
    } catch (error) {
      console.error('恢复任务时出错:', error);
    }
  }, [uncompleteTask]);

  const handleDeleteTask = useCallback((taskId: string, taskName: string) => {
    showConfirm(
      `确定要删除任务"${taskName}"吗？`,
      '删除确认',
      () => {
        console.log('删除任务:', taskId);
        
        try {
          deleteTask(taskId);
        } catch (error) {
          console.error('删除任务时出错:', error);
        }
      }
    );
  }, [deleteTask, showConfirm]);

  // 准备图表数据
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const chartData = last7Days.map(date => {
    const record = dailyRecords.find(r => r.date === date);
    return {
      date: new Date(date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      stars: record?.totalStars || 0,
      completedTasks: record?.tasks.filter(t => t.completed).length || 0,
      totalTasks: record?.tasks.length || 0
    };
  });

  const maxStars = Math.max(...chartData.map(d => d.stars), 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-blue-50 to-yellow-50 p-4 relative">
      {/* 猪猪存钱罐庆祝动画 */}
      <PiggyBankCelebration 
        visible={celebrationVisible} 
        starsCount={celebrationStars}
        onComplete={() => setCelebrationVisible(false)}
      />

      <div className="max-w-6xl mx-auto">
        {/* 顶部标题栏 */}
        <header className="text-center py-8 mb-8">
          <h1 className="text-5xl font-bold text-piggy-pink mb-4 animate-pulse">
            🐷 猪猪银行 🐷
          </h1>
          <TodayStats 
            totalStars={totalStars}
            todayProgress={todayProgress}
            currentStreak={currentStreak}
            unlockedCount={unlockedCount}
            totalAchievements={achievements.length}
          />
        </header>

        {/* 临时提示信息 - 替代认证功能 */}
        <div className="bg-blue-100 border border-blue-400 rounded-lg p-4 mb-6 text-center">
          <div className="text-blue-800">
            <strong>🚀 提示：</strong> 
            云端同步功能正在开发中，敬请期待！当前数据存储在本地浏览器中。
          </div>
        </div>

        {/* 主要内容区域 - 三列布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：今日任务 */}
          <div className="lg:col-span-1">
            <TodayTasks
              tasks={todayTasks}
              onCompleteTask={handleCompleteTask}
              onUncompleteTask={handleUncompleteTask}
              onDeleteTask={handleDeleteTask}
            />
          </div>

          {/* 中间：任务管理 */}
          <div className="lg:col-span-1">
            <TaskManager />
          </div>

          {/* 右侧：成就徽章 */}
          <div className="lg:col-span-1">
            <AchievementBadges 
              achievements={achievements}
              unlockedCount={unlockedCount}
            />
          </div>
        </div>

        {/* 下方区域 - 两列布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* 周数据图表 */}
          <WeeklyChart 
            chartData={chartData}
            maxStars={maxStars}
            dailyRecords={dailyRecords}
          />

          {/* 每日报告 */}
          <DailyReport />
        </div>

        {/* 安装提示 */}
        <InstallPrompt />

        {/* 暂时注释掉认证弹窗 */}
        {/*
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            window.location.reload();
          }}
        />
        */}
      </div>
    </div>
  );
};