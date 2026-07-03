import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const names = [
  "สมใจ ใจดี", "สมชาย ชาตรี", "สมหญิง รักเรียน", 
  "กมลรัตน์ จิตดี", "วิชัย ว่องไว", "ปราณี มีสุข",
  "นพดล คนขยัน", "ดารณี สีทอง", "ณรงค์ จงรัก",
  "สุนทรี สีสวย"
];

async function main() {
  console.log("Seeding 10 mock patients...");
  
  const now = new Date();
  const patients = [];

  for (let i = 0; i < 10; i++) {
    const an = `123456${String(i).padStart(2, '0')}`;
    // Randomize status for the dashboard
    let status = 'PENDING';
    if (i < 2) status = 'DUE'; // 2 patients DUE
    else if (i < 5) status = 'COMPLETED'; // 3 patients COMPLETED
    else if (i === 5) status = 'OVERDUE'; // 1 patient OVERDUE

    // Assign scheduledAt dynamically based on status
    let scheduledAt = new Date(now);
    if (status === 'DUE') scheduledAt.setMinutes(now.getMinutes() - 10);
    else if (status === 'OVERDUE') scheduledAt.setMinutes(now.getMinutes() - 60);
    else if (status === 'PENDING') scheduledAt.setMinutes(now.getMinutes() + 120);
    else scheduledAt.setMinutes(now.getMinutes() - 200);

    const patient = await prisma.patient.upsert({
      where: { an },
      update: {},
      create: {
        an,
        name: names[i],
        age: Math.floor(Math.random() * 40) + 30, // 30-70
        gender: Math.random() > 0.5 ? 'M' : 'F',
        surgeryType: 'Appendectomy',
        orDischargeAt: new Date(now.getTime() - 8 * 60 * 60 * 1000), // 8 hours ago
        reminderHours: 6,
        scheduledAt,
        status,
        useLaxative: false,
        usePainMed: true,
        hasRestriction: false
      }
    });
    patients.push(patient);
  }

  console.log("Mock data inserted successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
