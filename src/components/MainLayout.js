import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../utils/i18n';

const MainLayout = ({ children, currentUser, onLogout }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // عناصر القائمة الجانبية
  const menuItems = [
    {
      key: 'dashboard',
      path: '/dashboard',
      icon: 'fas fa-tachometer-alt',
      label: t('navigation.dashboard')
    },
    {
      key: 'clients',
      path: '/clients',
      icon: 'fas fa-users',
      label: t('navigation.clients')
    },
    {
      key: 'offers',
      path: '/offers',
      icon: 'fas fa-file-alt',
      label: t('navigation.offers')
    },
    {
      key: 'rejected-offers',
      path: '/rejected-offers',
      icon: 'fas fa-times-circle',
      label: t('navigation.rejected_offers')
    },
    {
      key: 'services',
      path: '/services',
      icon: 'fas fa-cogs',
      label: t('navigation.services')
    },
    {
      key: 'execution',
      path: '/execution',
      icon: 'fas fa-play-circle',
      label: t('navigation.execution')
    },
    {
      key: 'deliveries',
      path: '/deliveries',
      icon: 'fas fa-truck',
      label: t('navigation.deliveries')
    },
    {
      key: 'accounts',
      path: '/accounts',
      icon: 'fas fa-dollar-sign',
      label: t('navigation.accounts')
    },
    {
      key: 'renewals',
      path: '/renewals',
      icon: 'fas fa-redo',
      label: t('navigation.renewals')
    },
    {
      key: 'settings',
      path: '/settings',
      icon: 'fas fa-cog',
      label: t('navigation.settings')
    }
  ];

  // التحقق من العنصر النشط
  const isActiveItem = (path) => {
    return location.pathname === path;
  };

  // التنقل لصفحة
  const navigateToPage = (path) => {
    navigate(path);
  };

  // تبديل اللغة
  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    changeLanguage(newLang);
  };

  // تبديل الشريط الجانبي
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className={`main-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* الشريط الجانبي */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <i className="fas fa-building"></i>
            {!sidebarCollapsed && <span>Nile Center</span>}
          </div>
          <button 
            className="sidebar-toggle"
            onClick={toggleSidebar}
            title={sidebarCollapsed ? 'توسيع' : 'طي'}
          >
            <i className={`fas fa-${sidebarCollapsed ? 'angle-right' : 'angle-left'}`}></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => (
              <li key={item.key}>
                <button
                  className={`nav-item ${isActiveItem(item.path) ? 'active' : ''}`}
                  onClick={() => navigateToPage(item.path)}
                  title={sidebarCollapsed ? item.label : ''}
                >
                  <i className={item.icon}></i>
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button 
            className="nav-item logout-btn"
            onClick={onLogout}
            title={sidebarCollapsed ? t('navigation.logout') : ''}
          >
            <i className="fas fa-sign-out-alt"></i>
            {!sidebarCollapsed && <span>{t('navigation.logout')}</span>}
          </button>
        </div>
      </aside>

      {/* المحتوى الرئيسي */}
      <div className="main-content">
        {/* الهيدر */}
        <header className="main-header">
          <div className="header-left">
            <h1 className="page-title">
              {menuItems.find(item => item.path === location.pathname)?.label || t('navigation.dashboard')}
            </h1>
          </div>

          <div className="header-right">
            {/* زر تغيير اللغة */}
            <button 
              className="header-btn language-btn"
              onClick={toggleLanguage}
              title={t('app.language')}
            >
              <i className="fas fa-globe"></i>
              <span>{i18n.language === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            {/* إشعارات */}
            <button className="header-btn notification-btn" title="الإشعارات">
              <i className="fas fa-bell"></i>
              <span className="notification-badge">3</span>
            </button>

            {/* معلومات المستخدم */}
            <div className="user-info">
              <div className="user-avatar">
                <i className="fas fa-user"></i>
              </div>
              <div className="user-details">
                <span className="user-name">{currentUser?.fullName}</span>
                <span className="user-role">{currentUser?.role}</span>
              </div>
            </div>
          </div>
        </header>

        {/* محتوى الصفحة */}
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;