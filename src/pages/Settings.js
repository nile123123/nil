import React from 'react';
import { useTranslation } from 'react-i18next';

const Settings = () => {
  const { t } = useTranslation();

  return (
    <div className="page-container">
      <h1>{t('settings.title')}</h1>
      <p>صفحة إعدادات النظام - قيد الإنشاء</p>
    </div>
  );
};

export default Settings;