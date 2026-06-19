import { useApp } from '@/context/AppContext';
import { User, ShoppingBag, Star, Info, Phone, MapPin, Settings, Shield, ChevronLeft, ChevronRight, Sparkles, Camera, Headphones } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface AccountPageProps {
  onNavigateOrders: () => void;
}

export function AccountPage({ onNavigateOrders }: AccountPageProps) {
  const { language, userProfile, orderHistory } = useApp();
  const isAr = language === 'ar';
  const Chevron = isAr ? ChevronLeft : ChevronRight;

  // Calculate loyalty points (10 pts per order)
  const loyaltyPoints = orderHistory.length * 10;

  const showComingSoon = () => {
    toast(isAr ? 'قريباً! هذه الميزة تحت التطوير' : 'Coming Soon! This feature is under development');
  };

  const menuItems = [
    { icon: <ShoppingBag className="w-5 h-5" />, labelAr: 'الطلبات', labelEn: 'Orders', action: onNavigateOrders },
    { icon: <Sparkles className="w-5 h-5" />, labelAr: 'المساعد الذكي', labelEn: 'Smart Assistant', action: () => window.dispatchEvent(new CustomEvent('open:assistant')) },
    { icon: <Camera className="w-5 h-5" />, labelAr: 'ماسح السعرات', labelEn: 'Calorie Scanner', action: () => window.dispatchEvent(new CustomEvent('open:scanner')) },
    { icon: <Headphones className="w-5 h-5" />, labelAr: 'الدعم الفني', labelEn: 'Support', action: () => window.dispatchEvent(new CustomEvent('open:support')) },
    { icon: <Star className="w-5 h-5" />, labelAr: 'نقاطي', labelEn: 'My Points', action: showComingSoon },
    { icon: <Info className="w-5 h-5" />, labelAr: 'نبذة عنا', labelEn: 'About Us', action: () => {
      const el = document.getElementById('about');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }},
    { icon: <Phone className="w-5 h-5" />, labelAr: 'اتصل بنا', labelEn: 'Contact Us', action: () => {
      window.open('tel:+966500000000');
    }},
    { icon: <MapPin className="w-5 h-5" />, labelAr: 'الفروع', labelEn: 'Branches', action: showComingSoon },
    { icon: <Settings className="w-5 h-5" />, labelAr: 'الإعدادات', labelEn: 'Settings', action: showComingSoon },
    { icon: <Shield className="w-5 h-5" />, labelAr: 'سياسة الخصوصية', labelEn: 'Privacy Policy', action: showComingSoon },
  ];

  // Get saved user data
  const userName = userProfile?.name || localStorage.getItem('userName') || (isAr ? 'ضيف' : 'Guest');
  const userPhone = userProfile?.phone || localStorage.getItem('userPhone') || '';

  return (
    <div className="min-h-screen bg-background pb-24 pt-4">
      <div className="container mx-auto px-4 max-w-lg">
        {/* Profile Header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mb-3">
            <User className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{userName}</h2>
          {userPhone && (
            <p className="text-sm text-muted-foreground mt-1" dir="ltr">{userPhone}</p>
          )}
        </div>

        {/* Loyalty Points Card */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{isAr ? 'نقاط الولاء' : 'Loyalty Points'}</p>
              <p className="text-2xl font-bold text-accent">{loyaltyPoints}</p>
            </div>
            <Star className="w-8 h-8 text-accent" />
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {menuItems.map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors
                         border-b border-border last:border-b-0"
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                {item.icon}
              </div>
              <span className="flex-1 text-sm font-medium text-foreground text-start">
                {isAr ? item.labelAr : item.labelEn}
              </span>
              <Chevron className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
