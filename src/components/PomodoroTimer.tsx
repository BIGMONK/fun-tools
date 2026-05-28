import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';

type Mode = 'focus' | 'short' | 'long';

const MODES: Record<Mode, { label: string; duration: number; color: string }> = {
  focus: { label: '专注', duration: 25 * 60, color: '#ef4444' },
  short: { label: '短休息', duration: 5 * 60, color: '#22c55e' },
  long: { label: '长休息', duration: 15 * 60, color: '#3b82f6' },
};

export default function PomodoroTimer() {
  const [mode, setMode] = useState<Mode>('focus');
  const [remaining, setRemaining] = useState(MODES.focus.duration);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            setRunning(false);
            if (mode === 'focus') setSessions((s) => s + 1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, mode]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setRemaining(MODES[m].duration);
    setRunning(false);
  };

  const reset = () => {
    setRemaining(MODES[mode].duration);
    setRunning(false);
  };

  const total = MODES[mode].duration;
  const progress = (total - remaining) / total;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const color = MODES[mode].color;

  const circumference = 2 * Math.PI * 90;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-6 p-6 max-w-md mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">番茄时钟</h2>
        <p className="text-gray-400">专注工作，规律休息，提升效率</p>
      </div>

      <div className="flex gap-2 bg-gray-800 p-1 rounded-xl border border-gray-700">
        {(Object.entries(MODES) as [Mode, typeof MODES[Mode]][]).map(([key, val]) => (
          <button
            key={key}
            onClick={() => switchMode(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === key ? 'text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
            style={mode === key ? { background: color + '33', color } : {}}
          >
            {key === 'focus' ? <Brain size={14} /> : <Coffee size={14} />}
            {val.label}
          </button>
        ))}
      </div>

      <div className="relative flex items-center justify-center">
        <svg width="220" height="220" viewBox="0 0 220 220">
          <circle cx="110" cy="110" r="90" fill="none" stroke="#1f2937" strokeWidth="12" />
          <circle
            cx="110"
            cy="110"
            r="90"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform="rotate(-90 110 110)"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute text-center">
          <div className="text-5xl font-bold text-white font-mono tracking-tight">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div className="text-sm mt-1" style={{ color }}>
            {MODES[mode].label}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 px-5 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
        >
          <RotateCcw size={18} />
          重置
        </button>
        <button
          onClick={() => setRunning((r) => !r)}
          className="flex items-center gap-2 px-8 py-3 text-white font-bold rounded-xl transition-all shadow-lg"
          style={{ background: color, boxShadow: `0 0 20px ${color}44` }}
        >
          {running ? <Pause size={20} /> : <Play size={20} />}
          {running ? '暂停' : '开始'}
        </button>
      </div>

      <div className="w-full bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-300 font-medium">今日专注</span>
          <span className="text-rose-400 font-bold text-lg">{sessions} 个番茄</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: Math.max(sessions, 4) }, (_, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
              style={{
                background: i < sessions ? '#ef444433' : '#1f2937',
                border: `1px solid ${i < sessions ? '#ef4444' : '#374151'}`,
              }}
            >
              {i < sessions ? '🍅' : '○'}
            </div>
          ))}
        </div>
        {sessions >= 4 && (
          <p className="text-yellow-400 text-sm mt-3">建议进行一次长休息！</p>
        )}
      </div>

      <div className="w-full bg-gray-800/50 rounded-xl p-4 border border-gray-700 text-sm text-gray-400">
        <p className="font-medium text-gray-300 mb-2">番茄工作法</p>
        <ul className="space-y-1">
          <li>• 25分钟专注工作</li>
          <li>• 5分钟短休息</li>
          <li>• 每完成4个番茄，休息15-30分钟</li>
        </ul>
      </div>
    </div>
  );
}
