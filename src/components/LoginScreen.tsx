import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { normalizePhoneNumber } from '@/lib/phoneUtils';
import logo from '@/assets/logo-new.jpeg';

// Storage key for registered users
const REGISTERED_USERS_KEY = 'mandi_registered_users';

interface RegisteredUser {
  email: string;
  password: string;
  name: string;
  phone: string;
  createdAt: string;
}

// Get all registered users from localStorage
function getRegisteredUsers(): RegisteredUser[] {
  try {
    const saved = localStorage.getItem(REGISTERED_USERS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// Save a new user to the registry
function registerUser(user: RegisteredUser): void {
  const users = getRegisteredUsers();
  users.push(user);
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
}

// Check if an email is already registered
function isEmailRegistered(email: string): boolean {
  const users = getRegisteredUsers();
  return users.some(u => u.email.toLowerCase() === email.toLowerCase());
}

// Validate login credentials
function validateLogin(email: string, password: string): RegisteredUser | null {
  const users = getRegisteredUsers();
  return users.find(u => 
    u.email.toLowerCase() === email.toLowerCase() && u.password === password
  ) || null;
}

interface LoginScreenProps {
  onComplete: (isNewUser?: boolean) => void;
}

export function LoginScreen({ onComplete }: LoginScreenProps) {
  const { language, setUserProfile, playSound } = useApp();
  const [mode, setMode] = useState<'login' | 'register' | 'guest'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Validate against registered users
    const user = validateLogin(formData.email, formData.password);
    
    if (!user) {
      // Check if email exists but password is wrong
      if (isEmailRegistered(formData.email)) {
        setError(language === 'ar' 
          ? 'كلمة المرور غير صحيحة' 
          : 'Incorrect password');
      } else {
        setError(language === 'ar' 
          ? 'الحساب غير موجود، يرجى إنشاء حساب جديد' 
          : 'Account not found, please create a new account');
      }
      setIsLoading(false);
      playSound('pop');
      return;
    }
    
    // Login successful - set user profile
    setUserProfile({
      name: user.name,
      phone: user.phone,
      savedAddresses: [],
    });
    
    playSound('success');
    setIsLoading(false);
    onComplete(false); // Existing user - no welcome popup
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    // Check if email already exists
    if (isEmailRegistered(formData.email)) {
      setError(language === 'ar' 
        ? 'هذا البريد مسجل بالفعل، يرجى تسجيل الدخول' 
        : 'This email is already registered, please login');
      setIsLoading(false);
      playSound('pop');
      return;
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Register new user
    const newUser: RegisteredUser = {
      email: formData.email,
      password: formData.password,
      name: formData.name,
      phone: formData.phone,
      createdAt: new Date().toISOString(),
    };
    registerUser(newUser);
    
    // Set user profile
    setUserProfile({
      name: formData.name,
      phone: formData.phone,
      savedAddresses: [],
    });
    
    playSound('success');
    setIsLoading(false);
    onComplete(true); // New user - show welcome popup
  };

  const handleGuest = () => {
    playSound('pop');
    onComplete(true); // Guest - show welcome popup
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
         style={{
           background: 'linear-gradient(180deg, hsl(var(--cream)) 0%, hsl(var(--warm-beige)) 100%)',
         }}>
      {/* Sadu Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            hsl(var(--secondary)) 0px,
            hsl(var(--secondary)) 2px,
            transparent 2px,
            transparent 30px
          ), repeating-linear-gradient(
            0deg,
            hsl(var(--gold)) 0px,
            hsl(var(--gold)) 1px,
            transparent 1px,
            transparent 20px
          )`,
        }}
      />

      {/* Login Card - Premium Brown & Gold */}
      <div className="relative w-full max-w-md bg-card rounded-3xl shadow-premium-lg p-8 animate-scale-in
                      border-2 border-gold/20">
        {/* Subtle gold inner glow */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-gold/5 to-transparent pointer-events-none" />
        
        {/* Logo - Clean, Transparent, NO FRAME */}
        <div className="text-center mb-8">
          <img 
            src={logo} 
            alt="مندي أبو نورة" 
            className="w-28 h-28 mx-auto mb-4 object-contain animate-logo-float"
            style={{
              filter: 'drop-shadow(0 0 12px rgba(255,215,0,0.5)) drop-shadow(0 4px 12px rgba(0,0,0,0.2))',
            }}
          />
          <h1 className="text-2xl font-bold text-secondary mb-1">مندي أبو نورة</h1>
          <p className="text-sm text-gold">المذاق الأصيل</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30 
                          flex items-center gap-2 text-destructive animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                value={formData.email}
                onChange={e => {
                  setFormData(prev => ({ ...prev, email: e.target.value }));
                  setError(null);
                }}
                className="input-arabic w-full pr-10"
                placeholder={language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={e => {
                  setFormData(prev => ({ ...prev, password: e.target.value }));
                  setError(null);
                }}
                className="input-arabic w-full pr-10 pl-10"
                placeholder={language === 'ar' ? 'كلمة المرور' : 'Password'}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-secondary text-secondary-foreground font-bold
                         hover:bg-secondary/90 transition-all disabled:opacity-50 shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin" />
                  {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                </span>
              ) : (
                language === 'ar' ? 'تسجيل دخول' : 'Login'
              )}
            </button>
          </form>
        )}

        {/* Register Form */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4 animate-fade-in">
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="input-arabic w-full pr-10"
                placeholder={language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                required
              />
            </div>

            <div className="relative">
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData(prev => ({ ...prev, phone: normalizePhoneNumber(e.target.value) }))}
                className="input-arabic w-full pr-10"
                placeholder="05XXXXXXXX أو ٠٥XXXXXXXX"
                dir="ltr"
                required
              />
            </div>

            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="input-arabic w-full pr-10"
                placeholder={language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="input-arabic w-full pr-10 pl-10"
                placeholder={language === 'ar' ? 'كلمة المرور' : 'Password'}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-secondary text-secondary-foreground font-bold
                         hover:bg-secondary/90 transition-all disabled:opacity-50 shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin" />
                  {language === 'ar' ? 'جاري إنشاء الحساب...' : 'Creating account...'}
                </span>
              ) : (
                language === 'ar' ? 'إنشاء حساب' : 'Create Account'
              )}
            </button>
          </form>
        )}

        {/* Mode Switcher */}
        <div className="mt-6 space-y-3">
          {mode === 'login' && (
            <>
              <button
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="w-full py-3 rounded-xl border-2 border-secondary text-secondary font-medium
                           hover:bg-secondary/5 transition-all"
              >
                {language === 'ar' ? 'إنشاء حساب جديد' : 'Create New Account'}
              </button>
              <button
                onClick={handleGuest}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {language === 'ar' ? 'الدخول كضيف' : 'Continue as Guest'}
              </button>
            </>
          )}

          {mode === 'register' && (
            <button
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {language === 'ar' ? 'لديك حساب؟ تسجيل دخول' : 'Already have an account? Login'}
            </button>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          {language === 'ar' 
            ? 'بالمتابعة، أنت توافق على شروط الاستخدام وسياسة الخصوصية'
            : 'By continuing, you agree to our Terms & Privacy Policy'}
        </p>
      </div>
    </div>
  );
}
