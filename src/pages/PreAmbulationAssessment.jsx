import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assessmentAPI } from '../services/api';
import Header from '../components/Header';
import { CheckCircle2 } from 'lucide-react';

export default function PreAmbulationAssessment({ showToast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [painScore, setPainScore] = useState(2);
  const [loading, setLoading] = useState(false);

  // Mock static values for Vitals to match Figma
  const vitals = {
    bp: '118/76 mmHg',
    hr: '82 /min',
    rr: '18 /min',
    spo2: '98 %',
    temp: '36.8 °C'
  };

  const handleAssessment = async (isReady) => {
    setLoading(true);
    try {
      // Create assessment record based on button clicked
      await assessmentAPI.create({
        patientId: id,
        systolicBP: 118,
        diastolicBP: 76,
        heartRate: 82,
        temperature: 36.8,
        painScore: parseInt(painScore),
        noDizziness: isReady,
        noActiveBleeding: isReady,
        isConscious: isReady,
        noOrthostatic: isReady,
        drainSecure: isReady,
        noDoctorRestriction: isReady
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
            <div className="vital-row">
              <span className="vital-label">BP</span>
              <span className="vital-value">{vitals.bp}</span>
              <CheckIcon />
            </div>
            <div className="vital-row">
              <span className="vital-label">HR</span>
              <span className="vital-value">{vitals.hr}</span>
              <CheckIcon />
            </div>
            <div className="vital-row">
              <span className="vital-label">RR</span>
              <span className="vital-value">{vitals.rr}</span>
              <CheckIcon />
            </div>
            <div className="vital-row">
              <span className="vital-label">SpO₂</span>
              <span className="vital-value">{vitals.spo2}</span>
              <CheckIcon />
            </div>
            <div className="vital-row">
              <span className="vital-label">Temp</span>
              <span className="vital-value">{vitals.temp}</span>
              <CheckIcon />
            </div>
          </div>
        </div>

        <div className="checklist-item">
          <div className="checklist-header">
            <span>2. ไม่มีอาการสับสน หรือก้าวร้าวรุนแรง</span>
            <CheckIcon />
          </div>
        </div>

        <div className="checklist-item">
          <div className="checklist-header">
            <span>3. ไม่มีแน่นหน้าอก หรือ EKG ปกติ</span>
            <CheckIcon />
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
            <div style={{ marginLeft: 8 }}><CheckIcon /></div>
          </div>
        </div>

        <div className="checklist-item">
          <div className="checklist-header">
            <span>5. ไม่มีท่อระบายที่เป็นอุปสรรคต่อการเคลื่อนไหว</span>
            <CheckIcon />
          </div>
        </div>

        <div className="checklist-item">
          <div className="checklist-header" style={{ alignItems: 'flex-start' }}>
            <div>
              <div>6. แผลไม่มีเลือดซึมผิดปกติ</div>
              <div style={{ fontSize: 12, fontWeight: 400, marginTop: 4 }}>Hct &ge; 25% หรือ Plt &gt; 20,000</div>
            </div>
            <CheckIcon />
          </div>
        </div>

        <div className="checklist-item">
          <div className="checklist-header">
            <span>7. Capillary refil time &lt; 2-3 sec</span>
            <CheckIcon />
          </div>
        </div>

        <div className="checklist-item">
          <div className="checklist-header" style={{ alignItems: 'flex-start' }}>
            <div style={{ paddingRight: 10 }}>
              8. ไม่มีวิงเวียน บ้านหมุน หน้ามืด ใจสั่น หายใจหอบเหนื่อยผิดปกติ หลังเปลี่ยนอิริยาบถ
            </div>
            <CheckIcon />
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
