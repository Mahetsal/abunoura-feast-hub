import { useApp } from '@/context/AppContext';
import { restaurantInfo } from '@/data/menu';
import { Utensils, Phone } from 'lucide-react';

export function SpecialOrdersBanner() {
  const { language } = useApp();

  const handleWhatsAppClick = () => {
    const message = language === 'ar' 
      ? 'السلام عليكم، أرغب في طلب تجهيز وليمة كبيرة'
      : 'Hello, I would like to order a large banquet';
    const whatsappUrl = `https://wa.me/966${restaurantInfo.phone.slice(1)}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="relative overflow-hidden rounded-3xl 
                        bg-gradient-to-br from-primary via-primary to-[hsl(var(--brand-red-dark))]
                        border-4 border-[hsl(var(--gold))]
                        shadow-[0_0_40px_-10px_hsl(var(--gold)/0.3)]">
          
          {/* Decorative gold corners */}
          <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-[hsl(var(--gold))] rounded-tl-3xl" />
          <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-[hsl(var(--gold))] rounded-tr-3xl" />
          <div className="absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-[hsl(var(--gold))] rounded-bl-3xl" />
          <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-[hsl(var(--gold))] rounded-br-3xl" />

          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" 
                 style={{
                   backgroundImage: `radial-gradient(circle at 20% 50%, hsl(var(--gold)) 1px, transparent 1px),
                                    radial-gradient(circle at 80% 50%, hsl(var(--gold)) 1px, transparent 1px)`,
                   backgroundSize: '40px 40px'
                 }} 
            />
          </div>

          <div className="relative z-10 px-6 py-10 md:px-12 md:py-14 text-center">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-[hsl(var(--gold))]/20 rounded-full border-2 border-[hsl(var(--gold))]/40">
                <Utensils className="w-10 h-10 md:w-12 md:h-12 text-[hsl(var(--gold))]" />
              </div>
            </div>

            {/* Main Text */}
            <h2 className="font-bold text-2xl md:text-4xl text-primary-foreground mb-4 leading-relaxed">
              {language === 'ar' 
                ? 'عندك عزيمة؟ نبيّض وجهك في ولائمك الكبرى'
                : 'Have an occasion? We\'ll make your grand feasts unforgettable'}
            </h2>

            {/* Subtitle */}
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
              {language === 'ar'
                ? 'نخدم المناسبات الكبيرة والعزائم بأفخر الولائم'
                : 'We serve large events and gatherings with the finest feasts'}
            </p>

            {/* CTA Button */}
            <button
              onClick={handleWhatsAppClick}
              className="inline-flex items-center gap-3 px-8 py-4 
                         bg-[hsl(var(--gold))] hover:bg-[hsl(42,85%,65%)]
                         text-primary font-bold text-lg rounded-2xl
                         shadow-[0_8px_30px_-5px_hsl(var(--gold)/0.5)]
                         hover:shadow-[0_12px_40px_-5px_hsl(var(--gold)/0.6)]
                         transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Phone className="w-5 h-5" />
              {language === 'ar' ? 'اطلب تجهيز وليمة' : 'Order a Banquet'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
