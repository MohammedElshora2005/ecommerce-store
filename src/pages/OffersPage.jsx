// ecommerce-store/src/pages/OffersPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import {
  TagIcon,
  ShoppingBagIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  StarIcon,
  TruckIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const OffersPage = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState({});

  // ✅ جلب العروض من Supabase
  const fetchOffers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // تصفية العروض النشطة حسب التاريخ
      const now = new Date();
      const activeOffers = (data || []).filter(offer => {
        const start = new Date(offer.start_date);
        const end = new Date(offer.end_date);
        return now >= start && now <= end;
      });
      
      setOffers(activeOffers);
    } catch (error) {
      console.error('Error fetching offers:', error);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
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

  // تنسيق التاريخ
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch { return dateStr; }
  };

  // الحصول على حالة العرض
  const getOfferStatus = (offer) => {
    const now = new Date();
    const start = new Date(offer.start_date);
    const end = new Date(offer.end_date);

    if (!offer.active) return { label: 'غير نشط', color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400' };
    if (now < start) return { label: 'لم يبدأ', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' };
    if (now > end) return { label: 'انتهى', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' };
    return { label: 'نشط', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' };
  };

  // إضافة للعربة
  const handleAddToCart = async (offer) => {
    if (!user) {
      toast.warning('⚠️ من فضلك سجل الدخول أولاً');
      return;
    }

    setIsAddingToCart(prev => ({ ...prev, [offer.id]: true }));
    
    try {
      const product = {
        id: offer.id,
        name: offer.name,
        price: offer.offer_price,
        image: offer.image || 'https://picsum.photos/seed/' + offer.id + '/300/300',
        stock: offer.stock || 999,
        category: offer.category || 'عروض',
        brand: offer.brand || '',
        rating: offer.rating || 0,
        description: offer.description || ''
      };
      
      const result = await addToCart(product, 1);
      if (result.success) {
        toast.success('✅ تم إضافة العرض للعربة');
      }
    } catch (error) {
      toast.error('❌ حدث خطأ أثناء الإضافة للعربة');
    } finally {
      setIsAddingToCart(prev => ({ ...prev, [offer.id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
        <p className="text-gray-500 dark:text-gray-400 mt-4">جاري تحميل العروض...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* عنوان الصفحة */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ArrowLeftIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TagIcon className="h-7 w-7 text-rose-500" />
              العروض والتخفيضات
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              استفد من أفضل العروض والتخفيضات الحصرية
            </p>
          </div>
          <span className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-xs px-2 py-0.5 rounded-full mr-auto">
            {offers.length} عرض نشط
          </span>
        </div>

        {offers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <TagIcon className="h-24 w-24 mx-auto" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">لا توجد عروض حالياً</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">ترقب العروض الجديدة قريباً!</p>
            <Link
              to="/products"
              className="inline-block px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
            >
              استعراض المنتجات
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => {
              const status = getOfferStatus(offer);
              const isActive = status.label === 'نشط';
              const discountPercent = offer.discount_value || 
                (offer.original_price > 0 && offer.offer_price > 0 
                  ? Math.round(((offer.original_price - offer.offer_price) / offer.original_price) * 100) 
                  : 0);

              return (
                <div
                  key={offer.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-md border overflow-hidden transition-all duration-300 ${
                    isActive
                      ? 'border-rose-200 dark:border-rose-700 hover:shadow-xl hover:-translate-y-1'
                      : 'border-gray-200 dark:border-gray-700 opacity-70'
                  }`}
                >
                  {/* صورة العرض */}
                  <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <img
                      src={offer.image || `https://picsum.photos/seed/${offer.id}/600/400`}
                      alt={offer.name}
                      className="w-full h-full object-cover"
                      onError={(e) => e.target.src = `https://picsum.photos/seed/${offer.id}/600/400`}
                    />
                    
                    {/* شارة الخصم */}
                    {discountPercent > 0 && isActive && (
                      <div className="absolute top-3 right-3 bg-rose-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                        {discountPercent}% OFF
                      </div>
                    )}
                    
                    {/* حالة العرض */}
                    <div className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                      {status.label}
                    </div>
                  </div>

                  {/* محتوى العرض */}
                  <div className="p-4 space-y-3">
                    {/* اسم العرض */}
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
                      {offer.name}
                    </h3>
                    
                    {/* الوصف */}
                    {offer.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {offer.description}
                      </p>
                    )}

                    {/* التصنيف والماركة */}
                    <div className="flex flex-wrap items-center gap-2">
                      {offer.category && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                          {offer.category}
                        </span>
                      )}
                      {offer.brand && (
                        <span className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                          {offer.brand}
                        </span>
                      )}
                      {offer.rating > 0 && (
                        <span className="text-xs flex items-center gap-0.5 text-yellow-500">
                          <StarIcon className="h-3 w-3 fill-yellow-500" />
                          {offer.rating}
                        </span>
                      )}
                    </div>

                    {/* السعر */}
                    <div className="flex items-baseline gap-3">
                      <span className="text-xl font-bold text-rose-600 dark:text-rose-400">
                        {formatPrice(offer.offer_price)}
                      </span>
                      {offer.original_price > 0 && (
                        <span className="text-sm text-gray-400 dark:text-gray-500 line-through">
                          {formatPrice(offer.original_price)}
                        </span>
                      )}
                    </div>

                    {/* المخزون */}
                    {offer.stock > 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        المخزون: {offer.stock} قطعة
                      </div>
                    )}

                    {/* المدة */}
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <ClockIcon className="h-3 w-3" />
                      <span>
                        {formatDate(offer.start_date)} - {formatDate(offer.end_date)}
                      </span>
                    </div>

                    {/* أزرار الإجراءات */}
                    <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <Link
                        to={`/offer/${offer.id}`}
                        className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center text-sm"
                      >
                        عرض التفاصيل
                      </Link>
                      
                      {isActive && (
                        <button
                          onClick={() => handleAddToCart(offer)}
                          disabled={isAddingToCart[offer.id]}
                          className="flex-1 py-2 bg-rose-600 dark:bg-rose-500 text-white rounded-lg hover:bg-rose-700 dark:hover:bg-rose-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isAddingToCart[offer.id] ? 'جاري الإضافة...' : 'أضف للعربة'}
                        </button>
                      )}
                    </div>

                    {/* ميزات إضافية */}
                    <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                      <div className="flex items-center gap-1">
                        <TruckIcon className="h-3 w-3" />
                        <span>توصيل سريع</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ShieldCheckIcon className="h-3 w-3" />
                        <span>دفع آمن</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OffersPage;
