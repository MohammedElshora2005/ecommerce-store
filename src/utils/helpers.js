// ecommerce-store/src/utils/helpers.js

/**
 * helpers.js - دوال مساعدة للاستخدام العام في المشروع
 */

// ============================================
// 1. دوال تنسيق الأرقام والعملات
// ============================================

/**
 * تنسيق السعر بالجنيه المصري
 * @param {number} price - السعر
 * @param {string} locale - اللغة (افتراضي: ar-EG)
 * @param {string} currency - العملة (افتراضي: EGP)
 * @returns {string} السعر المنسق
 */
export const formatPrice = (price, locale = 'ar-EG', currency = 'EGP') => {
  if (typeof price !== 'number' || isNaN(price)) {
    return '٠ جنيه';
  }
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(price);
};

/**
 * تنسيق الأرقام مع فواصل الآلاف
 * @param {number} number - الرقم
 * @param {string} locale - اللغة (افتراضي: ar-EG)
 * @returns {string} الرقم المنسق
 */
export const formatNumber = (number, locale = 'ar-EG') => {
  if (typeof number !== 'number' || isNaN(number)) {
    return '٠';
  }
  
  return new Intl.NumberFormat(locale).format(number);
};

/**
 * تنسيق النسبة المئوية
 * @param {number} value - القيمة
 * @param {number} decimals - عدد الأرقام العشرية
 * @param {string} locale - اللغة
 * @returns {string} النسبة المئوية المنسقة
 */
export const formatPercentage = (value, decimals = 0, locale = 'ar-EG') => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '٠%';
  }
  
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value / 100);
};

// ============================================
// 2. دوال التواريخ والوقت
// ============================================

/**
 * تنسيق التاريخ
 * @param {string|Date} date - التاريخ
 * @param {string} locale - اللغة (افتراضي: ar-EG)
 * @param {object} options - خيارات التنسيق
 * @returns {string} التاريخ المنسق
 */
export const formatDate = (date, locale = 'ar-EG', options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!(dateObj instanceof Date) || isNaN(dateObj)) {
      return 'تاريخ غير صالح';
    }
    return new Intl.DateTimeFormat(locale, mergedOptions).format(dateObj);
  } catch (error) {
    return 'تاريخ غير صالح';
  }
};

/**
 * تنسيق الوقت
 * @param {string|Date} date - التاريخ
 * @param {string} locale - اللغة (افتراضي: ar-EG)
 * @returns {string} الوقت المنسق
 */
export const formatTime = (date, locale = 'ar-EG') => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!(dateObj instanceof Date) || isNaN(dateObj)) {
      return 'وقت غير صالح';
    }
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  } catch (error) {
    return 'وقت غير صالح';
  }
};

/**
 * حساب الفرق بين تاريخين
 * @param {string|Date} date1 - التاريخ الأول
 * @param {string|Date} date2 - التاريخ الثاني (افتراضي: الآن)
 * @returns {object} الفرق بالأيام والساعات والدقائق
 */
export const getDateDifference = (date1, date2 = new Date()) => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  if (!(d1 instanceof Date) || isNaN(d1) || !(d2 instanceof Date) || isNaN(d2)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  
  const diffMs = Math.abs(d2 - d1);
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  return {
    days: diffDays,
    hours: diffHours % 24,
    minutes: diffMinutes % 60,
    seconds: diffSeconds % 60,
    totalMs: diffMs,
    totalSeconds: diffSeconds,
    totalMinutes: diffMinutes,
    totalHours: diffHours,
    totalDays: diffDays
  };
};

/**
 * الحصول على تاريخ منسق بشكل نسبي (منذ كم يوم)
 * @param {string|Date} date - التاريخ
 * @param {string} locale - اللغة
 * @returns {string} التاريخ النسبي
 */
export const getRelativeTime = (date, locale = 'ar-EG') => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!(dateObj instanceof Date) || isNaN(dateObj)) {
      return 'تاريخ غير صالح';
    }
    
    const rtf = new Intl.RelativeTimeFormatter(locale, { numeric: 'auto' });
    const diff = getDateDifference(dateObj);
    
    if (diff.days > 30) {
      return formatDate(dateObj, locale);
    } else if (diff.days > 0) {
      return rtf.format(-diff.days, 'day');
    } else if (diff.hours > 0) {
      return rtf.format(-diff.hours, 'hour');
    } else if (diff.minutes > 0) {
      return rtf.format(-diff.minutes, 'minute');
    } else {
      return 'الآن';
    }
  } catch (error) {
    return 'تاريخ غير صالح';
  }
};

// ============================================
// 3. دوال التحقق من الصحة (Validation)
// ============================================

/**
 * التحقق من صحة البريد الإلكتروني
 * @param {string} email - البريد الإلكتروني
 * @returns {boolean} صحيح/غير صحيح
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * التحقق من صحة رقم الهاتف المصري
 * @param {string} phone - رقم الهاتف
 * @returns {boolean} صحيح/غير صحيح
 */
