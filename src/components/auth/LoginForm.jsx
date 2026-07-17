// ecommerce-store/src/components/auth/LoginForm.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  UserIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // التحقق من صحة الإيميل
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // التحقق من صحة كلمة المرور
  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email) {
      toast.warning('⚠️ من فضلك أدخل البريد الإلكتروني');
      return;
    }

    if (!validateEmail(formData.email)) {
      toast.error('❌ البريد الإلكتروني غير صحيح');
      return;
    }

    if (!formData.password) {
      toast.warning('⚠️ من فضلك أدخل كلمة المرور');
      return;
    }

    if (!validatePassword(formData.password)) {
      toast.warning('⚠️ كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        toast.success(`✅ مرحباً بك ${result.user.user_metadata?.name || 'مستخدم'}!`);
        
        if (result.user.role === 'admin') {
          setTimeout(() => navigate('/admin/dashboard'), 500);
        } else {
          setTimeout(() => navigate('/'), 500);
        }
      } else {
        toast.error(`❌ ${result.error || 'فشل تسجيل الدخول'}`);
        setError(result.error);
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('❌ حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى');
      setError('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      {/* رأس الصفحة */}
      <div className="text-center mb-8">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
          <UserIcon className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">مرحباً بك</h2>
        <p className="text-gray-600 text-sm mt-1">
          سجل الدخول لمتابعة التسوق
        </p>
      </div>

      {/* نموذج تسجيل الدخول */}
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
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-2 border ${
                error && !formData.email ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
              placeholder="example@email.com"
              disabled={isLoading}
              dir="ltr"
            />
          </div>
        </div>

        {/* حقل كلمة المرور */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            كلمة المرور
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockClosedIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`block w-full pl-10 pr-12 py-2 border ${
                error && !formData.password ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
              placeholder="••••••••"
              disabled={isLoading}
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* خيارات إضافية */}
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 space-x-reverse">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">تذكرني</span>
          </label>
          
          <Link
            to="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            نسيت كلمة المرور؟
          </Link>
        </div>

        {/* عرض الخطأ */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* زر تسجيل الدخول */}
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
              <span>جاري تسجيل الدخول...</span>
            </div>
          ) : (
            'تسجيل الدخول'
          )}
        </button>

        {/* رابط إنشاء حساب جديد */}
        <div className="text-center mt-4">
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
      </form>

      {/* معلومات إضافية */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex justify-center space-x-4 text-xs text-gray-500">
          <span>🔒 اتصال آمن</span>
          <span>•</span>
          <span>📧 تأكد من صحة البريد</span>
          <span>•</span>
          <span>🔑 كلمة مرور قوية</span>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
