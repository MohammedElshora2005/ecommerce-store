// ecommerce-store/src/pages/OrdersPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import {
  ShoppingBagIcon,
  ClockIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  EyeIcon,
  XMarkIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const OrdersPage = () => {
  const { user } = useAuth();
  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editFormData, setEditFormData] = useState({
    address: '',
    shippingMethod: 'standard',
    paymentMethod: 'cash',
    notes: ''
  });

  // ✅ جلب طلبات المستخدم من Supabase (مع تخطي الأدمن)
  const fetchUserOrders = async () => {
    // ✅ لو أدمن (local) مش مسجل في Supabase، اتخطى
    if (!user || user.id?.startsWith('admin-')) {
      setUserOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUserOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('❌ حدث خطأ أثناء تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, [user]);

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'قيد المراجعة', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400', icon: ClockIcon, canEdit: true },
      processing: { label: 'قيد المعالجة', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400', icon: ClockIcon, canEdit: false },
      shipped: { label: 'تم الشحن', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400', icon: TruckIcon, canEdit: false },
      delivered: { label: 'تم التوصيل', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400', icon: CheckCircleIcon, canEdit: false },
      cancelled: { label: 'ملغي', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400', icon: XCircleIcon, canEdit: false }
    };
    return statusMap[status] || { label: status, color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300', icon: ClockIcon, canEdit: false };
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
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch { return dateStr; }
  };

  // ✅ تحديث الطلب في Supabase
  const handleSaveEdit = async () => {
    if (!editFormData.address.trim()) {
      toast.warning('⚠️ من فضلك أدخل عنوان صحيح');
      return;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          address: editFormData.address,
          shipping_method: editFormData.shippingMethod,
          payment_method: editFormData.paymentMethod,
          notes: editFormData.notes
        })
        .eq('id', editingOrder.id);
      
      if (error) throw error;
      
      toast.success('✅ تم تحديث الطلب بنجاح');
      setShowEditModal(false);
      setEditingOrder(null);
      fetchUserOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('❌ حدث خطأ أثناء تحديث الطلب');
    }
  };

  // ✅ حذف طلب من Supabase
  const handleDeleteOrder = async (order) => {
    if (order.status !== 'pending') {
      toast.warning('⚠️ لا يمكن حذف الطلب إلا في حالة "قيد المراجعة"');
      return;
    }

    if (!window.confirm(`هل أنت متأكد من حذف الطلب ${order.id}؟`)) return;

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', order.id);
      
      if (error) throw error;
      
      toast.success('✅ تم حذف الطلب بنجاح');
      fetchUserOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('❌ حدث خطأ أثناء حذف الطلب');
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-gray-500 dark:text-gray-400 mt-2">جاري تحميل الطلبات...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* عنوان الصفحة */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ArrowLeftIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📦 طلباتي</h1>
          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs px-2 py-0.5 rounded-full">
            {userOrders.length} طلب
          </span>
        </div>

        {userOrders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <ShoppingBagIcon className="h-24 w-24 mx-auto" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">لا توجد طلبات</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">لم تقم بإجراء أي طلبات حتى الآن.</p>
            <Link
              to="/products"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              استعراض المنتجات
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {userOrders.map((order) => {
              const status = getStatusBadge(order.status);
              const StatusIcon = status.icon;
              const canEdit = order.status === 'pending';

              return (
                <div key={order.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{order.id}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(order.date)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        <StatusIcon className="h-4 w-4" />
                        {status.label}
                      </span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatPrice(order.total)}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {order.items?.length || 0} منتج
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDetails(true);
                          }}
                          className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                        >
                          <EyeIcon className="h-4 w-4" />
                          عرض
                        </button>

                        {canEdit && (
                          <button
                            onClick={() => {
                              setEditingOrder(order);
                              setEditFormData({
                                address: order.address || '',
                                shippingMethod: order.shipping_method || 'standard',
                                paymentMethod: order.payment_method || 'cash',
                                notes: order.notes || ''
                              });
                              setShowEditModal(true);
                            }}
                            className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors"
                          >
                            <PencilIcon className="h-4 w-4" />
                            تعديل
                          </button>
                        )}

                        {canEdit && (
                          <button
                            onClick={() => handleDeleteOrder(order)}
                            className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                          >
                            <TrashIcon className="h-4 w-4" />
                            حذف
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* مودال تفاصيل الطلب */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white dark:bg-gray-800 py-2 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">تفاصيل الطلب</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedOrder.id}</p>
              </div>
              <button
                onClick={() => { setShowDetails(false); setSelectedOrder(null); }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">العميل</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.customer}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">التاريخ</p>
                <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedOrder.date)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">الحالة</p>
                <p className="font-medium text-gray-900 dark:text-white">{getStatusBadge(selectedOrder.status).label}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">الإجمالي</p>
                <p className="font-medium text-blue-600 dark:text-blue-400">{formatPrice(selectedOrder.total)}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">عنوان الشحن</p>
              <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.address}</p>
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">طريقة الشحن</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {selectedOrder.shipping_method === 'standard' ? 'شحن عادي' :
                 selectedOrder.shipping_method === 'express' ? 'شحن سريع' :
                 selectedOrder.shipping_method === 'sameDay' ? 'شحن نفس اليوم' : 'غير محدد'}
              </p>
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">طريقة الدفع</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {selectedOrder.payment_method === 'cash' ? 'الدفع عند الاستلام' :
                 selectedOrder.payment_method === 'card' ? 'بطاقة ائتمان' :
                 selectedOrder.payment_method === 'wallet' ? 'محفظة رقمية' : 'غير محدد'}
              </p>
            </div>

            {selectedOrder.notes && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">ملاحظات</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.notes}</p>
              </div>
            )}

            <div className="mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">المنتجات</p>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-3 py-2 text-right font-medium text-gray-500 dark:text-gray-300">المنتج</th>
                      <th className="px-3 py-2 text-center font-medium text-gray-500 dark:text-gray-300">الكمية</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-300">السعر</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {selectedOrder.items?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{item.name}</td>
                        <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{item.quantity}</td>
                        <td className="px-3 py-2 text-left text-gray-700 dark:text-gray-300">{formatPrice(item.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <td colSpan="2" className="px-3 py-2 text-right font-bold text-gray-900 dark:text-white">الإجمالي</td>
                      <td className="px-3 py-2 text-left font-bold text-blue-600 dark:text-blue-400">{formatPrice(selectedOrder.total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <button
              onClick={() => { setShowDetails(false); setSelectedOrder(null); }}
              className="w-full py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* مودال تعديل الطلب */}
      {showEditModal && editingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white dark:bg-gray-800 py-2 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">تعديل الطلب</h3>
              <button
                onClick={() => { setShowEditModal(false); setEditingOrder(null); }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              تعديل الطلب <span className="font-bold">{editingOrder.id}</span>
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  عنوان الشحن *
                </label>
                <input
                  type="text"
                  name="address"
                  value={editFormData.address}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل العنوان الجديد"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  طريقة الشحن
                </label>
                <select
                  name="shippingMethod"
                  value={editFormData.shippingMethod}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="standard">شحن عادي</option>
                  <option value="express">شحن سريع</option>
                  <option value="sameDay">شحن نفس اليوم</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  طريقة الدفع
                </label>
                <select
                  name="paymentMethod"
                  value={editFormData.paymentMethod}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cash">الدفع عند الاستلام</option>
                  <option value="card">بطاقة ائتمان</option>
                  <option value="wallet">محفظة رقمية</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ملاحظات إضافية
                </label>
                <textarea
                  name="notes"
                  value={editFormData.notes}
                  onChange={handleEditChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أي ملاحظات إضافية..."
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => { setShowEditModal(false); setEditingOrder(null); }}
                className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                حفظ التعديلات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
