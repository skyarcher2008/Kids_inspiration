import React, { useState } from 'react';
import { useStore } from '../stores/useStore';

// 下拉菜单组件
interface CategoryDropdownProps {
  category: string;
  label: string;
  icon: string;
  templates: any[];
  isOpen: boolean;
  onToggle: () => void;
  onAddFromTemplate: (templateId: string) => void;
  onDeleteTemplate: (templateId: string) => void;
  getCategoryBgColor: (category: string) => string;
  getCategoryBorderColor: (category: string) => string;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  category,
  label,
  icon,
  templates,
  isOpen,
  onToggle,
  onAddFromTemplate,
  onDeleteTemplate,
  getCategoryBgColor,
  getCategoryBorderColor
}) => {
  if (templates.length === 0) return null;

  return (
    <div className={`${getCategoryBgColor(category)} rounded-lg border-2 ${getCategoryBorderColor(category)} overflow-hidden transition-all hover:shadow-md`}>
      {/* 分类标题头 */}
      <button
        onClick={onToggle}
        className={`w-full px-4 py-3 flex items-center justify-between hover:bg-white hover:bg-opacity-30 transition-all ${getCategoryBgColor(category)}`}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="font-medium text-gray-800">{label}</span>
          <span className="text-sm px-2 py-1 bg-white bg-opacity-50 rounded-full">
            {templates.length}
          </span>
        </div>
        <svg 
          className={`w-5 h-5 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 下拉内容 */}
      {isOpen && (
        <div className="px-3 pb-3 space-y-2 bg-white bg-opacity-30 animate-slideDown">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all transform hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-800">{template.name}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                      {template.stars}⭐
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    使用 {template.usageCount} 次
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onAddFromTemplate(template.id)}
                    className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                    title="添加到今日任务"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDeleteTemplate(template.id)}
                    className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                    title="删除模板"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const TaskManager: React.FC = () => {
  const { 
    addCustomTask, 
    getActiveTaskTemplates, 
    getDeletedTaskTemplates, 
    deleteTaskTemplate, 
    restoreTaskTemplate, 
    addTaskFromTemplate 
  } = useStore();
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [taskCategory, setTaskCategory] = useState<'study' | 'exercise' | 'behavior' | 'creativity'>('study');
  const [taskStars, setTaskStars] = useState<number | string>(1);
  const [showDeletedTemplates, setShowDeletedTemplates] = useState(false);
  
  // 下拉菜单状态管理
  const [categoryDropdowns, setCategoryDropdowns] = useState({
    study: false,
    exercise: false,
    behavior: false,
    creativity: false
  });
  
  const activeTemplates = getActiveTaskTemplates();
  const deletedTemplates = getDeletedTaskTemplates();

  const handleAddTask = () => {
    if (taskName.trim()) {
      const starsValue = typeof taskStars === 'string' || taskStars < 1 ? 1 : taskStars;
      addCustomTask(taskName, taskCategory, starsValue);
      setTaskName('');
      setTaskStars(1);
      setShowAddTask(false);
    }
  };

  // 切换分类下拉菜单状态
  const toggleCategoryDropdown = (category: 'study' | 'exercise' | 'behavior' | 'creativity') => {
    setCategoryDropdowns(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const categoryOptions = [
    { value: 'study', label: '学习', icon: '📚', color: 'bg-blue-100 text-blue-800', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    { value: 'exercise', label: '运动', icon: '🏃', color: 'bg-green-100 text-green-800', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    { value: 'behavior', label: '行为', icon: '😊', color: 'bg-amber-100 text-amber-800', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
    { value: 'creativity', label: '创造', icon: '🎨', color: 'bg-purple-100 text-purple-800', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' }
  ];

  const getCategoryLabel = (category: string) => {
    const option = categoryOptions.find(opt => opt.value === category);
    return option ? `${option.icon} ${option.label}` : category;
  };

  const getCategoryBgColor = (category: string) => {
    const option = categoryOptions.find(opt => opt.value === category);
    return option ? option.bgColor : 'bg-gray-50';
  };

  const getCategoryBorderColor = (category: string) => {
    const option = categoryOptions.find(opt => opt.value === category);
    return option ? option.borderColor : 'border-gray-200';
  };

  // 按分类分组模板
  const groupedTemplates = categoryOptions.reduce((acc, category) => {
    acc[category.value] = activeTemplates.filter(template => template.category === category.value);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-piggy-blue">任务管理</h2>
        <button
          onClick={() => setShowAddTask(!showAddTask)}
          className="bg-piggy-pink text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors transform hover:scale-105"
        >
          + 添加任务
        </button>
      </div>

      {showAddTask && (
        <div className="mb-6 p-4 bg-piggy-cream rounded-lg animate-fadeIn">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="任务名称"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-piggy-blue focus:ring-2 focus:ring-piggy-blue focus:ring-opacity-20"
            />
            
            <div className="flex gap-2 flex-wrap">
              {categoryOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setTaskCategory(option.value as any)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all transform hover:scale-105 ${
                    taskCategory === option.value
                      ? option.color
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.icon} {option.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-gray-700 font-medium">星星数：</span>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={taskStars}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    if (inputValue === '') {
                      setTaskStars('' as any);
                    } else {
                      const value = parseInt(inputValue);
                      if (!isNaN(value)) {
                        setTaskStars(value);
                      }
                    }
                  }}
                  onBlur={() => {
                    if (taskStars === '' || Number(taskStars) < 1) {
                      setTaskStars(1);
                    } else if (Number(taskStars) > 99) {
                      setTaskStars(99);
                    }
                  }}
                  className="w-16 px-2 py-1.5 rounded-lg border border-gray-300 text-center font-bold text-piggy-orange focus:outline-none focus:border-piggy-blue focus:ring-2 focus:ring-piggy-blue focus:ring-opacity-20"
                />
              </div>
              <div className="flex gap-1 flex-wrap">
                {[1, 2, 3, 5, 10].map(preset => (
                  <button
                    key={preset}
                    onClick={() => setTaskStars(preset)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all transform hover:scale-105 ${
                      Number(taskStars) === preset
                        ? 'bg-yellow-400 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {preset}⭐
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddTask}
                disabled={!taskName.trim()}
                className="flex-1 bg-piggy-green text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                确认添加
              </button>
              <button
                onClick={() => {
                  setShowAddTask(false);
                  setTaskName('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {!showAddTask && (
        <div className="space-y-4">
          {/* 任务模板分类下拉菜单 */}
          {activeTemplates.length > 0 && (
            <div className="space-y-3">
              {categoryOptions.map((category) => (
                <CategoryDropdown
                  key={category.value}
                  category={category.value}
                  label={category.label}
                  icon={category.icon}
                  templates={groupedTemplates[category.value] || []}
                  isOpen={categoryDropdowns[category.value as keyof typeof categoryDropdowns]}
                  onToggle={() => toggleCategoryDropdown(category.value as any)}
                  onAddFromTemplate={addTaskFromTemplate}
                  onDeleteTemplate={deleteTaskTemplate}
                  getCategoryBgColor={getCategoryBgColor}
                  getCategoryBorderColor={getCategoryBorderColor}
                />
              ))}
            </div>
          )}

          {/* 回收站按钮 */}
          {deletedTemplates.length > 0 && (
            <div className="text-center">
              <button
                onClick={() => setShowDeletedTemplates(!showDeletedTemplates)}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                🗑️ 回收站 ({deletedTemplates.length})
              </button>
            </div>
          )}

          {/* 回收站内容 */}
          {showDeletedTemplates && deletedTemplates.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">已删除的模板</h3>
              <div className="space-y-2">
                {deletedTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-red-50 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-600">{template.name}</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-600">
                          {template.stars}⭐
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {getCategoryLabel(template.category)}
                      </div>
                    </div>
                    <button
                      onClick={() => restoreTaskTemplate(template.id)}
                      className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                    >
                      恢复
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 空状态 */}
          {activeTemplates.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-3 animate-float">📝</div>
              <div className="text-lg font-medium mb-2">暂无任务模板</div>
              <div className="text-sm">点击"添加任务"创建第一个自定义任务模板</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export {};