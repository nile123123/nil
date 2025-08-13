import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const Dashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalClients: 0,
    pendingOffers: 0,
    overduePayments: 0,
    upcomingRenewals: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // تحميل البيانات عند تحميل الصفحة
  useEffect(() => {
    loadDashboardData();
  }, []);

  // تحميل بيانات لوحة التحكم
  const loadDashboardData = async () => {
    try {
      // محاكاة تحميل البيانات
      setStats({
        totalClients: 45,
        pendingOffers: 12,
        overduePayments: 8,
        upcomingRenewals: 5
      });

      setRecentActivities([
        {
          id: 1,
          type: 'client_added',
          description: 'تم إضافة عميل جديد: شركة النيل للتجارة',
          time: '2024-01-15 10:30',
          icon: 'fas fa-user-plus',
          color: 'success'
        },
        {
          id: 2,
          type: 'offer_approved',
          description: 'تم اعتماد عرض: تطوير موقع إلكتروني',
          time: '2024-01-15 09:15',
          icon: 'fas fa-check-circle',
          color: 'primary'
        },
        {
          id: 3,
          type: 'payment_received',
          description: 'تم استلام دفعة بقيمة 15,000 جنيه',
          time: '2024-01-14 16:45',
          icon: 'fas fa-money-bill',
          color: 'success'
        },
        {
          id: 4,
          type: 'service_delivered',
          description: 'تم تسليم خدمة: تصميم هوية بصرية',
          time: '2024-01-14 14:20',
          icon: 'fas fa-truck',
          color: 'info'
        }
      ]);

      setNotifications([
        {
          id: 1,
          type: 'renewal',
          title: 'تجديدات قادمة',
          message: '5 خدمات تحتاج للتجديد خلال الأسبوع القادم',
          priority: 'high',
          date: '2024-01-15'
        },
        {
          id: 2,
          type: 'payment',
          title: 'مدفوعات متأخرة',
          message: '8 فواتير متأخرة السداد',
          priority: 'medium',
          date: '2024-01-14'
        },
        {
          id: 3,
          type: 'offer',
          title: 'عروض معلقة',
          message: '12 عرض في انتظار الموافقة',
          priority: 'low',
          date: '2024-01-13'
        }
      ]);
    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error);
    }
  };

  // بطاقة إحصائية
  const StatCard = ({ title, value, icon, color, trend }) => (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">
        <i className={icon}></i>
      </div>
      <div className="stat-content">
        <h3>{value}</h3>
        <p>{title}</p>
        {trend && (
          <div className={`stat-trend ${trend.type}`}>
            <i className={`fas fa-arrow-${trend.type === 'up' ? 'up' : 'down'}`}></i>
            <span>{trend.value}%</span>
          </div>
        )}
      </div>
    </div>
  );

  // عنصر نشاط حديث
  const ActivityItem = ({ activity }) => (
    <div className="activity-item">
      <div className={`activity-icon ${activity.color}`}>
        <i className={activity.icon}></i>
      </div>
      <div className="activity-content">
        <p>{activity.description}</p>
        <span className="activity-time">{activity.time}</span>
      </div>
    </div>
  );

  // عنصر إشعار
  const NotificationItem = ({ notification }) => (
    <div className={`notification-item ${notification.priority}`}>
      <div className="notification-header">
        <h4>{notification.title}</h4>
        <span className="notification-date">{notification.date}</span>
      </div>
      <p>{notification.message}</p>
    </div>
  );

  return (
    <div className="dashboard">
      {/* رسالة الترحيب */}
      <div className="welcome-section">
        <h1>{t('dashboard.welcome_message')}</h1>
        <p>اليوم هو {new Date().toLocaleDateString('ar-EG', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="stats-grid">
        <StatCard
          title={t('dashboard.total_clients')}
          value={stats.totalClients}
          icon="fas fa-users"
          color="primary"
          trend={{ type: 'up', value: 12 }}
        />
        <StatCard
          title={t('dashboard.pending_offers')}
          value={stats.pendingOffers}
          icon="fas fa-file-alt"
          color="warning"
          trend={{ type: 'down', value: 5 }}
        />
        <StatCard
          title={t('dashboard.overdue_payments')}
          value={stats.overduePayments}
          icon="fas fa-exclamation-triangle"
          color="danger"
          trend={{ type: 'up', value: 8 }}
        />
        <StatCard
          title={t('dashboard.upcoming_renewals')}
          value={stats.upcomingRenewals}
          icon="fas fa-redo"
          color="info"
          trend={{ type: 'down', value: 3 }}
        />
      </div>

      {/* المحتوى الرئيسي */}
      <div className="dashboard-content">
        {/* العمود الأيسر */}
        <div className="dashboard-left">
          {/* الأنشطة الحديثة */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>
                <i className="fas fa-clock"></i>
                {t('dashboard.recent_activities')}
              </h2>
              <button className="btn-link">عرض الكل</button>
            </div>
            <div className="activities-list">
              {recentActivities.map(activity => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </div>

          {/* الإشعارات */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>
                <i className="fas fa-bell"></i>
                {t('dashboard.notifications')}
              </h2>
              <span className="notifications-count">{notifications.length}</span>
            </div>
            <div className="notifications-list">
              {notifications.map(notification => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          </div>
        </div>

        {/* العمود الأيمن */}
        <div className="dashboard-right">
          {/* التقويم */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>
                <i className="fas fa-calendar"></i>
                التقويم
              </h2>
            </div>
            <div className="calendar-container">
              <Calendar
                value={selectedDate}
                onChange={setSelectedDate}
                locale="ar-EG"
                calendarType="gregory"
                showNeighboringMonth={false}
                prev2Label={null}
                next2Label={null}
              />
            </div>
          </div>

          {/* إجراءات سريعة */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>
                <i className="fas fa-bolt"></i>
                إجراءات سريعة
              </h2>
            </div>
            <div className="quick-actions">
              <button className="quick-action-btn primary">
                <i className="fas fa-user-plus"></i>
                إضافة عميل
              </button>
              <button className="quick-action-btn success">
                <i className="fas fa-file-plus"></i>
                إنشاء عرض
              </button>
              <button className="quick-action-btn info">
                <i className="fas fa-dollar-sign"></i>
                تسجيل دفعة
              </button>
              <button className="quick-action-btn warning">
                <i className="fas fa-download"></i>
                نسخ احتياطي
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;