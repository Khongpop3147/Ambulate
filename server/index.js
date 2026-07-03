import express from 'express';
import cors from 'cors';
import patientRoutes from './routes/patients.js';
import assessmentRoutes from './routes/assessments.js';
import ambulationRoutes from './routes/ambulations.js';
import notificationRoutes from './routes/notifications.js';
import authRoutes from './routes/auth.js';
import { verifyToken } from './middleware/auth.js';
import { startScheduler } from './services/scheduler.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Auth Route (Public)
app.use('/api/auth', authRoutes);

// Protected API Routes
app.use('/api/patients', verifyToken, patientRoutes);
app.use('/api/assessments', verifyToken, assessmentRoutes);
app.use('/api/ambulations', verifyToken, ambulationRoutes);
app.use('/api/notifications', verifyToken, notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start scheduler
startScheduler();

app.listen(PORT, () => {
  console.log(`\n🏥 SARA API Server running on http://localhost:${PORT}`);
  console.log(`📋 API endpoints:`);
  console.log(`   GET  /api/patients`);
  console.log(`   GET  /api/patients/stats`);
  console.log(`   POST /api/patients`);
  console.log(`   GET  /api/assessments/patient/:id`);
  console.log(`   POST /api/assessments`);
  console.log(`   GET  /api/ambulations/patient/:id`);
  console.log(`   POST /api/ambulations`);
  console.log(`   GET  /api/notifications`);
  console.log(`   GET  /api/notifications/unread-count\n`);
});
