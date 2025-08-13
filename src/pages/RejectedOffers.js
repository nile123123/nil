import React from 'react';
import { useTranslation } from 'react-i18next';

const RejectedOffers = () => {
  const { t } = useTranslation();

  return (
    <div className="page-container">
      <h1>{t('offers.rejected_offers')}</h1>
      <p>صفحة العروض المرفوضة - قيد الإنشاء</p>
    </div>
  );
};

export default RejectedOffers;