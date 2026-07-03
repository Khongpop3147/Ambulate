import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { ambulationAPI } from '../services/api';
import Header from '../components/Header';

export default function AmbulationRecord({ showToast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [assistLevel, setAssistLevel] = useState('Walker');
  const [tolerance, setTolerance] = useState('ดี');
  const [distance, setDistance] = useState('50');
  const [duration, setDuration] = useState('6');
  const [notes, setNotes] = useState('');
  
  const [symptoms, setSymptoms] = useState({
    none: true,
    dizzy: false,
    tired: false,
    pain: false
  });
  
  const [loading, setLoading] = useState(false);

  // Mock static time to match Figma
  const staticTime = format(new Date(), 'd MMM yyyy HH:mm', { locale: th });

  const handleSymptomChange = (key) => {
    if (key === 'none') {
      setSymptoms({ none: true, dizzy: false, tired: false, pain: false });
    } else {
      setSymptoms({ ...symptoms, none: false, [key]: !symptoms[key] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let symptomsAfter = [];
      if (symptoms.none) symptomsAfter.push('ไม่มีอาการผิดปกติ');
      if (symptoms.dizzy) symptomsAfter.push('เวียนศีรษะ');
      if (symptoms.tired) symptomsAfter.push('เหนื่อย');
      if (symptoms.pain) symptomsAfter.push('ปวดแผล');

      await ambulationAPI.create({
        patientId: id,
        startTime: new Date(), // Using current time for actual submission
        endTime: new Date(Date.now() + duration * 60000), 
        distance,
        duration,
        assistLevel,
        symptomsDuring: tolerance,
        symptomsAfter: symptomsAfter.join(', '),
        symptomsNote: notes
      });

      showToast('บันทึกผลการเดินเรียบร้อยแล้ว');
      navigate('/');
    } catch (error) {
      showToast(error.message || 'เกิดข้อผิดพลาดในการบันทึก', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header title="บันทึกผลการ Ambulate" showBack={true} />
      
      <div className="page-content">
        <form onSubmit={handleSubmit}>
          
          <div className="info-row" style={{ alignItems: 'center' }}>
            <span className="info-label">เวลาเริ่ม</span>
            <input 
              type="text" 
              className="form-input" 
              style={{ width: '60%', margin: 0, textAlign: 'center' }} 
              value={staticTime}
              readOnly
            />
          </div>
          
          <div className="info-row" style={{ margin: '16px 0', fontWeight: 'bold' }}>
            <span>รอบที่ 1</span>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div className="info-label" style={{ marginBottom: 8 }}>ระดับการช่วยเหลือ</div>
            <div className="segmented-control">
              {['เดินเอง', 'พยุง', 'Walker'].map(level => (
                <button
                  key={level}
                  type="button"
                  className={`segment-btn ${assistLevel === level ? 'active' : ''}`}
                  onClick={() => setAssistLevel(level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div className="info-label" style={{ marginBottom: 8 }}>ระยะทาง/เวลา</div>
            <div className="info-row" style={{ alignItems: 'center', justifyContent: 'flex-start', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>เดินได้</span>
                <input 
                  type="number" 
                  className="form-input" 
                  style={{ width: 60, margin: 0, padding: '4px 8px', textAlign: 'center' }}
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                />
                <span>เมตร</span>
              </div>
            </div>
            <div className="info-row" style={{ alignItems: 'center', justifyContent: 'flex-start', gap: 16, marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>ใช้เวลา</span>
                <input 
                  type="number" 
                  className="form-input" 
                  style={{ width: 60, margin: 0, padding: '4px 8px', textAlign: 'center' }}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
                <span>นาที</span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div className="info-label" style={{ marginBottom: 8 }}>การทนต่อกิจกรรม</div>
            <div className="segmented-control">
              {['ดี', 'ปานกลาง', 'ไม่ดี'].map(level => (
                <button
                  key={level}
                  type="button"
                  className={`segment-btn ${tolerance === level ? 'active' : ''}`}
                  onClick={() => setTolerance(level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div className="info-label" style={{ marginBottom: 8 }}>อาการหลัง Ambulate</div>
            <div className="checkbox-list">
              <label className="checkbox-item">
                <input 
                  type="checkbox" 
                  checked={symptoms.none} 
                  onChange={() => handleSymptomChange('none')}
                />
                <span>ไม่มีอาการผิดปกติ</span>
              </label>
              <label className="checkbox-item">
                <input 
                  type="checkbox" 
                  checked={symptoms.dizzy} 
                  onChange={() => handleSymptomChange('dizzy')}
                />
                <span>เวียนศีรษะ</span>
              </label>
              <label className="checkbox-item">
                <input 
                  type="checkbox" 
                  checked={symptoms.tired} 
                  onChange={() => handleSymptomChange('tired')}
                />
                <span>เหนื่อย</span>
              </label>
              <label className="checkbox-item">
                <input 
                  type="checkbox" 
                  checked={symptoms.pain} 
                  onChange={() => handleSymptomChange('pain')}
                />
                <span>ปวดแผล</span>
              </label>
            </div>
          </div>

          <div className="info-row" style={{ alignItems: 'center' }}>
            <span className="info-label">หมายเหตุ</span>
            <input 
              type="text" 
              className="form-input" 
              style={{ width: '70%', margin: 0 }} 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="-"
            />
          </div>

          <div style={{ marginTop: 32 }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
          </div>
          
        </form>
      </div>
    </>
  );
}
