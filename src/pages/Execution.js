import React from 'react';
import { useTranslation } from 'react-i18next';

const Execution = () => {
  const { t } = useTranslation();

  return (
    <div className="page-container">
      <h1>{t('execution.title')}</h1>
      <p>صفحة التنفيذ والمعاينة - قيد الإنشاء</p>
    </div>
  );
};

export default Execution;