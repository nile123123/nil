import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import databaseService from '../utils/database-service';

const Clients = () => {
  const { t } = useTranslation();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  const [formData, setFormData] = useState({
    company_code: '',
    client_name: '',
    address: '',
    manager: '',
    phone: '',
    intermediary: '',
    intermediary_phone: ''
  });

  // تحميل العملاء عند تحميل الصفحة
  useEffect(() => {
    loadClients();
  }, []);

  // البحث في العملاء
  useEffect(() => {
    if (searchTerm) {
      const filtered = clients.filter(client =>
        client.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.manager?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.includes(searchTerm)
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients);
    }
  }, [searchTerm, clients]);

  // تحميل قائمة العملاء
  const loadClients = async () => {
    try {
      setLoading(true);
      const clientsList = await databaseService.getClients();
      setClients(clientsList);
      setFilteredClients(clientsList);
    } catch (error) {
      console.error('خطأ في تحميل العملاء:', error);
      toast.error('فشل في تحميل قائمة العملاء');
    } finally {
      setLoading(false);
    }
  };

  // إعادة تعيين النموذج
  const resetForm = () => {
    setFormData({
      company_code: '',
      client_name: '',
      address: '',
      manager: '',
      phone: '',
      intermediary: '',
      intermediary_phone: ''
    });
    setEditingClient(null);
  };

  // فتح نموذج إضافة عميل جديد
  const handleAddClient = () => {
    resetForm();
    setFormData(prev => ({
      ...prev,
      company_code: databaseService.generateCompanyCode()
    }));
    setShowModal(true);
  };

  // فتح نموذج تعديل عميل
  const handleEditClient = (client) => {
    setFormData({
      company_code: client.company_code || '',
      client_name: client.client_name || '',
      address: client.address || '',
      manager: client.manager || '',
      phone: client.phone || '',
      intermediary: client.intermediary || '',
      intermediary_phone: client.intermediary_phone || ''
    });
    setEditingClient(client);
    setShowModal(true);
  };

  // معالجة تغيير المدخلات
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // حفظ العميل (إضافة أو تعديل)
  const handleSaveClient = async (e) => {
    e.preventDefault();
    
    // التحقق من البيانات المطلوبة
    if (!formData.client_name.trim()) {
      toast.error(t('messages.required_field') + ': ' + t('clients.client_name'));
      return;
    }

    try {
      if (editingClient) {
        // تعديل عميل موجود
        await databaseService.updateClient(editingClient.id, formData);
        toast.success(t('messages.update_success'));
      } else {
        // إضافة عميل جديد
        await databaseService.addClient(formData);
        toast.success(t('messages.save_success'));
      }
      
      setShowModal(false);
      resetForm();
      await loadClients();
    } catch (error) {
      console.error('خطأ في حفظ العميل:', error);
      toast.error(t('messages.operation_failed'));
    }
  };

  // تأكيد حذف العميل
  const confirmDeleteClient = (client) => {
    setClientToDelete(client);
    setShowDeleteModal(true);
  };

  // حذف العميل
  const handleDeleteClient = async () => {
    if (!clientToDelete) return;

    try {
      await databaseService.deleteClient(clientToDelete.id);
      toast.success(t('messages.delete_success'));
      setShowDeleteModal(false);
      setClientToDelete(null);
      await loadClients();
    } catch (error) {
      console.error('خطأ في حذف العميل:', error);
      toast.error(t('messages.operation_failed'));
    }
  };

  // تصدير البيانات إلى Excel (محاكاة)
  const handleExportData = () => {
    // محاكاة تصدير البيانات
    const dataStr = JSON.stringify(filteredClients, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clients_${new Date().toISOString().split('T')[0]}.json`;
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
    <div className="clients-page">
      {/* شريط الأدوات */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-title-section">
            <h1>{t('clients.title')}</h1>
            <p>إدارة وتتبع جميع العملاء</p>
          </div>
          <div className="page-actions">
            <button 
              className="btn btn-primary"
              onClick={handleAddClient}
            >
              <i className="fas fa-plus"></i>
              {t('clients.add_client')}
            </button>
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
            placeholder={t('clients.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="search-stats">
          عرض {filteredClients.length} من {clients.length} عميل
        </div>
      </div>

      {/* جدول العملاء */}
      <div className="table-container">
        {filteredClients.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-users"></i>
            <h3>{searchTerm ? t('messages.search_no_results') : t('clients.no_clients')}</h3>
            <p>
              {searchTerm 
                ? 'جرب مصطلحات بحث مختلفة'
                : 'ابدأ بإضافة عميل جديد للنظام'
              }
            </p>
            {!searchTerm && (
              <button 
                className="btn btn-primary"
                onClick={handleAddClient}
              >
                <i className="fas fa-plus"></i>
                {t('clients.add_client')}
              </button>
            )}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('clients.company_code')}</th>
                <th>{t('clients.client_name')}</th>
                <th>{t('clients.manager')}</th>
                <th>{t('app.phone')}</th>
                <th>{t('clients.intermediary')}</th>
                <th>{t('app.address')}</th>
                <th>{t('app.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id}>
                  <td>
                    <span className="company-code">{client.company_code}</span>
                  </td>
                  <td>
                    <div className="client-info">
                      <strong>{client.client_name}</strong>
                    </div>
                  </td>
                  <td>{client.manager || '-'}</td>
                  <td>
                    <span className="phone-number">{client.phone || '-'}</span>
                  </td>
                  <td>
                    <div className="intermediary-info">
                      <div>{client.intermediary || '-'}</div>
                      {client.intermediary_phone && (
                        <small className="intermediary-phone">
                          {client.intermediary_phone}
                        </small>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="address">{client.address || '-'}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEditClient(client)}
                        title={t('app.edit')}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => confirmDeleteClient(client)}
                        title={t('app.delete')}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* نموذج إضافة/تعديل العميل */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingClient ? t('clients.edit_client') : t('clients.add_client')}
              </h2>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="company_code">
                    {t('clients.company_code')} *
                  </label>
                  <input
                    type="text"
                    id="company_code"
                    name="company_code"
                    value={formData.company_code}
                    onChange={handleInputChange}
                    readOnly={!!editingClient}
                    className={editingClient ? 'readonly' : ''}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="client_name">
                    {t('clients.client_name')} *
                  </label>
                  <input
                    type="text"
                    id="client_name"
                    name="client_name"
                    value={formData.client_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="manager">
                    {t('clients.manager')}
                  </label>
                  <input
                    type="text"
                    id="manager"
                    name="manager"
                    value={formData.manager}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">
                    {t('app.phone')}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="intermediary">
                    {t('clients.intermediary')}
                  </label>
                  <input
                    type="text"
                    id="intermediary"
                    name="intermediary"
                    value={formData.intermediary}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="intermediary_phone">
                    {t('clients.intermediary_phone')}
                  </label>
                  <input
                    type="tel"
                    id="intermediary_phone"
                    name="intermediary_phone"
                    value={formData.intermediary_phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="address">
                    {t('app.address')}
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  {t('app.cancel')}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <i className="fas fa-save"></i>
                  {t('app.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نموذج تأكيد الحذف */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>تأكيد الحذف</h3>
              <button 
                className="modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="delete-confirmation">
                <i className="fas fa-exclamation-triangle"></i>
                <p>
                  هل أنت متأكد من حذف العميل
                  <strong> "{clientToDelete?.client_name}"</strong>؟
                </p>
                <p className="warning-text">
                  هذا الإجراء لا يمكن التراجع عنه.
                </p>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                {t('app.cancel')}
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteClient}
              >
                <i className="fas fa-trash"></i>
                {t('app.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;