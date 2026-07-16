// ecommerce-store/src/pages/RegisterPage.jsx

import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import RegisterForm from '../components/auth/RegisterForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  ShoppingBagIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  StarIcon,
  GiftIcon,
  CheckCircleIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  // إذا كان المستخدم مسجلاً، إعادة توجيهه
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

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

  // ميزات العضوية
  const membershipBenefits = [
    { icon: GiftIcon, text: 'خصم 10% على أول طلب' },
    { icon: TruckIcon, text: 'شحن مجاني للطلبات فوق 500 جنيه' },
    { icon: ShieldCheckIcon, text: 'ضمان استعادة الأموال' },
    { icon: StarIcon, text: 'نقاط ولاء مع كل عملية شراء' },
    { icon: UserGroupIcon, text: 'دعم فني مخصص 24/7' },
    { icon: CheckCircleIcon, text: 'إشعارات بالعروض الحصرية' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* شعار المتجر */}
        <div className="flex justify-center">
          <div className="bg-green-600 rounded-full p-3 shadow-lg">
            <ShoppingBagIcon className="h-12 w-12 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          إنشاء حساب جديد
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          انضم إلينا واستمتع بتجربة تسوق مميزة
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-xl sm:px-10 border border-gray-100">
          <RegisterForm />
          
          {/* روابط إضافية */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              لديك حساب بالفعل؟{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>

        {/* مميزات العضوية */}
        <div className="mt-6 bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-900 text-center mb-3">
            مميزات العضوية
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {membershipBenefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                <benefit.icon className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="leading-tight">{benefit.text}</span>
              </div>
            ))}
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

export default RegisterPage;