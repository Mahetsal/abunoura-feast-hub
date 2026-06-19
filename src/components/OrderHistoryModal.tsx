import { useApp } from '@/context/AppContext';
import { X, RefreshCw, Receipt, MapPin, CreditCard, Truck } from 'lucide-react';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OrderHistoryModal({ isOpen, onClose }: OrderHistoryModalProps) {
  const { t, language, orderHistory, addToCart, clearCart } = useApp();

  const handleReorder = (order: typeof orderHistory[0]) => {
    clearCart();
    order.items.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        addToCart(item);
      }
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div 
        className="bg-card rounded-3xl shadow-premium-lg w-full max-w-lg max-h-[85vh] 
                   overflow-hidden animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-secondary/10 to-transparent">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-secondary" />
            <h2 className="text-xl font-bold text-foreground">{t.orderHistory}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[70vh] p-4">
          {orderHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-muted-foreground">
                {language === 'ar' ? 'لا توجد طلبات سابقة' : 'No previous orders'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orderHistory.map(order => (
                <div key={order.id} className="bg-muted/30 rounded-2xl overflow-hidden border border-border/50">
                  {/* Order Header */}
                  <div className="bg-secondary/10 p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-foreground text-lg">#{order.id.slice(-6)}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'completed' 
                            ? 'bg-success/10 text-success' 
                            : 'bg-destructive/10 text-destructive'
                        }`}>
                          {order.status === 'completed' ? t.completed : t.cancelled}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(order.date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleReorder(order)}
                      className="btn-secondary px-4 py-2 rounded-xl text-sm flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      {t.reorder}
                    </button>
                  </div>

                  {/* Digital Receipt */}
                  <div className="p-4">
                    {/* Items List */}
                    <div className="space-y-2 mb-4">
                      <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                        <span className="text-lg">🍽️</span>
                        {language === 'ar' ? 'تفاصيل الطلب' : 'Order Details'}
                      </h4>
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm py-1.5 border-b border-dashed border-border/50 last:border-0">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center text-xs font-bold text-secondary">
                              {item.quantity}
                            </span>
                            <span className="text-foreground">{language === 'ar' ? item.nameAr : item.nameEn}</span>
                          </div>
                          <span className="font-medium text-foreground">
                            {(item.price * item.quantity).toFixed(2)} {t.sar}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-card rounded-xl p-3 space-y-2 border border-border/50">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t.subtotal}</span>
                        <span className="text-foreground">
                          {order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)} {t.sar}
                        </span>
                      </div>
                      
                      {/* Show discount if applicable (simulated) */}
                      {order.total < order.items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.15 && (
                        <div className="flex justify-between text-sm text-success">
                          <span>{t.discount}</span>
                          <span>-{((order.items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 0.15)).toFixed(2)} {t.sar}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t.vat} (15%)</span>
                        <span className="text-foreground">
                          {(order.items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 0.15).toFixed(2)} {t.sar}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          {t.deliveryFee}
                        </span>
                        <span className="text-foreground">10.00 {t.sar}</span>
                      </div>
                      
                      <div className="flex justify-between pt-2 border-t border-border">
                        <span className="font-bold text-foreground">{t.grandTotal}</span>
                        <span className="font-bold text-primary text-lg">
                          {order.total.toFixed(2)} {t.sar}
                        </span>
                      </div>
                    </div>

                    {/* Order Meta Info */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-muted text-xs text-muted-foreground">
                        <Truck className="w-3 h-3" />
                        {language === 'ar' ? 'توصيل' : 'Delivery'}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-muted text-xs text-muted-foreground">
                        <CreditCard className="w-3 h-3" />
                        {language === 'ar' ? 'مدى' : 'Mada'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
