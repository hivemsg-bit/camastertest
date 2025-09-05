import mongoose from 'mongoose';

const paperSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    originalFilename: { type: String, required: true },
    contentType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    storagePath: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    uploadedByAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

paperSchema.index({ title: 'text', description: 'text' });

const Paper = mongoose.model('Paper', paperSchema);
export default Paper;

