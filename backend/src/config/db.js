import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  // eslint-disable-next-line no-console
  console.warn('MONGODB_URI not set. Database connection will fail.');
}

mongoose
  .connect(mongoUri, { autoIndex: true })
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error:', error.message);
  });

export default mongoose;

