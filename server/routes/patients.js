import { Router } from 'express';
import prisma from '../db.js';
import { calculateScheduledTime } from '../services/ambulation.js';

const router = Router();
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};
    
    const patients = await prisma.patient.findMany({
      where,
      orderBy: { scheduledAt: 'asc' },
      include: {
        _count: {
          select: { assessments: true, ambulations: true }
        }
      }
    });
    
    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลผู้ป่วยได้' });
  }
});

// GET patient stats
router.get('/stats', async (req, res) => {
  try {
    const [pending, due, completed, overdue, total] = await Promise.all([
      prisma.patient.count({ where: { status: 'PENDING' } }),
      prisma.patient.count({ where: { status: 'DUE' } }),
      prisma.patient.count({ where: { status: 'COMPLETED' } }),
      prisma.patient.count({ where: { status: 'OVERDUE' } }),
      prisma.patient.count(),
    ]);
    
    res.json({ pending, due, completed, overdue, total });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลสถิติได้' });
  }
});

// GET report stats
router.get('/reports', async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      include: { ambulations: true, assessments: true },
      orderBy: { orDischargeAt: 'asc' }
    });

    const totalPatients = patients.length;
    let completedAmbulations = 0;
    let totalTimeDiffMs = 0;
    
    const dailyStats = {}; // { 'YYYY-MM-DD': { total: 0, completed: 0 } }

    patients.forEach(p => {
      // Grouping by Date
      const dateStr = p.orDischargeAt.toISOString().split('T')[0];
      if (!dailyStats[dateStr]) dailyStats[dateStr] = { total: 0, completed: 0 };
      dailyStats[dateStr].total += 1;

      // Ambulation success
      if (p.ambulations && p.ambulations.length > 0) {
        completedAmbulations += 1;
        dailyStats[dateStr].completed += 1;
        
        // Time difference (from OR Out to first Ambulation Start)
        const firstAmbu = p.ambulations[0];
        const diffMs = new Date(firstAmbu.startTime).getTime() - new Date(p.orDischargeAt).getTime();
        if (diffMs > 0) totalTimeDiffMs += diffMs;
      }
    });

    const onTimeRate = totalPatients > 0 ? (completedAmbulations / totalPatients) * 100 : 0;
    
    // Avg time in milliseconds
    const avgTimeMs = completedAmbulations > 0 ? (totalTimeDiffMs / completedAmbulations) : 0;
    const avgHours = Math.floor(avgTimeMs / (1000 * 60 * 60));
    const avgMinutes = Math.floor((avgTimeMs % (1000 * 60 * 60)) / (1000 * 60));
    const avgTimeStr = avgHours > 0 ? `${avgHours} ชม. ${avgMinutes} นาที` : `${avgMinutes} นาที`;

    // Chart Data
    const chartData = Object.keys(dailyStats).map(dateStr => {
      const dayData = dailyStats[dateStr];
      const rate = dayData.total > 0 ? Math.round((dayData.completed / dayData.total) * 100) : 0;
      const [y, m, d] = dateStr.split('-');
      return {
        day: `${parseInt(d)}/${parseInt(m)}`, // e.g. "5/9"
        rate
      };
    });

    // Just take the last 10 days for the chart
    const recentChartData = chartData.slice(-10);

    res.json({
      totalPatients,
      onTimeRate: parseFloat(onTimeRate.toFixed(1)),
      avgTimeStr: avgTimeStr === '0 นาที' && completedAmbulations === 0 ? '-' : avgTimeStr,
      completionRate: parseFloat(onTimeRate.toFixed(1)), // using same metric for now
      chartData: recentChartData
    });

  } catch (error) {
    console.error('Error generating reports:', error);
    res.status(500).json({ error: 'ไม่สามารถสร้างรายงานได้' });
  }
});

// GET patient by ID
router.get('/:id', async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.id },
      include: {
        assessments: { orderBy: { assessedAt: 'desc' } },
        ambulations: { orderBy: { recordedAt: 'desc' } },
        notifications: { orderBy: { sentAt: 'desc' } }
      }
    });
    
    if (!patient) {
      return res.status(404).json({ error: 'ไม่พบผู้ป่วย' });
    }
    
    res.json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลผู้ป่วยได้' });
  }
});

// POST create patient
router.post('/', async (req, res) => {
  try {
    const { an, name, age, gender, surgeryType, orDischargeAt, reminderHours, useLaxative, usePainMed, hasRestriction, restrictionNote } = req.body;
    
    // Validate AN (8 digits)
    if (!an || !/^\d{8}$/.test(an)) {
      return res.status(400).json({ error: 'AN ต้องเป็นตัวเลข 8 หลัก' });
    }
    
    // Check duplicate AN
    const existing = await prisma.patient.findUnique({ where: { an } });
    if (existing) {
      return res.status(400).json({ error: 'AN นี้มีอยู่ในระบบแล้ว' });
    }
    
    // Calculate scheduled time
    const scheduledAt = calculateScheduledTime(orDischargeAt, reminderHours || 6);
    
    const patient = await prisma.patient.create({
      data: {
        an,
        name,
        age: parseInt(age),
        gender,
        surgeryType,
        orDischargeAt: new Date(orDischargeAt),
        reminderHours: parseInt(reminderHours) || 6,
        scheduledAt,
        useLaxative: Boolean(useLaxative),
        usePainMed: Boolean(usePainMed),
        hasRestriction: Boolean(hasRestriction),
        restrictionNote: restrictionNote || null,
      }
    });
    
    res.status(201).json(patient);
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ error: 'ไม่สามารถลงทะเบียนผู้ป่วยได้' });
  }
});

// PUT update patient
router.put('/:id', async (req, res) => {
  try {
    const patient = await prisma.patient.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(patient);
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ error: 'ไม่สามารถอัปเดตข้อมูลผู้ป่วยได้' });
  }
});

// DELETE patient
router.delete('/:id', async (req, res) => {
  try {
    await prisma.patient.delete({ where: { id: req.params.id } });
    res.json({ message: 'ลบข้อมูลผู้ป่วยเรียบร้อย' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ error: 'ไม่สามารถลบข้อมูลผู้ป่วยได้' });
  }
});

export default router;
