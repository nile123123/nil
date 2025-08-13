import React from 'react';
import { useTranslation } from 'react-i18next';

const Clients = () => {
  const { t } = useTranslation();

  return (
    <div className="page-container">
      <h1>{t('clients.title')}</h1>
      <p>صفحة إدارة العملاء - قيد الإنشاء</p>
    </div>
  );
};

export default Clients;