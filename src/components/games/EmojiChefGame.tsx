import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { Trophy, Play, RotateCcw, Gift } from 'lucide-react';

interface FallingItem {
  id: number;
  type: 'chicken' | 'rice' | 'vegetables';
  emoji: string;
  x: number;
  y: number;
  speed: number;
  rotation: number;
}

type SoundType = 'ding' | 'pop' | 'tick' | 'fanfare' | 'flip' | 'match' | 'success';

interface EmojiChefGameProps {
  isActive: boolean;
  onScoreChange?: (score: number) => void;
  playGameSound?: (sound: SoundType) => void;
}

const itemEmojis = {
  chicken: '🍗',
  rice: '🍚',
  vegetables: '🥦',
};

// Legacy pop sound (fallback)
const playPopSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.12);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.12);
  } catch (e) {}
};

export function EmojiChefGame({ isActive, onScoreChange, playGameSound }: EmojiChefGameProps) {
  const { language, playSound } = useApp();
  const [score, setScore] = useState(0);
  const [caughtItems, setCaughtItems] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('emoji-chef-high-score');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [chefX, setChefX] = useState(50);
  const [fallingItems, setFallingItems] = useState<FallingItem[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameTime, setGameTime] = useState(30);
  const [showInstructions, setShowInstructions] = useState(true);
  const [hasWon, setHasWon] = useState(false);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const itemIdRef = useRef(0);
  const isDraggingRef = useRef(false);

  // Touch/mouse handlers
  const handleStart = useCallback((clientX: number) => {
    if (!isPlaying) return;
    isDraggingRef.current = true;
    if (gameAreaRef.current) {
      const rect = gameAreaRef.current.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 100;
      setChefX(Math.max(10, Math.min(90, x)));
    }
  }, [isPlaying]);

  const handleMove = useCallback((clientX: number) => {
    if (!gameAreaRef.current || !isPlaying || !isDraggingRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    setChefX(Math.max(10, Math.min(90, x)));
  }, [isPlaying]);

  const handleEnd = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleStart(e.touches[0].clientX);
  }, [handleStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleMove(e.touches[0].clientX);
  }, [handleMove]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    handleStart(e.clientX);
  }, [handleStart]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handleMove(e.clientX);
  }, [handleMove]);

  // Spawn items
  const spawnItem = useCallback(() => {
    const types: FallingItem['type'][] = ['chicken', 'rice', 'vegetables'];
    const type = types[Math.floor(Math.random() * types.length)];
    const newItem: FallingItem = {
      id: itemIdRef.current++,
      type,
      emoji: itemEmojis[type],
      x: Math.random() * 70 + 15,
      y: -10,
      speed: 1.8 + Math.random() * 1.2,
      rotation: Math.random() * 360,
    };
    setFallingItems(prev => [...prev, newItem]);
  }, []);

  // Win condition
  useEffect(() => {
    if (caughtItems >= 10 && !hasWon && isPlaying) {
      setHasWon(true);
      setIsPlaying(false);
      playSound('success');
    }
  }, [caughtItems, hasWon, isPlaying, playSound]);

  // Game loop
  useEffect(() => {
    if (!isPlaying || !isActive) return;

    let lastSpawn = 0;
    const spawnInterval = 600;

    const gameLoop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      lastSpawn += deltaTime;
      if (lastSpawn >= spawnInterval) {
        spawnItem();
        lastSpawn = 0;
      }

      setFallingItems(prev => {
        const chefLeft = chefX - 15;
        const chefRight = chefX + 15;

        return prev.reduce((acc, item) => {
          const newY = item.y + item.speed * (deltaTime / 16);
          const newRotation = item.rotation + 2;

          if (newY >= 70 && newY <= 90) {
            if (item.x >= chefLeft && item.x <= chefRight) {
              const points = item.type === 'chicken' ? 15 : item.type === 'rice' ? 12 : 10;
              setScore(s => {
                const newScore = s + points;
                onScoreChange?.(points);
                return newScore;
              });
              setCaughtItems(c => c + 1);
              if (playGameSound) playGameSound('ding'); else playPopSound();
              return acc;
            }
          }

          if (newY > 110) {
            playGameSound?.('pop');
            return acc;
          }
          acc.push({ ...item, y: newY, rotation: newRotation });
          return acc;
        }, [] as FallingItem[]);
      });

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, isActive, chefX, spawnItem, onScoreChange]);

  // Timer
  useEffect(() => {
    if (!isPlaying || !isActive) return;
    const timer = setInterval(() => {
      setGameTime(prev => {
        if (prev <= 1) {
          setIsPlaying(false);
          if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('emoji-chef-high-score', score.toString());
            playSound('success');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, isActive, score, highScore, playSound]);

  const startGame = () => {
    setShowInstructions(false);
    setScore(0);
    setCaughtItems(0);
    setGameTime(30);
    setFallingItems([]);
    setIsPlaying(true);
    setHasWon(false);
    lastTimeRef.current = 0;
  };

  const resetGame = () => {
    setIsPlaying(false);
    setScore(0);
    setCaughtItems(0);
    setGameTime(30);
    setFallingItems([]);
    setShowInstructions(true);
    setHasWon(false);
  };

  if (!isActive) return null;

  return (
    <div className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-2xl p-4 overflow-hidden border-2 border-amber-300 dark:border-amber-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg text-amber-800 dark:text-amber-200 flex items-center gap-2">
          <span className="text-2xl">👨‍🍳</span>
          {language === 'ar' ? 'الشيف الإيموجي' : 'Emoji Chef'}
        </h3>
        <div className="flex items-center gap-2 bg-amber-500/20 px-3 py-1 rounded-full">
          <Trophy className="w-4 h-4 text-amber-600" />
          <span className="text-sm text-amber-700 dark:text-amber-300 font-bold">{highScore}</span>
        </div>
      </div>

      {/* Progress */}
      {isPlaying && (
        <div className="mb-3 bg-black/10 dark:bg-white/10 rounded-full p-1">
          <div className="flex items-center gap-2 px-2">
            <span className="text-xs text-amber-800 dark:text-amber-200">{caughtItems}/10</span>
            <div className="flex-1 h-2 bg-black/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${Math.min(caughtItems / 10, 1) * 100}%` }}
              />
            </div>
            <Gift className="w-4 h-4 text-amber-600" />
          </div>
        </div>
      )}

      {/* Game Area */}
      <div
        ref={gameAreaRef}
        className="relative h-64 rounded-xl overflow-hidden select-none touch-none bg-gradient-to-b from-sky-200 via-sky-100 to-amber-200 dark:from-sky-900 dark:via-sky-800 dark:to-amber-900"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleEnd}
        style={{ cursor: isPlaying ? 'grab' : 'default' }}
      >
        {/* Instructions */}
        {showInstructions && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm z-20">
            <div className="text-center p-6 animate-scale-in">
              <div className="text-6xl mb-4">👨‍🍳</div>
              <h4 className="text-xl font-bold text-white mb-2">
                {language === 'ar' ? 'الشيف الإيموجي' : 'Emoji Chef'}
              </h4>
              <p className="text-white/80 text-sm mb-4 max-w-xs">
                {language === 'ar'
                  ? 'اسحب الشيف لالتقاط الطعام! اجمع 10 قطع للفوز!'
                  : 'Drag the chef to catch food! Catch 10 to win!'}
              </p>
              <div className="flex gap-4 justify-center text-white/70 text-xs mb-4">
                <span>🍗 +15</span>
                <span>🍚 +12</span>
                <span>🥦 +10</span>
              </div>
              <button
                onClick={startGame}
                className="bg-amber-500 text-white px-8 py-3 rounded-full font-bold
                           flex items-center gap-2 mx-auto hover:scale-105 transition-transform shadow-lg"
              >
                <Play className="w-5 h-5" />
                {language === 'ar' ? 'ابدأ اللعب' : 'Start Playing'}
              </button>
            </div>
          </div>
        )}

        {/* Win Overlay */}
        {hasWon && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20">
            <div className="text-center p-6 animate-scale-in">
              <div className="text-6xl mb-3">🎉</div>
              <div className="text-5xl mb-3">👨‍🍳</div>
              <h4 className="text-2xl font-bold text-white mb-1">
                {language === 'ar' ? 'فزت!' : 'You Won!'}
              </h4>
              <p className="text-amber-400 font-bold text-lg mb-4">{score} pts</p>
              <button
                onClick={startGame}
                className="bg-amber-500 text-white px-6 py-2 rounded-full font-bold
                           flex items-center gap-2 mx-auto hover:scale-105 transition-transform"
              >
                <RotateCcw className="w-4 h-4" />
                {language === 'ar' ? 'العب مرة أخرى' : 'Play Again'}
              </button>
            </div>
          </div>
        )}

        {/* Game Over */}
        {!showInstructions && !hasWon && gameTime === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20">
            <div className="text-center p-6 animate-scale-in">
              <div className="text-5xl mb-3">⏰</div>
              <h4 className="text-2xl font-bold text-white mb-1">
                {language === 'ar' ? 'انتهى الوقت!' : "Time's Up!"}
              </h4>
              <p className="text-4xl font-bold text-amber-400 mb-1">{score}</p>
              <p className="text-white/70 text-sm mb-4">
                {caughtItems}/10 {language === 'ar' ? 'قطع' : 'items'}
              </p>
              <button
                onClick={startGame}
                className="bg-amber-500 text-white px-6 py-2 rounded-full font-bold
                           flex items-center gap-2 mx-auto hover:scale-105 transition-transform"
              >
                <RotateCcw className="w-4 h-4" />
                {language === 'ar' ? 'حاول مرة أخرى' : 'Try Again'}
              </button>
            </div>
          </div>
        )}

        {/* Falling Items */}
        {fallingItems.map(item => (
          <div
            key={item.id}
            className="absolute text-4xl pointer-events-none select-none"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
              willChange: 'transform, top',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            }}
          >
            {item.emoji}
          </div>
        ))}

        {/* Chef */}
        <div
          className="absolute bottom-2 text-5xl pointer-events-none select-none"
          style={{
            left: `${chefX}%`,
            transform: 'translateX(-50%)',
            willChange: 'left',
            transition: 'left 50ms linear',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
          }}
        >
          👨‍🍳
        </div>

        {/* HUD */}
        {isPlaying && gameTime > 0 && (
          <div className="absolute top-2 left-2 right-2 flex justify-between items-center z-10">
            <div className="bg-black/40 backdrop-blur-sm rounded-full px-4 py-1.5">
              <span className="text-white font-bold">{score}</span>
            </div>
            <button
              onClick={resetGame}
              className="bg-black/40 backdrop-blur-sm rounded-full p-2 text-white hover:bg-black/60"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="bg-black/40 backdrop-blur-sm rounded-full px-4 py-1.5">
              <span className={`font-bold ${gameTime <= 10 ? 'text-red-400' : 'text-white'}`}>
                {gameTime}s
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Tip */}
      {isPlaying && (
        <p className="text-center text-xs text-amber-700 dark:text-amber-300 mt-2">
          {language === 'ar' ? '☝️ اسحب للتحريك' : '☝️ Drag to move'}
        </p>
      )}
    </div>
  );
}
