import { Home, ClipboardList, User } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export type ActiveTab = 'home' | 'orders' | 'account';

interface BottomNavBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export function BottomNavBar({ activeTab, onTabChange }: BottomNavBarProps) {
  const { language } = useApp();

  const tabs: { id: ActiveTab; labelAr: string; labelEn: string; icon: React.ReactNode }[] = [
    { id: 'home', labelAr: 'الرئيسية', labelEn: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'orders', labelAr: 'طلباتي', labelEn: 'Orders', icon: <ClipboardList className="w-5 h-5" /> },
    { id: 'account', labelAr: 'حسابي', labelEn: 'Account', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border shadow-lg">
      <div className="flex items-center justify-around h-16">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors
              ${activeTab === tab.id 
                ? 'text-primary' 
                : 'text-muted-foreground hover:text-foreground'}`}
          >
            {tab.icon}
            <span className="text-[11px] font-medium">
              {language === 'ar' ? tab.labelAr : tab.labelEn}
            </span>
          </button>
        ))}
      </div>
      <div className="text-center pb-1 text-[10px] text-muted-foreground/50">
        Powered by order v: 3.0.9
      </div>
    </nav>
  );
}
