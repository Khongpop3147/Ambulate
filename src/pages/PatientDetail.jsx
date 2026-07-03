import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, addHours, addMinutes } from 'date-fns';
import { th } from 'date-fns/locale';
import { patientAPI } from '../services/api';
import Header from '../components/Header';
import { User } from 'lucide-react';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const data = await patientAPI.getById(id);
        setPatient(data);
      } catch (error) {
        console.error('Failed to fetch patient details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  if (loading) return <div className="app-container flex-center">กำลังโหลด...</div>;
  if (!patient) return <div className="app-container flex-center">ไม่พบผู้ป่วย</div>;

  // Compute times for the UI
  const orOutTime = new Date(patient.orDischargeAt);
  const round1Start = new Date(patient.scheduledAt);
  const round1End = addMinutes(round1Start, 30);
  const round2Start = addHours(round1Start, patient.reminderHours || 6);
  const round2End = addMinutes(round2Start, 30);

  const formatDateTime = (date) => format(date, 'd MMM yyyy HH:mm', { locale: th });
  const formatTimeOnly = (date) => format(date, 'HH:mm', { locale: th });

  // For UI mockup we assume Bed 01
  const bedNo = "เตียง 01"; 

  return (
    <>
      <Header title="รายละเอียดผู้ป่วย" showBack={true} />
      
      <div className="page-content">
        <div className="detail-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <User size={32} />
            </div>
            <div className="profile-info">
              <h3>HN {patient.an}</h3>
              <h2>{patient.name}</h2>
              <p>{bedNo} | อายุ {patient.age} ปี | {patient.gender === 'M' ? 'ชาย' : 'หญิง'}</p>
            </div>
          </div>
        </div>

        <div className="detail-card" style={{ padding: '20px 16px' }}>
          <h2 className="section-title" style={{ marginTop: 0 }}>ข้อมูลการผ่าตัด</h2>
          <div className="info-row">
            <span className="info-label">ชนิดการผ่าตัด</span>
            <span className="info-value">{patient.surgeryType}</span>
          </div>
          <div className="info-row">
            <span className="info-label">เวลาออกจากห้องผ่าตัด</span>
            <span className="info-value">{formatDateTime(orOutTime)}</span>
          </div>
          <div className="info-row">
            <span className="info-label">วิธีการดมยา</span>
            <span className="info-value">General anesthesia</span>
          </div>
        </div>

        <div className="schedule-card">
          <div className="schedule-title">เวลาที่ควรเริ่ม Ambulate</div>
          
          <div className="info-row">
            <span className="info-label">รอบที่ 1</span>
            <span className="info-value">{formatDateTime(round1Start)}-{formatTimeOnly(round1End)} น.</span>
          </div>
          <div className="info-row">
            <span className="info-label">สถานะ</span>
            <span className="info-value" style={{ color: 'var(--status-red)', fontWeight: '600' }}>ถึงเวลาลุกเดิน</span>
          </div>
          
          <div className="info-row" style={{ marginTop: '16px' }}>
            <span className="info-label">รอบที่ 2</span>
            <span className="info-value">{formatDateTime(round2Start)}-{formatTimeOnly(round2End)} น.</span>
          </div>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={() => navigate(`/patient/${id}/assessment`)}
        >
          ประเมินความพร้อม
        </button>
      </div>
    </>
  );
}
