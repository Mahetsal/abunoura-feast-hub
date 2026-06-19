import { useState, useEffect } from 'react';
import { useApp, SavedAddress, promoCodes } from '@/context/AppContext';
import { X, MapPin, CreditCard, Banknote, Smartphone, Clock, ChevronDown, Home, Briefcase, Users, Plus, Check, Tag, Leaf, Trash2, Wallet, Apple } from 'lucide-react';
import { restaurantInfo } from '@/data/menu';
import { normalizePhoneNumber } from '@/lib/phoneUtils';
import { PickupReadyTimer } from './PickupReadyTimer';
import { toast } from 'sonner';

// Payment method configuration
const paymentMethods = [
  { 
    id: 'mada', 
    nameAr: 'مدى / فيزا / ماستركارد', 
    nameEn: 'Mada / Visa / Mastercard',
    icon: CreditCard,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  { 
    id: 'apple-pay', 
    nameAr: 'Apple Pay', 
    nameEn: 'Apple Pay',
    icon: Apple,
    color: 'text-gray-900',
    bgColor: 'bg-gray-100',
  },
  { 
    id: 'stc-pay', 
    nameAr: 'STC Pay', 
    nameEn: 'STC Pay',
    icon: Smartphone,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  { 
    id: 'cash', 
    nameAr: 'الدفع عند الاستلام', 
    nameEn: 'Cash on Delivery',
    icon: Banknote,
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
];

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

// Address label icons
const addressIcons: Record<string, React.ReactNode> = {
  home: <Home className="w-5 h-5" />,
  work: <Briefcase className="w-5 h-5" />,
  friend: <Users className="w-5 h-5" />,
  other: <MapPin className="w-5 h-5" />,
};

export function CheckoutModal({ isOpen, onClose, onConfirm }: CheckoutModalProps) {
  const {
    t,
    language,
    orderInfo,
    setOrderInfo,
    isFirstOrder,
    setHasDiscount,
    hasDiscount,
    subtotal,
    vatAmount,
    deliveryFee,
    discountAmount,
    tipAmount,
    grandTotal,
    assistantData,
    userProfile,
    setUserProfile,
    addSavedAddress,
    appliedPromoCode,
    applyPromoCode,
    removePromoCode,
    promoDiscount,
  } = useApp();

  const [step, setStep] = useState<'method' | 'details' | 'location' | 'payment'>('method');
  const [phoneChecked, setPhoneChecked] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [showChangeOptions, setShowChangeOptions] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddressLabel, setNewAddressLabel] = useState<'home' | 'work' | 'friend' | 'other'>('home');
  const [newAddressText, setNewAddressText] = useState('');
  const [selectedSavedAddress, setSelectedSavedAddress] = useState<string | null>(null);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoError, setPromoError] = useState(false);

  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [locationErrorMessage, setLocationErrorMessage] = useState<string | null>(null);

  const requestCurrentLocation = async () => {
    setSelectedSavedAddress(null);
    setLocationStatus('loading');
    setLocationErrorMessage(null);

    if (!window.isSecureContext) {
      const msg = language === 'ar'
        ? 'لا يمكن تحديد الموقع إلا عبر اتصال آمن (HTTPS).'
        : 'Location requires a secure context (HTTPS).';
      setLocationStatus('error');
      setLocationErrorMessage(msg);
      return;
    }

    if (!('geolocation' in navigator)) {
      const msg = language === 'ar'
        ? 'المتصفح لا يدعم تحديد الموقع.'
        : 'Browser does not support geolocation.';
      setLocationStatus('error');
      setLocationErrorMessage(msg);
      return;
    }

    // If permission is already denied, browsers won't show the prompt again.
    try {
      const permissions = (navigator as any).permissions;
      if (permissions?.query) {
        const res = await permissions.query({ name: 'geolocation' });
        if (res?.state === 'denied') {
          const msg = language === 'ar'
            ? 'إذن الموقع مرفوض من إعدادات المتصفح. فعّله ثم أعد المحاولة.'
            : 'Location permission is denied in browser settings. Enable it and try again.';
          setLocationStatus('error');
          setLocationErrorMessage(msg);
          return;
        }
      }
    } catch {
      // Ignore permission query failures and fall back to direct request.
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationText = language === 'ar'
          ? `الموقع الحالي (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`
          : `Current Location (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`;

        setOrderInfo(prev => ({ ...prev, address: locationText }));
        setLocationStatus('success');
        setLocationErrorMessage(null);
      },
      (error) => {
        const rawMsg = (error as any)?.message ? String((error as any).message) : '';
        const isPolicyBlocked = /permissions policy|permission policy/i.test(rawMsg);
        const isSecureOriginIssue = /secure origins/i.test(rawMsg);

        let msg = language === 'ar'
          ? 'تعذّر تحديد الموقع. اكتب العنوان يدويًا أو أعد المحاولة.'
          : 'Could not detect location. Enter address manually or try again.';

        if ((error as any)?.code === 1) {
          msg = language === 'ar'
            ? 'تم رفض إذن الموقع. فعّله من إعدادات المتصفح ثم أعد المحاولة.'
            : 'Location permission was denied. Enable it in browser settings and try again.';
        } else if ((error as any)?.code === 3) {
          msg = language === 'ar'
            ? 'انتهت مهلة تحديد الموقع. أعد المحاولة أو اكتب العنوان يدويًا.'
            : 'Location request timed out. Try again or enter address manually.';
        } else if (isPolicyBlocked || isSecureOriginIssue) {
          msg = language === 'ar'
            ? 'المتصفح منع تحديد الموقع داخل هذه الصفحة. جرّب فتح الرابط المنشور مباشرة.'
            : 'Geolocation is blocked on this page. Try the published link.';
        }

        setLocationStatus('error');
        setLocationErrorMessage(msg);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  };


  // Reset step and pre-fill from user profile / userData when modal opens
  // NOTE: This must only run when the modal opens; otherwise it can reset the user's progress
  // due to non-memoized function references from context changing between renders.
  useEffect(() => {
    if (!isOpen) return;

    setStep('method');
    setPhoneChecked(false);
    setShowAddAddress(false);
    setSelectedSavedAddress(null);
    setLocationStatus('idle');
    setLocationErrorMessage(null);

    const savedUser = JSON.parse(localStorage.getItem('userData')) as any;

    // Pre-fill from user profile if available
    if (userProfile?.name || userProfile?.phone) {
      setOrderInfo(prev => ({
        ...prev,
        name: userProfile.name,
        phone: userProfile.phone,
        address: '',
      }));
      // Check if phone qualifies for discount
      if (userProfile.phone.length >= 10) {
        const isNew = isFirstOrder(userProfile.phone);
        setHasDiscount(isNew);
        setPhoneChecked(true);
      }
      return;
    }

    if (savedUser?.name || savedUser?.phone) {
      const nextName = savedUser?.name || '';
      const nextPhone = savedUser?.phone || '';

      // If localStorage has identity, sync it into the global profile to avoid asking twice
      if (nextName && nextPhone && (!userProfile || !userProfile.name || !userProfile.phone)) {
        setUserProfile({ name: nextName, phone: nextPhone, savedAddresses: [] });
      }

      setOrderInfo(prev => ({
        ...prev,
        name: nextName,
        phone: nextPhone,
        address: '',
      }));

      if (nextPhone.length >= 10) {
        const isNew = isFirstOrder(nextPhone);
        setHasDiscount(isNew);
        setPhoneChecked(true);
      }
      return;
    }

    // Clear previous user data for fresh start
    setOrderInfo(prev => ({
      ...prev,
      name: '',
      phone: '',
      address: '',
    }));
  }, [isOpen]);

  const handlePhoneCheck = (phone: string) => {
    if (phone.length >= 10) {
      const isNew = isFirstOrder(phone);
      setHasDiscount(isNew);
      setPhoneChecked(true);
    }
  };

  const timeSlots = () => {
    const slots = [];
    const now = new Date();
    const opening = 12; // 12 PM
    const closing = 24; // 12 AM

    for (let h = opening; h < closing; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hour = h % 24;
        const time = `${hour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        const slotDate = new Date();
        slotDate.setHours(hour, m, 0, 0);
        
        if (slotDate > now) {
          slots.push(time);
        }
      }
    }
    return slots;
  };

  const handleConfirm = async () => {
    // Validate required fields
    if (!orderInfo.name || !orderInfo.phone) {
      return;
    }
    
    // For delivery, require address
    if (orderInfo.deliveryMethod === 'delivery' && !orderInfo.address) {
      return;
    }

    if (orderInfo.paymentMethod !== 'cash') {
      setProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setProcessing(false);
    }
    onConfirm();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade-in z-[300]">
      <div 
        className="bg-card rounded-3xl shadow-premium-lg w-full max-w-lg max-h-[90vh] 
                   overflow-y-auto animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">{t.checkout}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Step: Delivery Method */}
          {step === 'method' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-semibold text-lg">{t.deliveryMethod}</h3>
              
              <div className="grid grid-cols-2 gap-4 relative z-50">
                <button
                  type="button"
                  onClick={() => {
                    console.log('Delivery button clicked');
                    setOrderInfo(prev => ({ ...prev, deliveryMethod: 'delivery' }));
                    requestCurrentLocation();
                    setStep('details');
                  }}
                  style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                  className={`p-6 rounded-2xl border-2 transition-all text-center relative z-50
                             ${orderInfo.deliveryMethod === 'delivery' 
                               ? 'border-primary bg-primary/5' 
                               : 'border-border hover:border-primary/50 bg-card'}`}
                >
                  <div className="text-4xl mb-2">🚗</div>
                  <div className="font-semibold">{t.toLocation}</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    console.log('Pickup button clicked');
                    setOrderInfo(prev => ({ ...prev, deliveryMethod: 'pickup' }));
                    setStep('details');
                  }}
                  style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                  className={`p-6 rounded-2xl border-2 transition-all text-center relative z-50
                             ${orderInfo.deliveryMethod === 'pickup' 
                               ? 'border-primary bg-primary/5' 
                               : 'border-border hover:border-primary/50 bg-card'}`}
                >
                  <div className="text-4xl mb-2">🏪</div>
                  <div className="font-semibold">{t.fromBranch}</div>
                </button>
              </div>

              {orderInfo.deliveryMethod === 'pickup' && (
                <div className="space-y-4">
                  <div className="bg-success/10 text-success p-4 rounded-xl text-center">
                    {t.branchWelcome}
                  </div>
                  
                  {/* Dynamic Pickup Timer with Map */}
                  <PickupReadyTimer isActive={orderInfo.deliveryMethod === 'pickup'} />
                </div>
              )}
            </div>
          )}

          {/* Step: Customer Details */}
          {step === 'details' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-semibold text-lg">{language === 'ar' ? 'بيانات العميل' : 'Customer Details'}</h3>
              
              {userProfile?.name && userProfile?.phone ? (
                <div className="space-y-3">
                  <div className="bg-muted p-4 rounded-xl">
                    <div className="text-sm text-muted-foreground mb-1">{t.name}</div>
                    <div className="font-semibold text-foreground">{userProfile.name}</div>
                  </div>

                  <div className="bg-muted p-4 rounded-xl">
                    <div className="text-sm text-muted-foreground mb-1">{t.phone}</div>
                    <div className="font-semibold text-foreground" dir="ltr">{userProfile.phone}</div>
                  </div>

                  {phoneChecked && (
                    <div className={`p-3 rounded-xl text-sm ${
                      hasDiscount 
                        ? 'bg-success/10 text-success' 
                        : 'bg-accent/10 text-accent-foreground'
                    }`}>
                      {hasDiscount ? t.firstOrderCongrats : t.alreadyRegistered}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t.name}</label>
                    <input
                      type="text"
                      value={orderInfo.name}
                      onChange={e => setOrderInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="input-arabic w-full"
                      placeholder={language === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{t.phone}</label>
                    <input
                      type="tel"
                      value={orderInfo.phone}
                      onChange={e => {
                        // Convert Arabic/Persian numerals to Western automatically
                        const normalizedPhone = normalizePhoneNumber(e.target.value);
                        setOrderInfo(prev => ({ ...prev, phone: normalizedPhone }));
                        handlePhoneCheck(normalizedPhone);
                      }}
                      className="input-arabic w-full"
                      placeholder="05XXXXXXXX أو ٠٥XXXXXXXX"
                      dir="ltr"
                    />

                    {phoneChecked && (
                      <div className={`mt-2 p-3 rounded-xl text-sm ${
                        hasDiscount 
                          ? 'bg-success/10 text-success' 
                          : 'bg-accent/10 text-accent-foreground'
                      }`}>
                        {hasDiscount ? t.firstOrderCongrats : t.alreadyRegistered}
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep('method')}
                  className="flex-1 py-3 rounded-xl border-2 border-border 
                             hover:border-primary transition-colors font-medium"
                >
                  {language === 'ar' ? 'رجوع' : 'Back'}
                </button>
                <button
                  onClick={() => {
                    if (orderInfo.deliveryMethod === 'delivery') {
                      setStep('location');
                      if (!orderInfo.address) requestCurrentLocation();
                      return;
                    }
                    setStep('payment');
                  }}
                  disabled={!orderInfo.name || !orderInfo.phone}
                  className="flex-1 btn-secondary py-3 rounded-xl font-medium 
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {language === 'ar' ? 'التالي' : 'Next'}
                </button>
              </div>
            </div>
          )}

          {/* Step: Location */}
          {step === 'location' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-semibold text-lg">{t.selectLocation}</h3>
              
              {/* Saved Addresses */}
              {userProfile && userProfile.savedAddresses.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    {language === 'ar' ? 'العناوين المحفوظة' : 'Saved Addresses'}
                  </h4>
                  <div className="space-y-2">
                    {userProfile.savedAddresses.map((addr) => (
                      <button
                        key={addr.id}
                        onClick={() => {
                          setSelectedSavedAddress(addr.id);
                          setOrderInfo(prev => ({ ...prev, address: addr.address }));
                        }}
                        className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3
                                   ${selectedSavedAddress === addr.id 
                                     ? 'border-primary bg-primary/5' 
                                     : 'border-border hover:border-primary/50'}`}
                      >
                        <div className="p-2 rounded-full bg-muted">
                          {addressIcons[addr.label]}
                        </div>
                        <div className="flex-1 text-start">
                          <div className="font-medium text-sm">
                            {language === 'ar' ? addr.labelAr : addr.labelEn}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {addr.address}
                          </div>
                        </div>
                        {selectedSavedAddress === addr.id && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

               {/* Auto location (GPS) */}
               <div className="space-y-2">
                 <button
                   type="button"
                   onClick={requestCurrentLocation}
                   disabled={locationStatus === 'loading'}
                   className="w-full p-4 rounded-2xl border-2 border-border hover:border-primary/50 transition-all flex items-center justify-between disabled:opacity-60"
                 >
                   <div className="flex items-center gap-3">
                     <div className="p-2 rounded-full bg-muted">
                       <MapPin className="w-5 h-5 text-primary" />
                     </div>
                     <div className="text-start">
                       <div className="font-medium text-sm">{t.autoLocation}</div>
                       <div className="text-xs text-muted-foreground">
                         {language === 'ar' ? 'سيتم طلب إذن الموقع من المتصفح' : 'Browser will ask for location permission'}
                       </div>
                     </div>
                   </div>
                   <div className="text-xs text-muted-foreground">
                     {locationStatus === 'loading'
                       ? (language === 'ar' ? 'جاري...' : 'Loading...')
                       : (language === 'ar' ? 'تحديد' : 'Detect')}
                   </div>
                 </button>

                 {locationStatus === 'error' && locationErrorMessage && (
                   <div className="bg-destructive/10 text-destructive p-3 rounded-xl text-sm">
                     {locationErrorMessage}
                   </div>
                 )}

                 {locationStatus === 'success' && orderInfo.address && (
                   <div className="bg-success/10 text-success p-3 rounded-xl text-sm">
                     {language === 'ar' ? 'تم تحديد موقعك تلقائياً.' : 'Location detected.'}
                   </div>
                 )}
               </div>

               {/* Manual address input (fallback) */}
               <div className="space-y-2">
                 <label className="block text-sm font-medium">
                   {language === 'ar' ? 'عنوان التوصيل' : 'Delivery address'}
                 </label>
                 <textarea
                   value={orderInfo.address}
                   onChange={e => {
                     setSelectedSavedAddress(null);
                     setOrderInfo(prev => ({ ...prev, address: e.target.value }));
                   }}
                   rows={3}
                   className="input-arabic w-full resize-none"
                   placeholder={language === 'ar' ? 'اكتب الحي والشارع ورقم المبنى…' : 'Type neighborhood, street, building…'}
                 />
               </div>

              {/* Add New Address */}
              {userProfile && (
                <div className="border-t border-border pt-4">
                  {!showAddAddress ? (
                    <button
                      onClick={() => setShowAddAddress(true)}
                      className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="font-medium">
                        {language === 'ar' ? 'إضافة عنوان جديد' : 'Add New Address'}
                      </span>
                    </button>
                  ) : (
                    <div className="space-y-3 animate-fade-in">
                      <div className="flex gap-2">
                        {[
                          { value: 'home', labelAr: 'المنزل', labelEn: 'Home' },
                          { value: 'work', labelAr: 'العمل', labelEn: 'Work' },
                          { value: 'friend', labelAr: 'صديق', labelEn: 'Friend' },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setNewAddressLabel(opt.value as typeof newAddressLabel)}
                            className={`flex-1 p-2 rounded-lg border-2 text-sm flex items-center justify-center gap-1
                                       ${newAddressLabel === opt.value 
                                         ? 'border-primary bg-primary/5' 
                                         : 'border-border'}`}
                          >
                            {addressIcons[opt.value]}
                            <span>{language === 'ar' ? opt.labelAr : opt.labelEn}</span>
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={newAddressText}
                        onChange={e => setNewAddressText(e.target.value)}
                        className="input-arabic w-full"
                        placeholder={language === 'ar' ? 'أدخل العنوان' : 'Enter address'}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setShowAddAddress(false);
                            setNewAddressText('');
                          }}
                          className="flex-1 py-2 rounded-lg border border-border text-sm"
                        >
                          {language === 'ar' ? 'إلغاء' : 'Cancel'}
                        </button>
                        <button
                          onClick={() => {
                            if (newAddressText.trim()) {
                              const labelNames = {
                                home: { ar: 'المنزل', en: 'Home' },
                                work: { ar: 'العمل', en: 'Work' },
                                friend: { ar: 'منزل صديق', en: 'Friend\'s Place' },
                                other: { ar: 'آخر', en: 'Other' },
                              };
                              const newAddr: SavedAddress = {
                                id: `addr-${Date.now()}`,
                                label: newAddressLabel,
                                labelAr: labelNames[newAddressLabel].ar,
                                labelEn: labelNames[newAddressLabel].en,
                                address: newAddressText.trim(),
                              };
                              addSavedAddress(newAddr);
                              setOrderInfo(prev => ({ ...prev, address: newAddressText.trim() }));
                              setSelectedSavedAddress(newAddr.id);
                              setShowAddAddress(false);
                              setNewAddressText('');
                            }
                          }}
                          disabled={!newAddressText.trim()}
                          className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {language === 'ar' ? 'حفظ' : 'Save'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}


              {/* Scheduling */}
              <div className="border-t border-border pt-4">
                <button
                  onClick={() => setShowScheduler(!showScheduler)}
                  className="flex items-center justify-between w-full p-3 rounded-xl 
                             bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">{t.scheduledDelivery}</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform ${showScheduler ? 'rotate-180' : ''}`} />
                </button>

                {showScheduler && (
                  <div className="mt-3 space-y-3 animate-fade-in">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setOrderInfo(prev => ({ ...prev, isScheduled: false, scheduledTime: undefined }))}
                        className={`p-3 rounded-xl border-2 text-sm ${
                          !orderInfo.isScheduled 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border'
                        }`}
                      >
                        {t.now}
                      </button>
                      <button
                        onClick={() => setOrderInfo(prev => ({ ...prev, isScheduled: true }))}
                        className={`p-3 rounded-xl border-2 text-sm ${
                          orderInfo.isScheduled 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border'
                        }`}
                      >
                        {t.schedule}
                      </button>
                    </div>

                    {orderInfo.isScheduled && (
                      <select
                        value={orderInfo.scheduledTime || ''}
                        onChange={e => setOrderInfo(prev => ({ ...prev, scheduledTime: e.target.value }))}
                        className="input-arabic w-full"
                      >
                        <option value="">{t.selectTime}</option>
                        {timeSlots().map(slot => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep('details')}
                  className="flex-1 py-3 rounded-xl border-2 border-border 
                             hover:border-primary transition-colors font-medium"
                >
                  {language === 'ar' ? 'رجوع' : 'Back'}
                </button>
                <button
                  onClick={() => setStep('payment')}
                  disabled={!orderInfo.address}
                  className="flex-1 btn-secondary py-3 rounded-xl font-medium 
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {language === 'ar' ? 'التالي' : 'Next'}
                </button>
              </div>
            </div>
          )}

          {/* Step: Payment */}
          {step === 'payment' && !processing && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-semibold text-lg">{t.paymentMethod}</h3>
              
              {/* Promo Code Section */}
              <div className="bg-gradient-to-r from-accent/10 to-accent/5 p-4 rounded-xl border border-accent/20">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-5 h-5 text-accent" />
                  <span className="font-medium">{language === 'ar' ? 'كود الخصم' : 'Promo Code'}</span>
                </div>
                
                {appliedPromoCode ? (
                  <div className="flex items-center justify-between bg-success/10 text-success p-3 rounded-lg">
                    <div>
                      <span className="font-bold">{appliedPromoCode.code}</span>
                      <span className="mx-2">•</span>
                      <span>{appliedPromoCode.discount}% {language === 'ar' ? 'خصم' : 'off'}</span>
                    </div>
                    <button 
                      onClick={removePromoCode}
                      className="p-1 hover:bg-success/20 rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCodeInput}
                      onChange={e => {
                        setPromoCodeInput(e.target.value.toUpperCase());
                        setPromoError(false);
                      }}
                      placeholder={language === 'ar' ? 'أدخل الكود' : 'Enter code'}
                      className={`input-arabic flex-1 ${promoError ? 'border-destructive' : ''}`}
                    />
                    <button
                      onClick={() => {
                        const success = applyPromoCode(promoCodeInput);
                        if (!success) {
                          setPromoError(true);
                        } else {
                          // Show promo notification
                          const foundCode = promoCodes.find(p => p.code === promoCodeInput.toUpperCase());
                          if (foundCode) {
                            if (foundCode.code === 'KARAM') {
                              toast.success('أهلاً بك يا كرم! تم تطبيق خصم التوصيل المجاني لعيونك. 🎉');
                            } else if (foundCode.code === 'FIRST') {
                              toast.success('أهلاً بك في مندي أبو نورة! نورتنا. خصم 15% على طلبك الأول! 🎁');
                            } else if (foundCode.code === 'KSA96') {
                              toast.success('يوم وطني سعيد! خصم 20% بمناسبة اليوم الوطني 🇸🇦');
                            } else if (foundCode.code === 'RAMADAN') {
                              toast.success('رمضان كريم! خصم 15% على طلبك 🌙');
                            } else if (foundCode.code === 'FLAG') {
                              toast.success('يوم العلم السعودي! خصم 10% على طلبك 🇸🇦');
                            } else {
                              toast.success(language === 'ar' ? `تم تطبيق كود ${foundCode.code} بنجاح!` : `Code ${foundCode.code} applied!`);
                            }
                          }
                          setPromoCodeInput('');
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-accent text-accent-foreground font-medium
                                 hover:bg-accent/90 transition-colors"
                    >
                      {language === 'ar' ? 'تطبيق' : 'Apply'}
                    </button>
                  </div>
                )}
                {promoError && (
                  <p className="text-sm text-destructive mt-2">
                    {language === 'ar' ? 'كود غير صالح' : 'Invalid code'}
                  </p>
                )}
              </div>

              {/* Order Notes / Special Instructions */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <span>📝</span>
                  <span>{language === 'ar' ? 'ملاحظات خاصة (اختياري)' : 'Special Instructions (Optional)'}</span>
                </label>
                <textarea
                  value={orderInfo.orderNotes || ''}
                  onChange={e => setOrderInfo(prev => ({ ...prev, orderNotes: e.target.value }))}
                  rows={2}
                  maxLength={200}
                  className="input-arabic w-full resize-none text-sm"
                  placeholder={language === 'ar' ? 'مثال: بدون بصل، أو اطرق الباب برفق…' : 'e.g. No onions, ring doorbell gently…'}
                />
                {orderInfo.orderNotes && (
                  <p className="text-xs text-muted-foreground text-end">{orderInfo.orderNotes.length}/200</p>
                )}
              </div>

              {/* Eco-Friendly Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-success/5 border border-success/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-success/10">
                    <Leaf className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <div className="font-medium text-success">
                      {language === 'ar' ? 'صديق للبيئة' : 'Eco-Friendly'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {language === 'ar' ? 'بدون أدوات بلاستيكية' : 'No plastic cutlery'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setOrderInfo(prev => ({ ...prev, ecoFriendly: !prev.ecoFriendly }))}
                  className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
                    orderInfo.ecoFriendly ? 'bg-success' : 'bg-muted'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${
                    orderInfo.ecoFriendly ? 'right-1' : 'left-1'
                  }`} />
                </button>
              </div>
              
              {/* Payment Methods Grid - Like Jahez/HungerStation */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">
                  {language === 'ar' ? 'اختر طريقة الدفع' : 'Select Payment Method'}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    const isSelected = orderInfo.paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setOrderInfo(prev => ({ ...prev, paymentMethod: method.id as any }))}
                        className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2
                                   ${isSelected 
                                     ? 'border-primary bg-primary/5 shadow-md' 
                                     : 'border-border hover:border-primary/50'}`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                        <div className={`p-3 rounded-full ${method.bgColor}`}>
                          <Icon className={`w-6 h-6 ${method.color}`} />
                        </div>
                        <span className="font-medium text-sm text-center">
                          {language === 'ar' ? method.nameAr : method.nameEn}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Save card toggle for card payments */}
                {(orderInfo.paymentMethod === 'mada' || orderInfo.paymentMethod === 'apple-pay') && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 animate-fade-in">
                    <span className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'حفظ البطاقة للطلبات القادمة' : 'Save card for future orders'}
                    </span>
                    <button
                      onClick={() => {}}
                      className="w-10 h-5 rounded-full bg-primary relative"
                    >
                      <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white shadow-md" />
                    </button>
                  </div>
                )}
              </div>

              {/* Cash change options */}
              {orderInfo.paymentMethod === 'cash' && (
                <div className="bg-muted/50 p-4 rounded-xl space-y-3">
                  <button
                    onClick={() => setShowChangeOptions(!showChangeOptions)}
                    className="flex items-center justify-between w-full"
                  >
                    <span className="font-medium">{t.needChange}</span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${showChangeOptions ? 'rotate-180' : ''}`} />
                  </button>

                  {showChangeOptions && (
                    <div className="flex flex-wrap gap-2 animate-fade-in">
                      {[100, 200, 500].map(amount => (
                        <button
                          key={amount}
                          onClick={() => setOrderInfo(prev => ({ 
                            ...prev, 
                            needChange: true, 
                            changeAmount: amount 
                          }))}
                          className={`px-4 py-2 rounded-full text-sm transition-all
                                     ${orderInfo.changeAmount === amount
                                       ? 'bg-primary text-primary-foreground'
                                       : 'bg-background border border-border hover:border-primary'}`}
                        >
                          {t.changeFor} {amount} {t.sar}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Driver Tip */}
              {orderInfo.deliveryMethod === 'delivery' && (
                <div className="border-t border-border pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">💝</span>
                    <div>
                      <div className="font-semibold">{t.driverTip}</div>
                      <div className="text-xs text-muted-foreground">{t.tipNote}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {[0, 5, 10, 15].map(amount => (
                      <button
                        key={amount}
                        onClick={() => setOrderInfo(prev => ({ ...prev, driverTip: amount }))}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all
                                   ${orderInfo.driverTip === amount
                                     ? 'bg-accent text-accent-foreground'
                                     : 'bg-muted hover:bg-muted/80'}`}
                      >
                        {amount === 0 ? (language === 'ar' ? 'لا' : 'No') : `${amount} ${t.sar}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="bg-muted/50 p-4 rounded-xl space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.subtotal}</span>
                  <span>{subtotal.toFixed(2)} {t.sar}</span>
                </div>
                {hasDiscount && (
                  <div className="flex justify-between text-success">
                    <span>{t.discount}</span>
                    <span>-{discountAmount.toFixed(2)} {t.sar}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.vat}</span>
                  <span>{vatAmount.toFixed(2)} {t.sar}</span>
                </div>
                {orderInfo.deliveryMethod === 'delivery' && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.deliveryFee}</span>
                    <span>{deliveryFee.toFixed(2)} {t.sar}</span>
                  </div>
                )}
                {tipAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.driverTip}</span>
                    <span>{tipAmount.toFixed(2)} {t.sar}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                  <span>{t.grandTotal}</span>
                  <span className="text-primary">{grandTotal.toFixed(2)} {t.sar}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(orderInfo.deliveryMethod === 'delivery' ? 'location' : 'details')}
                  className="flex-1 py-3 rounded-xl border-2 border-border 
                             hover:border-primary transition-colors font-medium"
                >
                  {language === 'ar' ? 'رجوع' : 'Back'}
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 btn-secondary py-3 rounded-xl font-bold"
                >
                  {t.confirmOrder}
                </button>
              </div>
            </div>
          )}

          {/* Processing */}
          {processing && (
            <div className="text-center py-12 animate-fade-in">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent 
                             rounded-full animate-spin mx-auto mb-4" />
              <p className="text-lg font-medium">{t.processing}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
