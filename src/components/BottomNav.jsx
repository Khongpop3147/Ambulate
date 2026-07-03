import React from 'react';
import { NavLink } from 'react-router-dom';

export default function BottomNav({ unreadCount = 0 }) {
  return (
    <nav className="bottom-nav">
      <NavLink
        to="/"
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        end
      >
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span className="nav-label">Dashboard</span>
      </NavLink>

      <NavLink
        to="/register"
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
        <span className="nav-label">ลงทะเบียน</span>
      </NavLink>

      <NavLink
        to="/notifications"
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <span className="nav-label">แจ้งเตือน</span>
        {unreadCount > 0 && (
          <span className="nav-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </NavLink>
    </nav>
  );
}
