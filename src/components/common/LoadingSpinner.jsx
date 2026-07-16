// ecommerce-store/src/components/common/LoadingSpinner.jsx

import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'blue',
  fullScreen = false,
  text = '',
  variant = 'default'
}) => {
  // تحديد حجم الـ Spinner
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  };

  // تحديد ألوان الـ Spinner
  const colorClasses = {
    blue: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-600',
    green: 'text-green-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600'
  };

  // تحديد الأنماط المختلفة
  const variantStyles = {
    default: {
      spinner: 'animate-spin',
      container: 'flex flex-col items-center justify-center gap-4'
    },
    dots: {
      spinner: 'flex gap-2',
      container: 'flex flex-col items-center justify-center gap-4'
    },
    pulse: {
      spinner: 'animate-pulse',
      container: 'flex flex-col items-center justify-center gap-4'
    },
    bar: {
      spinner: 'w-full max-w-xs',
      container: 'flex flex-col items-center justify-center gap-4 w-full'
    }
  };

  // Spinner على شكل نقاط
  const DotsSpinner = () => (
    <div className="flex gap-2">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce`}
          style={{ animationDelay: `${index * 0.15}s` }}
        />
      ))}
    </div>
  );

  // Spinner على شكل شريط تقدم
  const BarSpinner = () => (
    <div className="w-full max-w-xs">
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClasses[color]} rounded-full animate-pulse`}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );

  // Spinner دائري
  const DefaultSpinner = () => (
    <svg
      className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  // Spinner على شكل نبض
  const PulseSpinner = () => (
    <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-ping`} />
  );

  // عرض الـ Spinner المناسب حسب النوع
  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return <DotsSpinner />;
      case 'bar':
        return <BarSpinner />;
      case 'pulse':
        return <PulseSpinner />;
      default:
        return <DefaultSpinner />;
    }
  };

  // إذا كان fullScreen، نضيف خلفية شفافة ونعرض في المنتصف
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 shadow-2xl">
          <div className={variantStyles[variant].container}>
            {renderSpinner()}
            {text && (
              <p className={`text-sm font-medium text-gray-700 ${variant === 'bar' ? 'w-full text-center' : ''}`}>
                {text}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Spinner عادي (غير fullScreen)
  return (
    <div className={variantStyles[variant].container}>
      {renderSpinner()}
      {text && (
        <p className={`text-sm font-medium text-gray-600 ${variant === 'bar' ? 'w-full text-center' : ''}`}>
          {text}
        </p>
      )}
    </div>
  );
};

// مكونات مساعدة للاستخدام السريع
export const SmallSpinner = (props) => (
  <LoadingSpinner {...props} size="sm" />
);

export const LargeSpinner = (props) => (
  <LoadingSpinner {...props} size="lg" />
);

export const FullScreenSpinner = (props) => (
  <LoadingSpinner {...props} fullScreen={true} />
);

export const ButtonSpinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export default LoadingSpinner;