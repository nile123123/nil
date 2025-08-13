import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// إنشاء الجذر الأساسي للتطبيق
const root = ReactDOM.createRoot(document.getElementById('root'));

// تقديم التطبيق
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);