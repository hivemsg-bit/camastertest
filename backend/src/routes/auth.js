import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import admin from '../config/firebase.js';
import User from '../models/User.js';

const router = Router();

// Student verify/login using Firebase ID token after OTP sign-in on client
router.post('/student/verify', async (req, res) => {
  try {
    const { idToken, name } = req.body;
    if (!idToken) return res.status(400).json({ message: 'idToken required' });

    const decoded = await admin.auth().verifyIdToken(idToken);
    const { uid, phone_number: phoneNumber } = decoded;

    let user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      user = await User.create({
        firebaseUid: uid,
        phoneNumber: phoneNumber || undefined,
        name: name || undefined,
        role: 'student',
        isVerified: true,
      });
    } else if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    return res.json({ message: 'Student verified', user: { id: user._id, name: user.name } });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
});

// Admin register (one-time seeding or via POST); keep simple
router.post('/admin/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });
    const existing = await User.findOne({ email, role: 'admin' });
    if (existing) return res.status(409).json({ message: 'Admin already exists' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, name, passwordHash, role: 'admin', isVerified: true });
    return res.status(201).json({ id: user._id });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create admin' });
  }
});

// Admin login -> JWT
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, role: 'admin' });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash || '');
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ sub: user._id.toString(), role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { id: user._id, email: user.email } });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed' });
  }
});

export default router;

