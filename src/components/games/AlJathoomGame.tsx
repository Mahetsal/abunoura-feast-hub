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
  type: 'sedan' | 'taxi' | 'police';
  emoji: string;
  isMoving: boolean;
  sideOffset: number; // For lane transition animation
  isBlasted?: boolean;
  blastAngle?: number;
}

interface Collectible {
  id: number;
  lane: number;
  y: number;
  type: 'mandi' | 'laban' | 'feast';
  emoji: string;
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
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
  
  // Warp speed boost states & refs
  const [isBoosting, setIsBoosting] = useState(false);
  const isBoostingRef = useRef(false);

  // Floating text popups
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const floatIdRef = useRef(0);

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

  // Helper to add arcade popups
  const addFloatingText = (text: string, lane: number, y: number, color: string = 'text-yellow-400') => {
    floatIdRef.current += 1;
    const x = (lane * 33.33) + 16.66;
    const newText = { id: floatIdRef.current, text, x, y, color };
    floatingTextsRef.current = [...floatingTextsRef.current, newText];
    setFloatingTexts(floatingTextsRef.current);
    
    setTimeout(() => {
      floatingTextsRef.current = floatingTextsRef.current.filter(t => t.id !== newText.id);
      setFloatingTexts(floatingTextsRef.current);
    }, 800);
  };


  // Touch Swiping Refs & Handlers
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    
    const diffX = e.touches[0].clientX - touchStartXRef.current;
    const diffY = e.touches[0].clientY - touchStartYRef.current;

