import { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { MapPin, Star, X, Share2, RefreshCw, Navigation, Phone, MessageCircle, Car, User, Gamepad2 } from 'lucide-react';
import { restaurantInfo } from '@/data/menu';
import { getOrderTimerRemainingSeconds } from '@/lib/orderTimer';
import { GameHub } from './games';

// Pool of demo drivers - randomly selected for each order
const demoDrivers = [
  {
    nameAr: 'أحمد الشمري',
    nameEn: 'Ahmed Al-Shammari',
    phone: '+966551234567',
    carTypeAr: 'تويوتا كامري',
    carTypeEn: 'Toyota Camry',
    carColor: 'أبيض',
    carNumber: 'أ ب ج 1234',
    rating: 4.9,
  },
  {
    nameAr: 'محمد العتيبي',
    nameEn: 'Mohammed Al-Otaibi',
    phone: '+966559876543',
    carTypeAr: 'هيونداي أكسنت',
    carTypeEn: 'Hyundai Accent',
    carColor: 'فضي',
    carNumber: 'ب ن ك 5678',
    rating: 4.8,
  },
  {
    nameAr: 'خالد الدوسري',
    nameEn: 'Khaled Al-Dosari',
    phone: '+966554321098',
    carTypeAr: 'نيسان صني',
    carTypeEn: 'Nissan Sunny',
    carColor: 'أسود',
    carNumber: 'ر س م 9012',
    rating: 4.7,
  },
  {
    nameAr: 'عبدالله القحطاني',
    nameEn: 'Abdullah Al-Qahtani',
    phone: '+966556789012',
    carTypeAr: 'كيا سيراتو',
    carTypeEn: 'Kia Cerato',
    carColor: 'رمادي',
    carNumber: 'هـ و ز 3456',
    rating: 4.9,
  },
  {
    nameAr: 'فهد الحربي',
    nameEn: 'Fahad Al-Harbi',
    phone: '+966552345678',
    carTypeAr: 'تويوتا يارس',
    carTypeEn: 'Toyota Yaris',
    carColor: 'أزرق',
    carNumber: 'ل م ن 7890',
    rating: 4.6,
  },
];

interface OrderTrackingProps {
  isOpen: boolean;
  onClose: () => void;
  onNewOrder: () => void;
}

export function OrderTracking({ isOpen, onClose, onNewOrder }: OrderTrackingProps) {
  const {
    t,
    language,
    orderInfo,
    currentOrderId,
    orderStatus,
    setOrderStatus,
    playSound,
    activeOrder,
    registerPhone,
    addItemRating,
  } = useApp();

  const cart = activeOrder?.items || [];
  const grandTotal = activeOrder?.total || 0;

  const [progress, setProgress] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [restaurantRating, setRestaurantRating] = useState(0);
  const [driverRating, setDriverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [cookingTimeRemaining, setCookingTimeRemaining] = useState(() => getOrderTimerRemainingSeconds());

  // Randomly select a driver for this order (memoized to stay consistent during the order)
  const currentDriver = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * demoDrivers.length);
    return demoDrivers[randomIndex];
  }, [currentOrderId]); // Changes when order ID changes

  // Cooking countdown timer (synced with persistent top timer)
  useEffect(() => {
    if (!isOpen || orderStatus !== 'cooking') return;

    const tick = () => setCookingTimeRemaining(getOrderTimerRemainingSeconds());
    tick();

    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [isOpen, orderStatus]);

  // Simulate order progress with extended cooking time
  useEffect(() => {
    if (!isOpen || orderStatus === 'idle') return;

    const stages = orderInfo.deliveryMethod === 'delivery' 
      ? ['confirmed', 'cooking', 'on-the-way', 'delivered']
      : ['confirmed', 'cooking', 'ready-for-pickup'];

    let currentStage = stages.indexOf(orderStatus);
    
    if (currentStage === -1) currentStage = 0;

    // Cooking stage is 45 seconds, others are shorter
    const getStageDelay = (stage: string) => {
      if (stage === 'cooking') return 45000; // 45 seconds for cooking
      return 5000; // 5 seconds for other stages
    };

    const timer = setTimeout(() => {
      if (currentStage < stages.length - 1) {
        const nextStage = stages[currentStage + 1];
        setOrderStatus(nextStage as typeof orderStatus);
        playSound('ding');
        
        // Timer is persisted via AppContext/TopPreparationBar; no local reset here
        // Update progress
        setProgress(((currentStage + 1) / (stages.length - 1)) * 100);
        
        // Show rating at the end
        if (currentStage + 1 === stages.length - 1) {
          setTimeout(() => setShowRating(true), 1000);
          
          // Register phone
          registerPhone(orderInfo.phone);
        }
      }
    }, getStageDelay(stages[currentStage]));

    return () => clearTimeout(timer);
  }, [isOpen, orderStatus]);

  // Reset progress on open
  useEffect(() => {
    if (isOpen) {
      setProgress(0);
      setShowRating(false);
      setRatingSubmitted(false);
      setRestaurantRating(0);
      setDriverRating(0);
      setComment('');
      setShowGame(false);
      setGameScore(0);
      setCookingTimeRemaining(getOrderTimerRemainingSeconds());
    }
  }, [isOpen]);

  const handleShare = () => {
    const text = language === 'ar' 
      ? `تتبع طلبي من مندي أبو نورة! رقم الطلب: ${currentOrderId}`
      : `Track my order from Mandi Abu Noura! Order #${currentOrderId}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleWhatsAppSummary = () => {
    const itemsList = cart.map(item => {
      const name = language === 'ar' ? item.nameAr : item.nameEn;
      return `  • ${name} ×${item.quantity} — ${(item.price * item.quantity).toFixed(2)} ${language === 'ar' ? 'ر.س' : 'SAR'}`;
    }).join('\n');

    const notes = orderInfo.orderNotes ? `\n📝 ${language === 'ar' ? 'ملاحظات' : 'Notes'}: ${orderInfo.orderNotes}` : '';

    const text = language === 'ar'
      ? `🍚 *طلب جديد من مندي أبو نورة*\n\n` +
        `👤 الاسم: ${orderInfo.name}\n` +
        `📞 الجوال: ${orderInfo.phone}\n` +
        `📍 العنوان: ${orderInfo.address || 'استلام من الفرع'}\n\n` +
        `*الأصناف:*\n${itemsList}\n\n` +
        `💰 الإجمالي: ${grandTotal.toFixed(2)} ر.س` +
        notes
      : `🍚 *New Order — Mandi Abu Noura*\n\n` +
        `👤 Name: ${orderInfo.name}\n` +
        `📞 Phone: ${orderInfo.phone}\n` +
        `📍 Address: ${orderInfo.address || 'Branch pickup'}\n\n` +
        `*Items:*\n${itemsList}\n\n` +
        `💰 Total: ${grandTotal.toFixed(2)} SAR` +
        notes;

    const restaurantPhone = '966500000000'; // Replace with actual WhatsApp Business number
    const whatsappUrl = `https://wa.me/${restaurantPhone}?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDirections = () => {
    window.open(restaurantInfo.googleMapsUrl, '_blank');
  };

  const submitRating = () => {
    playSound('success');
    // Save per-item ratings if restaurant was rated
    if (restaurantRating > 0) {
      cart.forEach(item => {
        const baseId = item.id.replace(/(-spicy|-normal|-noraisins|-nonuts)+/g, '').split('-note-')[0];
        addItemRating({
          itemId: baseId,
          rating: restaurantRating,
          comment: comment || undefined,
          date: new Date().toISOString(),
        });
      });
    }
    setRatingSubmitted(true);
  };

  if (!isOpen) return null;

  const statusSteps = orderInfo.deliveryMethod === 'delivery'
    ? [
        { key: 'confirmed', label: t.orderReceived, icon: '📋' },
        { key: 'cooking', label: t.cooking, icon: '👨‍🍳' },
        { key: 'on-the-way', label: t.onTheWay, icon: '🚗' },
        { key: 'delivered', label: t.delivered, icon: '✅' },
      ]
    : [
        { key: 'confirmed', label: t.orderReceived, icon: '📋' },
        { key: 'cooking', label: t.cooking, icon: '👨‍🍳' },
        { key: 'ready-for-pickup', label: t.readyForPickup, icon: '✅' },
      ];

  const currentStepIndex = statusSteps.findIndex(s => s.key === orderStatus);

  return (
    <div className="modal-overlay animate-fade-in">
      <div 
        className="bg-card rounded-3xl shadow-premium-lg w-full max-w-lg max-h-[90vh] 
                   overflow-y-auto animate-scale-in"
      >
        {/* Header */}
        <div className="bg-primary text-primary-foreground p-6 rounded-t-3xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{t.tracking}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-primary-foreground/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-sm opacity-80">{t.orderNumber}</p>
            <p className="text-2xl font-bold">{currentOrderId}</p>
            {orderInfo.isScheduled && orderInfo.scheduledTime && (
              <p className="text-sm mt-2 bg-primary-foreground/20 rounded-full px-4 py-1 inline-block">
                {t.reservedFor}: {orderInfo.scheduledTime}
              </p>
            )}
            {orderInfo.orderNotes && (
              <p className="text-xs mt-2 bg-white/10 rounded-xl px-3 py-1.5 inline-block text-start">
                📝 {orderInfo.orderNotes}
              </p>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Progress Steps */}
          <div className="relative">
            {/* Progress Bar */}
            <div className="absolute top-5 right-5 left-5 h-1 bg-muted rounded-full">
              <div 
                className="h-full bg-gradient-to-l from-primary to-accent rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Steps */}
            <div className="flex justify-between relative">
              {statusSteps.map((step, index) => {
                const isActive = index <= currentStepIndex;
                const isCurrent = step.key === orderStatus;
                
                return (
                  <div key={step.key} className="flex flex-col items-center">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg
                                 transition-all duration-300 ${
                        isActive 
                          ? 'bg-primary text-primary-foreground shadow-premium' 
                          : 'bg-muted text-muted-foreground'
                      } ${isCurrent ? 'ring-4 ring-primary/30 animate-pulse' : ''}`}
                    >
                      {step.icon}
                    </div>
                    <span className={`text-xs mt-2 text-center max-w-16 ${
                      isActive ? 'text-foreground font-medium' : 'text-muted-foreground'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Message with Cooking Timer */}
          <div className="bg-muted/50 p-4 rounded-xl text-center">
            {orderStatus === 'cooking' && (
              <>
                <p className="text-lg">{t.preparingOrder}</p>
                <div className="mt-3 flex items-center justify-center gap-3">
                  <div className="text-2xl font-bold text-primary">
                    {Math.floor(cookingTimeRemaining / 60)}:{(cookingTimeRemaining % 60).toString().padStart(2, '0')}
                  </div>
                  <span className="text-muted-foreground text-sm">
                    {language === 'ar' ? 'متبقي' : 'remaining'}
                  </span>
                </div>
                {/* Game Toggle Button with Pulse */}
                <button
                  onClick={() => setShowGame(!showGame)}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full
                             bg-secondary text-secondary-foreground text-sm font-medium
                             hover:bg-secondary/90 transition-all hover:scale-105 shadow-lg"
                  style={{
                    animation: !showGame ? 'breathing-pulse 2s ease-in-out infinite' : 'none',
                  }}
                >
                  <Gamepad2 className="w-4 h-4" />
                  {showGame 
                    ? (language === 'ar' ? 'إخفاء اللعبة' : 'Hide Game')
                    : (language === 'ar' ? 'العب واربح!' : 'Play & Win!')}
                </button>
              </>
            )}
            {orderStatus === 'on-the-way' && (
              <p className="text-lg">🚗 {t.onTheWay}...</p>
            )}
            {orderStatus === 'ready-for-pickup' && (
              <p className="text-lg">{t.pickupMessage}</p>
            )}
            {orderStatus === 'delivered' && (
              <p className="text-lg text-success font-bold">✅ {t.delivered}!</p>
            )}
            
            {orderInfo.deliveryMethod === 'pickup' && orderStatus === 'cooking' && (
              <p className="text-sm text-muted-foreground mt-2">
                {t.readyIn} ~45 {language === 'ar' ? 'ثانية' : 'seconds'}
              </p>
            )}
          </div>

          {/* Game Hub - 3 Mini Games */}
          {orderStatus === 'cooking' && showGame && (
            <GameHub 
              isActive={showGame} 
              onScoreChange={setGameScore}
            />
          )}

          {/* Game Score Display (when game was played) */}
          {gameScore > 0 && !showGame && (
            <div className="bg-gradient-to-r from-secondary to-secondary/80 p-3 rounded-xl 
                            flex items-center justify-between text-secondary-foreground">
              <span className="text-sm">
                {language === 'ar' ? 'نقاط تحدي الكرم:' : 'Generosity Challenge Score:'}
              </span>
              <span className="font-bold text-lg text-[hsl(var(--gold))]">{gameScore}</span>
            </div>
          )}

          {/* Driver Info Card - Shows when order is on the way */}
          {orderInfo.deliveryMethod === 'delivery' && (orderStatus === 'on-the-way' || orderStatus === 'delivered') && (
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 p-4 rounded-2xl">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Car className="w-5 h-5 text-primary" />
                {language === 'ar' ? 'معلومات السائق' : 'Driver Info'}
              </h3>
              
              <div className="flex items-start gap-4">
                {/* Driver Avatar */}
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-8 h-8 text-primary" />
                </div>
                
                {/* Driver Details */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg">
                      {language === 'ar' ? currentDriver.nameAr : currentDriver.nameEn}
                    </span>
                    <div className="flex items-center gap-1 bg-[hsl(var(--gold))]/20 px-2 py-0.5 rounded-full">
                      <Star className="w-4 h-4 fill-[hsl(var(--gold))] text-[hsl(var(--gold))]" />
                      <span className="text-sm font-medium">{currentDriver.rating}</span>
                    </div>
                  </div>
                  
                  {/* Car Info */}
                  <div className="text-sm text-muted-foreground">
                    <span>{language === 'ar' ? currentDriver.carTypeAr : currentDriver.carTypeEn}</span>
                    <span className="mx-2">•</span>
                    <span>{currentDriver.carColor}</span>
                    <span className="mx-2">•</span>
                    <span className="font-mono font-medium text-foreground">{currentDriver.carNumber}</span>
                  </div>
                </div>
              </div>
              
              {/* Contact Buttons */}
              <div className="flex gap-3 mt-4">
                <a
                  href={`tel:${currentDriver.phone}`}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium
                             flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  {language === 'ar' ? 'اتصال' : 'Call'}
                </a>
                <a
                  href={`https://wa.me/${currentDriver.phone.replace('+', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 rounded-xl bg-[#25D366] text-white font-medium
                             flex items-center justify-center gap-2 hover:bg-[#25D366]/90 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  {language === 'ar' ? 'واتساب' : 'WhatsApp'}
                </a>
              </div>
            </div>
          )}

          {/* Delivery Map Animation */}
          {orderInfo.deliveryMethod === 'delivery' && orderStatus === 'on-the-way' && (
            <div className="map-container h-48 bg-gradient-to-br from-muted to-muted/50 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Simple animated path */}
                <svg className="w-full h-full" viewBox="0 0 300 100">
                  <path
                    d="M 20 50 Q 100 20, 150 50 T 280 50"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="3"
                    strokeDasharray="8,4"
                    className="animate-draw-line"
                  />
                  {/* Start point - Restaurant */}
                  <circle cx="20" cy="50" r="8" fill="hsl(var(--primary))" />
                  <text x="20" y="75" fontSize="10" textAnchor="middle" fill="hsl(var(--foreground))">
                    {language === 'ar' ? 'المطعم' : 'Restaurant'}
                  </text>
                  
                  {/* End point - Destination */}
                  <circle cx="280" cy="50" r="8" fill="hsl(var(--success))" />
                  <text x="280" y="75" fontSize="10" textAnchor="middle" fill="hsl(var(--foreground))">
                    {language === 'ar' ? 'موقعك' : 'You'}
                  </text>
                  
                  {/* Moving car */}
                  <g className="animate-car-move">
                    <text fontSize="24" y="55" dominantBaseline="middle">🚗</text>
                  </g>
                </svg>
              </div>
            </div>
          )}

          {/* Pickup Info */}
          {orderInfo.deliveryMethod === 'pickup' && (
            <div className="bg-muted/30 p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="font-medium">{restaurantInfo.addressAr}</span>
              </div>
              <button
                onClick={handleDirections}
                className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2"
              >
                <Navigation className="w-5 h-5" />
                {t.directions}
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="flex-1 py-3 rounded-xl border-2 border-border 
                         hover:border-primary transition-colors font-medium
                         flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              {t.shareOrder}
            </button>
            <button
              onClick={onNewOrder}
              className="flex-1 btn-secondary py-3 rounded-xl font-medium
                         flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              {t.newOrder}
            </button>
          </div>

          {/* WhatsApp Order Summary */}
          <button
            onClick={handleWhatsAppSummary}
            className="w-full py-3 rounded-xl bg-[#25D366] text-white font-semibold
                       hover:bg-[#25D366]/90 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <MessageCircle className="w-5 h-5" />
            {language === 'ar' ? 'إرسال ملخص الطلب عبر واتساب' : 'Send Order Summary via WhatsApp'}
          </button>
        </div>

        {/* Rating Modal */}
        {showRating && !ratingSubmitted && (
          <div className="absolute inset-0 bg-background/95 rounded-3xl p-6 
                         flex flex-col items-center justify-center animate-fade-in">
            <h3 className="text-2xl font-bold mb-6">{t.rating}</h3>
            
            {/* Restaurant Rating */}
            <div className="text-center mb-6">
              <p className="font-medium mb-2">{t.rateRestaurant}</p>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setRestaurantRating(star)}
                    className="star-rating"
                  >
                    {star <= restaurantRating ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
            </div>

            {/* Driver Rating (only for delivery) */}
            {orderInfo.deliveryMethod === 'delivery' && (
              <div className="text-center mb-6">
                <p className="font-medium mb-2">{t.rateDriver}</p>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setDriverRating(star)}
                      className="star-rating"
                    >
                      {star <= driverRating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Comment */}
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder={t.comment}
              className="input-arabic w-full h-24 resize-none mb-4"
            />

            <button
              onClick={submitRating}
              disabled={restaurantRating === 0}
              className="w-full btn-secondary py-4 rounded-xl font-bold
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t.submit}
            </button>
          </div>
        )}

        {/* Thank you message */}
        {ratingSubmitted && (
          <div className="absolute inset-0 bg-background rounded-3xl p-6 
                         flex flex-col items-center justify-center animate-fade-in">
            <div className="text-6xl mb-4">🙏</div>
            <h3 className="text-2xl font-bold mb-2">
              {language === 'ar' ? 'شكراً لتقييمك!' : 'Thank you!'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {language === 'ar' ? 'نتطلع لخدمتك مرة أخرى' : 'We look forward to serving you again'}
            </p>
            <button
              onClick={onNewOrder}
              className="btn-secondary px-8 py-3 rounded-xl font-bold"
            >
              {t.newOrder}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
