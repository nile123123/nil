import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { changeLanguage, getCurrentLanguage } from '../utils/i18n';

const Settings = () => {
  const { t } = useTranslation();
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
  const [systemSettings, setSystemSettings] = useState({
    companyName: 'مركز النيل للخدمات',
    companyAddress: 'القاهرة، مصر',
    companyPhone: '01234567890',
    companyEmail: 'info@nile-center.com',
    autoBackup: true,
    backupInterval: 'daily',
    notifications: true,
    darkMode: false
  });

  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('system_settings');
      if (savedSettings) {
        setSystemSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('خطأ في تحميل الإعدادات:', error);
    }
  };

  const saveSettings = () => {
    try {
      localStorage.setItem('system_settings', JSON.stringify(systemSettings));
      toast.success('تم حفظ الإعدادات بنجاح');
    } catch (error) {
      console.error('خطأ في حفظ الإعدادات:', error);
      toast.error('فشل في حفظ الإعدادات');
    }
  };

  const handleLanguageChange = (newLang) => {
    changeLanguage(newLang);
    setCurrentLang(newLang);
    toast.success(newLang === 'ar' ? 'تم تغيير اللغة إلى العربية' : 'Language changed to English');
  };

  const handleInputChange = (field, value) => {
    setSystemSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const createBackup = () => {
    try {
      const allData = {
        clients: JSON.parse(localStorage.getItem('clients') || '[]'),
        offers: JSON.parse(localStorage.getItem('offers') || '[]'),
        rejected_offers: JSON.parse(localStorage.getItem('rejected_offers') || '[]'),
        services: JSON.parse(localStorage.getItem('services') || '[]'),
        execution: JSON.parse(localStorage.getItem('execution') || '[]'),
        deliveries: JSON.parse(localStorage.getItem('deliveries') || '[]'),
        accounts: JSON.parse(localStorage.getItem('accounts') || '[]'),
        renewals: JSON.parse(localStorage.getItem('renewals') || '[]'),
        settings: systemSettings,
        backup_date: new Date().toISOString()
      };

      const dataStr = JSON.stringify(allData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nile_center_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success('تم إنشاء النسخة الاحتياطية بنجاح');
    } catch (error) {
      console.error('خطأ في إنشاء النسخة الاحتياطية:', error);
      toast.error('فشل في إنشاء النسخة الاحتياطية');
    }
  };

  const restoreBackup = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target.result);
        
        // التحقق من صحة البيانات
        if (!backupData.backup_date) {
          toast.error('ملف النسخة الاحتياطية غير صحيح');
          return;
        }

        // استعادة البيانات
        const tables = ['clients', 'offers', 'rejected_offers', 'services', 'execution', 'deliveries', 'accounts', 'renewals'];
        tables.forEach(table => {
          if (backupData[table]) {
            localStorage.setItem(table, JSON.stringify(backupData[table]));
          }
        });

        if (backupData.settings) {
          setSystemSettings(backupData.settings);
          localStorage.setItem('system_settings', JSON.stringify(backupData.settings));
        }

        toast.success('تم استعادة النسخة الاحتياطية بنجاح');
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        console.error('خطأ في استعادة النسخة الاحتياطية:', error);
        toast.error('فشل في استعادة النسخة الاحتياطية');
      }
    };
    reader.readAsText(file);
    
    // إعادة تعيين input file
    event.target.value = '';
  };

  const resetFactory = () => {
    try {
      // حذف جميع البيانات
      const tables = ['clients', 'offers', 'rejected_offers', 'services', 'execution', 'deliveries', 'accounts', 'renewals'];
      tables.forEach(table => {
        localStorage.removeItem(table);
      });
      
      // إعادة تعيين الإعدادات
      const defaultSettings = {
        companyName: 'مركز النيل للخدمات',
        companyAddress: 'القاهرة، مصر',
        companyPhone: '01234567890',
        companyEmail: 'info@nile-center.com',
        autoBackup: true,
        backupInterval: 'daily',
        notifications: true,
        darkMode: false
      };
      
      setSystemSettings(defaultSettings);
      localStorage.setItem('system_settings', JSON.stringify(defaultSettings));
      localStorage.removeItem('language');
      
      setShowResetModal(false);
      toast.success('تم إعادة تعيين النظام بنجاح');
      
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('خطأ في إعادة التعيين:', error);
      toast.error('فشل في إعادة تعيين النظام');
    }
  };

  const exportData = () => {
    try {
      const allData = {
        clients: JSON.parse(localStorage.getItem('clients') || '[]'),
        offers: JSON.parse(localStorage.getItem('offers') || '[]'),
        rejected_offers: JSON.parse(localStorage.getItem('rejected_offers') || '[]'),
        services: JSON.parse(localStorage.getItem('services') || '[]'),
        execution: JSON.parse(localStorage.getItem('execution') || '[]'),
        deliveries: JSON.parse(localStorage.getItem('deliveries') || '[]'),
        accounts: JSON.parse(localStorage.getItem('accounts') || '[]'),
        renewals: JSON.parse(localStorage.getItem('renewals') || '[]')
      };

      // تصدير كملف CSV
      let csvContent = '';
      Object.keys(allData).forEach(tableName => {
        csvContent += `\n\n=== ${tableName.toUpperCase()} ===\n`;
        const data = allData[tableName];
        if (data.length > 0) {
          const headers = Object.keys(data[0]);
          csvContent += headers.join(',') + '\n';
          data.forEach(row => {
            const values = headers.map(header => row[header] || '');
            csvContent += values.join(',') + '\n';
          });
        }
      });

      const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nile_center_data_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success('تم تصدير البيانات بنجاح');
    } catch (error) {
      console.error('خطأ في تصدير البيانات:', error);
      toast.error('فشل في تصدير البيانات');
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-title-section">
            <h1>{t('settings.title')}</h1>
            <p>إعدادات النظام والشركة</p>
          </div>
        </div>
      </div>

      <div className="settings-container">
        {/* إعدادات الشركة */}
        <div className="settings-section">
          <div className="section-header">
            <h2>
              <i className="fas fa-building"></i>
              معلومات الشركة
            </h2>
          </div>
          <div className="settings-form">
            <div className="form-grid">
              <div className="form-group">
                <label>اسم الشركة</label>
                <input
                  type="text"
                  value={systemSettings.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>رقم الهاتف</label>
                <input
                  type="tel"
                  value={systemSettings.companyPhone}
                  onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                />
              </div>
              <div className="form-group full-width">
                <label>العنوان</label>
                <input
                  type="text"
                  value={systemSettings.companyAddress}
                  onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                />
              </div>
              <div className="form-group full-width">
                <label>البريد الإلكتروني</label>
                <input
                  type="email"
                  value={systemSettings.companyEmail}
                  onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                />
              </div>
            </div>
            <button className="btn btn-primary" onClick={saveSettings}>
              <i className="fas fa-save"></i>
              حفظ معلومات الشركة
            </button>
          </div>
        </div>

        {/* إعدادات اللغة */}
        <div className="settings-section">
          <div className="section-header">
            <h2>
              <i className="fas fa-language"></i>
              إعدادات اللغة
            </h2>
          </div>
          <div className="language-settings">
            <div className="language-options">
              <button
                className={`language-option ${currentLang === 'ar' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('ar')}
              >
                <i className="fas fa-globe"></i>
                العربية
              </button>
              <button
                className={`language-option ${currentLang === 'en' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('en')}
              >
                <i className="fas fa-globe"></i>
                English
              </button>
            </div>
          </div>
        </div>

        {/* إعدادات النظام */}
        <div className="settings-section">
          <div className="section-header">
            <h2>
              <i className="fas fa-cogs"></i>
              إعدادات النظام
            </h2>
          </div>
          <div className="system-settings">
            <div className="setting-item">
              <div className="setting-info">
                <h4>النسخ الاحتياطي التلقائي</h4>
                <p>إنشاء نسخ احتياطية تلقائية من البيانات</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={systemSettings.autoBackup}
                  onChange={(e) => handleInputChange('autoBackup', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>الإشعارات</h4>
                <p>عرض إشعارات النظام والتذكيرات</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={systemSettings.notifications}
                  onChange={(e) => handleInputChange('notifications', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>تكرار النسخ الاحتياطي</h4>
                <p>تحديد موعد إنشاء النسخ الاحتياطية</p>
              </div>
              <select
                value={systemSettings.backupInterval}
                onChange={(e) => handleInputChange('backupInterval', e.target.value)}
                className="setting-select"
              >
                <option value="daily">يومياً</option>
                <option value="weekly">أسبوعياً</option>
                <option value="monthly">شهرياً</option>
              </select>
            </div>
          </div>
        </div>

        {/* إدارة البيانات */}
        <div className="settings-section">
          <div className="section-header">
            <h2>
              <i className="fas fa-database"></i>
              إدارة البيانات
            </h2>
          </div>
          <div className="data-management">
            <div className="data-actions">
              <button className="btn btn-success" onClick={createBackup}>
                <i className="fas fa-download"></i>
                إنشاء نسخة احتياطية
              </button>
              
              <label className="btn btn-warning file-input-label">
                <i className="fas fa-upload"></i>
                استعادة نسخة احتياطية
                <input
                  type="file"
                  accept=".json"
                  onChange={restoreBackup}
                  style={{ display: 'none' }}
                />
              </label>

              <button className="btn btn-info" onClick={exportData}>
                <i className="fas fa-file-export"></i>
                تصدير البيانات (CSV)
              </button>

              <button 
                className="btn btn-danger"
                onClick={() => setShowResetModal(true)}
              >
                <i className="fas fa-exclamation-triangle"></i>
                إعادة تعيين المصنع
              </button>
            </div>
          </div>
        </div>

        {/* معلومات النظام */}
        <div className="settings-section">
          <div className="section-header">
            <h2>
              <i className="fas fa-info-circle"></i>
              معلومات النظام
            </h2>
          </div>
          <div className="system-info">
            <div className="info-grid">
              <div className="info-item">
                <label>نسخة النظام:</label>
                <span>1.0.0</span>
              </div>
              <div className="info-item">
                <label>تاريخ التطوير:</label>
                <span>{new Date().getFullYear()}</span>
              </div>
              <div className="info-item">
                <label>المطور:</label>
                <span>مركز النيل للخدمات</span>
              </div>
              <div className="info-item">
                <label>نوع قاعدة البيانات:</label>
                <span>LocalStorage</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* نموذج تأكيد إعادة التعيين */}
      {showResetModal && (
        <div className="modal-overlay" onClick={() => setShowResetModal(false)}>
          <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>تأكيد إعادة تعيين المصنع</h3>
              <button 
                className="modal-close"
                onClick={() => setShowResetModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="reset-warning">
                <i className="fas fa-exclamation-triangle"></i>
                <h4>تحذير!</h4>
                <p>
                  سيتم حذف جميع البيانات والإعدادات بشكل نهائي.
                  هذا الإجراء لا يمكن التراجع عنه.
                </p>
                <p className="warning-text">
                  تأكد من إنشاء نسخة احتياطية قبل المتابعة.
                </p>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowResetModal(false)}
              >
                إلغاء
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={resetFactory}
              >
                <i className="fas fa-trash"></i>
                إعادة تعيين المصنع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;