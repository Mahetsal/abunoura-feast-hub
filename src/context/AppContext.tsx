import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MenuItem, translations, restaurantInfo } from '@/data/menu';
import { SeasonalTheme, applyTheme } from '@/components/ThemeSwitcher';
import { ensureOrderTimerForStatus } from '@/lib/orderTimer';

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface ActiveOrder {
  id: string;
  items: CartItem[];
  total: number;
  notes?: string;
}

export interface OrderInfo {
  name: string;
  phone: string;
  address: string;
  deliveryMethod: 'delivery' | 'pickup';
  paymentMethod: 'mada' | 'apple-pay' | 'stc-pay' | 'cash';
  needChange?: boolean;
  changeAmount?: number;
  driverTip: number;
  scheduledTime?: string;
  isScheduled: boolean;
  ecoFriendly: boolean; // No plastic cutlery
  orderNotes?: string; // Special instructions for the order
}

export interface ItemRating {
  itemId: string;
  rating: number; // 1-5
  comment?: string;
  date: string;
}

export interface PromoCode {
  code: string;
  discount: number; // percentage
  labelAr: string;
  labelEn: string;
}

export const promoCodes: PromoCode[] = [
  { code: 'FIRST', discount: 15, labelAr: 'خصم الطلب الأول', labelEn: 'First Order Discount' },
  { code: 'FOUNDING2026', discount: 22, labelAr: 'خصم يوم التأسيس', labelEn: 'Founding Day Discount' },
  { code: 'RAMADAN', discount: 15, labelAr: 'خصم رمضان', labelEn: 'Ramadan Discount' },
  { code: 'KSA96', discount: 20, labelAr: 'خصم اليوم الوطني', labelEn: 'National Day Discount' },
  { code: 'KARAM', discount: 0, labelAr: 'توصيل مجاني', labelEn: 'Free Delivery' }, // 0 = free delivery
  { code: 'FLAG', discount: 10, labelAr: 'خصم يوم العلم', labelEn: 'Flag Day Discount' },
];

export interface OrderHistory {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
  status: 'completed' | 'cancelled';
}

export interface SavedAddress {
  id: string;
  label: 'home' | 'work' | 'friend' | 'other';
  labelAr: string;
  labelEn: string;
  address: string;
  isDefault?: boolean;
}

export interface UserProfile {
  name: string;
  phone: string;
  savedAddresses: SavedAddress[];
}

interface AppContextType {
  // Language
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
  t: typeof translations.ar;
  
  // Seasonal Theme
  seasonalTheme: SeasonalTheme;
  setSeasonalTheme: (theme: SeasonalTheme) => void;
  
  // User Profile (persisted)
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  addSavedAddress: (address: SavedAddress) => void;
  removeSavedAddress: (addressId: string) => void;
  
  // Cart
  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Promo codes
  appliedPromoCode: PromoCode | null;
  applyPromoCode: (code: string) => boolean;
  removePromoCode: () => void;
  promoDiscount: number;
  
  // Order calculations
  subtotal: number;
  vatAmount: number;
  deliveryFee: number;
  discountAmount: number;
  tipAmount: number;
  grandTotal: number;
  
  // Discount logic
  usedPhoneNumbers: string[];
  isFirstOrder: (phone: string) => boolean;
  registerPhone: (phone: string) => void;
  hasDiscount: boolean;
  setHasDiscount: (value: boolean) => void;
  
  // Order info
  orderInfo: OrderInfo;
  setOrderInfo: React.Dispatch<React.SetStateAction<OrderInfo>>;
  
  // Order state
  currentOrderId: string | null;
  setCurrentOrderId: (id: string | null) => void;
  orderStatus: 'idle' | 'confirmed' | 'cooking' | 'on-the-way' | 'delivered' | 'ready-for-pickup';
  setOrderStatus: (status: 'idle' | 'confirmed' | 'cooking' | 'on-the-way' | 'delivered' | 'ready-for-pickup') => void;
  
  // Order history
  orderHistory: OrderHistory[];
  addToOrderHistory: (order: OrderHistory) => void;
  
  // Welcome popup
  showWelcomePopup: boolean;
  setShowWelcomePopup: (show: boolean) => void;
  
  // Assistant state
  assistantData: {
    name?: string;
    phone?: string;
    deliveryMethod?: 'delivery' | 'pickup';
    persons?: number;
    mealType?: 'meat' | 'chicken' | 'both';
  };
  setAssistantData: React.Dispatch<React.SetStateAction<AppContextType['assistantData']>>;
  
  // Sound
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  playSound: (type: 'success' | 'ding' | 'pop') => void;
  
  // Favorites (wishlist)
  favorites: string[]; // item IDs
  toggleFavorite: (itemId: string) => void;
  isFavorite: (itemId: string) => boolean;

  // Item ratings
  itemRatings: ItemRating[];
  addItemRating: (rating: ItemRating) => void;
  getItemRating: (itemId: string) => ItemRating | undefined;

  // Active order details
  activeOrder: ActiveOrder | null;
  setActiveOrder: (order: ActiveOrder | null) => void;

  // Reset for new order
  resetOrder: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USED_PHONES: 'mandi_used_phones',
  ORDER_HISTORY: 'mandi_order_history',
  LANGUAGE: 'mandi_language',
  SOUND_ENABLED: 'mandi_sound_enabled',
  USER_PROFILE: 'mandi_user_profile',
  USER_DATA: 'userData',
  USER_PHONE: 'userPhone',
  USER_NAME: 'userName',
  ORDER_STATUS: 'mandi_order_status',
  CURRENT_ORDER_ID: 'mandi_current_order_id',
  FAVORITES: 'mandi_favorites',
  ITEM_RATINGS: 'mandi_item_ratings',
};

