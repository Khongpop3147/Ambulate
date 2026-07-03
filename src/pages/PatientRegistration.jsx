import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addHours } from 'date-fns';
import { th } from 'date-fns/locale';
import { patientAPI } from '../services/api';

const surgeryTypes = [
  'ผ่าตัดช่องท้อง (Abdominal Surgery)',
  'ผ่าตัดกระดูกและข้อ (Orthopedic Surgery)',
  'ผ่าตัดทรวงอก (Thoracic Surgery)',
  'ผ่าตัดหัวใจ (Cardiac Surgery)',
  'ผ่าตัดสมอง (Neurosurgery)',
  'ผ่าตัดทางนรีเวช (Gynecological Surgery)',
  'ผ่าตัดทางระบบทางเดินปัสสาวะ (Urological Surgery)',
  'อื่นๆ',
];

const clinicalOptions = [
  { key: 'hasIVLine', label: 'มีสาย IV Line' },
  { key: 'hasDrain', label: 'มี Drain / สายระบาย' },
  { key: 'hasCatheter', label: 'มีสายสวนปัสสาวะ (Foley catheter)' },
  { key: 'hasOxygenSupport', label: 'ใช้ออกซิเจน' },
  { key: 'hasPCA', label: 'มี PCA / Pain pump' },
];

