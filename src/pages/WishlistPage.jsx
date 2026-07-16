// ecommerce-store/src/pages/WishlistPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { supabase } from '../lib/supabase';
import {
  HeartIcon,
  HeartIcon as HeartSolidIcon,
  ShoppingCartIcon,
  ArrowLeftIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const WishlistPage = () => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ جلب المنتجات من Supabase حسب الـ wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const saved = localStorage.getItem('wishlist');
        if (!saved) {
          setWishlist([]);
          setLoading(false);
          return;
        }

        const wishlistIds = JSON.parse(saved);
        if (wishlistIds.length === 0) {
          setWishlist([]);
          setLoading(false);
          return;
        }

        // ✅ جلب المنتجات من Supabase
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .in('id', wishlistIds);

        if (error) throw error;
        setWishlist(data || []);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        toast.error('❌ حدث خطأ أثناء تحميل المفضلة');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [isAuthenticated]);

  // ✅ إزالة من المفضلة
  const removeFromWishlist = (productId) => {
    const newWishlist = wishlist.filter(item => item.id !== productId);
    setWishlist(newWishlist);
    localStorage.setItem('wishlist', JSON.stringify(newWishlist.map(item => item.id)));
    toast.info('🗑️ تم إزالة المنتج من المفضلة');
  };

  // إضافة للعربة
  const handleAddToCart = async (product) => {
    const result = await addToCart(product);
    if (result.success) {
      toast.success('✅ تم إضافة المنتج للعربة');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-gray-500 mt-2">جاري تحميل المفضلة...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* عنوان الصفحة */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">❤️ المفضلة</h1>
          <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
            {wishlist.length} منتج
          </span>
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <HeartIcon className="h-24 w-24 mx-auto" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">المفضلة فارغة</h2>
            <p className="text-gray-600 mb-6">لم تقم بإضافة أي منتجات إلى المفضلة بعد.</p>
            <Link
              to="/products"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              استعراض المنتجات
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
                <Link to={`/product/${product.id}`}>
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    <img
                      src={product.image || `https://picsum.photos/seed/${product.id}/400/400`}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => e.target.src = `https://picsum.photos/seed/${product.id}/400/400`}
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-lg font-bold text-blue-600 mt-1">{formatPrice(product.price)}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-1"
                    >
                      <ShoppingCartIcon className="h-4 w-4" />
                      إضافة للعربة
                    </button>
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
