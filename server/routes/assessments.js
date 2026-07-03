import { Router } from 'express';
import { evaluateAssessment } from '../services/ambulation.js';
import prisma from '../db.js';

const router = Router();

// POST create assessment
router.post('/', async (req, res) => {
  try {
    const { patientId, systolicBP, diastolicBP, heartRate, temperature, painScore,
            noDizziness, noActiveBleeding, isConscious, noOrthostatic, drainSecure, noDoctorRestriction } = req.body;

    if (!patientId) {
      return res.status(400).json({ error: 'กรุณาระบุ patientId' });
    }

    // Evaluate assessment
    const evaluation = evaluateAssessment({
      systolicBP: parseInt(systolicBP),
      heartRate: parseInt(heartRate),
      temperature: parseFloat(temperature),
      painScore: parseInt(painScore),
      noDizziness: Boolean(noDizziness),
      noActiveBleeding: Boolean(noActiveBleeding),
      isConscious: Boolean(isConscious),
      noOrthostatic: Boolean(noOrthostatic),
      drainSecure: Boolean(drainSecure),
      noDoctorRestriction: Boolean(noDoctorRestriction),
    });

    const assessment = await prisma.assessment.create({
      data: {
        patientId,
        systolicBP: parseInt(systolicBP),
        diastolicBP: parseInt(diastolicBP),
        heartRate: parseInt(heartRate),
        temperature: parseFloat(temperature),
        painScore: parseInt(painScore),
        noDizziness: Boolean(noDizziness),
        noActiveBleeding: Boolean(noActiveBleeding),
        isConscious: Boolean(isConscious),
        noOrthostatic: Boolean(noOrthostatic),
        drainSecure: Boolean(drainSecure),
        noDoctorRestriction: Boolean(noDoctorRestriction),
        result: evaluation.result,
        failedReasons: evaluation.failedReasons.length > 0 ? JSON.stringify(evaluation.failedReasons) : null,
      }
    });

    res.status(201).json(assessment);
  } catch (error) {
    console.error('Error creating assessment:', error);
    res.status(500).json({ error: 'ไม่สามารถบันทึกการประเมินได้' });
  }
});

// GET assessments by patient
router.get('/patient/:patientId', async (req, res) => {
  try {
    const assessments = await prisma.assessment.findMany({
      where: { patientId: req.params.patientId },
      orderBy: { assessedAt: 'desc' }
    });
    res.json(assessments);
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลการประเมินได้' });
  }
});

export default router;
