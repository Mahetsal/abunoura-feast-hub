import { useApp } from '@/context/AppContext';
import { Sparkles, Eye } from 'lucide-react';

const features = [
  {
    icon: <Eye className="w-8 h-8" />,
    titleAr: 'ماسح السعرات الذكي',
    titleEn: 'Smart Calorie Scanner',
    descAr: 'التقط صورة لأي طبق وسيقوم الذكاء الاصطناعي بتحليل السعرات والعناصر الغذائية فوراً.',
    descEn: 'Take a photo of any dish and AI will instantly analyze calories and nutrients.',
    gradient: 'from-emerald-500 to-green-600',
    emoji: '📸',
  },
];

export function AIFeaturesSection() {
  const { language } = useApp();

  const handleFeatureClick = () => {
    // Calorie Scanner
    window.dispatchEvent(new CustomEvent('open:scanner'));
  };

  return (
    <section className="py-10 md:py-14">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Sparkles className="w-6 h-6 text-accent" />
          <h2 className="text-2xl md:text-3xl font-bold text-foreground font-cairo">
            {language === 'ar' ? 'مزايا الذكاء الاصطناعي' : 'AI-Powered Features'}
          </h2>
          <Sparkles className="w-6 h-6 text-accent" />
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 max-w-md mx-auto">
          {features.map((feature, i) => (
            <div
              key={i}
              onClick={handleFeatureClick}
              className="food-card p-6 flex flex-col items-center text-center gap-4 group
                         hover:shadow-premium hover:border-primary/30 cursor-pointer active:scale-98 transition-all duration-300"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient}
                               flex items-center justify-center text-white shadow-lg
                               group-hover:scale-110 transition-transform duration-300`}>
                <span className="text-3xl">{feature.emoji}</span>
              </div>
              
              <h3 className="text-lg font-bold text-foreground font-cairo">
                {language === 'ar' ? feature.titleAr : feature.titleEn}
              </h3>
              
              <p className="text-sm text-muted-foreground leading-relaxed font-cairo">
                {language === 'ar' ? feature.descAr : feature.descEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

