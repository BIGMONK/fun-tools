import { useState, useEffect } from 'react';

interface DiceResult {
  id: number;
  value: number;
  rolling: boolean;
  rotation: { x: number; y: number; z: number };
}

const getRotationForValue = (value: number) => {
  switch (value) {
    case 1: return { x: 0, y: 0, z: 0 };
    case 2: return { x: 0, y: 180, z: 0 };
    case 3: return { x: 0, y: -90, z: 0 };
    case 4: return { x: 0, y: 90, z: 0 };
    case 5: return { x: -90, y: 0, z: 0 };
    case 6: return { x: 90, y: 0, z: 0 };
    default: return { x: 0, y: 0, z: 0 };
  }
};

const DicePips = ({ value }: { value: number }) => {
  const pips = Array.from({ length: 9 }, (_, i) => i);
  // Define which grid positions (0-8) should have a dot for each value
  const pipMapping: Record<number, number[]> = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };

  return (
    <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-3 gap-1">
      {pips.map((i) => (
        <div key={i} className="flex items-center justify-center">
          {pipMapping[value].includes(i) && (
            <div className={`w-3.5 h-3.5 rounded-full ${value === 1 ? 'bg-red-600 shadow-[0_0_5px_rgba(220,38,38,0.5)]' : 'bg-gray-900'}`} />
          )}
        </div>
      ))}
    </div>
  );
};

