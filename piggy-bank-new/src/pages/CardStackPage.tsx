import React from 'react';
import { CardStack } from '../components/CardStack';
import { CardWrapper } from '../components/CardWrapper';

const CardStackPage: React.FC = () => {
  const cards = [
    {
      id: 'today-stats',
      title: '🌟 今日成绩',
      component: <CardWrapper componentId="today-stats" />,
      row: 0,
      col: 1
    },
    {
      id: 'today-tasks',
      title: '📅 今日任务',
      component: <CardWrapper componentId="today-tasks" />,
      row: 1,
      col: 1
    },
    {
      id: 'task-manager',
      title: '📦 任务管理',
      component: <CardWrapper componentId="task-manager" />,
      row: 2,
      col: 1
    },
    {
      id: 'achievements',
      title: '🏆 成就徽章',
      component: <CardWrapper componentId="achievements" />,
      row: 1,
      col: 0
    },
    {
      id: 'weekly-chart',
      title: '📊 表现趋势',
      component: <CardWrapper componentId="weekly-chart" />,
      row: 1,
      col: 2
    },
    {
      id: 'daily-report',
      title: '📝 每日总结',
      component: <CardWrapper componentId="daily-report" />,
      row: 0,
      col: 0
    },
    {
      id: 'data-management',
      title: '🗺️ 数据管理',
      component: (
        <div className="p-4">
          <p className="text-gray-600">数据导入导出和管理功能</p>
          <p className="text-sm text-gray-500 mt-2">请从每日总结卡片访问</p>
        </div>
      ),
      row: 2,
      col: 2
    }
  ];

  return <CardStack cards={cards} initialPosition={{ row: 1, col: 1 }} />;
};

export default CardStackPage;