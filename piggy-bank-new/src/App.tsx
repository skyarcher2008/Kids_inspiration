import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import CardStackPage from './pages/CardStackPage';
import { DevTools } from './components/DevTools';
import { DialogProvider } from './contexts/DialogContext';

function App() {
  const [useCardStack, setUseCardStack] = useState(
    localStorage.getItem('useCardStack') === 'true'
  );

  useEffect(() => {
    // 注册Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => console.log('SW registered: ', registration))
          .catch(registrationError => console.log('SW registration failed: ', registrationError));
      });
    }
  }, []);

  const toggleLayout = () => {
    const newValue = !useCardStack;
    setUseCardStack(newValue);
    localStorage.setItem('useCardStack', String(newValue));
  };

  return (
    <DialogProvider>
      <Router>
        <Routes>
          <Route path="/" element={useCardStack ? <CardStackPage /> : <HomePage />} />
        </Routes>
        <DevTools />
        {/* 布局切换按钮 */}
        <button
          onClick={toggleLayout}
          className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-pink-500 to-purple-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          title={useCardStack ? '切换到传统布局' : '切换到卡片堆叠布局'}
        >
          {useCardStack ? '📑' : '🎃'}
        </button>
      </Router>
    </DialogProvider>
  );
}

export default App;