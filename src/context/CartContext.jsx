// ecommerce-store/src/context/CartContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

// إنشاء Context
const CartContext = createContext();

// Hook مخصص للاستخدام السهل
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Provider
export const CartProvider = ({ children }) => {
  const { user, isAuthenticated, updateUserStats } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // ✅ قائمة الطلبات (فاضية في البداية)
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : [];
  });

  // حفظ الطلبات في localStorage
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  // جلب عربة المستخدم عند تسجيل الدخول أو تغيير المستخدم
  useEffect(() => {
    loadCartFromLocalStorage();
  }, [user, isAuthenticated]);

  // جلب العربة (محاكاة)
  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await new Promise((resolve) => setTimeout(resolve, 500));
      loadCartFromLocalStorage();
      
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError(error.message);
      loadCartFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  // جلب العربة من localStorage
  const loadCartFromLocalStorage = () => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      setCartItems([]);
    }
  };

  // حفظ العربة في localStorage
  const saveCartToLocalStorage = (items) => {
    try {
      localStorage.setItem('cart', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  };

  // إضافة منتج للعربة
  const addToCart = async (product, quantity = 1) => {
    try {
      setLoading(true);
      setError(null);

      if (product.stock < quantity) {
        throw new Error('المخزون غير كافٍ');
      }

      const existingItem = cartItems.find(item => item.id === product.id);

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        
        if (product.stock < newQuantity) {
          throw new Error('المخزون غير كافٍ');
        }

        const updatedItems = cartItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
        setCartItems(updatedItems);
        saveCartToLocalStorage(updatedItems);
        
        return { success: true, message: 'تم تحديث الكمية' };
      } else {
        const newItem = {
          ...product,
          quantity: quantity,
          cartId: Date.now()
        };

        const updatedItems = [...cartItems, newItem];
        setCartItems(updatedItems);
        saveCartToLocalStorage(updatedItems);
        
        setIsCartOpen(true);
        
        return { success: true, message: 'تمت الإضافة للعربة' };
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // ✅ إنشاء طلب جديد (مع ربطه بـ userId ونقاط الولاء)
  const createOrder = async (orderData) => {
    try {
      setLoading(true);
      setError(null);

      const total = getTotalPrice();

      // ✅ استخدام userId من orderData أو من user
      const userId = orderData.userId || user?.id || Date.now().toString();
      const userName = orderData.customerName || user?.name || user?.user_metadata?.name || 'مستخدم';
      const userEmail = orderData.email || user?.email || 'unknown@example.com';

      console.log('📦 Creating order for userId:', userId);

      const newOrder = {
        id: `ORD-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 1000)}`,
        customer: userName,
        email: userEmail,
        phone: orderData.phone || '',
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        total: orderData.total || total,
        items: cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        address: orderData.address || 'عنوان غير محدد',
        userId: userId,
        notes: orderData.notes || '',
        shippingMethod: orderData.shippingMethod || 'standard',
        paymentMethod: orderData.paymentMethod || 'cash',
        loyaltyPointsEarned: 0,
        loyaltyPointsApplied: false
      };

      console.log('✅ New order created:', newOrder);

      setOrders(prev => [newOrder, ...prev]);
      
      // ✅ تفريغ العربة بعد الطلب
      setCartItems([]);
      saveCartToLocalStorage([]);

      return { success: true, order: newOrder };
    } catch (error) {
      console.error('Error creating order:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // ✅✅✅ تحديث حالة الطلب (مع حساب نقاط الولاء عند تغيير الحالة) ✅✅✅
  const updateOrderStatus = (orderId, newStatus) => {
    console.log('🔄 Updating order status:', orderId, '->', newStatus);
    
    // جلب الطلبات
    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    let updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        const oldStatus = order.status;
        
        // ✅ إذا تغيرت الحالة من pending لغير pending
        if (oldStatus === 'pending' && newStatus !== 'pending' && newStatus !== 'cancelled' && !order.loyaltyPointsApplied) {
          console.log('✅ Order completed! Calculating loyalty points...');
          
          // حساب نقاط الولاء
          const pointsEarned = Math.floor(order.total / 100) * 10;
          
          // ✅ تحديث نقاط المستخدم
          if (user) {
            console.log('👤 Updating user stats for:', user.id);
            updateUserStats(user.id, order.total);
          }
          
          return {
            ...order,
            status: newStatus,
            loyaltyPointsEarned: pointsEarned,
            loyaltyPointsApplied: true
          };
        }
        
        return { ...order, status: newStatus };
      }
      return order;
    });
    
    // حفظ الطلبات
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    setOrders(updatedOrders);
    console.log('✅ Orders updated:', updatedOrders);
  };

  // ✅ حذف طلب
  const deleteOrder = (orderId) => {
    setOrders(prev => {
      const updated = prev.filter(order => order.id !== orderId);
      localStorage.setItem('orders', JSON.stringify(updated));
      return updated;
    });
  };

  // ✅ جلب كل الطلبات
  const getOrders = () => {
    return orders;
  };

  // ✅ جلب طلبات مستخدم معين
  const getUserOrders = (userId) => {
    return orders.filter(order => order.userId === userId);
  };

  // تحديث كمية منتج في العربة
  const updateQuantity = async (productId, quantity) => {
    try {
      setLoading(true);
      setError(null);

      if (quantity < 1) {
        return await removeFromCart(productId);
      }

      const item = cartItems.find(item => item.id === productId);
      if (!item) {
        throw new Error('المنتج غير موجود في العربة');
      }

      if (item.stock < quantity) {
        throw new Error('المخزون غير كافٍ');
      }

      const updatedItems = cartItems.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      );
      setCartItems(updatedItems);
      saveCartToLocalStorage(updatedItems);

      return { success: true };
    } catch (error) {
      console.error('Error updating quantity:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // حذف منتج من العربة
  const removeFromCart = async (productId) => {
    try {
      setLoading(true);
      setError(null);

      const item = cartItems.find(item => item.id === productId);
      if (!item) {
        throw new Error('المنتج غير موجود في العربة');
      }

      const updatedItems = cartItems.filter(item => item.id !== productId);
      setCartItems(updatedItems);
      saveCartToLocalStorage(updatedItems);

      return { success: true };
    } catch (error) {
      console.error('Error removing from cart:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // تفريغ العربة بالكامل
  const clearCart = async () => {
    try {
      setLoading(true);
      setError(null);

      setCartItems([]);
      saveCartToLocalStorage([]);

      return { success: true };
    } catch (error) {
      console.error('Error clearing cart:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // ✅ حساب إجمالي عدد المنتجات
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // ✅ حساب السعر الأصلي (بدون خصم)
  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // ✅ حساب نسبة الخصم حسب مستوى الولاء
  const getDiscountPercentage = () => {
    const userLevel = user?.loyaltyLevel || 'برونزي';
    if (userLevel === 'ذهبي') return 10;
    if (userLevel === 'فضي') return 5;
    return 0;
  };

  // ✅ حساب قيمة الخصم
  const getDiscountAmount = () => {
    const subtotal = getSubtotal();
    const percentage = getDiscountPercentage();
    return subtotal * (percentage / 100);
  };

  // ✅ حساب إجمالي السعر مع الخصم
  const getTotalPrice = () => {
    const subtotal = getSubtotal();
    const discount = getDiscountAmount();
    return subtotal - discount;
  };

  // التحقق من وجود منتج في العربة
  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  // الحصول على كمية منتج معين في العربة
  const getItemQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  // دمج العربة بعد تسجيل الدخول (محاكاة)
  const mergeCart = async () => {
    try {
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      
      if (localCart.length === 0) return;

      for (const item of localCart) {
        const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
        
        if (existingItem) {
          const newQuantity = existingItem.quantity + item.quantity;
          await updateQuantity(item.id, newQuantity);
        } else {
          await addToCart(item, item.quantity);
        }
      }

      localStorage.removeItem('cart');
      
    } catch (error) {
      console.error('Error merging cart:', error);
    }
  };

  // القيم التي سيتم توفيرها
  const value = {
    cartItems,
    loading,
    error,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getSubtotal,
    getDiscountAmount,
    getDiscountPercentage,
    isInCart,
    getItemQuantity,
    mergeCart,
    fetchCart,
    createOrder,
    getOrders,
    getUserOrders,
    updateOrderStatus,
    deleteOrder,
    orders
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;