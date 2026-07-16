// ecommerce-store/src/components/common/ProtectedRoute.jsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false,
  redirectTo = '/login',
  allowedRoles = []
}) => {
  const { user, loading, isAuthenticated, userRole } = useAuth();
  const location = useLocation();

  // عرض Spinner أثناء التحقق من حالة المستخدم
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner 
          size="lg" 
          color="blue" 
          text="جاري التحقق من صلاحياتك..."
        />
      </div>
    );
  }

  // إذا لم يكن المستخدم مسجلاً، أعد توجيهه لصفحة تسجيل الدخول
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // ✅ إذا كان المطلوب صلاحية Admin والأدمن مسجل
  if (requireAdmin && userRole !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">غير مصرح بالوصول</h2>
          <p className="text-gray-600 mb-6">
            عذراً، ليس لديك الصلاحية الكافية للوصول إلى هذه الصفحة.
          </p>
          <button
            onClick={() => window.history.back()}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            العودة للصفحة السابقة
          </button>
        </div>
      </div>
    );
  }

  // إذا كان هناك أدوار محددة والمستخدم ليس ضمنها
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
            <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">صلاحيات غير كافية</h2>
          <p className="text-gray-600 mb-6">
            عذراً، هذا المحتوى متاح فقط للمستخدمين المصرح لهم.
          </p>
          <button
            onClick={() => window.history.back()}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            العودة للصفحة السابقة
          </button>
        </div>
      </div>
    );
  }

  // إذا كان كل شيء تمام، اعرض المحتوى
  return children;
};

// ✅ مكون مساعد للصفحات التي تحتاج تسجيل دخول فقط
export const AuthRoute = ({ children }) => {
  return <ProtectedRoute>{children}</ProtectedRoute>;
};

// ✅ مكون مساعد للصفحات التي تحتاج صلاحية Admin
export const AdminRoute = ({ children }) => {
  return <ProtectedRoute requireAdmin>{children}</ProtectedRoute>;
};

// ✅ مكون مساعد للصفحات التي تحتاج دور معين
export const RoleRoute = ({ children, roles }) => {
  return <ProtectedRoute allowedRoles={roles}>{children}</ProtectedRoute>;
};

// ✅ مكون لحماية الصفحات من المستخدمين المسجلين (مثل صفحة تسجيل الدخول)
export const PublicOnlyRoute = ({ children, redirectTo = '/' }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" color="blue" />
      </div>
    );
  }

  // إذا كان المستخدم مسجلاً، أعد توجيهه للصفحة الرئيسية
  if (isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;