import React from 'react';
import { useTranslation } from 'react-i18next';

const Offers = () => {
  const { t } = useTranslation();

  return (
    <div className="page-container">
      <h1>{t('offers.title')}</h1>
      <p>صفحة إدارة العروض - قيد الإنشاء</p>
    </div>
  );
};

export default Offers;