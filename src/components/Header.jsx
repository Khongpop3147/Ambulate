import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';

export default function Header({ title, showBack = false, showBell = false, rightElement = null }) {
  const navigate = useNavigate();

  return (
    <div className="app-header">
      <div style={{ width: 24, display: 'flex', alignItems: 'center' }}>
        {showBack ? (
          <ArrowLeft className="header-icon" onClick={() => navigate(-1)} />
        ) : (
          <div style={{ width: 24 }} />
        )}
      </div>
      
      <div className="header-title">{title}</div>
      
      <div style={{ width: 24, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        {rightElement ? rightElement : (
          showBell && (
            <div className="header-bell-wrapper" onClick={() => navigate('/notifications')} style={{ cursor: 'pointer' }}>
              <Bell className="header-icon" />
              <div className="header-bell-dot"></div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
