import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { changeLanguage } from '../utils/i18n';

const Login = ({ onLogin }) => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);

  // معالجة تغيير البيانات
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // معالجة إرسال النموذج
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // محاكاة API call للتحقق من بيانات الدخول
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // التحقق من بيانات المستخدم الافتراضي
      if (formData.username === 'admin' && formData.password === 'admin123') {
        const userData = {
          id: 1,
          username: 'admin',
          fullName: 'مدير النظام',
          role: 'admin'
        };
        
        onLogin(userData);
        toast.success(t('auth.welcome'));
      } else {
        toast.error(t('auth.login_error'));
      }
    } catch (error) {
      toast.error(t('app.error'));
    } finally {
      setLoading(false);
    }
  };

  // تغيير اللغة
  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    changeLanguage(newLang);
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-overlay"></div>
      </div>
      
      <div className="login-content">
        {/* زر تغيير اللغة */}
        <div className="language-toggle">
          <button 
            type="button" 
            onClick={toggleLanguage}
            className="language-btn"
            title={t('app.language')}
          >
            <i className="fas fa-globe"></i>
            <span>{i18n.language === 'ar' ? 'EN' : 'العربية'}</span>
          </button>
        </div>

        {/* نموذج تسجيل الدخول */}
        <div className="login-form-container">
          <div className="login-header">
            <div className="logo">
              <i className="fas fa-building"></i>
            </div>
            <h1>{t('app.title')}</h1>
            <p>{t('auth.welcome')}</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">
                <i className="fas fa-user"></i>
                {t('auth.username')}
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder={t('auth.username')}
                required
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <i className="fas fa-lock"></i>
                {t('auth.password')}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('auth.password')}
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  disabled={loading}
                />
                <span className="checkmark"></span>
                {t('auth.remember_me')}
              </label>
              
              <a href="#forgot" className="forgot-link">
                {t('auth.forgot_password')}
              </a>
            </div>

            <button 
              type="submit" 
              className="login-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  {t('app.loading')}
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  {t('auth.login')}
                </>
              )}
            </button>

            {/* معلومات تسجيل الدخول الافتراضي */}
            <div className="default-credentials">
              <p><strong>بيانات تسجيل الدخول الافتراضية:</strong></p>
              <p>اسم المستخدم: admin</p>
              <p>كلمة المرور: admin123</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;