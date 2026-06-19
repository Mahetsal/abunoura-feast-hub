import { useApp } from '@/context/AppContext';
import { X, Plus, Minus, Trash2, Clock } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export function CartDrawer({ isOpen, onClose, onCheckout }: CartDrawerProps) {
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    subtotal,
    vatAmount,
    deliveryFee,
    discountAmount,
    grandTotal,
    hasDiscount,
    t,
    language,
    orderInfo,
  } = useApp();

  if (!isOpen) return null;

  const handleCheckout = () => {
    if (cart.length > 0) {
      onCheckout();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[110] animate-fade-in"
        onClick={onClose}
      />
      
      {/* Drawer - z above bottom nav so checkout button isn't hidden */}
      <div className={`fixed top-0 ${language === 'ar' ? 'left-0' : 'right-0'} 
                      h-full w-full max-w-md bg-card shadow-2xl z-[120] 
                      animate-slide-up flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">{t.cart}</h2>
          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="p-2 text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                title="Clear cart"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-muted-foreground">
                {language === 'ar' ? 'السلة فارغة' : 'Your cart is empty'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex gap-3 p-3 bg-muted/50 rounded-xl">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {language === 'ar' ? item.nameAr : item.nameEn}
                    </h3>
                    {item.note && (
                      <p className="text-xs text-muted-foreground bg-muted/80 px-2 py-1 rounded-lg mt-1 inline-block border border-border/50">
                        📝 {item.note}
                      </p>
                    )}
                    <p className="text-sm text-primary font-medium mt-1">
                      {item.price.toFixed(2)} {t.sar}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="qty-btn qty-btn-secondary w-8 h-8"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="qty-btn qty-btn-primary w-8 h-8"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-destructive hover:bg-destructive/10 
                               rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {cart.length > 0 && (
          <div className="p-4 pb-8 border-t border-border bg-muted/30 sticky bottom-0">
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.subtotal}</span>
                <span className="font-medium">{subtotal.toFixed(2)} {t.sar}</span>
              </div>
              
              {hasDiscount && discountAmount > 0 && (
                <div className="flex justify-between text-success">
                  <span>{t.discount}</span>
                  <span className="font-medium">-{discountAmount.toFixed(2)} {t.sar}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.vat}</span>
                <span className="font-medium">{vatAmount.toFixed(2)} {t.sar}</span>
              </div>
              
              {orderInfo.deliveryMethod === 'delivery' && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.deliveryFee}</span>
                  <span className="font-medium">{deliveryFee.toFixed(2)} {t.sar}</span>
                </div>
              )}
              
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                <span>{t.grandTotal}</span>
                <span className="text-primary">{grandTotal.toFixed(2)} {t.sar}</span>
              </div>
            </div>

            {/* ETA Badge */}
            <div className="flex items-center justify-center gap-2 bg-primary/5 border border-primary/20 rounded-xl py-2 mb-3">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {language === 'ar'
                  ? (orderInfo.deliveryMethod === 'pickup' ? 'جاهز خلال 20  —  30 دقيقة' : 'التوصيل خلال 45  —  60 دقيقة')
                  : (orderInfo.deliveryMethod === 'pickup' ? 'Ready in 20 — 30 min' : 'Delivery in 45 — 60 min')}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full btn-secondary py-4 rounded-xl font-bold text-lg"
            >
              {t.checkout}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
