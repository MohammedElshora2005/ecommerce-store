// ecommerce-store/src/utils/validators.js

/**
 * validators.js - دوال التحقق من صحة البيانات (Validation)
 * دوال متخصصة للتحقق من صحة المدخلات في النماذج
 */

// ============================================
// 1. دوال التحقق الأساسية
// ============================================

/**
 * التحقق من أن القيمة غير فارغة
 * @param {*} value - القيمة
 * @param {string} fieldName - اسم الحقل (للرسائل)
 * @returns {object} نتيجة التحقق
 */
export const validateRequired = (value, fieldName = 'الحقل') => {
  if (value === null || value === undefined || value === '') {
    return {
      isValid: false,
      message: `${fieldName} مطلوب`
    };
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    return {
      isValid: false,
      message: `${fieldName} مطلوب`
    };
  }
  
  if (Array.isArray(value) && value.length === 0) {
    return {
      isValid: false,
      message: `${fieldName} مطلوب`
    };
  }
  
  return {
    isValid: true,
    message: null
  };
};

/**
 * التحقق من الحد الأدنى للطول
 * @param {string} value - النص
 * @param {number} min - الحد الأدنى
 * @param {string} fieldName - اسم الحقل
 * @returns {object} نتيجة التحقق
 */
export const validateMinLength = (value, min, fieldName = 'الحقل') => {
  if (!value || typeof value !== 'string') {
    return {
      isValid: false,
      message: `${fieldName} يجب أن يكون ${min} أحرف على الأقل`
    };
  }
  
  if (value.length < min) {
    return {
      isValid: false,
      message: `${fieldName} يجب أن يكون ${min} أحرف على الأقل`
    };
  }
  
  return {
    isValid: true,
    message: null
  };
};

/**
 * التحقق من الحد الأقصى للطول
 * @param {string} value - النص
 * @param {number} max - الحد الأقصى
 * @param {string} fieldName - اسم الحقل
 * @returns {object} نتيجة التحقق
 */
export const validateMaxLength = (value, max, fieldName = 'الحقل') => {
  if (!value || typeof value !== 'string') {
    return {
      isValid: true,
      message: null
    };
  }
  
  if (value.length > max) {
    return {
      isValid: false,
      message: `${fieldName} يجب أن لا يتجاوز ${max} أحرف`
    };
  }
  
  return {
    isValid: true,
    message: null
  };
};

/**
 * التحقق من الطول بين حدين
 * @param {string} value - النص
 * @param {number} min - الحد الأدنى
 * @param {number} max - الحد الأقصى
 * @param {string} fieldName - اسم الحقل
 * @returns {object} نتيجة التحقق
 */
export const validateLength = (value, min, max, fieldName = 'الحقل') => {
  const minCheck = validateMinLength(value, min, fieldName);
  if (!minCheck.isValid) return minCheck;
  
  const maxCheck = validateMaxLength(value, max, fieldName);
  if (!maxCheck.isValid) return maxCheck;
  
  return {
    isValid: true,
    message: null
  };
};

// ============================================
// 2. دوال التحقق من البريد الإلكتروني
// ============================================

/**
 * التحقق من صحة البريد الإلكتروني
 * @param {string} email - البريد الإلكتروني
 * @param {boolean} required - هل الحقل مطلوب
 * @returns {object} نتيجة التحقق
 */
export const validateEmail = (email, required = true) => {
  if (!email || email.trim() === '') {
    if (required) {
      return {
        isValid: false,
        message: 'البريد الإلكتروني مطلوب'
      };
    }
    return {
      isValid: true,
      message: null
    };
  }
  
  // التحقق من صيغة البريد الإلكتروني
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    return {
      isValid: false,
      message: 'البريد الإلكتروني غير صحيح'
    };
  }
  
  // التحقق من طول البريد الإلكتروني
  if (email.length > 254) {
    return {
      isValid: false,
      message: 'البريد الإلكتروني طويل جداً'
    };
  }
  
  return {
    isValid: true,
    message: null
  };
};

