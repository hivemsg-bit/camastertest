import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import asyncHandler from 'express-async-handler';

const router = Router();

// Admin email/password login
router.post(
  '/admin/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const secret = process.env.ADMIN_JWT_SECRET;
    if (!secret) return res.status(500).json({ message: 'Server not configured' });
    const token = jwt.sign({ adminId: admin._id.toString() }, secret, { expiresIn: '12h' });
    res.json({ token, email: admin.email });
  })
);

// Admin bootstrap endpoint (optional) to create first admin
router.post(
  '/admin/bootstrap',
  asyncHandler(async (req, res) => {
    const { email, password, secret } = req.body;
    if (secret !== process.env.ADMIN_BOOTSTRAP_SECRET) return res.status(403).json({ message: 'Forbidden' });
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const exists = await Admin.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Admin already exists' });
    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ email, passwordHash });
    res.status(201).json({ id: admin._id.toString(), email: admin.email });
  })
);

export default router;

