// ecommerce-store/src/pages/OfferDetailsPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import {
  ArrowLeftIcon,
  ShoppingCartIcon,
  TagIcon,
  StarIcon,
  TruckIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const OfferDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    const loadOffer = () => {
      setLoading(true);
      try {
        const savedOffers = localStorage.getItem('offers');
        if (savedOffers) {
          const allOffers = JSON.parse(savedOffers);
          const foundOffer = allOffers.find(o => o.id === id);
          setOffer(foundOffer);
        }
      } catch (error) {
        console.error('Error loading offer:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOffer();
  }, [id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

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

  const getOfferStatus = (offer) => {
    const now = new Date();
    const start = new Date(offer.startDate);
    const end = new Date(offer.endDate);

    if (!offer.active) return { label: 'غير نشط', color: 'bg-gray-100 text-gray-700' };
    if (now < start) return { label: 'لم يبدأ', color: 'bg-blue-100 text-blue-700' };
    if (now > end) return { label: 'انتهى', color: 'bg-red-100 text-red-700' };
    return { label: 'نشط', color: 'bg-green-100 text-green-700' };
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.warning('⚠️ من فضلك سجل الدخول أولاً');
      return;
    }

    setIsAddingToCart(true);
    try {
      const product = {
        id: offer.id,
        name: offer.name,
        price: offer.offerPrice,
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
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">العرض غير موجود</h1>
        <Link to="/offers" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
          العودة للعروض
        </Link>
      </div>
    );
  }

  const status = getOfferStatus(offer);
  const isActive = status.label === 'نشط';
  const discountPercent = offer.discountValue || 
    (offer.originalPrice > 0 && offer.offerPrice > 0 
      ? Math.round(((offer.originalPrice - offer.offerPrice) / offer.originalPrice) * 100) 
      : 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* زر العودة */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>العودة</span>
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* الصورة */}
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              <img
                src={offer.image || `https://picsum.photos/seed/${offer.id}/600/600`}
                alt={offer.name}
                className="w-full h-full object-cover"
                onError={(e) => e.target.src = `https://picsum.photos/seed/${offer.id}/600/600`}
              />
              
              {discountPercent > 0 && isActive && (
                <div className="absolute top-4 right-4 bg-rose-600 text-white text-lg font-bold px-4 py-2 rounded-full">
                  {discountPercent}% OFF
                </div>
              )}
              
              <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                {status.label}
              </div>
            </div>

            {/* المعلومات */}
            <div className="flex flex-col">
              {/* التصنيف والماركة */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {offer.category && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm rounded-full">
                    {offer.category}
                  </span>
                )}
                {offer.brand && (
                  <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm rounded-full">
                    {offer.brand}
                  </span>
                )}
                {offer.rating > 0 && (
                  <span className="flex items-center gap-1 text-sm text-yellow-500">
                    <StarIcon className="h-4 w-4 fill-yellow-500" />
                    {offer.rating}
                  </span>
                )}
              </div>

              {/* الاسم */}
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {offer.name}
              </h1>

              {/* الوصف */}
              {offer.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  {offer.description}
                </p>
              )}

              {/* السعر */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-bold text-rose-600 dark:text-rose-400">
                  {formatPrice(offer.offerPrice)}
                </span>
                {offer.originalPrice > 0 && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(offer.originalPrice)}
                  </span>
                )}
              </div>

              {/* المخزون */}
              {offer.stock > 0 && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  المخزون المتبقي: <span className="font-bold">{offer.stock}</span> قطعة
                </div>
              )}

              {/* المدة */}
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <ClockIcon className="h-4 w-4" />
                <span>
                  {formatDate(offer.startDate)} - {formatDate(offer.endDate)}
                </span>
              </div>

              {/* ميزات */}
              <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <TruckIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>توصيل سريع</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span>دفع آمن</span>
                </div>
              </div>

              {/* أزرار */}
              <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                {isActive ? (
                  <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    className="flex-1 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAddingToCart ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        جاري الإضافة...
                      </>
                    ) : (
                      <>
                        <ShoppingCartIcon className="h-5 w-5" />
                        إضافة للعربة
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg text-center font-medium">
                    {status.label}
                  </div>
                )}
                
                <Link
                  to="/products"
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
                >
                  استعراض المنتجات
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferDetailsPage;