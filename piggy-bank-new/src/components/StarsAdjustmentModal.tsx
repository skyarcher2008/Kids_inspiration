import React, { useState } from 'react';
import { useStore } from '../stores/useStore';
import { useDialog } from '../contexts/DialogContext';

interface StarsAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StarsAdjustmentModal: React.FC<StarsAdjustmentModalProps> = ({
  isOpen,
  onClose
}) => {
  const { totalStars, adjustTotalStars } = useStore();
  const { showSuccess } = useDialog();
  const [newStars, setNewStars] = useState(totalStars.toString());
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const starsValue = parseInt(newStars);
      
      if (isNaN(starsValue)) {
        setError('请输入有效的数字');
        return;
      }
      
      if (starsValue < 0) {
        setError('星星数不能为负数');
        return;
      }
      
      if (starsValue > 999999) {
        setError('星星数不能超过999999');
        return;
      }
      
      adjustTotalStars(starsValue);
      
      // 显示成功消息
      showSuccess(
        `总星星数已调整为 ${starsValue}\n${starsValue > totalStars ? '🎉 恭喜！可能解锁了新成就，请查看成就徽章！' : '📝 星星数已更新完毕'}`,
        '调整成功',
        3000
      );
      
      handleClose();
      
    } catch (error) {
      setError('调整失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setNewStars(totalStars.toString());
    setError('');
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 只允许输入数字
    if (value === '' || /^\d+$/.test(value)) {
      setNewStars(value);
      setError('');
    }
  };

  const handlePresetAdjust = (amount: number) => {
    const currentValue = parseInt(newStars) || 0;
    const newValue = Math.max(0, currentValue + amount);
    setNewStars(newValue.toString());
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            ⭐ 调整总星星数
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* 当前星星数显示 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <div>
                <p className="text-sm text-gray-600">当前总星星数</p>
                <p className="text-2xl font-bold text-yellow-600">{totalStars}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                新的总星星数
              </label>
              <input
                type="text"
                value={newStars}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-xl font-bold"
                placeholder="输入新的总星星数"
                autoFocus
              />
            </div>

            {/* 快速调整按钮 */}
            <div>
              <p className="text-sm text-gray-600 mb-2">快速调整</p>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handlePresetAdjust(-100)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                >
                  -100
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetAdjust(-10)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                >
                  -10
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetAdjust(10)}
                  className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                >
                  +10
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetAdjust(100)}
                  className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                >
                  +100
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* 变化预览 */}
            {newStars && !isNaN(parseInt(newStars)) && parseInt(newStars) !== totalStars && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-600 text-sm">
                  📈 变化预览: {totalStars} → {parseInt(newStars)} 
                  <span className={`ml-2 ${parseInt(newStars) > totalStars ? 'text-green-600' : 'text-red-600'}`}>
                    ({parseInt(newStars) > totalStars ? '+' : ''}{parseInt(newStars) - totalStars})
                  </span>
                </p>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-yellow-700 text-sm">
                ⚠️ 此操作将直接修改总星星数，请谨慎操作
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isLoading || newStars === totalStars.toString()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '调整中...' : '确认调整'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};