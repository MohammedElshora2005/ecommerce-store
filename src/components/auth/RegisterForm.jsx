// ecommerce-store/src/components/auth/RegisterForm.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // حالة التحقق من كلمة المرور
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  // التحقق من صحة الإيميل
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // التحقق من صحة كلمة المرور
  const validatePassword = (password) => {
    const validations = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    setPasswordValidation(validations);
    return Object.values(validations).every(val => val === true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) setError('');
    if (success) setSuccess('');

    if (name === 'password') {
      validatePassword(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // التحقق من الاسم
    if (!formData.name || formData.name.trim().length < 2) {
      toast.warning('⚠️ الاسم يجب أن يكون حرفين على الأقل');
      return;
    }

    // التحقق من الإيميل
    if (!formData.email) {
      toast.warning('⚠️ من فضلك أدخل البريد الإلكتروني');
      return;
    }

    if (!validateEmail(formData.email)) {
      toast.error('❌ البريد الإلكتروني غير صحيح');
      return;
    }

    // التحقق من كلمة المرور
    if (!formData.password) {
      toast.warning('⚠️ من فضلك أدخل كلمة المرور');
      return;
    }

    if (!validatePassword(formData.password)) {
      toast.warning('⚠️ كلمة المرور لا تستوفي المتطلبات');
      return;
    }

    // التحقق من تطابق كلمة المرور
    if (formData.password !== formData.confirmPassword) {
      toast.warning('⚠️ كلمة المرور غير متطابقة');
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(formData.email, formData.password, formData.name);
      
      if (result.success) {
        toast.success(`🎉 مرحباً ${formData.name}! تم إنشاء حسابك بنجاح`);
        setSuccess('تم إنشاء الحساب بنجاح! جاري تحويلك...');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        toast.error(`❌ ${result.error || 'فشل إنشاء الحساب'}`);
        setError(result.error);
      }
    } catch (err) {
      console.error('Register error:', err);
      toast.error('❌ حدث خطأ أثناء إنشاء الحساب. حاول مرة أخرى');
      setError('حدث خطأ أثناء إنشاء الحساب');
    } finally {
      setIsLoading(false);
    }
  };

  // تسجيل الدخول بجوجل (محاكاة)
  const handleGoogleRegister = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await loginWithGoogle();
      if (result.success) {
        toast.success('✅ تم التسجيل بحساب جوجل بنجاح!');
        navigate('/');
      } else {
        toast.error('❌ فشل التسجيل بجوجل');
      }
    } catch (err) {
      toast.error('❌ حدث خطأ أثناء التسجيل بجوجل');
      setError('حدث خطأ أثناء التسجيل بجوجل');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      {/* رأس الصفحة */}
      <div className="text-center mb-8">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <UserIcon className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">إنشاء حساب جديد</h2>
        <p className="text-gray-600 text-sm mt-1">
          انضم إلينا واستمتع بتجربة تسوق مميزة
        </p>
      </div>

      {/* نموذج التسجيل */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* حقل الاسم */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            الاسم الكامل
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="أحمد محمد"
              disabled={isLoading}
            />
          </div>
        </div>

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
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
              className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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

          {/* متطلبات كلمة المرور */}
          {formData.password && (
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex items-center space-x-2 space-x-reverse">
                {passwordValidation.minLength ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircleIcon className="h-4 w-4 text-gray-300" />
                )}
                <span className={passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'}>
                  8 أحرف على الأقل
                </span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                {passwordValidation.hasUpperCase ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircleIcon className="h-4 w-4 text-gray-300" />
                )}
                <span className={passwordValidation.hasUpperCase ? 'text-green-600' : 'text-gray-500'}>
                  حرف كبير (A-Z)
                </span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                {passwordValidation.hasLowerCase ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircleIcon className="h-4 w-4 text-gray-300" />
                )}
                <span className={passwordValidation.hasLowerCase ? 'text-green-600' : 'text-gray-500'}>
                  حرف صغير (a-z)
                </span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                {passwordValidation.hasNumber ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircleIcon className="h-4 w-4 text-gray-300" />
                )}
                <span className={passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'}>
                  رقم (0-9)
                </span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                {passwordValidation.hasSpecialChar ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircleIcon className="h-4 w-4 text-gray-300" />
                )}
                <span className={passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}>
                  رمز خاص (!@#$%^&*)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* حقل تأكيد كلمة المرور */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            تأكيد كلمة المرور
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockClosedIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`block w-full pl-10 pr-12 py-2 border ${
                formData.confirmPassword && formData.password !== formData.confirmPassword
                  ? 'border-red-500'
                  : formData.confirmPassword && formData.password === formData.confirmPassword
                  ? 'border-green-500'
                  : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
              placeholder="••••••••"
              disabled={isLoading}
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {formData.confirmPassword && formData.password !== formData.confirmPassword && (
            <p className="mt-1 text-xs text-red-500">كلمة المرور غير متطابقة</p>
          )}
          {formData.confirmPassword && formData.password === formData.confirmPassword && (
            <p className="mt-1 text-xs text-green-500">✓ كلمة المرور متطابقة</p>
          )}
        </div>

        {/* عرض الأخطاء */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* عرض رسالة النجاح */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        {/* زر إنشاء الحساب */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 bg-green-600 text-white rounded-lg font-medium transition-all duration-200 ${
            isLoading
              ? 'opacity-70 cursor-not-allowed'
              : 'hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>جاري إنشاء الحساب...</span>
            </div>
          ) : (
            'إنشاء حساب جديد'
          )}
        </button>

        {/* فصل بين التسجيل العادي وجوجل */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">أو</span>
          </div>
        </div>

        {/* زر التسجيل بجوجل */}
        <button
          type="button"
          onClick={handleGoogleRegister}
          disabled={isLoading}
          className="w-full py-3 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-2 space-x-reverse"
        >
          <FcGoogle className="h-5 w-5" />
          <span>التسجيل بحساب جوجل</span>
        </button>

        {/* رابط تسجيل الدخول */}
        <div className="text-center mt-4">
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

export default RegisterForm;