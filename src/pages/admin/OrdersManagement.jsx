// ecommerce-store/src/pages/admin/OrdersManagement.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import {
  ShoppingBagIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TruckIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const OrdersManagement = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth(); // ✅ isAdmin قيمة boolean مش دالة
  const { orders, updateOrderStatus, deleteOrder } = useCart();
  const [ordersList, setOrdersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // تحميل البيانات
  useEffect(() => {
    // ✅ isAdmin قيمة boolean مش دالة
    if (!isAdmin) {
      navigate('/');
      return;
    }
    setLoading(true);
    setOrdersList(orders || []);
    setLoading(false);
  }, [isAdmin, navigate, orders]);

  // حالات الطلب
  const statusOptions = [
    { value: 'all', label: 'الكل', icon: ShoppingBagIcon, color: 'text-gray-500' },
    { value: 'pending', label: 'قيد المراجعة', icon: ClockIcon, color: 'text-yellow-500' },
    { value: 'processing', label: 'قيد المعالجة', icon: ClockIcon, color: 'text-blue-500' },
    { value: 'shipped', label: 'تم الشحن', icon: TruckIcon, color: 'text-purple-500' },
    { value: 'delivered', label: 'تم التوصيل', icon: CheckCircleIcon, color: 'text-green-500' },
    { value: 'cancelled', label: 'ملغي', icon: XCircleIcon, color: 'text-red-500' }
  ];

  // تنسيق السعر
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // تنسيق التاريخ
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  // الحصول على حالة الطلب
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'قيد المراجعة', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700' },
      processing: { label: 'قيد المعالجة', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700' },
      shipped: { label: 'تم الشحن', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-700' },
      delivered: { label: 'تم التوصيل', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700' },
      cancelled: { label: 'ملغي', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700' }
    };
    return statusMap[status] || { label: status, color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600' };
  };

  // الحصول على أيقونة الحالة
  const getStatusIcon = (status) => {
    const icons = {
      pending: ClockIcon,
      processing: ClockIcon,
      shipped: TruckIcon,
      delivered: CheckCircleIcon,
      cancelled: XCircleIcon
    };
    return icons[status] || ClockIcon;
  };

  // تحديث حالة الطلب
  const handleUpdateStatus = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
    setOrdersList(orders);
    setShowStatusModal(false);
    setSelectedOrder(null);
  };

  // حذف طلب
  const handleDeleteOrder = (orderId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
      deleteOrder(orderId);
      setOrdersList(orders);
    }
  };

  // تصفية الطلبات
  const filteredOrders = ordersList.filter(order => {
    const matchesSearch = 
      order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // إحصائيات الطلبات
  const stats = {
    total: ordersList.length,
    pending: ordersList.filter(o => o.status === 'pending').length,
    processing: ordersList.filter(o => o.status === 'processing').length,
    shipped: ordersList.filter(o => o.status === 'shipped').length,
    delivered: ordersList.filter(o => o.status === 'delivered').length,
    cancelled: ordersList.filter(o => o.status === 'cancelled').length
  };

  // ✅ isAdmin قيمة boolean مش دالة
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* الهيدر */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">📦 إدارة الطلبات</h1>
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs px-2 py-0.5 rounded-full">
              {ordersList.length} طلب
            </span>
          </div>
          <button
            onClick={() => alert('سيتم تحميل التقرير...')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors text-sm"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            تصدير التقرير
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* الإحصائيات السريعة */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">الكل</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 text-center">
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">قيد المراجعة</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.processing}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">قيد المعالجة</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 text-center">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.shipped}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">تم الشحن</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.delivered}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">تم التوصيل</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.cancelled}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">ملغي</p>
          </div>
        </div>

        {/* البحث والفلترة */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث عن طلب (رقم الطلب، العميل، البريد الإلكتروني)..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FunnelIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                مسح
              </button>
            </div>
          </div>
        </div>

        {/* قائمة الطلبات */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-2">جاري تحميل الطلبات...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-2">
                <ShoppingBagIcon className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">لا توجد طلبات مطابقة للبحث</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">رقم الطلب</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">العميل</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">التاريخ</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">الإجمالي</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">الحالة</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredOrders.map((order) => {
                    const StatusIcon = getStatusIcon(order.status);
                    const statusBadge = getStatusBadge(order.status);
                    
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{order.id}</td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{order.customer}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400" dir="ltr">{order.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{formatDate(order.date)}</td>
                        <td className="px-4 py-3 text-sm font-bold text-blue-600 dark:text-blue-400">{formatPrice(order.total)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge.color}`}>
                            <StatusIcon className="h-3.5 w-3.5" />
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowOrderDetails(true);
                              }}
                              className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="عرض التفاصيل"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowStatusModal(true);
                              }}
                              className="p-1.5 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                              title="تغيير الحالة"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="حذف"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* مودال تغيير حالة الطلب */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">تغيير حالة الطلب</h3>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedOrder(null);
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              اختر الحالة الجديدة للطلب <span className="font-bold">{selectedOrder.id}</span>
            </p>
            <div className="space-y-2">
              {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => {
                const badge = getStatusBadge(status);
                const Icon = getStatusIcon(status);
                return (
                  <button
                    key={status}
                    onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all text-right ${
                      selectedOrder.status === status
                        ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="flex-1">{badge.label}</span>
                    {selectedOrder.status === status && (
                      <CheckCircleIcon className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* مودال تفاصيل الطلب */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white dark:bg-gray-800 py-2 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">تفاصيل الطلب</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedOrder.id}</p>
              </div>
              <button
                onClick={() => {
                  setShowOrderDetails(false);
                  setSelectedOrder(null);
                }}
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
                <p className="text-xs text-gray-500 dark:text-gray-400">البريد الإلكتروني</p>
                <p className="font-medium text-gray-900 dark:text-white" dir="ltr">{selectedOrder.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">الهاتف</p>
                <p className="font-medium text-gray-900 dark:text-white" dir="ltr">{selectedOrder.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">تاريخ الطلب</p>
                <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedOrder.date)}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">عنوان الشحن</p>
              <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.address}</p>
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">المنتجات</p>
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

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowOrderDetails(false);
                  setSelectedOrder(null);
                }}
                className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;