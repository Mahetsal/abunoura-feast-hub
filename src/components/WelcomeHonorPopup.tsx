import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Sparkles, Gift, Crown } from 'lucide-react';
import { menuItems } from '@/data/menu';

interface WelcomeHonorPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeHonorPopup({ isOpen, onClose }: WelcomeHonorPopupProps) {
  const { language, addToCart, playSound } = useApp();
  const [showContent, setShowContent] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShowContent(true), 200);
      playSound('success');
    } else {
      setShowContent(false);
      setAccepted(false);
    }
  }, [isOpen, playSound]);

  const handleStartFeast = () => {
    // Find a dessert to add as complimentary
    const desserts = menuItems.filter(item => item.category === 'desserts');
    const complimentaryDessert = desserts[0] || menuItems.find(item => item.nameAr.includes('محلبية'));
    
    if (complimentaryDessert) {
      // Add modified item with 0 price
      const freeItem = {
        ...complimentaryDessert,
        id: `comp-${complimentaryDessert.id}`,
        price: 0,
        nameAr: `🎁 ${complimentaryDessert.nameAr} (هدية)`,
        nameEn: `🎁 ${complimentaryDessert.nameEn} (Gift)`,
      };
      addToCart(freeItem);
    }
    
    setAccepted(true);
    playSound('ding');
    
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade-in z-[200]">
      <div 
        className={`relative bg-gradient-to-br from-[hsl(var(--gold))] via-[hsl(var(--gold-cream))] to-[hsl(var(--gold))] 
                    rounded-3xl shadow-2xl w-full max-w-md overflow-hidden
                    transition-all duration-500 ${showContent ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 p-2 rounded-full bg-white/20 
                     hover:bg-white/40 transition-colors text-secondary"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="relative p-8 text-center">
          {/* Crown icon with breathing pulse */}
          <div className="relative inline-block mb-4">
            <div 
              className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mx-auto shadow-lg"
              style={{ animation: 'breathing-pulse 2.5s ease-in-out infinite' }}
            >
              <Crown className="w-12 h-12 text-[hsl(var(--gold))]" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-white animate-bounce" />
            <Sparkles className="absolute -bottom-2 -left-2 w-6 h-6 text-white animate-bounce delay-150" />
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-secondary mb-2">
            {language === 'ar' ? 'يا هلا!' : 'Welcome!'}
          </h2>
          
          <p className="text-secondary/90 text-lg mb-2 font-semibold">
            {language === 'ar' 
              ? 'أنت ضيف الشرف!'
              : 'You are our Guest of Honor!'}
          </p>

          {/* Gift box */}
          <div className="bg-white/80 rounded-2xl p-5 mb-6 shadow-inner">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Gift className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold text-primary">
                {language === 'ar' ? 'هديتك الحصرية' : 'Your Exclusive Gift'}
              </span>
            </div>
            <div className="text-secondary font-medium text-lg">
              {language === 'ar' 
                ? '🍮 حلى مجاني + خصم 15%'
                : '🍮 Free Dessert + 15% Discount'}
            </div>
            <div className="mt-3 inline-block bg-secondary/10 px-4 py-2 rounded-full">
              <span className="text-sm text-secondary font-mono font-bold">
                {language === 'ar' ? 'الكود: FIRST' : 'Code: FIRST'}
              </span>
            </div>
          </div>

          {/* Action button */}
          {!accepted ? (
            <button
              onClick={handleStartFeast}
              className="w-full py-4 rounded-2xl bg-secondary text-secondary-foreground font-bold text-lg
                         hover:bg-secondary/90 transition-all hover:scale-105 shadow-lg
                         flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              {language === 'ar' ? 'ابدأ الوليمة!' : 'Start Feast!'}
            </button>
          ) : (
            <div className="py-4 text-secondary font-bold text-lg flex items-center justify-center gap-2 animate-scale-in">
              <span className="text-2xl">✨</span>
              {language === 'ar' ? 'تمت الإضافة للسلة!' : 'Added to cart!'}
            </div>
          )}
        </div>

        {/* Sadu pattern border */}
        <div 
          className="h-4 w-full"
          style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              hsl(var(--secondary)) 0px,
              hsl(var(--secondary)) 8px,
              hsl(var(--gold)) 8px,
              hsl(var(--gold)) 16px,
              hsl(var(--primary)) 16px,
              hsl(var(--primary)) 24px
            )`,
          }}
        />
      </div>
    </div>
  );
}
