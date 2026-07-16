// ecommerce-store/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import './styles/dark-mode.css'; // ✅ استيراد ملف الوضع المظلم

// نقطة الدخول الرئيسية للتطبيق
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element. Please check your index.html file.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('🚀 App initialized successfully!');