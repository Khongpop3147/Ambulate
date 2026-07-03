import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import PatientRegistration from './pages/PatientRegistration';
import PatientDetail from './pages/PatientDetail';
import PreAmbulationAssessment from './pages/PreAmbulationAssessment';
import AmbulationRecord from './pages/AmbulationRecord';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import RegisterNurse from './pages/RegisterNurse';
import { notificationAPI } from './services/api';
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Main App Content
const AppContent = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const { isAuthenticated } = useAuth();

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await notificationAPI.getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch {
      // Silently fail
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchUnreadCount();
    if (isAuthenticated) {
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchUnreadCount, isAuthenticated]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const getToastIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  return (
    <>
      {/* Toast Container */}
      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast toast-${toast.type}`}>
              <span className="toast-icon">{getToastIcon(toast.type)}</span>
              {toast.message}
            </div>
          ))}
        </div>
      )}

      <div className="app-container">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register-nurse" element={<RegisterNurse />} />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/register" element={<ProtectedRoute><PatientRegistration showToast={showToast} /></ProtectedRoute>} />
          <Route path="/patient/:id" element={<ProtectedRoute><PatientDetail showToast={showToast} /></ProtectedRoute>} />
          <Route path="/patient/:id/assessment" element={<ProtectedRoute><PreAmbulationAssessment showToast={showToast} /></ProtectedRoute>} />
          <Route path="/patient/:id/ambulation" element={<ProtectedRoute><AmbulationRecord showToast={showToast} /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications showToast={showToast} /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
      </div>

      {isAuthenticated && <BottomNav unreadCount={unreadCount} />}
    </>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
