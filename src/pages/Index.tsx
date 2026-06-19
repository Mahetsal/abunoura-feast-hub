import { useState } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { AboutSection } from '@/components/AboutSection';
import { ThemeShowcase } from '@/components/ThemeShowcase';
import { MenuSection } from '@/components/MenuSection';
import { GamesShowcase } from '@/components/GamesShowcase';
import { AIFeaturesSection } from '@/components/AIFeaturesSection';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { SpecialOrdersBanner } from '@/components/SpecialOrdersBanner';
import { WelcomeHonorPopup } from '@/components/WelcomeHonorPopup';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { OrderTracking } from '@/components/OrderTracking';
import { SmartAssistant } from '@/components/SmartAssistant';
import { CalorieScanner } from '@/components/CalorieScanner';
import { SupportButton } from '@/components/SupportButton';
import { OrderHistoryModal } from '@/components/OrderHistoryModal';
import { Footer } from '@/components/Footer';
import { SplashScreen } from '@/components/SplashScreen';
import { LoginScreen } from '@/components/LoginScreen';
import { TopPreparationBar } from '@/components/TopPreparationBar';
import { BottomNavBar, ActiveTab } from '@/components/BottomNavBar';
import { OrdersPage } from '@/components/OrdersPage';
import { AccountPage } from '@/components/AccountPage';

function MainContent() {
  const { 
    cart, 
    setCurrentOrderId, 
    setOrderStatus,
    orderStatus,
    playSound, 
    resetOrder, 
    registerPhone, 
    orderInfo,
    orderHistory,
    setActiveOrder,
    addToOrderHistory,
    grandTotal,
    clearCart,
  } = useApp();

  const [showSplash, setShowSplash] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [showWelcomeHonor, setShowWelcomeHonor] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  const handleSplashComplete = () => {
    setShowSplash(false);
    setShowLogin(true);
  };
  
  const handleLoginComplete = (isNewUser?: boolean) => {
    setShowLogin(false);
    if (isNewUser === true) {
      setTimeout(() => setShowWelcomeHonor(true), 300);
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const handleConfirmOrder = () => {
    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
    setCurrentOrderId(orderId);
    setOrderStatus('confirmed');
    
    if (orderInfo.phone) {
      registerPhone(orderInfo.phone);
    }
    
    // Save order to history immediately
    addToOrderHistory({
      id: orderId,
      items: [...cart],
      total: grandTotal,
      date: new Date().toISOString(),
      status: 'completed',
    });
    
    // Set active order details for tracking screen before clearing cart
    setActiveOrder({
      id: orderId,
      items: [...cart],
      total: grandTotal,
      notes: orderInfo.orderNotes,
    });
    
    playSound('success');
    clearCart();
    setCheckoutOpen(false);
    setTrackingOpen(true);
  };

  const handleNewOrder = () => {
    resetOrder();
    setTrackingOpen(false);
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      {showLogin && !showSplash && <LoginScreen onComplete={handleLoginComplete} />}
      
      <WelcomeHonorPopup 
        isOpen={showWelcomeHonor} 
        onClose={() => setShowWelcomeHonor(false)} 
      />
      
      {!showSplash && !showLogin && (
        <div className="min-h-screen bg-background" id="home">
          {/* Bottom Navigation Bar - always visible */}
          <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />

          {/* === HOME TAB === */}
          {activeTab === 'home' && (
            <>
              <Header 
                onCartClick={() => setCartOpen(true)} 
                onHistoryClick={() => setHistoryOpen(true)}
                cartCount={cartCount} 
              />

              {orderStatus !== 'idle' && !trackingOpen && (
                <TopPreparationBar onClick={() => setTrackingOpen(true)} />
              )}
            
              <main className={`pb-24 ${orderStatus !== 'idle' && !trackingOpen ? 'pt-10' : ''}`}>
                <HeroSection />
                <AboutSection />
                <MenuSection />
                <ThemeShowcase />
                <GamesShowcase />
                <AIFeaturesSection />
                <TestimonialsSection />
                <SpecialOrdersBanner />
              </main>
              
              <Footer />
            </>
          )}

          {/* === ORDERS TAB === */}
          {activeTab === 'orders' && (
            <OrdersPage onTrackingClick={() => setTrackingOpen(true)} />
          )}

          {/* === ACCOUNT TAB === */}
          {activeTab === 'account' && (
            <AccountPage onNavigateOrders={() => setActiveTab('orders')} />
          )}

          {/* Global hidden helpers — opened from Account menu via window events */}
          <SmartAssistant onCheckout={handleCheckout} />
          <CalorieScanner />
          <SupportButton />
          
          {/* Modals (always available) */}
          <CartDrawer 
            isOpen={cartOpen} 
            onClose={() => setCartOpen(false)} 
            onCheckout={handleCheckout}
          />
          
          <CheckoutModal 
            isOpen={checkoutOpen} 
            onClose={() => setCheckoutOpen(false)}
            onConfirm={handleConfirmOrder}
          />
          
          <OrderTracking 
            isOpen={trackingOpen}
            onClose={() => setTrackingOpen(false)}
            onNewOrder={handleNewOrder}
          />
          
          <OrderHistoryModal 
            isOpen={historyOpen}
            onClose={() => setHistoryOpen(false)}
          />
        </div>
      )}
    </>
  );
}

const Index = () => {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
};

export default Index;
