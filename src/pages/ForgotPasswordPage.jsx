// ecommerce-store/src/pages/ForgotPasswordPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';
import { ArrowLeftIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const ForgotPasswordPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* شعار أو أيقونة */}
        <div className="flex justify-center">
          <div className="bg-blue-600 rounded-full p-3 shadow-lg">
            <svg
              className="h-12 w-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          استعادة كلمة المرور
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-xl sm:px-10 border border-gray-100">
          <ForgotPasswordForm />
          
          {/* روابط إضافية */}
          <div className="mt-6 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm">
              <Link
                to="/login"
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                العودة لتسجيل الدخول
              </Link>
              <span className="hidden sm:inline text-gray-300">|</span>
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                إنشاء حساب جديد
              </Link>
            </div>
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="mt-6 text-center">
          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <span className="text-green-500">✓</span>
              <span>اتصال آمن</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-green-500">✓</span>
              <span>تشفير كامل</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-green-500">✓</span>
              <span>دعم 24/7</span>
            </div>
          </div>
        </div>

        {/* ✅ شعارات الأمان - استبدال الصور بأيقونات */}
        <div className="mt-4 flex justify-center gap-6">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <ShieldCheckIcon className="h-4 w-4 text-green-500" />
            <span>اتصال آمن</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <ShieldCheckIcon className="h-4 w-4 text-blue-500" />
            <span>دفع مشفر</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <ShieldCheckIcon className="h-4 w-4 text-purple-500" />
            <span>ضمان الجودة</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;