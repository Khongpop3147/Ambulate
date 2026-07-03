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
