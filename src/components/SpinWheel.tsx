import { useRef, useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, RotateCcw } from 'lucide-react';

const DEFAULT_FOODS = ['火锅', '炸鸡', '寿司', '麻辣烫', '汉堡', '披萨', '拉面', '烤肉'];
const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#a855f7', '#ec4899',
  '#14b8a6', '#f43f5e', '#84cc16', '#fb923c',
];

interface WheelItem {
  id: string;
  name: string;
}

export default function SpinWheel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [items, setItems] = useState<WheelItem[]>(() =>
    DEFAULT_FOODS.map((name) => ({ id: Math.random().toString(36).slice(2), name }))
  );
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [newFood, setNewFood] = useState('');
  const angleRef = useRef(0);
  const velocityRef = useRef(0);
  const animFrameRef = useRef<number>(0);

  const drawWheel = useCallback((angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 12;
    const sliceAngle = (2 * Math.PI) / items.length;

    ctx.clearRect(0, 0, size, size);

    items.forEach((item, i) => {
      const startAngle = angle + i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(11, 16 - items.length)}px sans-serif`;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.fillText(item.name, r - 12, 5);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#1f2937';
    ctx.fill();
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#f9fafb';
    ctx.fill();
  }, [items]);

  useEffect(() => {
    drawWheel(angleRef.current);
  }, [items, drawWheel]);

  const spin = () => {
    if (spinning || items.length < 2) return;
    setResult(null);
    setSpinning(true);
    velocityRef.current = 0.2 + Math.random() * 0.2;

    const animate = () => {
      angleRef.current += velocityRef.current;
      velocityRef.current *= 0.988;
      drawWheel(angleRef.current);

      if (velocityRef.current > 0.003) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        const normalized = ((2 * Math.PI - (angleRef.current % (2 * Math.PI))) + Math.PI / 2) % (2 * Math.PI);
        const sliceAngle = (2 * Math.PI) / items.length;
        const idx = Math.floor(normalized / sliceAngle) % items.length;
        setResult(items[idx].name);
      }
    };
    animFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  const addFood = () => {
    if (!newFood.trim()) return;
    setItems((prev) => [...prev, { id: Math.random().toString(36).slice(2), name: newFood.trim() }]);
    setNewFood('');
    setResult(null);
  };

  const removeFood = (id: string) => {
    if (items.length <= 2) return;
    setItems((prev) => prev.filter((f) => f.id !== id));
    setResult(null);
  };

  const canvasSize = Math.min(360, typeof window !== 'undefined' ? window.innerWidth - 80 : 360);

  return (
    <div className="flex flex-col items-center gap-6 p-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">今天吃什么</h2>
        <p className="text-gray-400">选择困难症终结者，让命运决定吧</p>
      </div>

      <div className="relative">
        <div
          className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-2 z-10"
          style={{ right: -2 }}
        >
          <div
            className="w-0 h-0 border-t-transparent border-b-transparent border-r-0"
            style={{
              borderTop: '14px solid transparent',
              borderBottom: '14px solid transparent',
              borderRight: '28px solid #f97316',
              filter: 'drop-shadow(-2px 0 4px rgba(0,0,0,0.4))',
            }}
          />
        </div>
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          className="rounded-full shadow-2xl cursor-pointer"
          onClick={spin}
          style={{ background: 'transparent' }}
        />
      </div>

      <button
        onClick={spin}
        disabled={spinning || items.length < 2}
        className="flex items-center gap-2 px-8 py-3 bg-orange-500 hover:bg-orange-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-all duration-200 shadow-lg"
      >
        <RotateCcw size={20} className={spinning ? 'animate-spin' : ''} />
        {spinning ? '旋转中...' : '旋！'}
      </button>

      {result && !spinning && (
        <div className="bg-orange-500/20 border border-orange-500/50 rounded-xl px-8 py-4 text-center animate-bounce-in">
          <p className="text-gray-300 text-sm mb-1">今天就吃</p>
          <p className="text-3xl font-bold text-orange-400">{result}</p>
          <p className="text-gray-400 text-sm mt-1">命运已定，不许反悔！</p>
        </div>
      )}

      <div className="w-full bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <h3 className="text-white font-semibold mb-3">自定义选项</h3>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newFood}
            onChange={(e) => setNewFood(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addFood()}
            placeholder="添加食物..."
            className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:border-orange-500 focus:outline-none"
          />
          <button
            onClick={addFood}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-lg text-sm transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <div
              key={item.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-white"
              style={{ background: COLORS[i % COLORS.length] + '33', border: `1px solid ${COLORS[i % COLORS.length]}66` }}
            >
              <span style={{ color: COLORS[i % COLORS.length] }}>●</span>
              {item.name}
              {items.length > 2 && (
                <button
                  onClick={() => removeFood(item.id)}
                  className="ml-1 hover:text-red-400 transition-colors text-gray-400"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes bounce-in {
          0% { transform: scale(0.8); opacity: 0; }
          70% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
