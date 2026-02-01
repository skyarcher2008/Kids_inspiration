
import React from 'react';
import { Calculator, BookOpen, SpellCheck, ShoppingBag, Trophy } from 'lucide-react';
import { THEMES, ThemeKey } from '../styles/themes';

interface NavBarProps {
    activeTab: 'math' | 'words' | 'grammar' | 'rewards' | 'achievements';
    setActiveTab: (tab: 'math' | 'words' | 'grammar' | 'rewards' | 'achievements') => void;
    themeKey: ThemeKey;
}

const NavBtn = ({ icon, label, active, onClick, activeClass }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, activeClass: string }) => {
    const bgClass = active ? activeClass.replace('text-', 'bg-').replace('600', '100').replace('500', '100') : '';

    return (
        <button 
            onClick={onClick}
            className={`flex flex-col items-center justify-center w-14 transition-all duration-300 group ${active ? '-translate-y-1' : 'text-slate-300 hover:text-slate-400'}`}
        >
            <div className={`p-2.5 rounded-xl transition-all duration-300 ${active ? `${bgClass} shadow-sm rotate-3 scale-110` : 'group-hover:bg-slate-50'}`}>
                {React.cloneElement(icon as React.ReactElement<any>, { 
                    size: 24, 
                    strokeWidth: active ? 3 : 2.5,
                    className: active ? activeClass : "currentColor"
                })}
            </div>
            <span className={`text-[10px] font-bold mt-1 transition-opacity duration-300 ${active ? `opacity-100 ${activeClass}` : 'opacity-0'}`}>{label}</span>
        </button>
    );
}

export const NavBar: React.FC<NavBarProps> = ({ activeTab, setActiveTab, themeKey }) => {
  const theme = THEMES[themeKey];
  
  return (
    <nav className="fixed bottom-6 left-4 right-4 z-30">
        <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-white max-w-2xl mx-auto px-4 h-20 flex justify-around items-center">
                        <NavBtn icon={<Calculator />} label="数学" active={activeTab === 'math'} onClick={() => setActiveTab('math')} activeClass={theme.accent} />
                        <NavBtn icon={<BookOpen />} label="单词" active={activeTab === 'words'} onClick={() => setActiveTab('words')} activeClass={theme.accent} />
                        <NavBtn icon={<SpellCheck />} label="语法" active={activeTab === 'grammar'} onClick={() => setActiveTab('grammar')} activeClass={theme.accent} />
                        <NavBtn icon={<ShoppingBag />} label="兑换" active={activeTab === 'rewards'} onClick={() => setActiveTab('rewards')} activeClass={theme.accent} />
                        <NavBtn icon={<Trophy />} label="成就" active={activeTab === 'achievements'} onClick={() => setActiveTab('achievements')} activeClass={theme.accent} />
        </div>
    </nav>
  );
};
