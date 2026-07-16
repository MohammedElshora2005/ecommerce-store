// ecommerce-store/src/components/common/Footer.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import {
  HeartIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  TruckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// استيراد أيقونات وسائل التواصل من react-icons
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // روابط سريعة
  const quickLinks = [
    { name: 'الرئيسية', path: '/' },
    { name: 'المنتجات', path: '/products' },
    { name: 'عروض خاصة', path: '/products?offer=true' },
    { name: 'تتبع الطلب', path: '/track-order' },
    { name: 'مركز المساعدة', path: '/help' }
  ];

  // روابط الحساب
  const accountLinks = [
    { name: 'حسابي', path: '/profile' },
    { name: 'طلباتي', path: '/orders' },
    { name: 'المفضلة', path: '/wishlist' },
    { name: 'الإعدادات', path: '/settings' }
  ];

  // روابط الشركة
  const companyLinks = [
    { name: 'من نحن', path: '/about' },
    { name: 'اتصل بنا', path: '/contact' },
    { name: 'سياسة الخصوصية', path: '/privacy' },
    { name: 'شروط الاستخدام', path: '/terms' },
    { name: 'سياسة الإرجاع', path: '/returns' }
  ];

  // وسائل التواصل الاجتماعي
  const socialLinks = [
    { icon: FaFacebook, name: 'فيسبوك', url: 'https://facebook.com', color: 'hover:bg-blue-600' },
    { icon: FaTwitter, name: 'تويتر', url: 'https://twitter.com', color: 'hover:bg-sky-500' },
    { icon: FaInstagram, name: 'انستغرام', url: 'https://instagram.com', color: 'hover:bg-pink-600' },
    { icon: FaYoutube, name: 'يوتيوب', url: 'https://youtube.com', color: 'hover:bg-red-600' }
  ];

  // طرق الدفع
  const paymentMethods = [
    { name: 'فيزا', icon: CreditCardIcon },
    { name: 'ماستركارد', icon: CreditCardIcon },
    { name: 'باي بال', icon: CreditCardIcon },
    { name: 'تحويل بنكي', icon: CreditCardIcon }
  ];

  // ميزات التوصيل
  const deliveryFeatures = [
    { icon: TruckIcon, text: 'توصيل سريع خلال 2-4 أيام' },
    { icon: ArrowPathIcon, text: 'إرجاع مجاني خلال 30 يوم' },
    { icon: ShieldCheckIcon, text: 'دفع آمن 100%' },
    { icon: ClockIcon, text: 'دعم فني 24/7' }
  ];

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      {/* القسم العلوي - الميزات */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {deliveryFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="p-2 bg-gray-800 rounded-lg">
                  <feature.icon className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">{feature.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* القسم الرئيسي */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* العمود 1: معلومات المتجر */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBagIcon className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">متجر</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              متجر إلكتروني متكامل يوفر أفضل المنتجات بأفضل الأسعار مع خدمة عملاء متميزة وتجربة تسوق آمنة.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <MapPinIcon className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <span>القاهرة، مصر</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <PhoneIcon className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <span dir="ltr">+20 123 456 789</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <EnvelopeIcon className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <span dir="ltr">info@store.com</span>
              </div>
            </div>
          </div>

          {/* العمود 2: روابط سريعة */}
          <div>
            <h4 className="text-lg font-semibold mb-4">روابط سريعة</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* العمود 3: حسابي */}
          <div>
            <h4 className="text-lg font-semibold mb-4">حسابي</h4>
            <ul className="space-y-2">
              {accountLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* العمود 4: تواصل معنا */}
          <div>
            <h4 className="text-lg font-semibold mb-4">تواصل معنا</h4>
            <p className="text-gray-400 text-sm mb-4">
              تابعنا على وسائل التواصل الاجتماعي للحصول على أحدث العروض والتخفيضات
            </p>
            <div className="flex gap-3 mb-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 bg-gray-800 rounded-lg ${social.color} transition-all duration-200 hover:scale-110`}
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>

            {/* طرق الدفع */}
            <div>
              <p className="text-sm text-gray-400 mb-2">طرق الدفع</p>
              <div className="flex gap-2">
                {paymentMethods.map((method, index) => (
                  <div
                    key={index}
                    className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                    title={method.name}
                  >
                    <method.icon className="h-6 w-6 text-gray-300" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* القسم السفلي - حقوق الملكية */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-400">
                © {currentYear} متجر. جميع الحقوق محفوظة.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-xs">
              {companyLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-1 text-xs text-gray-500">
              <HeartIcon className="h-3 w-3 text-red-400" />
              <span>صنع بـ ❤️ في مصر</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;