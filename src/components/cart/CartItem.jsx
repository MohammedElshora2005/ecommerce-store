// ecommerce-store/src/components/cart/CartItem.jsx

import React, { useState } from 'react';
import { 
  TrashIcon, 
  PlusIcon, 
  MinusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const CartItem = ({ 
  item, 
  onUpdateQuantity, 
  onRemoveItem,
  isReadOnly = false 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  // حساب السعر الإجمالي للمنتج (السعر × الكمية)
  const totalPrice = item.price * item.quantity;

  // تنسيق السعر بالجنيه المصري
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // زيادة الكمية
  const handleIncrease = async () => {
    if (item.quantity >= item.stock) {
      // يمكن إضافة رسالة تنبيه بعدين
      return;
    }
    setIsLoading(true);
    try {
      await onUpdateQuantity(item.id, item.quantity + 1);
    } finally {
      setIsLoading(false);
    }
  };

  // تنقيص الكمية
  const handleDecrease = async () => {
    if (item.quantity <= 1) {
      // إذا كانت الكمية 1، نعرض تأكيد الحذف
      setShowRemoveConfirm(true);
      return;
    }
    setIsLoading(true);
    try {
      await onUpdateQuantity(item.id, item.quantity - 1);
    } finally {
      setIsLoading(false);
    }
  };

  // حذف المنتج
  const handleRemove = async () => {
    setIsLoading(true);
    try {
      await onRemoveItem(item.id);
      setShowRemoveConfirm(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition-all duration-200 ${
      isLoading ? 'opacity-50' : 'hover:shadow-md'
    }`}>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* صورة المنتج */}
        <div className="flex-shrink-0">
          <Link to={`/product/${item.id}`}>
            <img
              src={item.image}
              alt={item.name}
              className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-lg border border-gray-100 hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
          </Link>
        </div>

        {/* معلومات المنتج */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            {/* اسم وتفاصيل المنتج */}
            <div className="flex-1">
              <Link to={`/product/${item.id}`}>
                <h3 className="text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
                  {item.name}
                </h3>
              </Link>
              
              {/* التصنيف والعلامة التجارية */}
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                  {item.category}
                </span>
                {item.brand && (
                  <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
                    {item.brand}
                  </span>
                )}
                {item.stock <= 5 && (
                  <span className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-full">
                    مخزون محدود
                  </span>
                )}
              </div>

              {/* التقييم */}
              {item.rating && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-yellow-400">★</span>
                  <span className="text-sm font-medium text-gray-700">{item.rating}</span>
                  <span className="text-xs text-gray-500">({item.reviews || 0} تقييم)</span>
                </div>
              )}
            </div>

            {/* السعر */}
            <div className="text-left sm:text-right">
              <div className="text-lg font-bold text-gray-900">
                {formatPrice(totalPrice)}
              </div>
              {item.quantity > 1 && (
                <div className="text-xs text-gray-500">
                  {formatPrice(item.price)} × {item.quantity}
                </div>
              )}
            </div>
          </div>

          {/* التحكم في الكمية وحذف المنتج */}
          {!isReadOnly && (
            <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-gray-100">
              {/* أزرار التحكم في الكمية */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handleDecrease}
                  disabled={isLoading}
                  className={`p-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors ${
                    isLoading ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                  aria-label="تنقيص الكمية"
                >
                  <MinusIcon className="h-4 w-4 text-gray-600" />
                </button>
                
                <span className="w-10 text-center font-medium text-gray-900">
                  {item.quantity}
                </span>
                
                <button
                  onClick={handleIncrease}
                  disabled={isLoading || item.quantity >= item.stock}
                  className={`p-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors ${
                    isLoading || item.quantity >= item.stock ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                  aria-label="زيادة الكمية"
                >
                  <PlusIcon className="h-4 w-4 text-gray-600" />
                </button>

                {/* عرض المخزون المتبقي */}
                <span className="text-xs text-gray-500 mr-2">
                  (المتبقي: {item.stock})
                </span>
              </div>

              {/* زر حذف المنتج */}
              <button
                onClick={() => setShowRemoveConfirm(true)}
                disabled={isLoading}
                className="flex items-center gap-1 text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors text-sm"
              >
                <TrashIcon className="h-4 w-4" />
                <span>حذف</span>
              </button>
            </div>
          )}

          {/* عرض للقراءة فقط (مثلاً في صفحة تأكيد الطلب) */}
          {isReadOnly && (
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-600">
                الكمية: <span className="font-medium">{item.quantity}</span>
              </span>
              <span className="text-sm text-gray-600">
                السعر: <span className="font-medium">{formatPrice(item.price)}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* مودال تأكيد الحذف */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">تأكيد الحذف</h3>
              <button
                onClick={() => setShowRemoveConfirm(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                هل أنت متأكد من رغبتك في حذف منتج 
                <span className="font-semibold text-gray-900"> "{item.name}" </span>
                من عربة التسوق؟
              </p>
              <p className="text-sm text-gray-500 mt-2">هذا الإجراء لا يمكن التراجع عنه</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRemoveConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleRemove}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    جاري الحذف...
                  </>
                ) : (
                  <>
                    <TrashIcon className="h-4 w-4" />
                    تأكيد الحذف
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartItem;