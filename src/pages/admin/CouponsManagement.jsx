// ecommerce-store/src/pages/admin/CouponsManagement.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import {
  TicketIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  UsersIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const CouponsManagement = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrder: '',
    maxUses: '',
    usedCount: 0,
    startDate: '',
    endDate: '',
    active: true,
    applicableUsers: []
  });

  // ✅ جلب الأكواد من Supabase
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('❌ حدث خطأ أثناء تحميل الأكواد');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchCoupons();
  }, [isAdmin, navigate]);

  // ✅ إضافة كود خصم
  const handleAddCoupon = async () => {
    if (!formData.code || !formData.discountValue || !formData.startDate || !formData.endDate) {
      toast.warning('⚠️ من فضلك املأ جميع الحقول المطلوبة');
      return;
    }

    // التحقق من عدم وجود الكود مكرر
    const { data: existing } = await supabase
      .from('coupons')
      .select('code')
      .eq('code', formData.code.toUpperCase())
      .single();

    if (existing) {
      toast.warning('⚠️ هذا الكود موجود بالفعل');
      return;
    }

    const newCoupon = {
      id: `CPN-${Date.now().toString().slice(-6)}`,
      code: formData.code.toUpperCase(),
      description: formData.description || '',
      discount_type: formData.discountType,
      discount_value: parseFloat(formData.discountValue),
      min_order: parseFloat(formData.minOrder) || 0,
      max_uses: parseInt(formData.maxUses) || 0,
      used_count: 0,
      start_date: formData.startDate,
      end_date: formData.endDate,
      active: true
    };

    try {
      const { error } = await supabase
        .from('coupons')
        .insert([newCoupon]);
      
      if (error) throw error;
      
      toast.success('✅ تم إضافة كود الخصم بنجاح');
      setShowAddModal(false);
      resetForm();
      fetchCoupons();
    } catch (error) {
      console.error('Error adding coupon:', error);
      toast.error('❌ حدث خطأ أثناء إضافة الكود');
    }
  };

  // ✅ تعديل كود خصم
  const handleEditCoupon = async () => {
    if (!formData.code || !formData.discountValue || !formData.startDate || !formData.endDate) {
      toast.warning('⚠️ من فضلك املأ جميع الحقول المطلوبة');
      return;
    }

    const updatedCoupon = {
      code: formData.code.toUpperCase(),
      description: formData.description || '',
      discount_type: formData.discountType,
      discount_value: parseFloat(formData.discountValue),
      min_order: parseFloat(formData.minOrder) || 0,
      max_uses: parseInt(formData.maxUses) || 0,
      start_date: formData.startDate,
      end_date: formData.endDate,
      active: formData.active
    };

    try {
      const { error } = await supabase
        .from('coupons')
        .update(updatedCoupon)
        .eq('id', editingCoupon.id);
      
      if (error) throw error;
      
      toast.success('✅ تم تحديث كود الخصم بنجاح');
      setEditingCoupon(null);
      resetForm();
      fetchCoupons();
    } catch (error) {
      console.error('Error updating coupon:', error);
      toast.error('❌ حدث خطأ أثناء تحديث الكود');
    }
  };

  // ✅ حذف كود خصم
  const handleDeleteCoupon = async () => {
    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', showDeleteConfirm);
      
      if (error) throw error;
      
      toast.success('✅ تم حذف كود الخصم بنجاح');
      setShowDeleteConfirm(null);
      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('❌ حدث خطأ أثناء حذف الكود');
    }
  };

  // ✅ تغيير حالة الكود
  const toggleCouponStatus = async (couponId) => {
    const coupon = coupons.find(c => c.id === couponId);
    if (!coupon) return;

    try {
      const { error } = await supabase
        .from('coupons')
        .update({ active: !coupon.active })
        .eq('id', couponId);
      
      if (error) throw error;
      
      toast.success(!coupon.active ? '✅ تم تفعيل الكود' : '⏸️ تم إيقاف الكود');
      fetchCoupons();
    } catch (error) {
      console.error('Error toggling coupon status:', error);
      toast.error('❌ حدث خطأ أثناء تغيير حالة الكود');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minOrder: '',
      maxUses: '',
      usedCount: 0,
      startDate: '',
      endDate: '',
      active: true,
      applicableUsers: []
    });
  };

  const openEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discount_type || 'percentage',
      discountValue: coupon.discount_value || '',
      minOrder: coupon.min_order || '',
      maxUses: coupon.max_uses || '',
      usedCount: coupon.used_count || 0,
      startDate: coupon.start_date,
      endDate: coupon.end_date,
      active: coupon.active,
      applicableUsers: coupon.applicable_users || []
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch { return dateStr; }
  };

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coupon.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: coupons.length,
    active: coupons.filter(c => c.active).length,
    inactive: coupons.filter(c => !c.active).length,
    totalUses: coupons.reduce((sum, c) => sum + (c.used_count || 0), 0)
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">🎫 أكواد الخصم</h1>
            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-2 py-0.5 rounded-full">
              {coupons.length} كود
            </span>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors text-sm"
          >
            <PlusIcon className="h-4 w-4" />
            إضافة كود
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">إجمالي الأكواد</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">نشط</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.inactive}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">غير نشط</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalUses}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">إجمالي الاستخدامات</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث عن كود خصم..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-green-600 dark:border-green-400 border-t-transparent"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-2">جاري تحميل الأكواد...</p>
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="text-center py-12">
              <TicketIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">لا توجد أكواد خصم</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">الكود</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">الخصم</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">الاستخدامات</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">المدة</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">الحالة</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredCoupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white" dir="ltr">{coupon.code}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{coupon.description}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-bold ${coupon.discount_type === 'percentage' ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                          {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : formatPrice(coupon.discount_value)}
                        </span>
                        {coupon.min_order > 0 && (
                          <div className="text-xs text-gray-400 dark:text-gray-500">الحد الأدنى: {formatPrice(coupon.min_order)}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        <div>{coupon.used_count || 0}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">من {coupon.max_uses || '∞'}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        <div>{formatDate(coupon.start_date)}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">→ {formatDate(coupon.end_date)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleCouponStatus(coupon.id)}
                          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                            coupon.active
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}
                        >
                          {coupon.active ? <CheckCircleIcon className="h-3 w-3" /> : <XCircleIcon className="h-3 w-3" />}
                          {coupon.active ? 'نشط' : 'غير نشط'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(coupon)}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(coupon.id)}
                            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* مودال إضافة/تعديل */}
      {(showAddModal || editingCoupon) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white dark:bg-gray-800 py-2 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingCoupon ? 'تعديل كود الخصم' : 'إضافة كود خصم جديد'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingCoupon(null);
                  resetForm();
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">كود الخصم *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="مثال: SAVE20"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الوصف</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="وصف كود الخصم"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نوع الخصم *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="percentage">نسبة مئوية</option>
                    <option value="fixed">خصم ثابت</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">قيمة الخصم *</label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder={formData.discountType === 'percentage' ? '20' : '50'}
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الحد الأدنى</label>
                  <input
                    type="number"
                    value={formData.minOrder}
                    onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الحد الأقصى للاستخدام</label>
                  <input
                    type="number"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="50"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تاريخ البداية *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تاريخ النهاية *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <button
                onClick={editingCoupon ? handleEditCoupon : handleAddCoupon}
                className="w-full py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors font-medium"
              >
                {editingCoupon ? 'تحديث الكود' : 'إضافة الكود'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال تأكيد الحذف */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <TrashIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">تأكيد الحذف</h3>
              <p className="text-gray-600 dark:text-gray-400">هل أنت متأكد من حذف هذا الكود؟</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteCoupon}
                className="flex-1 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponsManagement;
