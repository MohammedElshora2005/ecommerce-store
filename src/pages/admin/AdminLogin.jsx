// ecommerce-store/src/pages/admin/AdminLogin.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  ShieldCheckIcon, 
  EnvelopeIcon, 
  LockClosedIcon,
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ قراءة بيانات الأدمن من .env (للعرض فقط)
  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin1@gmail.com';
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'Admin@123';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      toast.warning('⚠️ من فضلك أدخل البريد الإلكتروني وكلمة المرور');
      setError('من فضلك أدخل البريد الإلكتروني وكلمة المرور');
      setLoading(false);
      return;
    }

    try {
      const result = await login(email, password);
      
      if (result.success && result.user.role === 'admin') {
        toast.success('🔐 مرحباً بك في لوحة التحكم');
        navigate('/admin/dashboard');
      } else {
        toast.error(`❌ ${result.error || 'بيانات الدخول غير صحيحة أو ليس لديك صلاحية أدمن'}`);
        setError(result.error || 'بيانات الدخول غير صحيحة أو ليس لديك صلاحية أدمن');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      toast.error('❌ حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى');
      setError('حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          العودة للرئيسية
        </Link>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full shadow-lg shadow-blue-100/50">
                <ShieldCheckIcon className="h-14 w-14 text-blue-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
            <p className="text-gray-500 text-sm mt-1">تسجيل دخول الأدمن</p>
            <div className="mt-2 inline-block bg-blue-50 border border-blue-200 rounded-full px-3 py-0.5">
              <span className="text-xs text-blue-600">🔒 منطقة آمنة</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-3 py-2.5 border ${
                    error ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  placeholder={ADMIN_EMAIL}
                  required
                  dir="ltr"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-2.5 border ${
                    error ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 animate-fade-in">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <span>⚠️</span>
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-medium transition-all duration-200 text-white flex items-center justify-center gap-2 ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  جاري تسجيل الدخول...
                </>
              ) : (
                <>
                  <ShieldCheckIcon className="h-5 w-5" />
                  تسجيل الدخول
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-700 text-center">
                🔑 <span className="font-medium">بيانات الدخول التجريبية:</span>
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-1.5 text-xs text-blue-600">
                <span dir="ltr" className="font-mono bg-blue-100 px-2 py-0.5 rounded">{ADMIN_EMAIL}</span>
                <span className="hidden sm:inline text-blue-300">|</span>
                <span dir="ltr" className="font-mono bg-blue-100 px-2 py-0.5 rounded">{ADMIN_PASSWORD}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/login"
              className="text-xs text-gray-400 hover:text-blue-600 transition-colors"
            >
              تسجيل الدخول كمستخدم عادي
            </Link>
          </div>
        </div>

        <div className="mt-4 flex justify-center gap-4">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span className="text-green-500">✓</span>
            اتصال آمن
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span className="text-green-500">✓</span>
            تشفير كامل
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span className="text-green-500">✓</span>
            حماية متقدمة
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;