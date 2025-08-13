import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import databaseService from '../utils/database-service';

const Deliveries = () => {
  const { t } = useTranslation();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const deliveryData = databaseService.getFromStorage('deliveries');
      const clients = await databaseService.getClients();
      
      const deliveriesWithClients = deliveryData.map(delivery => {
        const client = clients.find(c => c.id === delivery.client_id);
        return {
          ...delivery,
          client_name: client?.client_name || 'غير محدد',
          company_code: client?.company_code || ''
        };
      });
      
      setDeliveries(deliveriesWithClients);
    } catch (error) {
      console.error('خطأ:', error);
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const moveToAccounts = async (deliveryId) => {
    try {
      const deliveries = databaseService.getFromStorage('deliveries');
      const accounts = databaseService.getFromStorage('accounts');
      
      const delivery = deliveries.find(d => d.id === deliveryId);
      if (!delivery) return;

      // إنشاء حساب جديد
      const newAccount = {
        id: databaseService.generateId('accounts'),
        delivery_id: delivery.id,
        client_id: delivery.client_id,
        total_amount: 10000, // قيمة افتراضية
        paid_amount: 0,
        remaining_amount: 10000,
        payment_status: 'unpaid',
        invoice_number: `INV-${Date.now()}`,
        created_at: new Date().toISOString()
      };

      accounts.unshift(newAccount);
      databaseService.saveToStorage('accounts', accounts);

      // حذف من التسليمات
      const filteredDeliveries = deliveries.filter(d => d.id !== deliveryId);
      databaseService.saveToStorage('deliveries', filteredDeliveries);

      toast.success('تم نقل المشروع للحسابات');
      await loadDeliveries();
    } catch (error) {
      console.error('خطأ:', error);
      toast.error('فشل في العملية');
    }
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
    <div className="deliveries-page">
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-title-section">
            <h1>{t('deliveries.title')}</h1>
            <p>إدارة التسليمات والموافقات</p>
          </div>
        </div>
      </div>

      <div className="table-container">
        {deliveries.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-truck"></i>
            <h3>لا توجد تسليمات</h3>
            <p>لا توجد مشاريع مُسلمة حالياً</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>العميل</th>
                <th>المشروع</th>
                <th>تاريخ التسليم</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((delivery) => (
                <tr key={delivery.id}>
                  <td>
                    <div className="client-info">
                      <strong>{delivery.client_name}</strong>
                      {delivery.company_code && (
                        <small className="company-code">{delivery.company_code}</small>
                      )}
                    </div>
                  </td>
                  <td>مشروع #{delivery.execution_id}</td>
                  <td>
                    {new Date(delivery.delivery_date).toLocaleDateString('ar-EG')}
                  </td>
                  <td>
                    <span className="status-badge success">مُسلم</span>
                  </td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => moveToAccounts(delivery.id)}
                    >
                      <i className="fas fa-arrow-right"></i>
                      نقل للحسابات
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Deliveries;