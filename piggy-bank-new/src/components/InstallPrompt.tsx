import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 检查是否已经安装为PWA
    const checkIfInstalled = () => {
      // 检查是否在standalone模式下运行
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return;
      }
      
      // 检查是否在移动设备的浏览器中添加到主屏幕
      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true);
        return;
      }
    };

    checkIfInstalled();

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // 延迟显示安装提示，让用户先体验应用
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallPrompt(true);
        }
      }, 10000); // 10秒后显示
    };

    window.addEventListener('beforeinstallprompt', handler);

    // 监听应用安装事件
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', () => {});
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('用户接受了安装');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const dismissPrompt = () => {
    setShowInstallPrompt(false);
    // 24小时后再次显示
    setTimeout(() => {
      if (!isInstalled && deferredPrompt) {
        setShowInstallPrompt(true);
      }
    }, 24 * 60 * 60 * 1000);
  };

  if (!showInstallPrompt || isInstalled) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-xl p-4 border-2 border-piggy-pink z-50 animate-slideUp">
      <div className="flex items-center gap-3 mb-3">
        <div className="text-4xl animate-bounce">🐷</div>
        <div className="flex-1">
          <h3 className="font-bold text-piggy-pink text-lg">安装猪猪银行</h3>
          <p className="text-sm text-gray-600">添加到主屏幕，随时记录成长！</p>
        </div>
        <button
          onClick={dismissPrompt}
          className="text-gray-400 hover:text-gray-600 text-lg transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">✨</span>
          离线使用，随时随地记录任务
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">🚀</span>
          快速启动，像原生应用一样流畅
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">📱</span>
          占用空间小，不影响手机性能
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleInstallClick}
          className="flex-1 bg-gradient-to-r from-piggy-pink to-pink-500 text-white px-4 py-3 rounded-lg hover:from-pink-600 hover:to-pink-600 transition-all transform hover:scale-105 font-medium"
        >
          🏠 立即安装
        </button>
        <button
          onClick={dismissPrompt}
          className="px-4 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
        >
          稍后
        </button>
      </div>

      {/* 安装步骤提示 */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        安装后可在桌面找到猪猪银行图标
      </div>
    </div>
  );
};

export {};