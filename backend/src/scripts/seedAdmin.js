import 'dotenv/config';
import '../config/db.js';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

async function run() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME || 'Admin';
  if (!email || !password) {
    // eslint-disable-next-line no-console
    console.error('Missing SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD');
    process.exit(1);
  }
  const existing = await User.findOne({ email, role: 'admin' });
  if (existing) {
    // eslint-disable-next-line no-console
    console.log('Admin already exists:', email);
    process.exit(0);
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, name, passwordHash, role: 'admin', isVerified: true });
  // eslint-disable-next-line no-console
  console.log('Seeded admin with id:', user._id.toString());
  process.exit(0);
}

run().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});

