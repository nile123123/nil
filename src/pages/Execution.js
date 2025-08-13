import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import databaseService from '../utils/database-service';

const Execution = () => {
  const { t } = useTranslation();
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExecutions();
  }, []);

  const loadExecutions = async () => {
    try {
      setLoading(true);
      // محاكاة بيانات التنفيذ
      const executionData = databaseService.getFromStorage('execution');
      const clients = await databaseService.getClients();
      
      const executionsWithClients = executionData.map(exec => {
        const client = clients.find(c => c.id === exec.client_id);
        return {
          ...exec,
          client_name: client?.client_name || 'غير محدد',
          company_code: client?.company_code || ''
        };
      });
      
      setExecutions(executionsWithClients);
    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error);
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const markAsDelivered = async (executionId) => {
    try {
      // محاكاة نقل للتسليمات
      const executions = databaseService.getFromStorage('execution');
      const deliveries = databaseService.getFromStorage('deliveries');
      
      const execution = executions.find(e => e.id === executionId);
      if (!execution) return;

      // إنشاء تسليم جديد
      const newDelivery = {
        id: databaseService.generateId('deliveries'),
        execution_id: execution.id,
        client_id: execution.client_id,
        delivery_date: new Date().toISOString().split('T')[0],
        status: 'delivered',
        created_at: new Date().toISOString()
      };

      deliveries.unshift(newDelivery);
      databaseService.saveToStorage('deliveries', deliveries);

      // حذف من التنفيذ
      const filteredExecutions = executions.filter(e => e.id !== executionId);
      databaseService.saveToStorage('execution', filteredExecutions);

      toast.success('تم نقل المشروع للتسليمات');
      await loadExecutions();
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
    <div className="execution-page">
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-title-section">
            <h1>{t('execution.title')}</h1>
            <p>متابعة مشاريع التنفيذ والمعاينة</p>
          </div>
        </div>
      </div>

      <div className="table-container">
        {executions.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-play-circle"></i>
            <h3>لا توجد مشاريع قيد التنفيذ</h3>
            <p>لا توجد مشاريع في مرحلة التنفيذ والمعاينة حالياً</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>العميل</th>
                <th>المشروع</th>
                <th>تاريخ البداية</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {executions.map((execution) => (
                <tr key={execution.id}>
                  <td>
                    <div className="client-info">
                      <strong>{execution.client_name}</strong>
                      {execution.company_code && (
                        <small className="company-code">{execution.company_code}</small>
                      )}
                    </div>
                  </td>
                  <td>مشروع #{execution.id}</td>
                  <td>
                    {execution.execution_start_date 
                      ? new Date(execution.execution_start_date).toLocaleDateString('ar-EG')
                      : 'غير محدد'
                    }
                  </td>
                  <td>
                    <span className="status-badge info">قيد التنفيذ</span>
                  </td>
                  <td>
                    <button
                      className="btn btn-success"
                      onClick={() => markAsDelivered(execution.id)}
                    >
                      <i className="fas fa-check"></i>
                      تم التسليم
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

export default Execution;