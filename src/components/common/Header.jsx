// ecommerce-store/src/components/common/Header.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBagIcon,
  ShoppingCartIcon,
  UserIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  HeartIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
  HomeIcon,
  TagIcon,
  PhoneIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { toast } from 'react-toastify';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const { cartItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // حساب عدد المنتجات في العربة
  const cartCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  // حساب إجمالي سعر العربة
  const cartTotal = cartItems?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

  // ✅ حساب عدد المفضلة من localStorage
  useEffect(() => {
    const updateWishlistCount = () => {
      try {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setWishlistCount(wishlist.length);
      } catch (error) {
        setWishlistCount(0);
      }
    };

    updateWishlistCount();

    // الاستماع لتغيرات localStorage (عند إضافة أو حذف من المفضلة)
    window.addEventListener('storage', updateWishlistCount);
    
    // تحديث كل 3 ثواني للتأكد (للمزامنة)
    const interval = setInterval(updateWishlistCount, 3000);

    return () => {
      window.removeEventListener('storage', updateWishlistCount);
      clearInterval(interval);
    };
  }, []);

  // تنسيق السعر
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // التحكم في تغيير لون الهيدر عند التمرير
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // إغلاق القوائم عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // إغلاق القوائم عند تغيير الصفحة
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsSearchOpen(false);
    setSearchQuery('');
  }, [location]);

  // روابط الملاحة
  const navLinks = [
    { name: 'الرئيسية', path: '/', icon: HomeIcon },
    { name: 'المنتجات', path: '/products', icon: TagIcon },
    { name: 'العروض', path: '/offers', icon: TagIcon },
    { name: 'اتصل بنا', path: '/contact', icon: PhoneIcon }
  ];

  // قائمة المستخدم
  const userMenuItems = [
    { name: 'حسابي', path: '/profile', icon: UserCircleIcon },
    { name: 'طلباتي', path: '/orders', icon: ClipboardDocumentListIcon },
    { name: 'المفضلة', path: '/wishlist', icon: HeartIcon },
    { name: 'الإعدادات', path: '/settings', icon: Cog6ToothIcon }
  ];

  // معالجة البحث
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  // معالجة تسجيل الخروج
  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        toast.info('👋 تم تسجيل الخروج بنجاح');
        setIsUserMenuOpen(false);
        navigate('/');
      } else {
        toast.error('❌ حدث خطأ أثناء تسجيل الخروج');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('❌ حدث خطأ أثناء تسجيل الخروج');
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-sm'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* القسم الأيسر - Logo */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 group">
              <ShoppingBagIcon className="h-8 w-8 text-blue-600 group-hover:rotate-12 transition-transform" />
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                متجر
              </span>
            </Link>
          </div>

          {/* القسم الأوسط - روابط الملاحة (Desktop) */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-blue-600 flex items-center gap-1 ${
                  location.pathname === link.path
                    ? 'text-blue-600'
                    : 'text-gray-700'
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.name}
              </Link>
            ))}
          </nav>

          {/* القسم الأيمن - أيقونات الإجراءات */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* زر البحث (Desktop) */}
            <div ref={searchRef} className="hidden md:block">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث عن منتج..."
                  className="w-48 lg:w-64 px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
                <button
                  type="submit"
                  className="absolute left-0 top-1/2 -translate-y-1/2 pl-3"
                >
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors" />
                </button>
              </form>
            </div>

            {/* زر البحث (Mobile) */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              aria-label="بحث"
            >
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>

            {/* ✅ زر المفضلة - العدد يتغير تلقائياً */}
            <Link
              to="/wishlist"
              className="p-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors relative"
              aria-label="المفضلة"
            >
              <HeartIcon className="h-6 w-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* زر العربة */}
            <Link
              to="/cart"
              className="p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors relative"
              aria-label="عربة التسوق"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {cartCount > 0 && (
                <>
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                  <span className="hidden lg:inline-block text-xs font-medium text-gray-700 mr-1">
                    {formatPrice(cartTotal)}
                  </span>
                </>
              )}
            </Link>

            {/* قائمة المستخدم */}
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                aria-label="حسابي"
              >
                {user ? (
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border-2 border-blue-500"
                  />
                ) : (
                  <UserIcon className="h-6 w-6" />
                )}
              </button>

              {/* قائمة منسدلة للمستخدم */}
              {isUserMenuOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
                  {user ? (
                    <>
                      {/* معلومات المستخدم */}
                      <div className="px-4 py-4 bg-blue-50 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff`}
                            alt={user.name}
                            className="w-12 h-12 rounded-full border-2 border-blue-500"
                          />
                          <div>
                            <p className="font-semibold text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500" dir="ltr">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* روابط المستخدم + Dashboard للأدمن */}
                      <div className="py-2">
                        {isAdmin && (
                          <Link
                            to="/admin/dashboard"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 transition-colors border-b border-blue-100"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <ShieldCheckIcon className="h-5 w-5" />
                            <span className="font-medium">📊 لوحة التحكم</span>
                          </Link>
                        )}

                        {userMenuItems.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                          </Link>
                        ))}
                      </div>

                      {/* زر تسجيل الخروج */}
                      <div className="border-t border-gray-100 py-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-right"
                        >
                          <ArrowRightOnRectangleIcon className="h-5 w-5" />
                          تسجيل الخروج
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-6 text-center">
                      <UserIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600 mb-4">مرحباً بك!</p>
                      <div className="space-y-2">
                        <Link
                          to="/login"
                          className="block w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          تسجيل الدخول
                        </Link>
                        <Link
                          to="/register"
                          className="block w-full py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          إنشاء حساب جديد
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* زر القائمة (Mobile) */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              aria-label="القائمة"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* شريط البحث (Mobile) */}
        {isSearchOpen && (
          <div className="md:hidden py-3 border-t border-gray-100">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن منتج..."
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              <button
                type="submit"
                className="absolute left-0 top-1/2 -translate-y-1/2 pl-3"
              >
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </button>
            </form>
          </div>
        )}

        {/* القائمة الجانبية (Mobile) */}
        {isMenuOpen && (
          <div ref={mobileMenuRef} className="md:hidden fixed inset-0 top-16 bg-white z-40">
            <div className="p-4 space-y-4">
              {/* روابط الملاحة */}
              <nav className="space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      location.pathname === link.path
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.name}
                  </Link>
                ))}
              </nav>

              {/* روابط إضافية مع Dashboard للأدمن */}
              <div className="border-t border-gray-100 pt-4">
                <div className="space-y-2">
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <ShieldCheckIcon className="h-5 w-5" />
                      <span className="font-medium">📊 لوحة التحكم</span>
                    </Link>
                  )}
                  
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserCircleIcon className="h-5 w-5" />
                    حسابي
                  </Link>
                  <Link
                    to="/orders"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <ClipboardDocumentListIcon className="h-5 w-5" />
                    طلباتي
                  </Link>
                  <Link
                    to="/wishlist"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <HeartIcon className="h-5 w-5" />
                    المفضلة
                  </Link>
                </div>
              </div>

              {/* معلومات المستخدم (إذا كان مسجل) */}
              {user && (
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-3 px-4 py-2">
                    <img
                      src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff`}
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500" dir="ltr">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-right"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    تسجيل الخروج
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;