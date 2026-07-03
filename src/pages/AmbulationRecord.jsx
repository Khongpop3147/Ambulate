import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientAPI, ambulationAPI } from '../services/api';

const assistLevels = [
  { value: 'independent', label: 'ด้วยตนเอง' },
  { value: 'minimal', label: 'ช่วยเหลือน้อย' },
  { value: 'moderate', label: 'ช่วยเหลือปานกลาง' },
  { value: 'maximal', label: 'ช่วยเหลือมาก' },
];

const commonSymptoms = [
  'เวียนศีรษะ',
  'คลื่นไส้',
  'หน้ามืด',
  'เจ็บแผล',
  'หายใจลำบาก',
  'อ่อนเพลีย',
];

export default function AmbulationRecord({ showToast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    startTime: '',
    endTime: '',
    distance: '',
    duration: '',
    assistLevel: '',
    symptomsDuring: [],
    symptomsAfter: [],
    hasComplication: false,
    complicationNote: '',
    nurseNote: '',
  });

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const data = await patientAPI.getById(id);
        setPatient(data);
      } catch (err) {
        showToast?.('ไม่สามารถโหลดข้อมูลผู้ป่วย', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id, showToast]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSymptom = (type, symptom) => {
    setForm((prev) => {
      const list = prev[type];
      return {
        ...prev,
        [type]: list.includes(symptom)
          ? list.filter((s) => s !== symptom)
          : [...list, symptom],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.assistLevel) {
      showToast?.('กรุณาเลือกระดับการช่วยเหลือ', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await ambulationAPI.create({
        patientId: id,
        startTime: form.startTime || undefined,
        endTime: form.endTime || undefined,
        distance: form.distance ? Number(form.distance) : undefined,
        duration: form.duration ? Number(form.duration) : undefined,
        assistLevel: form.assistLevel,
        symptomsDuring: form.symptomsDuring,
        symptomsAfter: form.symptomsAfter,
        hasComplication: form.hasComplication,
        complicationNote: form.complicationNote,
        nurseNote: form.nurseNote,
      });
      showToast?.('บันทึกการเดินสำเร็จ', 'success');
      navigate(`/patient/${id}`);
    } catch (err) {
      showToast?.(err.message || 'เกิดข้อผิดพลาด', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <button className="btn-back" onClick={() => navigate(`/patient/${id}`)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className="page-title">บันทึกการเดิน</h1>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton skeleton-card" />
        ))}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate(`/patient/${id}`)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div>
          <h1 className="page-title">บันทึกการเดิน</h1>
          <p className="page-subtitle">Ambulation Record</p>
        </div>
      </div>

      {/* Patient Summary */}
      {patient && (
        <div className="glass-card-static" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gray-900)' }}>{patient.name}</div>
              <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>AN: {patient.an} • {patient.surgeryType}</div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Time */}
        <div className="form-section">
          <h2 className="form-section-title">
            <span className="section-icon">⏱️</span>
            เวลาเดิน
          </h2>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">เวลาเริ่ม</label>
              <input
                type="time"
                className="form-input"
                value={form.startTime}
                onChange={(e) => updateField('startTime', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">เวลาสิ้นสุด</label>
              <input
                type="time"
                className="form-input"
                value={form.endTime}
                onChange={(e) => updateField('endTime', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Distance & Duration */}
        <div className="form-section">
          <h2 className="form-section-title">
            <span className="section-icon">📏</span>
            ระยะทางและเวลา
          </h2>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">ระยะทาง</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0"
                  min="0"
                  value={form.distance}
                  onChange={(e) => updateField('distance', e.target.value)}
                />
                <span style={{ fontSize: '13px', color: 'var(--gray-500)', fontWeight: 500, whiteSpace: 'nowrap' }}>เมตร</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">ระยะเวลา</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0"
                  min="0"
                  value={form.duration}
                  onChange={(e) => updateField('duration', e.target.value)}
                />
                <span style={{ fontSize: '13px', color: 'var(--gray-500)', fontWeight: 500, whiteSpace: 'nowrap' }}>นาที</span>
              </div>
            </div>
          </div>
        </div>

        {/* Assist Level */}
        <div className="form-section">
          <h2 className="form-section-title">
            <span className="section-icon">🤝</span>
            ระดับการช่วยเหลือ <span className="required">*</span>
          </h2>
          <div className="radio-pill-group">
            {assistLevels.map((level) => (
              <React.Fragment key={level.value}>
                <input
                  type="radio"
                  id={`assist-${level.value}`}
                  name="assistLevel"
                  className="radio-pill"
                  checked={form.assistLevel === level.value}
                  onChange={() => updateField('assistLevel', level.value)}
                />
                <label htmlFor={`assist-${level.value}`} className="radio-pill-label">
                  {level.label}
                </label>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Symptoms During */}
        <div className="form-section">
          <h2 className="form-section-title">
            <span className="section-icon">🩺</span>
            อาการระหว่างเดิน
          </h2>
          <div className="radio-pill-group">
            {commonSymptoms.map((symptom) => (
              <React.Fragment key={`during-${symptom}`}>
                <input
                  type="checkbox"
                  id={`during-${symptom}`}
                  className="radio-pill"
                  checked={form.symptomsDuring.includes(symptom)}
                  onChange={() => toggleSymptom('symptomsDuring', symptom)}
                />
                <label htmlFor={`during-${symptom}`} className="radio-pill-label">
                  {symptom}
                </label>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Symptoms After */}
        <div className="form-section">
          <h2 className="form-section-title">
            <span className="section-icon">📝</span>
            อาการหลังเดิน
          </h2>
          <div className="radio-pill-group">
            {commonSymptoms.map((symptom) => (
              <React.Fragment key={`after-${symptom}`}>
                <input
                  type="checkbox"
                  id={`after-${symptom}`}
                  className="radio-pill"
                  checked={form.symptomsAfter.includes(symptom)}
                  onChange={() => toggleSymptom('symptomsAfter', symptom)}
                />
                <label htmlFor={`after-${symptom}`} className="radio-pill-label">
                  {symptom}
                </label>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Complications */}
        <div className="form-section">
          <h2 className="form-section-title">
            <span className="section-icon">⚠️</span>
            ภาวะแทรกซ้อน
          </h2>

          <div className="checklist-item">
            <div className="checklist-header">
              <div className="checklist-label">มีภาวะแทรกซ้อน</div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={form.hasComplication}
                  onChange={(e) => updateField('hasComplication', e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>

          {form.hasComplication && (
            <div className="form-group animate-fade-in">
              <label className="form-label">รายละเอียดภาวะแทรกซ้อน</label>
              <textarea
                className="form-textarea"
                placeholder="ระบุรายละเอียด..."
                value={form.complicationNote}
                onChange={(e) => updateField('complicationNote', e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        {/* Nurse Note */}
        <div className="form-section">
          <h2 className="form-section-title">
            <span className="section-icon">💬</span>
            บันทึกเพิ่มเติม
          </h2>
          <div className="form-group">
            <textarea
              className="form-textarea"
              placeholder="บันทึกข้อสังเกตเพิ่มเติม (ถ้ามี)..."
              value={form.nurseNote}
              onChange={(e) => updateField('nurseNote', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-success btn-lg"
          disabled={submitting}
          style={{ marginBottom: '24px' }}
        >
          {submitting ? (
            <>
              <span className="btn-spinner" />
              กำลังบันทึก...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              บันทึกการเดิน
            </>
          )}
        </button>
      </form>
    </div>
  );
}
