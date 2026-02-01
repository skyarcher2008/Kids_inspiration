import React, { useState, useEffect, useCallback } from 'react';

interface PiggyBankCelebrationProps {
  visible: boolean;
  starsCount: number;
  onComplete?: () => void;
}

interface Star {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  size: number;
}

export const PiggyBankCelebration: React.FC<PiggyBankCelebrationProps> = ({ 
  visible, 
  starsCount, 
  onComplete 
}) => {
  const [stars, setStars] = useState<Star[]>([]);
  const [piggyVisible, setPiggyVisible] = useState(false);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // 创建金币掉落音效
  const playCoinSound = useCallback(() => {
    try {
      // 创建音频上下文
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // 金币音效：使用振荡器创建简单的音效
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // 设置音频参数
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.type = 'sine';
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('音频播放失败:', error);
    }
  }, []);

  // 生成星星
  const generateStars = useCallback(() => {
    const newStars: Star[] = [];
    for (let i = 0; i < starsCount; i++) {
      newStars.push({
        id: i,
        x: Math.random() * 300 + 100, // 存钱罐周围的x坐标
        y: -50, // 从屏幕上方开始
        delay: i * 200, // 每个星星延迟200ms
        duration: 1000 + Math.random() * 500, // 1-1.5秒的掉落时间
        size: Math.random() * 0.5 + 0.8, // 0.8-1.3倍大小
      });
    }
    setStars(newStars);
  }, [starsCount]);

  // 生成闪光特效
  const generateSparkles = useCallback(() => {
    const newSparkles = [];
    for (let i = 0; i < 12; i++) {
      newSparkles.push({
        id: i,
        x: Math.random() * 400 + 50,
        y: Math.random() * 400 + 50,
      });
    }
    setSparkles(newSparkles);
  }, []);

  useEffect(() => {
    if (visible && !isAnimating) {
      setIsAnimating(true);
      
      // 显示存钱罐
      setPiggyVisible(true);
      
      // 生成星星和闪光
      generateStars();
      generateSparkles();
      
      // 播放第一个金币音效
      setTimeout(() => {
        playCoinSound();
      }, 500);
      
      // 为每个星星播放音效
      for (let i = 1; i < starsCount; i++) {
        setTimeout(() => {
          playCoinSound();
        }, 500 + i * 200);
      }
      
      // 动画结束后清理
      const totalDuration = 2000 + starsCount * 200;
      setTimeout(() => {
        setIsAnimating(false);
        setPiggyVisible(false);
        setStars([]);
        setSparkles([]);
        if (onComplete) {
          onComplete();
        }
      }, totalDuration);
    }
  }, [visible, starsCount, isAnimating, generateStars, generateSparkles, playCoinSound, onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {/* 背景闪光 */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/20 via-orange-200/20 to-yellow-200/20 animate-pulse"></div>
      
      {/* 闪光特效 */}
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute animate-ping"
          style={{
            left: sparkle.x,
            top: sparkle.y,
            animationDelay: `${sparkle.id * 100}ms`,
            animationDuration: '1s',
          }}
        >
          <div className="text-yellow-400 text-2xl">✨</div>
        </div>
      ))}
      
      {/* 猪猪存钱罐 */}
      <div 
        className={`relative transition-all duration-500 ${
          piggyVisible ? 'animate-bounce' : ''
        }`}
        style={{
          transform: piggyVisible ? 'translateY(0)' : 'translateY(-100vh)',
        }}
      >
        {/* 存钱罐主体 */}
        <div className="relative">
          {/* 存钱罐身体 */}
          <div className="w-32 h-24 bg-gradient-to-br from-pink-300 via-pink-400 to-pink-500 rounded-full shadow-2xl relative">
            {/* 存钱罐开口 */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-3 bg-gray-800 rounded-full shadow-inner"></div>
            
            {/* 猪鼻子 */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-6 bg-pink-500 rounded-full">
              <div className="absolute top-1/2 left-1/4 transform -translate-y-1/2 w-1.5 h-1.5 bg-gray-800 rounded-full"></div>
              <div className="absolute top-1/2 right-1/4 transform -translate-y-1/2 w-1.5 h-1.5 bg-gray-800 rounded-full"></div>
            </div>
            
            {/* 猪眼睛 */}
            <div className="absolute top-6 left-6 w-2 h-2 bg-gray-800 rounded-full"></div>
            <div className="absolute top-6 right-6 w-2 h-2 bg-gray-800 rounded-full"></div>
            
            {/* 猪耳朵 */}
            <div className="absolute -top-2 left-4 w-4 h-6 bg-pink-400 rounded-full transform -rotate-12"></div>
            <div className="absolute -top-2 right-4 w-4 h-6 bg-pink-400 rounded-full transform rotate-12"></div>
            
            {/* 猪腿 */}
            <div className="absolute -bottom-2 left-4 w-6 h-6 bg-pink-400 rounded-full"></div>
            <div className="absolute -bottom-2 right-4 w-6 h-6 bg-pink-400 rounded-full"></div>
            
            {/* 猪尾巴 */}
            <div className="absolute top-1/2 -right-2 w-6 h-2 bg-pink-400 rounded-full transform rotate-12"></div>
          </div>
          
          {/* 存钱罐底座 */}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-24 h-3 bg-gray-600 rounded-full shadow-lg"></div>
        </div>
        
        {/* 发光效果 */}
        <div className="absolute inset-0 rounded-full bg-yellow-300/30 animate-pulse scale-110"></div>
        
        {/* 金币闪光环 */}
        <div className="absolute inset-0 rounded-full border-4 border-yellow-400/50 animate-spin scale-125"></div>
      </div>
      
      {/* 掉落的星星 */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute text-yellow-400 pointer-events-none"
          style={{
            left: star.x,
            fontSize: `${star.size * 2}rem`,
            animationName: 'starFall',
            animationDuration: `${star.duration}ms`,
            animationTimingFunction: 'ease-in',
            animationDelay: `${star.delay}ms`,
            animationFillMode: 'forwards',
          }}
        >
          ⭐
        </div>
      ))}
      
      {/* 成功文字 */}
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 text-4xl font-bold text-yellow-600 animate-bounce">
        🎉 任务完成！
      </div>
      
    </div>
  );
};