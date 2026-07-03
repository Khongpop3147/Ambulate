import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function RegisterNurse() {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
    }

    setLoading(true);
    try {
      await authAPI.register({
        username: formData.username,
        name: formData.name,
        password: formData.password
      });
      alert('ลงทะเบียนสำเร็จ กรุณาเข้าสู่ระบบ');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'ลงทะเบียนไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-card">
        <div className="auth-header">
          <h2 className="auth-title">ลงทะเบียนพยาบาล</h2>
        </div>

        <form onSubmit={handleRegister} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">ชื่อผู้ใช้ / รหัสพนักงาน</label>
            <input
              type="text"
              name="username"
              className="form-input"
              value={formData.username}
              onChange={handleChange}
              placeholder="ตั้งชื่อผู้ใช้"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">ชื่อ-นามสกุล</label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="กรอกชื่อ-นามสกุล"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">รหัสผ่าน</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="ตั้งรหัสผ่าน"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">ยืนยันรหัสผ่าน</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-input"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="ยืนยันรหัสผ่านอีกครั้ง"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
          </button>
        </form>

        <div className="auth-footer">
          <p>มีบัญชีอยู่แล้ว?</p>
          <Link to="/login" className="auth-link">กลับไปหน้าเข้าสู่ระบบ</Link>
        </div>
      </div>
    </div>
  );
}
