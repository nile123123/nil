import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import databaseService from '../utils/database-service';

const Renewals = () => {
  const { t } = useTranslation();
  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRenewals();
  }, []);

  const loadRenewals = async () => {
    try {
      setLoading(true);
      const renewalData = databaseService.getFromStorage('renewals');
      const clients = await databaseService.getClients();
      
      const renewalsWithClients = renewalData.map(renewal => {
        const client = clients.find(c => c.id === renewal.client_id);
        return {
          ...renewal,
          client_name: client?.client_name || 'غير محدد',
          company_code: client?.company_code || ''
        };
      });
      
      setRenewals(renewalsWithClients);
    } catch (error) {
      console.error('خطأ:', error);
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const addSampleRenewals = () => {
    const sampleRenewals = [
      {
        id: 1,
        client_id: 1,
        renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        service_type: 'خدمة استضافة المواقع',
        renewal_amount: 5000,
        status: 'pending',
        notes: 'تجديد سنوي لخدمة الاستضافة',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        client_id: 2,
        renewal_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        service_type: 'خدمة الصيانة',
        renewal_amount: 3000,
        status: 'urgent',
        notes: 'تجديد عقد الصيانة الشهرية',
        created_at: new Date().toISOString()
      }
    ];
    
    databaseService.saveToStorage('renewals', sampleRenewals);
    loadRenewals();
    toast.success('تم إضافة بيانات تجريبية للتجديدات');
  };

  const getRenewalStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'urgent': return 'danger';
      case 'pending': return 'warning';
      default: return 'info';
    }
  };

  const getRenewalStatusText = (status) => {
    switch (status) {
      case 'completed': return 'مكتمل';
      case 'urgent': return 'عاجل';
      case 'pending': return 'في الانتظار';
      default: return 'جديد';
    }
  };

  const markAsCompleted = async (renewalId) => {
    try {
      const renewals = databaseService.getFromStorage('renewals');
      const renewalIndex = renewals.findIndex(r => r.id === renewalId);
      
      if (renewalIndex !== -1) {
        renewals[renewalIndex].status = 'completed';
        renewals[renewalIndex].completed_date = new Date().toISOString().split('T')[0];
        
        databaseService.saveToStorage('renewals', renewals);
        toast.success('تم تسجيل التجديد كمكتمل');
        await loadRenewals();
      }
    } catch (error) {
      console.error('خطأ:', error);
      toast.error('فشل في تحديث حالة التجديد');
    }
  };

  const getDaysUntilRenewal = (renewalDate) => {
    const today = new Date();
    const renewal = new Date(renewalDate);
    const diffTime = renewal - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
    <div className="renewals-page">
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-title-section">
            <h1>{t('renewals.title')}</h1>
            <p>متابعة تجديدات الخدمات والعقود</p>
          </div>
          <div className="page-actions">
            {renewals.length === 0 && (
              <button 
                className="btn btn-secondary"
                onClick={addSampleRenewals}
              >
                <i className="fas fa-plus"></i>
                إضافة بيانات تجريبية
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="table-container">
        {renewals.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-redo"></i>
            <h3>لا توجد تجديدات</h3>
            <p>لا توجد خدمات تحتاج لتجديد حالياً</p>
            <button 
              className="btn btn-primary"
              onClick={addSampleRenewals}
            >
              <i className="fas fa-plus"></i>
              إضافة بيانات تجريبية
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>العميل</th>
                <th>نوع الخدمة</th>
                <th>تاريخ التجديد</th>
                <th>المبلغ</th>
                <th>المتبقي</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {renewals.map((renewal) => {
                const daysLeft = getDaysUntilRenewal(renewal.renewal_date);
                return (
                  <tr key={renewal.id}>
                    <td>
                      <div className="client-info">
                        <strong>{renewal.client_name}</strong>
                        {renewal.company_code && (
                          <small className="company-code">{renewal.company_code}</small>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="service-info">
                        <strong>{renewal.service_type}</strong>
                        {renewal.notes && (
                          <small className="service-notes">
                            {renewal.notes.substring(0, 40)}
                            {renewal.notes.length > 40 ? '...' : ''}
                          </small>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="renewal-date">
                        {new Date(renewal.renewal_date).toLocaleDateString('ar-EG')}
                      </span>
                    </td>
                    <td>
                      <span className="renewal-amount">
                        {parseFloat(renewal.renewal_amount || 0).toLocaleString()} جنيه
                      </span>
                    </td>
                    <td>
                      <span className={`days-left ${daysLeft <= 7 ? 'urgent' : daysLeft <= 30 ? 'warning' : 'normal'}`}>
                        {daysLeft > 0 ? `${daysLeft} يوم` : daysLeft === 0 ? 'اليوم' : `متأخر ${Math.abs(daysLeft)} يوم`}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getRenewalStatusColor(renewal.status)}`}>
                        {getRenewalStatusText(renewal.status)}
                      </span>
                    </td>
                    <td>
                      {renewal.status !== 'completed' && (
                        <button
                          className="btn btn-success"
                          onClick={() => markAsCompleted(renewal.id)}
                        >
                          <i className="fas fa-check"></i>
                          تم التجديد
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Renewals;