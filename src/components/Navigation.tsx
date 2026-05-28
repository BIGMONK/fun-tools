import { TabId, TabItem } from '../types';
import { TreePine, RotateCcw, Gamepad2, CheckSquare, Timer, Dice5, Sparkles } from 'lucide-react';

const tabs: TabItem[] = [
  { id: 'tree', label: '3D圣诞树', icon: 'tree', color: 'text-green-400' },
  { id: 'wheel', label: '吃什么转盘', icon: 'wheel', color: 'text-orange-400' },
  { id: 'tetris', label: '俄罗斯方块', icon: 'tetris', color: 'text-cyan-400' },
  { id: 'todo', label: '待办事项', icon: 'todo', color: 'text-emerald-400' },
  { id: 'pomodoro', label: '番茄时钟', icon: 'pomodoro', color: 'text-rose-400' },
  { id: 'dice', label: '骰子', icon: 'dice', color: 'text-yellow-400' },
  { id: 'tarot', label: '塔罗占卜', icon: 'tarot', color: 'text-purple-400' },
];

const iconMap: Record<string, React.ReactNode> = {
  tree: <TreePine size={20} />,
  wheel: <RotateCcw size={20} />,
  tetris: <Gamepad2 size={20} />,
  todo: <CheckSquare size={20} />,
  pomodoro: <Timer size={20} />,
  dice: <Dice5 size={20} />,
  tarot: <Sparkles size={20} />,
};

interface NavigationProps {
  active: TabId;
  onChange: (id: TabId) => void;
}

export default function Navigation({ active, onChange }: NavigationProps) {
  return (
    <nav className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
          <div className="flex items-center gap-2 mr-4 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FT</span>
            </div>
            <span className="text-white font-bold text-lg hidden sm:block">FunTools</span>
          </div>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-shrink-0 ${
                active === tab.id
                  ? `bg-gray-700 ${tab.color}`
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              <span className={active === tab.id ? tab.color : 'text-gray-500'}>
                {iconMap[tab.icon]}
              </span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
