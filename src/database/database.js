const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { app } = require('electron');

// تحديد مسار قاعدة البيانات
const dbPath = app ? 
  path.join(app.getPath('userData'), 'nile_crm.db') : 
  path.join(__dirname, '../../nile_crm.db');

class Database {
  constructor() {
    this.db = null;
    this.init();
  }

  // تهيئة قاعدة البيانات
  init() {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('خطأ في فتح قاعدة البيانات:', err);
      } else {
        console.log('تم الاتصال بقاعدة البيانات بنجاح');
        this.createTables();
      }
    });
  }

  // إنشاء الجداول
  createTables() {
    const tables = [
      // جدول المستخدمين
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // جدول العملاء
      `CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_code TEXT UNIQUE NOT NULL,
        client_name TEXT NOT NULL,
        address TEXT,
        manager TEXT,
        phone TEXT,
        intermediary TEXT,
        intermediary_phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // جدول العروض
      `CREATE TABLE IF NOT EXISTS offers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL,
        offer_title TEXT NOT NULL,
        offer_description TEXT,
        offer_amount DECIMAL(10,2) NOT NULL,
        offer_date DATE NOT NULL,
        validity_period INTEGER DEFAULT 30,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients (id)
      )`,

      // جدول العروض المرفوضة
      `CREATE TABLE IF NOT EXISTS rejected_offers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL,
        offer_title TEXT NOT NULL,
        offer_description TEXT,
        offer_amount DECIMAL(10,2) NOT NULL,
        offer_date DATE NOT NULL,
        rejection_reason TEXT,
        rejection_date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients (id)
      )`,

      // جدول الخدمات
      `CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL,
        service_title TEXT NOT NULL,
        service_description TEXT,
        service_amount DECIMAL(10,2) NOT NULL,
        start_date DATE,
        expected_end_date DATE,
        status TEXT DEFAULT 'approved',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients (id)
      )`,

      // جدول التنفيذ والمعاينة
      `CREATE TABLE IF NOT EXISTS execution (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_id INTEGER NOT NULL,
        client_id INTEGER NOT NULL,
        execution_start_date DATE,
        execution_end_date DATE,
        preview_date DATE,
        execution_notes TEXT,
        status TEXT DEFAULT 'in_progress',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (service_id) REFERENCES services (id),
        FOREIGN KEY (client_id) REFERENCES clients (id)
      )`,

      // جدول التسليمات
      `CREATE TABLE IF NOT EXISTS deliveries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        execution_id INTEGER NOT NULL,
        client_id INTEGER NOT NULL,
        delivery_date DATE NOT NULL,
        delivery_notes TEXT,
        client_acceptance TEXT DEFAULT 'pending',
        status TEXT DEFAULT 'delivered',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (execution_id) REFERENCES execution (id),
        FOREIGN KEY (client_id) REFERENCES clients (id)
      )`,

      // جدول الحسابات
      `CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        delivery_id INTEGER NOT NULL,
        client_id INTEGER NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        paid_amount DECIMAL(10,2) DEFAULT 0,
        remaining_amount DECIMAL(10,2) NOT NULL,
        due_date DATE,
        payment_status TEXT DEFAULT 'unpaid',
        invoice_number TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (delivery_id) REFERENCES deliveries (id),
        FOREIGN KEY (client_id) REFERENCES clients (id)
      )`,

      // جدول التجديدات
      `CREATE TABLE IF NOT EXISTS renewals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL,
        service_title TEXT NOT NULL,
        original_service_id INTEGER,
        renewal_date DATE NOT NULL,
        expiry_date DATE NOT NULL,
        notification_sent BOOLEAN DEFAULT FALSE,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients (id),
        FOREIGN KEY (original_service_id) REFERENCES services (id)
      )`,

      // جدول الإعدادات
      `CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        setting_key TEXT UNIQUE NOT NULL,
        setting_value TEXT NOT NULL,
        setting_type TEXT DEFAULT 'string',
        description TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    // تنفيذ إنشاء الجداول
    tables.forEach((tableSQL, index) => {
      this.db.run(tableSQL, (err) => {
        if (err) {
          console.error(`خطأ في إنشاء الجدول ${index + 1}:`, err);
        }
      });
    });

    // إدراج البيانات الافتراضية
    this.insertDefaultData();
  }

  // إدراج البيانات الافتراضية
  insertDefaultData() {
    // إنشاء مستخدم افتراضي
    const defaultUser = `INSERT OR IGNORE INTO users (username, password, full_name, role) 
                        VALUES ('admin', 'admin123', 'مدير النظام', 'admin')`;
    
    this.db.run(defaultUser, (err) => {
      if (err) {
        console.error('خطأ في إنشاء المستخدم الافتراضي:', err);
      }
    });

    // إعدادات افتراضية
    const defaultSettings = [
      ['app_language', 'ar', 'string', 'لغة التطبيق الافتراضية'],
      ['backup_auto', 'true', 'boolean', 'النسخ الاحتياطي التلقائي'],
      ['backup_interval', '7', 'number', 'فترة النسخ الاحتياطي بالأيام'],
      ['renewal_notification_days', '10', 'number', 'أيام التنبيه قبل انتهاء الخدمة'],
      ['company_name', 'Nile Center', 'string', 'اسم الشركة'],
      ['invoice_prefix', 'INV', 'string', 'بادئة رقم الفاتورة']
    ];

    defaultSettings.forEach(([key, value, type, description]) => {
      const settingSQL = `INSERT OR IGNORE INTO settings (setting_key, setting_value, setting_type, description) 
                         VALUES (?, ?, ?, ?)`;
      this.db.run(settingSQL, [key, value, type, description]);
    });
  }

  // تنفيذ استعلام
  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // تنفيذ استعلام واحد
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // تنفيذ تحديث أو إدراج
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  // إغلاق قاعدة البيانات
  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // نسخ احتياطي لقاعدة البيانات
  async backup(backupPath) {
    try {
      const fs = require('fs');
      const source = fs.createReadStream(dbPath);
      const destination = fs.createWriteStream(backupPath);
      
      source.pipe(destination);
      
      return new Promise((resolve, reject) => {
        destination.on('close', resolve);
        destination.on('error', reject);
      });
    } catch (error) {
      throw error;
    }
  }

  // استعادة نسخة احتياطية
  async restore(backupPath) {
    try {
      const fs = require('fs');
      
      // إغلاق قاعدة البيانات الحالية
      await this.close();
      
      // نسخ النسخة الاحتياطية
      const source = fs.createReadStream(backupPath);
      const destination = fs.createWriteStream(dbPath);
      
      source.pipe(destination);
      
      return new Promise((resolve, reject) => {
        destination.on('close', () => {
          // إعادة تهيئة قاعدة البيانات
          this.init();
          resolve();
        });
        destination.on('error', reject);
      });
    } catch (error) {
      throw error;
    }
  }
}

// إنشاء مثيل واحد من قاعدة البيانات
const database = new Database();

module.exports = database;