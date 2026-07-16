// ecommerce-store/src/hooks/useCart.js

import { useContext } from 'react';
import CartContext from '../context/CartContext';

/**
 * Hook مخصص للتعامل مع عربة التسوق
 * يوفر واجهة مبسطة للوصول إلى حالة العربة ووظائفها
 */
export const useCart = () => {
  const context = useContext(CartContext);
  
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
};

/**
 * Hook للحصول على جميع منتجات العربة
 */
export const useCartItems = () => {
  const { cartItems } = useCart();
  return cartItems;
};

/**
 * Hook للحصول على عدد المنتجات في العربة
 */
export const useCartCount = () => {
  const { getTotalItems } = useCart();
  return getTotalItems();
};

/**
 * Hook للحصول على إجمالي سعر العربة
 */
export const useCartTotal = () => {
  const { getTotalPrice } = useCart();
  return getTotalPrice();
};

/**
 * Hook للتحقق من وجود منتج في العربة
 */
export const useIsInCart = (productId) => {
  const { isInCart } = useCart();
  return isInCart(productId);
};

/**
 * Hook للحصول على كمية منتج معين في العربة
 */
export const useItemQuantity = (productId) => {
  const { getItemQuantity } = useCart();
  return getItemQuantity(productId);
};

/**
 * Hook لإضافة منتج للعربة
 */
export const useAddToCart = () => {
  const { addToCart } = useCart();
  return { addToCart };
};

/**
 * Hook لتحديث كمية منتج في العربة
 */
export const useUpdateQuantity = () => {
  const { updateQuantity } = useCart();
  return { updateQuantity };
};

/**
 * Hook لحذف منتج من العربة
 */
export const useRemoveFromCart = () => {
  const { removeFromCart } = useCart();
  return { removeFromCart };
};

/**
 * Hook لتفريغ العربة بالكامل
 */
export const useClearCart = () => {
  const { clearCart } = useCart();
  return { clearCart };
};

/**
 * Hook للتحكم في فتح/إغلاق العربة
 */
export const useCartToggle = () => {
  const { isCartOpen, setIsCartOpen } = useCart();
  return { isCartOpen, setIsCartOpen };
};

/**
 * Hook لحالة التحميل
 */
export const useCartLoading = () => {
  const { loading } = useCart();
  return loading;
};

/**
 * Hook لرسالة الخطأ
 */
export const useCartError = () => {
  const { error } = useCart();
  return error;
};

/**
 * Hook متكامل يحتوي على كل وظائف العربة
 * مناسب للاستخدام في الصفحات التي تحتاج إلى كل الوظائف
 */
export const useFullCart = () => {
  const cart = useCart();
  return {
    // الحالة
    cartItems: cart.cartItems,
    loading: cart.loading,
    error: cart.error,
    isCartOpen: cart.isCartOpen,
    
    // الإحصائيات
    totalItems: cart.getTotalItems(),
    totalPrice: cart.getTotalPrice(),
    
    // الوظائف
    addToCart: cart.addToCart,
    updateQuantity: cart.updateQuantity,
    removeFromCart: cart.removeFromCart,
    clearCart: cart.clearCart,
    setIsCartOpen: cart.setIsCartOpen,
    mergeCart: cart.mergeCart,
    fetchCart: cart.fetchCart,
    
    // المساعدين
    isInCart: cart.isInCart,
    getItemQuantity: cart.getItemQuantity
  };
};

export default useCart;