// ============================================
// 3. دوال التحقق من كلمة المرور
// ============================================

/**
 * التحقق من صحة كلمة المرور
 * @param {string} password - كلمة المرور
 * @param {object} options - خيارات التحقق
 * @returns {object} نتيجة التحقق
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    maxLength = 32,
    requireUppercase = true,
    requireLowercase = true,
    requireNumber = true,
    requireSpecialChar = true,
    required = true
  } = options;
  
  if (!password || password.trim() === '') {
    if (required) {
      return {
        isValid: false,
        message: 'كلمة المرور مطلوبة'
      };
    }
    return {
      isValid: true,
      message: null
    };
  }
  
  // التحقق من الطول
  if (password.length < minLength) {
    return {
      isValid: false,
      message: `كلمة المرور يجب أن تكون ${minLength} أحرف على الأقل`
    };
  }
  
  if (password.length > maxLength) {
    return {
      isValid: false,
      message: `كلمة المرور يجب أن لا تتجاوز ${maxLength} أحرف`
    };
  }
  
  // التحقق من وجود حرف كبير
  if (requireUppercase && !/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل'
    };
  }
  
  // التحقق من وجود حرف صغير
  if (requireLowercase && !/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل'
    };
  }
  
  // التحقق من وجود رقم
  if (requireNumber && !/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل'
    };
  }
  
  // التحقق من وجود رمز خاص
  if (requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      message: 'كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل'
    };
  }
  
  return {
    isValid: true,
    message: null
  };
};

/**
 * التحقق من تطابق كلمة المرور
 * @param {string} password - كلمة المرور
 * @param {string} confirmPassword - تأكيد كلمة المرور
 * @param {boolean} required - هل الحقل مطلوب
 * @returns {object} نتيجة التحقق
 */
export const validatePasswordMatch = (password, confirmPassword, required = true) => {
  if (!confirmPassword || confirmPassword.trim() === '') {
    if (required) {
      return {
        isValid: false,
        message: 'تأكيد كلمة المرور مطلوب'
      };
    }
    return {
      isValid: true,
      message: null
    };
  }
  
  if (password !== confirmPassword) {
    return {
      isValid: false,
      message: 'كلمة المرور غير متطابقة'
    };
  }
  
  return {
    isValid: true,
    message: null
  };
};

/**
 * التحقق من قوة كلمة المرور وإرجاع تفاصيل
 * @param {string} password - كلمة المرور
 * @returns {object} تفاصيل القوة
 */
export const getPasswordStrength = (password) => {
  if (!password || password.trim() === '') {
    return {
      score: 0,
      strength: 'ضعيف جداً',
      color: 'red',
      percentage: 0,
      checks: {
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false
      },
      isValid: false
    };
  }
  
  const checks = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
  
  const score = Object.values(checks).filter(Boolean).length;
  
  let strength = 'ضعيف جداً';
  let color = 'red';
  let percentage = 0;
  let isValid = false;
  
  if (score === 5) {
    strength = 'قوي جداً';
    color = 'green';
    percentage = 100;
    isValid = true;
  } else if (score >= 4) {
    strength = 'قوي';
    color = 'blue';
    percentage = 80;
    isValid = true;
  } else if (score >= 3) {
    strength = 'متوسط';
    color = 'yellow';
    percentage = 60;
    isValid = false;
  } else if (score >= 2) {
    strength = 'ضعيف';
    color = 'orange';
    percentage = 40;
    isValid = false;
  }
  
  return {
    score,
    strength,
    color,
    percentage,
    checks,
    isValid
  };
};

// ============================================
// 4. دوال التحقق من رقم الهاتف
// ============================================

/**
 * التحقق من صحة رقم الهاتف المصري
 * @param {string} phone - رقم الهاتف
 * @param {boolean} required - هل الحقل مطلوب
 * @returns {object} نتيجة التحقق
 */
