import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { patientAPI } from '../services/api';
import PatientCard from '../components/PatientCard';

const filterOptions = [
  { key: '', label: 'ทั้งหมด' },
  { key: 'PENDING', label: 'รอเวลา' },
  { key: 'DUE', label: 'ถึงกำหนด' },
  { key: 'COMPLETED', label: 'เสร็จสิ้น' },
  { key: 'OVERDUE', label: 'เลยกำหนด' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({ pending: 0, due: 0, completed: 0, overdue: 0 });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [patientsData, statsData] = await Promise.all([
        patientAPI.getAll(filter || undefined),
        patientAPI.getStats(),
      ]);
      setPatients(patientsData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const filteredPatients = patients.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.an?.toLowerCase().includes(q)
    );
  });

  const summaryCards = [
    { key: 'pending', icon: '⏳', count: stats.pending, label: 'รอเวลา', className: 'pending' },
    { key: 'due', icon: '🔔', count: stats.due, label: 'ถึงกำหนด', className: 'due' },
    { key: 'completed', icon: '✅', count: stats.completed, label: 'เสร็จสิ้น', className: 'completed' },
    { key: 'overdue', icon: '⚠️', count: stats.overdue, label: 'เลยกำหนด', className: 'overdue' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="app-header">
        <div className="header-top">
          <div>
            <h1 className="app-title">SARA</h1>
            <p className="app-subtitle">Smart Ambulation Reminder & Assessment</p>
          </div>
          <div className="header-time">
            <div className="header-date">
              {format(currentTime, 'EEEE', { locale: th })}
            </div>
            <div>{format(currentTime, 'dd MMMM yyyy', { locale: th })}</div>
            <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--primary-600)' }}>
              {format(currentTime, 'HH:mm:ss')}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Grid */}
      <div className="summary-grid">
        {summaryCards.map((card) => (
          <div
            key={card.key}
            className={`summary-card ${card.className}`}
            onClick={() => setFilter(card.key === filter ? '' : card.key.toUpperCase())}
          >
            <span className="icon">{card.icon}</span>
            <div className="count">{card.count}</div>
            <div className="label">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="search-bar">
        <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="ค้นหาชื่อผู้ป่วยหรือ AN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {filterOptions.map((opt) => (
          <button
            key={opt.key}
            className={`filter-tab ${filter === opt.key ? 'active' : ''}`}
            onClick={() => setFilter(opt.key)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Patient List */}
      {loading ? (
        <div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton skeleton-card" />
          ))}
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🔍</span>
          <p className="empty-text">ไม่พบผู้ป่วย</p>
          <p className="empty-subtext">
            {search ? 'ลองค้นหาด้วยคำอื่น' : 'ยังไม่มีผู้ป่วยในระบบ'}
          </p>
        </div>
      ) : (
        filteredPatients.map((patient) => (
          <PatientCard
            key={patient._id}
            patient={patient}
            onClick={() => navigate(`/patient/${patient._id}`)}
          />
        ))
      )}
    </div>
  );
}
