import { useApp } from '@/context/AppContext';
import { Palette, Moon, Sun, Leaf, PartyPopper, Flag } from 'lucide-react';

export type SeasonalTheme = 'default' | 'ramadan' | 'national-day' | 'founding-day' | 'flag-day' | 'eid' | 'eid-adha';

interface ThemeSwitcherProps {
  currentTheme: SeasonalTheme;
  onThemeChange: (theme: SeasonalTheme) => void;
}

// SVG Icons for themes
export const ThemeIcons = {
  // Lantern (Fanoos) for Ramadan
  Lantern: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2C11 2 10 3 10 4V5H14V4C14 3 13 2 12 2ZM8 6L6 8V10C6 11 7 12 8 12H16C17 12 18 11 18 10V8L16 6H8ZM7 13V20C7 21 8 22 9 22H15C16 22 17 21 17 20V13H7ZM10 15H14V17H10V15Z"/>
    </svg>
  ),
  // Crescent Moon
  Crescent: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C13.54 21 14.98 20.63 16.27 19.98C12.85 18.81 10.5 15.58 10.5 12C10.5 8.42 12.85 5.19 16.27 4.02C14.98 3.37 13.54 3 12 3Z"/>
    </svg>
  ),
  // Star
  Star: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
    </svg>
  ),
  // Dallah (Coffee Pot) for Eid
  Dallah: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M18 4C18 3 17 2 16 2H14L12 4H8C6 4 4 6 4 8V16C4 18 6 20 8 20H16C18 20 20 18 20 16V8C20 6 18 4 16 4H18ZM16 6V8H8V6H16ZM8 18V10H16V18H8ZM17 5L19 3"/>
    </svg>
  ),
  // Balloon
  Balloon: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2C8.13 2 5 5.13 5 9C5 13.17 8.75 16.75 10.5 18.5L11 19V21H13V19L13.5 18.5C15.25 16.75 19 13.17 19 9C19 5.13 15.87 2 12 2ZM12 4C14.76 4 17 6.24 17 9C17 11.85 14.46 14.55 12 17C9.54 14.55 7 11.85 7 9C7 6.24 9.24 4 12 4Z"/>
    </svg>
  ),
  // Saudi Sword
  Sword: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M6.92 5L5 6.92L12.5 14.43L13.92 13L6.92 5ZM20 3L21 4L19.13 5.88L14.12 10.89L15.53 12.31L20.54 7.3L22.41 5.42L21.41 4.42L22 3.83L20.17 2L19.58 2.59L18.59 1.59L16.71 3.47L17.72 4.47L19 3.19L20 3ZM3.83 22L5.25 20.58L3.42 18.75L2 20.17L3.83 22ZM7.88 17.54L12.5 18L14 17L7 10L6 11.5L6.46 16.12L2.59 20L4 21.41L7.88 17.54Z"/>
    </svg>
  ),
  // Palm Tree
  Palm: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 22V12M12 12C10 10 6 9 4 10C6 8 9 7 12 8C9 7 6 5 4 5C8 5 11 7 12 10M12 12C14 10 18 9 20 10C18 8 15 7 12 8C15 7 18 5 20 5C16 5 13 7 12 10"/>
    </svg>
  ),
  // Hawk/Eagle for Founding Day
  Hawk: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2C10.5 2 9 3.5 9 5C9 6.5 10 7.5 11 8L6 14L8 16L12 11L16 16L18 14L13 8C14 7.5 15 6.5 15 5C15 3.5 13.5 2 12 2ZM12 4C12.55 4 13 4.45 13 5C13 5.55 12.55 6 12 6C11.45 6 11 5.55 11 5C11 4.45 11.45 4 12 4ZM8 18L6 22H18L16 18H8Z"/>
    </svg>
  ),
  // Sheep for Eid Al-Adha
  Sheep: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M18 10C18 8.34 16.66 7 15 7C14.44 7 13.91 7.15 13.45 7.42C13.14 6.02 11.89 5 10.42 5C10.2 5 10 5.03 9.79 5.07C9.57 3.85 8.5 3 7.25 3C5.73 3 4.5 4.23 4.5 5.75C4.5 5.96 4.53 6.16 4.57 6.36C3.08 6.78 2 8.13 2 9.75C2 11.65 3.35 13 5.25 13H6V18C6 19.1 6.9 20 8 20H16C17.1 20 18 19.1 18 18V13H18.5C20.43 13 22 11.43 22 9.5C22 7.57 20.43 6 18.5 6C18.33 6 18.16 6.01 18 6.04V10ZM8 18V13H16V18H8ZM15 12H9V11H15V12Z"/>
    </svg>
  ),
  // Kaaba
  Kaaba: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2L3 7V17L12 22L21 17V7L12 2ZM12 4.5L18 8V16L12 19.5L6 16V8L12 4.5ZM8 9V15H10V9H8ZM14 9V15H16V9H14ZM11 11V13H13V11H11Z"/>
    </svg>
  ),
  // Islamic Geometric Pattern
  GeometricPattern: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2L4 6V18L12 22L20 18V6L12 2ZM12 4L18 7.5V16.5L12 20L6 16.5V7.5L12 4ZM12 6L8 8.5V15.5L12 18L16 15.5V8.5L12 6Z"/>
    </svg>
  ),
  // Saudi Flag
  SaudiFlag: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <rect x="2" y="4" width="20" height="14" rx="1" fill="#006C35"/>
      <text x="12" y="13" textAnchor="middle" fill="white" fontSize="4" fontWeight="bold">لا إله إلا الله</text>
      <path d="M12 15L10 16L12 17L14 16L12 15Z" fill="white"/>
    </svg>
  ),
};

