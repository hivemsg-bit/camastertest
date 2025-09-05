import jwt from 'jsonwebtoken';
import admin from '../config/firebase.js';
import User from '../models/User.js';

export const authenticateStudent = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Missing token' });

    const decoded = await admin.auth().verifyIdToken(token);
    const user = await User.findOne({ firebaseUid: decoded.uid, role: 'student' });
    if (!user) return res.status(401).json({ message: 'Student not found' });
    if (!user.isVerified) return res.status(403).json({ message: 'Student not verified' });

    req.user = { id: user._id.toString(), role: 'student' };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Missing token' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ message: 'Invalid admin token' });
    }
    req.user = { id: user._id.toString(), role: 'admin' };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

