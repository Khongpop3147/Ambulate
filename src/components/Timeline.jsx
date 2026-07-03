import React from 'react';
import { format, parseISO } from 'date-fns';
import { th } from 'date-fns/locale';

const typeColors = {
  'or-discharge': 'or-discharge',
  'scheduled': 'scheduled',
  'assessment': 'assessment',
  'ambulation': 'ambulation',
  'notification': 'notification',
};

export default function Timeline({ events = [] }) {
  const formatTime = (time) => {
    if (!time) return '';
    try {
      const date = typeof time === 'string' ? parseISO(time) : time;
      return format(date, 'dd/MM/yyyy HH:mm', { locale: th });
    } catch {
      return time;
    }
  };

  if (events.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '24px' }}>
        <span className="empty-icon">📋</span>
        <p className="empty-text">ยังไม่มีประวัติ</p>
      </div>
    );
  }

  return (
    <div className="timeline">
      {events.map((event, index) => (
        <div className="timeline-item" key={index} style={{ animationDelay: `${index * 0.1}s` }}>
          <div className={`timeline-dot ${typeColors[event.type] || 'scheduled'}`} />
          <div className="timeline-content">
            <div className="timeline-time">{formatTime(event.time)}</div>
            <div className="timeline-title">{event.title}</div>
            {event.description && (
              <div className="timeline-desc">{event.description}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
