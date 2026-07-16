// ecommerce-store/src/components/products/ProductCard.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartIcon,
  ShoppingCartIcon,
  StarIcon,
  EyeIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';

const ProductCard = ({ 
  product, 
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
  variant = 'default',
  showQuickView = false
}) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // تنسيق السعر بالجنيه المصري
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // حساب التقييم (نجوم)
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <StarIcon key={`full-${i}`} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
        ))}
        {hasHalfStar && (
          <StarIcon className="h-4 w-4 text-yellow-400 fill-yellow-400" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <StarIcon key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
        ))}
        <span className="text-xs font-medium text-gray-600 mr-1">({rating})</span>
      </div>
    );
  };

  // إضافة للمفضلة
  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      // توجيه المستخدم لتسجيل الدخول
      window.location.href = '/login';
      return;
    }

    setIsWishlistLoading(true);
    try {
      await onToggleWishlist(product.id);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  // إضافة للعربة
  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      if (onAddToCart) {
        await onAddToCart(product);
      } else {
        await addToCart(product);
      }
      
      // عرض رسالة نجاح
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // متغيرات التصميم حسب النوع
  const variantStyles = {
    default: {
      container: 'bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300',
      imageWrapper: 'relative overflow-hidden rounded-t-xl',
      content: 'p-4',
      title: 'text-sm font-semibold text-gray-800 hover:text-blue-600 transition-colors',
      price: 'text-lg font-bold text-blue-600'
    },
    compact: {
      container: 'bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300',
      imageWrapper: 'relative overflow-hidden rounded-t-lg',
      content: 'p-3',
      title: 'text-xs font-medium text-gray-800 hover:text-blue-600 transition-colors',
      price: 'text-base font-bold text-blue-600'
    },
    featured: {
      container: 'bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1',
      imageWrapper: 'relative overflow-hidden rounded-t-2xl',
      content: 'p-5',
      title: 'text-base font-semibold text-gray-800 hover:text-blue-600 transition-colors',
      price: 'text-xl font-bold text-blue-600'
    }
  };

  const styles = variantStyles[variant] || variantStyles.default;

  return (
    <div className={`${styles.container} group relative`}>
      {/* صورة المنتج */}
      <div className={styles.imageWrapper}>
        <Link to={`/product/${product.id}`}>
          <div className="aspect-square bg-gray-100">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
          </div>
        </Link>

        {/* شارة المخزون */}
        {product.stock <= 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            نفذ من المخزون
          </div>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
            مخزون محدود
          </div>
        )}

        {/* شارة العرض الخاص */}
        {product.offer && (
          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            عرض خاص
          </div>
        )}

        {/* أزرار الإجراءات السريعة (تظهر عند hover) */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          {showQuickView && (
            <Link
              to={`/product/${product.id}`}
              className="p-2 bg-white rounded-full hover:bg-blue-600 hover:text-white transition-all duration-200 transform hover:scale-110"
              aria-label="عرض سريع"
            >
              <EyeIcon className="h-5 w-5" />
            </Link>
          )}
          <button
            onClick={handleToggleWishlist}
            disabled={isWishlistLoading}
            className={`p-2 rounded-full transition-all duration-200 transform hover:scale-110 ${
              isWishlisted
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white text-gray-600 hover:bg-red-500 hover:text-white'
            } ${isWishlistLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="إضافة للمفضلة"
          >
            {isWishlisted ? (
              <HeartSolidIcon className="h-5 w-5" />
            ) : (
              <HeartIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* محتوى المنتج */}
      <div className={styles.content}>
        <Link to={`/product/${product.id}`}>
          <h3 className={`${styles.title} line-clamp-2 mb-1`}>
            {product.name}
          </h3>
        </Link>

        {/* التقييم */}
        <div className="flex items-center justify-between mb-2">
          {product.rating && renderStars(product.rating)}
          {product.brand && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {product.brand}
            </span>
          )}
        </div>

        {/* السعر */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-baseline gap-2">
            <span className={styles.price}>
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* زر إضافة للعربة */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0 || isAddingToCart}
            className={`p-2 rounded-lg transition-all duration-200 ${
              product.stock <= 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : isAddingToCart
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:scale-105'
            }`}
            aria-label="إضافة للعربة"
          >
            {isAddingToCart ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <ShoppingCartIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* رسالة نجاح الإضافة */}
        {showSuccessMessage && (
          <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-2 animate-fadeIn">
            <div className="flex items-center gap-2 text-xs text-green-700">
              <CheckBadgeIcon className="h-4 w-4" />
              <span>تمت الإضافة للعربة</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// مكون لعرض المنتجات في شبكة
export const ProductGrid = ({ products, ...props }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} {...props} />
      ))}
    </div>
  );
};

// مكون لعرض المنتجات في قائمة
export const ProductList = ({ products, ...props }) => {
  return (
    <div className="space-y-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} {...props} variant="compact" />
      ))}
    </div>
  );
};

export default ProductCard;