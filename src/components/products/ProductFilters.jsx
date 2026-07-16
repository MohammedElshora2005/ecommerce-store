// ecommerce-store/src/components/products/ProductFilters.jsx

import React, { useState, useEffect, useRef } from 'react';
import {
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const ProductFilters = ({
  categories = [],
  brands = [],
  onFilterChange,
  initialFilters = {},
  showSearch = true,
  showCategories = true,
  showBrands = true,
  showPriceRange = true,
  showRating = true,
  showClearAll = true,
  className = ''
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    rating: '',
    inStock: false,
    sortBy: 'newest',
    ...initialFilters
  });

  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    brands: true,
    price: true,
    rating: true,
    stock: true
  });

  const mobileMenuRef = useRef(null);

  // خيارات الترتيب
  const sortOptions = [
    { value: 'newest', label: 'الأحدث' },
    { value: 'price_low', label: 'السعر: من الأقل للأعلى' },
    { value: 'price_high', label: 'السعر: من الأعلى للأقل' },
    { value: 'rating', label: 'التقييم الأعلى' },
    { value: 'popular', label: 'الأكثر شهرة' }
  ];

  // خيارات التقييم
  const ratingOptions = [
    { value: '4', label: '4 نجوم فأكثر' },
    { value: '3', label: '3 نجوم فأكثر' },
    { value: '2', label: 'نجمتان فأكثر' },
    { value: '1', label: 'نجمة فأكثر' }
  ];

  // التحقق من وجود فلاتر مفعلة
  const hasActiveFilters = () => {
    const { search, category, brand, minPrice, maxPrice, rating, inStock, sortBy } = filters;
    return search || category || brand || minPrice || maxPrice || rating || inStock || sortBy !== 'newest';
  };

  // عدد الفلاتر النشطة
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category) count++;
    if (filters.brand) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.rating) count++;
    if (filters.inStock) count++;
    if (filters.sortBy !== 'newest') count++;
    return count;
  };

  // تغيير فلتر
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange && onFilterChange(newFilters);
  };

  // مسح كل الفلاتر
  const handleClearAll = () => {
    const resetFilters = {
      search: '',
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
      inStock: false,
      sortBy: 'newest'
    };
    setFilters(resetFilters);
    onFilterChange && onFilterChange(resetFilters);
  };

  // مسح فلتر معين
  const handleClearFilter = (key) => {
    const resetValue = key === 'inStock' ? false : '';
    const newFilters = { ...filters, [key]: resetValue };
    setFilters(newFilters);
    onFilterChange && onFilterChange(newFilters);
  };

  // تبديل عرض القسم
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // إغلاق القائمة عند الضغط خارجها (للجوال)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // عرض الفلتر
  const FilterSection = ({ title, section, children }) => (
    <div className="border-b border-gray-200 last:border-b-0 py-4">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between text-right group"
      >
        <span className="font-medium text-gray-900">{title}</span>
        {expandedSections[section] ? (
          <ChevronUpIcon className="h-5 w-5 text-gray-500 group-hover:text-gray-700" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-500 group-hover:text-gray-700" />
        )}
      </button>
      {expandedSections[section] && (
        <div className="mt-3">
          {children}
        </div>
      )}
    </div>
  );

  // عرض الفلاتر (داخل الجوال أو الديسكتوب)
  const FiltersContent = () => (
    <div className="space-y-2">
      {/* البحث */}
      {showSearch && (
        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="بحث عن منتج..."
            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {filters.search && (
            <button
              onClick={() => handleClearFilter('search')}
              className="absolute inset-y-0 left-0 pl-3 flex items-center"
            >
              <XCircleIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      )}

      {/* الترتيب */}
      <FilterSection title="الترتيب حسب" section="sort">
        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FilterSection>

      {/* التصنيفات */}
      {showCategories && categories.length > 0 && (
        <FilterSection title="التصنيفات" section="categories">
          <div className="space-y-2">
            <button
              onClick={() => handleFilterChange('category', '')}
              className={`w-full text-right px-3 py-1.5 rounded-lg transition-colors ${
                !filters.category ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              الكل
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => handleFilterChange('category', category)}
                className={`w-full text-right px-3 py-1.5 rounded-lg transition-colors ${
                  filters.category === category ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {category}
                {filters.category === category && (
                  <span className="mr-2 text-blue-600">✓</span>
                )}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* الماركات */}
      {showBrands && brands.length > 0 && (
        <FilterSection title="الماركات" section="brands">
          <div className="space-y-2">
            <button
              onClick={() => handleFilterChange('brand', '')}
              className={`w-full text-right px-3 py-1.5 rounded-lg transition-colors ${
                !filters.brand ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              الكل
            </button>
            {brands.map(brand => (
              <button
                key={brand}
                onClick={() => handleFilterChange('brand', brand)}
                className={`w-full text-right px-3 py-1.5 rounded-lg transition-colors ${
                  filters.brand === brand ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {brand}
                {filters.brand === brand && (
                  <span className="mr-2 text-blue-600">✓</span>
                )}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* نطاق السعر */}
      {showPriceRange && (
        <FilterSection title="نطاق السعر" section="price">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">من</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">إلى</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  placeholder="10000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
            {(filters.minPrice || filters.maxPrice) && (
              <button
                onClick={() => {
                  handleFilterChange('minPrice', '');
                  handleFilterChange('maxPrice', '');
                }}
                className="text-xs text-red-600 hover:text-red-800"
              >
                مسح نطاق السعر
              </button>
            )}
          </div>
        </FilterSection>
      )}

      {/* التقييم */}
      {showRating && (
        <FilterSection title="التقييم" section="rating">
          <div className="space-y-2">
            <button
              onClick={() => handleFilterChange('rating', '')}
              className={`w-full text-right px-3 py-1.5 rounded-lg transition-colors ${
                !filters.rating ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              الكل
            </button>
            {ratingOptions.map(option => (
              <button
                key={option.value}
                onClick={() => handleFilterChange('rating', option.value)}
                className={`w-full text-right px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${
                  filters.rating === option.value ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon 
                      key={i} 
                      className={`h-4 w-4 ${i < parseInt(option.value) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm">{option.label}</span>
                {filters.rating === option.value && (
                  <span className="mr-auto text-blue-600">✓</span>
                )}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* المخزون */}
      <FilterSection title="المخزون" section="stock">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => handleFilterChange('inStock', e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">المنتجات المتوفرة فقط</span>
        </label>
      </FilterSection>

      {/* أزرار الإجراءات */}
      <div className="pt-4 flex flex-col gap-2">
        {showClearAll && hasActiveFilters() && (
          <button
            onClick={handleClearAll}
            className="w-full py-2 px-4 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
          >
            مسح كل الفلاتر ({getActiveFiltersCount()})
          </button>
        )}
        
        {/* زر إغلاق للجوال */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          تطبيق الفلاتر
        </button>
      </div>
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      {/* زر فتح الفلاتر للجوال */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed bottom-4 right-4 z-40 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <FunnelIcon className="h-6 w-6" />
        {getActiveFiltersCount() > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
            {getActiveFiltersCount()}
          </span>
        )}
      </button>

      {/* الفلاتر للديسكتوب */}
      <div className="hidden md:block">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-600" />
              <h3 className="font-medium text-gray-900">الفلاتر</h3>
            </div>
            {showClearAll && hasActiveFilters() && (
              <button
                onClick={handleClearAll}
                className="text-xs text-red-600 hover:text-red-800"
              >
                مسح الكل
              </button>
            )}
          </div>
          <FiltersContent />
        </div>
      </div>

      {/* الفلاتر للجوال (Sidebar) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden">
          <div 
            ref={mobileMenuRef}
            className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-2xl overflow-y-auto transform transition-transform duration-300"
          >
            {/* رأس الفلاتر للجوال */}
            <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-600" />
                <h3 className="font-medium text-gray-900">الفلاتر</h3>
                {getActiveFiltersCount() > 0 && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            {/* محتوى الفلاتر للجوال */}
            <div className="p-4">
              <FiltersContent />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// استيراد StarIcon للاستخدام في الفلاتر
import { StarIcon } from '@heroicons/react/24/solid';

export default ProductFilters;