import { useApp } from '@/context/AppContext';
import { restaurantInfo } from '@/data/menu';
import { MapPin, Clock, Navigation } from 'lucide-react';

interface PickupReadyTimerProps {
  isActive: boolean;
}

export function PickupReadyTimer({ isActive }: PickupReadyTimerProps) {
  const { t, language } = useApp();

  // IMPORTANT: We intentionally do NOT request GPS/geolocation here.
  // The pickup flow must work without any location permission prompts.
  if (!isActive) return null;

  const prepTime = 25;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Ready Time Card */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-5 rounded-2xl border border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-primary/20">
            <Clock className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h4 className="font-bold text-lg text-foreground">
              {language === 'ar' ? 'وقت التحضير المتوقع' : 'Estimated Prep Time'}
            </h4>
            <p className="text-sm text-muted-foreground">
              {language === 'ar' ? 'بدون الحاجة لتفعيل الموقع' : 'No location permission required'}
            </p>
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-5xl font-bold text-primary">{prepTime}</span>
            <span className="text-xl text-muted-foreground">{t.minutes}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {language === 'ar'
              ? 'قد يختلف الوقت حسب ضغط المطبخ.'
              : 'Time may vary based on kitchen load.'}
          </p>
        </div>
      </div>

      {/* Map Section */}
      <div className="rounded-xl overflow-hidden border border-border">
        <iframe
          src={`https://www.google.com/maps?q=${encodeURIComponent(restaurantInfo.plusCode)}&output=embed`}
          width="100%"
          height="200"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={language === 'ar' ? 'موقع مندي أبو نورة' : 'Mandi Abu Noura Location'}
        />
      </div>

      {/* Branch Address & Directions */}
      <div className="bg-muted p-4 rounded-xl space-y-3">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
          <div>
            <div className="font-semibold text-foreground">
              {language === 'ar' ? restaurantInfo.addressAr : restaurantInfo.addressEn}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Plus Code: {restaurantInfo.plusCode}</div>
          </div>
        </div>

        <a
          href={restaurantInfo.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
        >
          <Navigation className="w-5 h-5" />
          {t.directions}
        </a>
      </div>
    </div>
  );
}
