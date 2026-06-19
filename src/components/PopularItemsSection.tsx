import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { menuItems, MenuItem } from '@/data/menu';
import { Star, Plus, Minus, Flame } from 'lucide-react';
import { CustomizeItemModal } from './CustomizeItemModal';

// Import all menu images
import chickenMandi from '@/assets/chicken-mandi.jpg';
import pigeonMandi from '@/assets/pigeon-mandi.jpg';
import waleemaFeast from '@/assets/waleema-feast.jpg';
import jareesh from '@/assets/jareesh.jpg';
import kunafa from '@/assets/kunafa.jpg';
import mabouj from '@/assets/mabouj.jpg';
import laban from '@/assets/laban.jpg';
import tabbouleh from '@/assets/tabbouleh.jpg';

const imageMap: Record<string, string> = {
  'chicken-mandi': chickenMandi,
  'pigeon-mandi': pigeonMandi,
  'waleema-feast': waleemaFeast,
  'jareesh': jareesh,
  'kunafa': kunafa,
  'mabouj': mabouj,
  'laban': laban,
  'tabbouleh': tabbouleh,
};

const PORTION_VARIANTS: Record<string, string[]> = {
  'chicken-mandi': ['chicken-mandi', 'half-mandi-rice'],
  'half-mandi-rice': ['chicken-mandi', 'half-mandi-rice'],
  'plain-chicken': ['plain-chicken', 'half-mandi-plain'],
  'half-mandi-plain': ['plain-chicken', 'half-mandi-plain'],
};

// IDs of the most popular items across all categories
const popularItemIds = [
  'chicken-mandi',   // Main dish
  'pigeon-mandi',    // Main dish
  'jareesh',         // Side
  'kunafa',          // Dessert
  'mabouj',          // Sauce
  'laban',           // Drink
  'tabbouleh',       // Salad
];

export function PopularItemsSection() {
  const { language, cart, addToCart, updateQuantity, playSound, t } = useApp();
  const [customizeItem, setCustomizeItem] = useState<MenuItem | null>(null);

  const popularItems = menuItems.filter(item => popularItemIds.includes(item.id));

  const getQty = (id: string) => {
    const variants = PORTION_VARIANTS[id] || [id];
    return cart
      .filter(c => {
        const baseCartId = c.id.replace(/(-spicy|-normal|-noraisins|-nonuts)+/g, '').split('-note-')[0];
        return variants.includes(baseCartId);
      })
      .reduce((sum, c) => sum + c.quantity, 0);
  };

  const handleOpenCustomize = (item: MenuItem) => {
    if (item.category === 'main' || item.category === 'walaem') {
      playSound('pop');
      setCustomizeItem(item);
    } else {
      addToCart(item);
      playSound('success');
    }
  };

  const handleDecrement = (id: string) => {
    const variants = PORTION_VARIANTS[id] || [id];
    const cartItem = cart.find(c => {
      const baseCartId = c.id.replace(/(-spicy|-normal|-noraisins|-nonuts)+/g, '').split('-note-')[0];
      return variants.includes(baseCartId);
    });
    if (cartItem) {
      updateQuantity(cartItem.id, cartItem.quantity - 1);
      playSound('pop');
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, { ar: string; en: string }> = {
      main: { ar: 'طبق رئيسي', en: 'Main' },
      sides: { ar: 'مقبلات', en: 'Sides' },
      salads: { ar: 'سلطة', en: 'Salad' },
      sauces: { ar: 'صوص', en: 'Sauce' },
      desserts: { ar: 'حلى', en: 'Dessert' },
      drinks: { ar: 'مشروب', en: 'Drink' },
    };
    return language === 'ar' ? labels[category]?.ar || category : labels[category]?.en || category;
  };

  return (
    <section className="py-10 md:py-14 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Flame className="w-7 h-7 text-primary animate-pulse" />
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            {language === 'ar' ? 'الأكثر طلباً' : 'Most Popular'}
          </h2>
          <Flame className="w-7 h-7 text-primary animate-pulse" />
        </div>

        {/* Items Grid - Premium Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {popularItems.map((item) => (
            <div
              key={item.id}
              className="food-card group"
            >
              {/* Image with hover zoom */}
              <div className="menu-item-image relative aspect-[4/3] overflow-hidden">
                <img
                  src={imageMap[item.image || ''] || '/placeholder.svg'}
                  alt={language === 'ar' ? item.nameAr : item.nameEn}
                  className="w-full h-full object-cover"
                />
                {/* Daily Deal Badge */}
                {item.isDailyDeal && (
                  <div className="offer-badge absolute top-2 left-2 z-20">
                    {language === 'ar' ? 'عرض اليوم' : 'OFFER'}
                  </div>
                )}
                {/* Category Badge */}
                <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground 
                                text-xs px-2 py-1 rounded-full font-medium z-10">
                  {getCategoryLabel(item.category)}
                </div>
                {/* Best Seller Badge */}
                {item.badge === 'best-seller' && !item.isDailyDeal && (
                  <div className="best-seller-badge absolute bottom-2 left-2 z-10">
                    <Star className="w-3 h-3 fill-current" />
                    {language === 'ar' ? 'الأفضل' : 'Best'}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-3">
                <h3 className="font-bold text-sm text-foreground line-clamp-1 mb-1">
                  {language === 'ar' ? item.nameAr : item.nameEn}
                </h3>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    {item.isDailyDeal && item.originalPrice ? (
                      <>
                        <span className="text-[10px] text-muted-foreground line-through">
                          {item.originalPrice} {t.sar}
                        </span>
                        <span className="food-card-price text-sm offer-price">
                          {item.price} {t.sar}
                        </span>
                      </>
                    ) : (
                      <span className="food-card-price text-sm">
                        {item.price} {t.sar}
                      </span>
                    )}
                  </div>
                  {getQty(item.id) === 0 ? (
                    <button
                      onClick={() => handleOpenCustomize(item)}
                      aria-label={language === 'ar' ? 'أضف' : 'Add'}
                      className="w-8 h-8 rounded-full bg-primary text-primary-foreground
                                 flex items-center justify-center hover:bg-primary/90
                                 transition-all active:scale-95 shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 bg-muted/60 rounded-full p-0.5">
                      <button
                        onClick={() => handleDecrement(item.id)}
                        className="w-7 h-7 rounded-full bg-card text-foreground flex items-center justify-center active:scale-90 shadow-sm"
                        aria-label="Decrease"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold text-sm w-5 text-center">{getQty(item.id)}</span>
                      <button
                        onClick={() => handleOpenCustomize(item)}
                        className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center active:scale-90 shadow-sm"
                        aria-label="Increase"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Limited time label for deals */}
                {item.isDailyDeal && (
                  <span className="text-[9px] text-muted-foreground block mt-1">
                    {language === 'ar' ? 'خصم لفترة محدودة' : 'Limited time'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <CustomizeItemModal baseItem={customizeItem} onClose={() => setCustomizeItem(null)} />
    </section>
  );
}
