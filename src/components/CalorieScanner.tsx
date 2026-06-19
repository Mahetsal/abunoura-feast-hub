import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Camera, X, Flame, Dumbbell, Footprints, Sparkles } from 'lucide-react';
import { menuItems } from '@/data/menu';

interface ScanResult {
  dishName: string;
  dishNameAr: string;
  calories: number;
  nutrients: string;
  nutrientsAr: string;
  healthTip: string;
  healthTipAr: string;
}

// Health tips for different calorie ranges
const healthTips = {
  ar: [
    { tip: 'امشِ 15 دقيقة لحرق هذه السعرات', minCal: 0, maxCal: 200 },
    { tip: 'امشِ 30 دقيقة لحرق هذه السعرات', minCal: 200, maxCal: 400 },
    { tip: 'اركض 20 دقيقة لحرق هذه السعرات', minCal: 400, maxCal: 600 },
    { tip: 'اركض 30 دقيقة لحرق هذه السعرات', minCal: 600, maxCal: 800 },
    { tip: 'مارس الرياضة 45 دقيقة لحرق هذه السعرات', minCal: 800, maxCal: 1000 },
    { tip: 'مارس الرياضة ساعة كاملة لحرق هذه السعرات', minCal: 1000, maxCal: Infinity },
  ],
  en: [
    { tip: 'Walk for 15 minutes to burn these calories', minCal: 0, maxCal: 200 },
    { tip: 'Walk for 30 minutes to burn these calories', minCal: 200, maxCal: 400 },
    { tip: 'Jog for 20 minutes to burn these calories', minCal: 400, maxCal: 600 },
    { tip: 'Jog for 30 minutes to burn these calories', minCal: 600, maxCal: 800 },
    { tip: 'Exercise for 45 minutes to burn these calories', minCal: 800, maxCal: 1000 },
    { tip: 'Exercise for a full hour to burn these calories', minCal: 1000, maxCal: Infinity },
  ],
};

// Nutrient descriptions based on category
const nutrientsByCategory: Record<string, { en: string; ar: string }> = {
  main: { en: 'High Protein, Rich in Iron', ar: 'بروتين عالي، غني بالحديد' },
  walaem: { en: 'High Protein, Rich in Iron', ar: 'بروتين عالي، غني بالحديد' },
  sides: { en: 'Carbohydrates, Dietary Fiber', ar: 'كربوهيدرات، ألياف غذائية' },
  salads: { en: 'Vitamins, Low Calories', ar: 'فيتامينات، سعرات منخفضة' },
  sauces: { en: 'Healthy Fats, Antioxidants', ar: 'دهون صحية، مضادات أكسدة' },
  desserts: { en: 'Carbohydrates, Calcium', ar: 'كربوهيدرات، كالسيوم' },
  drinks: { en: 'Hydration, Probiotics', ar: 'ترطيب، بروبيوتيك' },
};

function getHealthTip(calories: number, lang: 'ar' | 'en'): string {
  const tips = healthTips[lang];
  const tip = tips.find(t => calories >= t.minCal && calories < t.maxCal);
  return tip?.tip || tips[tips.length - 1].tip;
}

function getRandomMenuItem(): ScanResult {
  // Filter items that have calories defined
  const itemsWithCalories = menuItems.filter(item => item.calories && item.calories > 0);
  const randomItem = itemsWithCalories[Math.floor(Math.random() * itemsWithCalories.length)];
  
  const nutrients = nutrientsByCategory[randomItem.category] || nutrientsByCategory.main;
  
  return {
    dishName: randomItem.nameEn,
    dishNameAr: randomItem.nameAr,
    calories: randomItem.calories || 500,
    nutrients: nutrients.en,
    nutrientsAr: nutrients.ar,
    healthTip: getHealthTip(randomItem.calories || 500, 'en'),
    healthTipAr: getHealthTip(randomItem.calories || 500, 'ar'),
  };
}

