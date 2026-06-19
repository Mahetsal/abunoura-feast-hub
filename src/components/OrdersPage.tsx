import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Package, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { menuItems } from '@/data/menu';
import { toast } from 'sonner';

interface OrdersPageProps {
  onTrackingClick?: () => void;
}

export function OrdersPage({ onTrackingClick }: OrdersPageProps) {
  const { language, orderHistory, orderStatus, currentOrderId, addToCart, clearCart } = useApp();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const isAr = language === 'ar';

  const handleReorder = (order: typeof orderHistory[0], e: React.MouseEvent) => {
    e.stopPropagation();
    clearCart();
    order.items.forEach(item => {
      // Find the base item in menu to get current price
      const baseId = item.id.replace(/(-spicy|-normal|-noraisins|-nonuts)+/g, '').split('-note-')[0];
      const menuItem = menuItems.find(m => m.id === baseId);
      if (menuItem) {
        for (let i = 0; i < item.quantity; i++) {
          addToCart({ ...menuItem, id: item.id, note: item.note }); // preserve original customization ID and note
        }
      }
    });
    toast.success(isAr ? '👌 تمت إضافة الأصناف إلى سلة التسوق' : '👌 Items added to cart');
    // Scroll to top to open cart
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background pb-24 pt-4">
      <div className="container mx-auto px-4 max-w-lg">
        <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
          {isAr ? 'طلباتي' : 'My Orders'}
        </h2>

        {/* Active order banner */}
        {orderStatus !== 'idle' && currentOrderId && (
          <div 
            onClick={onTrackingClick}
            className="mb-4 p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-3 cursor-pointer hover:bg-primary/15 transition-all shadow-sm group animate-pulse-glow"
          >
            <Clock className="w-5 h-5 text-primary animate-pulse" />
            <div className="flex-1">
              <p className="font-semibold text-foreground text-sm">
                {isAr ? 'طلب جاري' : 'Active Order'}
              </p>
              <p className="text-xs text-muted-foreground">
                #{currentOrderId} — {isAr ? 'جاري التحضير' : 'In progress'}
              </p>
            </div>
            <span className="text-xs font-semibold text-primary group-hover:translate-x-[-4px] transition-transform rtl:group-hover:translate-x-[4px]">
              {isAr ? 'تتبع الطلب ←' : 'Track Order →'}
            </span>
          </div>
        )}

        {orderHistory.length === 0 && orderStatus === 'idle' ? (
          <div className="text-center py-16 space-y-4">
            <Package className="w-16 h-16 mx-auto text-muted-foreground/30" />
            <p className="text-muted-foreground">
              {isAr ? 'لا توجد طلبات سابقة' : 'No previous orders'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {orderHistory.map(order => {
              const isExpanded = expandedOrderId === order.id;
              return (
                <div
                  key={order.id}
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="p-4 rounded-2xl bg-card border border-border shadow-sm cursor-pointer hover:border-primary/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-foreground">#{order.id.slice(-6)}</span>
                    <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full
                      ${order.status === 'completed' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'}`}>
                      {order.status === 'completed' 
                        ? <><CheckCircle className="w-3 h-3" /> {isAr ? 'مكتمل' : 'Delivered'}</>
                        : <><XCircle className="w-3 h-3" /> {isAr ? 'ملغي' : 'Cancelled'}</>}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{order.date}</p>
                  
                  {isExpanded ? (
                    <div className="mt-3 pt-3 border-t border-border/60 space-y-3 animate-fade-in" onClick={e => e.stopPropagation()}>
                      {/* Items Details */}
                      <div className="space-y-1.5">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs text-foreground/80">
                            <div>
                              <span className="font-semibold text-primary mr-1">{item.quantity}×</span>
                              <span>{language === 'ar' ? item.nameAr : item.nameEn}</span>
                            </div>
                            <span className="font-medium">{(item.price * item.quantity).toFixed(2)} {isAr ? 'ر.س' : 'SAR'}</span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Price breakdown */}
                      <div className="bg-muted/30 rounded-xl p-3 text-xs space-y-1.5 border border-border/40">
                        <div className="flex justify-between text-muted-foreground">
                          <span>{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
                          <span>{order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)} {isAr ? 'ر.س' : 'SAR'}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>{isAr ? 'الضريبة (15%)' : 'VAT (15%)'}</span>
                          <span>{(order.items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 0.15).toFixed(2)} {isAr ? 'ر.س' : 'SAR'}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>{isAr ? 'رسوم التوصيل' : 'Delivery Fee'}</span>
                          <span>10.00 {isAr ? 'ر.س' : 'SAR'}</span>
                        </div>
                        <div className="flex justify-between pt-1.5 border-t border-border/60 font-bold text-foreground">
                          <span>{isAr ? 'الإجمالي الكلي' : 'Grand Total'}</span>
                          <span className="text-primary">{order.total.toFixed(2)} {isAr ? 'ر.س' : 'SAR'}</span>
                        </div>
                      </div>

                      {/* Quick Reorder Button */}
                      {order.status === 'completed' && (
                        <button
                          onClick={(e) => handleReorder(order, e)}
                          className="w-full py-3 rounded-xl bg-primary/10 text-primary border border-primary/20
                                     hover:bg-primary hover:text-primary-foreground transition-all font-semibold text-sm
                                     flex items-center justify-center gap-2 active:scale-95"
                        >
                          <RefreshCw className="w-4 h-4" />
                          {isAr ? 'إعادة الطلب بنقرة' : 'Reorder with one tap'}
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="text-xs text-foreground/80 line-clamp-1">
                        {order.items.map(item => (
                          <span key={item.id} className="inline-block ml-2 rtl:mr-2 rtl:ml-0">
                            {language === 'ar' ? item.nameAr : item.nameEn} ×{item.quantity}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40">
                        <div className="text-sm font-semibold text-primary">
                          {order.total.toFixed(2)} {isAr ? 'ر.س' : 'SAR'}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {isAr ? 'اضغط لعرض التفاصيل' : 'Click to view details'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
