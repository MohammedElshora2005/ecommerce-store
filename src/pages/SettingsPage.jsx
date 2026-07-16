// ecommerce-store/src/pages/SettingsPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  LockClosedIcon,
  BellIcon,
  MoonIcon,
  CheckCircleIcon,
  ArrowRightOnRectangleIcon,
  SunIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const SettingsPage = () => {
  const { user, logout, updatePassword } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    // قراءة الوضع المظلم من localStorage
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [notifications, setNotifications] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  // تطبيق الوضع المظلم على الصفحة
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.warning('⚠️ كلمة المرور غير متطابقة');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.warning('⚠️ كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);
    try {
      const result = await updatePassword(passwordData.newPassword);
      if (result.success) {
        toast.success('✅ تم تحديث كلمة المرور بنجاح');
        setShowPasswordForm(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(`❌ ${result.error || 'فشل تحديث كلمة المرور'}`);
      }
    } catch (error) {
      toast.error('❌ حدث خطأ أثناء تحديث كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.info('👋 تم تسجيل الخروج بنجاح');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* عنوان الصفحة */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ArrowLeftIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">⚙️ الإعدادات</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* تغيير كلمة المرور */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <LockClosedIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                <span className="font-medium text-gray-900 dark:text-white">تغيير كلمة المرور</span>
              </div>
              <span className="text-sm text-blue-600 dark:text-blue-400">{showPasswordForm ? 'إلغاء' : 'تغيير'}</span>
            </button>

            {showPasswordForm && (
              <div className="px-6 pb-4">
                <form onSubmit={handlePasswordChange} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">كلمة المرور الحالية</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">كلمة المرور الجديدة</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      minLength="6"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تأكيد كلمة المرور</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    {loading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* الإشعارات */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center gap-3">
                <BellIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                <span className="font-medium text-gray-900 dark:text-white">الإشعارات</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={() => setNotifications(!notifications)}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 rounded-full peer ${notifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
              </label>
            </div>
          </div>

          {/* ✅ الوضع المظلم */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <MoonIcon className="h-6 w-6 text-blue-500" />
                ) : (
                  <SunIcon className="h-6 w-6 text-yellow-500" />
                )}
                <span className="font-medium text-gray-900 dark:text-white">
                  {darkMode ? 'الوضع المظلم' : 'الوضع الفاتح'}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 rounded-full peer ${darkMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
              </label>
            </div>
          </div>

          {/* تسجيل الخروج */}
          <div>
            <button
              onClick={handleLogout}
              className="w-full px-6 py-4 flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
            >
              <ArrowRightOnRectangleIcon className="h-6 w-6" />
              <span className="font-medium">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;