export const isValidEgyptianPhone = (phone) => {
  // أرقام مصر: 010, 011, 012, 015 (11 رقم)
  const regex = /^(010|011|012|015)\d{8}$/;
  return regex.test(phone.replace(/\s/g, ''));
};

/**
 * التحقق من صحة رقم الهاتف الدولي
 * @param {string} phone - رقم الهاتف
 * @param {string} countryCode - كود الدولة (افتراضي: EG)
 * @returns {boolean} صحيح/غير صحيح
 */
export const isValidPhone = (phone, countryCode = 'EG') => {
  const phoneRegex = {
    EG: /^(010|011|012|015)\d{8}$/,
    SA: /^(05)\d{8}$/,
    AE: /^(05)\d{8}$/,
    KW: /^(6|9)\d{7}$/,
    QA: /^(3|5|6|7)\d{7}$/,
    OM: /^(7|9)\d{7}$/,
    BH: /^(3|6|9)\d{7}$/,
    JO: /^(7)\d{8}$/,
    LB: /^(7|8)\d{7}$/,
    PS: /^(5)\d{8}$/,
  };
  
  const regex = phoneRegex[countryCode] || /^\+?[0-9]{10,15}$/;
  return regex.test(phone.replace(/\s/g, ''));
};

/**
 * التحقق من قوة كلمة المرور
 * @param {string} password - كلمة المرور
 * @returns {object} نتائج التحقق
 */
export const validatePasswordStrength = (password) => {
  const checks = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
  
  const score = Object.values(checks).filter(Boolean).length;
  
  let strength = 'ضعيف';
  let color = 'red';
  let percentage = 20;
  
  if (score === 5) {
    strength = 'قوي جداً';
    color = 'green';
    percentage = 100;
  } else if (score >= 4) {
    strength = 'قوي';
    color = 'blue';
    percentage = 80;
  } else if (score >= 3) {
    strength = 'متوسط';
    color = 'yellow';
    percentage = 60;
  } else if (score >= 2) {
    strength = 'ضعيف';
    color = 'orange';
    percentage = 40;
  }
  
  return {
    checks,
    score,
    strength,
    color,
    percentage,
    isValid: score >= 4
  };
};

/**
 * التحقق من صحة الرمز البريدي
 * @param {string} postalCode - الرمز البريدي
 * @param {string} countryCode - كود الدولة
 * @returns {boolean} صحيح/غير صحيح
 */
export const isValidPostalCode = (postalCode, countryCode = 'EG') => {
  const postalRegex = {
    EG: /^[0-9]{5}$/,
    SA: /^[0-9]{5}$/,
    AE: /^[0-9]{5}$/,
    KW: /^[0-9]{5}$/,
    QA: /^[0-9]{5}$/,
    OM: /^[0-9]{5}$/,
    BH: /^[0-9]{5}$/,
    US: /^[0-9]{5}(-[0-9]{4})?$/,
    UK: /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/,
  };
  
  const regex = postalRegex[countryCode] || /^[0-9]{5}$/;
  return regex.test(postalCode);
};

// ============================================
// 4. دوال معالجة النصوص
// ============================================

/**
 * اختصار النص
 * @param {string} text - النص
 * @param {number} maxLength - الحد الأقصى
 * @param {string} suffix - اللاحقة
 * @returns {string} النص المختصر
 */
export const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + suffix;
};

/**
 * تحويل النص إلى URL friendly
 * @param {string} text - النص
 * @returns {string} النص المعدل
 */
export const slugify = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\u0621-\u064A\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * تحويل النص إلى أحرف كبيرة مع الحفاظ على العربية
 * @param {string} text - النص
 * @returns {string} النص المعدل
 */
export const capitalize = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * تحويل النص إلى أحرف كبيرة للكلمات
 * @param {string} text - النص
 * @returns {string} النص المعدل
 */
export const capitalizeWords = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text.split(' ').map(word => capitalize(word)).join(' ');
};

/**
 * إزالة التشكيل من النص العربي
 * @param {string} text - النص
 * @returns {string} النص بدون تشكيل
 */
export const removeDiacritics = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  const diacritics = {
    'أ': 'ا', 'إ': 'ا', 'آ': 'ا',
    'ة': 'ه', 'ى': 'ي',
    'ؤ': 'و', 'ئ': 'ي'
  };
  
  return text.replace(/[أإآةىؤئ]/g, match => diacritics[match] || match);
};

// ============================================
// 5. دوال المصفوفات
// ============================================

/**
 * تجزئة المصفوفة إلى مجموعات
 * @param {Array} array - المصفوفة
 * @param {number} size - حجم المجموعة
 * @returns {Array} مصفوفة من المجموعات
 */
