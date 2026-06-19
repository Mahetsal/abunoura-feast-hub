import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ChefHat, Clock, Bike, CheckCircle } from 'lucide-react';
import { ensureOrderTimerForStatus, getOrderTimerRemainingSeconds } from '@/lib/orderTimer';

interface TopPreparationBarProps {
  onClick: () => void;
}

export function TopPreparationBar({ onClick }: TopPreparationBarProps) {
  const { language, orderStatus } = useApp();
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (orderStatus === 'idle' || orderStatus === 'delivered' || orderStatus === 'ready-for-pickup') {
      setTimeRemaining(0);
      return;
    }

    ensureOrderTimerForStatus(orderStatus);

    const tick = () => {
      setTimeRemaining(getOrderTimerRemainingSeconds());
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [orderStatus]);

  // Don't render if no active order
  if (orderStatus === 'idle' || orderStatus === 'delivered' || orderStatus === 'ready-for-pickup') {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusInfo = () => {
    switch (orderStatus) {
      case 'confirmed':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          text: language === 'ar' ? 'تم تأكيد الطلب' : 'Order Confirmed',
          color: 'bg-success',
        };
      case 'cooking':
        return {
          icon: <ChefHat className="w-4 h-4" />,
          text: language === 'ar' ? 'جاري التحضير...' : 'Preparing...',
          color: 'bg-primary',
        };
      case 'on-the-way':
        return {
          icon: <Bike className="w-4 h-4 animate-bounce" />,
          text: language === 'ar' ? 'في الطريق!' : 'On the way!',
          color: 'bg-secondary',
        };
      default:
        return {
          icon: <Clock className="w-4 h-4" />,
          text: language === 'ar' ? 'طلب نشط' : 'Active Order',
          color: 'bg-secondary',
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <button
      onClick={onClick}
      className={`fixed top-16 left-0 right-0 z-40 ${statusInfo.color}
                  py-2 px-4 flex items-center justify-center gap-3
                  text-primary-foreground text-sm font-medium
                  shadow-md hover:brightness-110 transition-all cursor-pointer`}
    >
      {/* Status Icon */}
      {statusInfo.icon}

      {/* Status Text */}
      <span>{statusInfo.text}</span>

      {/* Timer */}
      {timeRemaining > 0 && (
        <div className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-full">
          <Clock className="w-3 h-3" />
          <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
        </div>
      )}

      {/* Tap hint */}
      <span className="text-xs opacity-70">
        {language === 'ar' ? '(اضغط للتفاصيل)' : '(Tap for details)'}
      </span>
    </button>
  );
}
