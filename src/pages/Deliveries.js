import React from 'react';
import { useTranslation } from 'react-i18next';

const Deliveries = () => {
  const { t } = useTranslation();

  return (
    <div className="page-container">
      <h1>{t('deliveries.title')}</h1>
      <p>صفحة إدارة التسليمات - قيد الإنشاء</p>
    </div>
  );
};

export default Deliveries;