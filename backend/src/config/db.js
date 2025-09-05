import mongoose from 'mongoose';

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  // eslint-disable-next-line no-console
  console.error('Missing MONGO_URI in environment');
  process.exit(1);
}

mongoose
  .connect(mongoUri, {
    autoIndex: true,
  })
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('MongoDB connected');
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error', error);
    process.exit(1);
  });

export default mongoose;