export const validateEgyptianPhone = (phone, required = true) => {
  if (!phone || phone.trim() === '') {
    if (required) {
      return {
        isValid: false,
        message: 'رقم الهاتف مطلوب'
      };
    }
    return {
      isValid: true,
      message: null
    };
  }
  
  // إزالة المسافات
  const cleanPhone = phone.replace(/\s/g, '');
  
  // التحقق من الصيغة
  const regex = /^(010|011|012|015)\d{8}$/;
  if (!regex.test(cleanPhone)) {
    return {
      isValid: false,
      message: 'رقم الهاتف غير صحيح (يجب أن يكون 11 رقماً ويبدأ بـ 010, 011, 012, 015)'
    };
  }
  
  return {
    isValid: true,
    message: null
  };
};

/**
 * التحقق من صحة رقم الهاتف الدولي
 * @param {string} phone - رقم الهاتف
 * @param {string} countryCode - كود الدولة (افتراضي: EG)
 * @param {boolean} required - هل الحقل مطلوب
 * @returns {object} نتيجة التحقق
 */
export const validateInternationalPhone = (phone, countryCode = 'EG', required = true) => {
  if (!phone || phone.trim() === '') {
    if (required) {
      return {
        isValid: false,
        message: 'رقم الهاتف مطلوب'
      };
    }
    return {
      isValid: true,
      message: null
    };
  }
  
  const cleanPhone = phone.replace(/\s/g, '');
  
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
    US: /^[0-9]{10}$/,
    UK: /^[0-9]{10,11}$/,
  };
  
  const regex = phoneRegex[countryCode] || /^\+?[0-9]{10,15}$/;
  
  if (!regex.test(cleanPhone)) {
    return {
      isValid: false,
      message: 'رقم الهاتف غير صحيح'
    };
  }
  
  return {
    isValid: true,
    message: null
  };
};

// ============================================
// 5. دوال التحقق من الأرقام
// ============================================

/**
 * التحقق من أن القيمة رقم
 * @param {*} value - القيمة
 * @param {boolean} required - هل الحقل مطلوب
 * @returns {object} نتيجة التحقق
 */
export const validateNumber = (value, required = true) => {
  if (value === null || value === undefined || value === '') {
    if (required) {
      return {
        isValid: false,
        message: 'القيمة مطلوبة'
      };
    }
    return {
      isValid: true,
      message: null
    };
  }
  
  const num = Number(value);
  if (isNaN(num)) {
    return {
      isValid: false,
      message: 'القيمة يجب أن تكون رقماً'
    };
  }
  
  return {
    isValid: true,
    message: null
  };
};

/**
 * التحقق من أن الرقم ضمن نطاق
 * @param {number} value - الرقم
 * @param {number} min - الحد الأدنى
 * @param {number} max - الحد الأقصى
 * @param {boolean} required - هل الحقل مطلوب
 * @returns {object} نتيجة التحقق
 */
export const validateNumberRange = (value, min, max, required = true) => {
  const numCheck = validateNumber(value, required);
  if (!numCheck.isValid) return numCheck;
  
  if (value === null || value === undefined || value === '') {
    return {
      isValid: true,
      message: null
    };
  }
  
  const num = Number(value);
  if (num < min) {
    return {
      isValid: false,
      message: `القيمة يجب أن تكون ${min} على الأقل`
    };
  }
  
  if (num > max) {
    return {
      isValid: false,
      message: `القيمة يجب أن لا تتجاوز ${max}`
    };
  }
  
  return {
    isValid: true,
    message: null
  };
};

// ============================================
// 6. دوال التحقق من النصوص
// ============================================

/**
 * التحقق من أن النص يحتوي على أحرف فقط
 * @param {string} value - النص
 * @param {boolean} allowSpaces - السماح بالمسافات
 * @param {boolean} required - هل الحقل مطلوب
 * @returns {object} نتيجة التحقق
 */
