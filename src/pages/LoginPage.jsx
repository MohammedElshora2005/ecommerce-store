// ecommerce-store/src/pages/LoginPage.jsx

import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/auth/LoginForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  ShoppingBagIcon, 
  ShieldCheckIcon,
  UserGroupIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  // الحصول على مسار العودة (إذا كان المستخدم حاول الدخول لصفحة محمية)
  const from = location.state?.from?.pathname || '/';

  // إذا كان المستخدم مسجلاً، إعادة توجيهه
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, from]);

  // عرض Spinner أثناء التحقق
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" color="blue" text="جاري التحقق من حالة الحساب..." />
      </div>
    );
  }

  // إذا كان المستخدم مسجلاً، لا نعرض الصفحة (سيتم التوجيه تلقائياً)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* شعار المتجر */}
        <div className="flex justify-center">
          <div className="bg-blue-600 rounded-full p-3 shadow-lg">
            <ShoppingBagIcon className="h-12 w-12 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          مرحباً بك
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          سجل الدخول لمتابعة التسوق واستمتع بتجربة مميزة
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-xl sm:px-10 border border-gray-100">
          <LoginForm />
          
          {/* روابط إضافية */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ليس لديك حساب؟{' '}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                إنشاء حساب جديد
              </Link>
            </p>
          </div>
        </div>

        {/* ميزات إضافية */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex justify-center mb-1">
              <ShieldCheckIcon className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-xs text-gray-500">دفع آمن</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-1">
              <UserGroupIcon className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-xs text-gray-500">دعم 24/7</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-1">
              <StarIcon className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-xs text-gray-500">جودة عالية</p>
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

export default LoginPage;