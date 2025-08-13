import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import databaseService from '../utils/database-service';

const Accounts = () => {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const accountData = databaseService.getFromStorage('accounts');
      const clients = await databaseService.getClients();
      
      const accountsWithClients = accountData.map(account => {
        const client = clients.find(c => c.id === account.client_id);
        return {
          ...account,
          client_name: client?.client_name || 'غير محدد',
          company_code: client?.company_code || ''
        };
      });
      
      setAccounts(accountsWithClients);
    } catch (error) {
      console.error('خطأ:', error);
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'partial': return 'warning';
      case 'overdue': return 'danger';
      default: return 'danger';
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'paid': return 'مدفوع';
      case 'partial': return 'مدفوع جزئياً';
      case 'overdue': return 'متأخر';
      default: return 'غير مدفوع';
    }
  };

  const recordPayment = async (accountId) => {
    try {
      const accounts = databaseService.getFromStorage('accounts');
      const accountIndex = accounts.findIndex(a => a.id === accountId);
      
      if (accountIndex !== -1) {
        accounts[accountIndex].payment_status = 'paid';
        accounts[accountIndex].paid_amount = accounts[accountIndex].total_amount;
        accounts[accountIndex].remaining_amount = 0;
        
        databaseService.saveToStorage('accounts', accounts);
        toast.success('تم تسجيل الدفع بنجاح');
        await loadAccounts();
      }
    } catch (error) {
      console.error('خطأ:', error);
      toast.error('فشل في تسجيل الدفع');
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
    <div className="accounts-page">
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-title-section">
            <h1>{t('accounts.title')}</h1>
            <p>إدارة الفواتير والمدفوعات</p>
          </div>
        </div>
      </div>

      <div className="table-container">
        {accounts.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-dollar-sign"></i>
            <h3>لا توجد حسابات</h3>
            <p>لا توجد فواتير أو حسابات مالية حالياً</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>العميل</th>
                <th>رقم الفاتورة</th>
                <th>المبلغ الإجمالي</th>
                <th>المدفوع</th>
                <th>المتبقي</th>
                <th>حالة الدفع</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id}>
                  <td>
                    <div className="client-info">
                      <strong>{account.client_name}</strong>
                      {account.company_code && (
                        <small className="company-code">{account.company_code}</small>
                      )}
                    </div>
                  </td>
                  <td>{account.invoice_number}</td>
                  <td>
                    <span className="amount total">
                      {parseFloat(account.total_amount || 0).toLocaleString()} جنيه
                    </span>
                  </td>
                  <td>
                    <span className="amount paid">
                      {parseFloat(account.paid_amount || 0).toLocaleString()} جنيه
                    </span>
                  </td>
                  <td>
                    <span className="amount remaining">
                      {parseFloat(account.remaining_amount || 0).toLocaleString()} جنيه
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getPaymentStatusColor(account.payment_status)}`}>
                      {getPaymentStatusText(account.payment_status)}
                    </span>
                  </td>
                  <td>
                    {account.payment_status !== 'paid' && (
                      <button
                        className="btn btn-success"
                        onClick={() => recordPayment(account.id)}
                      >
                        <i className="fas fa-check"></i>
                        تسجيل دفع
                      </button>
                    )}
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

export default Accounts;