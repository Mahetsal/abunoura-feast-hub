import { useApp } from '@/context/AppContext';
import { ShoppingCart, Globe, Volume2, VolumeX, History, Menu } from 'lucide-react';
import logo from '@/assets/logo-new.jpeg';
import { useState } from 'react';

interface HeaderProps {
  onCartClick: () => void;
  onHistoryClick: () => void;
  cartCount: number;
}

export function Header({ onCartClick, onHistoryClick, cartCount }: HeaderProps) {
  const { language, setLanguage, t, soundEnabled, setSoundEnabled } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: language === 'ar' ? 'الرئيسية' : 'Home' },
    { id: 'main', label: language === 'ar' ? 'أطباق رئيسية' : 'Main' },
    { id: 'walaem', label: language === 'ar' ? 'ولائم' : 'Banquets' },
    { id: 'sides', label: language === 'ar' ? 'إيدامات' : 'Sides' },
    { id: 'desserts', label: language === 'ar' ? 'حلويات' : 'Desserts' },
    { id: 'drinks', label: language === 'ar' ? 'مشروبات' : 'Drinks' },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky-header py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo - Clean, Transparent, NO FRAME */}
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="مندي أبو نورة"
              className="h-12 md:h-14 w-auto object-contain animate-logo-float"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.4)) drop-shadow(0 2px 6px rgba(0,0,0,0.2))',
              }}
            />
            <div className="hidden sm:block">
              <h1 className="text-2xl md:text-3xl font-bold text-primary">
                مندي أبو نورة
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                المذاق الأصيل
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="px-3 py-1.5 text-sm font-medium text-foreground/80 
                           hover:text-primary transition-colors rounded-lg 
                           hover:bg-primary/5"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Sound toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-muted-foreground" />
              ) : (
                <VolumeX className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            {/* Language toggle */}
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full 
                         bg-muted hover:bg-muted/80 transition-colors text-sm font-medium"
            >
              <Globe className="w-4 h-4" />
              <span>{t.language}</span>
            </button>

            {/* Order History */}
            <button
              onClick={onHistoryClick}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              title={t.orderHistory}
            >
              <History className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Cart */}
            <button
              onClick={onCartClick}
              className="relative p-2 rounded-full bg-primary text-primary-foreground 
                         hover:bg-primary/90 transition-all duration-200 
                         hover:scale-105 active:scale-95"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full hover:bg-muted transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="lg:hidden mt-3 pt-3 border-t border-border animate-slide-down">
            <div className="flex flex-wrap gap-2">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="px-3 py-1.5 text-sm font-medium text-foreground/80 
                             hover:text-primary transition-colors rounded-full 
                             bg-muted hover:bg-primary/10"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