// Theme-specific icons for header display
export const themeHeaderIcons: Record<SeasonalTheme, { icon: string; label: string; svgIcon?: React.ReactNode }> = {
  default: { icon: '🍽️', label: 'مندي أبو نورة' },
  ramadan: { icon: '🏮', label: 'رمضان كريم', svgIcon: <ThemeIcons.Lantern /> },
  'national-day': { icon: '⚔️', label: 'اليوم الوطني', svgIcon: <ThemeIcons.Sword /> },
  'founding-day': { icon: '🦅', label: 'يوم التأسيس', svgIcon: <ThemeIcons.Hawk /> },
  'flag-day': { icon: '🇸🇦', label: 'يوم العلم' },
  eid: { icon: '🎉', label: 'عيد الفطر', svgIcon: <ThemeIcons.Balloon /> },
  'eid-adha': { icon: '🐑', label: 'عيد الأضحى', svgIcon: <ThemeIcons.Sheep /> },
};

// Theme-specific decorative elements with SVG components
export const themeDecorations: Record<SeasonalTheme, string[]> = {
  default: [],
  ramadan: ['🌙', '⭐', '🏮', '✨'],
  'national-day': ['🇸🇦', '⚔️', '🌴', '💚'],
  'founding-day': ['🦅', '🌴', '🏛️', '🐪'],
  'flag-day': ['🇸🇦', '💚', '🤍', '⚔️'],
  eid: ['🎈', '🎊', '🎉', '🎁', '☕'],
  'eid-adha': ['🐑', '🕋', '🌙', '✨', '🎉'],
};

export function ThemeSwitcher({ currentTheme, onThemeChange }: ThemeSwitcherProps) {
  const { language } = useApp();

  const themes: { value: SeasonalTheme; labelAr: string; labelEn: string; icon: React.ReactNode; colors: string; decorEmoji: string; svgIcon?: React.ReactNode }[] = [
    { 
      value: 'default', 
      labelAr: 'الأساسي', 
      labelEn: 'Default',
      icon: <Palette className="w-5 h-5" />,
      colors: 'from-primary to-secondary',
      decorEmoji: '🍽️',
    },
    { 
      value: 'ramadan', 
      labelAr: 'رمضان', 
      labelEn: 'Ramadan',
      icon: <Moon className="w-5 h-5" />,
      colors: 'from-[#1a365d] to-[#D4AF37]',
      decorEmoji: '🏮',
      svgIcon: <ThemeIcons.Lantern />,
    },
    { 
      value: 'eid', 
      labelAr: 'عيد الفطر', 
      labelEn: 'Eid Al-Fitr',
      icon: <PartyPopper className="w-5 h-5" />,
      colors: 'from-[#7C3AED] to-[#D4AF37]',
      decorEmoji: '🎉',
      svgIcon: <ThemeIcons.Balloon />,
    },
    { 
      value: 'eid-adha', 
      labelAr: 'عيد الأضحى', 
      labelEn: 'Eid Al-Adha',
      icon: <Sun className="w-5 h-5" />,
      colors: 'from-[#8B7355] to-[#D4AF37]',
      decorEmoji: '🐑',
      svgIcon: <ThemeIcons.Sheep />,
    },
    { 
      value: 'national-day', 
      labelAr: 'اليوم الوطني', 
      labelEn: 'National Day',
      icon: <Leaf className="w-5 h-5" />,
      colors: 'from-[#006C35] to-[#228B22]',
      decorEmoji: '⚔️',
      svgIcon: <ThemeIcons.Sword />,
    },
    { 
      value: 'founding-day', 
      labelAr: 'يوم التأسيس', 
      labelEn: 'Founding Day',
      icon: <Sun className="w-5 h-5" />,
      colors: 'from-[#5D4E37] to-[#C4A35A]',
      decorEmoji: '🦅',
      svgIcon: <ThemeIcons.Hawk />,
    },
    { 
      value: 'flag-day', 
      labelAr: 'يوم العلم', 
      labelEn: 'Flag Day',
      icon: <Flag className="w-5 h-5" />,
      colors: 'from-[#006C35] to-[#004D25]',
      decorEmoji: '🇸🇦',
    },
  ];

  return (
    <div className="p-4 bg-muted/50 rounded-2xl">
      <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
        <Palette className="w-5 h-5 text-primary" />
        {language === 'ar' ? 'عرض المواسم (للحكام)' : 'Theme Demo (For Judges)'}
      </h4>
      
      <div className="grid grid-cols-2 gap-3">
        {themes.map((theme) => (
          <button
            key={theme.value}
            onClick={() => onThemeChange(theme.value)}
            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2
                       ${currentTheme === theme.value 
                         ? 'border-primary bg-primary/10 shadow-md scale-105' 
                         : 'border-border hover:border-primary/50'}`}
          >
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${theme.colors} 
                            flex items-center justify-center text-white shadow-md relative overflow-hidden`}>
              <span className="text-2xl">{theme.decorEmoji}</span>
            </div>
            <span className="text-sm font-medium">
              {language === 'ar' ? theme.labelAr : theme.labelEn}
            </span>
          </button>
        ))}
      </div>

      {/* Preview text */}
      <p className="text-xs text-muted-foreground text-center mt-4">
        {language === 'ar' 
          ? '💡 كل موسم يغير الألوان والأنماط والأيقونات'
          : '💡 Each theme changes colors, patterns & icons'}
      </p>
    </div>
  );
}

