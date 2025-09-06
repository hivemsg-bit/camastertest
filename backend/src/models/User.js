import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    phoneNumber: { type: String, required: true, index: true },
    displayName: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;

