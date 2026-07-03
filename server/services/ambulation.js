import { addHours } from 'date-fns';

export function calculateScheduledTime(orDischargeAt, reminderHours) {
  return addHours(new Date(orDischargeAt), reminderHours);
}

export function evaluateAssessment(data) {
  const failedReasons = [];
  
  if (data.systolicBP < 90 || data.systolicBP > 180) {
    failedReasons.push('ความดัน Systolic ผิดปกติ (ต้องอยู่ระหว่าง 90-180 mmHg)');
  }
  if (data.heartRate < 60 || data.heartRate > 120) {
    failedReasons.push('อัตราการเต้นหัวใจผิดปกติ (ต้องอยู่ระหว่าง 60-120 bpm)');
  }
  if (data.temperature >= 38.5) {
    failedReasons.push('อุณหภูมิร่างกายสูงเกินไป (ต้องน้อยกว่า 38.5°C)');
  }
  if (data.painScore > 7) {
    failedReasons.push('ระดับความปวดสูงเกินไป (ต้องไม่เกิน 7/10)');
  }
  if (!data.noDizziness) failedReasons.push('ผู้ป่วยมีอาการวิงเวียน/คลื่นไส้อาเจียนรุนแรง');
  if (!data.noActiveBleeding) failedReasons.push('ผู้ป่วยมี Active Bleeding');
  if (!data.isConscious) failedReasons.push('ผู้ป่วยไม่รู้สึกตัว หรือไม่สามารถรับคำสั่งได้');
  if (!data.noOrthostatic) failedReasons.push('ผู้ป่วยมี Orthostatic Hypotension');
  if (!data.drainSecure) failedReasons.push('Drain/Tube ไม่มั่นคง มีความเสี่ยงเลื่อนหลุด');
  if (!data.noDoctorRestriction) failedReasons.push('มีข้อห้ามจากคำสั่งแพทย์');

  return {
    result: failedReasons.length === 0 ? 'READY' : 'NOT_READY',
    failedReasons
  };
}
