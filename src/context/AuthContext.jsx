// ecommerce-store/src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';

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

  // ✅ قائمة المستخدمين (فاضية في البداية)
  const [allUsers, setAllUsers] = useState(() => {
    const saved = localStorage.getItem('allUsers');
    return saved ? JSON.parse(saved) : [];
  });

  // حفظ المستخدمين في localStorage
  useEffect(() => {
    localStorage.setItem('allUsers', JSON.stringify(allUsers));
  }, [allUsers]);

  // ✅ قراءة بيانات الأدمن من .env
  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin1@gmail.com';
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'Admin@123';

  // التحقق من حالة المستخدم عند تحميل الصفحة
  useEffect(() => {
    const checkUser = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setUserRole(parsedUser.role || 'user');
        }
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // جلب دور المستخدم
  const fetchUserRole = async (userId) => {
    try {
      const user = allUsers.find(u => u.id === userId);
      return user?.role || 'user';
    } catch (error) {
      console.error('Error fetching user role:', error);
      return 'user';
    }
  };

  // ✅ تسجيل الدخول (المستخدم لازم يكون موجود)
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      await new Promise((resolve) => setTimeout(resolve, 500));

      // ✅ حساب الأدمن من .env
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const adminUser = {
          id: '1',
          email: ADMIN_EMAIL,
          name: 'أدمن الموقع',
          phone: '',
          avatar: 'https://ui-avatars.com/api/?name=Admin&background=2563eb&color=fff',
          user_metadata: {
            name: 'أدمن الموقع'
          },
          role: 'admin',
          loyaltyPoints: 0,
          loyaltyLevel: 'برونزي'
        };
        
        localStorage.setItem('user', JSON.stringify(adminUser));
        setUser(adminUser);
        setUserRole('admin');
        return { success: true, user: adminUser };
      }

      // ✅ التحقق من وجود المستخدم في القائمة
      const existingUser = allUsers.find(u => u.email === email);
      
      // ❌ لو المستخدم مش موجود، ارفض الدخول
      if (!existingUser) {
        return { success: false, error: 'البريد الإلكتروني غير مسجل. يرجى إنشاء حساب أولاً' };
      }

      // ✅ التحقق من كلمة المرور (محاكاة)
      if (password && password.length >= 6) {
        const mockUser = {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          phone: existingUser.phone || '',
          avatar: existingUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(existingUser.name)}&background=2563eb&color=fff`,
          user_metadata: {
            name: existingUser.name
          },
          role: existingUser.role || 'user',
          loyaltyPoints: existingUser.loyaltyPoints || 0,
          loyaltyLevel: existingUser.loyaltyLevel || 'برونزي'
        };
        
        localStorage.setItem('user', JSON.stringify(mockUser));
        setUser(mockUser);
        setUserRole(mockUser.role || 'user');
        return { success: true, user: mockUser };
      }

      return { success: false, error: 'كلمة المرور غير صحيحة' };
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // تسجيل الدخول بجوجل (محاكاة)
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const googleUser = {
        id: Date.now().toString(),
        email: 'user@gmail.com',
        name: 'مستخدم جوجل',
        phone: '',
        avatar: 'https://ui-avatars.com/api/?name=Google+User&background=ea4335&color=fff',
        user_metadata: {
          name: 'مستخدم جوجل'
        },
        role: 'user',
        loyaltyPoints: 0,
        loyaltyLevel: 'برونزي'
      };

      // ✅ إضافة المستخدم لقائمة المستخدمين
      const existingUser = allUsers.find(u => u.email === googleUser.email);
      if (!existingUser) {
        const newUser = {
          id: googleUser.id,
          name: googleUser.user_metadata.name,
          email: googleUser.email,
          phone: '',
          role: 'user',
          status: 'active',
          createdAt: new Date().toISOString().split('T')[0],
          orders: 0,
          totalSpent: 0,
          avatar: googleUser.avatar,
          loyaltyPoints: 0,
          loyaltyLevel: 'برونزي'
        };
        setAllUsers(prev => [...prev, newUser]);
      }

      localStorage.setItem('user', JSON.stringify(googleUser));
      setUser(googleUser);
      setUserRole('user');
      
      return { success: true, user: googleUser };
    } catch (error) {
      console.error('Google login error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // ✅ إنشاء حساب جديد
  const register = async (email, password, name) => {
    try {
      setLoading(true);
      setError(null);
      
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (email && password && name && password.length >= 6) {
        if (email === ADMIN_EMAIL) {
          return { success: false, error: 'هذا البريد الإلكتروني محجوز' };
        }

        // ✅ التحقق من عدم وجود المستخدم
        if (allUsers.some(u => u.email === email)) {
          return { success: false, error: 'البريد الإلكتروني مستخدم بالفعل' };
        }

        const newUser = {
          id: Date.now().toString(),
          name: name,
          email: email,
          phone: '',
          role: 'user',
          status: 'active',
          createdAt: new Date().toISOString().split('T')[0],
          orders: 0,
          totalSpent: 0,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff`,
          loyaltyPoints: 0,
          loyaltyLevel: 'برونزي'
        };

        setAllUsers(prev => [...prev, newUser]);

        const mockUser = {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          phone: '',
          avatar: newUser.avatar,
          user_metadata: {
            name: newUser.name
          },
          role: 'user',
          loyaltyPoints: 0,
          loyaltyLevel: 'برونزي'
        };

        localStorage.setItem('user', JSON.stringify(mockUser));
        setUser(mockUser);
        setUserRole('user');
        return { success: true, user: mockUser };
      }

      return { success: false, error: 'بيانات غير صحيحة' };
    } catch (error) {
      console.error('Register error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // تسجيل الخروج
  const logout = async () => {
    try {
      setLoading(true);
      
      localStorage.removeItem('user');
      setUser(null);
      setUserRole('user');
      setError(null);
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // إعادة تعيين كلمة المرور (محاكاة)
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log(`📧 Password reset email sent to: ${email}`);
      
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // تحديث كلمة المرور (محاكاة)
  const updatePassword = async (newPassword) => {
    try {
      setLoading(true);
      setError(null);
      
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log(`🔑 Password updated successfully`);
      
      return { success: true };
    } catch (error) {
      console.error('Update password error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // ✅ تحديث بيانات المستخدم (مع حفظ phone و avatar)
  const updateProfile = async (data) => {
    try {
      setLoading(true);
      setError(null);
      
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (user) {
        // ✅ تحديث في allUsers
        setAllUsers(prev => prev.map(u => 
          u.id === user.id ? { 
            ...u, 
            name: data.name || u.name,
            phone: data.phone || u.phone,
            avatar: data.avatar || u.avatar
          } : u
        ));

        // ✅ تحديث المستخدم الحالي
        const updatedUser = {
          ...user,
          name: data.name || user.name,
          phone: data.phone || user.phone,
          avatar: data.avatar || user.avatar,
          user_metadata: { 
            ...user.user_metadata, 
            name: data.name || user.user_metadata?.name 
          }
        };
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // ✅ تحديث دور المستخدم
  const updateUserRole = async (userId, newRole) => {
    try {
      setLoading(true);
      setError(null);
      
      await new Promise((resolve) => setTimeout(resolve, 500));

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
    } catch (error) {
      console.error('Update role error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // ✅ تحديث حالة المستخدم
  const updateUserStatus = (userId, newStatus) => {
    setAllUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, status: newStatus } : u
    ));
  };

  // ✅ حذف مستخدم
  const deleteUser = (userId) => {
    setAllUsers(prev => prev.filter(u => u.id !== userId));
  };

  // ✅✅✅ تحديث إحصائيات المستخدم (مع تحديث localStorage و user) ✅✅✅
  const updateUserStats = (userId, orderTotal) => {
    console.log('🔄 Updating user stats for:', userId, 'Order total:', orderTotal);
    
    // جلب البيانات الحالية
    let allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
    let currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    // تحديث allUsers
    const updatedUsers = allUsers.map(u => {
      if (u.id === userId) {
        // حساب نقاط الولاء (10 نقاط لكل 100 جنيه)
        const pointsEarned = Math.floor(orderTotal / 100) * 10;
        const newTotalPoints = (u.loyaltyPoints || 0) + pointsEarned;
        
        // تحديد مستوى الولاء
        let loyaltyLevel = 'برونزي';
        if (newTotalPoints >= 500) loyaltyLevel = 'ذهبي';
        else if (newTotalPoints >= 200) loyaltyLevel = 'فضي';
        
        const updatedUser = {
          ...u,
          orders: (u.orders || 0) + 1,
          totalSpent: (u.totalSpent || 0) + orderTotal,
          loyaltyPoints: newTotalPoints,
          loyaltyLevel: loyaltyLevel
        };
        
        console.log('✅ Updated user:', updatedUser);
        return updatedUser;
      }
      return u;
    });
    
    // حفظ allUsers
    localStorage.setItem('allUsers', JSON.stringify(updatedUsers));
    
    // ✅ تحديث المستخدم الحالي في localStorage و state
    const updatedCurrentUser = updatedUsers.find(u => u.id === userId);
    if (updatedCurrentUser && currentUser.id === userId) {
      const newCurrentUser = {
        ...currentUser,
        orders: updatedCurrentUser.orders,
        totalSpent: updatedCurrentUser.totalSpent,
        loyaltyPoints: updatedCurrentUser.loyaltyPoints,
        loyaltyLevel: updatedCurrentUser.loyaltyLevel
      };
      localStorage.setItem('user', JSON.stringify(newCurrentUser));
      setUser(newCurrentUser);
      console.log('✅ Current user updated:', newCurrentUser);
    }
    
    // تحديث state
    setAllUsers(updatedUsers);
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

  // التحقق من صلاحية الإداري
  const isAdmin = () => {
    return userRole === 'admin';
  };

  // التحقق من دور معين
  const hasRole = (role) => {
    return userRole === role;
  };

  // القيم التي سيتم توفيرها
  const value = {
    user,
    loading,
    error,
    userRole,
    allUsers,
    isAuthenticated: !!user,
    isAdmin: isAdmin(),
    hasRole,
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
    checkUser: () => {},
    fetchUserRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;