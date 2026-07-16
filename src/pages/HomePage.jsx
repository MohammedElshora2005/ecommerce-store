// ecommerce-store/src/pages/HomePage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import ProductCard from '../components/products/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { products } from '../api/products';
import {
  ShoppingBagIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  StarIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  FireIcon,
  TagIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const HomePage = () => {
  const { user } = useAuth();
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [wishlist, setWishlist] = useState([]);

  // عروض البانر (Slider)
  const banners = [
    {
      id: 1,
      title: 'تخفيضات تصل إلى 50%',
      subtitle: 'على مجموعة مختارة من المنتجات',
      image: 'https://picsum.photos/id/10/1200/400',
      color: 'from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-900',
      buttonText: 'تسوق الآن',
      buttonLink: '/products'
    },
    {
      id: 2,
      title: 'شحن مجاني',
      subtitle: 'لجميع الطلبات فوق 500 جنيه',
      image: 'https://picsum.photos/id/20/1200/400',
      color: 'from-green-600 to-teal-600 dark:from-green-800 dark:to-teal-900',
      buttonText: 'استعراض المنتجات',
      buttonLink: '/products'
    },
    {
      id: 3,
      title: 'أحدث المنتجات',
      subtitle: 'اكتشف أحدث الموديلات',
      image: 'https://picsum.photos/id/30/1200/400',
      color: 'from-orange-600 to-red-600 dark:from-orange-800 dark:to-red-900',
      buttonText: 'عرض الكل',
      buttonLink: '/products'
    }
  ];

  // ميزات المتجر
  const features = [
    {
      icon: TruckIcon,
      title: 'توصيل سريع',
      description: 'توصيل خلال 2-4 أيام عمل'
    },
    {
      icon: ShieldCheckIcon,
      title: 'دفع آمن',
      description: 'تشفير 128-bit لحماية بياناتك'
    },
    {
      icon: ArrowPathIcon,
      title: 'إرجاع مجاني',
      description: 'إرجاع خلال 30 يوم من الشراء'
    },
    {
      icon: StarIcon,
      title: 'جودة عالية',
      description: 'منتجات أصلية 100%'
    }
  ];

  // جلب المنتجات والعروض
  useEffect(() => {
    const fetchData = () => {
      setLoading(true);
      try {
        setTimeout(() => {
          // منتجات مميزة (أعلى تقييم)
          const featured = [...products]
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 8);
          
          // أحدث المنتجات (أعلى ID)
          const newest = [...products]
            .sort((a, b) => b.id - a.id)
            .slice(0, 8);

          setFeaturedProducts(featured);
          setNewProducts(newest);

          // ✅ تحميل العروض النشطة من localStorage
          const savedOffers = localStorage.getItem('offers');
          if (savedOffers) {
            const allOffers = JSON.parse(savedOffers);
            const now = new Date();
            const activeOffers = allOffers.filter(offer => {
              const start = new Date(offer.startDate);
              const end = new Date(offer.endDate);
              return offer.active && now >= start && now <= end;
            });
            setOffers(activeOffers);
          }

          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // تبديل الشريحة
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // التبديل التلقائي للشرائح
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  // إضافة للمفضلة (محاكاة)
  const handleToggleWishlist = (productId) => {
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter(id => id !== productId));
    } else {
      setWishlist([...wishlist, productId]);
    }
  };

  // إضافة للعربة
  const handleAddToCart = async (product) => {
    const result = await addToCart(product);
    if (result.success) {
      console.log('تمت الإضافة للعربة');
    }
  };

  // ✅ حساب أفضل عرض (أعلى نسبة خصم)
  const getBestOffer = () => {
    if (offers.length === 0) return null;
    return offers.reduce((best, current) => {
      const currentDiscount = current.discountValue || 0;
      const bestDiscount = best?.discountValue || 0;
      return currentDiscount > bestDiscount ? current : best;
    }, null);
  };

  const bestOffer = getBestOffer();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* البانر الرئيسي (Slider) */}
      <section className="relative overflow-hidden">
        <div className="relative h-[400px] md:h-[500px] lg:h-[600px]">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className={`w-full h-full bg-gradient-to-r ${banner.color}`}>
                <div className="container mx-auto px-4 h-full flex items-center">
                  <div className="max-w-2xl text-white">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                      {banner.title}
                    </h1>
                    <p className="text-xl md:text-2xl mb-6 opacity-90">
                      {banner.subtitle}
                    </p>
                    <Link
                      to={banner.buttonLink}
                      className="inline-block px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-lg"
                    >
                      {banner.buttonText}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 dark:bg-gray-800/20 hover:bg-white/30 dark:hover:bg-gray-700/30 backdrop-blur-sm rounded-full text-white transition-colors"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 dark:bg-gray-800/20 hover:bg-white/30 dark:hover:bg-gray-700/30 backdrop-blur-sm rounded-full text-white transition-colors"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'w-8 bg-white dark:bg-blue-400'
                    : 'bg-white/50 dark:bg-gray-400/50 hover:bg-white/70 dark:hover:bg-gray-300/70'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* الميزات */}
      <section className="py-12 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-4 rounded-xl hover:shadow-lg dark:hover:shadow-gray-700/50 transition-shadow"
              >
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-3">
                  <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ترحيب المستخدم */}
      {user && (
        <section className="py-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 dark:bg-blue-500 rounded-full">
                <ShoppingBagIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  مرحباً {user.user_metadata?.name || user.email?.split('@')[0]}!
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  استمتع بتجربة تسوق مميزة مع أفضل العروض
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ✅ عرض العروض الخاصة (ديناميكي) */}
      {offers.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 dark:from-rose-800 dark:to-pink-900 p-8 md:p-12 shadow-xl">
              <div className="max-w-2xl text-white">
                <div className="flex items-center gap-2 mb-3">
                  <TagIcon className="h-6 w-6 text-yellow-300 dark:text-yellow-400" />
                  <span className="text-sm font-semibold text-yellow-300 dark:text-yellow-400 uppercase tracking-wider">
                    عرض خاص
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  {bestOffer?.name || 'عروض خاصة لفترة محدودة'}
                </h2>
                <p className="text-lg opacity-90 mb-6">
                  {bestOffer?.description || 'احصل على خصم 20% عند شراء منتجين أو أكثر. العرض ساري حتى نهاية الشهر.'}
                </p>
                
                {/* ✅ تفاصيل العرض */}
                {bestOffer && (
                  <div className="flex flex-wrap items-center gap-4 mb-6 bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-yellow-300 dark:text-yellow-400">
                        {bestOffer.discountType === 'percentage' ? `${bestOffer.discountValue}%` : `${bestOffer.offerPrice} ج.م`}
                      </span>
                      <span className="text-sm text-white/70">خصم</span>
                    </div>
                    {bestOffer.minOrder > 0 && (
                      <div className="text-sm text-white/70">
                        الحد الأدنى: {bestOffer.minOrder} ج.م
                      </div>
                    )}
                    <div className="text-sm text-white/70 flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      ينتهي قريباً
                    </div>
                  </div>
                )}
                
                <Link
                  to="/offers"
                  className="inline-block px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-lg"
                >
                  استفد من العرض
                </Link>
              </div>
              <div className="absolute top-0 right-0 opacity-10">
                <TagIcon className="h-64 w-64 text-white" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ✅ لو مفيش عروض، نعرض البانر الافتراضي */}
      {offers.length === 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-800 dark:to-pink-900 p-8 md:p-12">
              <div className="max-w-2xl text-white">
                <div className="flex items-center gap-2 mb-3">
                  <TagIcon className="h-6 w-6 text-yellow-300 dark:text-yellow-400" />
                  <span className="text-sm font-semibold text-yellow-300 dark:text-yellow-400 uppercase tracking-wider">
                    عرض خاص
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  عروض خاصة لفترة محدودة
                </h2>
                <p className="text-lg opacity-90 mb-6">
                  احصل على خصم 20% عند شراء منتجين أو أكثر. العرض ساري حتى نهاية الشهر.
                </p>
                <Link
                  to="/products"
                  className="inline-block px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-lg"
                >
                  استفد من العرض
                </Link>
              </div>
              <div className="absolute top-0 right-0 opacity-10">
                <TagIcon className="h-64 w-64 text-white" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* المنتجات المميزة */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FireIcon className="h-6 w-6 text-orange-500 dark:text-orange-400" />
                المنتجات المميزة
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">أكثر المنتجات تقييماً من عملائنا</p>
            </div>
            <Link
              to="/products"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center gap-1"
            >
              عرض الكل
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" color="blue" text="جاري تحميل المنتجات..." />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  isWishlisted={wishlist.includes(product.id)}
                  variant="default"
                  showQuickView={true}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* أحدث المنتجات */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <TagIcon className="h-6 w-6 text-green-500 dark:text-green-400" />
                أحدث المنتجات
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">أحدث الإضافات إلى متجرنا</p>
            </div>
            <Link
              to="/products"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center gap-1"
            >
              عرض الكل
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" color="blue" text="جاري تحميل المنتجات..." />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  isWishlisted={wishlist.includes(product.id)}
                  variant="default"
                  showQuickView={true}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* إحصائيات سريعة */}
      <section className="py-12 bg-gray-900 dark:bg-black text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-1">500+</div>
              <div className="text-gray-400 text-sm">منتج</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">10K+</div>
              <div className="text-gray-400 text-sm">عميل سعيد</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">98%</div>
              <div className="text-gray-400 text-sm">رضا العملاء</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">24/7</div>
              <div className="text-gray-400 text-sm">دعم فني</div>
            </div>
          </div>
        </div>
      </section>

      {/* دعوة للانضمام */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            انضم إلى آلاف العملاء السعداء
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
            سجل الآن واحصل على خصم 10% على أول طلب لك
          </p>
          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
              >
                إنشاء حساب جديد
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                تسجيل الدخول
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
              >
                استعراض المنتجات
              </Link>
              <Link
                to="/profile"
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                حسابي
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;