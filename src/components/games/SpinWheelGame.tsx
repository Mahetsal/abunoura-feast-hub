import { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Gift, RotateCcw, Sparkles } from 'lucide-react';

type SoundType = 'ding' | 'pop' | 'tick' | 'fanfare' | 'flip' | 'match' | 'success';

interface SpinWheelGameProps {
  isActive: boolean;
  onScoreChange?: (score: number) => void;
  playGameSound?: (sound: SoundType) => void;
}

const wheelSegments = [
  { label: '5%', value: 5, color: 'bg-red-500', emoji: '🎁' },
  { label: '10%', value: 10, color: 'bg-amber-500', emoji: '⭐' },
  { label: '15%', value: 15, color: 'bg-yellow-400', emoji: '🎉' },
  { label: '20%', value: 20, color: 'bg-green-500', emoji: '💎' },
  { label: '5%', value: 5, color: 'bg-blue-500', emoji: '🎁' },
  { label: '10%', value: 10, color: 'bg-purple-500', emoji: '⭐' },
  { label: 'مجاني', value: 100, color: 'bg-gradient-to-r from-yellow-400 to-amber-500', emoji: '👑' },
  { label: '5%', value: 5, color: 'bg-pink-500', emoji: '🎁' },
];

export function SpinWheelGame({ isActive, onScoreChange, playGameSound }: SpinWheelGameProps) {
  const { language, playSound } = useApp();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<typeof wheelSegments[0] | null>(null);
  const [spinsLeft, setSpinsLeft] = useState(3);
  const [totalWinnings, setTotalWinnings] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  const spin = () => {
    if (isSpinning || spinsLeft <= 0) return;

    setIsSpinning(true);
    setResult(null);
    setSpinsLeft(prev => prev - 1);

    // Random rotation (3-6 full spins + random offset)
    const spins = 3 + Math.random() * 3;
    const segmentAngle = 360 / wheelSegments.length;
    const randomSegment = Math.floor(Math.random() * wheelSegments.length);
    const finalRotation = rotation + (spins * 360) + (randomSegment * segmentAngle);

    setRotation(finalRotation);

    // Play tick sounds during spin
    const tickInterval = setInterval(() => {
      playGameSound?.('tick');
    }, 100);

    // Reveal result
    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      const winningSegment = wheelSegments[(wheelSegments.length - randomSegment) % wheelSegments.length];
      setResult(winningSegment);
      setTotalWinnings(prev => prev + winningSegment.value);
      onScoreChange?.(winningSegment.value * 10);
      playGameSound?.('fanfare');
      playSound('success');
    }, 4000);
  };

  const resetGame = () => {
    setSpinsLeft(3);
    setTotalWinnings(0);
    setResult(null);
    setRotation(0);
  };

  if (!isActive) return null;

  return (
    <div className="bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-2xl p-4 overflow-hidden border-2 border-yellow-400 dark:border-yellow-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-amber-800 dark:text-amber-200 flex items-center gap-2">
          <span className="text-2xl">🎡</span>
          {language === 'ar' ? 'العجلة الذهبية' : 'Golden Wheel'}
        </h3>
        <div className="flex items-center gap-2 bg-amber-500/20 px-3 py-1 rounded-full">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span className="text-sm text-amber-700 dark:text-amber-300 font-bold">
            {spinsLeft} {language === 'ar' ? 'محاولات' : 'spins'}
          </span>
        </div>
      </div>

      {/* Wheel Container */}
      <div className="relative flex flex-col items-center">
        {/* Pointer */}
        <div className="absolute top-0 z-10 text-3xl" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
          ▼
        </div>

        {/* Wheel */}
        <div
          ref={wheelRef}
          className="relative w-52 h-52 rounded-full shadow-2xl border-4 border-amber-400"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
          }}
        >
          {/* Segments */}
          {wheelSegments.map((segment, index) => {
            const angle = (360 / wheelSegments.length) * index;
            return (
              <div
                key={index}
                className={`absolute w-full h-full flex items-center justify-end pr-4`}
                style={{
                  transform: `rotate(${angle}deg)`,
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.tan(Math.PI / wheelSegments.length)}% 0%)`,
                }}
              >
                <div
                  className={`absolute inset-0 ${segment.color}`}
                  style={{ opacity: 0.9 }}
                />
              </div>
            );
          })}

          {/* Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 border-4 border-amber-600 shadow-lg flex items-center justify-center">
              <span className="text-2xl">🎰</span>
            </div>
          </div>

          {/* Segment Labels */}
          {wheelSegments.map((segment, index) => {
            const angle = (360 / wheelSegments.length) * index + (360 / wheelSegments.length / 2);
            const radius = 70;
            const x = 50 + radius * Math.cos((angle - 90) * (Math.PI / 180));
            const y = 50 + radius * Math.sin((angle - 90) * (Math.PI / 180));
            return (
              <div
                key={`label-${index}`}
                className="absolute text-white font-bold text-xs"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                }}
              >
                {segment.emoji}
              </div>
            );
          })}
        </div>

        {/* Spin Button */}
        <button
          onClick={spin}
          disabled={isSpinning || spinsLeft <= 0}
          className={`mt-4 px-8 py-3 rounded-full font-bold text-white shadow-lg
                     flex items-center gap-2 transition-all
                     ${isSpinning || spinsLeft <= 0
                       ? 'bg-gray-400 cursor-not-allowed'
                       : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:scale-105 active:scale-95'}`}
        >
          {isSpinning ? (
            <>
              <div className="animate-spin">🎡</div>
              {language === 'ar' ? 'جاري الدوران...' : 'Spinning...'}
            </>
          ) : spinsLeft <= 0 ? (
            <>
              <RotateCcw className="w-5 h-5" />
              {language === 'ar' ? 'انتهت المحاولات' : 'No spins left'}
            </>
          ) : (
            <>
              <span className="text-xl">🎡</span>
              {language === 'ar' ? 'أدر العجلة!' : 'Spin!'}
            </>
          )}
        </button>

        {/* Reset Button */}
        {spinsLeft <= 0 && (
          <button
            onClick={resetGame}
            className="mt-2 text-amber-600 dark:text-amber-400 text-sm underline hover:no-underline"
          >
            {language === 'ar' ? 'العب مرة أخرى' : 'Play Again'}
          </button>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="mt-4 text-center animate-scale-in">
          <div className="bg-gradient-to-r from-amber-400 to-yellow-400 rounded-xl p-4 shadow-lg">
            <div className="text-4xl mb-2">{result.emoji}</div>
            <p className="text-amber-900 font-bold text-lg">
              {language === 'ar' ? 'ربحت خصم' : 'You won'} {result.label}!
            </p>
          </div>
        </div>
      )}

      {/* Total Winnings */}
      {totalWinnings > 0 && (
        <div className="mt-4 text-center bg-amber-500/20 rounded-full py-2 px-4">
          <span className="text-sm text-amber-700 dark:text-amber-300">
            {language === 'ar' ? 'إجمالي الخصومات:' : 'Total discounts:'}
          </span>
          <span className="font-bold text-amber-600 mr-2 ml-2">{totalWinnings}%</span>
          <Gift className="w-4 h-4 inline text-amber-600" />
        </div>
      )}
    </div>
  );
}
