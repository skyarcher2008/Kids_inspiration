import React, { useState, useEffect, useCallback } from 'react';

interface PiggyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'confirm' | 'achievement';
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  icon?: string;
  autoClose?: number; // 自动关闭时间（毫秒）
}

export const PiggyDialog: React.FC<PiggyDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText = '确定',
  cancelText = '取消',
  showCancel = false,
  icon,
  autoClose
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClose = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsAnimating(true);
      
      // 自动关闭
      if (autoClose && autoClose > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoClose);
        return () => clearTimeout(timer);
      }
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, handleClose]);

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    handleClose();
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          defaultIcon: '✅'
        };
      case 'error':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          defaultIcon: '❌'
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          defaultIcon: '⚠️'
        };
      case 'confirm':
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          defaultIcon: '❓'
        };
      case 'achievement':
        return {
          bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50',
          borderColor: 'border-yellow-300',
          iconBg: 'bg-gradient-to-br from-yellow-100 to-orange-100',
          iconColor: 'text-yellow-600',
          defaultIcon: '🎉'
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
          defaultIcon: 'ℹ️'
        };
    }
  };

  const typeStyles = getTypeStyles();
  const displayIcon = icon || typeStyles.defaultIcon;

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className={`${typeStyles.bgColor} border-2 ${typeStyles.borderColor} rounded-3xl shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* 猪猪头部装饰 */}
        <div className="relative">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-pink-300 rounded-full w-8 h-8 flex items-center justify-center shadow-md">
              <div className="text-white text-sm">🐷</div>
            </div>
          </div>
        </div>
        
        <div className="p-6 pt-8">
          {/* 图标和标题 */}
          <div className="flex items-center justify-center mb-4">
            <div className={`${typeStyles.iconBg} ${typeStyles.iconColor} rounded-full w-16 h-16 flex items-center justify-center text-2xl mb-2 shadow-lg`}>
              {displayIcon}
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 text-center mb-4">
            {title}
          </h3>
          
          {/* 消息内容 */}
          <div className="text-center mb-6">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {message}
            </p>
          </div>
          
          {/* 按钮区域 */}
          <div className="flex gap-3 justify-center">
            {showCancel && (
              <button
                onClick={handleClose}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium min-w-[80px]"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={handleConfirm}
              className={`px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 min-w-[80px] ${
                type === 'success' 
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : type === 'error'
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : type === 'warning'
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  : type === 'achievement'
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white shadow-lg'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
        
        {/* 底部装饰 */}
        <div className="flex justify-center pb-4">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-pink-300 rounded-full opacity-60"></div>
            <div className="w-2 h-2 bg-pink-300 rounded-full opacity-40"></div>
            <div className="w-2 h-2 bg-pink-300 rounded-full opacity-60"></div>
          </div>
        </div>
      </div>
    </div>
  );
};