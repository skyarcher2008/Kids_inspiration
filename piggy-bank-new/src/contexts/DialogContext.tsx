import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { PiggyDialog } from '../components/PiggyDialog';

interface DialogOptions {
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'confirm' | 'achievement';
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  icon?: string;
  autoClose?: number;
}

interface DialogState extends DialogOptions {
  isOpen: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface DialogContextType {
  showDialog: (options: DialogOptions & { onConfirm?: () => void; onCancel?: () => void }) => void;
  showAlert: (message: string, title?: string, type?: DialogOptions['type']) => void;
  showConfirm: (message: string, title?: string, onConfirm?: () => void, onCancel?: () => void) => void;
  showSuccess: (message: string, title?: string, autoClose?: number) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showAchievement: (message: string, title?: string, icon?: string) => void;
  hideDialog: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showDialog = useCallback((options: DialogOptions & { onConfirm?: () => void; onCancel?: () => void }) => {
    setDialogState({
      ...options,
      isOpen: true
    });
  }, []);

  const hideDialog = () => {
    setDialogState(prev => ({ ...prev, isOpen: false }));
  };

  const showAlert = (message: string, title: string = '提示', type: DialogOptions['type'] = 'info') => {
    showDialog({
      title,
      message,
      type,
      showCancel: false,
      confirmText: '确定'
    });
  };

  const showConfirm = (
    message: string, 
    title: string = '确认', 
    onConfirm?: () => void, 
    onCancel?: () => void
  ) => {
    showDialog({
      title,
      message,
      type: 'confirm',
      showCancel: true,
      confirmText: '确定',
      cancelText: '取消',
      onConfirm,
      onCancel
    });
  };

  const showSuccess = (message: string, title: string = '成功', autoClose: number = 3000) => {
    showDialog({
      title,
      message,
      type: 'success',
      showCancel: false,
      confirmText: '确定',
      autoClose
    });
  };

  const showError = (message: string, title: string = '错误') => {
    showDialog({
      title,
      message,
      type: 'error',
      showCancel: false,
      confirmText: '确定'
    });
  };

  const showWarning = (message: string, title: string = '警告') => {
    showDialog({
      title,
      message,
      type: 'warning',
      showCancel: false,
      confirmText: '确定'
    });
  };

  const showAchievement = useCallback((message: string, title: string = '成就解锁', icon?: string) => {
    showDialog({
      title,
      message,
      type: 'achievement',
      showCancel: false,
      confirmText: '太棒了！',
      icon: icon || '🎉',
      autoClose: 5000
    });
  }, [showDialog]);

  // 监听成就解锁事件
  React.useEffect(() => {
    const handleAchievementDialog = (event: CustomEvent) => {
      const { title, message, icon } = event.detail;
      showAchievement(message, title, icon);
    };

    window.addEventListener('showAchievementDialog', handleAchievementDialog as EventListener);
    return () => {
      window.removeEventListener('showAchievementDialog', handleAchievementDialog as EventListener);
    };
  }, [showAchievement]);

  const handleConfirm = () => {
    if (dialogState.onConfirm) {
      dialogState.onConfirm();
    }
    hideDialog();
  };

  const handleCancel = () => {
    if (dialogState.onCancel) {
      dialogState.onCancel();
    }
    hideDialog();
  };

  return (
    <DialogContext.Provider value={{
      showDialog,
      showAlert,
      showConfirm,
      showSuccess,
      showError,
      showWarning,
      showAchievement,
      hideDialog
    }}>
      {children}
      <PiggyDialog
        isOpen={dialogState.isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={dialogState.title}
        message={dialogState.message}
        type={dialogState.type}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        showCancel={dialogState.showCancel}
        icon={dialogState.icon}
        autoClose={dialogState.autoClose}
      />
    </DialogContext.Provider>
  );
};