    // Detect horizontal swipe
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        moveRight();
      } else {
        moveLeft();
      }
      // Reset start coordinates to prevent double steering during a single swipe
      touchStartXRef.current = null;
      touchStartYRef.current = null;
    }
  };

  const handleTouchEnd = () => {
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // Keyboard controls
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        selectLane(0); // Move directly to far-left lane
      } else if (e.key === 'ArrowRight') {
        selectLane(2); // Move directly to far-right lane
      } else if (e.key === 'a' || e.key === 'A') {
        moveLeft(); // Single lane change left
      } else if (e.key === 'd' || e.key === 'D') {
        moveRight(); // Single lane change right
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
          let isMoving = obs.isMoving;
          
          // If the car was flashed, it moves to the right lane
          if (isMoving && sideOffset < 1) {
            sideOffset += 0.08 * (deltaTime / 16); // adapt speed of lane change to delta
            if (sideOffset >= 1) {
              sideOffset = 0;
              lane = Math.min(2, obs.lane + 1); // Move to right lane
              isMoving = false; // Finished lane change!
            }
          }

          let y = obs.y;
          let blastAngle = obs.blastAngle || 0;
          if (obs.isBlasted) {
            y = obs.y - 6 * (deltaTime / 16); // fly upwards/backwards fast
            sideOffset = obs.sideOffset + (obs.lane === 0 ? -0.15 : 0.15) * (deltaTime / 16); // fly outward
            blastAngle += 20 * (deltaTime / 16); // spin fast
          } else {
            const speedMult = obs.type === 'police' ? 1.45 : obs.type === 'taxi' ? 1.15 : 1.0;
            const boostMult = isBoostingRef.current ? 1.8 : 1.0;
            y = obs.y + speedRef.current * speedMult * boostMult * (deltaTime / 16);
          }

          return {
            ...obs,
            y,
            lane,
            sideOffset,
            isMoving,
            blastAngle,
          };
        })
        .filter(obs => obs.y < 110 && obs.y > -50 && (!obs.isBlasted || Math.abs(obs.sideOffset) < 3));

      // 2. Move collectibles
      const currentCollectibles = collectiblesRef.current;
      const updatedCollectibles = currentCollectibles
        .map(item => ({
          ...item,
          y: item.y + speedRef.current * (isBoostingRef.current ? 1.8 : 1.0) * (deltaTime / 16),
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
          const rand = Math.random();
          let type: 'sedan' | 'taxi' | 'police' = 'sedan';
          let emoji = '🚗';
          if (rand < 0.15) {
            type = 'police';
            emoji = '🚓';
          } else if (rand < 0.40) {
            type = 'taxi';
            emoji = '🚕';
          }
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
          const rand = Math.random();
          let type: 'mandi' | 'laban' | 'feast' = 'mandi';
          let emoji = '🍚';
          if (rand < 0.10) {
            type = 'feast';
            emoji = '🍱';
          } else if (rand < 0.40) {
            type = 'laban';
            emoji = '🥛';
          }
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
        if (obs.isBlasted) return;
        const obsEffectiveLane = obs.isMoving && obs.sideOffset > 0.3 ? obs.lane + 1 : obs.lane;
        const isSameLane = obsEffectiveLane === playerLaneRef.current;
        if (isSameLane && obs.y > 75 && obs.y < 90) {
          if (isBoostingRef.current) {
            // Laban boost active: RAM the obstacle!
            obs.isBlasted = true;
            obs.blastAngle = 0;
            scoreRef.current += 150;
            setScore(scoreRef.current);
            onScoreChange?.(scoreRef.current);
            addFloatingText('💥 RAM! +150', playerLaneRef.current, 80, 'text-cyan-300');
            playGameSound?.('match');
          } else if (!isInvincibleRef.current) {
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
          let points = 100;
          let label = '+100 MANDI';
          let textColor = 'text-yellow-400';

          if (item.type === 'feast') {
            points = 500;
            label = '🍱 FEAST! +500';
            textColor = 'text-green-400 font-extrabold';
            playGameSound?.('success');
          } else if (item.type === 'laban') {
            points = 200;
            label = '🥛 NISMO BOOST!';
            textColor = 'text-cyan-300 font-black animate-pulse';
            
            // Activate Nismo Warp Speed Boost & Invincibility for 3 seconds
            setIsBoosting(true);
            isBoostingRef.current = true;
            setIsInvincible(true);
            isInvincibleRef.current = true;
            
            setTimeout(() => {
              setIsBoosting(false);
              isBoostingRef.current = false;
              setIsInvincible(false);
              isInvincibleRef.current = false;
            }, 3000);
            
            playGameSound?.('match');
          } else {
            playGameSound?.('match');
          }

          scoreRef.current += points;
          setScore(scoreRef.current);
          onScoreChange?.(scoreRef.current);
          addFloatingText(label, playerLaneRef.current, 75, textColor);
          
          speedRef.current = 1.5 + Math.min(2.5, scoreRef.current / 2000);
          setSpeed(speedRef.current);
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
    isBoostingRef.current = false;

    setScore(0);
    setLives(3);
    setPlayerLane(0);
    setObstacles([]);
    setCollectibles([]);
    setIsInvincible(false);
    setIsBoosting(false);
    setFloatingTexts([]);
    floatingTextsRef.current = [];
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
              ? 'قد بحذر وكشح بالعالي لتفسيح الطريق!'
              : 'Drive carefully and FLASH high beams to clear traffic!'}
          </div>

          {/* Highway Screen */}
          <div 
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`relative w-full max-w-[320px] h-[340px] bg-gray-800 rounded-2xl overflow-hidden border-4 shadow-inner select-none touch-none transition-all duration-300
                       ${isBoosting 
                         ? 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)]' 
                         : 'border-gray-700'}`} 
            dir="ltr"
          >
            {/* Road Lanes */}
            <div className="absolute inset-0 flex z-[5] select-none touch-none">
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
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-[10]">
              <div className="w-full h-[680px] flex flex-col justify-around absolute animate-road" style={{ animationDuration: `${2.5 / (speed * (isBoosting ? 1.8 : 1.0))}s` }}>
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="w-full h-1 flex justify-around opacity-30">
                    <div className="w-1.5 h-6 bg-yellow-500 rounded-full" />
                    <div className="w-1.5 h-6 bg-yellow-500 rounded-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* Warp Speed Streaks */}
            {isBoosting && (
              <div className="absolute inset-0 pointer-events-none z-[12] overflow-hidden">
                <div className="absolute left-[20%] w-[2px] h-16 bg-cyan-400/60 rounded-full animate-roadScrollFast" />
                <div className="absolute left-[50%] w-[2px] h-12 bg-white/70 rounded-full animate-roadScrollFast" style={{ animationDelay: '0.15s' }} />
                <div className="absolute left-[80%] w-[2px] h-20 bg-cyan-400/60 rounded-full animate-roadScrollFast" style={{ animationDelay: '0.05s' }} />
              </div>
            )}

            {/* Render Collectibles */}
            {collectibles.map(item => (
              <div
                key={item.id}
                className="absolute text-3xl transition-all duration-100 flex items-center justify-center pointer-events-none z-[20]"
                style={{
                  left: `${(item.lane * 33.33) + 16.66}%`,
                  top: `${item.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg border backdrop-blur-xs transition-all duration-300
                                ${item.type === 'feast' 
                                  ? 'bg-amber-500/30 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-110' 
                                  : item.type === 'laban'
                                    ? 'bg-cyan-500/30 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.5)] animate-pulse'
                                    : 'bg-black/30 border-yellow-500/20'}`}>
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
                  className="absolute text-4xl transition-all duration-75 flex flex-col items-center pointer-events-none z-[30]"
                  style={{
                    left: `${animatedLeft}%`,
                    top: `${obs.y}%`,
                    transform: `translate(-50%, -50%) rotate(${obs.blastAngle || 0}deg) scale(${obs.isBlasted ? 1.5 : 1})`,
                  }}
                >
                  <span className={`filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] transition-opacity duration-300 ${obs.isBlasted ? 'opacity-70' : 'opacity-100'}`}>
                    {obs.emoji}
                  </span>
                  
                  {/* Flashing Police Siren Lights */}
                  {obs.type === 'police' && !obs.isBlasted && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex gap-0.5 z-[32] pointer-events-none select-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shadow-[0_0_8px_#ef4444]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping shadow-[0_0_8px_#3b82f6]" style={{ animationDelay: '0.15s' }} />
                    </div>
                  )}

                  {/* Blinker if moving right */}
                  {obs.isMoving && !obs.isBlasted && (
                    <span className="absolute -top-1 right-0 text-[10px] text-yellow-400 animate-ping">
                      🧡
                    </span>
                  )}

                  {/* Blasted collision sparks */}
                  {obs.isBlasted && (
                    <span className="absolute inset-0 text-3xl flex items-center justify-center animate-ping select-none">
                      💥
                    </span>
                  )}
                </div>
              );
            })}

            {/* High Beam Flash Ray */}
            {isFlashing && (
              <div
                className="absolute w-[33.33%] h-40 bg-gradient-to-t from-yellow-300/40 via-yellow-200/10 to-transparent pointer-events-none z-[40]"
                style={{
                  left: `${Math.max(0, Math.min(2, playerLane)) * 33.33}%`,
                  bottom: '20%',
                }}
              />
            )}

            {/* Player Car (Nissan Patrol Nismo Vector Representation) */}
            <div
              className={`absolute w-16 h-16 transition-all duration-75 flex items-center justify-center pointer-events-none z-[50]
                         ${isInvincible && !isBoosting ? 'opacity-50 animate-pulse' : 'opacity-100'}`}
              style={{
                left: `${(Math.max(0, Math.min(2, playerLane)) * 33.33) + 16.66}%`,
                bottom: '10%',
                transform: 'translateX(-50%)',
              }}
            >
              <div className={`relative w-14 h-14 rounded-xl border-2 p-1 flex items-center justify-center transition-all duration-300
                              ${isBoosting 
                                ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(34,211,238,0.9)]' 
                                : 'border-red-500 bg-black shadow-[0_0_10px_rgba(239,68,68,0.8)]'}`}
              >
                {renderNismoVector()}
                
                {/* Neon Shield Pulse Overlay */}
                {isBoosting && (
                  <div className="absolute -inset-2 rounded-2xl border-2 border-cyan-400 animate-ping opacity-60 pointer-events-none" />
                )}

                {/* Flashing lights */}
                {isFlashing && (
                  <>
                    <div className="absolute top-4 left-1 w-2.5 h-2.5 rounded-full bg-yellow-300 animate-ping border border-white shadow-[0_0_15px_#fff]" />
                    <div className="absolute top-4 right-1 w-2.5 h-2.5 rounded-full bg-yellow-300 animate-ping border border-white shadow-[0_0_15px_#fff]" />
                  </>
                )}
              </div>
            </div>

            {/* Render Floating Arcade Text Popups */}
            {floatingTexts.map(t => (
              <div
                key={t.id}
                className={`absolute text-sm font-black font-cairo z-[60] pointer-events-none animate-bounce select-none ${t.color} drop-shadow-[0_2px_5px_rgba(0,0,0,0.95)]`}
                style={{
                  left: `${t.x}%`,
                  top: `${t.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {t.text}
              </div>
            ))}
          </div>

          {/* Game Controls - removed left/right steering, added instructions, upgraded flash button */}
          <div className="w-full max-w-[320px] flex flex-col gap-2.5" dir="ltr">
            {/* High Beam Flash Trigger */}
            <button
              onTouchStart={(e) => { e.preventDefault(); flashHighBeam(); }}
              onClick={(e) => { e.preventDefault(); flashHighBeam(); }}
              className={`w-full py-4 rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all duration-100 hover:scale-[1.02] active:scale-95 touch-manipulation select-none border-2
                         ${isFlashing 
                           ? 'bg-yellow-400 text-black border-yellow-300 shadow-[0_0_20px_rgba(250,204,21,0.8)]' 
                           : 'bg-gradient-to-r from-red-600 to-red-500 border-red-500 text-white hover:from-red-500 hover:to-red-600 shadow-[0_4px_15px_rgba(220,38,38,0.25)]'}`}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            >
              <Zap className={`w-4 h-4 ${isFlashing ? 'fill-black text-black animate-bounce' : 'animate-pulse'}`} />
              <span className="text-xs font-bold font-cairo uppercase tracking-wider">
                {language === 'ar' ? 'كبّس بالعالي! 🚨' : 'FLASH HIGH BEAM! 🚨'}
              </span>
            </button>
            
            <div className="text-[10px] text-gray-400 text-center font-cairo animate-pulse tracking-wide font-medium">
              {language === 'ar' ? '👈 اسحب لليمين واليسار للتجاوز 👉' : '👈 Swipe Left or Right to Switch Lanes 👉'}
            </div>
          </div>

          {/* Loop Running Verification Text */}
          <div className="text-[9px] text-gray-600 font-mono select-none">
            Frame: {ticks}
          </div>
        </div>
      )}

      {/* Road animation styles */}
      <style>{`
        @keyframes roadScroll {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        @keyframes roadScrollFast {
          0% { transform: translateY(-150%); }
          100% { transform: translateY(350%); }
        }
        .animate-road {
          animation: roadScroll linear infinite;
        }
        .animate-roadScrollFast {
          animation: roadScrollFast 0.4s linear infinite;
        }
      `}</style>
    </div>
  );
}
