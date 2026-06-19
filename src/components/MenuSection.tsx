import { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { categories, menuItems, MenuItem } from '@/data/menu';
import { Plus, Minus, ChevronLeft, ChevronRight, Flame, Star, Heart, Search, X as XIcon } from 'lucide-react';
import { CustomizeItemModal } from './CustomizeItemModal';

// Import all AI-generated images
import chickenMandiImg from '@/assets/chicken-mandi.jpg';
import pigeonMandiImg from '@/assets/pigeon-mandi.jpg';
import waleeaFeastImg from '@/assets/waleema-feast.jpg';
import saladsImg from '@/assets/salads.jpeg';
// Individual dessert images
import mahalabiaImg from '@/assets/mahalabia.jpg';
import creamCaramelImg from '@/assets/cream-caramel.jpg';
import umAliImg from '@/assets/um-ali.jpg';
import kunafaImg from '@/assets/kunafa.jpg';
// Individual sauce images
import tahiniImg from '@/assets/tahini.jpg';
import maboujImg from '@/assets/mabouj.jpg';
import daqqusImg from '@/assets/daqqus.jpg';
import spicySaladImg from '@/assets/spicy-salad.jpg';
// Individual sides
import jareeshImg from '@/assets/jareesh.jpg';
import qursanImg from '@/assets/qursan.jpg';
import plainChickenImg from '@/assets/plain-chicken.jpg';
import halfChickenRiceImg from '@/assets/half-chicken-rice.jpg';
import halfChickenPlainImg from '@/assets/half-chicken-plain.jpg';
import plainRiceImg from '@/assets/plain-rice.jpg';
import mandiRiceImg from '@/assets/mandi-rice.jpg';
// Individual drinks
import colaImg from '@/assets/cola.jpg';
import pepsiImg from '@/assets/pepsi.jpg';
import waterImg from '@/assets/water.jpg';
import labanImg from '@/assets/laban.jpg';
// Salads
import tabboulehImg from '@/assets/tabbouleh.jpg';
import kishnaImg from '@/assets/kishna.jpg';

const dishImages: Record<string, string> = {
  'chicken-mandi': chickenMandiImg,
  'pigeon-mandi': pigeonMandiImg,
  'waleema-feast': waleeaFeastImg,
  'salads': saladsImg,
  // Individual desserts
  'mahalabia': mahalabiaImg,
  'cream-caramel': creamCaramelImg,
  'um-ali': umAliImg,
  'kunafa': kunafaImg,
  // Individual sauces
  'tahini': tahiniImg,
  'mabouj': maboujImg,
  'daqqus': daqqusImg,
  'spicy-salad': spicySaladImg,
  'kishna': kishnaImg,
  // Individual sides
  'jareesh': jareeshImg,
  'qursan': qursanImg,
  'plain-chicken': plainChickenImg,
  'half-chicken-rice': halfChickenRiceImg,
  'half-chicken-plain': halfChickenPlainImg,
  'plain-rice': plainRiceImg,
  'mandi-rice': mandiRiceImg,
  // Individual drinks
  'cola': colaImg,
  'pepsi': pepsiImg,
  'water': waterImg,
  'laban': labanImg,
  // Salads
  'tabbouleh': tabboulehImg,
};

interface MenuItemCardProps {
  item: MenuItem;
  onCustomize: (item: MenuItem) => void;
}

function MenuItemCard({ item, onCustomize }: MenuItemCardProps) {
  const { language, addToCart, cart, updateQuantity, t, toggleFavorite, isFavorite, getItemRating } = useApp();

  // Strip all customization suffixes: -spicy, -normal, -noraisins, -nonuts, and notes
  const getBaseId = (id: string) => id.replace(/(-spicy|-normal|-noraisins|-nonuts)+/g, '').split('-note-')[0];

  const quantity = cart
    .filter(i => getBaseId(i.id) === item.id)
    .reduce((sum, i) => sum + i.quantity, 0);

  const handleDecrementClick = () => {
    // Find the most recent cart variant of this item
    const cartItem = cart.find(i => getBaseId(i.id) === item.id);
    if (cartItem) {
      updateQuantity(cartItem.id, cartItem.quantity - 1);
    }
  };

  const rating = getItemRating(item.id);
  const favorited = isFavorite(item.id);
  const name = language === 'ar' ? item.nameAr : item.nameEn;
  const isMainCourse = item.category === 'main' || item.category === 'walaem';

  const handleAddClick = () => {
    if (isMainCourse) {
      onCustomize(item);
    } else {
      addToCart(item);
    }
  };
  const description = language === 'ar' ? item.descriptionAr : item.descriptionEn;
  
  // Get image URL from the image key
  const imageUrl = item.image ? dishImages[item.image] : null;

  return (
    <div className="food-card flex flex-col">
      {/* Premium image with 4:3 aspect ratio and hover zoom */}
      {imageUrl && (
        <div className="menu-item-image relative aspect-[4/3] overflow-hidden">
          <img 
            src={imageUrl} 
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          
          {/* Daily Deal Badge - Theme-aware */}
          {item.isDailyDeal && (
            <span className="offer-badge absolute top-3 left-3 z-10">
              {language === 'ar' ? 'عرض اليوم' : 'OFFER'}
            </span>
          )}
          
          {/* Best seller badge - premium gold styling */}
          {item.badge === 'best-seller' && (
            <span className="best-seller-badge absolute top-3 right-3 z-10">
              <Star className="w-3 h-3 fill-current" />
              {language === 'ar' ? 'الأكثر طلباً' : 'Best Seller'}
            </span>
          )}

          {/* Heart / Favorite Button */}
          <button
            onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
            className={`absolute bottom-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center
                        transition-all duration-200 active:scale-90 shadow-md
                        ${favorited 
                          ? 'bg-red-500 text-white' 
                          : 'bg-black/40 backdrop-blur-sm text-white hover:bg-red-500/80'}`}
            aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
          </button>
        </div>
      )}
      
      {/* Content */}
      <div className="p-4 md:p-5 flex flex-col gap-2.5 flex-1">
        {/* Title */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-base md:text-lg text-foreground leading-tight flex-1">
            {name}
          </h3>
          {!imageUrl && item.badge === 'best-seller' && (
            <span className="best-seller-badge">
              <Star className="w-3 h-3 fill-current" />
              {language === 'ar' ? 'الأكثر طلباً' : 'Best Seller'}
            </span>
          )}
          {item.badge === 'new' && (
            <span className="bg-success/20 text-success px-2 py-1 rounded-full text-[10px] md:text-xs font-bold">
              {language === 'ar' ? 'جديد' : 'New'}
            </span>
          )}
        </div>

        {/* Description - clean typography */}
        {description && (
          <p className="food-card-description">
            {description}
          </p>
        )}

        {/* Calories - clean alignment */}
        {item.calories && (
          <div className="food-card-calories">
            <Flame className="w-4 h-4 text-accent" />
            <span>{item.calories.toLocaleString()} {language === 'ar' ? 'سعرة' : 'cal'}</span>
          </div>
        )}

        {/* User Rating (if rated) */}
        {rating && (
          <div className="flex items-center gap-1.5">
            {[1,2,3,4,5].map(s => (
              <Star key={s} className={`w-3.5 h-3.5 ${s <= rating.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`} />
            ))}
            <span className="text-[10px] text-muted-foreground font-medium">
              {language === 'ar' ? 'تقييمك' : 'Your rating'}
            </span>
          </div>
        )}

        {/* Spacer to push price/button to bottom */}
        <div className="flex-1" />

        {/* Price & Add Button */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/40 mt-auto">
          <div className="flex flex-col">
            {/* Daily Deal Pricing */}
            {item.isDailyDeal && item.originalPrice ? (
              <>
                <span className="food-card-price offer-price">
                  {item.price.toFixed(2)}
                </span>
                <span className="text-xs text-muted-foreground line-through">
                  {item.originalPrice.toFixed(2)} {t.sar}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {language === 'ar' ? 'خصم لفترة محدودة' : 'Limited time offer'}
                </span>
              </>
            ) : (
              <>
                <span className="food-card-price">
                  {item.price.toFixed(2)}
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">
                  {t.sar}
                </span>
              </>
            )}
          </div>

          {quantity === 0 ? (
            <button
              onClick={handleAddClick}
              className="food-card-add-btn"
            >
              <Plus className="w-4 h-4" />
              {language === 'ar' ? 'أضف' : 'Add'}
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-muted/50 rounded-xl p-1">
              <button
                onClick={handleDecrementClick}
                className="w-9 h-9 rounded-lg flex items-center justify-center 
                           bg-card text-foreground hover:bg-muted transition-all active:scale-90 shadow-sm"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold text-lg w-8 text-center text-foreground">{quantity}</span>
              <button
                onClick={handleAddClick}
                className="w-9 h-9 rounded-lg flex items-center justify-center 
                           bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-90 shadow-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const categoryEmojis: Record<string, string> = {
  'main': '🍽️',
  'walaem': '👑',
  'sides': '🍟',
  'salads': '🥗',
  'sauces': '🌶️',
  'desserts': '🍰',
  'drinks': '🥤',
};

const popularItemIds = [
  'chicken-mandi',
  'pigeon-mandi',
  'jareesh',
  'kunafa',
  'mabouj',
  'laban',
  'tabbouleh',
];

export function MenuSection() {
  const { language, favorites } = useApp();
  const [activeCategory, setActiveCategory] = useState('popular');
  const [customizeItem, setCustomizeItem] = useState<MenuItem | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Compute whether we have favorites
  const hasFavorites = favorites.length > 0;

  // Filter items based on active category
  const categoryFilteredItems = activeCategory === 'daily-deals'
    ? menuItems.filter(item => item.isDailyDeal)
    : activeCategory === 'popular'
      ? menuItems.filter(item => popularItemIds.includes(item.id))
      : activeCategory === 'favorites'
        ? menuItems.filter(item => favorites.includes(item.id))
        : menuItems.filter(item => item.category === activeCategory);

  // Apply search filter on top of category filter (or across all items when searching)
  const filteredItems = searchQuery.trim()
    ? menuItems.filter(item =>
        item.nameAr.includes(searchQuery) ||
        item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.descriptionAr && item.descriptionAr.includes(searchQuery)) ||
        (item.descriptionEn && item.descriptionEn.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : categoryFilteredItems;

  // Get the current category name for the header
  const getCategoryName = () => {
    if (searchQuery.trim()) {
      return language === 'ar' ? `نتائج البحث عن "${searchQuery}"` : `Search results for "${searchQuery}"`;
    }
    if (activeCategory === 'daily-deals') {
      return language === 'ar' ? 'عروض اليوم المميزة' : 'Special Daily Deals';
    }
    if (activeCategory === 'popular') {
      return language === 'ar' ? 'الأكثر طلباً وشعبية' : 'Most Popular Dishes';
    }
    if (activeCategory === 'favorites') {
      return language === 'ar' ? 'المفضلة لديك' : 'Your Favorites';
    }
    const cat = categories.find(c => c.id === activeCategory);
    return language === 'ar' ? cat?.nameAr : cat?.nameEn;
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 240;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section id="menu" className="py-6 md:py-10">
      {/* Search Bar */}
      <div className="container mx-auto px-3 md:px-4 mb-3">
        <div className="relative">
          <Search className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
            style={{ [language === 'ar' ? 'right' : 'left']: '1rem' }} />
          <input
            id="menu-search"
            type="text"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setIsSearching(!!e.target.value); }}
            placeholder={language === 'ar' ? '🔍 ابحث عن صنف…' : '🔍 Search dishes…'}
            className="w-full h-11 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm
                       text-sm font-medium px-10 focus:outline-none focus:ring-2 focus:ring-primary/30
                       placeholder:text-muted-foreground/60 transition-all"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setIsSearching(false); }}
              className="absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center
                         text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              style={{ [language === 'ar' ? 'left' : 'right']: '0.5rem' }}
            >
              <XIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs Sticky Bar */}
      <div className="sticky top-14 md:top-16 z-30 bg-background/90 backdrop-blur-md py-4 mb-6 border-b border-border/40 shadow-sm">
        <div className="container mx-auto px-3 md:px-4">
          <div className="relative flex items-center">
            {/* Scroll buttons - desktop only */}
            <button
              onClick={() => scrollCategories('right')}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-10 h-10 
                         bg-card/90 backdrop-blur-sm border border-border/80 shadow-md rounded-full 
                         hover:bg-primary hover:text-primary-foreground text-foreground transition-all duration-300
                         hidden lg:flex items-center justify-center active:scale-90"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 flip-rtl" />
            </button>
            <button
              onClick={() => scrollCategories('left')}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-10 h-10 
                         bg-card/90 backdrop-blur-sm border border-border/80 shadow-md rounded-full 
                         hover:bg-primary hover:text-primary-foreground text-foreground transition-all duration-300
                         hidden lg:flex items-center justify-center active:scale-90"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 flip-rtl" />
            </button>

            {/* Edge fade gradients for scroll indication - pointer-events-none so it doesn't block clicks */}
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background/95 via-background/40 to-transparent pointer-events-none z-10 hidden md:block" />
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background/95 via-background/40 to-transparent pointer-events-none z-10 hidden md:block" />

            {/* Categories scroll area */}
            <div
              ref={scrollRef}
              className="flex gap-2.5 overflow-x-auto scrollbar-hide w-full px-1 lg:px-12 py-1 snap-x snap-mandatory"
            >
              {/* Special Daily Deals Tab - Premium Amber Gold Styling */}
              <button
                onClick={() => setActiveCategory('daily-deals')}
                className={`flex-shrink-0 snap-center h-11 px-5 rounded-full text-sm font-bold 
                           transition-all duration-300 whitespace-nowrap flex items-center gap-2.5 active:scale-95 ${
                  activeCategory === 'daily-deals'
                    ? 'bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#F3E5AB] text-[#201704] shadow-[0_4px_15px_rgba(212,175,55,0.4)] border border-[#FFD700]/40 scale-[1.03]'
                    : 'bg-[#D4AF37]/5 hover:bg-[#D4AF37]/12 text-[#AA7C11] border border-[#D4AF37]/15'
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm transition-colors ${
                  activeCategory === 'daily-deals' ? 'bg-black/10' : 'bg-[#D4AF37]/10'
                }`}>
                  🎁
                </span>
                <span>{language === 'ar' ? 'عروض اليوم' : 'Daily Deals'}</span>
              </button>

              {/* Special Most Purchased (Popular) Tab - Premium Red Styling */}
              <button
                onClick={() => setActiveCategory('popular')}
                className={`flex-shrink-0 snap-center h-11 px-5 rounded-full text-sm font-bold 
                           transition-all duration-300 whitespace-nowrap flex items-center gap-2.5 active:scale-95 ${
                  activeCategory === 'popular'
                    ? 'bg-gradient-to-r from-[#8B0000] to-[#E53935] text-white shadow-[0_4px_15px_rgba(139,0,0,0.35)] border border-red-500/30 scale-[1.03]'
                    : 'bg-[#8B0000]/5 hover:bg-[#8B0000]/12 text-[#8B0000] border border-[#8B0000]/15'
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm transition-colors ${
                  activeCategory === 'popular' ? 'bg-white/15' : 'bg-[#8B0000]/10'
                }`}>
                  🔥
                </span>
                <span>{language === 'ar' ? 'الأكثر طلباً' : 'Most Popular'}</span>
              </button>

              {/* Favorites Tab — only shown when user has saved favorites */}
              {hasFavorites && (
                <button
                  onClick={() => setActiveCategory('favorites')}
                  className={`flex-shrink-0 snap-center h-11 px-5 rounded-full text-sm font-bold 
                             transition-all duration-300 whitespace-nowrap flex items-center gap-2.5 active:scale-95 ${
                    activeCategory === 'favorites'
                      ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-[0_4px_15px_rgba(219,39,119,0.35)] border border-pink-400/30 scale-[1.03]'
                      : 'bg-pink-500/5 hover:bg-pink-500/12 text-pink-600 border border-pink-500/15'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm transition-colors ${
                    activeCategory === 'favorites' ? 'bg-white/15' : 'bg-pink-500/10'
                  }`}>
                    ❤️
                  </span>
                  <span>{language === 'ar' ? 'مفضلتي' : 'Favorites'}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    activeCategory === 'favorites' ? 'bg-white/20 text-white' : 'bg-pink-500/15 text-pink-600'
                  }`}>{favorites.length}</span>
                </button>
              )}

              {/* Standard Categories - Premium Emerald Green Styling */}
              {categories.map(cat => {
                const emoji = categoryEmojis[cat.id] || '';
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    id={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex-shrink-0 snap-center h-11 px-5 rounded-full text-sm font-bold 
                               transition-all duration-300 whitespace-nowrap flex items-center gap-2.5 active:scale-95 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#006C35] to-[#2E7D32] text-white shadow-[0_4px_15px_rgba(0,108,53,0.35)] border border-emerald-500/30 scale-[1.03]'
                        : 'bg-card/90 backdrop-blur-xs text-foreground/80 hover:bg-muted/90 hover:text-foreground border border-border/85 hover:border-primary/20'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm transition-colors ${
                      isActive ? 'bg-white/15' : 'bg-muted'
                    }`}>
                      {emoji}
                    </span>
                    <span>{language === 'ar' ? cat.nameAr : cat.nameEn}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Menu Grid - With Dynamic Category Title and Item Count */}
      <div className="container mx-auto px-3 md:px-4 animate-fade-in">
        {/* Header decoration */}
        <div className="flex items-end justify-between mb-6 md:mb-8 border-b border-border/40 pb-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl md:text-2xl font-black text-foreground flex items-center gap-2">
              {getCategoryName()}
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground font-medium">
              {language === 'ar' 
                ? `نقدم لكم أفضل المأكولات المحضرة بكل حب (${filteredItems.length} صنف)` 
                : `Enjoy our fresh dishes prepared with passion (${filteredItems.length} items)`}
            </p>
          </div>
          <div className="h-1 w-16 rounded-full bg-primary mb-1 shadow-sm" />
        </div>

        {/* Grid display */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
          {filteredItems.map(item => (
            <MenuItemCard key={item.id} item={item} onCustomize={setCustomizeItem} />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-16 text-muted-foreground bg-card/40 rounded-2xl border border-border/40 mt-4">
            <div className="text-3xl mb-2">🍽️</div>
            <div>{language === 'ar' ? 'لا توجد أصناف متوفرة في هذه الفئة حالياً' : 'No items available in this category currently'}</div>
          </div>
        )}
      </div>
      <CustomizeItemModal baseItem={customizeItem} onClose={() => setCustomizeItem(null)} />
    </section>
  );
}
