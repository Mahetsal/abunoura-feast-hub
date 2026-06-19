import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Gamepad2, Volume2, VolumeX } from 'lucide-react';
import { useGameSounds } from '@/hooks/useGameSounds';
import { GameHub } from './games/GameHub';

export function GamesShowcase() {
  const { language } = useApp();
  const [totalScore, setTotalScore] = useState(0);

  return (
    <section className="py-10 md:py-14 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Gamepad2 className="w-7 h-7 text-primary" />
          <h2 className="text-2xl md:text-3xl font-bold text-foreground font-cairo">
            {language === 'ar' ? 'ألعاب أبو نورة التفاعلية' : 'Abu Noura Interactive Games'}
          </h2>
          <span className="text-2xl">🎮</span>
        </div>

        <p className="text-center text-muted-foreground text-sm mb-6 font-cairo max-w-xl mx-auto">
          {language === 'ar'
            ? 'استمتع بألعابنا المصممة بالصوت والتحدي أثناء تصفحك للقائمة!'
            : 'Enjoy our sound-powered challenge games while browsing the menu!'}
        </p>

        {/* Game Hub */}
        <div className="max-w-lg mx-auto">
          <GameHub isActive={true} onScoreChange={setTotalScore} />
        </div>
      </div>
    </section>
  );
}
