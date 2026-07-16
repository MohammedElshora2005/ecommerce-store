// ecommerce-store/src/pages/admin/OffersManagement.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import {
  TagIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhotoIcon,
  PlusCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const OffersManagement = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  
  // ✅ قوائم التصنيفات والماركات
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [showNewBrandInput, setShowNewBrandInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newBrand, setNewBrand] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    discountType: 'percentage',
    discountValue: '',
    originalPrice: '',
    offerPrice: '',
    minOrder: '',
    stock: '',
    startDate: '',
    endDate: '',
    active: true,
    category: '',
    brand: '',
    rating: 0
  });

  // ✅ جلب العروض من Supabase
  const fetchOffers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOffers(data || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast.error('❌ حدث خطأ أثناء تحميل العروض');
    } finally {
      setLoading(false);
    }
  };

  // تحميل البيانات
  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    fetchOffers();
    loadCategoriesAndBrands();
  }, [isAdmin, navigate]);

  // ✅ تحميل التصنيفات والماركات من Supabase
  const loadCategoriesAndBrands = async () => {
    try {
      // جلب التصنيفات من المنتجات
      const { data: productsData } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null);
      
      const uniqueCategories = [...new Set(productsData?.map(p => p.category).filter(Boolean) || [])];
      setCategories(uniqueCategories.length > 0 ? uniqueCategories : ['إلكترونيات', 'ساعات ذكية', 'هواتف', 'ملابس وأحذية', 'إكسسوارات', 'أجهزة منزلية']);
      
      // جلب الماركات من المنتجات
      const { data: brandsData } = await supabase
        .from('products')
        .select('brand')
        .not('brand', 'is', null);
      
      const uniqueBrands = [...new Set(brandsData?.map(p => p.brand).filter(Boolean) || [])];
      setBrands(uniqueBrands.length > 0 ? uniqueBrands : ['Apple', 'Samsung', 'Sony', 'Xiaomi', 'Nike', 'Adidas', 'LG', 'Canon', 'Garmin', 'JBL', 'Logitech', 'Oculus', 'Anker', 'Fossil']);
    } catch (error) {
      console.error('Error loading categories/brands:', error);
    }
  };

  // ✅ إضافة تصنيف جديد
  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast.warning('⚠️ من فضلك أدخل اسم التصنيف');
      return;
    }
    if (categories.includes(newCategory.trim())) {
      toast.warning('⚠️ هذا التصنيف موجود بالفعل');
      return;
    }
    const updatedCategories = [...categories, newCategory.trim()];
    setCategories(updatedCategories);
    setFormData({ ...formData, category: newCategory.trim() });
    setNewCategory('');
    setShowNewCategoryInput(false);
    toast.success('✅ تم إضافة التصنيف الجديد');
  };

  // ✅ إضافة ماركة جديدة
  const handleAddBrand = () => {
    if (!newBrand.trim()) {
      toast.warning('⚠️ من فضلك أدخل اسم الماركة');
      return;
    }
    if (brands.includes(newBrand.trim())) {
      toast.warning('⚠️ هذه الماركة موجودة بالفعل');
      return;
    }
    const updatedBrands = [...brands, newBrand.trim()];
    setBrands(updatedBrands);
    setFormData({ ...formData, brand: newBrand.trim() });
    setNewBrand('');
    setShowNewBrandInput(false);
    toast.success('✅ تم إضافة الماركة الجديدة');
  };

  // ✅ حساب نسبة الخصم تلقائياً
  const calculateDiscountPercentage = (original, offer) => {
    if (!original || original <= 0 || !offer || offer <= 0) return 0;
    const discount = ((original - offer) / original) * 100;
    return Math.round(discount);
  };

  // ✅ إضافة عرض
  const handleAddOffer = async () => {
    if (!formData.name || !formData.offerPrice || !formData.startDate || !formData.endDate) {
      toast.warning('⚠️ من فضلك املأ جميع الحقول المطلوبة');
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.warning('⚠️ تاريخ البداية يجب أن يكون قبل تاريخ النهاية');
      return;
    }

    const discountPercent = calculateDiscountPercentage(
      parseFloat(formData.originalPrice),
      parseFloat(formData.offerPrice)
    );

    const newOffer = {
      id: `OFF-${Date.now().toString().slice(-6)}`,
      name: formData.name,
      description: formData.description || '',
      image: formData.image || '',
      discount_type: formData.discountType || 'percentage',
      discount_value: discountPercent > 0 ? discountPercent : parseFloat(formData.discountValue) || 0,
      original_price: parseFloat(formData.originalPrice) || 0,
      offer_price: parseFloat(formData.offerPrice),
      min_order: parseFloat(formData.minOrder) || 0,
      stock: parseInt(formData.stock) || 0,
      start_date: formData.startDate,
      end_date: formData.endDate,
      active: true,
      category: formData.category || '',
      brand: formData.brand || '',
      rating: parseFloat(formData.rating) || 0
    };

    try {
      const { error } = await supabase
        .from('offers')
        .insert([newOffer]);
      
      if (error) throw error;
      
      toast.success('✅ تم إضافة العرض بنجاح');
      setShowAddModal(false);
      resetForm();
      fetchOffers();
    } catch (error) {
      console.error('Error adding offer:', error);
      toast.error('❌ حدث خطأ أثناء إضافة العرض');
    }
  };

  // ✅ تعديل عرض
  const handleEditOffer = async () => {
    if (!formData.name || !formData.offerPrice || !formData.startDate || !formData.endDate) {
      toast.warning('⚠️ من فضلك املأ جميع الحقول المطلوبة');
      return;
    }

    const discountPercent = calculateDiscountPercentage(
      parseFloat(formData.originalPrice),
      parseFloat(formData.offerPrice)
    );

    const updatedOffer = {
      name: formData.name,
      description: formData.description || '',
      image: formData.image || '',
      discount_type: formData.discountType || 'percentage',
      discount_value: discountPercent > 0 ? discountPercent : parseFloat(formData.discountValue) || 0,
      original_price: parseFloat(formData.originalPrice) || 0,
      offer_price: parseFloat(formData.offerPrice),
      min_order: parseFloat(formData.minOrder) || 0,
      stock: parseInt(formData.stock) || 0,
      start_date: formData.startDate,
      end_date: formData.endDate,
      active: formData.active,
      category: formData.category || '',
      brand: formData.brand || '',
      rating: parseFloat(formData.rating) || 0
    };

    try {
      const { error } = await supabase
        .from('offers')
        .update(updatedOffer)
        .eq('id', editingOffer.id);
      
      if (error) throw error;
      
      toast.success('✅ تم تحديث العرض بنجاح');
      setEditingOffer(null);
      resetForm();
      fetchOffers();
    } catch (error) {
      console.error('Error updating offer:', error);
      toast.error('❌ حدث خطأ أثناء تحديث العرض');
    }
  };

  // ✅ حذف عرض
  const handleDeleteOffer = async () => {
    try {
      const { error } = await supabase
        .from('offers')
        .delete()
        .eq('id', showDeleteConfirm);
      
      if (error) throw error;
      
      toast.success('✅ تم حذف العرض بنجاح');
      setShowDeleteConfirm(null);
      fetchOffers();
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast.error('❌ حدث خطأ أثناء حذف العرض');
    }
  };

  // ✅ تغيير حالة العرض
  const toggleOfferStatus = async (offerId) => {
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return;

    try {
      const { error } = await supabase
        .from('offers')
        .update({ active: !offer.active })
        .eq('id', offerId);
      
      if (error) throw error;
      
      toast.success(!offer.active ? '✅ تم تفعيل العرض' : '⏸️ تم إيقاف العرض');
      fetchOffers();
    } catch (error) {
      console.error('Error toggling offer status:', error);
      toast.error('❌ حدث خطأ أثناء تغيير حالة العرض');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      discountType: 'percentage',
      discountValue: '',
      originalPrice: '',
      offerPrice: '',
      minOrder: '',
      stock: '',
      startDate: '',
      endDate: '',
      active: true,
      category: '',
      brand: '',
      rating: 0
    });
    setShowNewCategoryInput(false);
    setShowNewBrandInput(false);
    setNewCategory('');
    setNewBrand('');
  };

  const openEdit = (offer) => {
    setEditingOffer(offer);
    setFormData({
      name: offer.name,
      description: offer.description || '',
      image: offer.image || '',
      discountType: offer.discount_type || 'percentage',
      discountValue: offer.discount_value || '',
      originalPrice: offer.original_price || '',
      offerPrice: offer.offer_price,
      minOrder: offer.min_order || '',
      stock: offer.stock || '',
      startDate: offer.start_date,
      endDate: offer.end_date,
      active: offer.active,
      category: offer.category || '',
      brand: offer.brand || '',
      rating: offer.rating || 0
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

  const filteredOffers = offers.filter(offer =>
    offer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: offers.length,
    active: offers.filter(o => o.active).length,
    inactive: offers.filter(o => !o.active).length
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
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">🏷️ إدارة العروض</h1>
            <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs px-2 py-0.5 rounded-full">
              {offers.length} عرض
            </span>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 dark:bg-purple-500 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors text-sm"
          >
            <PlusIcon className="h-4 w-4" />
            إضافة عرض
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">إجمالي العروض</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">نشط</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.inactive}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">غير نشط</p>
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
              placeholder="بحث عن عرض..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-2">جاري تحميل العروض...</p>
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="text-center py-12">
              <TagIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">لا توجد عروض</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">العرض</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">السعر</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">الخصم</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">التصنيف</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">الماركة</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">المخزون</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">المدة</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">الحالة</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredOffers.map((offer) => (
                    <tr key={offer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={offer.image || 'https://picsum.photos/seed/' + offer.id + '/40/40'}
                            alt={offer.name}
                            className="w-10 h-10 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                            onError={(e) => e.target.src = 'https://picsum.photos/seed/1/40/40'}
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{offer.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{offer.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="text-sm font-bold text-rose-600 dark:text-rose-400">{formatPrice(offer.offer_price)}</span>
                          {offer.original_price > 0 && (
                            <span className="text-xs text-gray-400 line-through mr-2">{formatPrice(offer.original_price)}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {offer.discount_value > 0 ? (
                          <span className="text-sm font-bold text-green-600 dark:text-green-400">
                            {offer.discount_value}%
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{offer.category || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{offer.brand || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {offer.stock > 0 ? offer.stock : 'غير محدود'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        <div>{formatDate(offer.start_date)}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">→ {formatDate(offer.end_date)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleOfferStatus(offer.id)}
                          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                            offer.active
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}
                        >
                          {offer.active ? <CheckCircleIcon className="h-3 w-3" /> : <XCircleIcon className="h-3 w-3" />}
                          {offer.active ? 'نشط' : 'غير نشط'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(offer)}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(offer.id)}
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
      {(showAddModal || editingOffer) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white dark:bg-gray-800 py-2 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingOffer ? 'تعديل العرض' : 'إضافة عرض جديد'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingOffer(null);
                  resetForm();
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-3">
              {/* صورة العرض */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">صورة العرض</label>
                <div className="flex items-center gap-3">
                  <img
                    src={formData.image || 'https://picsum.photos/seed/offer/100/100'}
                    alt="صورة العرض"
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                    onError={(e) => e.target.src = 'https://picsum.photos/seed/offer/100/100'}
                  />
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="رابط الصورة"
                  />
                </div>
              </div>

              {/* اسم العرض */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم العرض *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="مثال: عيد الفطر"
                />
              </div>

              {/* الوصف */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows="2"
                  placeholder="وصف العرض"
                />
              </div>

              {/* التصنيف */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">التصنيف</label>
                <div className="flex gap-2">
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">اختر تصنيف (اختياري)</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="__new__">➕ إضافة تصنيف جديد</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewCategoryInput(true);
                      setFormData({ ...formData, category: '' });
                    }}
                    className="px-3 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                  >
                    <PlusCircleIcon className="h-5 w-5" />
                  </button>
                </div>
                
                {showNewCategoryInput && (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder="اسم التصنيف الجديد"
                    />
                    <button
                      onClick={handleAddCategory}
                      className="px-3 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors text-sm"
                    >
                      إضافة
                    </button>
                    <button
                      onClick={() => {
                        setShowNewCategoryInput(false);
                        setNewCategory('');
                      }}
                      className="px-3 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors text-sm"
                    >
                      إلغاء
                    </button>
                  </div>
                )}
              </div>

              {/* الماركة */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الماركة</label>
                <div className="flex gap-2">
                  <select
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">اختر ماركة (اختياري)</option>
                    {brands.map((brand) => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                    <option value="__new__">➕ إضافة ماركة جديدة</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewBrandInput(true);
                      setFormData({ ...formData, brand: '' });
                    }}
                    className="px-3 py-2 bg-purple-600 dark:bg-purple-500 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
                  >
                    <PlusCircleIcon className="h-5 w-5" />
                  </button>
                </div>
                
                {showNewBrandInput && (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={newBrand}
                      onChange={(e) => setNewBrand(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder="اسم الماركة الجديدة"
                    />
                    <button
                      onClick={handleAddBrand}
                      className="px-3 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors text-sm"
                    >
                      إضافة
                    </button>
                    <button
                      onClick={() => {
                        setShowNewBrandInput(false);
                        setNewBrand('');
                      }}
                      className="px-3 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors text-sm"
                    >
                      إلغاء
                    </button>
                  </div>
                )}
              </div>

              {/* السعر */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">السعر الأصلي</label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">سعر العرض *</label>
                  <input
                    type="number"
                    value={formData.offerPrice}
                    onChange={(e) => setFormData({ ...formData, offerPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="299"
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* نسبة الخصم */}
              {formData.originalPrice && formData.offerPrice && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-2 text-center">
                  <span className="text-sm text-green-700 dark:text-green-400">
                    🎯 نسبة الخصم: <strong>
                      {calculateDiscountPercentage(
                        parseFloat(formData.originalPrice),
                        parseFloat(formData.offerPrice)
                      )}%
                    </strong>
                  </span>
                </div>
              )}

              {/* الحد الأدنى */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الحد الأدنى للطلب</label>
                <input
                  type="number"
                  value={formData.minOrder}
                  onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0"
                  min="0"
                />
              </div>

              {/* المخزون */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المخزون</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0 (غير محدود)"
                  min="0"
                />
              </div>

              {/* التقييم */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">التقييم (0-5)</label>
                <input
                  type="number"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0"
                  min="0"
                  max="5"
                  step="0.1"
                />
              </div>

              {/* المدة */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تاريخ البداية *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تاريخ النهاية *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <button
                onClick={editingOffer ? handleEditOffer : handleAddOffer}
                className="w-full py-2 bg-purple-600 dark:bg-purple-500 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors font-medium"
              >
                {editingOffer ? 'تحديث العرض' : 'إضافة العرض'}
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
              <p className="text-gray-600 dark:text-gray-400">هل أنت متأكد من حذف هذا العرض؟</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteOffer}
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

export default OffersManagement;
