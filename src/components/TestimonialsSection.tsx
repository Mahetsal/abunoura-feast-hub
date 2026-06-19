import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Star, ChevronLeft, ChevronRight, Quote, Users } from 'lucide-react';

interface Testimonial {
  id: number;
  textAr: string;
  textEn: string;
  nameAr: string;
  nameEn: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    textAr: 'تجربة تقنية مذهلة، أعجبني جداً كيف يتغير ثيم التطبيق تلقائياً!',
    textEn: 'Amazing tech experience, I loved how the app theme changes automatically!',
    nameAr: 'كرم غنايم',
    nameEn: 'Karam Ghanaiem',
    rating: 5,
  },
  {
    id: 2,
    textAr: 'المنيو التفاعلي مع أصوات البخار والفقاعات يخليك تعيش جو الكرم.',
    textEn: 'The interactive menu with steam and bubble sounds makes you feel the hospitality.',
    nameAr: 'سالم الدوسري',
    nameEn: 'Salem Al-Dosari',
    rating: 5,
  },
  {
    id: 3,
    textAr: 'أفضل تطبيق لطلب المندي، سلاسة في الأداء وتصميم يفتح النفس.',
    textEn: 'Best app for ordering mandi, smooth performance and appetite-opening design.',
    nameAr: 'ناصر العنزي',
    nameEn: 'Nasser Al-Anazi',
    rating: 5,
  },
  {
    id: 4,
    textAr: 'الألعاب التفاعلية داخل التطبيق فكرة عبقرية، تسلينا لين يوصل الطلب.',
    textEn: 'The interactive games in the app are genius, they entertain us until the order arrives.',
    nameAr: 'كريم غنايم',
    nameEn: 'Kareem Ghanaiem',
    rating: 5,
  },
  {
    id: 5,
    textAr: 'فخورة بهذا المستوى من الابتكار، الذكاء البصري في المنيو سابق عصره.',
    textEn: 'Proud of this level of innovation, the visual AI in the menu is ahead of its time.',
    nameAr: 'هيا ساري',
    nameEn: 'Haya Sari',
    rating: 5,
  },
  {
    id: 6,
    textAr: 'تطبيق يجمع بين عبق الماضي وتطور المستقبل، الثيمات حركة خرافية.',
    textEn: 'An app that combines heritage with future innovation, the themes are amazing.',
    nameAr: 'فهد القحطاني',
    nameEn: 'Fahad Al-Qahtani',
    rating: 5,
  },
  {
    id: 7,
    textAr: 'سهولة في الطلب ووضوح في العروض، نظام احترافي بمعنى الكلمة.',
    textEn: 'Easy ordering and clear offers, a truly professional system.',
    nameAr: 'عمر الغامدي',
    nameEn: 'Omar Al-Ghamdi',
    rating: 5,
  },
  {
    id: 8,
    textAr: 'أهنيكم على ميزة التحول التلقائي للهوية، تطبيق حي ومواكب للمناسبات.',
    textEn: 'Congratulations on the auto-identity feature, a living app that keeps up with occasions.',
    nameAr: 'عيسى غنايم',
    nameEn: 'Issa Ghanaiem',
    rating: 5,
  },
  {
    id: 9,
    textAr: 'التفاصيل الصغيرة مثل الفقاعات وتغير الألوان تعطي تجربة فريدة.',
    textEn: 'Small details like bubbles and color changes give a unique experience.',
    nameAr: 'سارة الشمري',
    nameEn: 'Sara Al-Shammari',
    rating: 5,
  },
  {
    id: 10,
    textAr: 'أقوى منيو شفته، الصور واضحة والأسعار والخصومات واضحة جداً.',
    textEn: 'Best menu I\'ve seen, clear images and very clear prices and discounts.',
    nameAr: 'ناصر الدوسري',
    nameEn: 'Nasser Al-Dosari',
    rating: 5,
  },
  {
    id: 11,
    textAr: 'تطبيق أنيق وجذاب، حبيت كيف يعبر عن هويتنا السعودية بذكاء.',
    textEn: 'An elegant and attractive app, I loved how it smartly expresses our Saudi identity.',
    nameAr: 'رنا التيم',
    nameEn: 'Rana Al-Taim',
    rating: 5,
  },
  {
    id: 12,
    textAr: 'سرعة في الاستجابة وتصميم مريح للعين، شغل متعوب عليه.',
    textEn: 'Fast response and eye-friendly design, clearly a lot of effort went into this.',
    nameAr: 'خالد العتيبي',
    nameEn: 'Khaled Al-Otaibi',
    rating: 5,
  },
  {
    id: 13,
    textAr: 'تجربة بصرية متكاملة، الثيمات تخلي الواحد ما يمل من التطبيق.',
    textEn: 'A complete visual experience, the themes keep you from getting bored of the app.',
    nameAr: 'نورة العنزي',
    nameEn: 'Noura Al-Anazi',
    rating: 5,
  },
  {
    id: 14,
    textAr: 'أبو نورة دائماً في القمة، وهذا التطبيق هو الواجهة الأمثل لكرمكم.',
    textEn: 'Abu Noura is always at the top, and this app is the perfect front for your hospitality.',
    nameAr: 'محمد الحربي',
    nameEn: 'Mohammed Al-Harbi',
    rating: 5,
  },
];

