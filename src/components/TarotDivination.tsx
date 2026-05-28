import React, { useState } from 'react';
import { Sparkles, RefreshCcw } from 'lucide-react';

interface TarotCard {
  name: string;
  image: string;
  meaning: string;
  keyword: string;
}

const TAROT_DECK: TarotCard[] = [
  { name: '愚者', keyword: '开端', meaning: '代表新的开始、冒险、自由和纯真。建议你大胆尝试，放下恐惧。', image: '🃏' },
  { name: '魔术师', keyword: '创造', meaning: '代表潜能、力量、行动和沟通。你拥有实现目标所需的所有工具。', image: '🪄' },
  { name: '女祭司', keyword: '直觉', meaning: '代表潜意识、秘密、宁静和洞察力。相信你的直觉，聆听内心的声音。', image: '🌙' },
  { name: '皇后', keyword: '丰盛', meaning: '代表母性、自然、富足和感官享受。现在是孕育新计划或享受生活的好时机。', image: '👑' },
  { name: '皇帝', keyword: '权威', meaning: '代表秩序、稳定、领导力和结构。你需要自律和明确的规划来实现目标。', image: '🏛️' },
  { name: '教皇', keyword: '传统', meaning: '代表精神指导、传统、价值观和信仰。寻求智慧，遵循既定的道路。', image: '⛪' },
  { name: '恋人', keyword: '选择', meaning: '代表爱情、和谐、价值观和人际关系。面临选择时，请遵循你的心意。', image: '❤️' },
  { name: '战车', keyword: '意志', meaning: '代表决心、胜利、自我控制和奋斗。坚持不懈，你将克服障碍。', image: '🛒' },
  { name: '正义', keyword: '公平', meaning: '代表真相、法律、平衡和因果。诚实面对自己，公平对待他人。', image: '⚖️' },
  { name: '隐士', keyword: '内省', meaning: '代表孤独、反省、指引和智慧。给自己一些时间静下心来思考。', image: '🕯️' },
  { name: '命运之轮', keyword: '变革', meaning: '代表机会、转折、命运和周期。接受生命的起伏，顺应变化。', image: '🎡' },
  { name: '力量', keyword: '勇气', meaning: '代表同情心、软实力、自信和忍耐。用温柔和勇气去面对挑战。', image: '🦁' },
  { name: '倒吊人', keyword: '视角', meaning: '代表牺牲、停顿、换位思考和看开。停下脚步，从不同的角度看问题。', image: '⚓' },
  { name: '死亡', keyword: '结束', meaning: '代表转型、放手、结束和重生的开始。旧的不去，新的不来。', image: '💀' },
  { name: '节制', keyword: '平衡', meaning: '代表耐性、节制、融合和宁静。寻找中间点，保持心态平和。', image: '🍷' },
  { name: '恶魔', keyword: '束缚', meaning: '代表诱惑、享乐、负债和阴暗面。审视让你感到束缚的事物。', image: '😈' },
  { name: '高塔', keyword: '巨变', meaning: '代表突发事件、觉醒、破坏和剧变。暂时的混乱是为了建立更好的基础。', image: '🗼' },
  { name: '星星', keyword: '希望', meaning: '代表灵感、指引、安慰和信念。保持乐观，隧道尽头总有光。', image: '⭐' },
  { name: '月亮', keyword: '幻觉', meaning: '代表不安、不安、迷惑和想象。警惕潜在的风险，不要被表面迷惑。', image: '🌙' },
  { name: '太阳', keyword: '成功', meaning: '代表喜悦、成就、活力和透明。一切都将变得明朗，迎接光明的到来。', image: '☀️' },
  { name: '审判', keyword: '重生', meaning: '代表反省、召唤、觉醒和原谅。这是一个总结过去并重新开始的机会。', image: '🎺' },
  { name: '世界', keyword: '圆满', meaning: '代表达成、完整、旅行和集成。恭喜你完成了一个阶段。', image: '🌍' },
];

export default function TarotDivination() {
  const [isShuffling, setIsShuffling] = useState(false);
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);

  const drawCard = () => {
    setIsShuffling(true);
    setSelectedCard(null);
    setIsFlipping(false);

    // 模拟洗牌动画
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * TAROT_DECK.length);
      setSelectedCard(TAROT_DECK[randomIndex]);
      setIsShuffling(false);
      setIsFlipping(true);
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center gap-8 p-6 max-w-2xl mx-auto w-full">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">塔罗占卜</h2>
        <p className="text-gray-400">静下心来，默念你的问题，然后抽取一张牌</p>
      </div>

      <div className="relative w-64 h-96 transition-all duration-500">
        {!selectedCard && !isShuffling ? (
          <div
            onClick={drawCard}
            className="w-full h-full bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl border-4 border-amber-500/30 flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform group shadow-2xl"
          >
            <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="text-amber-500 w-10 h-10" />
            </div>
            <span className="text-amber-500 font-bold tracking-widest">点击抽牌</span>
          </div>
        ) : isShuffling ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="relative">
              <div className="w-64 h-96 bg-indigo-900/50 rounded-2xl border-4 border-dashed border-amber-500/20 animate-pulse"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <RefreshCcw className="w-12 h-12 text-amber-500 animate-spin mb-4" />
                <span className="text-amber-500 animate-bounce font-medium">解密命运中...</span>
              </div>
            </div>
          </div>
        ) : (
          <div className={`w-full h-full transition-all duration-1000 transform ${isFlipping ? 'rotate-y-180' : ''}`}>
            <div className="w-full h-full bg-emerald-950 rounded-2xl border-4 border-amber-500 p-6 flex flex-col items-center shadow-[0_0_50px_-12px_rgba(245,158,11,0.5)]">
              <div className="text-8xl mb-8 filter drop-shadow-lg">{selectedCard.image}</div>
              <div className="text-center mt-auto">
                <div className="text-amber-500 text-sm font-bold tracking-[0.2em] mb-1">[{selectedCard.keyword}]</div>
                <h3 className="text-3xl font-bold text-white mb-4">{selectedCard.name}</h3>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedCard && !isShuffling && (
        <div className="bg-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h4 className="text-amber-500 font-bold mb-2 flex items-center gap-2">
             释义与启示
          </h4>
          <p className="text-gray-200 leading-relaxed text-lg">
            {selectedCard.meaning}
          </p>
          <button
            onClick={drawCard}
            className="mt-6 w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-colors font-bold shadow-lg"
          >
            重新占卜
          </button>
        </div>
      )}

      <style>{`
        .rotate-y-180 {
          animation: flip 0.8s ease-out forwards;
        }
        @keyframes flip {
          0% { transform: perspective(1000px) rotateY(90deg) scale(0.8); opacity: 0; }
          100% { transform: perspective(1000px) rotateY(0deg) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
