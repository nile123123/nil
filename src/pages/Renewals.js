import React from 'react';
import { useTranslation } from 'react-i18next';

const Renewals = () => {
  const { t } = useTranslation();

  return (
    <div className="page-container">
      <h1>{t('renewals.title')}</h1>
      <p>صفحة إدارة التجديدات - قيد الإنشاء</p>
    </div>
  );
};

export default Renewals;