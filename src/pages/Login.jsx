import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Activity } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authAPI.login({ username, password });
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.message || 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        
        <div className="auth-logo-container">
          <div className="auth-logo-box">
            {/* Custom walking icon to match Figma */}
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="1.5"></circle>
              <path d="M12 7L9 11l-2 1"></path>
              <path d="M12 7v5l2 3"></path>
              <path d="M14 15l-1 5"></path>
              <path d="M9 11l2 6 2 4"></path>
            </svg>
          </div>
          <div className="auth-title-text">
            <span className="auth-title-sara">SARA</span>
            <span className="auth-title-sub">Smart Ambulation</span>
            <span className="auth-title-sub">Reminder & Assessment</span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <input
            type="text"
            className="form-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />

          <input
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />

          <div className="auth-options">
            <label className="auth-checkbox">
              <input type="checkbox" />
              <span>จำฉันไว้</span>
            </label>
            <Link to="#" className="auth-link">ลืมรหัสผ่าน?</Link>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
        
        <div className="auth-footer" style={{ marginTop: '24px' }}>
           <Link to="/register-nurse" className="auth-link" style={{ fontSize: '13px' }}>ลงทะเบียนพยาบาลใหม่</Link>
        </div>
      </div>
    </div>
  );
}
