import heroImage from '@/assets/hero-mandi.jpg';
import { useApp } from '@/context/AppContext';

export function HeroSection() {
  const { language } = useApp();

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative h-auto min-h-[400px] md:min-h-[450px] w-full">
        <img
          src={heroImage}
          alt={language === 'ar' ? 'مندي دجاج سعودي فاخر' : 'Luxury Saudi Chicken Mandi'}
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Dark overlays */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/95 via-black/70 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center px-4 py-14 md:py-20 text-center">
          {/* Brand Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-cairo font-bold text-white leading-tight tracking-tight mb-4
                         [text-shadow:_0_4px_20px_rgba(0,0,0,0.7),_0_2px_8px_rgba(0,0,0,0.5)]">
            مندي أبو نورة
          </h1>

          {/* Gold Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="h-0.5 w-16 md:w-28 bg-gradient-to-r from-transparent to-brand-gold" />
            <div className="w-3 h-3 rotate-45 bg-brand-gold shadow-[0_0_15px_hsl(var(--gold)/0.9)]" />
            <div className="h-0.5 w-16 md:w-28 bg-gradient-to-l from-transparent to-brand-gold" />
          </div>

          {/* Description Paragraph */}
          <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-3xl leading-relaxed font-cairo mb-8
                        [text-shadow:_0_2px_10px_rgba(0,0,0,0.6)]">
            {language === 'ar'
              ? 'مرحباً بكم في منصة أبو نورة! ندمج الكرم بالابتكار من خلال نظام الهوية الذكية الذي يغير واجهة التطبيق تلقائياً لتواكب مناسباتنا الوطنية والدينية. المنيو التفاعلي مصمم بالذكاء الاصطناعي لضمان تجربة طلب سلسة.'
              : 'Welcome to Abu Noura! We blend generosity with innovation through a smart identity system that automatically adapts the app to match our national and religious occasions. The interactive menu is AI-designed for a seamless ordering experience.'}
          </p>

          {/* AI Quick Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open:scanner'))}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold
                         hover:from-emerald-600 hover:to-green-700 hover:scale-105 active:scale-95 transition-all
                         shadow-[0_4px_20px_rgba(16,185,129,0.4)] flex items-center gap-2"
            >
              <span className="text-xl">📸</span>
              <span>{language === 'ar' ? 'ماسح السعرات بالذكاء الاصطناعي' : 'AI Calorie Scanner'}</span>
            </button>

            {/* ETA Pill */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/25
                            px-4 py-3 rounded-2xl text-white font-semibold shadow-md">
              <span className="text-lg">⏱️</span>
              <span className="text-sm">{language === 'ar' ? 'توصيل خلال 45  —  60 دق' : 'Delivery in 45 — 60 min'}</span>
            </div>
          </div>

          {/* Goals Row */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {[
              { emoji: '⏱️', ar: 'كفاءة السرعة', en: 'Speed Efficiency' },
              { emoji: '🍚', ar: 'استدامة وتقليل هدر', en: 'Sustainability & Less Waste' },
              { emoji: '❤️', ar: 'أولوية رضا الزبون', en: 'Customer Satisfaction First' },
            ].map((goal, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 
                           px-4 py-2.5 rounded-full text-white text-sm font-cairo font-semibold
                           hover:bg-white/20 transition-colors duration-300"
              >
                <span className="text-lg">{goal.emoji}</span>
                <span>{language === 'ar' ? goal.ar : goal.en}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </div>
    </section>
  );
}
