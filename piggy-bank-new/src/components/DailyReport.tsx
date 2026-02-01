import React, { useState } from 'react';
import { useStore } from '../stores/useStore';
import { PasswordModal } from './PasswordModal';
import { StarsAdjustmentModal } from './StarsAdjustmentModal';
import { useDialog } from '../contexts/DialogContext';

export const DailyReport: React.FC = () => {
  const { generateDailyReport, exportData, exportDataAsJSON, importData, hasPassword } = useStore();
  const { showSuccess, showError } = useDialog();
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingJSON, setIsExportingJSON] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  // 星星调整相关状态
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showStarsModal, setShowStarsModal] = useState(false);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    // 添加一点延迟效果，让用户感受到在生成报告
    setTimeout(() => {
      const newReport = generateDailyReport();
      setReport(newReport);
      setShowReport(true);
      setIsGenerating(false);
    }, 800);
  };

  const shareReport = () => {
    if (navigator.share) {
      navigator.share({
        title: '猪猪银行 - 今日报告',
        text: report,
      });
    } else {
      // 复制到剪贴板
      navigator.clipboard.writeText(report).then(() => {
        showSuccess('报告已复制到剪贴板！', '复制成功');
      });
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    
    try {
      const dataCsv = exportData();
      const blob = new Blob(['\ufeff' + dataCsv], { type: 'text/csv;charset=utf-8' }); // 添加BOM以支持中文
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `猪猪银行数据报表_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showSuccess('数据导出成功！可以用 Excel 或其他表格软件打开查看。', '导出成功');
    } catch (error) {
      console.error('导出失败:', error);
      showError('导出失败，请重试', '导出失败');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = async () => {
    setIsExportingJSON(true);
    
    try {
      const dataJson = exportDataAsJSON();
      const blob = new Blob([dataJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `猪猪银行数据备份_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showSuccess('备份文件导出成功！可用于数据恢复。', '备份成功');
    } catch (error) {
      console.error('导出失败:', error);
      showError('导出失败，请重试', '导出失败');
    } finally {
      setIsExportingJSON(false);
    }
  };

  const handleImportData = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      setIsImporting(true);
      
      try {
        const text = await file.text();
        const success = await importData(text);
        
        if (success) {
          showSuccess('数据导入成功！页面即将刷新。', '导入成功');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          showError('数据导入失败，请检查文件格式是否正确。\n提示：导入功能需要 JSON 格式的备份文件。', '导入失败');
        }
      } catch (error) {
        console.error('导入失败:', error);
        showError('导入失败，请检查文件格式是否正确。\n提示：导入功能需要 JSON 格式的备份文件。', '导入失败');
      } finally {
        setIsImporting(false);
      }
    };
    input.click();
  };

  // 处理星星调整
  const handleStarsAdjustment = () => {
    setShowPasswordModal(true);
  };

  const handlePasswordSuccess = () => {
    setShowPasswordModal(false);
    setShowStarsModal(true);
  };

  const handlePasswordClose = () => {
    setShowPasswordModal(false);
  };

  const handleStarsModalClose = () => {
    setShowStarsModal(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-piggy-blue">每日总结</h2>
        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          📅 {new Date().toLocaleDateString('zh-CN')}
        </div>
      </div>

      <button
        onClick={handleGenerateReport}
        disabled={isGenerating}
        className={`w-full bg-gradient-to-r from-piggy-blue to-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 ${
          isGenerating ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-lg'
        }`}
      >
        {isGenerating ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            正在生成报告...
          </div>
        ) : (
          '📊 生成今日报告'
        )}
      </button>
      
      {showReport && (
        <div className="mt-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-medium leading-relaxed">
              {report}
            </pre>
          </div>
          
          <div className="flex gap-2 mt-3">
            <button
              onClick={shareReport}
              className="flex-1 bg-piggy-green text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm transform hover:scale-105"
            >
              📤 分享报告
            </button>
            <button
              onClick={() => setShowReport(false)}
              className="px-4 py-2 text-piggy-blue hover:bg-blue-50 rounded-lg transition-colors text-sm"
            >
              ✕ 关闭
            </button>
          </div>
        </div>
      )}

      {!showReport && (
        <div className="mt-4 text-center text-gray-400 text-sm">
          <div className="mb-2 text-2xl">📈</div>
          <div>生成报告查看今日表现详情</div>
        </div>
      )}

      {/* 数据导出导入区域 */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="text-2xl font-bold text-piggy-blue mb-3">数据管理</h3>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className={`flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                isExporting ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-lg'
              }`}
            >
              {isExporting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  导出中...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>📊</span>
                  导出报表(CSV)
                </div>
              )}
            </button>
            
            <button
              onClick={handleExportJSON}
              disabled={isExportingJSON}
              className={`flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                isExportingJSON ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-lg'
              }`}
            >
              {isExportingJSON ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  导出中...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>💾</span>
                  数据备份(JSON)
                </div>
              )}
            </button>
          </div>
          
          <button
            onClick={handleImportData}
            disabled={isImporting}
            className={`w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
              isImporting ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-lg'
            }`}
          >
            {isImporting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                导入中...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>📥</span>
                恢复数据
              </div>
            )}
          </button>
          
          {/* 星星调整按钮 */}
          <button
            onClick={handleStarsAdjustment}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 hover:shadow-lg"
          >
            <div className="flex items-center justify-center gap-2">
              <span>⭐</span>
              调整总星星数
            </div>
          </button>
        </div>
        
        <div className="mt-3 text-xs text-gray-500 text-center">
          <div className="mb-1">📊 导出报表：生成CSV格式，可用Excel打开查看</div>
          <div className="mb-1">💾 数据备份：生成JSON格式，用于完整数据备份</div>
          <div className="mb-1">📥 恢复数据：从JSON备份文件恢复数据（会覆盖当前数据）</div>
          <div>⭐ 调整总星星数：需要管理员密码验证（用于修正数据误差）</div>
        </div>
      </div>
      
      {/* 弹窗组件 */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={handlePasswordClose}
        onSuccess={handlePasswordSuccess}
        isFirstTime={!hasPassword()}
      />
      
      <StarsAdjustmentModal
        isOpen={showStarsModal}
        onClose={handleStarsModalClose}
      />
    </div>
  );
};

export {};