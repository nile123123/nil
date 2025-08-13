import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// استيراد ملفات الترجمة
import arCommon from '../locales/ar/common.json';
import enCommon from '../locales/en/common.json';

// إعداد الموارد
const resources = {
  ar: {
    common: arCommon
  },
  en: {
    common: enCommon
  }
};

// تهيئة i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'ar', // اللغة الافتراضية العربية
    fallbackLng: 'ar', // لغة احتياطية
    debug: process.env.NODE_ENV === 'development',
    
    // مساحة الأسماء الافتراضية
    defaultNS: 'common',
    
    interpolation: {
      escapeValue: false // React بالفعل آمن من XSS
    },
    
    // إعدادات الاتجاه
    rtl: true,
    
    // حفظ اللغة في التخزين المحلي
    detection: {
      order: ['localStorage'],
      caches: ['localStorage']
    }
  });

// دالة لتغيير اللغة
export const changeLanguage = (lng) => {
  i18n.changeLanguage(lng);
  localStorage.setItem('language', lng);
  
  // تحديث اتجاه الصفحة
  const htmlElement = document.documentElement;
  const bodyElement = document.body;
  
  if (lng === 'ar') {
    htmlElement.setAttribute('dir', 'rtl');
    htmlElement.setAttribute('lang', 'ar');
    bodyElement.classList.add('rtl');
    bodyElement.classList.remove('ltr');
    bodyElement.classList.add('arabic-text');
    bodyElement.classList.remove('english-text');
  } else {
    htmlElement.setAttribute('dir', 'ltr');
    htmlElement.setAttribute('lang', 'en');
    bodyElement.classList.add('ltr');
    bodyElement.classList.remove('rtl');
    bodyElement.classList.add('english-text');
    bodyElement.classList.remove('arabic-text');
  }
};

// دالة للحصول على اللغة الحالية
export const getCurrentLanguage = () => i18n.language;

// دالة للحصول على اتجاه النص
export const getDirection = () => i18n.language === 'ar' ? 'rtl' : 'ltr';

// دالة للحصول على الترجمة
export const t = (key, options) => i18n.t(key, options);

// تطبيق الاتجاه الأولي
changeLanguage(i18n.language);

export default i18n;