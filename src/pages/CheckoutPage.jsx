// ecommerce-store/src/pages/CheckoutPage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CartSummary from '../components/cart/CartSummary';
import {
  ArrowLeftIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  TruckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cartItems,
    loading,
    getTotalItems,
    getTotalPrice,
    clearCart
  } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // تعبئة بيانات المستخدم تلقائياً
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.user_metadata?.name || user.name || user.email?.split('@')[0] || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  // حساب الإجماليات
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  // تكاليف الشحن
  const shippingCosts = {
    standard: totalPrice >= 500 ? 0 : 50,
    express: totalPrice >= 500 ? 50 : 100,
    sameDay: 150
  };

  const shippingCost = shippingCosts[shippingMethod] || 0;
  const isFreeShipping = shippingCost === 0;
  const taxAmount = totalPrice * 0.14;
  const finalTotal = totalPrice + shippingCost + taxAmount;

  // التحقق من صحة النموذج
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'الاسم الكامل مطلوب';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else if (!/^[0-9]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'رقم الهاتف غير صحيح (10-15 رقم)';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'العنوان مطلوب';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'المدينة مطلوبة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // معالجة تغيير الحقول
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // ✅ تحديث نقاط الولاء في Supabase
  const updateUserStats = async (userId, orderTotal) => {
    try {
      // جلب بيانات المستخدم الحالية
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // حساب نقاط الولاء
      const pointsEarned = Math.floor(orderTotal / 100) * 10;
      const newTotalPoints = (userData?.loyalty_points || 0) + pointsEarned;
      
      // تحديد مستوى الولاء
      let loyaltyLevel = 'برونزي';
      if (newTotalPoints >= 500) loyaltyLevel = 'ذهبي';
      else if (newTotalPoints >= 200) loyaltyLevel = 'فضي';
      
      // تحديث في Supabase
      const { error: updateError } = await supabase
        .from('users')
        .update({
          orders: (userData?.orders || 0) + 1,
          total_spent: (userData?.total_spent || 0) + orderTotal,
          loyalty_points: newTotalPoints,
          loyalty_level: loyaltyLevel
        })
        .eq('id', userId);
      
      if (updateError) throw updateError;
      
      // تحديث المستخدم في localStorage
      if (user && user.id === userId) {
        const updatedUser = {
          ...user,
          orders: (user.orders || 0) + 1,
          totalSpent: (user.totalSpent || 0) + orderTotal,
          loyaltyPoints: newTotalPoints,
          loyaltyLevel: loyaltyLevel
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating user stats:', error);
      return { success: false, error: error.message };
    }
  };

  // ✅ إنشاء الطلب في Supabase
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstError = document.querySelector('.error-input');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
      return;
    }

    if (cartItems.length === 0) {
      toast.warning('⚠️ عربة التسوق فارغة');
      return;
    }

    if (!user) {
      toast.error('❌ يجب تسجيل الدخول لإتمام الطلب');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderId = `ORD-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 1000)}`;
      
      const orderData = {
        id: orderId,
        customer: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        total: finalTotal,
        address: `${formData.address}، ${formData.city}`,
        user_id: user.id,
        notes: formData.notes || '',
        shipping_method: shippingMethod,
        payment_method: paymentMethod,
        items: cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      };

      // ✅ حفظ الطلب في Supabase
      const { error: orderError } = await supabase
        .from('orders')
        .insert([orderData]);
      
      if (orderError) throw orderError;

      // ✅ تحديث نقاط الولاء
      await updateUserStats(user.id, finalTotal);

      // ✅ تفريغ العربة محلياً
      await clearCart();

      toast.success('✅ تم إنشاء الطلب بنجاح!');
      setOrderNumber(orderId);
      setOrderSuccess(true);

    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('❌ حدث خطأ أثناء إنشاء الطلب. من فضلك حاول مرة أخرى');
    } finally {
      setIsSubmitting(false);
    }
  };

  // عرض صفحة النجاح
  if (orderSuccess) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 md:p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
              <CheckCircleIcon className="h-24 w-24 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            تم تأكيد طلبك بنجاح!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            شكراً لتسوقك معنا. سيتم معالجة طلبك قريباً.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            رقم الطلب: <span className="font-bold text-blue-600 dark:text-blue-400" dir="ltr">{orderNumber}</span>
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6 text-right">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              📧 تم إرسال تأكيد الطلب إلى بريدك الإلكتروني
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              📦 ستتلقى إشعاراً عند شحن طلبك
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/orders"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              تتبع طلباتي
            </Link>
            <Link
              to="/products"
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              متابعة التسوق
            </Link>
            <Link
              to="/"
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // عرض حالة التحميل
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" color="blue" text="جاري تحميل بيانات الدفع..." />
      </div>
    );
  }

  // إذا كانت العربة فارغة
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 md:p-12 text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg className="h-24 w-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            عربتك فارغة
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            أضف منتجات إلى عربتك أولاً ثم عد لإتمام الطلب.
          </p>
          <Link
            to="/products"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium inline-block"
          >
            استعراض المنتجات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* عنوان الصفحة */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إتمام الطلب</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {totalItems} منتج{totalItems !== 1 ? 'ات' : ''} في عربتك
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* نموذج الدفع */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* معلومات المستخدم */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  معلومات المستخدم
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      الاسم الكامل *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${
                        errors.fullName ? 'border-red-500 error-input' : 'border-gray-300 dark:border-gray-600'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white`}
                      placeholder="أحمد محمد"
                    />
                    {errors.fullName && (
                      <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      البريد الإلكتروني *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${
                        errors.email ? 'border-red-500 error-input' : 'border-gray-300 dark:border-gray-600'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white`}
                      placeholder="example@email.com"
                      dir="ltr"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* معلومات الشحن */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  عنوان الشحن
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      العنوان *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${
                        errors.address ? 'border-red-500 error-input' : 'border-gray-300 dark:border-gray-600'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white`}
                      placeholder="شارع 1، المنطقة"
                    />
                    {errors.address && (
                      <p className="text-xs text-red-500 mt-1">{errors.address}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        المدينة *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border ${
                          errors.city ? 'border-red-500 error-input' : 'border-gray-300 dark:border-gray-600'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white`}
                        placeholder="القاهرة"
                      />
                      {errors.city && (
                        <p className="text-xs text-red-500 mt-1">{errors.city}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        الرمز البريدي
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="12345"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      رقم الهاتف *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${
                        errors.phone ? 'border-red-500 error-input' : 'border-gray-300 dark:border-gray-600'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white`}
                      placeholder="0123456789"
                      dir="ltr"
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* طريقة الشحن */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <TruckIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  طريقة الشحن
                </h2>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="standard"
                      checked={shippingMethod === 'standard'}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      className="mt-1 h-4 w-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 dark:text-white">شحن عادي</span>
                        <span className={`font-bold ${isFreeShipping ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                          {isFreeShipping ? 'مجاني' : `${shippingCosts.standard} جنيه`}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">2-4 أيام عمل</p>
                      {isFreeShipping && (
                        <p className="text-xs text-green-600 dark:text-green-400">✓ شامل الشحن المجاني</p>
                      )}
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="express"
                      checked={shippingMethod === 'express'}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      className="mt-1 h-4 w-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 dark:text-white">شحن سريع</span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {shippingCosts.express} جنيه
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">1-2 يوم عمل</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="sameDay"
                      checked={shippingMethod === 'sameDay'}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      className="mt-1 h-4 w-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 dark:text-white">شحن نفس اليوم</span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {shippingCosts.sameDay} جنيه
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">خلال 12 ساعة (في المدن الكبرى)</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* طريقة الدفع */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CreditCardIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  طريقة الدفع
                </h2>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1 h-4 w-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900 dark:text-white">الدفع عند الاستلام</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">ادفع نقداً عند وصول الطلب</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1 h-4 w-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900 dark:text-white">بطاقة ائتمان / خصم</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">ادفع أونلاين باستخدام بطاقتك</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="wallet"
                      checked={paymentMethod === 'wallet'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1 h-4 w-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900 dark:text-white">محفظة رقمية</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">ادفع باستخدام محفظتك الرقمية</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* ملاحظات إضافية */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ملاحظات إضافية (اختياري)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="أي تعليمات خاصة للتوصيل..."
                />
              </div>

              {/* زر تأكيد الطلب (للجوال) */}
              <div className="lg:hidden">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    isSubmitting
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      جاري إنشاء الطلب...
                    </>
                  ) : (
                    <>
                      <ShieldCheckIcon className="h-5 w-5" />
                      تأكيد الطلب
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ملخص الطلب */}
          <div className="lg:w-96 flex-shrink-0">
            <div className="sticky top-4">
              <CartSummary
                items={cartItems}
                totalPrice={totalPrice}
                totalItems={totalItems}
                isCheckout={true}
              />
              
              {/* زر تأكيد الطلب (للديسكتوب) */}
              <div className="hidden lg:block mt-4">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    isSubmitting
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      جاري إنشاء الطلب...
                    </>
                  ) : (
                    <>
                      <ShieldCheckIcon className="h-5 w-5" />
                      تأكيد الطلب
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
