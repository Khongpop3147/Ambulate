import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import PatientRegistration from './pages/PatientRegistration';
import PatientDetail from './pages/PatientDetail';
import PreAmbulationAssessment from './pages/PreAmbulationAssessment';
import AmbulationRecord from './pages/AmbulationRecord';
import Notifications from './pages/Notifications';
import { notificationAPI } from './services/api';

export default function App() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await notificationAPI.getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Toast system
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
    <BrowserRouter>
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
          <Route path="/" element={<Dashboard />} />
          <Route path="/register" element={<PatientRegistration showToast={showToast} />} />
          <Route path="/patient/:id" element={<PatientDetail showToast={showToast} />} />
          <Route path="/patient/:id/assessment" element={<PreAmbulationAssessment showToast={showToast} />} />
          <Route path="/patient/:id/ambulation" element={<AmbulationRecord showToast={showToast} />} />
          <Route path="/notifications" element={<Notifications showToast={showToast} />} />
        </Routes>
      </div>

      <BottomNav unreadCount={unreadCount} />
    </BrowserRouter>
  );
}
