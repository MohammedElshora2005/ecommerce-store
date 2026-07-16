// ecommerce-store/src/AppRoutes.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ProtectedRoute, { PublicOnlyRoute } from './components/common/ProtectedRoute';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ContactPage from './pages/ContactPage';
import OffersPage from './pages/OffersPage';
import OfferDetailsPage from './pages/OfferDetailsPage'; // ✅ استيراد صفحة تفاصيل العرض

// ✅ صفحات المستخدم
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import WishlistPage from './pages/WishlistPage';
import SettingsPage from './pages/SettingsPage';

// ✅ استيراد صفحات الأدمن
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductsManagement from './pages/admin/ProductsManagement';
import OrdersManagement from './pages/admin/OrdersManagement';
import UsersManagement from './pages/admin/UsersManagement';
import OffersManagement from './pages/admin/OffersManagement';
import CouponsManagement from './pages/admin/CouponsManagement';

import './styles/index.css';
import './styles/dark-mode.css';

const Layout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-grow pt-16 md:pt-20">{children}</main>
    <Footer />
  </div>
);

const AppRoutes = () => (
  <Routes>
    {/* ============================================
        ✅ مسارات الأدمن (الأولوية)
    ============================================ */}
    
    {/* صفحة تسجيل دخول الأدمن (للزوار فقط) */}
    <Route path="/admin/login" element={<PublicOnlyRoute><AdminLogin /></PublicOnlyRoute>} />
    
    {/* لوحة تحكم الأدمن */}
    <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
    
    {/* إدارة المنتجات */}
    <Route path="/admin/products" element={<ProtectedRoute><ProductsManagement /></ProtectedRoute>} />
    
    {/* إدارة الطلبات */}
    <Route path="/admin/orders" element={<ProtectedRoute><OrdersManagement /></ProtectedRoute>} />
    
    {/* إدارة المستخدمين */}
    <Route path="/admin/users" element={<ProtectedRoute><UsersManagement /></ProtectedRoute>} />

    {/* ✅ مسارات العروض وأكواد الخصم */}
    <Route path="/admin/offers" element={<ProtectedRoute><OffersManagement /></ProtectedRoute>} />
    <Route path="/admin/coupons" element={<ProtectedRoute><CouponsManagement /></ProtectedRoute>} />

    {/* ============================================
        الصفحات العامة
    ============================================ */}
    <Route path="/" element={<Layout><HomePage /></Layout>} />
    <Route path="/products" element={<Layout><ProductsPage /></Layout>} />
    <Route path="/product/:id" element={<Layout><ProductDetailsPage /></Layout>} />
    <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
    
    {/* ✅ صفحة العروض الجديدة (مختلفة عن المنتجات) */}
    <Route path="/offers" element={<Layout><OffersPage /></Layout>} />

    {/* ✅ صفحة تفاصيل العرض */}
    <Route path="/offer/:id" element={<Layout><OfferDetailsPage /></Layout>} />

    {/* ============================================
        صفحات المصادقة (للزوار فقط)
    ============================================ */}
    <Route path="/login" element={<PublicOnlyRoute><Layout><LoginPage /></Layout></PublicOnlyRoute>} />
    <Route path="/register" element={<PublicOnlyRoute><Layout><RegisterPage /></Layout></PublicOnlyRoute>} />
    <Route path="/forgot-password" element={<PublicOnlyRoute><Layout><ForgotPasswordPage /></Layout></PublicOnlyRoute>} />

    {/* ============================================
        ✅ صفحات المستخدم (محمية)
    ============================================ */}
    <Route path="/profile" element={<ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>} />
    <Route path="/orders" element={<ProtectedRoute><Layout><OrdersPage /></Layout></ProtectedRoute>} />
    <Route path="/wishlist" element={<ProtectedRoute><Layout><WishlistPage /></Layout></ProtectedRoute>} />
    <Route path="/settings" element={<ProtectedRoute><Layout><SettingsPage /></Layout></ProtectedRoute>} />

    {/* ============================================
        صفحات محمية (عربة، الدفع)
    ============================================ */}
    <Route path="/cart" element={<ProtectedRoute><Layout><CartPage /></Layout></ProtectedRoute>} />
    <Route path="/checkout" element={<ProtectedRoute><Layout><CheckoutPage /></Layout></ProtectedRoute>} />

    {/* ============================================
        صفحة 404 - غير موجودة
    ============================================ */}
    <Route path="*" element={
      <Layout>
        <div className="text-center py-20">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">404</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">الصفحة غير موجودة</p>
        </div>
      </Layout>
    } />
  </Routes>
);

export default AppRoutes;