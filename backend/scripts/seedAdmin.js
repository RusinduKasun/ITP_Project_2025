import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/Admin/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI is not set in environment. Please set it in .env');
  process.exit(1);
}

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      family: 4
    });

    console.log('Connected to MongoDB for seeding');

    const username = process.env.SEED_ADMIN_USERNAME || 'idusara';
    const email = process.env.SEED_ADMIN_EMAIL || 'idusara@gmail.com';
    const password = process.env.SEED_ADMIN_PASSWORD || 'Idusara123';

    // Create or update admin user
    const existing = await User.findOne({ $or: [{ username }, { email }] }).select('+password');
    if (existing) {
      existing.username = username;
      existing.email = email.toLowerCase();
      existing.password = password; // will be hashed by pre-save
      existing.role = 'admin';
      existing.isActive = true;
      await existing.save();
      console.log(`Updated admin user (${username})`);
    } else {
      const user = new User({
        username,
        firstName: 'Admin',
        lastName: 'User',
        email: email.toLowerCase(),
        password,
        role: 'admin',
        isActive: true
      });
      await user.save();
      console.log(`Created admin user (${username})`);
    }

    await mongoose.disconnect();
    console.log('Seeding complete');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seed();