export const chunkArray = (array, size) => {
  if (!Array.isArray(array)) return [];
  if (size < 1) return [];
  
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * خلط المصفوفة
 * @param {Array} array - المصفوفة
 * @returns {Array} المصفوفة المخلوطة
 */
export const shuffleArray = (array) => {
  if (!Array.isArray(array)) return [];
  
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * إزالة التكرار من المصفوفة
 * @param {Array} array - المصفوفة
 * @param {string} key - المفتاح (للمصفوفات من الكائنات)
 * @returns {Array} المصفوفة بدون تكرار
 */
export const uniqueArray = (array, key = null) => {
  if (!Array.isArray(array)) return [];
  
  if (key) {
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  }
  
  return [...new Set(array)];
};

/**
 * البحث في المصفوفة
 * @param {Array} array - المصفوفة
 * @param {string} searchTerm - مصطلح البحث
 * @param {string|Array} fields - الحقول للبحث فيها
 * @returns {Array} النتائج
 */
export const searchInArray = (array, searchTerm, fields) => {
  if (!Array.isArray(array) || !searchTerm) return array;
  
  const term = searchTerm.toLowerCase();
  const searchFields = Array.isArray(fields) ? fields : [fields];
  
  return array.filter(item => {
    return searchFields.some(field => {
      const value = item[field];
      if (!value) return false;
      return String(value).toLowerCase().includes(term);
    });
  });
};

// ============================================
// 6. دوال الألوان والعشوائية
// ============================================

/**
 * توليد لون عشوائي
 * @returns {string} اللون العشوائي (hex)
 */
export const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

/**
 * توليد رقم عشوائي
 * @param {number} min - الحد الأدنى
 * @param {number} max - الحد الأقصى
 * @returns {number} الرقم العشوائي
 */
export const getRandomNumber = (min = 0, max = 100) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * توليد معرف عشوائي
 * @param {number} length - طول المعرف
 * @param {string} prefix - بادئة
 * @returns {string} المعرف العشوائي
 */
export const generateId = (length = 8, prefix = '') => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = prefix;
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

// ============================================
// 7. دوال التعامل مع المتصفح
// ============================================

/**
 * التحقق من حالة الاتصال بالإنترنت
 * @returns {boolean} متصل/غير متصل
 */
export const isOnline = () => {
  return navigator.onLine;
};

/**
 * الحصول على معلومات المتصفح
 * @returns {object} معلومات المتصفح
 */
export const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(ua);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua);
  
  let browser = 'Unknown';
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';
  else if (ua.includes('Opera')) browser = 'Opera';
  
  return {
    browser,
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    userAgent: ua
  };
};

/**
 * نسخ النص إلى الحافظة
 * @param {string} text - النص
 * @returns {Promise<boolean>} نجاح/فشل
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};

/**
 * تحميل ملف
 * @param {string} url - رابط الملف
 * @param {string} filename - اسم الملف
 */
export const downloadFile = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ============================================
// 8. دوال متنوعة
// ============================================

/**
 * تأخير تنفيذ الدالة
 * @param {Function} fn - الدالة
 * @param {number} delay - وقت التأخير (مللي ثانية)
 * @returns {Function} الدالة المؤجلة
 */
export const debounce = (fn, delay = 500) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * منع تنفيذ الدالة بشكل متكرر
 * @param {Function} fn - الدالة
 * @param {number} limit - الحد الأقصى لكل فترة
 * @param {number} period - الفترة الزمنية (مللي ثانية)
 * @returns {Function} الدالة المقيدة
 */
export const throttle = (fn, limit = 1000) => {
  let inThrottle = false;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * الحصول على قيمة آمنة من كائن
 * @param {object} obj - الكائن
 * @param {string} path - المسار (مثل: 'user.profile.name')
 * @param {*} defaultValue - القيمة الافتراضية
 * @returns {*} القيمة
 */
export const getSafeValue = (obj, path, defaultValue = null) => {
  try {
    return path.split('.').reduce((current, key) => current?.[key], obj) ?? defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

/**
 * تحويل الكائن إلى Query String
 * @param {object} params - المعاملات
 * @returns {string} Query String
 */
export const toQueryString = (params) => {
  return Object.entries(params)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
};

/**
 * تحويل Query String إلى كائن
 * @param {string} queryString - Query String
 * @returns {object} الكائن
 */
export const fromQueryString = (queryString) => {
  const params = new URLSearchParams(queryString);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
};

export default {
  formatPrice,
  formatNumber,
  formatPercentage,
  formatDate,
  formatTime,
  getDateDifference,
  getRelativeTime,
  isValidEmail,
  isValidEgyptianPhone,
  isValidPhone,
  validatePasswordStrength,
  isValidPostalCode,
  truncateText,
  slugify,
  capitalize,
  capitalizeWords,
  removeDiacritics,
  chunkArray,
  shuffleArray,
  uniqueArray,
  searchInArray,
  getRandomColor,
  getRandomNumber,
  generateId,
  isOnline,
  getBrowserInfo,
  copyToClipboard,
  downloadFile,
  debounce,
  throttle,
  getSafeValue,
  toQueryString,
  fromQueryString
};