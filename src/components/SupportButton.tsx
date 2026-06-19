import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { X, MessageCircle, MapPin, Headphones } from 'lucide-react';
import { restaurantInfo } from '@/data/menu';

export function SupportButton() {
  const { t, language, currentOrderId } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [showProblemMessage, setShowProblemMessage] = useState(false);

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('open:support', handler);
    return () => window.removeEventListener('open:support', handler);
  }, []);

  const handleProblem = () => {
    setShowProblemMessage(true);
    setTimeout(() => setShowProblemMessage(false), 5000);
  };

  const handleChangeAddress = () => {
    const message = language === 'ar' 
      ? `أهلاً مندي أبو نورة، أريد تعديل عنوان التوصيل لطلبي رقم ${currentOrderId || ''}`
      : `Hello Mandi Abu Noura, I want to change my delivery address for order ${currentOrderId || ''}`;
    window.open(`https://wa.me/${restaurantInfo.phone}?text=${encodeURIComponent(message)}`, '_blank');
    setIsOpen(false);
  };

  const handleContact = () => {
    const message = language === 'ar'
      ? 'أهلاً مندي أبو نورة، لدي استفسار بخصوص طلبي'
      : 'Hello Mandi Abu Noura, I have an inquiry about my order';
    window.open(`https://wa.me/${restaurantInfo.phone}?text=${encodeURIComponent(message)}`, '_blank');
    setIsOpen(false);
  };

  return (
    <>
      {/* Support Modal */}
      {isOpen && (
        <div className="modal-overlay animate-fade-in" onClick={() => setIsOpen(false)}>
          <div 
            className="bg-card rounded-3xl shadow-premium-lg w-full max-w-sm p-6 animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">{t.support}</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Problem with current order */}
              <button
                onClick={handleProblem}
                className="w-full p-4 rounded-xl bg-muted/50 hover:bg-muted 
                           transition-colors flex items-center gap-3 text-right"
              >
                <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive 
                               flex items-center justify-center">
                  ⚠️
                </div>
                <span className="font-medium">{t.currentOrderProblem}</span>
              </button>

              {showProblemMessage && (
                <div className="bg-success/10 text-success p-4 rounded-xl text-center 
                               animate-fade-in space-y-3">
                  <p>{language === 'ar' 
                    ? `جاري ربطك بموظف الدعم الفني.. رقم طلبك هو #${currentOrderId || '1234'}`
                    : `Connecting to support... Order #${currentOrderId || '1234'}`}</p>
                  <button
                    onClick={handleContact}
                    className="btn-secondary px-4 py-2 rounded-lg text-sm"
                  >
                    {t.contactWhatsApp}
                  </button>
                </div>
              )}

              {/* Change address */}
              <button
                onClick={handleChangeAddress}
                className="w-full p-4 rounded-xl bg-muted/50 hover:bg-muted 
                           transition-colors flex items-center gap-3 text-right"
              >
                <div className="w-10 h-10 rounded-full bg-accent/10 text-accent 
                               flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="font-medium">{t.changeAddress}</span>
              </button>

              {/* Contact management */}
              <button
                onClick={handleContact}
                className="w-full p-4 rounded-xl bg-muted/50 hover:bg-muted 
                           transition-colors flex items-center gap-3 text-right"
              >
                <div className="w-10 h-10 rounded-full bg-success/10 text-success 
                               flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="font-medium">{t.contactManagement}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
