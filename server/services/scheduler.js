import { addMinutes, isBefore } from 'date-fns';
import prisma from '../db.js';

export function startScheduler() {
  console.log('Scheduler started - checking every 60 seconds');
  
  // Run immediately on start
  checkAndUpdate();
  
  // Then run every 60 seconds
  setInterval(checkAndUpdate, 60 * 1000);
}

async function checkAndUpdate() {
  try {
    const now = new Date();

    // 1. PENDING -> DUE: patients whose scheduledAt has passed
    const pendingPatients = await prisma.patient.findMany({
      where: {
        status: 'PENDING',
        scheduledAt: { lte: now }
      }
    });

    for (const patient of pendingPatients) {
      await prisma.patient.update({
        where: { id: patient.id },
        data: { status: 'DUE' }
      });

      await prisma.notification.create({
        data: {
          patientId: patient.id,
          type: 'INITIAL',
          message: `ถึงเวลากระตุ้น ${patient.name} (AN: ${patient.an}) ลุกเดิน`
        }
      });

      console.log(`Patient ${patient.an} status changed to DUE`);
    }

    // 2. DUE -> OVERDUE: patients overdue by 15 minutes
    const duePatients = await prisma.patient.findMany({
      where: {
        status: 'DUE',
        scheduledAt: { lte: addMinutes(now, -15) }
      }
    });

    for (const patient of duePatients) {
      await prisma.patient.update({
        where: { id: patient.id },
        data: { status: 'OVERDUE' }
      });

      await prisma.notification.create({
        data: {
          patientId: patient.id,
          type: 'REMINDER',
          message: `⚠️ เลยกำหนด! ${patient.name} (AN: ${patient.an}) ยังไม่ได้ลุกเดิน`
        }
      });

      console.log(`Patient ${patient.an} status changed to OVERDUE`);
    }

    // 3. OVERDUE: send reminder every 15 minutes
    const overduePatients = await prisma.patient.findMany({
      where: { status: 'OVERDUE' },
      include: {
        notifications: {
          orderBy: { sentAt: 'desc' },
          take: 1
        }
      }
    });

    for (const patient of overduePatients) {
      const lastNotif = patient.notifications[0];
      if (lastNotif && isBefore(addMinutes(lastNotif.sentAt, 15), now)) {
        await prisma.notification.create({
          data: {
            patientId: patient.id,
            type: 'REMINDER',
            message: `🔔 แจ้งเตือนซ้ำ: ${patient.name} (AN: ${patient.an}) ยังไม่ได้ลุกเดิน`
          }
        });
        console.log(`Reminder sent for overdue patient ${patient.an}`);
      }
    }
  } catch (error) {
    console.error('Scheduler error:', error);
  }
}
