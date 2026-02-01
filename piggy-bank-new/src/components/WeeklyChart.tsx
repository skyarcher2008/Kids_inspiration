import React, { useState } from 'react';

interface ChartData {
  date: string;
  stars: number;
  completedTasks: number;
  totalTasks: number;
}

interface DailyRecord {
  date: string;
  tasks: { id: string; completed: boolean; }[];
  totalStars: number;
}

interface WeeklyChartProps {
  chartData: ChartData[];
  maxStars: number;
  dailyRecords: DailyRecord[];
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ chartData, maxStars, dailyRecords }) => {
  const [weekIndex, setWeekIndex] = useState(0); // 当前周索引 (0=本周, 1=上周, 2=两周前, 3=三周前)
  
  // 生成按周分组的历史数据（最近4周）
  const generateWeeklyData = () => {
    const weeksData: ChartData[][] = [];
    const today = new Date();
    
    // 生成4周的数据
    for (let week = 0; week < 4; week++) {
      const weekData: ChartData[] = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(today);
        date.setDate(today.getDate() - (week * 7 + (6 - day)));
        const dateStr = date.toISOString().split('T')[0];
        
        // 从dailyRecords中查找对应日期的数据
        const record = dailyRecords.find(r => r.date === dateStr);
        
        if (record) {
          weekData.push({
            date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
            stars: record.totalStars,
            completedTasks: record.tasks.filter(t => t.completed).length,
            totalTasks: record.tasks.length
          });
        } else {
          weekData.push({
            date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
            stars: 0,
            completedTasks: 0,
            totalTasks: 0
          });
        }
      }
      weeksData.push(weekData);
    }
    
    return weeksData;
  };
  
  const weeksData = generateWeeklyData();
  const visibleDaysData = weeksData[weekIndex] || chartData;
  
  // 计算当前显示数据的最大星星数
  const currentMaxStars = Math.max(...visibleDaysData.map(d => d.stars), 10);
  
  // 页面切换功能
  const handlePrevious = () => {
    setWeekIndex((prev) => (prev > 0 ? prev - 1 : weeksData.length - 1));
  };
  
  const handleNext = () => {
    setWeekIndex((prev) => (prev < weeksData.length - 1 ? prev + 1 : 0));
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-piggy-blue">表现趋势</h2>
      </div>
      
      <div className="space-y-6">
        {/* 星星趋势图 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>⭐</span>
            星星获得趋势
          </h3>
          <div className="relative">
            {/* 导航箭头 */}
            {weeksData.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 sm:-translate-x-4 z-10 bg-white rounded-full shadow-lg p-1 sm:p-2 hover:bg-gray-100 transition-colors"
                  aria-label="上一周"
                >
                  <svg className="w-4 h-4 sm:w-6 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2 sm:translate-x-4 z-10 bg-white rounded-full shadow-lg p-1 sm:p-2 hover:bg-gray-100 transition-colors"
                  aria-label="下一周"
                >
                  <svg className="w-4 h-4 sm:w-6 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            
            <div className="flex items-end justify-between gap-2 h-32 bg-gradient-to-t from-yellow-50 to-transparent rounded-lg p-3">
              {visibleDaysData.map((day, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className="bg-gradient-to-t from-yellow-400 to-yellow-300 rounded-t-lg transition-all hover:shadow-lg cursor-pointer w-full"
                    style={{
                      height: `${currentMaxStars > 0 ? (day.stars / currentMaxStars) * 100 : 0}%`,
                      minHeight: day.stars > 0 ? '8px' : '2px'
                    }}
                    title={`${day.date}: ${day.stars} 星星`}
                  />
                  <span className="text-xs text-gray-600 mt-2 font-medium">{day.date}</span>
                  <span className="text-xs text-yellow-600 font-bold">{day.stars}</span>
                </div>
              ))}
            </div>
            
            {/* 分页指示器 */}
            {weeksData.length > 1 && (
              <div className="flex justify-center mt-3 sm:mt-4 gap-1">
                {weeksData.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setWeekIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === weekIndex ? 'bg-piggy-orange' : 'bg-gray-300'
                    }`}
                    aria-label={`显示第${index + 1}周数据`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 任务完成率 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>📊</span>
            任务完成情况
          </h3>
          <div className="space-y-2">
            {visibleDaysData.map((day, index) => {
              const completionRate = day.totalTasks > 0 ? (day.completedTasks / day.totalTasks) * 100 : 0;
              return (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-16">{day.date}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-piggy-blue to-blue-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-700 w-20">
                    {day.completedTasks}/{day.totalTasks}
                  </span>
                  <span className="text-sm font-bold text-piggy-blue w-12">
                    {Math.round(completionRate)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};