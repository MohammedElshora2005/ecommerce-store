// ecommerce-store/src/context/CartContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

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
  const [orders, setOrders] = useState([]);

  // ✅ جلب العربة من Supabase (مع تخطي الأدمن)
  const fetchCart = async () => {
    // ✅ لو أدمن (local) مش مسجل في Supabase، اتخطى
    if (!user || user.id?.startsWith('admin-')) {
      setCartItems([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching cart for user:', user.id);

      const { data, error: fetchError } = await supabase
        .from('cart')
        .select(`
          id,
          product_id,
          quantity,
          products (*)
        `)
        .eq('user_id', user.id);

      if (fetchError) {
        console.error('❌ Fetch error:', fetchError);
        throw fetchError;
      }

      console.log('📦 Cart data from Supabase:', data);

      if (data && data.length > 0) {
        const items = data.map(item => {
          const product = item.products;
          return {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            description: product.description,
            category: product.category,
            brand: product.brand,
            stock: product.stock,
            rating: product.rating,
            quantity: item.quantity,
            cartId: item.id
          };
        });
        console.log('✅ Setting cart items:', items);
        setCartItems(items);
      } else {
        console.log('⚠️ No cart items found for user:', user.id);
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError(error.message);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ جلب الطلبات من Supabase (مع تخطي الأدمن)
  const fetchOrders = async () => {
    // ✅ لو أدمن (local) مش مسجل في Supabase، اتخطى
    if (!user || user.id?.startsWith('admin-')) {
      setOrders([]);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  // تحميل البيانات عند تسجيل الدخول
  useEffect(() => {
    if (user) {
      fetchCart();
      fetchOrders();
    } else {
      setCartItems([]);
      setOrders([]);
    }
  }, [user]);

  // ✅ إضافة منتج للعربة
  const addToCart = async (product, quantity = 1) => {
    if (!user) {
      return { success: false, error: 'يجب تسجيل الدخول أولاً' };
    }

    // ✅ منع الأدمن من الإضافة
    if (user.id?.startsWith('admin-')) {
      return { success: false, error: 'لا يمكن للأدمن إضافة منتجات للعربة' };
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🛒 Adding to cart - User ID:', user.id);
      console.log('🛒 Product ID:', product.id);
      console.log('🛒 Quantity:', quantity);

      if (product.stock < quantity) {
        throw new Error('المخزون غير كافٍ');
      }

      // ✅ التحقق من وجود المنتج في العربة
      const { data: existing, error: checkError } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // لو الجدول فاضي، يبقى عادي
      }

      if (existing) {
        // ✅ تحديث الكمية
        const newQuantity = existing.quantity + quantity;
        if (product.stock < newQuantity) {
          throw new Error('المخزون غير كافٍ');
        }

        const { error: updateError } = await supabase
          .from('cart')
          .update({ quantity: newQuantity })
          .eq('id', existing.id);

        if (updateError) throw updateError;
        
        console.log('✅ Product quantity updated successfully!');
      } else {
        // ✅ إضافة منتج جديد
        const { error: insertError } = await supabase
          .from('cart')
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity: quantity
          });

        if (insertError) throw insertError;
        
        console.log('✅ New product added to cart successfully!');
      }

      // ✅ جلب العربة مرة أخرى
      await fetchCart();
      setIsCartOpen(true);
      return { success: true, message: 'تمت الإضافة للعربة' };

    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // ✅ تحديث كمية منتج في العربة
  const updateQuantity = async (productId, quantity) => {
    if (!user) {
      return { success: false, error: 'يجب تسجيل الدخول أولاً' };
    }

    // ✅ منع الأدمن
    if (user.id?.startsWith('admin-')) {
      return { success: false, error: 'لا يمكن للأدمن تحديث العربة' };
    }

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

      const { error: updateError } = await supabase
        .from('cart')
        .update({ quantity })
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (updateError) throw updateError;

      await fetchCart();
      return { success: true };

    } catch (error) {
      console.error('Error updating quantity:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // ✅ حذف منتج من العربة
  const removeFromCart = async (productId) => {
    if (!user) {
      return { success: false, error: 'يجب تسجيل الدخول أولاً' };
    }

    // ✅ منع الأدمن
    if (user.id?.startsWith('admin-')) {
      return { success: false, error: 'لا يمكن للأدمن التعديل على العربة' };
    }

    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (deleteError) throw deleteError;

      await fetchCart();
      return { success: true };

    } catch (error) {
      console.error('Error removing from cart:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // ✅ تفريغ العربة بالكامل
  const clearCart = async () => {
    if (!user) {
      return { success: false, error: 'يجب تسجيل الدخول أولاً' };
    }

    // ✅ منع الأدمن
    if (user.id?.startsWith('admin-')) {
      return { success: false, error: 'لا يمكن للأدمن التعديل على العربة' };
    }

    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      setCartItems([]);
      return { success: true };

    } catch (error) {
      console.error('Error clearing cart:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // ✅ إنشاء طلب جديد
  const createOrder = async (orderData) => {
    if (!user) {
      return { success: false, error: 'يجب تسجيل الدخول أولاً' };
    }

    // ✅ منع الأدمن من إنشاء طلبات
    if (user.id?.startsWith('admin-')) {
      return { success: false, error: 'لا يمكن للأدمن إنشاء طلبات' };
    }

    try {
      setLoading(true);
      setError(null);

      const total = getTotalPrice();
      const userId = orderData.userId || user.id;

      const newOrder = {
        id: `ORD-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 1000)}`,
        customer: orderData.customerName || user.user_metadata?.name || 'مستخدم',
        email: orderData.email || user.email,
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
        user_id: userId,
        notes: orderData.notes || '',
        shipping_method: orderData.shippingMethod || 'standard',
        payment_method: orderData.paymentMethod || 'cash'
      };

      const { error: insertError } = await supabase
        .from('orders')
        .insert([newOrder]);

      if (insertError) throw insertError;

      // ✅ تحديث نقاط الولاء (لو مش أدمن)
      if (!user.id?.startsWith('admin-')) {
        await updateUserStats(userId, total);
      }

      // ✅ تفريغ العربة بعد الطلب
      await clearCart();

      // ✅ تحديث قائمة الطلبات
      await fetchOrders();

      return { success: true, order: newOrder };

    } catch (error) {
      console.error('Error creating order:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // ✅ تحديث حالة الطلب
  const updateOrderStatus = async (orderId, newStatus) => {
    // ✅ لو أدمن، اتخطى (مش هيبقى عنده طلبات)
    if (user?.id?.startsWith('admin-')) {
      return { success: false, error: 'لا يمكن للأدمن تحديث الطلبات' };
    }

    try {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // ✅ جلب الطلب لتحديث نقاط الولاء
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderData && newStatus !== 'pending' && newStatus !== 'cancelled') {
        await updateUserStats(orderData.user_id, orderData.total);
      }

      await fetchOrders();
      return { success: true };

    } catch (error) {
      console.error('Error updating order status:', error);
      return { success: false, error: error.message };
    }
  };

  // ✅ حذف طلب
  const deleteOrder = async (orderId) => {
    // ✅ لو أدمن، اتخطى
    if (user?.id?.startsWith('admin-')) {
      return { success: false, error: 'لا يمكن للأدمن حذف الطلبات' };
    }

    try {
      const { error: deleteError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (deleteError) throw deleteError;

      await fetchOrders();
      return { success: true };

    } catch (error) {
      console.error('Error deleting order:', error);
      return { success: false, error: error.message };
    }
  };

  // ✅ جلب كل الطلبات
  const getOrders = () => {
    return orders;
  };

  // ✅ جلب طلبات مستخدم معين
  const getUserOrders = (userId) => {
    return orders.filter(order => order.user_id === userId);
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

  // دمج العربة بعد تسجيل الدخول
  const mergeCart = async () => {
    await fetchCart();
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
