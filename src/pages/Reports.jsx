import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { patientAPI } from '../services/api';

export default function Reports() {
  const [data, setData] = useState({
    totalPatients: 0,
    onTimeRate: 0,
    avgTimeStr: '-',
    completionRate: 0,
    chartData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await patientAPI.getReports();
        setData(result);
      } catch (err) {
        console.error('Failed to load reports', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

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
            <span>ทั้งหมด (อัปเดตล่าสุด)</span>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>กำลังโหลดสถิติ...</div>
        ) : (
          <>
            <div className="stat-grid-reports">
              <div className="stat-box">
                <div className="stat-label">อัตราการลุกเดินตรงเวลา</div>
                <div className="stat-val">{data.onTimeRate}<span className="stat-unit">%</span></div>
              </div>
              <div className="stat-box">
                <div className="stat-label">จำนวนผู้ป่วยทั้งหมด</div>
                <div className="stat-val">{data.totalPatients} <span className="stat-unit">ราย</span></div>
              </div>
              <div className="stat-box">
                <div className="stat-label">เวลาเฉลี่ยก่อนเริ่ม Ambulate</div>
                <div className="stat-val" style={{ fontSize: 18 }}>{data.avgTimeStr}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">บันทึกข้อมูลครบถ้วน</div>
                <div className="stat-val">{data.completionRate}<span className="stat-unit">%</span></div>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-title">อัตราการลุกเดินตรงเวลา แยกตามวัน</div>
              {data.chartData && data.chartData.length > 0 ? (
                <div style={{ width: '100%', height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} ticks={[0, 50, 100]} />
                      <Tooltip cursor={{ fill: '#f1f5f9' }} />
                      <Bar dataKey="rate" fill="var(--primary-blue)" radius={[4, 4, 0, 0]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>ยังไม่มีข้อมูลลุกเดินสำหรับพล็อตกราฟ</div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
