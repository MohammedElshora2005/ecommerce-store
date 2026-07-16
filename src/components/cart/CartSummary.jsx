// ecommerce-store/src/components/cart/CartSummary.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import {
  ShoppingBagIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  CreditCardIcon,
  GiftIcon,
  TagIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const CartSummary = ({ 
  items, 
  totalPrice, 
  totalItems,
  onClearCart,
  onApplyCoupon,
  isCheckout = false 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getSubtotal, getDiscountAmount, getDiscountPercentage } = useCart();
  
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // ✅ الحصول على مستوى الولاء
  const userLevel = user?.loyaltyLevel || 'برونزي';
  const discountPercentage = getDiscountPercentage();
  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();
  
  // ✅ مستويات الولاء
  const loyaltyLevels = {
    'برونزي': { icon: '●', color: 'text-amber-600', bg: 'bg-amber-50', discount: '0%' },
    'فضي': { icon: '✦', color: 'text-gray-400', bg: 'bg-gray-50', discount: '5%' },
    'ذهبي': { icon: '⭐', color: 'text-yellow-500', bg: 'bg-yellow-50', discount: '10%' }
  };
  
  const levelInfo = loyaltyLevels[userLevel] || loyaltyLevels['برونزي'];

  // تكاليف الشحن (مجاني للطلبات فوق 500 جنيه)
  const shippingCost = totalPrice >= 500 ? 0 : 50;
  const isFreeShipping = shippingCost === 0;

  // حساب الضريبة (14% VAT)
  const taxRate = 0.14;
  const taxAmount = totalPrice * taxRate;

  // حساب الإجمالي النهائي
  const finalTotal = totalPrice + shippingCost + taxAmount - couponDiscount;

  // تنسيق السعر
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // تطبيق الكوبون (محاكاة)
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('من فضلك أدخل كود الخصم');
      return;
    }

    setIsApplyingCoupon(true);
    setCouponError('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const validCoupons = {
        'SAVE10': { discount: totalPrice * 0.1, message: 'خصم 10%' },
        'SAVE20': { discount: totalPrice * 0.2, message: 'خصم 20%' },
        'WELCOME': { discount: 50, message: 'خصم 50 جنيه' },
        'FREESHIP': { discount: shippingCost, message: 'شحن مجاني' }
      };

      const coupon = validCoupons[couponCode.toUpperCase()];

      if (coupon) {
        setCouponDiscount(coupon.discount);
        setCouponApplied(true);
        onApplyCoupon && onApplyCoupon(couponCode, coupon.discount);
        setCouponError('');
      } else {
        setCouponError('كود الخصم غير صحيح');
        setCouponDiscount(0);
        setCouponApplied(false);
      }
    } catch (error) {
      setCouponError('حدث خطأ أثناء تطبيق الكوبون');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // إلغاء الكوبون
  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponApplied(false);
    setCouponDiscount(0);
    setCouponError('');
    onApplyCoupon && onApplyCoupon('', 0);
  };

  // تفريغ العربة
  const handleClearCart = async () => {
    if (!window.confirm('هل أنت متأكد من رغبتك في تفريغ عربة التسوق بالكامل؟')) {
      return;
    }

    setIsClearing(true);
    try {
      await onClearCart();
    } finally {
      setIsClearing(false);
    }
  };

  // التوجه لصفحة الدفع
  const handleCheckout = () => {
    if (items.length === 0) {
      alert('عربة التسوق فارغة');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-4">
      {/* ✅ بطاقة مستوى الولاء */}
      {user && discountPercentage > 0 && (
        <div className={`mb-4 p-3 rounded-lg ${levelInfo.bg} border border-gray-200 dark:border-gray-600`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-xl ${levelInfo.color}`}>{levelInfo.icon}</span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  خصم {levelInfo.discount} للعملاء {userLevel}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  تم تطبيق الخصم تلقائياً
                </p>
              </div>
            </div>
            <span className={`text-sm font-bold ${levelInfo.color}`}>
              -{formatPrice(discountAmount)}
            </span>
          </div>
        </div>
      )}

      {/* عنوان الملخص */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ShoppingBagIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          ملخص الطلب
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {totalItems} منتج{totalItems !== 1 ? 'ات' : ''}
        </span>
      </div>

      {/* قائمة المنتجات المختصرة */}
      {items.length > 0 && (
        <div className="max-h-48 overflow-y-auto mb-4 space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-10 h-10 object-cover rounded border border-gray-200 dark:border-gray-600 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 dark:text-gray-200 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">× {item.quantity}</p>
                </div>
              </div>
              <span className="font-medium text-gray-900 dark:text-white whitespace-nowrap mr-2">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* تفاصيل التكاليف */}
      <div className="space-y-3">
        {/* ✅ السعر الأصلي (بدون خصم) */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">السعر الأصلي</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatPrice(subtotal)}
          </span>
        </div>

        {/* ✅ الخصم (نقاط الولاء) */}
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
            <span className="flex items-center gap-1">
              <StarIcon className="h-4 w-4" />
              خصم الولاء ({discountPercentage}%)
            </span>
            <span className="font-medium">
              -{formatPrice(discountAmount)}
            </span>
          </div>
        )}

        {/* الشحن */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
            <TruckIcon className="h-4 w-4 text-gray-400" />
            الشحن
          </span>
          <span className={`font-medium ${isFreeShipping ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
            {isFreeShipping ? 'مجاني' : formatPrice(shippingCost)}
          </span>
        </div>

        {/* الضريبة */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
            <ShieldCheckIcon className="h-4 w-4 text-gray-400" />
            الضريبة (14%)
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatPrice(taxAmount)}
          </span>
        </div>

        {/* كود الخصم */}
        {couponApplied && (
          <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
            <span className="flex items-center gap-1">
              <TagIcon className="h-4 w-4" />
              الخصم
            </span>
            <span className="font-medium">
              -{formatPrice(couponDiscount)}
            </span>
          </div>
        )}

        {/* خط فاصل */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-base font-bold text-gray-900 dark:text-white">الإجمالي النهائي</span>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {formatPrice(finalTotal)}
            </span>
          </div>
          {isFreeShipping && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ شامل الشحن المجاني</p>
          )}
          {discountAmount > 0 && (
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              ✓ خصم {discountPercentage}% من نقاط الولاء
            </p>
          )}
        </div>
      </div>

      {/* حقل كود الخصم */}
      {!isCheckout && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  setCouponError('');
                }}
                placeholder="أدخل كود الخصم"
                disabled={couponApplied || isApplyingCoupon}
                className={`w-full px-3 py-2 border ${
                  couponError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm dark:bg-gray-700 dark:text-white`}
                dir="ltr"
              />
              {couponError && (
                <p className="text-xs text-red-500 mt-1">{couponError}</p>
              )}
            </div>
            <button
              onClick={couponApplied ? handleRemoveCoupon : handleApplyCoupon}
              disabled={isApplyingCoupon}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                couponApplied
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  : 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
              } ${isApplyingCoupon ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isApplyingCoupon ? (
                <div className="flex items-center gap-1">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : couponApplied ? (
                'إلغاء الخصم'
              ) : (
                'تطبيق'
              )}
            </button>
          </div>
          {couponApplied && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              ✓ تم تطبيق الخصم بنجاح
            </p>
          )}
        </div>
      )}

      {/* أزرار الإجراءات */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
        {/* زر إتمام الطلب */}
        {!isCheckout ? (
          <>
            <button
              onClick={handleCheckout}
              disabled={items.length === 0}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                items.length === 0
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              <CreditCardIcon className="h-5 w-5" />
              إتمام الطلب
            </button>

            {/* زر تفريغ العربة */}
            <button
              onClick={handleClearCart}
              disabled={items.length === 0 || isClearing}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 text-sm ${
                items.length === 0 || isClearing
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 hover:border-red-300'
              }`}
            >
              {isClearing ? 'جاري التفريغ...' : 'تفريغ العربة'}
            </button>

            {/* زر متابعة التسوق */}
            <Link
              to="/products"
              className="block w-full text-center py-2 px-4 rounded-lg font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all duration-200 text-sm"
            >
              متابعة التسوق
            </Link>
          </>
        ) : (
          /* عرض في صفحة الدفع */
          <div className="space-y-2">
            <button
              onClick={handleCheckout}
              className="w-full py-3 px-4 bg-green-600 dark:bg-green-500 text-white rounded-lg font-medium hover:bg-green-700 dark:hover:bg-green-600 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <ShieldCheckIcon className="h-5 w-5" />
              تأكيد الطلب
            </button>
            <Link
              to="/cart"
              className="block w-full text-center py-2 px-4 rounded-lg font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all duration-200 text-sm"
            >
              العودة للعربة
            </Link>
          </div>
        )}
      </div>

      {/* معلومات إضافية */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <ShieldCheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span>دفع آمن</span>
          </div>
          <div className="flex items-center gap-1">
            <ArrowPathIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>إرجاع مجاني</span>
          </div>
          <div className="flex items-center gap-1">
            <GiftIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span>هدايا مع الطلبات</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;