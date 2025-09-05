import { Router } from 'express';
import multer from 'multer';
import Paper from '../models/Paper.js';
import { authenticateAdmin, authenticateStudent } from '../middleware/auth.js';
import { uploadBuffer, getSignedUrl, deleteFile } from '../utils/storage.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// List papers (public list, but downloads require auth)
router.get('/', async (_req, res) => {
  const papers = await Paper.find({ isActive: true }).sort({ createdAt: -1 });
  res.json(papers.map(p => ({
    id: p._id,
    title: p.title,
    description: p.description,
    subject: p.subject,
    fileType: p.fileType,
    createdAt: p.createdAt,
  })));
});

// Upload paper (admin)
router.post('/upload', authenticateAdmin, upload.single('file'), async (req, res) => {
  try {
    const { title, description, subject } = req.body;
    if (!req.file) return res.status(400).json({ message: 'File is required' });
    const fileType = req.file.mimetype;
    const fileName = req.file.originalname;
    const storagePath = `papers/${Date.now()}-${fileName}`;
    await uploadBuffer({ buffer: req.file.buffer, destinationPath: storagePath, contentType: fileType });
    const paper = await Paper.create({
      title,
      description,
      subject,
      fileName,
      fileType,
      storagePath,
      uploadedBy: req.user.id,
    });
    res.status(201).json({ id: paper._id });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Generate signed download URL (student only, verified)
router.get('/:id/download', authenticateStudent, async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper || !paper.isActive) return res.status(404).json({ message: 'Not found' });
    const url = await getSignedUrl({ storagePath: paper.storagePath, expiresInSeconds: 120 });
    res.json({ url });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create signed URL' });
  }
});

// Admin manage: list, toggle, delete
router.get('/admin/list', authenticateAdmin, async (_req, res) => {
  const papers = await Paper.find().sort({ createdAt: -1 });
  res.json(papers);
});

router.patch('/:id/toggle', authenticateAdmin, async (req, res) => {
  const paper = await Paper.findById(req.params.id);
  if (!paper) return res.status(404).json({ message: 'Not found' });
  paper.isActive = !paper.isActive;
  await paper.save();
  res.json({ id: paper._id, isActive: paper.isActive });
});

router.delete('/:id', authenticateAdmin, async (req, res) => {
  const paper = await Paper.findById(req.params.id);
  if (!paper) return res.status(404).json({ message: 'Not found' });
  await deleteFile({ storagePath: paper.storagePath });
  await paper.deleteOne();
  res.json({ success: true });
});

export default router;

