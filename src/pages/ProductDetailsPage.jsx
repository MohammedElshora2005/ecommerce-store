// ecommerce-store/src/pages/ProductDetailsPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { products, getProductById } from '../api/products';
import {
  ArrowLeftIcon,
  ShoppingCartIcon,
  HeartIcon,
  HeartIcon as HeartSolidIcon,
  StarIcon,
  ShareIcon,
  CheckBadgeIcon,
  TruckIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  PlusIcon,
  MinusIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // جلب بيانات المنتج
  useEffect(() => {
    const fetchProduct = () => {
      setLoading(true);
      try {
        // محاكاة جلب البيانات من API
        setTimeout(() => {
          const foundProduct = getProductById(parseInt(id));
          
          if (foundProduct) {
            setProduct(foundProduct);
            
            // جلب منتجات مشابهة (نفس التصنيف)
            const related = products
              .filter(p => p.category === foundProduct.category && p.id !== foundProduct.id)
              .slice(0, 4);
            setRelatedProducts(related);
          } else {
            // المنتج غير موجود
            navigate('/products', { state: { error: 'المنتج غير موجود' } });
          }
          
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching product:', error);
        setLoading(false);
        navigate('/products');
      }
    };

    fetchProduct();
  }, [id, navigate]);

  // التحقق من وجود المنتج في المفضلة (محاكاة)
  useEffect(() => {
    if (product) {
      // محاكاة: التحقق من المفضلة (يمكن ربطها بـ Supabase بعدين)
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setIsWishlisted(wishlist.includes(product.id));
    }
  }, [product]);

  // زيادة الكمية
  const increaseQuantity = () => {
    if (quantity < product?.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  // تنقيص الكمية
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // تبديل المفضلة
  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }

    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    let newWishlist;
    
    if (isWishlisted) {
      newWishlist = wishlist.filter(item => item !== product.id);
    } else {
      newWishlist = [...wishlist, product.id];
    }
    
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    setIsWishlisted(!isWishlisted);
  };

  // إضافة للعربة
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }

    setIsAddingToCart(true);
    try {
      const result = await addToCart(product, quantity);
      if (result.success) {
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // مشاركة المنتج
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `تحقق من هذا المنتج: ${product.name}`,
        url: window.location.href,
      });
    } else {
      // نسخ الرابط
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ رابط المنتج!');
    }
  };

  // تنسيق السعر
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // عرض التقييم بالنجوم
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <StarIcon key={`full-${i}`} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
        ))}
        {hasHalfStar && (
          <StarIcon className="h-5 w-5 text-yellow-400 fill-yellow-400" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <StarIcon key={`empty-${i}`} className="h-5 w-5 text-gray-300" />
        ))}
        <span className="mr-2 text-sm font-medium text-gray-700">{rating}</span>
        <span className="text-sm text-gray-500">(120 تقييم)</span>
      </div>
    );
  };

  // عرض حالة التحميل
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" color="blue" text="جاري تحميل المنتج..." />
      </div>
    );
  }

  // إذا لم يوجد منتج
  if (!product) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* زر العودة */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-6"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        <span>العودة</span>
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
          {/* قسم الصور */}
          <div>
            {/* الصورة الرئيسية */}
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* شارة المخزون */}
              {product.stock <= 0 && (
                <div className="absolute top-4 right-4 bg-red-500 text-white text-sm px-3 py-1 rounded-full">
                  نفذ من المخزون
                </div>
              )}
              {product.stock > 0 && product.stock <= 5 && (
                <div className="absolute top-4 right-4 bg-orange-500 text-white text-sm px-3 py-1 rounded-full">
                  مخزون محدود
                </div>
              )}

              {/* زر المفضلة */}
              <button
                onClick={handleToggleWishlist}
                className="absolute top-4 left-4 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors"
              >
                {isWishlisted ? (
                  <HeartSolidIcon className="h-6 w-6 text-red-500" />
                ) : (
                  <HeartIcon className="h-6 w-6 text-gray-600" />
                )}
              </button>

              {/* زر المشاركة */}
              <button
                onClick={handleShare}
                className="absolute bottom-4 left-4 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors"
              >
                <ShareIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* صور إضافية (محاكاة) */}
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? 'border-blue-600' : 'border-transparent'
                  }`}
                >
                  <img
                    src={`https://picsum.photos/id/${product.id + index + 10}/300/300`}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* معلومات المنتج */}
          <div className="flex flex-col">
            {/* التصنيف والعلامة التجارية */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-blue-50 text-blue-600 text-sm rounded-full">
                {product.category}
              </span>
              {product.brand && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                  {product.brand}
                </span>
              )}
            </div>

            {/* اسم المنتج */}
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>

            {/* التقييم */}
            <div className="flex items-center gap-4 mb-4">
              {product.rating && renderStars(product.rating)}
            </div>

            {/* السعر */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-blue-600">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  وفر {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </span>
              )}
            </div>

            {/* المخزون */}
            <div className="flex items-center gap-2 mb-4">
              {product.stock > 0 ? (
                <>
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  <span className="text-green-600 font-medium">متوفر</span>
                  <span className="text-sm text-gray-500">({product.stock} قطعة متبقية)</span>
                </>
              ) : (
                <>
                  <XCircleIcon className="h-5 w-5 text-red-500" />
                  <span className="text-red-600 font-medium">غير متوفر</span>
                </>
              )}
            </div>

            {/* الوصف */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">الوصف</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* ميزات المنتج (محاكاة) */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TruckIcon className="h-4 w-4 text-blue-600" />
                <span>توصيل سريع</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ArrowPathIcon className="h-4 w-4 text-blue-600" />
                <span>إرجاع مجاني</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ShieldCheckIcon className="h-4 w-4 text-blue-600" />
                <span>ضمان الجودة</span>
              </div>
            </div>

            {/* التحكم في الكمية */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-gray-700">الكمية:</span>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={increaseQuantity}
                  disabled={quantity >= product.stock}
                  className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
              <span className="text-sm text-gray-500">الحد الأقصى: {product.stock}</span>
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0 || isAddingToCart}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  product.stock <= 0 || isAddingToCart
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
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
                    {isInCart(product.id) ? 'تحديث الكمية' : 'إضافة للعربة'}
                  </>
                )}
              </button>

              {isInCart(product.id) && (
                <Link
                  to="/cart"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
                >
                  عرض العربة
                </Link>
              )}
            </div>

            {/* رسالة النجاح */}
            {showSuccessMessage && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 animate-fade-in">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckBadgeIcon className="h-5 w-5" />
                  <span>تمت إضافة المنتج إلى عربة التسوق بنجاح!</span>
                </div>
              </div>
            )}

            {/* معلومات إضافية */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">SKU:</span>
                  <span className="mr-1 text-gray-700" dir="ltr">PRD-{String(product.id).padStart(4, '0')}</span>
                </div>
                <div>
                  <span className="text-gray-500">التصنيف:</span>
                  <span className="mr-1 text-gray-700">{product.category}</span>
                </div>
                <div>
                  <span className="text-gray-500">العلامة التجارية:</span>
                  <span className="mr-1 text-gray-700">{product.brand || 'عام'}</span>
                </div>
                <div>
                  <span className="text-gray-500">التقييم:</span>
                  <span className="mr-1 text-gray-700">{product.rating || 'لا يوجد'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* منتجات مشابهة */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">منتجات مشابهة</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-lg font-bold text-blue-600 mt-1">
                    {formatPrice(product.price)}
                  </p>
                  {product.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      <StarIcon className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs text-gray-600">{product.rating}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;