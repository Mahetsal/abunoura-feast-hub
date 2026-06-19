import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Plus, Minus, ShoppingCart, ChevronLeft } from 'lucide-react';
import { menuItems, MenuItem } from '@/data/menu';
import { normalizePhoneNumber } from '@/lib/phoneUtils';
import aiAvatar from '@/assets/ai-assistant-avatar.png';

type AssistantStep =
  | 'greeting'
  | 'get-name'
  | 'persons'
  | 'meal-type'
  | 'main-dishes'
  | 'rice'
  | 'sauces'
  | 'desserts'
  | 'summary'
  | 'phone'
  | 'delivery-method'
  | 'location'
  | 'done';

interface SelectedItems {
  [key: string]: number;
}

export function SmartAssistant({ onCheckout }: { onCheckout: () => void }) {
  const {
    t,
    language,
    addToCart,
    cart,
    clearCart,
    isFirstOrder,
    setHasDiscount,
    hasDiscount,
    setAssistantData,
    assistantData,
    playSound,
    userProfile,
    setUserProfile,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<AssistantStep>('greeting');
  const [persons, setPersons] = useState(0);
  const [mealType, setMealType] = useState<'meat' | 'chicken' | 'both' | null>(null);
  const [selectedItems, setSelectedItems] = useState<SelectedItems>({});
  const [phoneInput, setPhoneInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [phoneChecked, setPhoneChecked] = useState(false);

  const hasCompleteProfile = Boolean(userProfile?.name && userProfile?.phone);

  // Pre-fill from saved user profile
  useEffect(() => {
    if (userProfile) {
      setNameInput(userProfile.name);
      setPhoneInput(userProfile.phone);
      if (userProfile.phone.length >= 10) {
        handlePhoneCheck(userProfile.phone);
      }
    }
  }, [userProfile]);

  useEffect(() => {
    const handler = () => handleOpen();
    window.addEventListener('open:assistant', handler);
    return () => window.removeEventListener('open:assistant', handler);
  }, []);

  const resetAssistant = () => {
    setStep('greeting');
    setPersons(0);
    setMealType(null);
    setSelectedItems({});
    // Keep name and phone if we have user profile
    if (!userProfile) {
      setPhoneInput('');
      setNameInput('');
    }
    setPhoneChecked(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
    playSound('pop');
    if (step === 'done') {
      resetAssistant();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handlePersonsSelect = (num: number) => {
    setPersons(num);
    playSound('pop');
    setStep('meal-type');
  };

  const handleMealType = (type: 'meat' | 'chicken' | 'both') => {
    setMealType(type);
    playSound('pop');
    
    setSelectedItems(prev => {
      const newItems = { ...prev };
      // Clear previous main courses/walaem
      menuItems.forEach(i => {
        if (i.category === 'main' || i.category === 'walaem') {
          delete newItems[i.id];
        }
      });

      // Add the recommendation based on guests
      if (type === 'meat') {
        if (persons >= 8) {
          newItems['quarter-waleema'] = 1;
        } else {
          newItems['lamb-waleema'] = 1;
        }
      } else if (type === 'chicken') {
        const chickenCount = Math.ceil(persons / 2);
        newItems['chicken-mandi'] = chickenCount;
      } else {
        // Both selected
        if (persons >= 8) {
          newItems['quarter-waleema'] = 1;
          newItems['chicken-mandi'] = 2;
        } else {
          newItems['lamb-waleema'] = 1;
          newItems['chicken-mandi'] = 1;
        }
      }

      return newItems;
    });
    
    setStep('main-dishes');
  };

  const updateSelectedItem = (itemId: string, quantity: number) => {
    setSelectedItems(prev => {
      if (quantity <= 0) {
        const newItems = { ...prev };
        delete newItems[itemId];
        return newItems;
      }
      return { ...prev, [itemId]: quantity };
    });
  };

  const getItemQuantity = (itemId: string) => selectedItems[itemId] || 0;

  const mainItems = menuItems.filter(i => i.category === 'main' || i.category === 'walaem');
  const riceItems = menuItems.filter(i => i.id === 'rice-shabi' || i.id === 'rice-mandi');
  const sauceItems = menuItems.filter(
    i =>
      i.category === 'sauces' ||
      i.category === 'salads' ||
      (i.category === 'sides' && i.id !== 'rice-shabi' && i.id !== 'rice-mandi')
  );
  const dessertItems = menuItems.filter(i => i.category === 'desserts');
  const drinkItems = menuItems.filter(i => i.category === 'drinks');

  const calculateTotal = () => {
    return Object.entries(selectedItems).reduce((sum, [itemId, qty]) => {
      const item = menuItems.find(i => i.id === itemId);
      return sum + (item?.price || 0) * qty;
    }, 0);
  };

  const handleStartOrder = () => {
    // Ask only for missing identity fields (avoid asking phone/name twice)
    if (!userProfile?.name) {
      setStep('get-name');
      return;
    }

    setStep('persons');
  };

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setStep('persons');
    }
  };

  const handleAddToCart = () => {
    // Use userProfile data if available, otherwise use input values
    const finalName = userProfile?.name || nameInput;
    const finalPhone = userProfile?.phone || phoneInput;

    // Persist/complete user profile (fix: if profile exists but missing phone/name, update it)
    const shouldPersistProfile = Boolean(
      finalName &&
        finalPhone &&
        (!userProfile || !userProfile.name || !userProfile.phone)
    );

    if (shouldPersistProfile) {
      setUserProfile({
        name: finalName,
        phone: finalPhone,
        savedAddresses: userProfile?.savedAddresses || [],
      });
    }
    
    clearCart();
    
    Object.entries(selectedItems).forEach(([itemId, qty]) => {
      const item = menuItems.find(i => i.id === itemId);
      if (item) {
        for (let i = 0; i < qty; i++) {
          addToCart(item);
        }
      }
    });
    
    setAssistantData({
      name: finalName,
      phone: finalPhone,
      persons,
      mealType: mealType || undefined,
    });
    
    playSound('success');
    setStep('done');
    setIsOpen(false);
    onCheckout();
  };

  const handlePhoneCheck = (phone: string) => {
    setPhoneInput(phone);
    if (phone.length >= 10) {
      const isNew = isFirstOrder(phone);
      setHasDiscount(isNew);
      setPhoneChecked(true);
    }
  };

  const renderItemSelector = (items: MenuItem[], title: string) => (
    <div className="space-y-3">
      <h4 className="font-medium text-muted-foreground">{title}</h4>
      <div className="grid grid-cols-2 gap-2">
        {items.map(item => {
          const qty = getItemQuantity(item.id);
          return (
            <div
              key={item.id}
              className={`p-3 rounded-xl border-2 transition-all ${
                qty > 0 ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <div className="text-sm font-medium mb-1">
                {language === 'ar' ? item.nameAr : item.nameEn}
              </div>
              <div className="text-xs text-primary font-bold mb-2">
                {item.price} {t.sar}
              </div>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => updateSelectedItem(item.id, qty - 1)}
                  className="w-7 h-7 rounded-full bg-muted flex items-center justify-center"
                  disabled={qty === 0}
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-bold w-6 text-center">{qty}</span>
                <button
                  onClick={() => updateSelectedItem(item.id, qty + 1)}
                  className="w-7 h-7 rounded-full bg-primary text-primary-foreground 
                             flex items-center justify-center"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const goBack = () => {
    const steps: AssistantStep[] = [
      'greeting',
      'get-name',
      'persons',
      'meal-type',
      'main-dishes',
      'rice',
      'sauces',
      'desserts',
      'summary',
      'phone',
    ];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      // Skip get-name if we have profile
      if (steps[currentIndex - 1] === 'get-name' && userProfile) {
        setStep('greeting');
      } else {
        setStep(steps[currentIndex - 1]);
      }
    }
  };

  // Dynamic greeting based on user profile
  const getGreeting = () => {
    if (userProfile?.name) {
      return language === 'ar' 
        ? `مرحباً بك يا ${userProfile.name} في مندي أبو نورة، كيف أخدمك اليوم؟`
        : `Welcome back ${userProfile.name} to Mandi Abu Noura, how can I help you today?`;
    }
    return language === 'ar' 
      ? 'مرحباً بك في مندي أبو نورة، كيف أخدمك اليوم؟'
      : 'Welcome to Mandi Abu Noura, how can I help you today?';
  };

  return (
    <>
      {/* Assistant Modal - 20% larger */}
      {isOpen && (
        <div className="modal-overlay animate-fade-in" onClick={handleClose}>
          <div 
            className="bg-card rounded-3xl shadow-premium-lg w-full max-w-lg max-h-[90vh] 
                       overflow-hidden animate-scale-in flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-secondary text-secondary-foreground p-5 flex items-center gap-4">
              {step !== 'greeting' && step !== 'done' && (
                <button onClick={goBack} className="p-2 hover:bg-secondary-foreground/10 rounded-full">
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              <img src={aiAvatar} alt="" className="w-14 h-14 object-cover rounded-full border-2 border-primary-foreground/20" />
              <div className="flex-1">
                <h3 className="font-bold text-lg">
                  {language === 'ar' ? 'مساعد أبو نورة الذكي' : 'Abu Noura Smart Assistant'}
                </h3>
                <p className="text-sm opacity-80">
                  {language === 'ar' ? 'جاهز لخدمتك' : 'Ready to serve you'}
                </p>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-secondary-foreground/10 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Greeting */}
              {step === 'greeting' && (
                <div className="animate-fade-in">
                  <div className="bg-muted p-5 rounded-2xl rounded-tr-sm mb-4">
                    <p className="text-lg leading-relaxed">{getGreeting()}</p>
                  </div>
                  <button
                    onClick={handleStartOrder}
                    className="w-full btn-secondary py-4 rounded-xl font-medium text-lg"
                  >
                    {language === 'ar' ? 'ابدأ الطلب' : 'Start Order'}
                  </button>
                </div>
              )}

              {/* Get Name (First time users) */}
              {step === 'get-name' && (
                <div className="animate-fade-in space-y-4">
                  <div className="bg-muted p-5 rounded-2xl rounded-tr-sm">
                    <p className="text-lg">
                      {language === 'ar' 
                        ? 'قبل ما نبدأ، ممكن أعرف اسمك الكريم؟' 
                        : 'Before we start, may I know your name?'}
                    </p>
                  </div>
                  
                  <input
                    type="text"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    className="input-arabic w-full text-lg py-4"
                    placeholder={language === 'ar' ? 'اسمك الكريم' : 'Your name'}
                    autoFocus
                  />
                  
                  <button
                    onClick={handleSaveName}
                    disabled={!nameInput.trim()}
                    className="w-full btn-secondary py-4 rounded-xl font-medium text-lg
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {language === 'ar' ? 'متابعة' : 'Continue'}
                  </button>
                </div>
              )}

              {/* Persons */}
              {step === 'persons' && (
                <div className="animate-fade-in">
                  <div className="bg-muted p-5 rounded-2xl rounded-tr-sm mb-4">
                    <p className="text-lg">
                      {nameInput && !userProfile 
                        ? (language === 'ar' ? `أهلاً ${nameInput}! ` : `Hi ${nameInput}! `) 
                        : ''}
                      {t.selectNumber}
                    </p>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {[1, 2, 3, 4, 5, 6, 8, 10].map(num => (
                      <button
                        key={num}
                        onClick={() => handlePersonsSelect(num)}
                        className={`p-5 rounded-xl border-2 font-bold text-lg transition-all
                                   ${persons === num 
                                     ? 'border-primary bg-primary/10' 
                                     : 'border-border hover:border-primary/50'}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <p className="text-center text-sm text-muted-foreground mt-3">
                    {t.persons}
                  </p>
                </div>
              )}

              {/* Meal Type */}
              {step === 'meal-type' && (
                <div className="animate-fade-in">
                  <div className="bg-muted p-5 rounded-2xl rounded-tr-sm mb-4">
                    <p className="text-lg">{t.meatOrChicken}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {language === 'ar' 
                        ? `اخترت ${persons} أشخاص` 
                        : `You selected ${persons} persons`}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleMealType('meat')}
                      className="p-8 rounded-2xl border-2 border-border hover:border-primary 
                                 transition-all text-center"
                    >
                      <div className="text-5xl mb-3">🍖</div>
                      <div className="font-bold text-lg">{t.meat}</div>
                    </button>
                    <button
                      onClick={() => handleMealType('chicken')}
                      className="p-8 rounded-2xl border-2 border-border hover:border-primary 
                                 transition-all text-center"
                    >
                      <div className="text-5xl mb-3">🍗</div>
                      <div className="font-bold text-lg">{t.chicken}</div>
                    </button>
                    <button
                      onClick={() => handleMealType('both')}
                      className="col-span-2 p-6 rounded-2xl border-2 border-border hover:border-primary 
                                 transition-all text-center flex items-center justify-center gap-4"
                    >
                      <div className="text-4xl">🍖 + 🍗</div>
                      <div className="font-bold text-lg">
                        {language === 'ar' ? 'تشكيلة (لحم ودجاج)' : 'Mix (Meat & Chicken)'}
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Main Dishes */}
              {step === 'main-dishes' && (
                <div className="animate-fade-in space-y-4">
                  <div className="bg-muted p-5 rounded-2xl rounded-tr-sm">
                    <p className="text-lg">
                      {language === 'ar'
                        ? 'اختر الأطباق الرئيسية (يمكنك اختيار أكثر من طبق وتعديل الكمية):'
                        : 'Select main dishes (you can choose multiple items and adjust quantities):'}
                    </p>
                  </div>
                  {renderItemSelector(mainItems, language === 'ar' ? 'الأطباق الرئيسية والولائم' : 'Main Dishes & Banquets')}
                  <button
                    onClick={() => setStep('rice')}
                    disabled={!Object.entries(selectedItems).some(([id, qty]) => {
                      const item = menuItems.find(i => i.id === id);
                      return qty > 0 && (item?.category === 'main' || item?.category === 'walaem');
                    })}
                    className="w-full btn-secondary py-4 rounded-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {language === 'ar' ? 'التالي' : 'Next'}
                  </button>
                </div>
              )}

              {/* Rice */}
              {step === 'rice' && (
                <div className="animate-fade-in">
                  <div className="bg-muted p-5 rounded-2xl rounded-tr-sm mb-4">
                    <p className="text-lg">{t.addRice}</p>
                  </div>
                  {renderItemSelector(riceItems, '')}
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => setStep('sauces')}
                      className="flex-1 py-4 rounded-xl border-2 border-border 
                                 hover:border-primary transition-colors text-lg"
                    >
                      {t.noThanks}
                    </button>
                    <button
                      onClick={() => setStep('sauces')}
                      className="flex-1 btn-secondary py-4 rounded-xl text-lg"
                    >
                      {language === 'ar' ? 'التالي' : 'Next'}
                    </button>
                  </div>
                </div>
              )}

              {/* Sauces */}
              {step === 'sauces' && (
                <div className="animate-fade-in">
                  <div className="bg-muted p-5 rounded-2xl rounded-tr-sm mb-4">
                    <p className="text-lg">{t.selectSauces}</p>
                  </div>
                  {renderItemSelector(sauceItems, '')}
                  <button
                    onClick={() => setStep('desserts')}
                    className="w-full btn-secondary py-4 rounded-xl mt-4 text-lg"
                  >
                    {language === 'ar' ? 'التالي' : 'Next'}
                  </button>
                </div>
              )}

              {/* Desserts & Drinks */}
              {step === 'desserts' && (
                <div className="animate-fade-in space-y-4">
                  <div className="bg-muted p-5 rounded-2xl rounded-tr-sm">
                    <p className="text-lg">{t.selectDesserts}</p>
                  </div>
                  {renderItemSelector(dessertItems, language === 'ar' ? 'حلويات' : 'Desserts')}
                  {renderItemSelector(drinkItems, language === 'ar' ? 'مشروبات' : 'Drinks')}
                  <button
                    onClick={() => setStep('summary')}
                    className="w-full btn-secondary py-4 rounded-xl text-lg"
                  >
                    {language === 'ar' ? 'عرض الملخص' : 'View Summary'}
                  </button>
                </div>
              )}

              {/* Summary */}
              {step === 'summary' && (
                <div className="animate-fade-in">
                  <div className="bg-muted p-5 rounded-2xl rounded-tr-sm mb-4">
                    <p className="font-bold mb-3 text-lg">{t.orderSummary}</p>
                    <div className="space-y-2">
                      {Object.entries(selectedItems).map(([itemId, qty]) => {
                        const item = menuItems.find(i => i.id === itemId);
                        if (!item) return null;
                        return (
                          <div key={itemId} className="flex justify-between">
                            <span>
                              {language === 'ar' ? item.nameAr : item.nameEn} x{qty}
                            </span>
                            <span className="font-medium">
                              {(item.price * qty).toFixed(2)} {t.sar}
                            </span>
                          </div>
                        );
                      })}
                      <div className="border-t border-border pt-2 flex justify-between font-bold text-lg">
                        <span>{t.total}</span>
                        <span className="text-primary">{calculateTotal().toFixed(2)} {t.sar}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-muted p-5 rounded-2xl rounded-tr-sm mb-4">
                    <p className="text-lg">{language === 'ar' 
                      ? 'هل تريد تعديل أي شيء في الطلب أم المتابعة للدفع؟' 
                      : 'Would you like to modify anything or proceed to payment?'}</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep('desserts')}
                      className="flex-1 py-4 rounded-xl border-2 border-border 
                                 hover:border-primary transition-colors"
                    >
                      {t.modifyOrder}
                    </button>
                    <button
                      onClick={() => hasCompleteProfile ? handleAddToCart() : setStep('phone')}
                      className="flex-1 btn-secondary py-4 rounded-xl"
                    >
                      {t.proceedToPayment}
                    </button>
                  </div>
                </div>
              )}

              {/* Phone - Smart: Skip if user is logged in */}
              {step === 'phone' && (
                <div className="animate-fade-in space-y-4">
                  {hasCompleteProfile ? (
                    <>
                      {/* User is logged in - show smart message */}
                      <div className="bg-muted p-5 rounded-2xl rounded-tr-sm">
                        <p className="text-lg">
                          {language === 'ar' 
                            ? `لدي بياناتك يا ${userProfile.name}. هل أرسل الطلب لعنوانك المحفوظ أو عنوان جديد؟`
                            : `I have your details, ${userProfile.name}. Should I send this order to your saved address or a new one?`}
                        </p>
                      </div>
                      
                      {/* Saved phone display (read-only) */}
                      <div className="bg-success/10 p-4 rounded-xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                          ✓
                        </div>
                        <div>
                          <p className="font-medium">{userProfile.name}</p>
                          <p className="text-sm text-muted-foreground" dir="ltr">{userProfile.phone}</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={handleAddToCart}
                        className="w-full btn-secondary py-5 rounded-xl font-bold text-lg
                                   flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-6 h-6" />
                        {t.addToCart}
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Guest user - ask for details */}
                      <div className="bg-muted p-5 rounded-2xl rounded-tr-sm">
                        <p className="text-lg">
                          {language === 'ar' ? 'أدخل بياناتك للمتابعة' : 'Enter your details to continue'}
                        </p>
                      </div>
                      
                      <input
                        type="text"
                        value={nameInput}
                        onChange={e => setNameInput(e.target.value)}
                        className="input-arabic w-full text-lg py-4"
                        placeholder={t.name}
                      />
                      
                      <input
                        type="tel"
                        value={phoneInput}
                        onChange={e => handlePhoneCheck(normalizePhoneNumber(e.target.value))}
                        className="input-arabic w-full text-lg py-4"
                        placeholder="05XXXXXXXX أو ٠٥XXXXXXXX"
                        dir="ltr"
                      />
                      
                      {phoneChecked && (
                        <div className={`p-4 rounded-xl ${
                          hasDiscount 
                            ? 'bg-success/10 text-success' 
                            : 'bg-accent/10 text-accent-foreground'
                        }`}>
                          {hasDiscount ? t.firstOrderCongrats : t.welcomeBack + ' ' + nameInput}
                        </div>
                      )}
                      
                      <button
                        onClick={handleAddToCart}
                        disabled={!nameInput || !phoneInput || phoneInput.length < 10}
                        className="w-full btn-secondary py-5 rounded-xl font-bold text-lg
                                   flex items-center justify-center gap-2
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart className="w-6 h-6" />
                        {t.addToCart}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Done */}
              {step === 'done' && (
                <div className="animate-fade-in text-center py-8">
                  <div className="text-7xl mb-4">✅</div>
                  <h3 className="text-2xl font-bold mb-2">
                    {language === 'ar' ? 'تمت إضافة الطلب للسلة!' : 'Order added to cart!'}
                  </h3>
                  <button
                    onClick={handleClose}
                    className="btn-secondary px-10 py-4 rounded-xl mt-4 text-lg"
                  >
                    {language === 'ar' ? 'إغلاق' : 'Close'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
