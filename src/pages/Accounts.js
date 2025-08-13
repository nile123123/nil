import React from 'react';
import { useTranslation } from 'react-i18next';

const Accounts = () => {
  const { t } = useTranslation();

  return (
    <div className="page-container">
      <h1>{t('accounts.title')}</h1>
      <p>صفحة إدارة الحسابات - قيد الإنشاء</p>
    </div>
  );
};

export default Accounts;