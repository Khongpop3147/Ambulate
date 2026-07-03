import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Bell, Shield, HelpCircle } from 'lucide-react';

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <>
      <Header title="ตั้งค่า" />
      
      <div className="page-content">
        <div className="detail-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="profile-avatar" style={{ width: 64, height: 64 }}>
            <User size={32} />
          </div>
          <div>
            <h2 style={{ fontSize: 18, color: 'var(--primary-blue)', marginBottom: 4 }}>{user?.name || 'พยาบาลวิชาชีพ'}</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>ID: {user?.username || 'NURSE-01'}</p>
          </div>
        </div>

        <h3 className="section-title">ตั้งค่าทั่วไป</h3>
        
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border-color)', overflow: 'hidden', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Bell size={20} color="var(--primary-blue)" />
              <span style={{ fontSize: 14, fontWeight: 500 }}>การแจ้งเตือน</span>
            </div>
            {/* Simple toggle switch pure CSS */}
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ width: 18, height: 18, accentColor: 'var(--primary-blue)' }} />
            </label>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Shield size={20} color="var(--primary-blue)" />
              <span style={{ fontSize: 14, fontWeight: 500 }}>ความเป็นส่วนตัว</span>
            </div>
            <span style={{ color: 'var(--text-muted)' }}>&gt;</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <HelpCircle size={20} color="var(--primary-blue)" />
              <span style={{ fontSize: 14, fontWeight: 500 }}>ช่วยเหลือและสนับสนุน</span>
            </div>
            <span style={{ color: 'var(--text-muted)' }}>&gt;</span>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="btn btn-danger" 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 32 }}
        >
          <LogOut size={20} />
          ออกจากระบบ
        </button>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'var(--text-muted)' }}>
          SARA Version 1.0.0
        </div>
      </div>
    </>
  );
}
