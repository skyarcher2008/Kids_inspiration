import React from 'react';

interface CelebrationAnimationProps {
  visible: boolean;
}

export const CelebrationAnimation: React.FC<CelebrationAnimationProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <div className="text-6xl animate-bounce">🎉</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-4xl animate-ping delay-200">⭐</div>
      </div>
      <div className="absolute top-1/3 left-1/3 text-3xl animate-bounce delay-300">🌟</div>
      <div className="absolute top-1/4 right-1/3 text-3xl animate-bounce delay-500">✨</div>
    </div>
  );
};