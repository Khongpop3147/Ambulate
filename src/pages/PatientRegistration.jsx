import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addHours } from 'date-fns';
import { patientAPI } from '../services/api';
import Header from '../components/Header';
import { User, Activity, Clock, FileText } from 'lucide-react';

export default function PatientRegistration({ showToast }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    an: '',
    name: '',
    age: '',
    gender: 'M',
    surgeryType: '',
    orDischargeTime: '',
    reminderHours: 6,
    restrictionNote: ''
  });

  const surgeryTypes = [
    'ผ่าตัดช่องท้อง (Abdominal)',
    'ผ่าตัดกระดูกและข้อ (Orthopedic)',
    'ผ่าตัดทรวงอก (Thoracic)',
    'ผ่าตัดทางนรีเวช (Gynecological)',
    'อื่นๆ'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.an || !form.name || !form.age || !form.surgeryType || !form.orDischargeTime) {
      showToast('กรุณากรอกข้อมูลสำคัญให้ครบถ้วน', 'error');
      return;
    }

    setLoading(true);
    try {
      const surgeryDateTime = new Date(form.orDischargeTime);
      const scheduledAt = addHours(surgeryDateTime, form.reminderHours);

      await patientAPI.create({
        an: form.an,
        name: form.name,
        age: parseInt(form.age),
        gender: form.gender,
        surgeryType: form.surgeryType,
        orDischargeAt: surgeryDateTime.toISOString(), // Sent as orDischargeAt based on schema
        reminderHours: form.reminderHours,
        scheduledAt: scheduledAt.toISOString(),
        useLaxative: false,
        usePainMed: false,
        hasRestriction: !!form.restrictionNote,
        restrictionNote: form.restrictionNote,
      });

      showToast('ลงทะเบียนผู้ป่วยใหม่สำเร็จ', 'success');
      navigate('/');
    } catch (err) {
      showToast(err.message || 'เกิดข้อผิดพลาดในการบันทึก', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header title="ลงทะเบียนผู้ป่วยใหม่" showBack={true} />
      
      <div className="page-content">
        <form onSubmit={handleSubmit}>
          
          <div className="detail-card" style={{ padding: '20px 16px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: 'var(--primary-blue)', fontWeight: 'bold' }}>
              <User size={18} />
              <span>ข้อมูลผู้ป่วย</span>
            </div>
            
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>เลข AN (8 หลัก)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="เช่น 66012345"
                maxLength={8}
                value={form.an}
                onChange={(e) => setForm({...form, an: e.target.value.replace(/\D/g, '')})}
                style={{ marginBottom: 0 }}
              />
            </div>
            
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>ชื่อ-นามสกุล</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="ชื่อ นามสกุล"
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                style={{ marginBottom: 0 }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>อายุ (ปี)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={form.age}
                  onChange={(e) => setForm({...form, age: e.target.value})}
                  style={{ marginBottom: 0 }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>เพศ</label>
                <div className="segmented-control" style={{ marginBottom: 0 }}>
                  <button type="button" className={`segment-btn ${form.gender === 'M' ? 'active' : ''}`} onClick={() => setForm({...form, gender: 'M'})}>ชาย</button>
                  <button type="button" className={`segment-btn ${form.gender === 'F' ? 'active' : ''}`} onClick={() => setForm({...form, gender: 'F'})}>หญิง</button>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-card" style={{ padding: '20px 16px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: 'var(--primary-blue)', fontWeight: 'bold' }}>
              <Activity size={18} />
              <span>ข้อมูลการผ่าตัด</span>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>ชนิดการผ่าตัด</label>
              <select 
                className="form-input" 
                value={form.surgeryType}
                onChange={(e) => setForm({...form, surgeryType: e.target.value})}
                style={{ marginBottom: 0 }}
              >
                <option value="">-- เลือกชนิด --</option>
                {surgeryTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>วันและเวลาออกจากห้องผ่าตัด (OR Out)</label>
              <input 
                type="datetime-local" 
                className="form-input" 
                value={form.orDischargeTime}
                onChange={(e) => setForm({...form, orDischargeTime: e.target.value})}
                style={{ marginBottom: 0 }}
              />
            </div>
          </div>

          <div className="detail-card" style={{ padding: '20px 16px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: 'var(--primary-blue)', fontWeight: 'bold' }}>
              <Clock size={18} />
              <span>ตั้งเวลาประเมินรอบแรก (ชั่วโมง)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input 
                type="number" 
                className="form-input" 
                value={form.reminderHours}
                onChange={(e) => setForm({...form, reminderHours: parseInt(e.target.value) || ''})}
                style={{ marginBottom: 0, width: '100px', textAlign: 'center', fontSize: 16, fontWeight: 'bold', color: 'var(--primary-blue)' }}
                min="1"
              />
              <span style={{ fontSize: 14, color: 'var(--text-main)', fontWeight: 500 }}>ชั่วโมง</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>(นับจากเวลา OR Out)</span>
            </div>
          </div>

          <div className="detail-card" style={{ padding: '20px 16px', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: 'var(--primary-blue)', fontWeight: 'bold' }}>
              <FileText size={18} />
              <span>หมายเหตุ / ข้อจำกัด (ถ้ามี)</span>
            </div>

            <textarea 
              className="form-input" 
              placeholder="ระบุข้อจำกัดเพิ่มเติมจากแพทย์ หรือสายยางต่างๆ..."
              value={form.restrictionNote}
              onChange={(e) => setForm({...form, restrictionNote: e.target.value})}
              rows={3}
              style={{ marginBottom: 0, resize: 'none' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: 16, fontSize: 16 }} disabled={loading}>
            {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูลผู้ป่วยใหม่'}
          </button>
          
        </form>
      </div>
    </>
  );
}
