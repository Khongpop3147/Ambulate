import React from 'react';
import Header from '../components/Header';
import { Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Reports() {
  const chartData = [
    { day: '1', rate: 85 },
    { day: '2', rate: 90 },
    { day: '3', rate: 78 },
    { day: '4', rate: 95 },
    { day: '5', rate: 70 },
    { day: '6', rate: 80 },
    { day: '7', rate: 95 },
    { day: '8', rate: 80 },
    { day: '9', rate: 60 },
    { day: '10', rate: 80 },
  ];

  return (
    <>
      <Header 
        title="รายงานสถิติ" 
        showBack={true} 
        rightElement={<Download className="header-icon" />} 
      />
      
      <div className="page-content">
        <div className="date-picker">
          <span>ช่วงวันที่</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8f9fa', padding: '6px 12px', borderRadius: 8 }}>
            <span>1 - 10 ก.ย. 2567</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </div>
        </div>

        <div className="stat-grid-reports">
          <div className="stat-box">
            <div className="stat-label">อัตราการลุกเดินตรงเวลา</div>
            <div className="stat-val">85.3<span className="stat-unit">%</span></div>
          </div>
          <div className="stat-box">
            <div className="stat-label">จำนวนผู้ป่วยทั้งหมด</div>
            <div className="stat-val">28 <span className="stat-unit">ราย</span></div>
          </div>
          <div className="stat-box">
            <div className="stat-label">เวลาเฉลี่ยก่อนเริ่ม Ambulate</div>
            <div className="stat-val" style={{ fontSize: 18 }}>2 ชม. 15 นาที</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">บันทึกข้อมูลครบถ้วน</div>
            <div className="stat-val">92.1<span className="stat-unit">%</span></div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-title">อัตราการลุกเดินตรงเวลา แยกตามวัน</div>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} ticks={[0, 35, 96]} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="rate" fill="var(--primary-blue)" radius={[4, 4, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}
