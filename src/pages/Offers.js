import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import databaseService from '../utils/database-service';

const Offers = () => {
  const { t } = useTranslation();
  const [offers, setOffers] = useState([]);
  const [clients, setClients] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [formData, setFormData] = useState({
    client_id: '',
    offer_title: '',
    offer_description: '',
    offer_amount: '',
    offer_date: new Date().toISOString().split('T')[0],
    validity_period: 30
  });

  // تحميل البيانات عند تحميل الصفحة
  useEffect(() => {
    loadOffersAndClients();
  }, []);

  // البحث في العروض
  useEffect(() => {
    if (searchTerm) {
      const filtered = offers.filter(offer =>
        offer.offer_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.company_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.offer_amount?.toString().includes(searchTerm)
      );
      setFilteredOffers(filtered);
    } else {
      setFilteredOffers(offers);
    }
  }, [searchTerm, offers]);

  // تحميل العروض والعملاء
  const loadOffersAndClients = async () => {
    try {
      setLoading(true);
      const [offersList, clientsList] = await Promise.all([
        databaseService.getOffers(),
        databaseService.getClients()
      ]);
      setOffers(offersList);
      setClients(clientsList);
      setFilteredOffers(offersList);
    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error);
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  // إعادة تعيين النموذج
  const resetForm = () => {
    setFormData({
      client_id: '',
      offer_title: '',
      offer_description: '',
      offer_amount: '',
      offer_date: new Date().toISOString().split('T')[0],
      validity_period: 30
    });
    setEditingOffer(null);
  };

  // فتح نموذج إضافة عرض جديد
  const handleAddOffer = () => {
    resetForm();
    setShowModal(true);
  };

  // فتح نموذج تعديل عرض
  const handleEditOffer = (offer) => {
    setFormData({
      client_id: offer.client_id || '',
      offer_title: offer.offer_title || '',
      offer_description: offer.offer_description || '',
      offer_amount: offer.offer_amount || '',
      offer_date: offer.offer_date || new Date().toISOString().split('T')[0],
      validity_period: offer.validity_period || 30
    });
    setEditingOffer(offer);
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

  // حفظ العرض (إضافة أو تعديل)
  const handleSaveOffer = async (e) => {
    e.preventDefault();
    
    // التحقق من البيانات المطلوبة
    if (!formData.client_id) {
      toast.error(t('messages.required_field') + ': ' + t('offers.select_client'));
      return;
    }
    if (!formData.offer_title.trim()) {
      toast.error(t('messages.required_field') + ': ' + t('offers.offer_title'));
      return;
    }
    if (!formData.offer_amount || parseFloat(formData.offer_amount) <= 0) {
      toast.error('يرجى إدخال قيمة صحيحة للعرض');
      return;
    }

    try {
      if (editingOffer) {
        // تعديل عرض موجود - سيتم تنفيذه لاحقاً
        toast.info('ميزة التعديل ستكون متاحة قريباً');
      } else {
        // إضافة عرض جديد
        await databaseService.addOffer(formData);
        toast.success(t('messages.save_success'));
      }
      
      setShowModal(false);
      resetForm();
      await loadOffersAndClients();
    } catch (error) {
      console.error('خطأ في حفظ العرض:', error);
      toast.error(t('messages.operation_failed'));
    }
  };

  // تأكيد الموافقة على العرض
  const confirmApproval = (offer) => {
    setSelectedOffer(offer);
    setShowApprovalModal(true);
  };

  // الموافقة على العرض
  const handleApproveOffer = async () => {
    if (!selectedOffer) return;

    try {
      await databaseService.approveOffer(selectedOffer.id);
      toast.success(t('offers.move_to_services'));
      setShowApprovalModal(false);
      setSelectedOffer(null);
      await loadOffersAndClients();
    } catch (error) {
      console.error('خطأ في الموافقة على العرض:', error);
      toast.error(t('messages.operation_failed'));
    }
  };

  // تأكيد رفض العرض
  const confirmRejection = (offer) => {
    setSelectedOffer(offer);
    setRejectionReason('');
    setShowRejectionModal(true);
  };

  // رفض العرض
  const handleRejectOffer = async () => {
    if (!selectedOffer) return;
    if (!rejectionReason.trim()) {
      toast.error('يرجى إدخال سبب الرفض');
      return;
    }

    try {
      await databaseService.rejectOffer(selectedOffer.id, rejectionReason);
      toast.success(t('offers.move_to_rejected'));
      setShowRejectionModal(false);
      setSelectedOffer(null);
      setRejectionReason('');
      await loadOffersAndClients();
    } catch (error) {
      console.error('خطأ في رفض العرض:', error);
      toast.error(t('messages.operation_failed'));
    }
  };

  // تصدير البيانات
  const handleExportData = () => {
    const dataStr = JSON.stringify(filteredOffers, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `offers_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('تم تصدير البيانات بنجاح');
  };

  // طباعة القائمة
  const handlePrint = () => {
    window.print();
  };

  // تحديد لون حالة العرض
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      default: return 'warning';
    }
  };

  // تحديد نص حالة العرض
  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return t('offers.approved');
      case 'rejected': return t('offers.rejected');
      default: return t('offers.pending');
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
    <div className="offers-page">
      {/* شريط الأدوات */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-title-section">
            <h1>{t('offers.title')}</h1>
            <p>إنشاء ومتابعة عروض الأسعار</p>
          </div>
          <div className="page-actions">
            <button 
              className="btn btn-primary"
              onClick={handleAddOffer}
            >
              <i className="fas fa-plus"></i>
              {t('offers.add_offer')}
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
            placeholder="البحث في العروض..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="search-stats">
          عرض {filteredOffers.length} من {offers.length} عرض
        </div>
      </div>

      {/* جدول العروض */}
      <div className="table-container">
        {filteredOffers.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-file-alt"></i>
            <h3>{searchTerm ? t('messages.search_no_results') : 'لا توجد عروض'}</h3>
            <p>
              {searchTerm 
                ? 'جرب مصطلحات بحث مختلفة'
                : 'ابدأ بإنشاء عرض سعر جديد'
              }
            </p>
            {!searchTerm && (
              <button 
                className="btn btn-primary"
                onClick={handleAddOffer}
              >
                <i className="fas fa-plus"></i>
                {t('offers.add_offer')}
              </button>
            )}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>العميل</th>
                <th>{t('offers.offer_title')}</th>
                <th>{t('offers.offer_amount')}</th>
                <th>{t('offers.offer_date')}</th>
                <th>{t('offers.validity_period')}</th>
                <th>{t('app.status')}</th>
                <th>{t('app.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredOffers.map((offer) => (
                <tr key={offer.id}>
                  <td>
                    <div className="client-info">
                      <strong>{offer.client_name || 'غير محدد'}</strong>
                      {offer.company_code && (
                        <small className="company-code">{offer.company_code}</small>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="offer-info">
                      <strong>{offer.offer_title}</strong>
                      {offer.offer_description && (
                        <small className="offer-description">
                          {offer.offer_description.substring(0, 50)}
                          {offer.offer_description.length > 50 ? '...' : ''}
                        </small>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="offer-amount">
                      {parseFloat(offer.offer_amount || 0).toLocaleString()} جنيه
                    </span>
                  </td>
                  <td>
                    <span className="offer-date">
                      {new Date(offer.offer_date).toLocaleDateString('ar-EG')}
                    </span>
                  </td>
                  <td>
                    <span className="validity-period">
                      {offer.validity_period || 30} يوم
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusColor(offer.status)}`}>
                      {getStatusText(offer.status)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {offer.status === 'pending' && (
                        <>
                          <button
                            className="btn-icon btn-success"
                            onClick={() => confirmApproval(offer)}
                            title={t('offers.approve')}
                          >
                            <i className="fas fa-check"></i>
                          </button>
                          <button
                            className="btn-icon btn-danger"
                            onClick={() => confirmRejection(offer)}
                            title={t('offers.reject')}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </>
                      )}
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEditOffer(offer)}
                        title={t('app.edit')}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* نموذج إضافة/تعديل العرض */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingOffer ? t('offers.edit_offer') : t('offers.add_offer')}
              </h2>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSaveOffer} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="client_id">
                    {t('offers.select_client')} *
                  </label>
                  <select
                    id="client_id"
                    name="client_id"
                    value={formData.client_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">{t('offers.select_client')}</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.client_name} ({client.company_code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="offer_date">
                    {t('offers.offer_date')} *
                  </label>
                  <input
                    type="date"
                    id="offer_date"
                    name="offer_date"
                    value={formData.offer_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="offer_title">
                    {t('offers.offer_title')} *
                  </label>
                  <input
                    type="text"
                    id="offer_title"
                    name="offer_title"
                    value={formData.offer_title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="offer_amount">
                    {t('offers.offer_amount')} (جنيه) *
                  </label>
                  <input
                    type="number"
                    id="offer_amount"
                    name="offer_amount"
                    value={formData.offer_amount}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="validity_period">
                    {t('offers.validity_period')}
                  </label>
                  <input
                    type="number"
                    id="validity_period"
                    name="validity_period"
                    value={formData.validity_period}
                    onChange={handleInputChange}
                    min="1"
                    max="365"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="offer_description">
                    {t('offers.offer_description')}
                  </label>
                  <textarea
                    id="offer_description"
                    name="offer_description"
                    value={formData.offer_description}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="وصف تفصيلي للعرض..."
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

      {/* نموذج تأكيد الموافقة */}
      {showApprovalModal && (
        <div className="modal-overlay" onClick={() => setShowApprovalModal(false)}>
          <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>تأكيد الموافقة</h3>
              <button 
                className="modal-close"
                onClick={() => setShowApprovalModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="approval-confirmation">
                <i className="fas fa-check-circle"></i>
                <p>
                  هل أنت متأكد من الموافقة على العرض
                  <strong> "{selectedOffer?.offer_title}"</strong>؟
                </p>
                <p className="info-text">
                  سيتم نقل العرض إلى قائمة الخدمات المعتمدة.
                </p>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowApprovalModal(false)}
              >
                {t('app.cancel')}
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={handleApproveOffer}
              >
                <i className="fas fa-check"></i>
                {t('offers.approve')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نموذج تأكيد الرفض */}
      {showRejectionModal && (
        <div className="modal-overlay" onClick={() => setShowRejectionModal(false)}>
          <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>رفض العرض</h3>
              <button 
                className="modal-close"
                onClick={() => setShowRejectionModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="rejection-form">
                <p>
                  رفض العرض: <strong>"{selectedOffer?.offer_title}"</strong>
                </p>
                <div className="form-group">
                  <label htmlFor="rejection_reason">
                    {t('offers.rejection_reason')} *
                  </label>
                  <textarea
                    id="rejection_reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows="3"
                    placeholder="اذكر سبب رفض العرض..."
                    required
                  />
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowRejectionModal(false)}
              >
                {t('app.cancel')}
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleRejectOffer}
              >
                <i className="fas fa-times"></i>
                {t('offers.reject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Offers;