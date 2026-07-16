// ecommerce-store/src/pages/ProductsPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import ProductList from '../components/products/ProductList';
import ProductFilters from '../components/products/ProductFilters';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { products, getCategories, searchProducts } from '../api/products';
import { 
  FunnelIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [wishlist, setWishlist] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    rating: '',
    inStock: false,
    sortBy: 'newest'
  });

  // جلب التصنيفات والمنتجات
  const categories = useMemo(() => getCategories(), []);
  const brands = useMemo(() => {
    const allBrands = products.map(p => p.brand).filter(Boolean);
    return [...new Set(allBrands)];
  }, []);

  // تحميل المنتجات
  useEffect(() => {
    const fetchProducts = () => {
      setLoading(true);
      try {
        // محاكاة جلب البيانات من API
        setTimeout(() => {
          setAllProducts(products);
          setFilteredProducts(products);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // تحميل المفضلة من localStorage
  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlist(savedWishlist);
  }, []);

  // تطبيق الفلاتر
  useEffect(() => {
    if (allProducts.length === 0) return;

    let result = [...allProducts];

    // بحث
    if (filters.search) {
      result = searchProducts(filters.search);
    }

    // تصنيف
    if (filters.category) {
      result = result.filter(p => p.category === filters.category);
    }

    // ماركة
    if (filters.brand) {
      result = result.filter(p => p.brand === filters.brand);
    }

    // نطاق السعر
    if (filters.minPrice) {
      result = result.filter(p => p.price >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      result = result.filter(p => p.price <= parseFloat(filters.maxPrice));
    }

    // تقييم
    if (filters.rating) {
      result = result.filter(p => p.rating >= parseFloat(filters.rating));
    }

    // المخزون
    if (filters.inStock) {
      result = result.filter(p => p.stock > 0);
    }

    // ترتيب
    switch (filters.sortBy) {
      case 'price_low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
        result.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        break;
      case 'newest':
      default:
        result.sort((a, b) => b.id - a.id);
        break;
    }

    setFilteredProducts(result);
  }, [allProducts, filters]);

  // تحديث الفلاتر من URL
  useEffect(() => {
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    
    if (search) {
      setFilters(prev => ({ ...prev, search }));
    }
    if (category) {
      setFilters(prev => ({ ...prev, category }));
    }
  }, [searchParams]);

  // معالجة تغيير الفلاتر
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    
    // تحديث URL
    const params = {};
    if (newFilters.search) params.search = newFilters.search;
    if (newFilters.category) params.category = newFilters.category;
    setSearchParams(params);
  };

  // إضافة للمفضلة
  const handleToggleWishlist = (productId) => {
    if (!isAuthenticated) {
      // يمكن إضافة رسالة أو توجيه لتسجيل الدخول
      return;
    }

    let newWishlist;
    if (wishlist.includes(productId)) {
      newWishlist = wishlist.filter(id => id !== productId);
    } else {
      newWishlist = [...wishlist, productId];
    }
    
    setWishlist(newWishlist);
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
  };

  // إضافة للعربة
  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      // يمكن إضافة رسالة أو توجيه لتسجيل الدخول
      return;
    }

    await addToCart(product);
  };

  // إعادة تعيين الفلاتر
  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
      inStock: false,
      sortBy: 'newest'
    });
    setSearchParams({});
  };

  // عرض حالة التحميل
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" color="blue" text="جاري تحميل المنتجات..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* عنوان الصفحة */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">جميع المنتجات</h1>
          <p className="text-sm text-gray-500">
            {filteredProducts.length} منتج{filteredProducts.length !== 1 ? 'ات' : ''} متاح
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* زر عرض/إخفاء الفلاتر (للجوال) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FunnelIcon className="h-5 w-5" />
            <span>الفلاتر</span>
            {Object.values(filters).some(v => v && v !== 'newest') && (
              <span className="bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {Object.values(filters).filter(v => v && v !== 'newest').length}
              </span>
            )}
          </button>

          {/* زر إعادة تعيين الفلاتر */}
          {Object.values(filters).some(v => v && v !== 'newest') && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
            >
              <ArrowPathIcon className="h-4 w-4" />
              <span className="hidden sm:inline">إعادة تعيين</span>
            </button>
          )}
        </div>
      </div>

      {/* عرض الفلاتر والمنتجات */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* الفلاتر */}
        <div className={`lg:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <ProductFilters
            categories={categories}
            brands={brands}
            onFilterChange={handleFilterChange}
            initialFilters={filters}
            showSearch={true}
            showCategories={true}
            showBrands={true}
            showPriceRange={true}
            showRating={true}
            showClearAll={true}
          />
        </div>

        {/* قائمة المنتجات */}
        <div className="flex-1">
          <ProductList
            products={filteredProducts}
            loading={loading}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            wishlist={wishlist}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            itemsPerPage={12}
            showPagination={true}
            showViewToggle={true}
            emptyMessage="لا توجد منتجات تطابق معايير البحث"
          />
        </div>
      </div>

      {/* زر إغلاق الفلاتر للجوال */}
      {showFilters && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowFilters(false)}
        />
      )}
      <div
        className={`lg:hidden fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          showFilters ? 'translate-x-0' : 'translate-x-full'
        } overflow-y-auto`}
      >
        <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-medium text-gray-900">الفلاتر</h3>
          <button
            onClick={() => setShowFilters(false)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>
        </div>
        <div className="p-4">
          <ProductFilters
            categories={categories}
            brands={brands}
            onFilterChange={handleFilterChange}
            initialFilters={filters}
            showSearch={true}
            showCategories={true}
            showBrands={true}
            showPriceRange={true}
            showRating={true}
            showClearAll={true}
          />
          <button
            onClick={() => setShowFilters(false)}
            className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            تطبيق الفلاتر
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;