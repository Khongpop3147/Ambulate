import { Router } from 'express';
import prisma from '../db.js';

const router = Router();

// POST create ambulation record
router.post('/', async (req, res) => {
  try {
    const { patientId, startTime, endTime, distance, duration, assistLevel,
            symptomsDuring, symptomsAfter, symptomsNote, complication, complicationNote } = req.body;

    if (!patientId) {
      return res.status(400).json({ error: 'กรุณาระบุ patientId' });
    }

    const ambulation = await prisma.ambulation.create({
      data: {
        patientId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        distance: distance ? parseFloat(distance) : null,
        duration: duration ? parseInt(duration) : null,
        assistLevel,
        symptomsDuring,
        symptomsAfter,
        symptomsNote: symptomsNote || null,
        complication,
        complicationNote: complicationNote || null,
      }
    });

    // Update patient status to COMPLETED
    await prisma.patient.update({
      where: { id: patientId },
      data: { status: 'COMPLETED' }
    });

    res.status(201).json(ambulation);
  } catch (error) {
    console.error('Error creating ambulation:', error);
    res.status(500).json({ error: 'ไม่สามารถบันทึกการเดินได้' });
  }
});

// GET ambulations by patient
router.get('/patient/:patientId', async (req, res) => {
  try {
    const ambulations = await prisma.ambulation.findMany({
      where: { patientId: req.params.patientId },
      orderBy: { recordedAt: 'desc' }
    });
    res.json(ambulations);
  } catch (error) {
    console.error('Error fetching ambulations:', error);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลการเดินได้' });
  }
});

export default router;
