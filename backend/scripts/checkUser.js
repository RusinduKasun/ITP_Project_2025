import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/Admin/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI is not set in environment (.env)');
  process.exit(1);
}

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      family: 4
    });

    const query = 'idusara';
    const user = await User.findOne({ $or: [{ username: query }, { email: query }] }).select('+password');

    if (!user) {
      console.log('User not found for query:', query);
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log('User found:');
    console.log({ username: user.username, email: user.email, role: user.role, isActive: user.isActive, createdAt: user.createdAt });

    const match = await user.comparePassword('Idusara123');
    console.log('Password match for Idusara123:', match);

    // Also print hashed password (for debugging only)
    console.log('Stored hashed password (truncated):', user.password ? user.password.slice(0, 30) + '...' : '(no password)');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error checking user:', err);
    process.exit(1);
  }
};

run();
