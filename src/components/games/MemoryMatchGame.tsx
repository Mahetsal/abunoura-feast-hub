import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Trophy, RotateCcw, Play, Clock } from 'lucide-react';

type SoundType = 'ding' | 'pop' | 'tick' | 'fanfare' | 'flip' | 'match' | 'success';

interface MemoryMatchGameProps {
  isActive: boolean;
  onScoreChange?: (score: number) => void;
  playGameSound?: (sound: SoundType) => void;
}

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

// Only 4 pairs for 8 cards total (2x4 grid)
const foodEmojis = ['🍗', '🍚', '🥙', '🧆'];

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const createCards = (): Card[] => {
  const pairs = foodEmojis.flatMap((emoji, index) => [
    { id: index * 2, emoji, isFlipped: false, isMatched: false },
    { id: index * 2 + 1, emoji, isFlipped: false, isMatched: false },
  ]);
  return shuffleArray(pairs);
};

export function MemoryMatchGame({ isActive, onScoreChange, playGameSound }: MemoryMatchGameProps) {
  const { language, playSound } = useApp();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [bestTime, setBestTime] = useState(() => {
    const saved = localStorage.getItem('memory-match-best-time');
    return saved ? parseInt(saved, 10) : 999;
  });
  const [showInstructions, setShowInstructions] = useState(true);
  const [hasWon, setHasWon] = useState(false);

  // Timer
  useEffect(() => {
    if (!isPlaying || hasWon) return;
    const timer = setInterval(() => setGameTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [isPlaying, hasWon]);

  // Check for match
  useEffect(() => {
    if (flippedCards.length !== 2) return;

    const [firstId, secondId] = flippedCards;
    const firstCard = cards.find(c => c.id === firstId);
    const secondCard = cards.find(c => c.id === secondId);

    if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
      // Match found!
      setTimeout(() => {
        setCards(prev =>
          prev.map(card =>
            card.id === firstId || card.id === secondId
              ? { ...card, isMatched: true }
              : card
          )
        );
        setMatches(prev => prev + 1);
        setFlippedCards([]);
        onScoreChange?.(20);
        playGameSound?.('match');
      }, 300);
    } else {
      // No match, flip back
      setTimeout(() => {
        setCards(prev =>
          prev.map(card =>
            card.id === firstId || card.id === secondId
              ? { ...card, isFlipped: false }
              : card
          )
        );
        setFlippedCards([]);
      }, 1000);
    }
  }, [flippedCards, cards, onScoreChange]);

  // Check win condition
  useEffect(() => {
    if (matches === foodEmojis.length && isPlaying) {
      setHasWon(true);
      setIsPlaying(false);
      playSound('success');
      
      if (gameTime < bestTime) {
        setBestTime(gameTime);
        localStorage.setItem('memory-match-best-time', gameTime.toString());
      }
    }
  }, [matches, isPlaying, gameTime, bestTime, playSound]);

  const flipCard = (cardId: number) => {
    if (!isPlaying || flippedCards.length >= 2) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    setCards(prev =>
      prev.map(c => (c.id === cardId ? { ...c, isFlipped: true } : c))
    );
    setFlippedCards(prev => [...prev, cardId]);
    setMoves(prev => prev + 1);
    playGameSound?.('flip');

  };

  const startGame = () => {
    setShowInstructions(false);
    setCards(createCards());
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameTime(0);
    setIsPlaying(true);
    setHasWon(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isActive) return null;

  return (
    <div className="bg-gradient-to-br from-rose-100 to-red-100 dark:from-rose-900/30 dark:to-red-900/30 rounded-2xl p-4 overflow-hidden border-2 border-rose-300 dark:border-rose-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg text-rose-800 dark:text-rose-200 flex items-center gap-2">
          <span className="text-2xl">🃏</span>
          {language === 'ar' ? 'تطابق الذاكرة' : 'Memory Match'}
        </h3>
        <div className="flex items-center gap-2 bg-rose-500/20 px-3 py-1 rounded-full">
          <Trophy className="w-4 h-4 text-rose-600" />
          <span className="text-sm text-rose-700 dark:text-rose-300 font-bold">
            {bestTime < 999 ? formatTime(bestTime) : '--:--'}
          </span>
        </div>
      </div>

      {/* Stats */}
      {isPlaying && (
        <div className="flex justify-between text-sm mb-3 bg-black/10 dark:bg-white/10 rounded-full px-4 py-2">
          <span className="text-rose-800 dark:text-rose-200 flex items-center gap-1">
            <Clock className="w-4 h-4" /> {formatTime(gameTime)}
          </span>
          <span className="text-rose-800 dark:text-rose-200">
            {matches}/{foodEmojis.length} {language === 'ar' ? 'أزواج' : 'pairs'}
          </span>
          <span className="text-rose-800 dark:text-rose-200">
            {moves} {language === 'ar' ? 'حركة' : 'moves'}
          </span>
        </div>
      )}

      {/* Instructions */}
      {showInstructions && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="text-6xl mb-4">🃏</div>
          <h4 className="text-xl font-bold text-rose-800 dark:text-rose-200 mb-2">
            {language === 'ar' ? 'تطابق الذاكرة' : 'Memory Match'}
          </h4>
          <p className="text-rose-600 dark:text-rose-300 text-sm mb-4 text-center max-w-xs">
            {language === 'ar'
              ? 'اكشف البطاقات وطابق 4 أزواج من الطعام!'
              : 'Flip cards and match 4 food pairs!'}
          </p>
          <button
            onClick={startGame}
            className="bg-rose-500 text-white px-8 py-3 rounded-full font-bold
                       flex items-center gap-2 hover:scale-105 transition-transform shadow-lg"
          >
            <Play className="w-5 h-5" />
            {language === 'ar' ? 'ابدأ اللعب' : 'Start Playing'}
          </button>
        </div>
      )}

      {/* Game Grid - 2x4 layout with larger cards */}
      {!showInstructions && !hasWon && (
        <div className="grid grid-cols-4 gap-3">
          {cards.map(card => (
            <button
              key={card.id}
              onClick={() => flipCard(card.id)}
              disabled={card.isFlipped || card.isMatched || flippedCards.length >= 2}
              className={`aspect-square rounded-2xl text-4xl md:text-5xl font-bold transition-all duration-300
                         min-h-[70px] md:min-h-[90px]
                         ${card.isFlipped || card.isMatched
                           ? 'bg-white dark:bg-gray-800 shadow-inner scale-95'
                           : 'bg-gradient-to-br from-rose-500 to-red-500 hover:scale-105 shadow-lg active:scale-95'
                         }
                         ${card.isMatched ? 'opacity-60 ring-2 ring-green-400' : ''}
                         flex items-center justify-center touch-manipulation`}
              style={{
                transform: card.isFlipped || card.isMatched ? 'rotateY(180deg)' : 'rotateY(0deg)',
                transformStyle: 'preserve-3d',
              }}
            >
              {card.isFlipped || card.isMatched ? (
                <span style={{ transform: 'rotateY(180deg)' }}>{card.emoji}</span>
              ) : (
                <span className="text-white/30 text-3xl">?</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Win Screen */}
      {hasWon && (
        <div className="text-center py-8 animate-scale-in">
          <div className="text-6xl mb-3">🎉</div>
          <h4 className="text-2xl font-bold text-rose-800 dark:text-rose-200 mb-1">
            {language === 'ar' ? 'أحسنت!' : 'Well Done!'}
          </h4>
          <div className="text-rose-600 dark:text-rose-300 mb-4">
            <p className="text-lg font-bold">{formatTime(gameTime)}</p>
            <p className="text-sm">{moves} {language === 'ar' ? 'حركة' : 'moves'}</p>
          </div>
          {gameTime === bestTime && (
            <p className="text-amber-500 font-bold text-sm mb-4">
              🏆 {language === 'ar' ? 'رقم قياسي جديد!' : 'New Record!'}
            </p>
          )}
          <button
            onClick={startGame}
            className="bg-rose-500 text-white px-6 py-2 rounded-full font-bold
                       flex items-center gap-2 mx-auto hover:scale-105 transition-transform"
          >
            <RotateCcw className="w-4 h-4" />
            {language === 'ar' ? 'العب مرة أخرى' : 'Play Again'}
          </button>
        </div>
      )}
    </div>
  );
}