export function CalorieScanner() {
  const { language } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('open:scanner', handler);
    return () => window.removeEventListener('open:scanner', handler);
  }, []);

  const handleOpenCamera = () => {
    fileInputRef.current?.click();
  };

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        setIsAnalyzing(true);
        
        // Simulate AI analysis for 3 seconds - now returns random menu item
        setTimeout(() => {
          setIsAnalyzing(false);
          setResult(getRandomMenuItem());
        }, 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsAnalyzing(false);
    setResult(null);
    setCapturedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleScanAgain = () => {
    setResult(null);
    setCapturedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    handleOpenCamera();
  };

  return (
    <>
      {/* Hidden file input for camera */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageCapture}
        className="hidden"
      />

      {/* Modal */}
      {isOpen && (
        <div className="modal-overlay animate-fade-in" onClick={handleClose}>
          <div 
            className="bg-card rounded-3xl shadow-premium-lg p-6 max-w-sm w-full mx-4 
                       animate-scale-in relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted 
                         transition-colors z-10"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Initial state - prompt to take photo */}
            {!capturedImage && !isAnalyzing && !result && (
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br 
                                from-green-500/20 to-emerald-600/20 flex items-center justify-center">
                  <Camera className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {language === 'ar' ? 'ماسح السعرات الذكي' : 'Smart Calorie Scanner'}
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  {language === 'ar' 
                    ? 'التقط صورة لوجبتك وسيقوم الذكاء الاصطناعي بتحليلها'
                    : 'Take a photo of your meal and AI will analyze it'}
                </p>
                <button
                  onClick={handleOpenCamera}
                  className="btn-primary px-6 py-3 rounded-xl flex items-center gap-2 mx-auto"
                >
                  <Camera className="w-5 h-5" />
                  {language === 'ar' ? 'افتح الكاميرا' : 'Open Camera'}
                </button>
              </div>
            )}

            {/* Analyzing state */}
            {isAnalyzing && (
              <div className="text-center py-12">
                {/* Captured image preview */}
                {capturedImage && (
                  <div className="w-24 h-24 mx-auto mb-6 rounded-2xl overflow-hidden 
                                  ring-4 ring-primary/20">
                    <img 
                      src={capturedImage} 
                      alt="Captured meal" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Loading animation */}
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                  <div className="absolute inset-0 rounded-full border-4 border-transparent 
                                  border-t-primary animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
                </div>
                
                <h3 className="text-lg font-bold text-foreground mb-1">
                  {language === 'ar' ? 'الذكاء الاصطناعي يحلل الوجبة...' : 'AI Analyzing Meal...'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'يرجى الانتظار' : 'Please wait'}
                </p>
              </div>
            )}

            {/* Result state */}
            {result && !isAnalyzing && (
              <div className="py-4">
                {/* Header */}
                <div className="text-center mb-4">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br 
                                  from-green-500 to-emerald-600 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    {language === 'ar' ? 'نتيجة التحليل' : 'Analysis Result'}
                  </h3>
                </div>

                {/* Captured image */}
                {capturedImage && (
                  <div className="w-full h-32 rounded-xl overflow-hidden mb-4">
                    <img 
                      src={capturedImage} 
                      alt="Analyzed meal" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Result card */}
                <div className="bg-muted/50 rounded-2xl p-4 space-y-3 mb-4">
                  {/* Dish name */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'الطبق الرئيسي' : 'Main Dish'}
                    </span>
                    <span className="font-bold text-foreground">
                      {language === 'ar' ? result.dishNameAr : result.dishName}
                    </span>
                  </div>

                  {/* Calories */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Flame className="w-4 h-4 text-orange-500" />
                      {language === 'ar' ? 'السعرات المقدرة' : 'Estimated Calories'}
                    </span>
                    <span className="font-bold text-orange-600">
                      {result.calories} {language === 'ar' ? 'سعرة' : 'kcal'}
                    </span>
                  </div>

                  {/* Nutrients */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Dumbbell className="w-4 h-4 text-blue-500" />
                      {language === 'ar' ? 'العناصر الغذائية' : 'Nutrients'}
                    </span>
                    <span className="font-medium text-foreground text-sm">
                      {language === 'ar' ? result.nutrientsAr : result.nutrients}
                    </span>
                  </div>
                </div>

                {/* Health tip */}
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 
                                flex items-start gap-3">
                  <Footprints className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-700 dark:text-green-400">
                    {language === 'ar' ? result.healthTipAr : result.healthTip}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleScanAgain}
                    className="flex-1 btn-secondary py-2.5 rounded-xl text-sm"
                  >
                    {language === 'ar' ? 'مسح آخر' : 'Scan Again'}
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex-1 btn-primary py-2.5 rounded-xl text-sm"
                  >
                    {language === 'ar' ? 'إغلاق' : 'Close'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
