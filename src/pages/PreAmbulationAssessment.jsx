import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientAPI, assessmentAPI } from '../services/api';
import ChecklistItem from '../components/ChecklistItem';

const checklistConfig = [
  { key: 'vitalSignsStable', label: 'สัญญาณชีพคงที่ (Vital Signs Stable)', type: 'toggle', description: 'BP, HR, RR, SpO2 อยู่ในเกณฑ์ปกติ' },
  { key: 'painControlled', label: 'ควบคุมความเจ็บปวดได้ (Pain ≤ 4/10)', type: 'toggle', description: 'NRS Score ไม่เกิน 4' },
  { key: 'painScore', label: 'คะแนนความเจ็บปวด (Pain Score)', type: 'number', unit: '/10' },
  { key: 'noNauseaVomiting', label: 'ไม่มีอาการคลื่นไส้อาเจียน', type: 'toggle' },
  { key: 'consciousnessNormal', label: 'ระดับความรู้สึกตัวปกติ (GCS = 15)', type: 'toggle' },
  { key: 'noActiveBleeding', label: 'ไม่มีเลือดออกผิดปกติ', type: 'toggle' },
  { key: 'noFever', label: 'ไม่มีไข้ (อุณหภูมิ < 38.5°C)', type: 'toggle' },
  { key: 'bodyTemperature', label: 'อุณหภูมิร่างกาย', type: 'number', unit: '°C' },
  { key: 'adequateUrine', label: 'ปัสสาวะออกเพียงพอ (≥ 0.5 mL/kg/hr)', type: 'toggle' },
  { key: 'drainageNormal', label: 'Drain/สายระบาย ปกติ (ไม่มีการรั่ว)', type: 'toggle' },
  { key: 'canSitUpright', label: 'สามารถนั่งตัวตรงได้', type: 'toggle', description: 'นั่งริมเตียงได้อย่างน้อย 2 นาที' },
];

export default function PreAmbulationAssessment({ showToast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checklist, setChecklist] = useState(() => {
    const initial = {};
    checklistConfig.forEach((item) => {
      initial[item.key] = item.type === 'toggle' ? false : '';
    });
    return initial;
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

  const updateChecklist = (key, value) => {
    setChecklist((prev) => ({ ...prev, [key]: value }));
  };

  const assessmentResult = useMemo(() => {
    const failReasons = [];

    if (!checklist.vitalSignsStable) failReasons.push('สัญญาณชีพไม่คงที่');
    if (!checklist.painControlled) failReasons.push('ยังไม่สามารถควบคุมความเจ็บปวดได้');
    if (checklist.painScore && Number(checklist.painScore) > 4) failReasons.push(`คะแนนความเจ็บปวดสูง (${checklist.painScore}/10)`);
    if (!checklist.noNauseaVomiting) failReasons.push('มีอาการคลื่นไส้อาเจียน');
    if (!checklist.consciousnessNormal) failReasons.push('ระดับความรู้สึกตัวผิดปกติ');
    if (!checklist.noActiveBleeding) failReasons.push('มีเลือดออกผิดปกติ');
    if (!checklist.noFever) failReasons.push('มีไข้');
    if (checklist.bodyTemperature && Number(checklist.bodyTemperature) >= 38.5) failReasons.push(`อุณหภูมิสูง (${checklist.bodyTemperature}°C)`);
    if (!checklist.adequateUrine) failReasons.push('ปัสสาวะออกไม่เพียงพอ');
    if (!checklist.drainageNormal) failReasons.push('Drain/สายระบายผิดปกติ');
    if (!checklist.canSitUpright) failReasons.push('ยังไม่สามารถนั่งตัวตรงได้');

    return {
      isReady: failReasons.length === 0,
      failReasons,
    };
  }, [checklist]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await assessmentAPI.create({
        patientId: id,
        checklist,
        isReady: assessmentResult.isReady,
        failReasons: assessmentResult.failReasons,
      });
      showToast?.(
        assessmentResult.isReady ? 'ผู้ป่วยพร้อมเดิน!' : 'บันทึกการประเมินแล้ว',
        assessmentResult.isReady ? 'success' : 'warning'
      );
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
          <h1 className="page-title">ประเมินความพร้อม</h1>
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
          <h1 className="page-title">ประเมินความพร้อม</h1>
          <p className="page-subtitle">Pre-Ambulation Assessment</p>
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

      {/* Checklist */}
      <div className="form-section">
        <h2 className="form-section-title">
          <span className="section-icon">📋</span>
          รายการประเมิน
        </h2>

        {checklistConfig.map((item) => (
          <ChecklistItem
            key={item.key}
            label={item.label}
            type={item.type}
            value={checklist[item.key]}
            onChange={(val) => updateChecklist(item.key, val)}
            unit={item.unit}
            description={item.description}
          />
        ))}
      </div>

      {/* Live Result */}
      <div className={`result-card ${assessmentResult.isReady ? 'ready' : 'not-ready'}`}>
        <span className="result-icon">
          {assessmentResult.isReady ? '✅' : '⚠️'}
        </span>
        <h3 className="result-title">
          {assessmentResult.isReady ? 'พร้อมเดิน (Ready to Ambulate)' : 'ยังไม่พร้อมเดิน (Not Ready)'}
        </h3>
        <p className="result-subtitle">
          {assessmentResult.isReady
            ? 'ผู้ป่วยผ่านเกณฑ์การประเมินทุกข้อ'
            : `ไม่ผ่านเกณฑ์ ${assessmentResult.failReasons.length} ข้อ`}
        </p>
        {!assessmentResult.isReady && assessmentResult.failReasons.length > 0 && (
          <ul className="result-reasons">
            {assessmentResult.failReasons.map((reason, i) => (
              <li key={i}>{reason}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Submit */}
      <button
        className={`btn ${assessmentResult.isReady ? 'btn-success' : 'btn-warning'} btn-lg`}
        onClick={handleSubmit}
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
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            บันทึกผลการประเมิน
          </>
        )}
      </button>
    </div>
  );
}