export const validateAlphabetic = (value, allowSpaces = true, required = true) => {
  if (!value || value.trim() === '') {
    if (required) {
      return {
        isValid: false,
        message: 'النص مطلوب'
      };
    }
    return {
      isValid: true,
      message: null
    };
  }
  
  const regex = allowSpaces ? /^[a-zA-Z\u0621-\u064A\s]+$/ : /^[a-zA-Z\u0621-\u064A]+$/;
  if (!regex.test(value)) {
    return {
      isValid: false,
      message: 'يجب أن يحتوي على أحرف فقط'
    };
  }
  
  return {
    isValid: true,
    message: null
  };
};

/**
 * التحقق من أن النص يحتوي على أرقام فقط
 * @param {string} value - النص
 * @param {boolean} required - هل الحقل مطلوب
 * @returns {object} نتيجة التحقق
 */
export const validateNumeric = (value, required = true) => {
  if (!value || value.trim() === '') {
    if (required) {
      return {
        isValid: false,
        message: 'القيمة مطلوبة'
      };
    }
    return {
      isValid: true,
      message: null
    };
  }
  
  if (!/^[0-9]+$/.test(value)) {
    return {
      isValid: false,
      message: 'يجب أن يحتوي على أرقام فقط'
    };
  }
  
  return {
    isValid: true,
    message: null
  };
};

// ============================================
// 7. دوال التحقق من العناوين
// ============================================

/**
 * التحقق من صحة الرمز البريدي المصري
 * @param {string} postalCode - الرمز البريدي
 * @param {boolean} required - هل الحقل مطلوب
 * @returns {object} نتيجة التحقق
 */
export const validateEgyptianPostalCode = (postalCode, required = true) => {
  if (!postalCode || postalCode.trim() === '') {
    if (required) {
      return {
        isValid: false,
        message: 'الرمز البريدي مطلوب'
      };
    }
    return {
      isValid: true,
      message: null
    };
  }
  
  if (!/^[0-9]{5}$/.test(postalCode)) {
    return {
      isValid: false,
      message: 'الرمز البريدي غير صحيح (يجب أن يكون 5 أرقام)'
    };
  }
  
  return {
    isValid: true,
    message: null
  };
};

/**
 * التحقق من صحة الرمز البريدي الدولي
 * @param {string} postalCode - الرمز البريدي
 * @param {string} countryCode - كود الدولة
 * @param {boolean} required - هل الحقل مطلوب
 * @returns {object} نتيجة التحقق
 */
export const validateInternationalPostalCode = (postalCode, countryCode = 'EG', required = true) => {
  if (!postalCode || postalCode.trim() === '') {
    if (required) {
      return {
        isValid: false,
        message: 'الرمز البريدي مطلوب'
      };
    }
    return {
      isValid: true,
      message: null
    };
  }
  
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
    DE: /^[0-9]{5}$/,
    FR: /^[0-9]{5}$/,
    CA: /^[A-Z][0-9][A-Z] ?[0-9][A-Z][0-9]$/,
    AU: /^[0-9]{4}$/,
    NZ: /^[0-9]{4}$/,
  };
  
  const regex = postalRegex[countryCode] || /^[0-9]{5}$/;
  
  if (!regex.test(postalCode.toUpperCase())) {
    return {
      isValid: false,
      message: 'الرمز البريدي غير صحيح'
    };
  }
  
  return {
    isValid: true,
    message: null
  };
};

// ============================================
// 8. دوال التحقق من التواريخ
// ============================================

/**
 * التحقق من صحة التاريخ
 * @param {string} date - التاريخ
 * @param {boolean} required - هل الحقل مطلوب
 * @returns {object} نتيجة التحقق
 */
export const validateDate = (date, required = true) => {
  if (!date || date.trim() === '') {
    if (required) {
      return {
        isValid: false,
        message: 'التاريخ مطلوب'
      };
    }
    return {
      isValid: true,
      message: null
    };
  }
  
  const dateObj = new Date(date);
  if (!(dateObj instanceof Date) || isNaN(dateObj)) {
    return {
      isValid: false,
      message: 'التاريخ غير صحيح'
    };
  }
  
  return {
    isValid: true,
    message: null
  };
};

