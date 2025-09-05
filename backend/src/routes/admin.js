import { Router } from 'express';
import multer from 'multer';
import asyncHandler from 'express-async-handler';
import { v4 as uuidv4 } from 'uuid';
import mime from 'mime-types';
import { requireAdmin } from '../middleware/auth.js';
import Paper from '../models/Paper.js';
import { uploadBufferToStorage, deleteFromStorage } from '../utils/storage.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 40 * 1024 * 1024 } });

// Create/upload a paper
router.post(
  '/papers',
  requireAdmin,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const file = req.file;
    if (!title || !file) return res.status(400).json({ message: 'Title and file are required' });

    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!allowed.includes(file.mimetype)) return res.status(400).json({ message: 'Only PDF or Word files are allowed' });

    const ext = mime.extension(file.mimetype) || 'bin';
    const path = `papers/${uuidv4()}.${ext}`;
    await uploadBufferToStorage({ buffer: file.buffer, destinationPath: path, contentType: file.mimetype, metadata: { title } });

    const created = await Paper.create({
      title,
      description,
      originalFilename: file.originalname,
      contentType: file.mimetype,
      fileSize: file.size,
      storagePath: path,
      uploadedByAdminId: req.admin.id,
    });

    res.status(201).json(created);
  })
);

// List all papers (admin)
router.get(
  '/papers',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const papers = await Paper.find().sort({ createdAt: -1 }).lean();
    res.json(papers);
  })
);

// Update paper activity
router.patch(
  '/papers/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { isActive, title, description } = req.body;
    const updated = await Paper.findByIdAndUpdate(
      req.params.id,
      { $set: { ...(isActive === undefined ? {} : { isActive }), ...(title === undefined ? {} : { title }), ...(description === undefined ? {} : { description }) } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Paper not found' });
    res.json(updated);
  })
);

// Delete paper
router.delete(
  '/papers/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const paper = await Paper.findById(req.params.id);
    if (!paper) return res.status(404).json({ message: 'Paper not found' });
    await deleteFromStorage(paper.storagePath);
    await paper.deleteOne();
    res.json({ ok: true });
  })
);

export default router;