function safeJsonParse<T>(item: string | null, fallback: T): T {
  if (!item) return fallback;
  try {
    return JSON.parse(item) as T;
  } catch {
    return fallback;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  // Language
  const [language, setLanguage] = useState<'ar' | 'en'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    return (saved as 'ar' | 'en') || 'ar';
  });

  // User Profile (persisted) - also sync with userData + separate userPhone/userName keys
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (saved) {
      const parsed = safeJsonParse<UserProfile | null>(saved, null);
      if (parsed) return parsed;
    }

    // REQUIRED: userData key
    const savedUser = safeJsonParse<any>(localStorage.getItem('userData'), null);
    if (savedUser?.phone || savedUser?.name) {
      return { name: savedUser?.name || '', phone: savedUser?.phone || '', savedAddresses: [] };
    }

    // Fallback: check separate keys
    const phone = localStorage.getItem(STORAGE_KEYS.USER_PHONE);
    const name = localStorage.getItem(STORAGE_KEYS.USER_NAME);
    if (phone || name) {
      return { name: name || '', phone: phone || '', savedAddresses: [] };
    }

    return null;
  });

  const setUserProfile = (profile: UserProfile) => {
    setUserProfileState(profile);
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));

    // REQUIRED: userData key
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify({ name: profile.name, phone: profile.phone }));

    // Also save to separate keys for consistency
    localStorage.setItem(STORAGE_KEYS.USER_PHONE, profile.phone);
    localStorage.setItem(STORAGE_KEYS.USER_NAME, profile.name);
  };

  const addSavedAddress = (address: SavedAddress) => {
    if (userProfile) {
      const updatedProfile = {
        ...userProfile,
        savedAddresses: [...userProfile.savedAddresses, address],
      };
      setUserProfile(updatedProfile);
    }
  };

  const removeSavedAddress = (addressId: string) => {
    if (userProfile) {
      const updatedProfile = {
        ...userProfile,
        savedAddresses: userProfile.savedAddresses.filter(a => a.id !== addressId),
      };
      setUserProfile(updatedProfile);
    }
  };

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Seasonal theme
  const [seasonalTheme, setSeasonalThemeState] = useState<SeasonalTheme>('default');
  
  const setSeasonalTheme = (theme: SeasonalTheme) => {
    setSeasonalThemeState(theme);
    applyTheme(theme);
  };
  
  // Promo codes
  const [appliedPromoCode, setAppliedPromoCode] = useState<PromoCode | null>(null);
  
  const applyPromoCode = (code: string): boolean => {
    const upperCode = code.toUpperCase().trim();
    const found = promoCodes.find(p => p.code === upperCode);
    if (found) {
      setAppliedPromoCode(found);
      return true;
    }
    return false;
  };
  
  const removePromoCode = () => {
    setAppliedPromoCode(null);
  };
  
  // Discount tracking
  const [usedPhoneNumbers, setUsedPhoneNumbers] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USED_PHONES);
    return safeJsonParse<string[]>(saved, []);
  });
  const [hasDiscount, setHasDiscount] = useState(true);
  
  // Order info - prefill from saved userData if available
  const [orderInfo, setOrderInfo] = useState<OrderInfo>(() => {
    const savedUser = safeJsonParse<any>(localStorage.getItem('userData'), null);

    return {
      name: (savedUser?.name || userProfile?.name || ''),
      phone: (savedUser?.phone || userProfile?.phone || ''),
      address: '',
      deliveryMethod: 'delivery',
      paymentMethod: 'cash',
      driverTip: 0,
      isScheduled: false,
      ecoFriendly: false,
    };
  });
  
  // Order state (persisted)
  const [currentOrderId, setCurrentOrderIdState] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_ORDER_ID);
  });

  const setCurrentOrderId = (id: string | null) => {
    setCurrentOrderIdState(id);
    if (id) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_ORDER_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_ORDER_ID);
    }
  };

  const [activeOrder, setActiveOrderState] = useState<ActiveOrder | null>(() => {
    const saved = localStorage.getItem('mandi_active_order');
    return safeJsonParse<ActiveOrder | null>(saved, null);
  });

  const setActiveOrder = (order: ActiveOrder | null) => {
    setActiveOrderState(order);
    if (order) {
      localStorage.setItem('mandi_active_order', JSON.stringify(order));
    } else {
      localStorage.removeItem('mandi_active_order');
    }
  };

  const [orderStatus, setOrderStatusState] = useState<AppContextType['orderStatus']>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDER_STATUS) as AppContextType['orderStatus'] | null;
    return saved || 'idle';
  });

  const setOrderStatus = (status: AppContextType['orderStatus']) => {
    setOrderStatusState(status);
    if (status === 'idle') {
      localStorage.removeItem(STORAGE_KEYS.ORDER_STATUS);
    } else {
      localStorage.setItem(STORAGE_KEYS.ORDER_STATUS, status);
    }
    ensureOrderTimerForStatus(status);
  };
  
  // Order history
  const [orderHistory, setOrderHistory] = useState<OrderHistory[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDER_HISTORY);
    return safeJsonParse<OrderHistory[]>(saved, []);
  });
  
  // Welcome popup
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);
  
  // Assistant data
  const [assistantData, setAssistantData] = useState<AppContextType['assistantData']>({});

  // Favorites (persisted)
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return safeJsonParse<string[]>(saved, []);
  });

  const toggleFavorite = (itemId: string) => {
    setFavorites(prev => {
      const updated = prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId];
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
      return updated;
    });
    playSound('pop');
  };

  const isFavorite = (itemId: string) => favorites.includes(itemId);

  // Item ratings (persisted)
  const [itemRatings, setItemRatings] = useState<ItemRating[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ITEM_RATINGS);
    return safeJsonParse<ItemRating[]>(saved, []);
  });

  const addItemRating = (rating: ItemRating) => {
    setItemRatings(prev => {
      const filtered = prev.filter(r => r.itemId !== rating.itemId); // replace existing
      const updated = [rating, ...filtered];
      localStorage.setItem(STORAGE_KEYS.ITEM_RATINGS, JSON.stringify(updated));
      return updated;
    });
  };

  const getItemRating = (itemId: string) => itemRatings.find(r => r.itemId === itemId);

  // Sound
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
    return saved !== 'false';
  });

  // Effects for persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USED_PHONES, JSON.stringify(usedPhoneNumbers));
  }, [usedPhoneNumbers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDER_HISTORY, JSON.stringify(orderHistory));
  }, [orderHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, String(soundEnabled));
  }, [soundEnabled]);

  // Ensure order timer is created for persisted orderStatus (and never restarts on refresh)
  useEffect(() => {
    ensureOrderTimerForStatus(orderStatus);
  }, [orderStatus]);

  // Cart functions
  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    playSound('pop');
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(prev => prev.map(i => 
        i.id === itemId ? { ...i, quantity } : i
      ));
    }
  };

  const clearCart = () => setCart([]);

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const promoDiscount = appliedPromoCode ? subtotal * (appliedPromoCode.discount / 100) : 0;
  const discountAmount = hasDiscount ? subtotal * restaurantInfo.firstOrderDiscount : 0;
  const totalDiscount = Math.max(promoDiscount, discountAmount); // Use higher discount
  const afterDiscount = subtotal - totalDiscount;
  const vatAmount = afterDiscount * restaurantInfo.vatRate;
  const deliveryFee = orderInfo.deliveryMethod === 'delivery' ? restaurantInfo.deliveryFee : 0;
  const tipAmount = orderInfo.driverTip;
  const grandTotal = afterDiscount + vatAmount + deliveryFee + tipAmount;

  // Discount logic
  const isFirstOrder = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return !usedPhoneNumbers.includes(cleaned);
  };

  const registerPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (!usedPhoneNumbers.includes(cleaned)) {
      setUsedPhoneNumbers(prev => [...prev, cleaned]);
    }
  };

  // Order history
  const addToOrderHistory = (order: OrderHistory) => {
    setOrderHistory(prev => [order, ...prev]);
  };

  // Sound
  const playSound = (type: 'success' | 'ding' | 'pop') => {
    if (!soundEnabled) return;
    
    const frequencies: Record<typeof type, number> = {
      success: 800,
      ding: 1000,
      pop: 600,
    };
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequencies[type];
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
      // Audio not supported
    }
  };

  // Reset order
  const resetOrder = () => {
    clearCart();
    setOrderInfo({
      name: userProfile?.name || '',
      phone: userProfile?.phone || '',
      address: '',
      deliveryMethod: 'delivery',
      paymentMethod: 'cash',
      driverTip: 0,
      isScheduled: false,
      ecoFriendly: false,
    });
    setCurrentOrderId(null);
    setOrderStatus('idle');
    setHasDiscount(true);
    setAssistantData({});
    setAppliedPromoCode(null);
    setActiveOrder(null);
  };

  const t = translations[language];

  return (
    <AppContext.Provider value={{
      language,
      setLanguage,
      t,
      seasonalTheme,
      setSeasonalTheme,
      userProfile,
      setUserProfile,
      addSavedAddress,
      removeSavedAddress,
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      appliedPromoCode,
      applyPromoCode,
      removePromoCode,
      promoDiscount,
      subtotal,
      vatAmount,
      deliveryFee,
      discountAmount: totalDiscount,
      tipAmount,
      grandTotal,
      usedPhoneNumbers,
      isFirstOrder,
      registerPhone,
      hasDiscount,
      setHasDiscount,
      orderInfo,
      setOrderInfo,
      currentOrderId,
      setCurrentOrderId,
      orderStatus,
      setOrderStatus,
      activeOrder,
      setActiveOrder,
      orderHistory,
      addToOrderHistory,
      showWelcomePopup,
      setShowWelcomePopup,
      assistantData,
      setAssistantData,
      soundEnabled,
      setSoundEnabled,
      playSound,
      favorites,
      toggleFavorite,
      isFavorite,
      itemRatings,
      addItemRating,
      getItemRating,
      resetOrder,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
