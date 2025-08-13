import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useTranslation } from 'react-i18next';

// استيراد الأنماط
import 'react-toastify/dist/ReactToastify.css';
import './styles/App.css';

// استيراد المكونات
import Login from './pages/Login';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Offers from './pages/Offers';
import RejectedOffers from './pages/RejectedOffers';
import Services from './pages/Services';
import Execution from './pages/Execution';
import Deliveries from './pages/Deliveries';
import Accounts from './pages/Accounts';
import Renewals from './pages/Renewals';
import Settings from './pages/Settings';

// استيراد النظم المساعدة
import './utils/i18n';

function App() {
  const { i18n } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // فحص حالة تسجيل الدخول عند تحميل التطبيق
  useEffect(() => {
    const checkAuth = () => {
      const savedAuth = localStorage.getItem('isAuthenticated');
      const savedUser = localStorage.getItem('currentUser');
      
      if (savedAuth === 'true' && savedUser) {
        setIsAuthenticated(true);
        setCurrentUser(JSON.parse(savedUser));
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  // دالة تسجيل الدخول
  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setCurrentUser(userData);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  // دالة تسجيل الخروج
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
  };

  // مكون محمي للصفحات
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className={`App ${i18n.language === 'ar' ? 'rtl' : 'ltr'}`}>
      <Router>
        <Routes>
          {/* صفحة تسجيل الدخول */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login onLogin={handleLogin} />
              )
            } 
          />
          
          {/* الصفحات المحمية */}
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <MainLayout currentUser={currentUser} onLogout={handleLogout}>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/offers" element={<Offers />} />
                    <Route path="/rejected-offers" element={<RejectedOffers />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/execution" element={<Execution />} />
                    <Route path="/deliveries" element={<Deliveries />} />
                    <Route path="/accounts" element={<Accounts />} />
                    <Route path="/renewals" element={<Renewals />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>

      {/* حاوية الإشعارات */}
      <ToastContainer
        position={i18n.language === 'ar' ? 'top-right' : 'top-left'}
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={i18n.language === 'ar'}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;