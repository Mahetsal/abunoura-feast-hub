import { useState, useEffect } from 'react';
import logo from '@/assets/logo-new.jpeg';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [showLogo, setShowLogo] = useState(false);
  const [showSlogan, setShowSlogan] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start logo animation after a brief delay
    const logoTimer = setTimeout(() => {
      setShowLogo(true);
      
      // Play subtle whoosh sound
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2JlZyckpGQkI+Oj46NjIuKiYiHhoWEg4KBgH9+fXx7enl4d3Z1dHNycXBvbm1sa2ppaGdmZWRjYmFgX15dXFtaWVhXVlVUU1JRUE9OTUxLSklIR0ZFRENCQUA/Pj08Ozo5ODc2NTQzMjEwLy4tLCsqKSgnJiUkIyIhIB8eHRwbGhkYFxYVFBMSERAPDg0MCwoJCAcGBQQDAgEAAQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs8PT4/QEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaW1xdXl9gYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXp7fH1+f4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch (e) {
        // Silently fail if audio doesn't work
      }
    }, 200);

    // Show slogan after logo appears
    const sloganTimer = setTimeout(() => {
      setShowSlogan(true);
    }, 900);

    // Start fade out
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2700);

    // Complete and remove splash, scroll to top
    const completeTimer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(sloganTimer);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-primary flex flex-col items-center justify-center transition-opacity duration-300 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Background Sadu pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              90deg,
              hsl(var(--gold) / 0.28) 0px,
              hsl(var(--gold) / 0.28) 2px,
              transparent 2px,
              transparent 20px
            ),
            repeating-linear-gradient(
              0deg,
              hsl(var(--primary-foreground) / 0.10) 0px,
              hsl(var(--primary-foreground) / 0.10) 1px,
              transparent 1px,
              transparent 15px
            ),
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 30px,
              hsl(var(--gold) / 0.10) 30px,
              hsl(var(--gold) / 0.10) 32px
            )
          `,
        }}
      />

      {/* Logo - Clean, Transparent, NO FRAME */}
      <div className="relative mb-10">
        <div 
          className={`relative transition-all duration-700 ease-out ${
            showLogo 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-50'
          }`}
        >
          <img 
            src={logo} 
            alt="مندي أبو نورة" 
            className="w-48 h-48 md:w-64 md:h-64 object-contain animate-logo-float"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.6)) drop-shadow(0 0 40px rgba(255,215,0,0.3)) drop-shadow(0 4px 15px rgba(0,0,0,0.3))',
            }}
          />
        </div>
      </div>

      {/* Text Logo */}
      <div className="relative">
        <h1 
          className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-cairo font-bold text-white text-center
                      transition-all duration-700 ease-out ${
            showLogo 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-50'
          }`}
          style={{
            textShadow: '0 4px 30px rgba(0,0,0,0.3), 0 0 40px rgba(255,215,0,0.3)',
          }}
        >
          مندي أبو نورة
        </h1>
      </div>

      {/* Decorative line */}
      <div 
        className={`flex items-center gap-4 mt-6 transition-all duration-500 delay-300 ${
          showLogo ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="h-0.5 w-16 md:w-24 bg-gradient-to-r from-transparent to-[#FFD700]" />
        <div 
          className="w-3 h-3 rotate-45 bg-[#FFD700]"
          style={{
            boxShadow: '0 0 20px #FFD700, 0 0 40px #FFD700',
            animation: 'diamond-pulse 1.5s ease-in-out infinite',
          }}
        />
        <div className="h-0.5 w-16 md:w-24 bg-gradient-to-l from-transparent to-[#FFD700]" />
      </div>

      {/* Slogan */}
      <p 
        className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-cairo font-bold text-[#FFD700] text-center
                    mt-8 transition-all duration-700 ease-out ${
          showSlogan 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-4'
        }`}
        style={{
          textShadow: '0 2px 20px rgba(0,0,0,0.4), 0 0 30px rgba(255,215,0,0.4)',
        }}
      >
        للوليمة أصول، وللكرم عنوان
      </p>
    </div>
  );
}