/**
 * التحقق من أن التاريخ في المستقبل
 * @param {string} date - التاريخ
 * @param {boolean} required - هل الحقل مطلوب
 * @returns {object} نتيجة التحقق
 */
export const validateFutureDate = (date, required = true) => {
  const dateCheck = validateDate(date, required);
  if (!dateCheck.isValid) return dateCheck;
  
  if (!date) return { isValid: true, message: null };
  
  const dateObj = new Date(date);
  const now = new Date();
  
  if (dateObj <= now) {
    return {
      isValid: false,
      message: 'التاريخ يجب أن يكون في المستقبل'
    };
  }
  
  return {
    isValid: true,
    message: null
  };
};

/**
 * التحقق من أن التاريخ في الماضي
 * @param {string} date - التاريخ
 * @param {boolean} required - هل الحقل مطلوب
 * @returns {object} نتيجة التحقق
 */
export const validatePastDate = (date, required = true) => {
  const dateCheck = validateDate(date, required);
  if (!dateCheck.isValid) return dateCheck;
  
  if (!date) return { isValid: true, message: null };
  
  const dateObj = new Date(date);
  const now = new Date();
  
  if (dateObj >= now) {
    return {
      isValid: false,
      message: 'التاريخ يجب أن يكون في الماضي'
    };
  }
  
  return {
    isValid: true,
    message: null
  };
};

// ============================================
// 9. دوال التحقق من النماذج
// ============================================

/**
 * التحقق من نموذج كامل
 * @param {object} data - بيانات النموذج
 * @param {object} validations - قواعد التحقق
 * @returns {object} نتائج التحقق
 */
export const validateForm = (data, validations) => {
  const errors = {};
  let isValid = true;
  
  for (const [field, rules] of Object.entries(validations)) {
    const value = data[field];
    const fieldErrors = [];
    
    for (const rule of rules) {
      const result = rule(value);
      if (!result.isValid) {
        fieldErrors.push(result.message);
        isValid = false;
        break; // توقف عند أول خطأ
      }
    }
    
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors[0];
    }
  }
  
  return {
    isValid,
    errors
  };
};

/**
 * إنشاء قواعد التحقق للحقل
 * @param {Array} rules - مصفوفة دوال التحقق
 * @returns {Function} دالة التحقق
 */
export const composeValidators = (...rules) => {
  return (value) => {
    for (const rule of rules) {
      const result = rule(value);
      if (!result.isValid) {
        return result;
      }
    }
    return {
      isValid: true,
      message: null
    };
  };
};

// ============================================
// 10. دوال مساعدة للتحقق
// ============================================

/**
 * الحصول على رسالة الخطأ من نتيجة التحقق
 * @param {object} validationResult - نتيجة التحقق
 * @returns {string|null} رسالة الخطأ
 */
export const getErrorMessage = (validationResult) => {
  if (!validationResult || validationResult.isValid) {
    return null;
  }
  return validationResult.message;
};

/**
 * التحقق من صحة النموذج وإرجاع رسائل الخطأ
 * @param {object} data - بيانات النموذج
 * @param {object} validations - قواعد التحقق
 * @returns {object} رسائل الخطأ
 */
export const getFormErrors = (data, validations) => {
  const result = validateForm(data, validations);
  return result.errors;
};

export default {
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateLength,
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  getPasswordStrength,
  validateEgyptianPhone,
  validateInternationalPhone,
  validateNumber,
  validateNumberRange,
  validateAlphabetic,
  validateNumeric,
  validateEgyptianPostalCode,
  validateInternationalPostalCode,
  validateDate,
  validateFutureDate,
  validatePastDate,
  validateForm,
  composeValidators,
  getErrorMessage,
  getFormErrors
};