export default function PatientRegistration({ showToast }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    an: '',
    name: '',
    age: '',
    gender: '',
    surgeryType: '',
    surgeryDate: '',
    surgeryTime: '',
    reminderHours: 6,
    clinicalInfo: {
      hasIVLine: false,
      hasDrain: false,
      hasCatheter: false,
      hasOxygenSupport: false,
      hasPCA: false,
    },
    restrictionNote: '',
  });

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const updateClinical = (key, value) => {
    setForm((prev) => ({
      ...prev,
      clinicalInfo: { ...prev.clinicalInfo, [key]: value },
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.an || !/^\d{8}$/.test(form.an)) {
      newErrors.an = 'กรุณากรอก AN 8 หลัก';
    }
    if (!form.name.trim()) {
      newErrors.name = 'กรุณากรอกชื่อ-นามสกุล';
    }
    if (!form.age || form.age < 1 || form.age > 150) {
      newErrors.age = 'กรุณากรอกอายุที่ถูกต้อง';
    }
    if (!form.gender) {
      newErrors.gender = 'กรุณาเลือกเพศ';
    }
    if (!form.surgeryType) {
      newErrors.surgeryType = 'กรุณาเลือกชนิดการผ่าตัด';
    }
    if (!form.surgeryDate) {
      newErrors.surgeryDate = 'กรุณาเลือกวันที่ผ่าตัด';
    }
    if (!form.surgeryTime) {
      newErrors.surgeryTime = 'กรุณาเลือกเวลาผ่าตัด';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getSchedulePreview = () => {
    if (!form.surgeryDate || !form.surgeryTime) return null;
    try {
      const surgeryDateTime = new Date(`${form.surgeryDate}T${form.surgeryTime}`);
      const scheduledTime = addHours(surgeryDateTime, form.reminderHours);
      return format(scheduledTime, 'dd MMMM yyyy เวลา HH:mm น.', { locale: th });
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const surgeryDateTime = new Date(`${form.surgeryDate}T${form.surgeryTime}`);
      const scheduledAt = addHours(surgeryDateTime, form.reminderHours);

      await patientAPI.create({
        an: form.an,
        name: form.name,
        age: parseInt(form.age),
        gender: form.gender,
        surgeryType: form.surgeryType,
        surgeryDate: surgeryDateTime.toISOString(),
        reminderHours: form.reminderHours,
        scheduledAt: scheduledAt.toISOString(),
        clinicalInfo: form.clinicalInfo,
        restrictionNote: form.restrictionNote,
      });

      showToast?.('ลงทะเบียนผู้ป่วยสำเร็จ', 'success');
      navigate('/');
    } catch (err) {
      showToast?.(err.message || 'เกิดข้อผิดพลาด', 'error');
    } finally {
      setLoading(false);
    }
  };

  const schedulePreview = getSchedulePreview();

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div>
          <h1 className="page-title">ลงทะเบียนผู้ป่วย</h1>
          <p className="page-subtitle">เพิ่มผู้ป่วยหลังผ่าตัดเข้าสู่ระบบ</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ข้อมูลผู้ป่วย */}
        <div className="form-section">
          <h2 className="form-section-title">
            <span className="section-icon">👤</span>
            ข้อมูลผู้ป่วย
          </h2>

          <div className="form-group">
            <label className="form-label">
              AN (เลขที่ผู้ป่วย) <span className="required">*</span>
            </label>
            <input
              type="text"
              className={`form-input ${errors.an ? 'error' : ''}`}
              placeholder="เช่น 66012345"
              maxLength={8}
              value={form.an}
              onChange={(e) => updateField('an', e.target.value.replace(/\D/g, ''))}
            />
            {errors.an && <div className="form-error">{errors.an}</div>}
            <div className="form-hint">กรอกตัวเลข 8 หลัก</div>
          </div>

          <div className="form-group">
            <label className="form-label">
              ชื่อ-นามสกุล <span className="required">*</span>
            </label>
            <input
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="เช่น นายสมชาย ใจดี"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
            />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                อายุ <span className="required">*</span>
              </label>
              <input
                type="number"
                className={`form-input ${errors.age ? 'error' : ''}`}
                placeholder="ปี"
                min="1"
                max="150"
                value={form.age}
                onChange={(e) => updateField('age', e.target.value)}
              />
              {errors.age && <div className="form-error">{errors.age}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">
                เพศ <span className="required">*</span>
              </label>
              <div className="gender-selector">
                <div
                  className={`gender-option ${form.gender === 'ชาย' ? 'selected' : ''}`}
                  onClick={() => updateField('gender', 'ชาย')}
                >
                  <span className="gender-icon">👨</span>
                  ชาย
                </div>
                <div
                  className={`gender-option ${form.gender === 'หญิง' ? 'selected' : ''}`}
                  onClick={() => updateField('gender', 'หญิง')}
                >
                  <span className="gender-icon">👩</span>
                  หญิง
                </div>
              </div>
              {errors.gender && <div className="form-error">{errors.gender}</div>}
            </div>
          </div>
        </div>

        {/* ข้อมูลการผ่าตัด */}
        <div className="form-section">
          <h2 className="form-section-title">
            <span className="section-icon">🏥</span>
            ข้อมูลการผ่าตัด
          </h2>

          <div className="form-group">
            <label className="form-label">
              ชนิดการผ่าตัด <span className="required">*</span>
            </label>
            <select
              className={`form-input ${errors.surgeryType ? 'error' : ''}`}
              value={form.surgeryType}
              onChange={(e) => updateField('surgeryType', e.target.value)}
            >
              <option value="">-- เลือกชนิดการผ่าตัด --</option>
              {surgeryTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.surgeryType && <div className="form-error">{errors.surgeryType}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                วันที่ผ่าตัด <span className="required">*</span>
              </label>
              <input
                type="date"
                className={`form-input ${errors.surgeryDate ? 'error' : ''}`}
                value={form.surgeryDate}
                onChange={(e) => updateField('surgeryDate', e.target.value)}
              />
              {errors.surgeryDate && <div className="form-error">{errors.surgeryDate}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">
                เวลาผ่าตัด <span className="required">*</span>
              </label>
              <input
                type="time"
                className={`form-input ${errors.surgeryTime ? 'error' : ''}`}
                value={form.surgeryTime}
                onChange={(e) => updateField('surgeryTime', e.target.value)}
              />
              {errors.surgeryTime && <div className="form-error">{errors.surgeryTime}</div>}
            </div>
          </div>
        </div>

        {/* การตั้งเวลา */}
        <div className="form-section">
          <h2 className="form-section-title">
            <span className="section-icon">⏰</span>
            การตั้งเวลาแจ้งเตือน
          </h2>

          <div className="form-group">
            <label className="form-label">ระยะเวลาหลังผ่าตัด</label>
            <div className="reminder-selector">
              <div
                className={`reminder-option ${form.reminderHours === 6 ? 'selected' : ''}`}
                onClick={() => updateField('reminderHours', 6)}
              >
                <div className="reminder-hours">6</div>
                <div className="reminder-label">ชั่วโมง</div>
              </div>
              <div
                className={`reminder-option ${form.reminderHours === 12 ? 'selected' : ''}`}
                onClick={() => updateField('reminderHours', 12)}
              >
                <div className="reminder-hours">12</div>
                <div className="reminder-label">ชั่วโมง</div>
              </div>
            </div>
          </div>

          {schedulePreview && (
            <div className="schedule-preview">
              <div className="schedule-label">📅 เวลาที่กำหนดประเมิน</div>
              <div className="schedule-time-text">{schedulePreview}</div>
              <div className="schedule-note">
                ระบบจะแจ้งเตือนเมื่อถึงเวลาที่กำหนด
              </div>
            </div>
          )}
        </div>

        {/* ข้อมูลคลินิก */}
        <div className="form-section">
          <h2 className="form-section-title">
            <span className="section-icon">📋</span>
            ข้อมูลทางคลินิก
          </h2>

          <div className="checkbox-group">
            {clinicalOptions.map((opt) => (
              <label
                key={opt.key}
                className={`checkbox-item ${form.clinicalInfo[opt.key] ? 'checked' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={form.clinicalInfo[opt.key]}
                  onChange={(e) => updateClinical(opt.key, e.target.checked)}
                />
                <span className="checkbox-label">{opt.label}</span>
              </label>
            ))}
          </div>

          {Object.values(form.clinicalInfo).some(Boolean) && (
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">หมายเหตุ / ข้อจำกัดในการเคลื่อนไหว</label>
              <textarea
                className="form-textarea"
                placeholder="ระบุข้อจำกัดเพิ่มเติม (ถ้ามี)..."
                value={form.restrictionNote}
                onChange={(e) => updateField('restrictionNote', e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="btn-spinner" />
              กำลังบันทึก...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              ลงทะเบียนผู้ป่วย
            </>
          )}
        </button>
      </form>
    </div>
  );
}
