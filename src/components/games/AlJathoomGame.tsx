import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Heart, Zap, RefreshCw } from 'lucide-react';

interface AlJathoomGameProps {
  isActive: boolean;
  onScoreChange?: (score: number) => void;
  playGameSound?: (sound: 'ding' | 'pop' | 'tick' | 'fanfare' | 'flip' | 'match' | 'success') => void;
}

interface Obstacle {
  id: number;
  lane: number; // 0, 1, 2
  y: number; // 0 to 100 (percentage from top)
  type: 'sedan' | 'taxi';
  emoji: string;
  isMoving: boolean;
  sideOffset: number; // For lane transition animation
}

interface Collectible {
  id: number;
  lane: number;
  y: number;
  type: 'mandi' | 'laban';
  emoji: string;
}

export function AlJathoomGame({ isActive, onScoreChange, playGameSound }: AlJathoomGameProps) {
  const { language, playSound } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [playerLane, setPlayerLane] = useState(0); // Starts in the left lane (fast lane!)
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [isInvincible, setIsInvincible] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [speed, setSpeed] = useState(1.5);
  const [ticks, setTicks] = useState(0); // Frame debug counter to verify loop is running
  
  // Refs for the game loop to avoid dependency restarts
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const playerLaneRef = useRef(0);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const collectiblesRef = useRef<Collectible[]>([]);
  const isInvincibleRef = useRef(false);
  const speedRef = useRef(1.5);
  const spawnTimerRef = useRef(0);

  const gameLoopRef = useRef<number | null>(null);
  const obstacleIdRef = useRef(0);
  const collectibleIdRef = useRef(0);

  // Keyboard controls
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        moveLeft();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        moveRight();
      } else if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        flashHighBeam();
      } else if (e.key === '1') {
        selectLane(0);
      } else if (e.key === '2') {
        selectLane(1);
      } else if (e.key === '3') {
        selectLane(2);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, gameOver]);

  // Game Loop
  useEffect(() => {
    if (!isPlaying || gameOver) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      return;
    }

    let lastTime: number | null = null;

    const updateGame = (timestamp: number) => {
      if (lastTime === null) {
        lastTime = timestamp;
      }
      const deltaTime = Math.max(0, Math.min(100, timestamp - lastTime));
      lastTime = timestamp;

      // Increment debug tick counter
      setTicks(t => t + 1);

      // 1. Move obstacles
      const currentObstacles = obstaclesRef.current;
      const updatedObstacles = currentObstacles
        .map(obs => {
          let sideOffset = obs.sideOffset;
          let lane = obs.lane;
          // If the car was flashed, it moves to the right lane
          if (obs.isMoving && sideOffset < 1) {
            sideOffset += 0.08; // speed of lane change
            if (sideOffset >= 1) {
              sideOffset = 0;
              lane = Math.min(2, obs.lane + 1); // Move to right lane
            }
          }
          return {
            ...obs,
            y: obs.y + speedRef.current * (deltaTime / 16),
            lane,
            sideOffset,
          };
        })
        .filter(obs => obs.y < 100);

      // 2. Move collectibles
      const currentCollectibles = collectiblesRef.current;
      const updatedCollectibles = currentCollectibles
        .map(item => ({
          ...item,
          y: item.y + speedRef.current * (deltaTime / 16),
        }))
        .filter(item => item.y < 100);

      // 3. Spawn manager (using delta time accumulator)
      spawnTimerRef.current += deltaTime;
      const spawnInterval = 1500 - Math.min(800, scoreRef.current * 0.2);
      if (spawnTimerRef.current > spawnInterval) {
        const isSpawnObstacle = Math.random() > 0.35;
        const spawnLane = Math.floor(Math.random() * 3);

        if (isSpawnObstacle) {
          obstacleIdRef.current += 1;
          const type = Math.random() > 0.5 ? ('sedan' as const) : ('taxi' as const);
          const emoji = type === 'sedan' ? '🚗' : '🚕';
          updatedObstacles.push({
            id: obstacleIdRef.current,
            lane: spawnLane,
            y: -10,
            type,
            emoji,
            isMoving: false,
            sideOffset: 0,
          });
        } else {
          collectibleIdRef.current += 1;
          const type = Math.random() > 0.4 ? ('mandi' as const) : ('laban' as const);
          const emoji = type === 'mandi' ? '🍚' : '🥛';
          updatedCollectibles.push({
            id: collectibleIdRef.current,
            lane: spawnLane,
            y: -10,
            type,
            emoji,
          });
        }
        spawnTimerRef.current = 0;
      }

      // 4. Check collisions with obstacles
      let crashHappened = false;
      updatedObstacles.forEach(obs => {
        const obsEffectiveLane = obs.isMoving && obs.sideOffset > 0.3 ? obs.lane + 1 : obs.lane;
        const isSameLane = obsEffectiveLane === playerLaneRef.current;
        if (isSameLane && obs.y > 75 && obs.y < 90) {
          if (!isInvincibleRef.current) {
            crashHappened = true;
          }
        }
      });

      if (crashHappened) {
        livesRef.current -= 1;
        setLives(livesRef.current);
        if (livesRef.current <= 0) {
          setGameOver(true);
          setIsPlaying(false);
          playGameSound?.('fanfare');
        } else {
          isInvincibleRef.current = true;
          setIsInvincible(true);
          playGameSound?.('flip');
          setTimeout(() => {
            isInvincibleRef.current = false;
            setIsInvincible(false);
          }, 2000);
        }
      }

      // 5. Check collisions with collectibles
      const remainingCollectibles: Collectible[] = [];
      updatedCollectibles.forEach(item => {
        if (item.lane === playerLaneRef.current && item.y > 75 && item.y < 90) {
          const points = item.type === 'mandi' ? 100 : 200;
          scoreRef.current += points;
          setScore(scoreRef.current);
          onScoreChange?.(scoreRef.current);
          
          speedRef.current = 1.5 + Math.min(2.5, scoreRef.current / 2000);
          setSpeed(speedRef.current);

          playGameSound?.('match');
          playSound?.('success');
        } else {
          remainingCollectibles.push(item);
        }
      });

      // Update refs
      obstaclesRef.current = updatedObstacles;
      collectiblesRef.current = remainingCollectibles;

      // Update states to trigger render
      setObstacles(updatedObstacles);
      setCollectibles(remainingCollectibles);

      gameLoopRef.current = requestAnimationFrame(updateGame);
    };

    gameLoopRef.current = requestAnimationFrame(updateGame);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isPlaying, gameOver]);

  const startGame = () => {
    scoreRef.current = 0;
    livesRef.current = 3;
    playerLaneRef.current = 0;
    obstaclesRef.current = [];
    collectiblesRef.current = [];
    isInvincibleRef.current = false;
    speedRef.current = 1.5;
    spawnTimerRef.current = 0;

    setScore(0);
    setLives(3);
    setPlayerLane(0);
    setObstacles([]);
    setCollectibles([]);
    setIsInvincible(false);
    setSpeed(1.5);
    setTicks(0);

    setIsPlaying(true);
    setGameOver(false);
    playSound?.('ding');
  };

  function moveLeft() {
    const nextLane = Math.max(0, playerLaneRef.current - 1);
    if (nextLane !== playerLaneRef.current) {
      playerLaneRef.current = nextLane;
      setPlayerLane(nextLane);
      playGameSound?.('pop');
    }
  }

  function moveRight() {
    const nextLane = Math.min(2, playerLaneRef.current + 1);
    if (nextLane !== playerLaneRef.current) {
      playerLaneRef.current = nextLane;
      setPlayerLane(nextLane);
      playGameSound?.('pop');
    }
  }

  function selectLane(laneIndex: number) {
    if (!isPlaying || gameOver) return;
    const targetLane = Math.max(0, Math.min(2, laneIndex));
    if (playerLaneRef.current !== targetLane) {
      playerLaneRef.current = targetLane;
      setPlayerLane(targetLane);
      playGameSound?.('pop');
    }
  }

  function flashHighBeam() {
    if (isFlashing) return;
    setIsFlashing(true);
    playSound?.('ding');

    setTimeout(() => {
      setIsFlashing(false);
    }, 200);

    let hit = false;
    const updated = obstaclesRef.current.map(obs => {
      if (obs.lane === playerLaneRef.current && obs.y > 10 && obs.y < 75 && !obs.isMoving) {
        hit = true;
        return { ...obs, isMoving: true };
      }
      return obs;
    });

    if (hit) {
      scoreRef.current += 50;
      setScore(scoreRef.current);
      onScoreChange?.(scoreRef.current);
      
      speedRef.current = 1.5 + Math.min(2.5, scoreRef.current / 2000);
      setSpeed(speedRef.current);

      playGameSound?.('success');
    }

    obstaclesRef.current = updated;
    setObstacles(updated);
  }

  // Nismo SUV Vector Drawing
  const renderNismoVector = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {/* Car Body (Stealth Grey) */}
      <rect x="15" y="25" width="70" height="50" rx="10" fill="#4B5563" />
      {/* Windshield */}
      <rect x="25" y="30" width="50" height="18" rx="4" fill="#111827" />
      {/* Grille */}
      <rect x="30" y="52" width="40" height="16" rx="2" fill="#1F2937" stroke="#DC2626" strokeWidth="2" />
      <line x1="30" y1="60" x2="70" y2="60" stroke="#9CA3AF" strokeWidth="1" />
      {/* Headlights */}
      <path d="M 22 52 L 28 52 M 22 52 L 22 62 L 28 62" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      <path d="M 78 52 L 72 52 M 78 52 L 78 62 L 72 62" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      {/* Nismo Red Accent Chin */}
      <rect x="15" y="72" width="70" height="6" rx="2" fill="#DC2626" />
    </svg>
  );

  if (!isActive) return null;

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black rounded-3xl p-4 overflow-hidden border-2 border-red-500/50 shadow-[0_0_25px_rgba(239,68,68,0.25)] flex flex-col items-center">
      {/* Game Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-red-500 flex items-center gap-2 font-cairo">
          <span className="text-2xl">🚨</span>
          {language === 'ar' ? 'الجاثوم: ملك الخط' : 'Al-Jathoom: Highway King'}
        </h3>
        
        {isPlaying && (
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-white">
            {/* Lives */}
            <div className="flex items-center gap-1">
              {[...Array(3)].map((_, i) => (
                <Heart
                  key={i}
                  className={`w-4 h-4 ${i < lives ? 'text-red-500 fill-red-500 animate-pulse' : 'text-gray-600'}`}
                />
              ))}
            </div>
            {/* Score */}
            <div className="text-sm font-bold text-yellow-400">
              {score} PTS
            </div>
          </div>
        )}
      </div>

      {/* Main Panel */}
      {!isPlaying && !gameOver ? (
        // Start Screen
        <div className="w-full max-w-sm flex flex-col items-center text-center p-6 space-y-5">
          <div className="relative w-44 h-44 rounded-2xl border-4 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)] bg-gradient-to-br from-gray-800 to-gray-950 flex flex-col items-center justify-center p-4">
            <div className="w-24 h-24">
              {renderNismoVector()}
            </div>
            <div className="text-white font-bold text-sm tracking-wide mt-2">
              PATROL NISMO
            </div>
            <div className="text-red-500 font-bold text-[10px] uppercase tracking-widest mt-0.5">
              STEALTH EDITION
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xl font-bold text-white font-cairo">
              {language === 'ar' ? 'الجاثوم في خط التجاوز!' : 'Al-Jathoom: Fast Lane Chase!'}
            </h4>
            <p className="text-sm text-gray-400 font-cairo leading-relaxed">
              {language === 'ar'
                ? 'قد سيارة الجاثوم الأسطورية! كشح بالعالي 🚨 لتفسيح السيارات البطيئة، واجمع علب المندي 🍚 واللبن 🥛 للحصول على نقاط إضافية وتجنب الاصطدام!'
                : 'Drive the legendary Nismo! Flash high beams 🚨 to scare slow traffic out of the way, collect Mandi boxes 🍚 and Laban 🥛 for extra points, and avoid crashing!'}
            </p>
          </div>

          <button
            onClick={startGame}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold text-lg
                       shadow-[0_4px_25px_rgba(220,38,38,0.4)] hover:scale-105 active:scale-95 transition-all font-cairo"
          >
            {language === 'ar' ? 'دعس بنزين! 🏁' : 'Hit the Gas! 🏁'}
          </button>
        </div>
      ) : gameOver ? (
        // Game Over Screen
        <div className="w-full max-w-sm flex flex-col items-center text-center p-6 space-y-5">
          <div className="text-6xl animate-bounce">💥</div>
          <div className="space-y-1">
            <h4 className="text-2xl font-bold text-red-500 font-cairo">
              {language === 'ar' ? 'انتهت اللعبة! (راحت التكشيكة)' : 'Game Over!'}
            </h4>
            <p className="text-gray-400 font-cairo">
              {language === 'ar' ? 'تعرض الجاثوم لحادث تصادم!' : 'You crashed the Patrol!'}
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full">
            <div className="text-sm text-gray-400 font-cairo">{language === 'ar' ? 'مجموع النقاط:' : 'Final Score:'}</div>
            <div className="text-4xl font-bold text-yellow-400 mt-1">{score}</div>
            {score >= 1000 ? (
              <p className="text-xs text-green-400 mt-2 font-cairo">
                {language === 'ar'
                  ? '🎉 كفو! لقد أثبت أنك ملك خط حقيقي! استمتع بالوجبة!'
                  : '🎉 Impressive! You are a true highway king!'}
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-2 font-cairo">
                {language === 'ar'
                  ? 'حاول تسجيل 1000 نقطة لتكون ملك الخط!'
                  : 'Try to score 1000 points to prove your skills!'}
              </p>
            )}
          </div>

          <button
            onClick={startGame}
            className="w-full py-4 rounded-2xl bg-white text-black font-bold text-lg
                       shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 font-cairo"
          >
            <RefreshCw className="w-5 h-5" />
            {language === 'ar' ? 'حاول مرة أخرى' : 'Play Again'}
          </button>
        </div>
      ) : (
        // Game Playing Screen
        <div className="w-full flex flex-col items-center space-y-4">
          {/* Instructions */}
          <div className="text-xs text-gray-500 text-center font-cairo">
            {language === 'ar'
              ? 'اضغط الأسهم للحركة والمسافة للتكشيح بالعالي'
              : 'Use left/right buttons to steer and FLASH button to clear traffic!'}
          </div>

          {/* Highway Screen */}
          <div className="relative w-full max-w-[320px] h-[340px] bg-gray-800 rounded-2xl overflow-hidden border-4 border-gray-700 shadow-inner">
            {/* Road Lanes */}
            <div className="absolute inset-0 flex">
              {/* Lane 0 (Left - Fast Lane) */}
              <div 
                onClick={() => selectLane(0)}
                className="relative flex-1 h-full border-r-2 border-dashed border-yellow-500/40 bg-gray-900 cursor-pointer hover:bg-white/5 transition-colors"
              >
                <div className="absolute top-2 left-2 text-[10px] text-red-500/40 font-bold font-cairo tracking-tight rotate-90 origin-top-left select-none">
                  {language === 'ar' ? 'تجاوز' : 'FAST'}
                </div>
              </div>
              {/* Lane 1 (Middle) */}
              <div 
                onClick={() => selectLane(1)}
                className="flex-1 h-full border-r-2 border-dashed border-yellow-500/40 bg-gray-800/90 cursor-pointer hover:bg-white/5 transition-colors"
              />
              {/* Lane 2 (Right) */}
              <div 
                onClick={() => selectLane(2)}
                className="flex-1 h-full bg-gray-800/80 cursor-pointer hover:bg-white/5 transition-colors"
              />
            </div>

            {/* Scrolling Road Animation */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="w-full h-[680px] flex flex-col justify-around absolute animate-road" style={{ animationDuration: `${2.5 / speed}s` }}>
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="w-full h-1 flex justify-around opacity-30">
                    <div className="w-1.5 h-6 bg-yellow-500 rounded-full" />
                    <div className="w-1.5 h-6 bg-yellow-500 rounded-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* Render Collectibles */}
            {collectibles.map(item => (
              <div
                key={item.id}
                className="absolute text-3xl transition-all duration-100 flex items-center justify-center pointer-events-none"
                style={{
                  left: `${(item.lane * 33.33) + 16.66}%`,
                  top: `${item.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div className="bg-black/30 w-10 h-10 rounded-full flex items-center justify-center shadow-lg border border-yellow-500/20 backdrop-blur-xs">
                  {item.emoji}
                </div>
              </div>
            ))}

            {/* Render Obstacles */}
            {obstacles.map(obs => {
              const baseLeft = (obs.lane * 33.33) + 16.66;
              const animatedLeft = obs.isMoving ? baseLeft + (obs.sideOffset * 33.33) : baseLeft;
              return (
                <div
                  key={obs.id}
                  className="absolute text-4xl transition-all duration-75 flex flex-col items-center pointer-events-none"
                  style={{
                    left: `${animatedLeft}%`,
                    top: `${obs.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <span className="filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                    {obs.emoji}
                  </span>
                  {/* Blinker if moving right */}
                  {obs.isMoving && (
                    <span className="absolute -top-1 right-0 text-[10px] text-yellow-400 animate-ping">
                      🧡
                    </span>
                  )}
                </div>
              );
            })}

            {/* High Beam Flash Ray */}
            {isFlashing && (
              <div
                className="absolute w-[33.33%] h-40 bg-gradient-to-t from-yellow-300/40 via-yellow-200/10 to-transparent pointer-events-none"
                style={{
                  left: `${Math.max(0, Math.min(2, playerLane)) * 33.33}%`,
                  bottom: '20%',
                }}
              />
            )}

            {/* Player Car (Nissan Patrol Nismo Vector Representation) */}
            <div
              className={`absolute w-16 h-16 transition-all duration-75 flex items-center justify-center pointer-events-none
                         ${isInvincible ? 'opacity-50 animate-pulse' : 'opacity-100'}`}
              style={{
                left: `${(Math.max(0, Math.min(2, playerLane)) * 33.33) + 16.66}%`,
                bottom: '10%',
                transform: 'translateX(-50%)',
              }}
            >
              <div className="relative w-14 h-14 rounded-xl border-2 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] bg-black p-1 flex items-center justify-center">
                {renderNismoVector()}
                {/* Flashing lights */}
                {isFlashing && (
                  <>
                    <div className="absolute top-4 left-1 w-2.5 h-2.5 rounded-full bg-yellow-300 animate-ping border border-white shadow-[0_0_15px_#fff]" />
                    <div className="absolute top-4 right-1 w-2.5 h-2.5 rounded-full bg-yellow-300 animate-ping border border-white shadow-[0_0_15px_#fff]" />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Game Controls - forced to LTR so left steering button is always on the left */}
          <div className="w-full max-w-[320px] flex flex-col gap-3" dir="ltr">
            {/* Steering Controls */}
            <div className="flex gap-4">
              <button
                onTouchStart={(e) => { e.preventDefault(); moveLeft(); }}
                onClick={(e) => { e.preventDefault(); moveLeft(); }}
                className="flex-1 py-4 bg-gray-800 border-2 border-gray-700 text-white rounded-2xl font-bold text-xl active:scale-95 transition-all shadow-md touch-manipulation select-none"
              >
                ◀
              </button>
              
              <button
                onTouchStart={(e) => { e.preventDefault(); moveRight(); }}
                onClick={(e) => { e.preventDefault(); moveRight(); }}
                className="flex-1 py-4 bg-gray-800 border-2 border-gray-700 text-white rounded-2xl font-bold text-xl active:scale-95 transition-all shadow-md touch-manipulation select-none"
              >
                ▶
              </button>
            </div>

            {/* High Beam Flash Trigger */}
            <button
              onTouchStart={(e) => { e.preventDefault(); flashHighBeam(); }}
              onClick={(e) => { e.preventDefault(); flashHighBeam(); }}
              className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 touch-manipulation select-none
                         ${isFlashing 
                           ? 'bg-yellow-400 text-black shadow-[0_0_20px_rgba(250,204,21,0.6)]' 
                           : 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-600'}`}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            >
              <Zap className={`w-5 h-5 ${isFlashing ? 'fill-black text-black' : ''}`} />
              <span>{language === 'ar' ? 'كبّس العالي! 🚨' : 'FLASH HIGH BEAM! 🚨'}</span>
            </button>
          </div>

          {/* Loop Running Verification Text */}
          <div className="text-[9px] text-gray-600 font-mono select-none">
            Frame: {ticks}
          </div>
        </div>
      )}

      {/* Road animation style */}
      <style>{`
        @keyframes roadScroll {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        .animate-road {
          animation: roadScroll linear infinite;
        }
      `}</style>
    </div>
  );
}
