import { useApp } from '@/context/AppContext';
import { Sparkles, Palette } from 'lucide-react';
import { SeasonalTheme } from './ThemeSwitcher';

const themes: {
  value: SeasonalTheme;
  labelAr: string;
  labelEn: string;
  emoji: string;
  gradient: string;
}[] = [
  { value: 'default', labelAr: 'الأساسي', labelEn: 'Default', emoji: '🍽️', gradient: 'from-primary to-secondary' },
  { value: 'ramadan', labelAr: 'رمضان كريم', labelEn: 'Ramadan', emoji: '🌙', gradient: 'from-[#1a365d] to-[#D4AF37]' },
  { value: 'eid', labelAr: 'عيد الفطر', labelEn: 'Eid Al-Fitr', emoji: '🎈', gradient: 'from-[#7C3AED] to-[#D4AF37]' },
  { value: 'eid-adha', labelAr: 'عيد الأضحى', labelEn: 'Eid Al-Adha', emoji: '🐑', gradient: 'from-[#006C35] to-[#D4AF37]' },
  { value: 'national-day', labelAr: 'اليوم الوطني', labelEn: 'National Day', emoji: '🇸🇦', gradient: 'from-[#006C35] to-[#228B22]' },
  { value: 'founding-day', labelAr: 'يوم التأسيس', labelEn: 'Founding Day', emoji: '🦅', gradient: 'from-[#5D4E37] to-[#C4A35A]' },
  { value: 'flag-day', labelAr: 'يوم العلم', labelEn: 'Flag Day', emoji: '🏴', gradient: 'from-[#006C35] to-[#004D25]' },
];

export function ThemeShowcase() {
  const { language, seasonalTheme, setSeasonalTheme } = useApp();

  return (
    <section className="py-6 md:py-8">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-accent" />
          <h2 className="text-lg md:text-xl font-bold text-foreground font-cairo text-center">
            {language === 'ar'
              ? 'استعراض التحول التلقائي (هذه الأزرار لتجربة المناسبات يدوياً في هذه النسخة)'
              : 'Auto-Theme Preview (These buttons let you try occasions manually in this version)'}
          </h2>
          <Palette className="w-5 h-5 text-accent" />
        </div>

        {/* Horizontal scrolling row */}
        <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-2 px-1 snap-x snap-mandatory">
          {themes.map((theme) => (
            <button
              key={theme.value}
              onClick={() => setSeasonalTheme(theme.value)}
              className={`flex-shrink-0 snap-center flex items-center gap-2 px-4 py-2.5 rounded-full border-2 transition-all duration-200
                         hover:scale-105 active:scale-95
                         ${seasonalTheme === theme.value
                           ? 'border-primary bg-primary/10 shadow-md'
                           : 'border-border hover:border-primary/40 bg-card'}`}
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${theme.gradient}
                              flex items-center justify-center shadow-sm`}>
                <span className="text-base">{theme.emoji}</span>
              </div>
              <span className="text-xs font-bold text-foreground whitespace-nowrap font-cairo">
                {language === 'ar' ? theme.labelAr : theme.labelEn}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
