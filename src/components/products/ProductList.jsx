// ecommerce-store/src/components/products/ProductList.jsx

import React, { useState, useEffect, useMemo } from 'react';
import ProductCard from './ProductCard';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';

const ProductList = ({
  products = [],
  loading = false,
  error = null,
  onAddToCart,
  onToggleWishlist,
  wishlist = [],
  viewMode = 'grid',
  onViewModeChange,
  itemsPerPage = 12,
  showPagination = true,
  showViewToggle = true,
  emptyMessage = 'لا توجد منتجات',
  className = '',
  variant = 'default'
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentViewMode, setCurrentViewMode] = useState(viewMode);

  // حساب عدد الصفحات
  const totalPages = Math.ceil(products.length / itemsPerPage);

  // الحصول على منتجات الصفحة الحالية
  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return products.slice(startIndex, endIndex);
  }, [products, currentPage, itemsPerPage]);

  // إعادة تعيين الصفحة عند تغيير المنتجات
  useEffect(() => {
    setCurrentPage(1);
  }, [products]);

  // تغيير الصفحة
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // التمرير لأعلى الصفحة
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // تغيير وضع العرض
  const handleViewModeChange = (mode) => {
    setCurrentViewMode(mode);
    onViewModeChange && onViewModeChange(mode);
  };

  // عرض حالة التحميل
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" color="blue" text="جاري تحميل المنتجات..." />
      </div>
    );
  }

  // عرض حالة الخطأ
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">حدث خطأ</h3>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  // عرض حالة عدم وجود منتجات
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{emptyMessage}</h3>
        <p className="text-gray-600">حاول تغيير الفلاتر أو البحث عن كلمات أخرى</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* شريط التحكم العلوي */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        {/* معلومات عدد المنتجات */}
        <div className="text-sm text-gray-600">
          عرض {currentProducts.length} من {products.length} منتج
          {currentPage > 1 && ` (الصفحة ${currentPage} من ${totalPages})`}
        </div>

        {/* أزرار التحكم في العرض */}
        {showViewToggle && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleViewModeChange('grid')}
              className={`p-2 rounded-lg transition-colors ${
                currentViewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              aria-label="عرض شبكي"
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleViewModeChange('list')}
              className={`p-2 rounded-lg transition-colors ${
                currentViewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              aria-label="عرض قائمة"
            >
              <ListBulletIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* عرض المنتجات */}
      <div className={currentViewMode === 'grid' 
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
        : 'space-y-4'
      }>
        {currentProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onToggleWishlist={onToggleWishlist}
            isWishlisted={wishlist.includes(product.id)}
            variant={currentViewMode === 'list' ? 'compact' : variant}
            showQuickView={true}
          />
        ))}
      </div>

      {/* الترقيم (Pagination) */}
      {showPagination && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          {/* زر السابق */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg transition-colors ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            aria-label="الصفحة السابقة"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>

          {/* أرقام الصفحات */}
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                // عرض الصفحات القريبة من الصفحة الحالية
                const diff = Math.abs(page - currentPage);
                return diff <= 2 || page === 1 || page === totalPages;
              })
              .map((page, index, array) => {
                // إضافة علامة الحذف (...)
                if (index > 0 && array[index - 1] !== page - 1) {
                  return (
                    <span key={`ellipsis-${page}`} className="px-2 py-2 text-gray-400">
                      ...
                    </span>
                  );
                }
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-lg transition-colors ${
                      page === currentPage
                        ? 'bg-blue-600 text-white font-medium'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
          </div>

          {/* زر التالي */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg transition-colors ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            aria-label="الصفحة التالية"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* معلومات إضافية في الأسفل */}
      {showPagination && totalPages > 1 && (
        <div className="text-center text-sm text-gray-500 mt-4">
          صفحة {currentPage} من {totalPages}
        </div>
      )}
    </div>
  );
};

// مكون لعرض المنتجات بشكل شبكي (Grid)
export const ProductGridView = (props) => (
  <ProductList {...props} viewMode="grid" />
);

// مكون لعرض المنتجات بشكل قائمة (List)
export const ProductListView = (props) => (
  <ProductList {...props} viewMode="list" variant="compact" />
);

export default ProductList;