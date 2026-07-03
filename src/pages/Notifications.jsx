import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { th } from 'date-fns/locale';
import { notificationAPI } from '../services/api';

export default function Notifications({ showToast }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const data = await notificationAPI.getAll();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      showToast?.('อ่านการแจ้งเตือนทั้งหมดแล้ว', 'success');
    } catch (err) {
      showToast?.('เกิดข้อผิดพลาด', 'error');
    }
  };

  const handleClickNotification = async (notif) => {
    try {
      if (!notif.isRead) {
        await notificationAPI.markRead(notif._id);
        setNotifications((prev) =>
          prev.map((n) => n._id === notif._id ? { ...n, isRead: true } : n)
        );
      }
      if (notif.patientId) {
        navigate(`/patient/${notif.patientId}`);
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      return formatDistanceToNow(parseISO(dateStr), { addSuffix: true, locale: th });
    } catch {
      return dateStr;
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'due': return '🔔';
      case 'overdue': return '⚠️';
      case 'assessment': return '📋';
      case 'ambulation': return '🚶';
      default: return '💬';
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header" style={{ justifyContent: 'space-between' }}>
        <h1 className="page-title">
          🔔 การแจ้งเตือน
          {unreadCount > 0 && (
            <span style={{
              fontSize: '14px',
              color: 'var(--primary-500)',
              fontWeight: 500,
              marginLeft: '8px',
            }}>
              ({unreadCount} ยังไม่อ่าน)
            </span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button
            className="btn btn-sm btn-ghost"
            onClick={handleMarkAllRead}
            style={{ color: 'var(--primary-600)', fontSize: '13px' }}
          >
            อ่านทั้งหมด
          </button>
        )}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton skeleton-card" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🔕</span>
          <p className="empty-text">ไม่มีการแจ้งเตือน</p>
          <p className="empty-subtext">เมื่อมีการแจ้งเตือนใหม่จะแสดงที่นี่</p>
        </div>
      ) : (
        notifications.map((notif) => (
          <div
            key={notif._id}
            className={`notification-card ${!notif.isRead ? 'unread' : ''}`}
            onClick={() => handleClickNotification(notif)}
          >
            <div className="notif-icon">{getNotifIcon(notif.type)}</div>
            {notif.patientName && (
              <div className="notif-patient">
                👤 {notif.patientName} (AN: {notif.patientAN || ''})
              </div>
            )}
            <div className="notif-message">{notif.message}</div>
            <div className="notif-time">{formatTime(notif.createdAt)}</div>
          </div>
        ))
      )}
    </div>
  );
}
