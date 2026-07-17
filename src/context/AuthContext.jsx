// ecommerce-store/src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// إنشاء Context
const AuthContext = createContext();

// Hook مخصص للاستخدام السهل
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('user');

  // ✅ قائمة المستخدمين (من Supabase)
  const [allUsers, setAllUsers] = useState([]);

  // ✅ قراءة بيانات الأدمن من .env
  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin1@gmail.com';
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'Admin@123';
  const ADMIN_ID = '3071f354-ced1-4d10-9e87-4f1984b11c34'; // ✅ UUID حقيقي

  // ✅ جلب المستخدمين من Supabase مع معالجة الخطأ
  const fetchAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');
      
      if (error) {
        if (error.code === '42P01') {
          console.warn('Users table does not exist yet');
          setAllUsers([]);
          return [];
        }
        throw error;
      }
      setAllUsers(data || []);
      return data;
    } catch (err) {
      console.error('Error fetching users:', err);
      setAllUsers([]);
      return [];
    }
  };

  // ✅ التحقق من حالة المستخدم عند تحميل الصفحة
  useEffect(() => {
    let subscription = null;
    let isMounted = true;

    const initAuth = async () => {
      try {
        setLoading(true);

        // ✅ جلب session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session?.user && isMounted) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userError && userError.code !== 'PGRST116') {
            console.error('Error fetching user data:', userError);
          }

          const mergedUser = {
            ...session.user,
            ...userData,
            id: session.user.id,
            role: userData?.role || 'user',
            loyaltyPoints: userData?.loyalty_points || 0,
            loyaltyLevel: userData?.loyalty_level || 'برونزي'
          };

          setUser(mergedUser);
          setUserRole(mergedUser.role || 'user');
          localStorage.setItem('user', JSON.stringify(mergedUser));
        } else {
          const storedUser = localStorage.getItem('user');
          if (storedUser && isMounted) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setUserRole(parsedUser.role || 'user');
          }
        }

        // ✅ الاستماع لتغيرات الـ Auth
        const { data } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!isMounted) return;
            
            try {
              if (event === 'SIGNED_IN' && session?.user) {
                const { data: userData } = await supabase
                  .from('users')
                  .select('*')
                  .eq('id', session.user.id)
                  .single();

                const mergedUser = {
                  ...session.user,
                  ...userData,
                  id: session.user.id,
                  role: userData?.role || 'user',
                  loyaltyPoints: userData?.loyalty_points || 0,
                  loyaltyLevel: userData?.loyalty_level || 'برونزي'
                };

                setUser(mergedUser);
                setUserRole(mergedUser.role || 'user');
                localStorage.setItem('user', JSON.stringify(mergedUser));
              } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setUserRole('user');
                localStorage.removeItem('user');
              }
            } catch (err) {
              console.error('Auth state change handler error:', err);
            }
          }
        );

        subscription = data.subscription;

        // ✅ جلب المستخدمين
        await fetchAllUsers();

      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
      try {
        if (subscription) {
          subscription.unsubscribe();
        }
      } catch (err) {
        console.log('Unsubscribe error:', err);
      }
    };
  }, []);

  // ✅ تسجيل الدخول
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
          });
          
          if (!error && data?.user) {
            const { data: userData } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single();
            
            const mergedUser = {
              ...data.user,
              ...userData,
              id: data.user.id,
              role: 'admin',
              loyaltyPoints: userData?.loyalty_points || 0,
              loyaltyLevel: userData?.loyalty_level || 'برونزي'
            };
            
            localStorage.setItem('user', JSON.stringify(mergedUser));
            setUser(mergedUser);
            setUserRole('admin');
            return { success: true, user: mergedUser };
          }
        } catch (supabaseError) {
          console.error('Supabase admin login error:', supabaseError);
        }
        
        // ✅ استخدام UUID الحقيقي
        const adminUser = {
          id: ADMIN_ID,
          email: ADMIN_EMAIL,
          name: 'أدمن الموقع',
          phone: '',
          avatar: 'https://ui-avatars.com/api/?name=Admin&background=2563eb&color=fff',
          user_metadata: { name: 'أدمن الموقع' },
          role: 'admin',
          loyaltyPoints: 0,
          loyaltyLevel: 'برونزي'
        };
        
        localStorage.setItem('user', JSON.stringify(adminUser));
        setUser(adminUser);
        setUserRole('admin');
        return { success: true, user: adminUser };
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      if (!data.user) {
        return { success: false, error: 'فشل تسجيل الدخول' };
      }
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      const mergedUser = {
        ...data.user,
        ...userData,
        id: data.user.id,
        role: userData?.role || 'user',
        loyaltyPoints: userData?.loyalty_points || 0,
        loyaltyLevel: userData?.loyalty_level || 'برونزي'
      };
      
      localStorage.setItem('user', JSON.stringify(mergedUser));
      setUser(mergedUser);
      setUserRole(mergedUser.role || 'user');
      
      return { success: true, user: mergedUser };
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // ✅ تسجيل الدخول بجوجل
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const redirectUrl = window.location.origin;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });
      
      if (error) {
        console.error('Google OAuth error:', error);
        throw error;
      }
      
      return { success: true, data };
    } catch (err) {
      console.error('Google login error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // ✅ إنشاء حساب جديد
  const register = async (email, password, name) => {
    try {
      setLoading(true);
      setError(null);
      
      if (email === ADMIN_EMAIL) {
        return { success: false, error: 'هذا البريد الإلكتروني محجوز' };
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      if (!data.user) {
        return { success: false, error: 'فشل إنشاء الحساب' };
      }
      
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          name: name,
          email: email,
          role: 'user',
          status: 'active',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff`,
          loyalty_points: 0,
          loyalty_level: 'برونزي'
        });
      
      if (insertError) {
        console.error('Error inserting user:', insertError);
      }
      
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      const mergedUser = {
        ...data.user,
        ...userData,
        id: data.user.id,
        role: userData?.role || 'user',
        loyaltyPoints: userData?.loyalty_points || 0,
        loyaltyLevel: userData?.loyalty_level || 'برونزي'
      };
      
      localStorage.setItem('user', JSON.stringify(mergedUser));
      setUser(mergedUser);
      setUserRole('user');
      
      return { success: true, user: mergedUser };
    } catch (err) {
      console.error('Register error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // ✅ تسجيل الخروج
  const logout = async () => {
    try {
      setLoading(true);
      
      await supabase.auth.signOut();
      
      localStorage.removeItem('user');
      setUser(null);
      setUserRole('user');
      setError(null);
      
      return { success: true };
    } catch (err) {
      console.error('Logout error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // ✅ إعادة تعيين كلمة المرور
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // ✅ تحديث كلمة المرور
  const updatePassword = async (newPassword) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (err) {
      console.error('Update password error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // ✅ تحديث بيانات المستخدم (مع حفظ البيانات في Supabase)
  const updateProfile = async (data) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        return { success: false, error: 'لا يوجد مستخدم مسجل' };
      }
      
      // ✅ لو الأدمن، تحديث localStorage بس
      if (user.id === ADMIN_ID) {
        const updatedUser = {
          ...user,
          name: data.name || user.name,
          phone: data.phone || user.phone || '',
          avatar: data.avatar || user.avatar || '',
          user_metadata: {
            ...user.user_metadata,
            name: data.name || user.user_metadata?.name
          }
        };
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        setAllUsers(prev => prev.map(u => 
          u.id === user.id ? { ...u, name: data.name || u.name, phone: data.phone || u.phone, avatar: data.avatar || u.avatar } : u
        ));
        
        return { success: true };
      }
      
      // ✅ للمستخدمين العاديين: تحديث Supabase
      const updateData = {};
      if (data.name) updateData.name = data.name;
      if (data.phone !== undefined) updateData.phone = data.phone || '';
      if (data.avatar) updateData.avatar = data.avatar;
      
      const { error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id);
      
      if (updateError) {
        console.error('Supabase update error:', updateError);
        throw updateError;
      }
      
      // ✅ جلب البيانات الجديدة من Supabase
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      // ✅ تحديث user الحالي
      const updatedUser = {
        ...user,
        ...userData,
        user_metadata: {
          ...user.user_metadata,
          name: userData?.name || user.user_metadata?.name
        }
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      // ✅ تحديث allUsers
      setAllUsers(prev => prev.map(u => 
        u.id === user.id ? userData : u
      ));
      
      return { success: true };
      
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // ✅ تحديث دور المستخدم
  const updateUserRole = async (userId, newRole) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
      
      setAllUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
      
      if (user && user.id === userId) {
        const updatedUser = { ...user, role: newRole };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setUserRole(newRole);
      }
      
      return { success: true };
    } catch (err) {
      console.error('Update role error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // ✅ تحديث حالة المستخدم
  const updateUserStatus = async (userId, newStatus) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', userId);
      
      if (error) throw error;
      
      setAllUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, status: newStatus } : u
      ));
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  // ✅ حذف مستخدم
  const deleteUser = async (userId) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      setAllUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      console.error('Delete user error:', err);
    }
  };

  // ✅ تحديث إحصائيات المستخدم
  const updateUserStats = async (userId, orderTotal) => {
    try {
      if (userId === ADMIN_ID) {
        console.log('Admin user, skipping stats update');
        return;
      }
      
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const pointsEarned = Math.floor(orderTotal / 100) * 10;
      const newTotalPoints = (userData?.loyalty_points || 0) + pointsEarned;
      
      let loyaltyLevel = 'برونزي';
      if (newTotalPoints >= 500) loyaltyLevel = 'ذهبي';
      else if (newTotalPoints >= 200) loyaltyLevel = 'فضي';
      
      const { error: updateError } = await supabase
        .from('users')
        .update({
          orders: (userData?.orders || 0) + 1,
          total_spent: (userData?.total_spent || 0) + orderTotal,
          loyalty_points: newTotalPoints,
          loyalty_level: loyaltyLevel
        })
        .eq('id', userId);
      
      if (updateError) throw updateError;
      
      setAllUsers(prev => prev.map(u => 
        u.id === userId ? { 
          ...u, 
          orders: (u.orders || 0) + 1,
          total_spent: (u.total_spent || 0) + orderTotal,
          loyalty_points: newTotalPoints,
          loyalty_level: loyaltyLevel
        } : u
      ));
      
      if (user && user.id === userId) {
        const updatedUser = {
          ...user,
          orders: (user.orders || 0) + 1,
          totalSpent: (user.totalSpent || 0) + orderTotal,
          loyaltyPoints: newTotalPoints,
          loyaltyLevel: loyaltyLevel
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      
    } catch (err) {
      console.error('Update user stats error:', err);
    }
  };

  // ✅ دالة الحصول على مستوى الولاء
  const getLoyaltyLevel = (points) => {
    if (points >= 500) return { name: 'ذهبي', color: 'text-yellow-500', bg: 'bg-yellow-50', icon: '⭐', discount: '10%' };
    if (points >= 200) return { name: 'فضي', color: 'text-gray-400', bg: 'bg-gray-50', icon: '✦', discount: '5%' };
    return { name: 'برونزي', color: 'text-amber-600', bg: 'bg-amber-50', icon: '●', discount: '2%' };
  };

  // ✅ جلب كل المستخدمين
  const getUsers = () => {
    return allUsers;
  };

  // ✅ جلب دور المستخدم
  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data?.role || 'user';
    } catch (err) {
      console.error('Error fetching user role:', err);
      return 'user';
    }
  };

  const value = {
    user,
    loading,
    error,
    userRole,
    allUsers,
    isAuthenticated: !!user,
    isAdmin: userRole === 'admin',
    hasRole: (role) => userRole === role,
    login,
    loginWithGoogle,
    register,
    logout,
    resetPassword,
    updatePassword,
    updateProfile,
    updateUserRole,
    updateUserStatus,
    deleteUser,
    updateUserStats,
    getUsers,
    getLoyaltyLevel,
    fetchUserRole,
    fetchAllUsers
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
