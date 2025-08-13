const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null };

// محاكاة قاعدة البيانات في حالة عدم وجود Electron
class DatabaseService {
  constructor() {
    this.isElectron = !!ipcRenderer;
    if (!this.isElectron) {
      // تهيئة التخزين المحلي للمتصفح
      this.initLocalStorage();
    }
  }

  // تهيئة التخزين المحلي
  initLocalStorage() {
    const tables = ['clients', 'offers', 'rejected_offers', 'services', 'execution', 'deliveries', 'accounts', 'renewals'];
    tables.forEach(table => {
      if (!localStorage.getItem(table)) {
        localStorage.setItem(table, JSON.stringify([]));
      }
    });

    // إنشاء بيانات تجريبية للعملاء
    const clients = this.getFromStorage('clients');
    if (clients.length === 0) {
      const sampleClients = [
        {
          id: 1,
          company_code: 'NC001',
          client_name: 'شركة النيل للتجارة',
          address: 'القاهرة، مصر',
          manager: 'أحمد محمد',
          phone: '01234567890',
          intermediary: 'محمد أحمد',
          intermediary_phone: '01987654321',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          company_code: 'NC002',
          client_name: 'مجموعة الأهرام',
          address: 'الجيزة، مصر',
          manager: 'سارة إبراهيم',
          phone: '01122334455',
          intermediary: 'فاطمة علي',
          intermediary_phone: '01555666777',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      localStorage.setItem('clients', JSON.stringify(sampleClients));
    }
  }

  // الحصول على البيانات من التخزين المحلي
  getFromStorage(table) {
    try {
      return JSON.parse(localStorage.getItem(table) || '[]');
    } catch {
      return [];
    }
  }

  // حفظ البيانات في التخزين المحلي
  saveToStorage(table, data) {
    localStorage.setItem(table, JSON.stringify(data));
  }

  // توليد ID جديد
  generateId(table) {
    const data = this.getFromStorage(table);
    const maxId = data.reduce((max, item) => Math.max(max, item.id || 0), 0);
    return maxId + 1;
  }

  // توليد كود شركة
  generateCompanyCode() {
    const clients = this.getFromStorage('clients');
    const maxCode = clients.reduce((max, client) => {
      const codeNum = parseInt(client.company_code.replace('NC', ''));
      return Math.max(max, codeNum || 0);
    }, 0);
    return `NC${String(maxCode + 1).padStart(3, '0')}`;
  }

  // ==================== عمليات العملاء ====================

  // الحصول على جميع العملاء
  async getClients() {
    if (this.isElectron) {
      return await ipcRenderer.invoke('database-query', 'SELECT * FROM clients ORDER BY created_at DESC');
    }
    return this.getFromStorage('clients');
  }

  // إضافة عميل جديد
  async addClient(clientData) {
    const newClient = {
      ...clientData,
      id: this.generateId('clients'),
      company_code: clientData.company_code || this.generateCompanyCode(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (this.isElectron) {
      const sql = `INSERT INTO clients (company_code, client_name, address, manager, phone, intermediary, intermediary_phone) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;
      const params = [newClient.company_code, newClient.client_name, newClient.address, 
                     newClient.manager, newClient.phone, newClient.intermediary, newClient.intermediary_phone];
      return await ipcRenderer.invoke('database-run', sql, params);
    }

    const clients = this.getFromStorage('clients');
    clients.unshift(newClient);
    this.saveToStorage('clients', clients);
    return { id: newClient.id };
  }

  // تحديث عميل
  async updateClient(id, clientData) {
    const updatedData = {
      ...clientData,
      updated_at: new Date().toISOString()
    };

    if (this.isElectron) {
      const sql = `UPDATE clients SET client_name=?, address=?, manager=?, phone=?, intermediary=?, intermediary_phone=?, updated_at=? WHERE id=?`;
      const params = [updatedData.client_name, updatedData.address, updatedData.manager, 
                     updatedData.phone, updatedData.intermediary, updatedData.intermediary_phone, 
                     updatedData.updated_at, id];
      return await ipcRenderer.invoke('database-run', sql, params);
    }

    const clients = this.getFromStorage('clients');
    const index = clients.findIndex(client => client.id === id);
    if (index !== -1) {
      clients[index] = { ...clients[index], ...updatedData };
      this.saveToStorage('clients', clients);
      return { changes: 1 };
    }
    return { changes: 0 };
  }

  // حذف عميل
  async deleteClient(id) {
    if (this.isElectron) {
      return await ipcRenderer.invoke('database-run', 'DELETE FROM clients WHERE id=?', [id]);
    }

    const clients = this.getFromStorage('clients');
    const filteredClients = clients.filter(client => client.id !== id);
    this.saveToStorage('clients', filteredClients);
    return { changes: clients.length - filteredClients.length };
  }

  // البحث في العملاء
  async searchClients(searchTerm) {
    const clients = await this.getClients();
    if (!searchTerm) return clients;
    
    const term = searchTerm.toLowerCase();
    return clients.filter(client => 
      client.client_name?.toLowerCase().includes(term) ||
      client.company_code?.toLowerCase().includes(term) ||
      client.manager?.toLowerCase().includes(term) ||
      client.phone?.includes(term)
    );
  }

  // ==================== عمليات العروض ====================

  // الحصول على جميع العروض
  async getOffers() {
    if (this.isElectron) {
      const sql = `SELECT o.*, c.client_name, c.company_code 
                   FROM offers o 
                   LEFT JOIN clients c ON o.client_id = c.id 
                   ORDER BY o.created_at DESC`;
      return await ipcRenderer.invoke('database-query', sql);
    }
    
    const offers = this.getFromStorage('offers');
    const clients = this.getFromStorage('clients');
    
    return offers.map(offer => {
      const client = clients.find(c => c.id === offer.client_id);
      return {
        ...offer,
        client_name: client?.client_name || 'غير محدد',
        company_code: client?.company_code || ''
      };
    });
  }

  // إضافة عرض جديد
  async addOffer(offerData) {
    const newOffer = {
      ...offerData,
      id: this.generateId('offers'),
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (this.isElectron) {
      const sql = `INSERT INTO offers (client_id, offer_title, offer_description, offer_amount, offer_date, validity_period) 
                   VALUES (?, ?, ?, ?, ?, ?)`;
      const params = [newOffer.client_id, newOffer.offer_title, newOffer.offer_description, 
                     newOffer.offer_amount, newOffer.offer_date, newOffer.validity_period];
      return await ipcRenderer.invoke('database-run', sql, params);
    }

    const offers = this.getFromStorage('offers');
    offers.unshift(newOffer);
    this.saveToStorage('offers', offers);
    return { id: newOffer.id };
  }

  // الموافقة على عرض (نقل للخدمات)
  async approveOffer(offerId) {
    if (this.isElectron) {
      // سيتم تنفيذ هذا لاحقاً
      return { success: true };
    }

    const offers = this.getFromStorage('offers');
    const services = this.getFromStorage('services');
    
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return { success: false };

    // إنشاء خدمة جديدة من العرض
    const newService = {
      id: this.generateId('services'),
      client_id: offer.client_id,
      service_title: offer.offer_title,
      service_description: offer.offer_description,
      service_amount: offer.offer_amount,
      start_date: new Date().toISOString().split('T')[0],
      status: 'approved',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    services.unshift(newService);
    this.saveToStorage('services', services);

    // حذف العرض
    const filteredOffers = offers.filter(o => o.id !== offerId);
    this.saveToStorage('offers', filteredOffers);

    return { success: true };
  }

  // رفض عرض (نقل للعروض المرفوضة)
  async rejectOffer(offerId, rejectionReason) {
    if (this.isElectron) {
      // سيتم تنفيذ هذا لاحقاً
      return { success: true };
    }

    const offers = this.getFromStorage('offers');
    const rejectedOffers = this.getFromStorage('rejected_offers');
    
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return { success: false };

    // إنشاء عرض مرفوض
    const newRejectedOffer = {
      id: this.generateId('rejected_offers'),
      client_id: offer.client_id,
      offer_title: offer.offer_title,
      offer_description: offer.offer_description,
      offer_amount: offer.offer_amount,
      offer_date: offer.offer_date,
      rejection_reason: rejectionReason,
      rejection_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };

    rejectedOffers.unshift(newRejectedOffer);
    this.saveToStorage('rejected_offers', rejectedOffers);

    // حذف العرض
    const filteredOffers = offers.filter(o => o.id !== offerId);
    this.saveToStorage('offers', filteredOffers);

    return { success: true };
  }

  // الحصول على العروض المرفوضة
  async getRejectedOffers() {
    if (this.isElectron) {
      const sql = `SELECT ro.*, c.client_name, c.company_code 
                   FROM rejected_offers ro 
                   LEFT JOIN clients c ON ro.client_id = c.id 
                   ORDER BY ro.created_at DESC`;
      return await ipcRenderer.invoke('database-query', sql);
    }
    
    const rejectedOffers = this.getFromStorage('rejected_offers');
    const clients = this.getFromStorage('clients');
    
    return rejectedOffers.map(offer => {
      const client = clients.find(c => c.id === offer.client_id);
      return {
        ...offer,
        client_name: client?.client_name || 'غير محدد',
        company_code: client?.company_code || ''
      };
    });
  }

  // ==================== عمليات الخدمات ====================

  // الحصول على جميع الخدمات
  async getServices() {
    if (this.isElectron) {
      const sql = `SELECT s.*, c.client_name, c.company_code 
                   FROM services s 
                   LEFT JOIN clients c ON s.client_id = c.id 
                   ORDER BY s.created_at DESC`;
      return await ipcRenderer.invoke('database-query', sql);
    }
    
    const services = this.getFromStorage('services');
    const clients = this.getFromStorage('clients');
    
    return services.map(service => {
      const client = clients.find(c => c.id === service.client_id);
      return {
        ...service,
        client_name: client?.client_name || 'غير محدد',
        company_code: client?.company_code || ''
      };
    });
  }

  // إرسال خدمة للتنفيذ
  async sendServiceToExecution(serviceId) {
    if (this.isElectron) {
      // سيتم تنفيذ هذا لاحقاً
      return { success: true };
    }

    const services = this.getFromStorage('services');
    const execution = this.getFromStorage('execution');
    
    const service = services.find(s => s.id === serviceId);
    if (!service) return { success: false };

    // إنشاء تنفيذ جديد
    const newExecution = {
      id: this.generateId('execution'),
      service_id: service.id,
      client_id: service.client_id,
      execution_start_date: new Date().toISOString().split('T')[0],
      status: 'in_progress',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    execution.unshift(newExecution);
    this.saveToStorage('execution', execution);

    // حذف الخدمة
    const filteredServices = services.filter(s => s.id !== serviceId);
    this.saveToStorage('services', filteredServices);

    return { success: true };
  }
}

// إنشاء مثيل واحد من الخدمة
const databaseService = new DatabaseService();

export default databaseService;