import React from 'react';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import StatusBadge from './StatusBadge';

export default function PatientCard({ patient, onClick }) {
  const formatSchedule = (dateStr) => {
    if (!dateStr) return null;
    try {
      const date = parseISO(dateStr);
      return {
        formatted: format(date, 'dd/MM/yyyy HH:mm'),
        relative: formatDistanceToNow(date, { addSuffix: true, locale: th }),
      };
    } catch {
      return null;
    }
  };

  const schedule = formatSchedule(patient.scheduledAt);

  return (
    <div className="patient-card" onClick={onClick}>
      <div className="patient-card-info">
        <div className="patient-name">{patient.name}</div>
        <div className="patient-an">AN: {patient.an}</div>
        {patient.surgeryType && (
          <div className="patient-surgery">{patient.surgeryType}</div>
        )}
        {schedule && (
          <div className="schedule-time">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{schedule.formatted}</span>
            <span style={{ color: 'var(--gray-400)', marginLeft: '4px' }}>({schedule.relative})</span>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <StatusBadge status={patient.status} />
        <svg className="card-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </div>
  );
}
