import { Router } from 'express';
import prisma from '../db.js';

const router = Router();

// GET all notifications
router.get('/', async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { sentAt: 'desc' },
      include: {
        patient: {
          select: { name: true, an: true }
        }
      }
    });
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลการแจ้งเตือนได้' });
  }
});

// GET unread count
router.get('/unread-count', async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: { isRead: false }
    });
    res.json({ count });
  } catch (error) {
    console.error('Error counting notifications:', error);
    res.status(500).json({ error: 'ไม่สามารถนับการแจ้งเตือนได้' });
  }
});

// PUT mark as read
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true }
    });
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'ไม่สามารถอัปเดตการแจ้งเตือนได้' });
  }
});

// PUT mark all as read
router.put('/read-all', async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true }
    });
    res.json({ message: 'อ่านการแจ้งเตือนทั้งหมดแล้ว' });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ error: 'ไม่สามารถอัปเดตการแจ้งเตือนได้' });
  }
});

export default router;
