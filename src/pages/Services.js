import React from 'react';
import { useTranslation } from 'react-i18next';

const Services = () => {
  const { t } = useTranslation();

  return (
    <div className="page-container">
      <h1>{t('services.title')}</h1>
      <p>صفحة إدارة الخدمات - قيد الإنشاء</p>
    </div>
  );
};

export default Services;