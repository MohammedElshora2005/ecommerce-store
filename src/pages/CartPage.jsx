// ecommerce-store/src/pages/CartPage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  ShoppingCartIcon,
  ArrowLeftIcon,
  FaceSmileIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    cartItems,
    loading,
    error,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalPrice,
    fetchCart
  } = useCart();

  const [isUpdating, setIsUpdating] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // جلب العربة عند تحميل الصفحة
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);

  // تحديث كمية منتج
  const handleUpdateQuantity = async (productId, quantity) => {
    setIsUpdating(true);
    try {
      await updateQuantity(productId, quantity);
    } finally {
      setIsUpdating(false);
    }
  };

  // حذف منتج من العربة
  const handleRemoveItem = async (productId) => {
    setIsUpdating(true);
    try {
      await removeFromCart(productId);
    } finally {
      setIsUpdating(false);
    }
  };

  // تفريغ العربة
  const handleClearCart = async () => {
    setIsUpdating(true);
    try {
      await clearCart();
      setShowClearConfirm(false);
    } finally {
      setIsUpdating(false);
    }
  };

  // التوجه لصفحة الدفع
  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    navigate('/checkout');
  };

  // حساب عدد المنتجات والإجمالي
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  // عرض حالة التحميل
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" color="blue" text="جاري تحميل العربة..." />
      </div>
    );
  }

  // عرض حالة الخطأ
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-600 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">حدث خطأ</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  // عرض صفحة العربة الفارغة
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* عنوان الصفحة */}
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">عربة التسوق</h1>
          </div>

          {/* محتوى فارغ */}
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gray-100 rounded-full">
                <ShoppingCartIcon className="h-24 w-24 text-gray-400" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              عربتك فارغة
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              يبدو أنك لم تضف أي منتجات إلى عربتك بعد. تصفح منتجاتنا وابدأ التسوق الآن!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                استعراض المنتجات
              </Link>
              <Link
                to="/"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                العودة للرئيسية
              </Link>
            </div>

            {/* اقتراحات */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4 flex items-center justify-center gap-2">
                <FaceSmileIcon className="h-5 w-5" />
                قد تعجبك أيضاً
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((item) => (
                  <Link
                    key={item}
                    to={`/product/${item}`}
                    className="group block"
                  >
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                      <img
                        src={`https://picsum.photos/id/${item + 20}/300/300`}
                        alt={`منتج ${item}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">
                      منتج مميز {item}
                    </p>
                    <p className="text-sm font-bold text-blue-600">₪{100 * item}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // عرض صفحة العربة مع المنتجات
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* عنوان الصفحة */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">عربة التسوق</h1>
              <p className="text-sm text-gray-500">
                {totalItems} منتج{totalItems !== 1 ? 'ات' : ''} في عربتك
              </p>
            </div>
          </div>

          {/* أزرار إضافية */}
          <div className="flex items-center gap-3">
            <Link
              to="/wishlist"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <HeartIcon className="h-5 w-5" />
              <span className="hidden sm:inline">المفضلة</span>
            </Link>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
            >
              تفريغ العربة
            </button>
          </div>
        </div>

        {/* محتوى العربة */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* قائمة المنتجات */}
          <div className="flex-1 space-y-4">
            {cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                isReadOnly={isUpdating}
              />
            ))}

            {/* رسالة الشحن المجاني */}
            {totalPrice < 500 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  💡 أضف منتجات بقيمة {500 - totalPrice} جنيه للحصول على شحن مجاني
                </p>
                <div className="mt-2 bg-blue-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((totalPrice / 500) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ملخص الطلب */}
          <div className="lg:w-96 flex-shrink-0">
            <CartSummary
              items={cartItems}
              totalPrice={totalPrice}
              totalItems={totalItems}
              onClearCart={handleClearCart}
              isCheckout={false}
            />
          </div>
        </div>
      </div>

      {/* مودال تأكيد تفريغ العربة */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                تفريغ العربة
              </h3>
              <p className="text-gray-600">
                هل أنت متأكد من رغبتك في حذف جميع المنتجات من عربة التسوق؟
              </p>
              <p className="text-sm text-gray-500 mt-2">هذا الإجراء لا يمكن التراجع عنه</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleClearCart}
                disabled={isUpdating}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    جاري التفريغ...
                  </>
                ) : (
                  'تأكيد التفريغ'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* إضافة تأثيرات CSS للـ fadeIn - شيلنا jsx */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CartPage;