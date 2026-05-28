import { useState ,useEffect } from 'react';
import { TabId } from './types';
import Navigation from './components/Navigation';
import ChristmasTree from './components/ChristmasTree';
import SpinWheel from './components/SpinWheel';
import Tetris from './components/Tetris';
import TodoList from './components/TodoList';
import PomodoroTimer from './components/PomodoroTimer';
import DiceRoller from './components/DiceRoller';
import TarotDivination from './components/TarotDivination';

const tabComponents: Record<TabId, React.ReactNode> = {
  tree: <ChristmasTree />,
  wheel: <SpinWheel />,
  tetris: <Tetris />,
  todo: <TodoList />,
  pomodoro: <PomodoroTimer />,
  dice: <DiceRoller />,
  tarot: <TarotDivination />,
};

export default function App() {
  // 从 localStorage 初始化状态
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const saved = localStorage.getItem('app_active_tab') as TabId;
    // 检查保存的值是否有效
    return (saved && tabComponents[saved]) ? saved : 'tree';
  });
  // 当 activeTab 改变时保存到本地存储
  useEffect(() => {
    localStorage.setItem('app_active_tab', activeTab);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navigation active={activeTab} onChange={setActiveTab} />
      <main className="max-w-4xl mx-auto py-8 px-4">
        <div key={activeTab} className="page-enter">
          {tabComponents[activeTab]}
        </div>
      </main>
      <style>{`
        @keyframes pageEnter {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .page-enter {
          animation: pageEnter 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
