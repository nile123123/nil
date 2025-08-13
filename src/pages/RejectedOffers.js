import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import databaseService from '../utils/database-service';

const RejectedOffers = () => {
  const { t } = useTranslation();
  const [rejectedOffers, setRejectedOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);

  // تحميل العروض المرفوضة عند تحميل الصفحة
  useEffect(() => {
    loadRejectedOffers();
  }, []);

  // البحث في العروض المرفوضة
  useEffect(() => {
    if (searchTerm) {
      const filtered = rejectedOffers.filter(offer =>
        offer.offer_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.company_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.rejection_reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOffers(filtered);
    } else {
      setFilteredOffers(rejectedOffers);
    }
  }, [searchTerm, rejectedOffers]);

  // تحميل العروض المرفوضة
  const loadRejectedOffers = async () => {
    try {
      setLoading(true);
      const rejectedOffersList = await databaseService.getRejectedOffers();
      setRejectedOffers(rejectedOffersList);
      setFilteredOffers(rejectedOffersList);
    } catch (error) {
      console.error('خطأ في تحميل العروض المرفوضة:', error);
      toast.error('فشل في تحميل العروض المرفوضة');
    } finally {
      setLoading(false);
    }
  };

  // عرض تفاصيل العرض المرفوض
  const showOfferDetails = (offer) => {
    setSelectedOffer(offer);
    setShowDetailsModal(true);
  };

  // تصدير البيانات
  const handleExportData = () => {
    const dataStr = JSON.stringify(filteredOffers, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rejected_offers_${new Date().toISOString().split('T')[0]}.json`;
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
    <div className="rejected-offers-page">
      {/* شريط الأدوات */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-title-section">
            <h1>{t('navigation.rejected_offers')}</h1>
            <p>مراجعة وتتبع العروض المرفوضة</p>
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
            placeholder="البحث في العروض المرفوضة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="search-stats">
          عرض {filteredOffers.length} من {rejectedOffers.length} عرض مرفوض
        </div>
      </div>

      {/* جدول العروض المرفوضة */}
      <div className="table-container">
        {filteredOffers.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-times-circle"></i>
            <h3>{searchTerm ? t('messages.search_no_results') : 'لا توجد عروض مرفوضة'}</h3>
            <p>
              {searchTerm 
                ? 'جرب مصطلحات بحث مختلفة'
                : 'لم يتم رفض أي عروض حتى الآن'
              }
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>العميل</th>
                <th>{t('offers.offer_title')}</th>
                <th>{t('offers.offer_amount')}</th>
                <th>تاريخ العرض</th>
                <th>تاريخ الرفض</th>
                <th>سبب الرفض</th>
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
                          {offer.offer_description.substring(0, 40)}
                          {offer.offer_description.length > 40 ? '...' : ''}
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
                    <span className="rejection-date">
                      {new Date(offer.rejection_date).toLocaleDateString('ar-EG')}
                    </span>
                  </td>
                  <td>
                    <span className="rejection-reason">
                      {offer.rejection_reason && offer.rejection_reason.length > 30
                        ? `${offer.rejection_reason.substring(0, 30)}...`
                        : offer.rejection_reason || 'غير محدد'
                      }
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => showOfferDetails(offer)}
                        title="عرض التفاصيل"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* نموذج عرض التفاصيل */}
      {showDetailsModal && selectedOffer && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>تفاصيل العرض المرفوض</h2>
              <button 
                className="modal-close"
                onClick={() => setShowDetailsModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="offer-details">
                <div className="details-grid">
                  <div className="detail-item">
                    <label>العميل:</label>
                    <span>{selectedOffer.client_name || 'غير محدد'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <label>كود الشركة:</label>
                    <span className="company-code">
                      {selectedOffer.company_code || 'غير محدد'}
                    </span>
                  </div>

                  <div className="detail-item">
                    <label>عنوان العرض:</label>
                    <span>{selectedOffer.offer_title}</span>
                  </div>

                  <div className="detail-item">
                    <label>قيمة العرض:</label>
                    <span className="offer-amount">
                      {parseFloat(selectedOffer.offer_amount || 0).toLocaleString()} جنيه
                    </span>
                  </div>

                  <div className="detail-item">
                    <label>تاريخ العرض:</label>
                    <span>{new Date(selectedOffer.offer_date).toLocaleDateString('ar-EG')}</span>
                  </div>

                  <div className="detail-item">
                    <label>تاريخ الرفض:</label>
                    <span className="rejection-date">
                      {new Date(selectedOffer.rejection_date).toLocaleDateString('ar-EG')}
                    </span>
                  </div>

                  {selectedOffer.offer_description && (
                    <div className="detail-item full-width">
                      <label>وصف العرض:</label>
                      <div className="description-text">
                        {selectedOffer.offer_description}
                      </div>
                    </div>
                  )}

                  <div className="detail-item full-width">
                    <label>سبب الرفض:</label>
                    <div className="rejection-reason-full">
                      {selectedOffer.rejection_reason || 'لم يتم تحديد سبب الرفض'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDetailsModal(false)}
              >
                {t('app.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RejectedOffers;