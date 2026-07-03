import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sara_super_secret_key_12345';

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'ไม่พบ Token กรุณาเข้าสู่ระบบ' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return res.status(403).json({ error: 'Token ไม่ถูกต้องหรือหมดอายุ' });
  }
};
