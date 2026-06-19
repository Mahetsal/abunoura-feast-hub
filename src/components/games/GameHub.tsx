import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Gamepad2, ChefHat, RotateCcw, Grid3X3, ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { useGameSounds } from '@/hooks/useGameSounds';
import { EmojiChefGame } from './EmojiChefGame';
import { SpinWheelGame } from './SpinWheelGame';
import { MemoryMatchGame } from './MemoryMatchGame';
import { AlJathoomGame } from './AlJathoomGame';

interface GameHubProps {
  isActive: boolean;
  onScoreChange?: (score: number) => void;
}

type GameType = 'menu' | 'emoji-chef' | 'spin-wheel' | 'memory-match' | 'al-jathoom';

const games = [
  {
    id: 'emoji-chef' as const,
    emoji: '👨‍🍳',
    nameAr: 'الشيف الإيموجي',
    nameEn: 'Emoji Chef',
    descAr: 'التقط الدجاج والأرز! لعبة كلاسيكية سريعة',
    descEn: 'Catch chicken & rice! Classic fast game',
    bgGradient: 'from-amber-500 to-orange-600',
  },
  {
    id: 'spin-wheel' as const,
    emoji: '🎡',
    nameAr: 'العجلة الذهبية',
    nameEn: 'Golden Wheel',
    descAr: 'أدر العجلة واربح خصومات!',
    descEn: 'Spin to win discounts!',
    bgGradient: 'from-yellow-500 to-amber-600',
  },
  {
    id: 'memory-match' as const,
    emoji: '🃏',
    nameAr: 'تطابق الذاكرة',
    nameEn: 'Memory Match',
    descAr: 'اكشف البطاقات وطابق الأطعمة!',
    descEn: 'Flip cards & match foods!',
    bgGradient: 'from-rose-500 to-red-600',
  },
  {
    id: 'al-jathoom' as const,
    emoji: '🚘',
    nameAr: 'الجاثوم: ملك الخط',
    nameEn: 'Al-Jathoom: Highway King',
    descAr: 'تكشيح عالي وسرعة تفادياً للزحام!',
    descEn: 'Steer and flash beams to clear highway!',
    bgGradient: 'from-red-600 via-gray-900 to-gray-800',
  },
];

export function GameHub({ isActive, onScoreChange }: GameHubProps) {
  const { language } = useApp();
  const [currentGame, setCurrentGame] = useState<GameType>('menu');
  const [totalScore, setTotalScore] = useState(0);
  const { playGameSound, isMuted, toggleMute } = useGameSounds();

  const handleScoreChange = (score: number) => {
    setTotalScore(prev => prev + score);
    onScoreChange?.(totalScore + score);
  };

  const goBack = () => setCurrentGame('menu');

  if (!isActive) return null;

  // Render selected game
  if (currentGame === 'emoji-chef') {
    return (
      <div className="relative">
        <button
          onClick={goBack}
          className="absolute -top-2 right-0 z-30 bg-primary/90 text-primary-foreground p-2 rounded-full 
                     hover:bg-primary transition-colors shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <EmojiChefGame isActive={true} onScoreChange={handleScoreChange} playGameSound={playGameSound} />
      </div>
    );
  }

  if (currentGame === 'spin-wheel') {
    return (
      <div className="relative">
        <button
          onClick={goBack}
          className="absolute -top-2 right-0 z-30 bg-primary/90 text-primary-foreground p-2 rounded-full 
                     hover:bg-primary transition-colors shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <SpinWheelGame isActive={true} onScoreChange={handleScoreChange} playGameSound={playGameSound} />
      </div>
    );
  }

  if (currentGame === 'memory-match') {
    return (
      <div className="relative">
        <button
          onClick={goBack}
          className="absolute -top-2 right-0 z-30 bg-primary/90 text-primary-foreground p-2 rounded-full 
                     hover:bg-primary transition-colors shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <MemoryMatchGame isActive={true} onScoreChange={handleScoreChange} playGameSound={playGameSound} />
      </div>
    );
  }

  if (currentGame === 'al-jathoom') {
    return (
      <div className="relative">
        <button
          onClick={goBack}
          className="absolute -top-2 right-0 z-30 bg-primary/90 text-primary-foreground p-2 rounded-full 
                     hover:bg-primary transition-colors shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <AlJathoomGame isActive={true} onScoreChange={handleScoreChange} playGameSound={playGameSound} />
      </div>
    );
  }

  // Game Selection Menu
  return (
    <div className="bg-gradient-to-br from-primary/10 via-secondary/20 to-accent/10 rounded-2xl p-4 border-2 border-primary/20">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Gamepad2 className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold text-foreground">
            {language === 'ar' ? 'ألعاب أبو نورة' : 'Abu Noura Games'}
          </h3>
          <button
            onClick={toggleMute}
            className="p-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-muted-foreground" /> : <Volume2 className="w-4 h-4 text-primary" />}
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          {language === 'ar' ? 'اختر لعبتك المفضلة!' : 'Choose your favorite game!'}
        </p>
      </div>

      {/* Game Cards */}
      <div className="grid gap-3">
        {games.map((game) => (
          <button
            key={game.id}
            onClick={() => setCurrentGame(game.id)}
            className={`relative overflow-hidden rounded-xl p-4 text-white
                       bg-gradient-to-r ${game.bgGradient}
                       hover:scale-[1.02] active:scale-[0.98] transition-all duration-200
                       shadow-lg hover:shadow-xl group`}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-2 right-2 text-4xl">{game.emoji}</div>
              <div className="absolute bottom-2 left-2 text-2xl opacity-50">{game.emoji}</div>
            </div>

            <div className="relative flex items-center gap-4">
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center
                            group-hover:scale-110 transition-transform">
                <span className="text-3xl">{game.emoji}</span>
              </div>

              {/* Text */}
              <div className="text-start flex-1">
                <h4 className="font-bold text-lg">
                  {language === 'ar' ? game.nameAr : game.nameEn}
                </h4>
                <p className="text-white/80 text-sm">
                  {language === 'ar' ? game.descAr : game.descEn}
                </p>
              </div>

              {/* Arrow */}
              <div className="text-2xl group-hover:translate-x-1 transition-transform">
                {language === 'ar' ? '←' : '→'}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Total Score */}
      {totalScore > 0 && (
        <div className="mt-4 text-center bg-primary/10 rounded-full py-2 px-4">
          <span className="text-sm text-muted-foreground">
            {language === 'ar' ? 'مجموع النقاط:' : 'Total Score:'}
          </span>
          <span className="font-bold text-primary mr-2 ml-2">{totalScore}</span>
        </div>
      )}
    </div>
  );
}
