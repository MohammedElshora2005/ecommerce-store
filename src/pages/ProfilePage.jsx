// ecommerce-store/src/pages/ProfilePage.jsx

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  PencilIcon,
  ArrowLeftIcon,
  PhotoIcon,
  XMarkIcon,
  StarIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { user, updateProfile, allUsers, fetchAllUsers } = useAuth();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || ''
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userData, setUserData] = useState(null);

  // ✅ جلب بيانات المستخدم من allUsers
  useEffect(() => {
    if (allUsers && allUsers.length > 0 && user) {
      // ✅ لو أدمن (local)، استخدم user نفسه
      if (user.id?.startsWith('admin-')) {
        setUserData({
          ...user,
          loyaltyPoints: user?.loyaltyPoints || 0,
          loyaltyLevel: user?.loyaltyLevel || 'برونزي',
          totalSpent: user?.totalSpent || 0,
          orders: user?.orders || 0
        });
        return;
      }
      
      const foundUser = allUsers.find(u => u.id === user.id);
      if (foundUser) {
        setUserData(foundUser);
      } else {
        // ✅ لو مش موجود في allUsers، استخدم user كـ fallback
        setUserData({
          ...user,
          loyaltyPoints: user?.loyaltyPoints || 0,
          loyaltyLevel: user?.loyaltyLevel || 'برونزي',
          totalSpent: user?.totalSpent || 0,
          orders: user?.orders || 0
        });
      }
    } else if (user) {
      // ✅ لو allUsers لسه محملتش، استخدم user كـ fallback
      setUserData({
        ...user,
        loyaltyPoints: user?.loyaltyPoints || 0,
        loyaltyLevel: user?.loyaltyLevel || 'برونزي',
        totalSpent: user?.totalSpent || 0,
        orders: user?.orders || 0
      });
    }
  }, [allUsers, user]);

  // ✅ جلب allUsers عند تحميل الصفحة
  useEffect(() => {
    if (user) {
      fetchAllUsers();
    }
  }, [user]);

  // ✅ استخدام userData إذا موجود، وإلا استخدم user
  const loyaltyPoints = userData?.loyaltyPoints ?? user?.loyaltyPoints ?? 0;
  const loyaltyLevel = userData?.loyaltyLevel ?? user?.loyaltyLevel ?? 'برونزي';
  const totalSpent = userData?.totalSpent ?? user?.totalSpent ?? 0;
  const ordersCount = userData?.orders ?? user?.orders ?? 0;

  // ✅ الحصول على مستوى الولاء
  const getLoyaltyLevelInfo = (level) => {
    const levels = {
      'ذهبي': { color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: '⭐', discount: '10%' },
      'فضي': { color: 'text-gray-400', bg: 'bg-gray-50', border: 'border-gray-200', icon: '✦', discount: '5%' },
      'برونزي': { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: '●', discount: '2%' }
    };
    return levels[level] || levels['برونزي'];
  };

  const levelInfo = getLoyaltyLevelInfo(loyaltyLevel);

  // ✅ حساب النقاط القادمة
  const pointsToNextLevel = loyaltyLevel === 'برونزي' ? 200 - loyaltyPoints : loyaltyLevel === 'فضي' ? 500 - loyaltyPoints : 0;
  const nextLevel = loyaltyLevel === 'برونزي' ? 'فضي' : loyaltyLevel === 'فضي' ? 'ذهبي' : null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.warning('⚠️ حجم الصورة يجب أن يكون أقل من 2 ميجابايت');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.warning('⚠️ من فضلك اختر صورة فقط');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, avatar: reader.result }));
      setUploading(false);
      toast.success('✅ تم تحميل الصورة بنجاح');
    };
    reader.onerror = () => {
      setUploading(false);
      toast.error('❌ حدث خطأ أثناء تحميل الصورة');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ تجهيز البيانات للتحديث
      const updateData = {
        name: formData.name || user?.user_metadata?.name || '',
        phone: formData.phone || '',
        avatar: formData.avatar || user?.avatar || ''
      };
      
      const result = await updateProfile(updateData);

      if (result.success) {
        toast.success('✅ تم تحديث الملف الشخصي بنجاح');
        setIsEditing(false);
        // ✅ تحديث allUsers تاني عشان يجيب البيانات الجديدة
        await fetchAllUsers();
        // ✅ تحديث userData محلياً
        setUserData(prev => ({
          ...prev,
          ...updateData
        }));
        setTimeout(() => window.location.reload(), 500);
      } else {
        toast.error(`❌ ${result.error || 'فشل تحديث الملف'}`);
      }
    } catch (error) {
      toast.error('❌ حدث خطأ أثناء تحديث الملف');
    } finally {
      setLoading(false);
    }
  };

  // تنسيق السعر
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ArrowLeftIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">👤 حسابي</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* ✅ بطاقة الولاء */}
          <div className={`p-6 border-b ${levelInfo.bg} ${levelInfo.border}`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`text-4xl ${levelInfo.color}`}>{levelInfo.icon}</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    مستوى {loyaltyLevel}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {loyaltyPoints} نقطة ولاء
                  </p>
                </div>
              </div>
              <div className="text-left">
                <div className={`text-lg font-bold ${levelInfo.color}`}>
                  خصم {levelInfo.discount}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  على جميع المشتريات
                </p>
              </div>
            </div>

            {/* ✅ شريط التقدم */}
            {nextLevel && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>نقاطك: {loyaltyPoints}</span>
                  <span>المطلوب للوصول لـ {nextLevel}: {pointsToNextLevel} نقطة</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      loyaltyLevel === 'برونزي' ? 'bg-amber-500' :
                      loyaltyLevel === 'فضي' ? 'bg-gray-400' :
                      'bg-yellow-500'
                    }`}
                    style={{ width: `${Math.min((loyaltyPoints / (loyaltyLevel === 'برونزي' ? 200 : 500)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ✅ إحصائيات سريعة */}
          <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 dark:bg-gray-700/50">
            <div className="text-center">
              <div className="flex justify-center mb-1">
                <ShoppingBagIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{ordersCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">الطلبات</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-1">
                <CurrencyDollarIcon className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatPrice(totalSpent)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">إجمالي المشتريات</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-1">
                <StarIcon className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{loyaltyPoints}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">نقاط الولاء</p>
            </div>
          </div>

          {/* صورة الملف الشخصي */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-center">
            <img
              src={formData.avatar || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.name || 'User')}&background=2563eb&color=fff&size=128`}
              alt={user?.user_metadata?.name}
              className="w-24 h-24 rounded-full border-4 border-white mx-auto shadow-lg object-cover"
            />
            <h2 className="text-xl font-bold text-white mt-3">{user?.user_metadata?.name}</h2>
            <p className="text-white/80 text-sm" dir="ltr">{user?.email}</p>
          </div>

          {/* معلومات المستخدم */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">المعلومات الشخصية</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              >
                <PencilIcon className="h-4 w-4" />
                {isEditing ? 'إلغاء' : 'تعديل'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    الصورة الشخصية
                  </label>
                  <div className="flex items-center gap-4">
                    <img
                      src={formData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'User')}&background=2563eb&color=fff&size=128`}
                      alt="الصورة الشخصية"
                      className="w-20 h-20 rounded-full border-2 border-gray-300 dark:border-gray-600 object-cover"
                    />
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm flex items-center gap-2"
                      >
                        <PhotoIcon className="h-4 w-4" />
                        {uploading ? 'جاري التحميل...' : 'اختر صورة'}
                      </button>
                      {formData.avatar && (
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, avatar: '' }))}
                          className="block mt-1 text-xs text-red-600 dark:text-red-400 hover:text-red-800 flex items-center gap-1"
                        >
                          <XMarkIcon className="h-3 w-3" />
                          إزالة الصورة
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">صيغ مدعومة: JPG, PNG, GIF (حد أقصى 2 ميجابايت)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الاسم</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رقم الهاتف</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="01234567890"
                    dir="ltr"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <UserCircleIcon className="h-6 w-6 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">الاسم</p>
                    <p className="font-medium text-gray-900 dark:text-white">{user?.user_metadata?.name || 'غير محدد'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <EnvelopeIcon className="h-6 w-6 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">البريد الإلكتروني</p>
                    <p className="font-medium text-gray-900 dark:text-white" dir="ltr">{user?.email || 'غير محدد'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <PhoneIcon className="h-6 w-6 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">رقم الهاتف</p>
                    <p className="font-medium text-gray-900 dark:text-white" dir="ltr">{user?.phone || 'غير محدد'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
