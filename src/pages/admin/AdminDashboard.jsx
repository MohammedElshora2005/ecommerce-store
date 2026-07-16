// ecommerce-store/src/pages/admin/AdminDashboard.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import {
  ShoppingBagIcon,
  UsersIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  ArrowLeftIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  ArcElement, Tooltip, Legend, CategoryScale, LinearScale,
  BarElement, Title, PointElement, LineElement, Filler
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, logout, allUsers } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    products: 0,
    users: 0,
    orders: 0,
    revenue: 0
  });

  const [animatedStats, setAnimatedStats] = useState({
    products: 0,
    users: 0,
    orders: 0,
    revenue: 0
  });

  // ✅ جلب المنتجات من Supabase
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) throw error;
      setProducts(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  };

  // ✅ جلب الطلبات من Supabase
  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*');
      
      if (error) throw error;
      setOrders(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const [productsData, ordersData] = await Promise.all([
          fetchProducts(),
          fetchOrders()
        ]);

        const totalRevenue = ordersData.reduce((sum, order) => sum + order.total, 0);
        const newStats = {
          products: productsData.length,
          users: allUsers.length || 0,
          orders: ordersData.length,
          revenue: totalRevenue
        };
        setStats(newStats);
        animateCounters(newStats);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAdmin, navigate, allUsers]);

  const animateCounters = (target) => {
    const duration = 1500;
    const steps = 60;
    const stepTime = duration / steps;
    let currentStep = 0;

    const startValues = { products: 0, users: 0, orders: 0, revenue: 0 };

    const interval = setInterval(() => {
      currentStep++;
      const progress = Math.min(currentStep / steps, 1);
      
      setAnimatedStats({
        products: Math.floor(startValues.products + (target.products - startValues.products) * progress),
        users: Math.floor(startValues.users + (target.users - startValues.users) * progress),
        orders: Math.floor(startValues.orders + (target.orders - startValues.orders) * progress),
        revenue: Math.floor(startValues.revenue + (target.revenue - startValues.revenue) * progress)
      });

      if (progress >= 1) clearInterval(interval);
    }, stepTime);
  };

  // ✅ بيانات الرسوم البيانية (من الطلبات الحقيقية)
  const getMonthlyData = () => {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'];
    const monthlySales = new Array(6).fill(0);
    const monthlyOrders = new Array(6).fill(0);

    orders.forEach(order => {
      if (order.date) {
        const date = new Date(order.date);
        const month = date.getMonth();
        if (month >= 0 && month < 6) {
          monthlySales[month] += order.total || 0;
          monthlyOrders[month] += 1;
        }
      }
    });

    return { monthlySales, monthlyOrders };
  };

  const { monthlySales, monthlyOrders } = getMonthlyData();

  const salesChartData = {
    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
    datasets: [{
      label: 'المبيعات',
      data: monthlySales,
      backgroundColor: 'rgba(37, 99, 235, 0.5)',
      borderColor: 'rgba(37, 99, 235, 1)',
      borderWidth: 2,
      borderRadius: 8,
    }],
  };

  const ordersChartData = {
    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
    datasets: [{
      label: 'الطلبات',
      data: monthlyOrders,
      backgroundColor: 'rgba(139, 92, 246, 0.2)',
      borderColor: 'rgba(139, 92, 246, 1)',
      borderWidth: 3,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: 'rgba(139, 92, 246, 1)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
    }],
  };

  const statusCounts = {
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  const doughnutData = {
    labels: ['قيد المراجعة', 'قيد المعالجة', 'تم الشحن', 'تم التوصيل', 'ملغي'],
    datasets: [{
      data: [statusCounts.pending, statusCounts.processing, statusCounts.shipped, statusCounts.delivered, statusCounts.cancelled],
      backgroundColor: ['#f59e0b', '#3b82f6', '#8b5cf6', '#22c55e', '#ef4444'],
      borderWidth: 2,
      borderColor: '#fff',
    }],
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // ✅ أزرار التنقل السريع
  const quickLinks = [
    { title: 'المنتجات', icon: '🛍️', path: '/admin/products', color: 'from-blue-500 to-blue-700' },
    { title: 'الطلبات', icon: '📦', path: '/admin/orders', color: 'from-indigo-500 to-indigo-700' },
    { title: 'المستخدمين', icon: '👥', path: '/admin/users', color: 'from-teal-500 to-teal-700' },
    { title: 'العروض', icon: '🏷️', path: '/admin/offers', color: 'from-rose-500 to-rose-700' },
    { title: 'أكواد الخصم', icon: '🎫', path: '/admin/coupons', color: 'from-amber-500 to-amber-700' },
  ];

  const statsData = [
    { title: 'المنتجات', value: animatedStats.products, icon: ShoppingBagIcon, color: 'bg-blue-500' },
    { title: 'المستخدمين', value: animatedStats.users, icon: UsersIcon, color: 'bg-teal-500' },
    { title: 'الطلبات', value: animatedStats.orders, icon: ShoppingCartIcon, color: 'bg-indigo-500' },
    { title: 'المبيعات', value: `${formatPrice(animatedStats.revenue)}`, icon: CurrencyDollarIcon, color: 'bg-amber-500' },
  ];

  if (!isAdmin) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* الهيدر */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <ArrowLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">📊 لوحة التحكم</h1>
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs px-2 py-0.5 rounded-full">أدمن</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => alert('سيتم تحميل التقرير...')} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <DocumentArrowDownIcon className="h-4 w-4" />
              تصدير
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">{user?.email}</span>
            <button onClick={handleLogout} className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium">تسجيل الخروج</button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* أزرار التنقل السريع */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {quickLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`bg-gradient-to-r ${link.color} rounded-xl shadow-md p-4 hover:shadow-lg hover:scale-105 transition-all duration-300 text-center text-white`}
            >
              <div className="text-3xl mb-1">{link.icon}</div>
              <div className="text-sm font-medium">{link.title}</div>
            </Link>
          ))}
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statsData.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`p-3 ${stat.color} rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* الرسوم البيانية */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:col-span-2">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">📈 المبيعات الشهرية</h3>
            <div className="h-64">
              <Bar data={salesChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-center">🍩 توزيع الطلبات</h3>
            <div className="h-64 flex items-center justify-center">
              <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } }, cutout: '65%' }} />
            </div>
          </div>
        </div>

        {/* اتجاه الطلبات */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">📉 اتجاه الطلبات</h3>
          <div className="h-48">
            <Line data={ordersChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
