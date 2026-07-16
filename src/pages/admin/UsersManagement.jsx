// ecommerce-store/src/pages/admin/UsersManagement.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import {
  UsersIcon,
  UserIcon,
  UserGroupIcon,
  UserPlusIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  XMarkIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const UsersManagement = () => {
  const navigate = useNavigate();
  const { isAdmin, fetchAllUsers } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', email: '', role: '' });

  // ✅ تحميل البيانات من Supabase
  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    const loadUsers = async () => {
      setLoading(true);
      try {
        const data = await fetchAllUsers();
        setUsers(data || []);
      } catch (error) {
        console.error('Error loading users:', error);
        toast.error('❌ حدث خطأ أثناء تحميل المستخدمين');
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [isAdmin, navigate]);

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

  // الحصول على حالة المستخدم
  const getStatusBadge = (status) => {
    const statusMap = {
      active: { label: 'نشط', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700' },
      inactive: { label: 'غير نشط', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700' },
      banned: { label: 'محظور', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700' }
    };
    return statusMap[status] || { label: status, color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600' };
  };

  // الحصول على دور المستخدم
  const getRoleBadge = (role) => {
    const roleMap = {
      admin: { label: 'أدمن', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-700' },
      editor: { label: 'محرر', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700' },
      user: { label: 'مستخدم', color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600' }
    };
    return roleMap[role] || { label: role, color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600' };
  };

  // تصفية المستخدمين
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // ✅ تحديث دور المستخدم
  const handleUpdateRole = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
      
      // تحديث القائمة
      const data = await fetchAllUsers();
      setUsers(data || []);
      setEditingUser(null);
      toast.success('✅ تم تحديث دور المستخدم بنجاح');
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('❌ حدث خطأ أثناء تحديث الدور');
    }
  };

  // ✅ تحديث حالة المستخدم
  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', userId);
      
      if (error) throw error;
      
      const data = await fetchAllUsers();
      setUsers(data || []);
      toast.success('✅ تم تحديث حالة المستخدم بنجاح');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('❌ حدث خطأ أثناء تحديث الحالة');
    }
  };

  // ✅ حذف مستخدم
  const handleDeleteUser = async (userId) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      const data = await fetchAllUsers();
      setUsers(data || []);
      setShowDeleteConfirm(null);
      toast.success('✅ تم حذف المستخدم بنجاح');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('❌ حدث خطأ أثناء حذف المستخدم');
    }
  };

  // إحصائيات
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    banned: users.filter(u => u.status === 'banned').length,
    admins: users.filter(u => u.role === 'admin').length
  };

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
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">👥 إدارة المستخدمين</h1>
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs px-2 py-0.5 rounded-full">
              {users.length} مستخدم
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('سيتم تحميل التقرير...')}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              تصدير
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* الإحصائيات السريعة */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">إجمالي المستخدمين</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">نشط</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 text-center">
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.inactive}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">غير نشط</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.banned}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">محظور</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 text-center">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.admins}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">أدمن</p>
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
                placeholder="بحث عن مستخدم (الاسم، البريد الإلكتروني، الهاتف)..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FunnelIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
                >
                  <option value="all">جميع الأدوار</option>
                  <option value="admin">أدمن</option>
                  <option value="editor">محرر</option>
                  <option value="user">مستخدم</option>
                </select>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                  <option value="banned">محظور</option>
                </select>
              </div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                  setStatusFilter('all');
                }}
                className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                مسح
              </button>
            </div>
          </div>
        </div>

        {/* قائمة المستخدمين */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-2">جاري تحميل المستخدمين...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-2">
                <UsersIcon className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">لا توجد مستخدمين مطابقين للبحث</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">المستخدم</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">البريد الإلكتروني</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">الدور</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">الحالة</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">الطلبات</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">الإجمالي</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user) => {
                    const statusBadge = getStatusBadge(user.status);
                    const roleBadge = getRoleBadge(user.role);

                    return (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff`}
                              alt={user.name}
                              className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-600"
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400" dir="ltr">{user.phone || 'لا يوجد'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" dir="ltr">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${roleBadge.color}`}>
                            <ShieldCheckIcon className="h-3 w-3" />
                            {roleBadge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge.color}`}>
                            {user.status === 'active' ? <CheckCircleIcon className="h-3 w-3" /> : <XCircleIcon className="h-3 w-3" />}
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-400">{user.orders || 0}</td>
                        <td className="px-4 py-3 text-sm font-bold text-blue-600 dark:text-blue-400">{formatPrice(user.totalSpent || 0)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserDetails(true);
                              }}
                              className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="عرض التفاصيل"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingUser(user);
                                setEditFormData({
                                  name: user.name,
                                  email: user.email,
                                  role: user.role
                                });
                              }}
                              className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title="تعديل الدور"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(user.id)}
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

      {/* مودال تفاصيل المستخدم */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white dark:bg-gray-800 py-2 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">تفاصيل المستخدم</h3>
              <button
                onClick={() => {
                  setShowUserDetails(false);
                  setSelectedUser(null);
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <img
                src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name)}&background=2563eb&color=fff`}
                alt={selectedUser.name}
                className="w-20 h-20 rounded-full border-4 border-blue-100 dark:border-blue-800"
              />
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedUser.name}</h2>
                <p className="text-gray-500 dark:text-gray-400" dir="ltr">{selectedUser.email}</p>
                <div className="flex gap-2 mt-1">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadge(selectedUser.role).color}`}>
                    <ShieldCheckIcon className="h-3 w-3" />
                    {getRoleBadge(selectedUser.role).label}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(selectedUser.status).color}`}>
                    {selectedUser.status === 'active' ? <CheckCircleIcon className="h-3 w-3" /> : <XCircleIcon className="h-3 w-3" />}
                    {getStatusBadge(selectedUser.status).label}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">رقم الهاتف</p>
                <p className="font-medium text-gray-900 dark:text-white" dir="ltr">{selectedUser.phone || 'لا يوجد'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">تاريخ الانضمام</p>
                <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedUser.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">عدد الطلبات</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedUser.orders || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">إجمالي المشتريات</p>
                <p className="font-medium text-blue-600 dark:text-blue-400">{formatPrice(selectedUser.totalSpent || 0)}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowUserDetails(false);
                  setSelectedUser(null);
                }}
                className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال تعديل الدور */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">تعديل دور المستخدم</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الاسم</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الدور</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">مستخدم</option>
                  <option value="editor">محرر</option>
                  <option value="admin">أدمن</option>
                </select>
              </div>
              <button
                onClick={() => handleUpdateRole(editingUser.id, editFormData.role)}
                className="w-full py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
              >
                تحديث الدور
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
              <p className="text-gray-600 dark:text-gray-400">
                هل أنت متأكد من حذف هذا المستخدم؟ هذا الإجراء لا يمكن التراجع عنه.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleDeleteUser(showDeleteConfirm)}
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

export default UsersManagement;
