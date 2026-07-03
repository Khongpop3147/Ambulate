import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import { patientAPI, assessmentAPI, ambulationAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Timeline from '../components/Timeline';

export default function PatientDetail({ showToast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [ambulations, setAmbulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientData, assessmentsData, ambulationsData] = await Promise.all([
          patientAPI.getById(id),
          assessmentAPI.getByPatient(id),
          ambulationAPI.getByPatient(id),
        ]);
        setPatient(patientData);
        setAssessments(assessmentsData);
        setAmbulations(ambulationsData);
      } catch (err) {
        console.error('Failed to fetch patient:', err);
        showToast?.('ไม่สามารถโหลดข้อมูลผู้ป่วย', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, showToast]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await patientAPI.delete(id);
      showToast?.('ลบข้อมูลผู้ป่วยแล้ว', 'success');
      navigate('/');
    } catch (err) {
      showToast?.(err.message || 'เกิดข้อผิดพลาด', 'error');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return format(parseISO(dateStr), 'dd/MM/yyyy HH:mm', { locale: th });
    } catch {
      return dateStr;
    }
  };

  const formatRelative = (dateStr) => {
    if (!dateStr) return '';
    try {
      return formatDistanceToNow(parseISO(dateStr), { addSuffix: true, locale: th });
    } catch {
      return '';
    }
  };

  const getClinicalTags = () => {
    if (!patient?.clinicalInfo) return [];
    const tags = [];
    if (patient.clinicalInfo.hasIVLine) tags.push('IV Line');
    if (patient.clinicalInfo.hasDrain) tags.push('Drain');
    if (patient.clinicalInfo.hasCatheter) tags.push('Foley Catheter');
    if (patient.clinicalInfo.hasOxygenSupport) tags.push('Oxygen');
    if (patient.clinicalInfo.hasPCA) tags.push('PCA');
    return tags;
  };

  const buildTimelineEvents = () => {
    const events = [];

    if (patient?.surgeryDate) {
      events.push({
        time: patient.surgeryDate,
        title: 'ผ่าตัด',
        description: patient.surgeryType || '',
        type: 'or-discharge',
      });
    }

    if (patient?.scheduledAt) {
      events.push({
        time: patient.scheduledAt,
        title: 'กำหนดประเมินการเดิน',
        description: `หลังผ่าตัด ${patient.reminderHours || '-'} ชั่วโมง`,
        type: 'scheduled',
      });
    }

    assessments.forEach((a) => {
      events.push({
        time: a.createdAt,
        title: `ประเมินความพร้อม: ${a.isReady ? 'พร้อม' : 'ไม่พร้อม'}`,
        description: a.isReady ? 'ผู้ป่วยพร้อมเดิน' : `ไม่ผ่าน ${a.failReasons?.length || 0} ข้อ`,
        type: 'assessment',
      });
    });

    ambulations.forEach((a) => {
      events.push({
        time: a.createdAt,
        title: 'บันทึกการเดิน',
        description: `ระยะทาง ${a.distance || '-'} เมตร, ระยะเวลา ${a.duration || '-'} นาที`,
        type: 'ambulation',
      });
    });

    events.sort((a, b) => new Date(a.time) - new Date(b.time));
    return events;
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <button className="btn-back" onClick={() => navigate('/')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className="page-title">ข้อมูลผู้ป่วย</h1>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton skeleton-card" />
        ))}
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <button className="btn-back" onClick={() => navigate('/')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className="page-title">ข้อมูลผู้ป่วย</h1>
        </div>
        <div className="empty-state">
          <span className="empty-icon">❌</span>
          <p className="empty-text">ไม่พบข้อมูลผู้ป่วย</p>
        </div>
      </div>
    );
  }

  const clinicalTags = getClinicalTags();
  const timelineEvents = buildTimelineEvents();

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="page-title">ข้อมูลผู้ป่วย</h1>
      </div>

      {/* Patient Info Card */}
      <div className="glass-card-static" style={{ marginBottom: '20px' }}>
        <div className="patient-detail-header">
          <div>
            <h2 className="patient-detail-name">{patient.name}</h2>
            <p className="patient-detail-an">AN: {patient.an}</p>
          </div>
          <StatusBadge status={patient.status} />
        </div>

        <div className="divider" />

        <div className="info-grid">
          <div className="info-section">
            <div className="info-label">อายุ</div>
            <div className="info-value">{patient.age} ปี</div>
          </div>
          <div className="info-section">
            <div className="info-label">เพศ</div>
            <div className="info-value">{patient.gender}</div>
          </div>
          <div className="info-section">
            <div className="info-label">ชนิดการผ่าตัด</div>
            <div className="info-value">{patient.surgeryType}</div>
          </div>
          <div className="info-section">
            <div className="info-label">วันที่ผ่าตัด</div>
            <div className="info-value">{formatDate(patient.surgeryDate)}</div>
          </div>
        </div>

        {/* Scheduled Time */}
        {patient.scheduledAt && (
          <div className="schedule-preview" style={{ marginTop: '16px' }}>
            <div className="schedule-label">⏰ กำหนดประเมิน</div>
            <div className="schedule-time-text">{formatDate(patient.scheduledAt)}</div>
            <div className="schedule-note">{formatRelative(patient.scheduledAt)}</div>
          </div>
        )}
      </div>

      {/* Clinical Tags */}
      {clinicalTags.length > 0 && (
        <div className="detail-section">
          <h3 className="detail-section-title">
            <span className="section-icon">🏷️</span>
            ข้อมูลทางคลินิก
          </h3>
          <div>
            {clinicalTags.map((tag) => (
              <span key={tag} className="clinical-tag">{tag}</span>
            ))}
          </div>
          {patient.restrictionNote && (
            <p style={{ fontSize: '13px', color: 'var(--gray-600)', marginTop: '8px' }}>
              📝 {patient.restrictionNote}
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/patient/${id}/assessment`)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          ประเมินความพร้อม
        </button>
        <button
          className="btn btn-success"
          onClick={() => navigate(`/patient/${id}/ambulation`)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="2" />
            <path d="M10 22V18L7 15V11L9 9H15L17 11V15L14 18V22" />
          </svg>
          บันทึกการเดิน
        </button>
      </div>

      {/* Timeline */}
      <div className="detail-section">
        <h3 className="detail-section-title">
          <span className="section-icon">📅</span>
          ไทม์ไลน์
        </h3>
        <Timeline events={timelineEvents} />
      </div>

      {/* Assessment History */}
      {assessments.length > 0 && (
        <div className="detail-section">
          <h3 className="detail-section-title">
            <span className="section-icon">📊</span>
            ประวัติการประเมิน ({assessments.length})
          </h3>
          {assessments.map((a, i) => (
            <div key={i} className="history-card">
              <div className="history-header">
                <span className={`history-result ${a.isReady ? 'ready' : 'not-ready'}`}>
                  {a.isReady ? '✅ พร้อมเดิน' : '❌ ยังไม่พร้อม'}
                </span>
                <span className="history-time">{formatDate(a.createdAt)}</span>
              </div>
              {a.failReasons && a.failReasons.length > 0 && (
                <div className="history-detail">
                  ไม่ผ่าน: {a.failReasons.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Ambulation History */}
      {ambulations.length > 0 && (
        <div className="detail-section">
          <h3 className="detail-section-title">
            <span className="section-icon">🚶</span>
            ประวัติการเดิน ({ambulations.length})
          </h3>
          {ambulations.map((a, i) => (
            <div key={i} className="history-card">
              <div className="history-header">
                <span className="history-result ready">
                  🚶 เดินสำเร็จ
                </span>
                <span className="history-time">{formatDate(a.createdAt)}</span>
              </div>
              <div className="history-detail">
                ระยะทาง {a.distance || '-'} เมตร • ระยะเวลา {a.duration || '-'} นาที
                {a.assistLevel && ` • ระดับช่วยเหลือ: ${a.assistLevel}`}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Button */}
      <div style={{ marginTop: '24px', marginBottom: '24px' }}>
        <button
          className="btn btn-outline-danger btn-lg"
          onClick={() => setShowDeleteModal(true)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
          ลบข้อมูลผู้ป่วย
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">⚠️ ยืนยันการลบ</h3>
            <p className="modal-message">
              คุณต้องการลบข้อมูลผู้ป่วย <strong>{patient.name}</strong> (AN: {patient.an}) ออกจากระบบหรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                ยกเลิก
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <span className="btn-spinner" />
                    กำลังลบ...
                  </>
                ) : (
                  'ยืนยันลบ'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
