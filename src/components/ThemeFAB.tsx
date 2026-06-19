import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Palette, X, Moon, Flag, Sparkles, PartyPopper, Landmark, Sun } from 'lucide-react';
import { SeasonalTheme } from './ThemeSwitcher';

// Custom SVG Icons for themes
const SheepIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M18 10C18 8.34 16.66 7 15 7C14.44 7 13.91 7.15 13.45 7.42C13.14 6.02 11.89 5 10.42 5C10.2 5 10 5.03 9.79 5.07C9.57 3.85 8.5 3 7.25 3C5.73 3 4.5 4.23 4.5 5.75C4.5 5.96 4.53 6.16 4.57 6.36C3.08 6.78 2 8.13 2 9.75C2 11.65 3.35 13 5.25 13H6V18C6 19.1 6.9 20 8 20H16C17.1 20 18 19.1 18 18V13H18.5C20.43 13 22 11.43 22 9.5C22 7.57 20.43 6 18.5 6C18.33 6 18.16 6.01 18 6.04V10ZM8 18V13H16V18H8Z"/>
  </svg>
);

const KaabaIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2L3 7V17L12 22L21 17V7L12 2ZM12 4.5L18 8V16L12 19.5L6 16V8L12 4.5ZM11 10V14H13V10H11Z"/>
  </svg>
);

export function ThemeFAB() {
  const { language, seasonalTheme, setSeasonalTheme } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const themes: { 
    value: SeasonalTheme; 
    labelAr: string; 
    labelEn: string; 
    icon: React.ReactNode; 
    gradient: string;
    description: string;
  }[] = [
    { 
      value: 'default', 
      labelAr: 'الأساسي', 
      labelEn: 'Default',
      icon: <Palette className="w-5 h-5" />,
      gradient: 'from-primary to-secondary',
      description: language === 'ar' ? 'الوضع الافتراضي' : 'Default mode',
    },
    { 
      value: 'ramadan', 
      labelAr: 'رمضان كريم', 
      labelEn: 'Ramadan Kareem',
      icon: <Moon className="w-5 h-5" />,
      gradient: 'from-[#1a365d] to-[#D4AF37]',
      description: language === 'ar' ? '🌙 شهر البركة' : '🌙 Month of Blessings',
    },
    { 
      value: 'eid' as SeasonalTheme, 
      labelAr: 'عيد الفطر', 
      labelEn: 'Eid Al-Fitr',
      icon: <PartyPopper className="w-5 h-5" />,
      gradient: 'from-[#7C3AED] to-[#D4AF37]',
      description: language === 'ar' ? '🎈 عيد مبارك' : '🎈 Eid Mubarak',
    },
    { 
      value: 'eid-adha' as SeasonalTheme, 
      labelAr: 'عيد الأضحى', 
      labelEn: 'Eid Al-Adha',
      icon: <SheepIcon />,
      gradient: 'from-[#F5F5DC] via-[#D4AF37] to-[#006C35]',
      description: language === 'ar' ? '🐑 عيد الأضحى المبارك' : '🐑 Blessed Eid Al-Adha',
    },
    { 
      value: 'national-day', 
      labelAr: 'اليوم الوطني', 
      labelEn: 'National Day',
      icon: <Flag className="w-5 h-5" />,
      gradient: 'from-[#006C35] to-[#228B22]',
      description: language === 'ar' ? '🇸🇦 23 سبتمبر' : '🇸🇦 September 23',
    },
    { 
      value: 'founding-day', 
      labelAr: 'يوم التأسيس', 
      labelEn: 'Founding Day',
      icon: <Landmark className="w-5 h-5" />,
      gradient: 'from-[#5D4E37] to-[#C4A35A]',
      description: language === 'ar' ? '🦅 22 فبراير' : '🦅 February 22',
    },
    { 
      value: 'flag-day' as SeasonalTheme, 
      labelAr: 'يوم العلم', 
      labelEn: 'Flag Day',
      icon: <Flag className="w-5 h-5" />,
      gradient: 'from-[#006C35] to-[#004D25]',
      description: language === 'ar' ? '🏴 11 مارس' : '🏴 March 11',
    },
  ];

  const handleThemeChange = (theme: SeasonalTheme) => {
    setSeasonalTheme(theme);
    setIsOpen(false);
  };

  return (
    <>
      {/* FAB Button - Top Left */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-20 left-4 z-50 p-3 rounded-full bg-secondary/90 backdrop-blur-sm
                   shadow-lg hover:bg-secondary transition-all hover:scale-105 text-secondary-foreground"
        title={language === 'ar' ? 'تغيير المظهر' : 'Change Theme'}
      >
        <Sparkles className="w-5 h-5 text-gold" />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-card rounded-3xl shadow-premium-lg w-full max-w-md overflow-hidden animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-secondary text-secondary-foreground p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gold/20">
                  <Palette className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    {language === 'ar' ? 'مظهر التطبيق' : 'App Mood'}
                  </h3>
                  <p className="text-sm opacity-80">
                    {language === 'ar' ? 'اختر المناسبة' : 'Choose the occasion'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-secondary-foreground/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Theme Options */}
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {themes.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => handleThemeChange(theme.value)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4
                             ${seasonalTheme === theme.value 
                               ? 'border-primary bg-primary/10 shadow-md' 
                               : 'border-border hover:border-primary/50 hover:bg-muted/50'}`}
                >
                  {/* Theme Icon with Gradient */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${theme.gradient} 
                                  flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                    {theme.icon}
                  </div>
                  
                  {/* Theme Info */}
                  <div className="flex-1 text-start">
                    <div className="font-bold text-foreground">
                      {language === 'ar' ? theme.labelAr : theme.labelEn}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {theme.description}
                    </div>
                  </div>

                  {/* Selected Indicator */}
                  {seasonalTheme === theme.value && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-foreground text-xs">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-muted/30">
              <p className="text-xs text-muted-foreground text-center">
                {language === 'ar' 
                  ? '💡 يتغير مظهر التطبيق بالكامل حسب المناسبة'
                  : '💡 The entire app theme changes based on the occasion'}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
