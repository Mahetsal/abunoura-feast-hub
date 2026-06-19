import { useApp } from '@/context/AppContext';
import { Phone, MapPin, Clock } from 'lucide-react';
import { restaurantInfo } from '@/data/menu';
import logo from '@/assets/logo-new.jpeg';

// Social media icons as SVG components
const InstagramIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

const SnapchatIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-.809-.329-1.224-.72-1.227-1.153-.015-.36.284-.69.735-.838.165-.045.329-.074.51-.074.104 0 .283.015.465.089.375.18.72.285 1.035.3.199 0 .324-.044.4-.089-.007-.165-.019-.33-.03-.51l-.003-.06c-.104-1.628-.229-3.654.3-4.847 1.582-3.545 4.939-3.821 5.928-3.821h.238z"/>
  </svg>
);

export function Footer() {
  const { language } = useApp();

  const socialLinks = [
    {
      name: 'Instagram',
      url: 'https://instagram.com/abu_nura_mandi',
      icon: <InstagramIcon />,
      color: 'hover:text-pink-500',
    },
    {
      name: 'TikTok',
      url: 'https://tiktok.com/@abu_nura_mandi',
      icon: <TikTokIcon />,
      color: 'hover:text-foreground',
    },
    {
      name: 'Snapchat',
      url: 'https://snapchat.com/add/abu_nura_mandi',
      icon: <SnapchatIcon />,
      color: 'hover:text-yellow-400',
    },
  ];

  return (
    <footer className="bg-primary text-primary-foreground mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="text-center md:text-right">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              {/* Logo - Clean, Transparent, NO FRAME */}
              <img
                src={logo}
                alt="مندي أبو نورة"
                className="w-16 h-16 object-contain animate-logo-float"
                style={{
                  filter: 'drop-shadow(0 0 12px rgba(255,215,0,0.5)) drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
                }}
              />
              <div>
                <h3 className="text-xl font-bold">
                  مندي أبو نورة
                </h3>
                <p className="text-sm opacity-80">
                  المذاق الأصيل
                </p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="text-center">
            <h4 className="font-bold mb-4">
              {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
            </h4>
            <div className="space-y-3">
              <a 
                href={`tel:${restaurantInfo.phone}`}
                className="flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
              >
                <Phone className="w-5 h-5" />
                <span dir="ltr">{restaurantInfo.phoneFormatted}</span>
              </a>
              <div className="flex items-center justify-center gap-2">
                <MapPin className="w-5 h-5" />
                <span className="text-sm">
                  {language === 'ar' ? restaurantInfo.addressAr : restaurantInfo.addressEn}
                </span>
              </div>
              <p className="text-xs opacity-60">
                Plus Code: {restaurantInfo.plusCode}
              </p>
            </div>
          </div>

          {/* Hours */}
          <div className="text-center">
            <h4 className="font-bold mb-4">
              {language === 'ar' ? 'ساعات العمل' : 'Working Hours'}
            </h4>
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-5 h-5" />
              <span>
                {language === 'ar' ? restaurantInfo.workingHoursAr : restaurantInfo.workingHoursEn}
              </span>
            </div>
            <p className="text-sm opacity-80 mt-2">
              {language === 'ar' ? 'كل يوم' : 'Every day'}
            </p>
          </div>

          {/* Social Links */}
          <div className="text-center md:text-left">
            <h4 className="font-bold mb-4">
              {language === 'ar' ? 'تابعنا' : 'Follow Us'}
            </h4>
            <div className="flex items-center justify-center md:justify-start gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 
                             transition-all hover:scale-110 ${social.color}`}
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center">
          <p className="text-sm opacity-60">
            © {new Date().getFullYear()} مندي أبو نورة. جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </footer>
  );
}
