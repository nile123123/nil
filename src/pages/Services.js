import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import databaseService from '../utils/database-service';

const Services = () => {
  const { t } = useTranslation();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showExecutionModal, setShowExecutionModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // تحميل الخدمات عند تحميل الصفحة
  useEffect(() => {
    loadServices();
  }, []);

  // البحث في الخدمات
  useEffect(() => {
    if (searchTerm) {
      const filtered = services.filter(service =>
        service.service_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.company_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.service_amount?.toString().includes(searchTerm)
      );
      setFilteredServices(filtered);
    } else {
      setFilteredServices(services);
    }
  }, [searchTerm, services]);

  // تحميل الخدمات
  const loadServices = async () => {
    try {
      setLoading(true);
      const servicesList = await databaseService.getServices();
      setServices(servicesList);
      setFilteredServices(servicesList);
    } catch (error) {
      console.error('خطأ في تحميل الخدمات:', error);
      toast.error('فشل في تحميل الخدمات');
    } finally {
      setLoading(false);
    }
  };

  // تأكيد إرسال للتنفيذ
  const confirmSendToExecution = (service) => {
    setSelectedService(service);
    setShowExecutionModal(true);
  };

  // إرسال الخدمة للتنفيذ
  const handleSendToExecution = async () => {
    if (!selectedService) return;

    try {
      await databaseService.sendServiceToExecution(selectedService.id);
      toast.success('تم إرسال الخدمة للتنفيذ والمعاينة');
      setShowExecutionModal(false);
      setSelectedService(null);
      await loadServices();
    } catch (error) {
      console.error('خطأ في إرسال الخدمة للتنفيذ:', error);
      toast.error('فشل في إرسال الخدمة للتنفيذ');
    }
  };

  // تصدير البيانات
  const handleExportData = () => {
    const dataStr = JSON.stringify(filteredServices, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `services_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('تم تصدير البيانات بنجاح');
  };

  // طباعة القائمة
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t('app.loading')}</p>
      </div>
    );
  }

  return (
    <div className="services-page">
      {/* شريط الأدوات */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-title-section">
            <h1>{t('services.title')}</h1>
            <p>إدارة ومتابعة الخدمات المعتمدة</p>
          </div>
          <div className="page-actions">
            <button 
              className="btn btn-secondary"
              onClick={handleExportData}
            >
              <i className="fas fa-download"></i>
              {t('app.export')}
            </button>
            <button 
              className="btn btn-secondary"
              onClick={handlePrint}
            >
              <i className="fas fa-print"></i>
              {t('app.print')}
            </button>
          </div>
        </div>
      </div>

      {/* أدوات البحث والتصفية */}
      <div className="search-section">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="البحث في الخدمات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="search-stats">
          عرض {filteredServices.length} من {services.length} خدمة
        </div>
      </div>

      {/* جدول الخدمات */}
      <div className="table-container">
        {filteredServices.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-cogs"></i>
            <h3>{searchTerm ? t('messages.search_no_results') : 'لا توجد خدمات معتمدة'}</h3>
            <p>
              {searchTerm 
                ? 'جرب مصطلحات بحث مختلفة'
                : 'لا توجد خدمات معتمدة حالياً. يتم إضافة الخدمات عند الموافقة على العروض.'
              }
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>العميل</th>
                <th>{t('services.service_title')}</th>
                <th>{t('services.service_amount')}</th>
                <th>{t('services.start_date')}</th>
                <th>{t('services.expected_end_date')}</th>
                <th>{t('app.status')}</th>
                <th>{t('app.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((service) => (
                <tr key={service.id}>
                  <td>
                    <div className="client-info">
                      <strong>{service.client_name || 'غير محدد'}</strong>
                      {service.company_code && (
                        <small className="company-code">{service.company_code}</small>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="service-info">
                      <strong>{service.service_title}</strong>
                      {service.service_description && (
                        <small className="service-description">
                          {service.service_description.substring(0, 50)}
                          {service.service_description.length > 50 ? '...' : ''}
                        </small>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="service-amount">
                      {parseFloat(service.service_amount || 0).toLocaleString()} جنيه
                    </span>
                  </td>
                  <td>
                    <span className="service-date">
                      {service.start_date 
                        ? new Date(service.start_date).toLocaleDateString('ar-EG')
                        : 'غير محدد'
                      }
                    </span>
                  </td>
                  <td>
                    <span className="service-date">
                      {service.expected_end_date 
                        ? new Date(service.expected_end_date).toLocaleDateString('ar-EG')
                        : 'غير محدد'
                      }
                    </span>
                  </td>
                  <td>
                    <span className="status-badge success">
                      معتمد
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon btn-primary"
                        onClick={() => confirmSendToExecution(service)}
                        title={t('services.send_to_execution')}
                      >
                        <i className="fas fa-play"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* نموذج تأكيد الإرسال للتنفيذ */}
      {showExecutionModal && (
        <div className="modal-overlay" onClick={() => setShowExecutionModal(false)}>
          <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('services.execution_order')}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowExecutionModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="execution-confirmation">
                <i className="fas fa-play-circle"></i>
                <p>
                  هل أنت متأكد من إرسال الخدمة
                  <strong> "{selectedService?.service_title}"</strong>
                  للتنفيذ والمعاينة؟
                </p>
                <p className="info-text">
                  سيتم نقل الخدمة إلى قائمة التنفيذ والمعاينة.
                </p>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowExecutionModal(false)}
              >
                {t('app.cancel')}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSendToExecution}
              >
                <i className="fas fa-play"></i>
                إرسال للتنفيذ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;