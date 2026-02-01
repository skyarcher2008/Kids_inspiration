import React, { useState, useRef, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { useSwipeable } from 'react-swipeable';
import './CardStack.css';
import '../styles/card-responsive.css';

interface Card {
  id: string;
  component: ReactNode;
  title: string;
  row: number;
  col: number;
}

interface CardStackProps {
  cards: Card[];
  initialPosition?: { row: number; col: number };
}

export const CardStack: React.FC<CardStackProps> = ({ 
  cards, 
  initialPosition = { row: 1, col: 1 } 
}) => {
  const [currentPosition, setCurrentPosition] = useState(initialPosition);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 创建3x3网格的卡片映射
  const cardGrid = useMemo(() => {
    const grid = new Map<string, Card>();
    cards.forEach(card => {
      grid.set(`${card.row}-${card.col}`, card);
    });
    return grid;
  }, [cards]);

  const getCurrentCard = () => {
    return cardGrid.get(`${currentPosition.row}-${currentPosition.col}`);
  };

  const moveCard = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    console.log(`moveCard called: ${direction}, currentPosition:`, currentPosition, 'isAnimating:', isAnimating);
    
    if (isAnimating) {
      console.log('Animation in progress, skipping move');
      return;
    }

    const newPosition = { ...currentPosition };
    switch (direction) {
      case 'up':
        newPosition.row = Math.max(0, currentPosition.row - 1);
        break;
      case 'down':
        newPosition.row = Math.min(2, currentPosition.row + 1);
        break;
      case 'left':
        newPosition.col = Math.max(0, currentPosition.col - 1);
        break;
      case 'right':
        newPosition.col = Math.min(2, currentPosition.col + 1);
        break;
    }

    console.log('newPosition:', newPosition);
    
    // 检查目标位置是否有卡片
    const hasCard = cardGrid.has(`${newPosition.row}-${newPosition.col}`);
    console.log(`Card exists at ${newPosition.row}-${newPosition.col}:`, hasCard);
    
    if (hasCard) {
      console.log('Moving to new position');
      setIsAnimating(true);
      setCurrentPosition(newPosition);
      setTimeout(() => setIsAnimating(false), 300);
      
      // 触觉反馈（如果支持）
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    } else {
      console.log('No card at target position');
    }
  }, [currentPosition, isAnimating, cardGrid]);

  const handlers = useSwipeable({
    onSwipedUp: () => {
      console.log('Swiped Up');
      moveCard('up');
    },
    onSwipedDown: () => {
      console.log('Swiped Down');
      moveCard('down');
    },
    onSwipedLeft: () => {
      console.log('Swiped Left');
      moveCard('left');
    },
    onSwipedRight: () => {
      console.log('Swiped Right');
      moveCard('right');
    },
    preventScrollOnSwipe: true,
    trackMouse: true,
    trackTouch: true,
    delta: 20,
    swipeDuration: 1000,
    touchEventOptions: { passive: false },
    onTouchStartOrOnMouseDown: ({ event }) => {
      console.log('Touch/Mouse started:', event.type);
    },
    onTouchEndOrOnMouseUp: ({ event }) => {
      console.log('Touch/Mouse ended:', event.type);
    }
  });

  // 键盘控制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          moveCard('up');
          break;
        case 'ArrowDown':
          moveCard('down');
          break;
        case 'ArrowLeft':
          moveCard('left');
          break;
        case 'ArrowRight':
          moveCard('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPosition, isAnimating]);

  const currentCard = getCurrentCard();

  return (
    <div 
      {...handlers}
      ref={containerRef}
      className="card-mode fixed inset-0 bg-gradient-to-br from-pink-50 to-purple-50 overflow-hidden touch-none animated-gradient"
      style={{ touchAction: 'none' }}
    >
      {/* 卡片堆叠容器 */}
      <div className="relative w-full h-full perspective-1000">
        {cards.map((card) => {
          const isActive = card.row === currentPosition.row && card.col === currentPosition.col;
          const offsetX = (card.col - currentPosition.col) * 100;
          const offsetY = (card.row - currentPosition.row) * 100;
          
          return (
            <div
              key={card.id}
              className={`
                absolute inset-2 sm:inset-4 md:inset-8
                transition-all duration-300 ease-out
                ${isActive ? 'z-20' : 'z-10'}
                ${isAnimating ? '' : 'will-change-transform'}
              `}
              style={{
                transform: `
                  translateX(${offsetX}%)
                  translateY(${offsetY}%)
                  translateZ(${isActive ? 0 : -200}px)
                  scale(${isActive ? 1 : 0.75})
                  rotateY(${offsetX * 0.15}deg)
                  rotateX(${-offsetY * 0.15}deg)
                `,
                opacity: isActive ? 1 : 0.4,
                pointerEvents: isActive ? 'auto' : 'none',
                filter: isActive ? 'none' : 'blur(2px)',
              }}
            >
              <div className="w-full h-full bg-white/95 backdrop-blur-sm rounded-2xl card-shadow overflow-hidden border border-white/50">
                {/* 卡片标题栏 */}
                <div className="bg-gradient-to-r from-pink-400 to-purple-400 text-white p-3 sm:p-4">
                  <h2 className="text-lg sm:text-xl font-bold truncate">{card.title}</h2>
                </div>
                {/* 卡片内容 */}
                <div className="card-content p-2 sm:p-4 h-[calc(100%-56px)] sm:h-[calc(100%-64px)] overflow-y-auto overscroll-contain">
                  {card.component}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 导航指示器 */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2 shadow-lg border border-white/50">
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex space-x-1">
              {[0, 1, 2].map((col) => {
                const hasCard = cardGrid.has(`${row}-${col}`);
                const isActive = row === currentPosition.row && col === currentPosition.col;
                return (
                  <div
                    key={`${row}-${col}`}
                    className={`
                      w-2 h-2 rounded-full transition-all
                      ${!hasCard ? 'bg-gray-200' : isActive ? 'bg-pink-500' : 'bg-gray-400'}
                    `}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 滑动提示 */}
      {currentCard && (
        <div className="absolute top-4 sm:top-8 left-1/2 transform -translate-x-1/2 z-30 animate-fade-in">
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 shadow-lg border border-white/50">
            <p className="text-xs sm:text-sm text-gray-600 flex items-center">
              <span className="mr-1">👆</span> 上下左右滑动切换
            </p>
          </div>
        </div>
      )}
      
      {/* 调试按钮 */}
      <div className="absolute top-20 left-4 z-30 grid grid-cols-3 gap-2">
        <div></div>
        <button 
          onClick={() => moveCard('up')}
          className="bg-blue-500 text-white w-8 h-8 rounded text-xs"
        >↑</button>
        <div></div>
        <button 
          onClick={() => moveCard('left')}
          className="bg-blue-500 text-white w-8 h-8 rounded text-xs"
        >←</button>
        <div className="bg-gray-300 w-8 h-8 rounded flex items-center justify-center text-xs">
          {currentPosition.row},{currentPosition.col}
        </div>
        <button 
          onClick={() => moveCard('right')}
          className="bg-blue-500 text-white w-8 h-8 rounded text-xs"
        >→</button>
        <div></div>
        <button 
          onClick={() => moveCard('down')}
          className="bg-blue-500 text-white w-8 h-8 rounded text-xs"
        >↓</button>
        <div></div>
      </div>
    </div>
  );
};