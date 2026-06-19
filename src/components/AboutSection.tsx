import { useApp } from '@/context/AppContext';

export function AboutSection() {
  const { language } = useApp();

  return (
    <section className="py-12 md:py-16 bg-[hsl(35,30%,92%)]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Decorative top border */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[hsl(var(--gold))]" />
            <div className="w-3 h-3 rotate-45 border-2 border-[hsl(var(--gold))]" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[hsl(var(--gold))]" />
          </div>

          {/* Title */}
          <h2 className="font-amiri text-3xl md:text-4xl font-bold text-primary mb-6">
            {language === 'ar' ? 'حكاية الأصالة' : 'Our Story'}
          </h2>

          {/* Story text */}
          <p className="font-cairo text-lg md:text-xl leading-loose text-foreground/90">
            {language === 'ar' 
              ? 'في مندي أبو نورة، الحكاية بدأت من عشقنا للتراث. نحن لا نقدم مجرد وجبة، بل ننقل لك أسرار طهي المندي في حفر الأرض وعلى لهب الخشب الطبيعي، لنصل لبيتك بنفس الجودة والكرم الذي اعتدت عليه في عزائمنا العربية.'
              : 'At Mandi Abu Noura, our story began with a passion for heritage. We don\'t just serve a meal – we bring you the secrets of traditional mandi, cooked in underground pits over natural wood fire, delivering to your home with the same quality and generosity you\'d expect from our Arab feasts.'}
          </p>

          {/* Decorative bottom border */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[hsl(var(--gold))]" />
            <div className="w-3 h-3 rotate-45 border-2 border-[hsl(var(--gold))]" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[hsl(var(--gold))]" />
          </div>
        </div>
      </div>
    </section>
  );
}
