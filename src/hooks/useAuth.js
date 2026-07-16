// ecommerce-store/src/hooks/useAuth.js

import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

/**
 * Hook مخصص للتعامل مع المصادقة
 * يوفر واجهة مبسطة للوصول إلى حالة المستخدم ووظائف المصادقة
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

/**
 * Hook للتحقق من صلاحية المستخدم
 * يعيد true إذا كان المستخدم مسجلاً
 */
export const useIsAuthenticated = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
};

/**
 * Hook للحصول على بيانات المستخدم الحالي
 */
export const useUser = () => {
  const { user } = useAuth();
  return user;
};

/**
 * Hook للتحقق من صلاحية الإداري
 */
export const useIsAdmin = () => {
  const { isAdmin } = useAuth();
  return isAdmin;
};

/**
 * Hook للتحقق من دور معين
 */
export const useHasRole = (role) => {
  const { hasRole } = useAuth();
  return hasRole(role);
};

/**
 * Hook لعمليات تسجيل الدخول
 */
export const useLogin = () => {
  const { login, loginWithGoogle } = useAuth();
  return { login, loginWithGoogle };
};

/**
 * Hook لعمليات التسجيل
 */
export const useRegister = () => {
  const { register } = useAuth();
  return { register };
};

/**
 * Hook لعمليات تسجيل الخروج
 */
export const useLogout = () => {
  const { logout } = useAuth();
  return { logout };
};

/**
 * Hook لإعادة تعيين كلمة المرور
 */
export const useResetPassword = () => {
  const { resetPassword } = useAuth();
  return { resetPassword };
};

/**
 * Hook لتحديث كلمة المرور
 */
export const useUpdatePassword = () => {
  const { updatePassword } = useAuth();
  return { updatePassword };
};

/**
 * Hook لتحديث بيانات المستخدم
 */
export const useUpdateProfile = () => {
  const { updateProfile } = useAuth();
  return { updateProfile };
};

/**
 * Hook للحصول على حالة التحميل
 */
export const useAuthLoading = () => {
  const { loading } = useAuth();
  return loading;
};

/**
 * Hook للحصول على رسالة الخطأ
 */
export const useAuthError = () => {
  const { error } = useAuth();
  return error;
};

/**
 * Hook متكامل يحتوي على كل وظائف المصادقة
 * مناسب للاستخدام في الصفحات التي تحتاج إلى كل الوظائف
 */
export const useFullAuth = () => {
  const auth = useAuth();
  return {
    // الحالة
    user: auth.user,
    loading: auth.loading,
    error: auth.error,
    userRole: auth.userRole,
    isAuthenticated: auth.isAuthenticated,
    isAdmin: auth.isAdmin,
    
    // الوظائف
    login: auth.login,
    loginWithGoogle: auth.loginWithGoogle,
    register: auth.register,
    logout: auth.logout,
    resetPassword: auth.resetPassword,
    updatePassword: auth.updatePassword,
    updateProfile: auth.updateProfile,
    updateUserRole: auth.updateUserRole,
    
    // المساعدين
    hasRole: auth.hasRole,
    checkUser: auth.checkUser,
    fetchUserRole: auth.fetchUserRole
  };
};

export default useAuth;