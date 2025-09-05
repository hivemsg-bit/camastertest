import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import Paper from '../models/Paper.js';
import User from '../models/User.js';
import { requireStudent } from '../middleware/auth.js';
import { generateV4ReadSignedUrl } from '../utils/storage.js';

const router = Router();

// Public list (only active fields)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const papers = await Paper.find({ isActive: true })
      .select('title description createdAt')
      .sort({ createdAt: -1 })
      .lean();
    res.json(papers);
  })
);

// Student-only: get signed download url
router.post(
  '/download/:id',
  requireStudent,
  asyncHandler(async (req, res) => {
    const paper = await Paper.findById(req.params.id);
    if (!paper || !paper.isActive) return res.status(404).json({ message: 'Paper not found' });

    // Ensure student exists (create-on-first-login)
    const { uid, phoneNumber } = req.student;
    await User.findOneAndUpdate(
      { firebaseUid: uid },
      { $setOnInsert: { phoneNumber } },
      { upsert: true, new: true }
    );

    const url = await generateV4ReadSignedUrl(paper.storagePath, 300);
    res.json({ url });
  })
);

export default router;

