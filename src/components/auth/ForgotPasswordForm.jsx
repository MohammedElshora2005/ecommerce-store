// ecommerce-store/src/components/auth/ForgotPasswordForm.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // التحقق من صحة الإيميل
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // التحقق من الإيميل
    if (!email) {
      setError('من فضلك أدخل البريد الإلكتروني');
      return;
    }

    if (!validateEmail(email)) {
      setError('من فضلك أدخل بريد إلكتروني صحيح');
      return;
    }

    setIsLoading(true);

    try {
      // محاكاة إرسال طلب إعادة تعيين كلمة المرور
      // هنا هنضيف الكود بتاع Supabase بعدين
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // محاكاة نجاح العملية
      setSuccessMessage('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
      setIsSubmitted(true);
      setEmail('');
      
    } catch (err) {
      setError('حدث خطأ أثناء إرسال الطلب. من فضلك حاول مرة أخرى');
    } finally {
      setIsLoading(false);
    }
  };

  // إذا تم الإرسال بنجاح، عرض رسالة تأكيد
  if (isSubmitted) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          {/* أيقونة النجاح */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">تم الإرسال بنجاح!</h3>
          <p className="text-sm text-gray-600 mb-6">
            {successMessage}
          </p>
          
          <div className="space-y-3">
            <Link
              to="/login"
              className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              العودة إلى تسجيل الدخول
            </Link>
            
            <button
              onClick={() => {
                setIsSubmitted(false);
                setSuccessMessage('');
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              إعادة إرسال الرابط
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      {/* رأس الصفحة */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">نسيت كلمة المرور؟</h2>
        <p className="text-gray-600 text-sm mt-2">
          أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة المرور
        </p>
      </div>

      {/* نموذج إعادة التعيين */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* حقل الإيميل */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            البريد الإلكتروني
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`block w-full pl-10 pr-3 py-2 border ${
                error ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
              placeholder="example@email.com"
              disabled={isLoading}
              dir="ltr"
            />
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* رسائل التحذير المساعدة */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            💡 <span className="font-medium">ملاحظة:</span> ستتلقى رابط إعادة تعيين صالح لمدة 24 ساعة
          </p>
        </div>

        {/* زر الإرسال */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 ${
            isLoading
              ? 'opacity-70 cursor-not-allowed'
              : 'hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>جاري الإرسال...</span>
            </div>
          ) : (
            'إرسال رابط إعادة التعيين'
          )}
        </button>

        {/* روابط المساعدة */}
        <div className="flex items-center justify-between text-sm mt-4">
          <Link
            to="/login"
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            العودة لتسجيل الدخول
          </Link>
          
          <Link
            to="/register"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            إنشاء حساب جديد
          </Link>
        </div>
      </form>

      {/* معلومات إضافية */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex justify-center space-x-4 text-xs text-gray-500">
          <span>🔒 اتصال آمن</span>
          <span>•</span>
          <span>📧 تأكد من صحة البريد</span>
          <span>•</span>
          <span>⏱️ الرابط صالح 24 ساعة</span>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;