// Restaurant rating stats
const restaurantStats = {
  rating: 5.0,
  totalReviews: 4523,
  fiveStarPercentage: 98,
};

export function TestimonialsSection() {
  const { language } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Ensure the slider starts from the first testimonial (scroll container only, not page)
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    // Reset scroll position to start (first card)
    container.scrollLeft = 0;
  }, [language]);

  // Track active testimonial based on scroll position
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const cardWidth = 320 + 24; // card width + gap
      const scrollPosition = container.scrollLeft;
      const newIndex = Math.round(scrollPosition / cardWidth);
      setActiveIndex(Math.max(0, Math.min(newIndex, testimonials.length - 1)));
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const cardWidth = 320 + 24; // card width + gap
      scrollRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        {/* Restaurant Rating Card */}
        <div className="bg-card rounded-3xl border-2 border-primary/20 p-6 md:p-8 mb-10 
                        shadow-[0_8px_30px_-8px_rgba(0,0,0,0.1)]">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
            {/* Main Rating */}
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-primary mb-2">
                {restaurantStats.rating}
              </div>
              <div className="flex justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${
                      i < Math.floor(restaurantStats.rating)
                        ? 'fill-[hsl(var(--gold))] text-[hsl(var(--gold))]'
                        : 'fill-muted text-muted'
                    }`}
                  />
                ))}
              </div>
              <p className="text-muted-foreground text-sm">
                {language === 'ar' ? 'تقييم المطعم' : 'Restaurant Rating'}
              </p>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-20 bg-border" />
            <div className="md:hidden w-32 h-px bg-border" />

            {/* Total Reviews */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-8 h-8 text-primary" />
                <span className="text-3xl md:text-4xl font-bold text-foreground">
                  {restaurantStats.totalReviews.toLocaleString()}+
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                {language === 'ar' ? 'تقييم من عملائنا' : 'Customer Reviews'}
              </p>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-20 bg-border" />
            <div className="md:hidden w-32 h-px bg-border" />

            {/* 5 Star Percentage */}
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[hsl(var(--gold))] mb-2">
                {restaurantStats.fiveStarPercentage}%
              </div>
              <div className="flex justify-center gap-0.5 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[hsl(var(--gold))] text-[hsl(var(--gold))]" />
                ))}
              </div>
              <p className="text-muted-foreground text-sm">
                {language === 'ar' ? 'تقييمات 5 نجوم' : '5-Star Reviews'}
              </p>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {language === 'ar' ? 'آراء زبائننا' : 'Customer Reviews'}
          </h2>
          <p className="text-muted-foreground">
            {language === 'ar' ? 'ماذا يقول عملاؤنا عنا' : 'What our customers say about us'}
          </p>
        </div>

        {/* Testimonials Slider */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2.5 
                       bg-card shadow-lg rounded-full hover:bg-muted transition-colors
                       hidden md:flex items-center justify-center -mr-4"
          >
            <ChevronRight className="w-5 h-5 flip-rtl" />
          </button>
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2.5 
                       bg-card shadow-lg rounded-full hover:bg-muted transition-colors
                       hidden md:flex items-center justify-center -ml-4"
          >
            <ChevronLeft className="w-5 h-5 flip-rtl" />
          </button>

          {/* Cards Container */}
          <div
            ref={scrollRef}
            className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide px-1 pb-4 snap-x snap-mandatory"
          >
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                
                className="flex-shrink-0 snap-center w-[280px] md:w-[320px] bg-card rounded-2xl 
                           border-2 border-[hsl(var(--gold))]/30 p-5 md:p-6
                           shadow-[0_8px_30px_-8px_rgba(0,0,0,0.1)]
                           hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.15)]
                           hover:border-[hsl(var(--gold))]/50 transition-all duration-300"
              >
                {/* Quote Icon */}
                <div className="flex justify-center mb-3">
                  <Quote className="w-6 h-6 text-[hsl(var(--gold))] opacity-60" />
                </div>

                {/* Stars */}
                <div className="flex justify-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < testimonial.rating
                          ? 'fill-[hsl(var(--gold))] text-[hsl(var(--gold))]'
                          : 'fill-muted text-muted'
                      }`}
                    />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-foreground text-center leading-relaxed mb-4 font-medium text-sm">
                  "{language === 'ar' ? testimonial.textAr : testimonial.textEn}"
                </p>

                {/* Customer Name */}
                <p className="text-center text-primary font-bold text-sm">
                  {language === 'ar' ? testimonial.nameAr : testimonial.nameEn}
                </p>
              </div>
            ))}
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  activeIndex === index
                    ? 'bg-primary w-6'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
