import React from 'react';
import { useStore } from '../stores/useStore';
import { TodayStats } from './TodayStats';
import { TodayTasks } from './TodayTasks';
import { TaskManager } from './TaskManager';
import { AchievementBadges } from './AchievementBadges';
import { WeeklyChart } from './WeeklyChart';
import { DailyReport } from './DailyReport';

interface CardWrapperProps {
  componentId: string;
}

export const CardWrapper: React.FC<CardWrapperProps> = ({ componentId }) => {
  const { 
    achievements, 
    totalStars,
    completeTask,
    uncompleteTask,
    deleteTask,
    dailyRecords,
    getTodayTasks,
    getTodayProgress,
    currentStreak
  } = useStore();
  
  const todayTasks = getTodayTasks();

  // 计算属性
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const todayProgress = getTodayProgress();


  // 获取周数据
  const getWeeklyData = () => {
    const data = [];
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekOffset = 0; // 当前周
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - date.getDay() - (weekOffset * 7) + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = days[date.getDay()];
      
      const record = dailyRecords.find(r => r.date === dateStr);
      const completedTasks = record ? record.tasks.filter(t => t.completed).length : 0;
      const totalTasks = record ? record.tasks.length : 0;
      const stars = record ? record.totalStars : 0;
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      
      data.push({ 
        day: dayName, 
        stars,
        isToday,
        date: dateStr,
        completedTasks,
        totalTasks
      });
    }
    
    return data;
  };

  const chartData = getWeeklyData();
  const maxStars = Math.max(...chartData.map(d => d.stars), 10);

  switch (componentId) {
    case 'today-stats':
      return (
        <TodayStats
          totalStars={totalStars}
          todayProgress={todayProgress}
          currentStreak={currentStreak}
          unlockedCount={unlockedCount}
          totalAchievements={achievements.length}
        />
      );
    
    case 'today-tasks':
      return (
        <TodayTasks
          tasks={todayTasks}
          onCompleteTask={completeTask}
          onUncompleteTask={uncompleteTask}
          onDeleteTask={deleteTask}
        />
      );
    
    case 'task-manager':
      return <TaskManager />;
    
    case 'achievements':
      return (
        <AchievementBadges
          achievements={achievements}
          unlockedCount={unlockedCount}
        />
      );
    
    case 'weekly-chart':
      return (
        <WeeklyChart
          chartData={chartData}
          maxStars={maxStars}
          dailyRecords={dailyRecords}
        />
      );
    
    case 'daily-report':
      return <DailyReport />;
    
    default:
      return <div>组件未找到</div>;
  }
};