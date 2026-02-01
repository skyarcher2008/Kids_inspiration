import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Task } from '../stores/useStore';

// 可滑动任务项组件
interface SwipeableTaskItemProps {
  task: Task;
  onCompleteTask: (taskId: string) => void;
  onUncompleteTask: (taskId: string) => void;
  onDeleteTask: (taskId: string, taskName: string) => void;
  getCategoryIcon: (category: string) => string;
  getCategoryColor: (category: string) => string;
  getCategoryBgColor: (category: string) => string;
  getCategoryBorderColor: (category: string) => string;
  getCategoryHoverColor: (category: string) => string;
}

const SwipeableTaskItem: React.FC<SwipeableTaskItemProps> = ({
  task,
  onCompleteTask,
  onUncompleteTask,
  onDeleteTask,
  getCategoryIcon,
  getCategoryColor,
  getCategoryBgColor,
  getCategoryBorderColor,
  getCategoryHoverColor
}) => {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const itemRef = useRef<HTMLDivElement>(null);

  // 滑动阈值
  const SWIPE_THRESHOLD = 80; // 触发动作的最小滑动距离
  const MAGNETIC_THRESHOLD = 60; // 磁吸效果的阈值
  const MAX_TRANSLATE = 120; // 最大滑动距离

  // 触摸开始
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAnimating) return;
    setIsDragging(true);
    startX.current = e.touches[0].clientX;
    currentX.current = e.touches[0].clientX;
  };

  // 触摸移动
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isAnimating) return;
    
    currentX.current = e.touches[0].clientX;
    const diffX = currentX.current - startX.current;
    
    // 限制滑动范围
    const clampedTranslateX = Math.max(-MAX_TRANSLATE, Math.min(MAX_TRANSLATE, diffX));
    setTranslateX(clampedTranslateX);
  };

  // 动画到指定位置
  const animateToPosition = useCallback((targetX: number, callback?: () => void) => {
    setIsAnimating(true);
    setTranslateX(targetX);
    
    setTimeout(() => {
      setIsAnimating(false);
      callback?.();
    }, 300);
  }, []);

  // 触发完成动作
  const triggerComplete = useCallback(() => {
    // 添加震动反馈（如果支持）
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    animateToPosition(-MAX_TRANSLATE, () => {
      onCompleteTask(task.id);
      setTranslateX(0);
    });
  }, [animateToPosition, onCompleteTask, task.id]);

  // 触发恢复动作
  const triggerRestore = useCallback(() => {
    // 添加震动反馈（如果支持）
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    animateToPosition(MAX_TRANSLATE, () => {
      onUncompleteTask(task.id);
      setTranslateX(0);
    });
  }, [animateToPosition, onUncompleteTask, task.id]);

  // 触摸结束
  const handleTouchEnd = useCallback(() => {
    if (!isDragging || isAnimating) return;
    
    setIsDragging(false);
    const diffX = currentX.current - startX.current;
    
    // 判断滑动方向和距离
    if (Math.abs(diffX) >= SWIPE_THRESHOLD) {
      if (diffX < 0 && !task.completed) {
        // 左滑完成任务
        triggerComplete();
        return;
      } else if (diffX > 0 && task.completed) {
        // 右滑恢复任务
        triggerRestore();
        return;
      }
    }
    
    // 磁吸效果 - 如果滑动距离超过磁吸阈值但不够触发，吸附到边缘
    if (Math.abs(diffX) >= MAGNETIC_THRESHOLD) {
      // 磁吸触觉反馈
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
      
      const targetX = diffX < 0 ? -MAGNETIC_THRESHOLD : MAGNETIC_THRESHOLD;
      animateToPosition(targetX, () => {
        // 磁吸后自动回弹
        setTimeout(() => {
          animateToPosition(0);
        }, 300);
      });
    } else {
      // 回弹到原位
      animateToPosition(0);
    }
  }, [isDragging, isAnimating, task.completed, triggerComplete, triggerRestore, animateToPosition]);

  // 鼠标事件处理（桌面端）
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isAnimating) return;
    setIsDragging(true);
    startX.current = e.clientX;
    currentX.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isAnimating) return;
    
    currentX.current = e.clientX;
    const diffX = currentX.current - startX.current;
    const clampedTranslateX = Math.max(-MAX_TRANSLATE, Math.min(MAX_TRANSLATE, diffX));
    setTranslateX(clampedTranslateX);
  };

  const handleMouseUp = () => {
    if (!isDragging || isAnimating) return;
    handleTouchEnd();
  };

  // 添加全局鼠标事件监听
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || isAnimating) return;
      
      currentX.current = e.clientX;
      const diffX = currentX.current - startX.current;
      const clampedTranslateX = Math.max(-MAX_TRANSLATE, Math.min(MAX_TRANSLATE, diffX));
      setTranslateX(clampedTranslateX);
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleTouchEnd();
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, isAnimating, handleTouchEnd]);

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* 背景提示层 */}
      <div className="absolute inset-0 flex items-center justify-between px-6">
        {/* 左侧完成提示 */}
        <div className={`flex items-center gap-2 text-white transition-all duration-300 ${
          translateX < -MAGNETIC_THRESHOLD ? 'opacity-100 scale-110' : 'opacity-60'
        }`}>
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="font-medium">完成</span>
        </div>
        
        {/* 右侧恢复提示 */}
        <div className={`flex items-center gap-2 text-white transition-all duration-300 ${
          translateX > MAGNETIC_THRESHOLD ? 'opacity-100 scale-110' : 'opacity-60'
        }`}>
          <span className="font-medium">恢复</span>
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        </div>
      </div>

      {/* 渐变背景 */}
      <div className={`absolute inset-0 transition-all duration-300 ${
        translateX < -MAGNETIC_THRESHOLD 
          ? 'bg-gradient-to-r from-green-400 to-green-500' 
          : translateX > MAGNETIC_THRESHOLD 
          ? 'bg-gradient-to-l from-yellow-400 to-yellow-500'
          : 'bg-gray-200'
      }`}></div>

      {/* 任务卡片 */}
      <div
        ref={itemRef}
        className={`relative bg-white p-4 border-2 cursor-grab active:cursor-grabbing transition-all ${
          isAnimating ? 'transition-transform duration-300 ease-out' : ''
        } ${
          task.completed
            ? 'bg-gray-100 opacity-75 border-gray-300'
            : `${getCategoryBgColor(task.category)} ${getCategoryBorderColor(task.category)} ${getCategoryHoverColor(task.category)}`
        }`}
        style={{
          transform: `translateX(${translateX}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* 任务标题层 */}
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-lg ${task.completed ? 'grayscale' : ''}`}>
            {getCategoryIcon(task.category)}
          </span>
          <span className={`font-medium text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'} flex-1 min-w-0`}>
            {task.name}
          </span>
        </div>
        
        {/* 任务详情层 - 包含标签和按钮 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded border ${getCategoryColor(task.category)}`}>
              {task.category === 'study' ? '学习' :
               task.category === 'exercise' ? '运动' :
               task.category === 'behavior' ? '行为' : '创造'}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <span>⭐</span>
              <span>{task.stars}</span>
            </span>
          </div>
          
          {/* 任务操作按钮 - 保留原有按钮作为备用 */}
          <div className="flex gap-1 flex-shrink-0">
            {task.completed ? (
              <>
                <button
                  onClick={() => onUncompleteTask(task.id)}
                  className="p-1.5 text-yellow-600 hover:bg-yellow-100 rounded transition-colors"
                  title="恢复任务"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  onClick={() => onDeleteTask(task.id, task.name)}
                  className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                  title="删除任务"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onCompleteTask(task.id)}
                  className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                  title="完成任务"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  onClick={() => onDeleteTask(task.id, task.name)}
                  className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                  title="删除任务"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* 滑动提示文字 - 只在没有拖拽时显示 */}
        {!isDragging && Math.abs(translateX) <= 10 && (
          <div className="absolute top-2 right-2 pointer-events-none">
            <div className="text-xs text-gray-400 bg-white bg-opacity-80 px-2 py-1 rounded">
              {task.completed ? '← 右滑恢复' : '左滑完成 →'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface TodayTasksProps {
  tasks: Task[];
  onCompleteTask: (taskId: string) => void;
  onUncompleteTask: (taskId: string) => void;
  onDeleteTask: (taskId: string, taskName: string) => void;
}

export const TodayTasks: React.FC<TodayTasksProps> = ({
  tasks,
  onCompleteTask,
  onUncompleteTask,
  onDeleteTask
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // 计算今日累计星星数（只统计已完成的任务）
  const todayTotalStars = tasks
    .filter(task => task.completed)
    .reduce((total, task) => total + task.stars, 0);

  // 处理滚动事件
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const { scrollTop, scrollHeight, clientHeight } = target;
    
    // 计算滚动进度 (0-100)
    const maxScroll = scrollHeight - clientHeight;
    const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
    setScrollProgress(progress);
    
    // 显示滚动状态指示
    setIsScrolling(true);
    
    // 滚动停止后隐藏指示
    clearTimeout((window as any).scrollTimeout);
    (window as any).scrollTimeout = setTimeout(() => {
      setIsScrolling(false);
    }, 1000);
  }, []);
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'study': return '📚';
      case 'exercise': return '🏃';
      case 'behavior': return '😊';
      case 'creativity': return '🎨';
      default: return '📝';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'study': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'exercise': return 'bg-green-100 text-green-800 border-green-200';
      case 'behavior': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'creativity': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryBgColor = (category: string) => {
    switch (category) {
      case 'study': return 'bg-blue-50';
      case 'exercise': return 'bg-green-50';
      case 'behavior': return 'bg-amber-50';
      case 'creativity': return 'bg-purple-50';
      default: return 'bg-gray-50';
    }
  };

  const getCategoryBorderColor = (category: string) => {
    switch (category) {
      case 'study': return 'border-blue-200';
      case 'exercise': return 'border-green-200';
      case 'behavior': return 'border-amber-200';
      case 'creativity': return 'border-purple-200';
      default: return 'border-gray-200';
    }
  };

  const getCategoryHoverColor = (category: string) => {
    switch (category) {
      case 'study': return 'hover:bg-blue-100 hover:border-blue-300';
      case 'exercise': return 'hover:bg-green-100 hover:border-green-300';
      case 'behavior': return 'hover:bg-amber-100 hover:border-amber-300';
      case 'creativity': return 'hover:bg-purple-100 hover:border-purple-300';
      default: return 'hover:bg-gray-100 hover:border-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-piggy-blue">今日任务</h2>
          <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-100 to-orange-100 px-3 py-1 rounded-full border border-yellow-200 transition-all duration-300 hover:shadow-md">
            <span className="text-yellow-600 font-bold text-sm animate-pulse">⭐</span>
            <span className="text-yellow-700 font-bold text-sm">{todayTotalStars}</span>
          </div>
        </div>
        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          📅 {new Date().toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
        </div>
      </div>

      {/* 滚动区域容器 */}
      <div className="relative">
        {/* 顶部渐变遮罩 */}
        {tasks.length > 3 && (
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>
        )}
        
        {/* 滚动内容区域 */}
        <div 
          ref={scrollRef}
          className="space-y-3 max-h-96 overflow-y-auto mobile-scrollbar mobile-scroll-container scroll-smooth"
          onScroll={handleScroll}
        >
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4 animate-float">🌟</div>
              <p className="text-gray-500 text-lg">暂无任务，点击"任务管理"添加新任务！</p>
            </div>
          ) : (
            tasks.map((task) => (
              <SwipeableTaskItem
                key={task.id}
                task={task}
                onCompleteTask={onCompleteTask}
                onUncompleteTask={onUncompleteTask}
                onDeleteTask={onDeleteTask}
                getCategoryIcon={getCategoryIcon}
                getCategoryColor={getCategoryColor}
                getCategoryBgColor={getCategoryBgColor}
                getCategoryBorderColor={getCategoryBorderColor}
                getCategoryHoverColor={getCategoryHoverColor}
              />
            ))
          )}
        </div>
        
        {/* 底部渐变遮罩 */}
        {tasks.length > 3 && (
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>
        )}
        
        {/* 滚动进度指示器 */}
        {tasks.length > 3 && (
          <div className="absolute right-1 top-0 bottom-0 w-1 bg-gray-200 rounded-full z-20">
            <div 
              className={`w-full bg-gradient-to-b from-pink-400 to-pink-600 rounded-full transition-all duration-300 ${
                isScrolling ? 'opacity-100' : 'opacity-60'
              }`}
              style={{ 
                height: `${Math.max(10, scrollProgress)}%`,
                transform: `translateY(${scrollProgress * 0.9}%)`
              }}
            ></div>
          </div>
        )}
        
        {/* 滚动提示（仅在未滚动且有多个任务时显示） */}
        {tasks.length > 3 && !isScrolling && scrollProgress === 0 && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white bg-opacity-80 px-2 py-1 rounded-full z-20 pointer-events-none animate-pulse">
            <div className="flex items-center gap-1">
              <span>⬆⬇</span>
              <span>滑动查看</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};