export default function DiceRoller() {
  const [diceCount, setDiceCount] = useState(1);
  const [dice, setDice] = useState<DiceResult[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [history, setHistory] = useState<{ values: number[]; sum: number }[]>([]);
  const [displaySum, setDisplaySum] = useState(0);

  useEffect(() => {
    // Sync dice array with diceCount
    setDice(prev => {
      if (prev.length < diceCount) {
        // Add more dice
        const toAdd = diceCount - prev.length;
        const newDice = Array.from({ length: toAdd }, (_, i) => ({
          id: prev.length + i,
          value: 1,
          rolling: false,
          rotation: getRotationForValue(1)
        }));
        return [...prev, ...newDice];
      } else if (prev.length > diceCount) {
        // Remove extra dice
        return prev.slice(0, diceCount);
      }
      return prev;
    });
  }, [diceCount]);

  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);

    const newDice = Array.from({ length: diceCount }, (_, i) => {
      const targetValue = Math.ceil(Math.random() * 6);
      const extraRotations = {
        x: (Math.floor(Math.random() * 4) + 4) * 360,
        y: (Math.floor(Math.random() * 4) + 4) * 360,
        z: (Math.floor(Math.random() * 4) + 4) * 360,
      };
      const resultRotation = getRotationForValue(targetValue);

      return {
        id: i,
        value: targetValue,
        rolling: true,
        rotation: {
          x: resultRotation.x + extraRotations.x,
          y: resultRotation.y + extraRotations.y,
          z: resultRotation.z + extraRotations.z,
        }
      };
    });

    setDice(newDice);

    setTimeout(() => {
      setIsRolling(false);
      const values = newDice.map(d => d.value);
      const sum = values.reduce((a, b) => a + b, 0);
      setDisplaySum(sum);
      setHistory(prev => [{ values, sum }, ...prev.slice(0, 9)]);
    }, 1000);
  };

  // Update displaySum when dice count changes and not rolling
  useEffect(() => {
    if (!isRolling && dice.length > 0) {
      setDisplaySum(dice.reduce((a, b) => a + b.value, 0));
    }
  }, [dice.length]);

  return (
    <div className="flex flex-col items-center gap-10 p-6 max-w-xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">3D 经典骰子</h2>
      </div>

      <div className="flex items-center gap-4 bg-gray-800/50 p-3 rounded-2xl border border-gray-700">
        <span className="text-gray-400 text-sm pl-2">骰子数量</span>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setDiceCount(c => Math.max(1, c - 1))}
            disabled={isRolling}
            className="w-10 h-10 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-xl font-bold transition-all active:scale-95"
          >
            -
          </button>
          <span className="text-white font-bold text-2xl w-6 text-center font-mono">{diceCount}</span>
          <button
            onClick={() => setDiceCount(c => Math.min(4, c + 1))}
            disabled={isRolling}
            className="w-10 h-10 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-xl font-bold transition-all active:scale-95"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-12 justify-center items-center py-10 min-h-[160px]">
        {dice.map((d) => (
          <div key={d.id} className="dice-container">
            <div
              className={`dice ${isRolling ? 'rolling' : ''}`}
              style={{
                transform: `rotateX(${d.rotation.x}deg) rotateY(${d.rotation.y}deg) rotateZ(${d.rotation.z}deg)`
              }}
            >
              <div className="face front"><DicePips value={1} /></div>
              <div className="face back"><DicePips value={2} /></div>
              <div className="face right"><DicePips value={3} /></div>
              <div className="face left"><DicePips value={4} /></div>
              <div className="face top"><DicePips value={5} /></div>
              <div className="face bottom"><DicePips value={6} /></div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="text-center transition-all duration-300"
        style={{
          opacity: !isRolling ? 1 : 0,
          transform: !isRolling ? 'scale(1)' : 'scale(0.9)',
          visibility: !isRolling ? 'visible' : 'hidden'
        }}
      >
        <div className="animate-bounce-subtle">
          <p className="text-gray-500 text-sm uppercase tracking-widest mb-1">{dice.length > 1 ? '总点数' : '点数'}</p>
          <p className="text-6xl font-black text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]">{displaySum}</p>
        </div>
      </div>

      <button
        onClick={rollDice}
        disabled={isRolling}
        className="group relative px-12 py-4 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 disabled:cursor-not-allowed text-gray-900 font-extrabold text-xl rounded-2xl transition-all shadow-[0_0_30px_rgba(234,179,8,0.2)] active:scale-95 overflow-hidden"
      >
        <span className="relative z-10">{isRolling ? '投掷中...' : '投掷'}</span>
        {!isRolling && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
        )}
      </button>

      {history.length > 0 && (
        <div className="w-full bg-gray-800/40 rounded-3xl p-6 border border-gray-700/50 backdrop-blur-sm">
          <h3 className="text-gray-400 font-bold mb-4 text-xs uppercase tracking-widest text-center">最近投掷记录</h3>
          <div className="grid grid-cols-1 gap-3">
            {history.map((h, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl border border-gray-700/30"
                style={{ opacity: 1 - i * 0.05 }}
              >
                <div className="flex gap-2">
                  {h.values.map((v, j) => (
                    <div key={j} className="w-6 h-6 flex items-center justify-center bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-500 font-bold text-xs">
                      {v}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-gray-500 text-xs text-right">
                     {h.values.length > 1 ? '总点数' : '点数'}
                   </span>
                   <span className="text-yellow-500 font-black text-lg">{h.sum}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .dice-container {
          width: 80px;
          height: 80px;
          perspective: 600px;
        }

        .dice {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 1.2s cubic-bezier(0.17, 0.67, 0.1, 1);
        }

        .face {
          position: absolute;
          width: 80px;
          height: 80px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.05), 0 0 5px rgba(0, 0, 0, 0.1);
          backface-visibility: hidden;
        }

        .front  { transform: rotateY(0deg) translateZ(40px); }
        .back   { transform: rotateY(180deg) translateZ(40px); }
        .right  { transform: rotateY(90deg) translateZ(40px); }
        .left   { transform: rotateY(-90deg) translateZ(40px); }
        .top    { transform: rotateX(90deg) translateZ(40px); }
        .bottom { transform: rotateX(-90deg) translateZ(40px); }

        .face { background: radial-gradient(circle at 30% 30%, #ffffff 0%, #f1f5f9 100%); }

        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }

        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
