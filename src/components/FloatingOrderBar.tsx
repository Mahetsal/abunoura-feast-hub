import { useApp } from '@/context/AppContext';
import { Clock, ChefHat, Bike } from 'lucide-react';

interface FloatingOrderBarProps {
  onClick: () => void;
  timeRemaining: number;
}

export function FloatingOrderBar({ onClick, timeRemaining }: FloatingOrderBarProps) {
  const { language, orderStatus, orderInfo } = useApp();

  // Only show when order is active
  if (orderStatus === 'idle' || orderStatus === 'delivered' || orderStatus === 'ready-for-pickup') {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    switch (orderStatus) {
      case 'confirmed':
        return language === 'ar' ? 'تم تأكيد طلبك' : 'Order Confirmed';
      case 'cooking':
        return language === 'ar' ? 'جاري تحضير طلبك...' : 'Preparing your order...';
      case 'on-the-way':
        return language === 'ar' ? 'طلبك في الطريق!' : 'On the way!';
      default:
        return '';
    }
  };

  const getIcon = () => {
    if (orderStatus === 'on-the-way') {
      return <Bike className="w-5 h-5 animate-bounce" />;
    }
    return <ChefHat className="w-5 h-5" />;
  };

  return (
    <button
      onClick={onClick}
      className="fixed bottom-28 left-4 z-30
                 bg-secondary/95 backdrop-blur-md text-secondary-foreground
                 px-3 py-2 rounded-xl shadow-lg
                 flex items-center gap-2 max-w-[200px]
                 hover:bg-secondary hover:scale-105 transition-all
                 animate-fade-in border border-gold/30"
    >
      {/* Icon */}
      <div className="p-1.5 rounded-full bg-gold/20 text-gold flex-shrink-0">
        {getIcon()}
      </div>

      {/* Status Text */}
      <div className="flex-1 text-start min-w-0">
        <p className="text-xs font-medium text-gold truncate">{getStatusText()}</p>
        <p className="text-[10px] text-secondary-foreground/70 truncate">
          {language === 'ar' ? 'اضغط للتفاصيل' : 'Tap for details'}
        </p>
      </div>

      {/* Timer */}
      {(orderStatus === 'confirmed' || orderStatus === 'cooking') && timeRemaining > 0 && (
        <div className="flex items-center gap-1 bg-gold/20 px-2 py-1 rounded-full flex-shrink-0">
          <Clock className="w-3 h-3 text-gold" />
          <span className="text-xs font-bold text-gold font-mono">
            {formatTime(timeRemaining)}
          </span>
        </div>
      )}
    </button>
  );
}
