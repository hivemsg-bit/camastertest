import mongoose from 'mongoose';

const { Schema } = mongoose;

const paperSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    subject: { type: String },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    storagePath: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Paper = mongoose.model('Paper', paperSchema);

export default Paper;

