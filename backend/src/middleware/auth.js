import jwt from 'jsonwebtoken';
import { getFirebaseAdmin } from '../config/firebase.js';
import Admin from '../models/Admin.js';

export async function requireStudent(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Missing Authorization token' });

    const adminSdk = getFirebaseAdmin();
    const decoded = await adminSdk.auth().verifyIdToken(token);
    if (!decoded || !decoded.phone_number) {
      return res.status(401).json({ message: 'Invalid or non-phone Firebase token' });
    }
    req.student = {
      uid: decoded.uid,
      phoneNumber: decoded.phone_number,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized', error: error.message });
  }
}

export async function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Missing Authorization token' });
    const secret = process.env.ADMIN_JWT_SECRET;
    if (!secret) return res.status(500).json({ message: 'Server not configured' });

    const payload = jwt.verify(token, secret);
    const adminUser = await Admin.findById(payload.adminId).lean();
    if (!adminUser) return res.status(401).json({ message: 'Invalid admin token' });
    req.admin = { id: adminUser._id.toString(), email: adminUser.email };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized', error: error.message });
  }
}

