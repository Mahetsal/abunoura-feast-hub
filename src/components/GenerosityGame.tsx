import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { Trophy, Play, RotateCcw, Gift } from 'lucide-react';
import saudiChefImg from '@/assets/saudi-chef-realistic.png';
import kitchenBgImg from '@/assets/kitchen-bg.jpg';
import gameChickenImg from '@/assets/game-chicken-realistic.png';
import gameRiceImg from '@/assets/game-rice-realistic.png';
import gameCarrotImg from '@/assets/game-carrot-realistic.png';

interface FallingItem {
  id: number;
  type: 'chicken' | 'rice' | 'carrot';
  x: number;
  y: number;
  speed: number;
  rotation: number;
}

interface GenerosityGameProps {
  isActive: boolean;
  onScoreChange?: (score: number) => void;
  onWin?: () => void;
}

// Sound effects
const playPopSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
  } catch (e) {
    // Audio not supported
  }
};

export function GenerosityGame({ isActive, onScoreChange, onWin }: GenerosityGameProps) {
  const { language, playSound } = useApp();
  const [score, setScore] = useState(0);
  const [caughtItems, setCaughtItems] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('generosity-high-score');
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

  const itemImages: Record<FallingItem['type'], string> = {
    chicken: gameChickenImg,
    rice: gameRiceImg,
    carrot: gameCarrotImg,
  };

  // Handle touch/mouse movement for Chef (drag/swipe)
  const handleStart = useCallback((clientX: number) => {
    if (!isPlaying) return;
    isDraggingRef.current = true;
    if (gameAreaRef.current) {
      const rect = gameAreaRef.current.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 100;
      setChefX(Math.max(15, Math.min(85, x)));
    }
  }, [isPlaying]);

  const handleMove = useCallback((clientX: number) => {
    if (!gameAreaRef.current || !isPlaying || !isDraggingRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    setChefX(Math.max(15, Math.min(85, x)));
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

  // Spawn new falling items
  const spawnItem = useCallback(() => {
    const types: FallingItem['type'][] = ['chicken', 'rice', 'carrot'];
    const weights = [0.4, 0.35, 0.25]; // 40% chicken, 35% rice, 25% carrot
    const rand = Math.random();
    let type: FallingItem['type'] = 'chicken';
    if (rand > weights[0]) type = rand > weights[0] + weights[1] ? 'carrot' : 'rice';

    const newItem: FallingItem = {
      id: itemIdRef.current++,
      type,
      x: Math.random() * 70 + 15,
      y: -15,
      speed: 1.5 + Math.random() * 1.0,
      rotation: Math.random() * 360,
    };
    setFallingItems(prev => [...prev, newItem]);
  }, []);

  // Check win condition
  useEffect(() => {
    if (caughtItems >= 10 && !hasWon && isPlaying) {
      setHasWon(true);
      setIsPlaying(false);
      playSound('success');
      onWin?.();
    }
  }, [caughtItems, hasWon, isPlaying, playSound, onWin]);

  // Game loop
  useEffect(() => {
    if (!isPlaying || !isActive) return;

    let lastSpawn = 0;
    const spawnInterval = 700;

    const gameLoop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      // Spawn items
      lastSpawn += deltaTime;
      if (lastSpawn >= spawnInterval) {
        spawnItem();
        lastSpawn = 0;
      }

      // Update falling items
      setFallingItems(prev => {
        const chefLeft = chefX - 18;
        const chefRight = chefX + 18;
        
        return prev.reduce((acc, item) => {
          const newY = item.y + item.speed * (deltaTime / 16);
          const newRotation = item.rotation + 1.5;

          // Check collision with Chef plate (bottom area)
          if (newY >= 65 && newY <= 85) {
            if (item.x >= chefLeft && item.x <= chefRight) {
              // Caught!
              const points = item.type === 'chicken' ? 15 : item.type === 'rice' ? 12 : 10;
              setScore(s => {
                const newScore = s + points;
                onScoreChange?.(newScore);
                return newScore;
              });
              setCaughtItems(c => c + 1);
              playPopSound();
              return acc; // Remove item
            }
          }

          // Remove if off screen
          if (newY > 110) return acc;

          acc.push({ ...item, y: newY, rotation: newRotation });
          return acc;
        }, [] as FallingItem[]);
      });

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, isActive, chefX, spawnItem, onScoreChange]);

  // Game timer
  useEffect(() => {
    if (!isPlaying || !isActive) return;

    const timer = setInterval(() => {
      setGameTime(prev => {
        if (prev <= 1) {
          setIsPlaying(false);
          // Update high score
          if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('generosity-high-score', score.toString());
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
    <div className="bg-gradient-to-b from-secondary to-secondary/80 rounded-2xl p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg text-primary-foreground flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          {language === 'ar' ? 'تحدي الكرم' : 'Generosity Challenge'}
        </h3>
        <div className="flex items-center gap-2 bg-gold/20 px-3 py-1 rounded-full">
          <Trophy className="w-4 h-4 text-gold" />
          <span className="text-sm text-gold font-bold">{highScore}</span>
        </div>
      </div>

      {/* Progress to win */}
      {isPlaying && (
        <div className="mb-3 bg-black/20 rounded-full p-1">
          <div className="flex items-center gap-2 px-2">
            <span className="text-xs text-white/80">{caughtItems}/10</span>
            <div className="flex-1 h-2 bg-black/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gold transition-all duration-300"
                style={{ width: `${Math.min(caughtItems / 10, 1) * 100}%` }}
              />
            </div>
            <Gift className="w-4 h-4 text-gold" />
          </div>
        </div>
      )}

      {/* Game Area */}
      <div
        ref={gameAreaRef}
        className="relative h-72 rounded-xl overflow-hidden select-none touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleEnd}
        style={{
          backgroundImage: `url(${kitchenBgImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          cursor: isPlaying ? 'grab' : 'default',
        }}
      >
        {/* Blur overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

        {/* Instructions Overlay */}
        {showInstructions && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20">
            <div className="text-center p-6 animate-scale-in">
              <div className="w-24 h-24 mx-auto mb-4">
                <img 
                  src={saudiChefImg} 
                  alt="Chef" 
                  className="w-full h-full object-contain"
                  style={{
                    background: 'none',
                    filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))',
                  }}
                />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">
                {language === 'ar' ? 'تحدي الكرم' : 'Generosity Challenge'}
              </h4>
              <p className="text-white/80 text-sm mb-4 max-w-xs">
                {language === 'ar' 
                  ? 'اسحب الشيف لالتقاط الدجاج والأرز والجزر! اجمع 10 قطع للفوز!'
                  : 'Drag the Chef to catch chicken, rice & carrots! Catch 10 to win!'}
              </p>
                 <div className="flex gap-4 justify-center text-white/70 text-xs mb-4">
                 <span className="flex items-center gap-1">
                   <img 
                     src={gameChickenImg} 
                     alt="" 
                     className="w-6 h-6 object-contain"
                     style={{ background: 'none' }}
                   /> +15
                 </span>
                 <span className="flex items-center gap-1">
                   <img 
                     src={gameRiceImg} 
                     alt="" 
                     className="w-6 h-6 object-contain"
                     style={{ background: 'none' }}
                   /> +12
                 </span>
                 <span className="flex items-center gap-1">
                   <img 
                     src={gameCarrotImg} 
                     alt="" 
                     className="w-6 h-6 object-contain"
                     style={{ background: 'none' }}
                   /> +10
                 </span>
               </div>
              <button
                onClick={startGame}
                className="bg-gold text-secondary px-8 py-3 rounded-full font-bold
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
              <div className="w-20 h-20 mx-auto mb-3">
                <img 
                  src={saudiChefImg} 
                  alt="Chef" 
                  className="w-full h-full object-contain"
                  style={{
                    background: 'none',
                    filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))',
                  }}
                />
              </div>
              <h4 className="text-2xl font-bold text-white mb-1">
                {language === 'ar' ? 'الشيف معجب!' : 'Chef is impressed!'}
              </h4>
              <p className="text-gold font-bold text-lg mb-4">
                {language === 'ar' ? 'هديتك جاهزة!' : 'Your Generosity Gift is ready!'}
              </p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Gift className="w-6 h-6 text-gold" />
                <span className="text-3xl font-bold text-white">{score}</span>
              </div>
              <button
                onClick={startGame}
                className="bg-gold text-secondary px-6 py-2 rounded-full font-bold
                           flex items-center gap-2 mx-auto hover:scale-105 transition-transform"
              >
                <RotateCcw className="w-4 h-4" />
                {language === 'ar' ? 'العب مرة أخرى' : 'Play Again'}
              </button>
            </div>
          </div>
        )}

        {/* Game Over Overlay (time ran out) */}
        {!showInstructions && !hasWon && gameTime === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20">
            <div className="text-center p-6 animate-scale-in">
              <div className="text-5xl mb-3">⏰</div>
              <h4 className="text-2xl font-bold text-white mb-1">
                {language === 'ar' ? 'انتهى الوقت!' : 'Time\'s Up!'}
              </h4>
              <p className="text-4xl font-bold text-gold mb-1">{score}</p>
              <p className="text-white/70 text-sm mb-4">
                {caughtItems}/10 {language === 'ar' ? 'قطع' : 'items'}
              </p>
              <button
                onClick={startGame}
                className="bg-gold text-secondary px-6 py-2 rounded-full font-bold
                           flex items-center gap-2 mx-auto hover:scale-105 transition-transform"
              >
                <RotateCcw className="w-4 h-4" />
                {language === 'ar' ? 'حاول مرة أخرى' : 'Try Again'}
              </button>
            </div>
          </div>
        )}

        {/* Falling Items - Solid visible images, transparent containers */}
        {fallingItems.map(item => (
          <img
            key={item.id}
            src={itemImages[item.type]}
            alt={item.type}
            className="game-asset absolute w-14 h-14 pointer-events-none z-10"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
              willChange: 'transform, top',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5)) contrast(1.15) brightness(1.05)',
            }}
          />
        ))}

        {/* Saudi Chef (Player) - Solid visible, no white box, in front */}
        <img
          src={saudiChefImg}
          alt="Saudi Chef"
          className="game-asset absolute bottom-0 w-24 h-28 pointer-events-none z-20"
          style={{
            left: `${chefX}%`,
            transform: 'translateX(-50%)',
            willChange: 'left',
            transition: 'left 50ms linear',
            filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.6)) contrast(1.1) brightness(1.05)',
          }}
        />

        {/* Score & Timer HUD */}
        {isPlaying && gameTime > 0 && (
          <div className="absolute top-2 left-2 right-2 flex justify-between items-center z-10">
            <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-1.5 flex items-center gap-2">
              <span className="text-white font-bold">{score}</span>
            </div>
            <button
              onClick={resetGame}
              className="bg-black/50 backdrop-blur-sm rounded-full p-2 text-white hover:bg-black/70 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-1.5">
              <span className={`font-bold ${gameTime <= 10 ? 'text-red-400' : 'text-white'}`}>
                {gameTime}s
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom tip */}
      {isPlaying && (
        <p className="text-center text-primary-foreground/60 text-xs mt-2">
          {language === 'ar' ? '👆 اسحب الشيف يميناً ويساراً' : '👆 Drag the Chef left and right'}
        </p>
      )}
    </div>
  );
}
