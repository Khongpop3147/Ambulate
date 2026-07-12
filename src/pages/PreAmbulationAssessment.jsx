import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assessmentAPI } from '../services/api';
import Header from '../components/Header';
import { CheckCircle2, Circle } from 'lucide-react';

export default function PreAmbulationAssessment({ showToast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [painScore, setPainScore] = useState(2);
  const [loading, setLoading] = useState(false);

  const [vitals, setVitals] = useState({
    bp: '',
    hr: '',
    rr: '',
    spo2: '',
    temp: ''
  });

  const [checks, setChecks] = useState({
    item2: false,
    item3: false,
    item4: false,
    item5: false,
    item6: false,
    item7: false,
    item8: false
  });

  const toggleCheck = (item) => setChecks(prev => ({ ...prev, [item]: !prev[item] }));

  const handleAssessment = async (isReady) => {
    setLoading(true);
    try {
      const [sys, dia] = vitals.bp.split('/').map(n => parseInt(n) || 0);
      
      // Create assessment record based on button clicked
      await assessmentAPI.create({
        patientId: id,
        systolicBP: sys || 120, // default if empty
        diastolicBP: dia || 80,
        heartRate: parseInt(vitals.hr) || 80,
        temperature: parseFloat(vitals.temp) || 36.5,
        painScore: parseInt(painScore),
        isConscious: checks.item2,
        noDoctorRestriction: checks.item3,
        drainSecure: checks.item5,
        noActiveBleeding: checks.item6,
        noOrthostatic: checks.item7,
        noDizziness: checks.item8,
        result: isReady ? 'READY' : 'NOT_READY'
      });
      
      showToast(isReady ? 'บันทึกความพร้อมสำเร็จ' : 'บันทึกสถานะยังไม่พร้อมสำเร็จ', isReady ? 'success' : 'warning');
      
      if (isReady) {
        navigate(`/patient/${id}/ambulation`);
      } else {
        navigate(`/patient/${id}`);
      }
    } catch (error) {
      showToast(error.message || 'เกิดข้อผิดพลาดในการบันทึก', 'error');
    } finally {
      setLoading(false);
    }
  };

  const CheckIcon = () => <CheckCircle2 size={20} color="var(--status-green)" />;

  return (
    <>
      <Header title="Checklist ก่อน Ambulate" showBack={true} />
      
      <div className="page-content">
        <div className="checklist-item">
          <div className="checklist-header">
            <span>1. สัญญาณชีพปกติ</span>
          </div>
          <div className="checklist-vital-grid">
            <div className="vital-row" style={{ marginBottom: 12 }}>
              <span className="vital-label" style={{ width: 60 }}>BP</span>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="text" className="form-input" style={{ margin: 0, padding: '6px 8px' }} placeholder="120/80" value={vitals.bp} onChange={(e) => setVitals({...vitals, bp: e.target.value})} />
                <span style={{ fontSize: 13, width: 50, color: 'var(--text-muted)' }}>mmHg</span>
              </div>
            </div>
            <div className="vital-row" style={{ marginBottom: 12 }}>
              <span className="vital-label" style={{ width: 60 }}>HR</span>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="number" className="form-input" style={{ margin: 0, padding: '6px 8px' }} placeholder="80" value={vitals.hr} onChange={(e) => setVitals({...vitals, hr: e.target.value})} />
                <span style={{ fontSize: 13, width: 50, color: 'var(--text-muted)' }}>/min</span>
              </div>
            </div>
            <div className="vital-row" style={{ marginBottom: 12 }}>
              <span className="vital-label" style={{ width: 60 }}>RR</span>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="number" className="form-input" style={{ margin: 0, padding: '6px 8px' }} placeholder="20" value={vitals.rr} onChange={(e) => setVitals({...vitals, rr: e.target.value})} />
                <span style={{ fontSize: 13, width: 50, color: 'var(--text-muted)' }}>/min</span>
              </div>
            </div>
            <div className="vital-row" style={{ marginBottom: 12 }}>
              <span className="vital-label" style={{ width: 60 }}>SpO₂</span>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="number" className="form-input" style={{ margin: 0, padding: '6px 8px' }} placeholder="98" value={vitals.spo2} onChange={(e) => setVitals({...vitals, spo2: e.target.value})} />
                <span style={{ fontSize: 13, width: 50, color: 'var(--text-muted)' }}>%</span>
              </div>
            </div>
            <div className="vital-row" style={{ marginBottom: 12 }}>
              <span className="vital-label" style={{ width: 60 }}>Temp</span>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="number" step="0.1" className="form-input" style={{ margin: 0, padding: '6px 8px' }} placeholder="36.5" value={vitals.temp} onChange={(e) => setVitals({...vitals, temp: e.target.value})} />
                <span style={{ fontSize: 13, width: 50, color: 'var(--text-muted)' }}>°C</span>
              </div>
            </div>
          </div>
        </div>

        <div className="checklist-item" onClick={() => toggleCheck('item2')} style={{ cursor: 'pointer' }}>
          <div className="checklist-header">
            <span>2. ไม่มีอาการสับสน หรือก้าวร้าวรุนแรง</span>
            {checks.item2 ? <CheckCircle2 size={20} color="var(--status-green)" /> : <Circle size={20} color="var(--border-color)" />}
          </div>
        </div>

        <div className="checklist-item" onClick={() => toggleCheck('item3')} style={{ cursor: 'pointer' }}>
          <div className="checklist-header">
            <span>3. ไม่มีแน่นหน้าอก หรือ EKG ปกติ</span>
            {checks.item3 ? <CheckCircle2 size={20} color="var(--status-green)" /> : <Circle size={20} color="var(--border-color)" />}
          </div>
        </div>

        <div className="checklist-item">
          <div className="checklist-header">
            <span>4. Pain score &lt; 3/10</span>
          </div>
          <div className="pain-score-input">
            <span style={{ fontSize: 14 }}>Pain score</span>
            <input 
              type="number" 
              className="pain-input" 
              value={painScore}
              onChange={(e) => setPainScore(e.target.value)}
              min="0" max="10"
            />
            <span style={{ fontSize: 14 }}>/ 10</span>
            <div style={{ marginLeft: 8 }}>
              {parseInt(painScore) < 3 ? <CheckCircle2 size={20} color="var(--status-green)" /> : <Circle size={20} color="var(--border-color)" />}
            </div>
          </div>
        </div>

        <div className="checklist-item" onClick={() => toggleCheck('item5')} style={{ cursor: 'pointer' }}>
          <div className="checklist-header">
            <span>5. ไม่มีท่อระบายที่เป็นอุปสรรคต่อการเคลื่อนไหว</span>
            {checks.item5 ? <CheckCircle2 size={20} color="var(--status-green)" /> : <Circle size={20} color="var(--border-color)" />}
          </div>
        </div>

        <div className="checklist-item" onClick={() => toggleCheck('item6')} style={{ cursor: 'pointer' }}>
          <div className="checklist-header" style={{ alignItems: 'flex-start' }}>
            <div>
              <div>6. แผลไม่มีเลือดซึมผิดปกติ</div>
              <div style={{ fontSize: 12, fontWeight: 400, marginTop: 4 }}>Hct &ge; 25% หรือ Plt &gt; 20,000</div>
            </div>
            {checks.item6 ? <CheckCircle2 size={20} color="var(--status-green)" /> : <Circle size={20} color="var(--border-color)" />}
          </div>
        </div>

        <div className="checklist-item" onClick={() => toggleCheck('item7')} style={{ cursor: 'pointer' }}>
          <div className="checklist-header">
            <span>7. Capillary refil time &lt; 2-3 sec</span>
            {checks.item7 ? <CheckCircle2 size={20} color="var(--status-green)" /> : <Circle size={20} color="var(--border-color)" />}
          </div>
        </div>

        <div className="checklist-item" onClick={() => toggleCheck('item8')} style={{ cursor: 'pointer' }}>
          <div className="checklist-header" style={{ alignItems: 'flex-start' }}>
            <div style={{ paddingRight: 10 }}>
              8. ไม่มีวิงเวียน บ้านหมุน หน้ามืด ใจสั่น หายใจหอบเหนื่อยผิดปกติ หลังเปลี่ยนอิริยาบถ
            </div>
            {checks.item8 ? <CheckCircle2 size={20} color="var(--status-green)" /> : <Circle size={20} color="var(--border-color)" />}
          </div>
        </div>

        <div className="action-buttons">
          <button 
            className="btn btn-success" 
            onClick={() => handleAssessment(true)}
            disabled={loading}
          >
            พร้อมลุกเดิน
          </button>
          <button 
            className="btn btn-danger" 
            onClick={() => handleAssessment(false)}
            disabled={loading}
          >
            ยังไม่พร้อม
          </button>
        </div>
      </div>
    </>
  );
}
