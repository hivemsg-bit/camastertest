import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firebaseUid: { type: String, index: true },
    phoneNumber: { type: String, index: true },
    email: { type: String, index: true },
    name: { type: String },
    role: { type: String, enum: ['student', 'admin'], required: true },
    passwordHash: { type: String }, // for admin only
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.index({ phoneNumber: 1 }, { unique: false });
userSchema.index({ email: 1 }, { unique: false });

const User = mongoose.model('User', userSchema);

export default User;