// CSS Variables for each theme (to be applied to :root)
export const themeVariables: Record<SeasonalTheme, Record<string, string>> = {
  default: {
    '--primary': '0 100% 27%',
    '--primary-foreground': '40 40% 98%',
    '--secondary': '20 40% 20%',
    '--secondary-foreground': '40 40% 98%',
    '--accent': '38 92% 50%',
  },
  ramadan: {
    '--primary': '220 60% 23%',
    '--primary-foreground': '40 40% 98%',
    '--secondary': '45 85% 55%',
    '--secondary-foreground': '220 60% 15%',
    '--accent': '45 100% 60%',
  },
  'national-day': {
    '--primary': '145 100% 22%',
    '--primary-foreground': '0 0% 100%',
    '--secondary': '145 80% 28%',
    '--secondary-foreground': '0 0% 100%',
    '--accent': '145 80% 35%',
  },
  'founding-day': {
    '--primary': '30 25% 30%',
    '--primary-foreground': '40 40% 98%',
    '--secondary': '42 50% 55%',
    '--secondary-foreground': '30 25% 15%',
    '--accent': '35 60% 50%',
  },
  'flag-day': {
    '--primary': '145 100% 22%',
    '--primary-foreground': '0 0% 100%',
    '--secondary': '145 100% 18%',
    '--secondary-foreground': '0 0% 100%',
    '--accent': '0 0% 100%',
  },
  'eid': {
    '--primary': '270 60% 40%',
    '--primary-foreground': '0 0% 100%',
    '--secondary': '45 85% 55%',
    '--secondary-foreground': '270 60% 20%',
    '--accent': '45 100% 60%',
  },
  'eid-adha': {
    '--primary': '145 80% 25%', // Deep Green
    '--primary-foreground': '0 0% 100%', // Pure White
    '--secondary': '45 90% 55%', // Royal Gold
    '--secondary-foreground': '145 80% 15%',
    '--accent': '45 100% 50%', // Bright Gold
  },
};

// Theme pattern CSS classes
export const themePatternClasses: Record<SeasonalTheme, string> = {
  default: '',
  ramadan: 'theme-ramadan-pattern',
  'national-day': 'theme-national-day-pattern',
  'founding-day': 'theme-founding-day-pattern',
  'flag-day': 'theme-national-day-pattern',
  eid: 'theme-eid-pattern',
  'eid-adha': 'theme-eid-adha-pattern',
};

// Apply theme function
export function applyTheme(theme: SeasonalTheme) {
  const root = document.documentElement;
  const vars = themeVariables[theme];
  
  // Apply CSS variables
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  
  // Remove all theme pattern classes
  Object.values(themePatternClasses).forEach(cls => {
    if (cls) document.body.classList.remove(cls);
  });
  
  // Add current theme pattern class
  const patternClass = themePatternClasses[theme];
  if (patternClass) {
    document.body.classList.add(patternClass);
  }
}
