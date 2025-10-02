import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/Admin/User.js';
import connectDB from '../config/db.js';

dotenv.config();

const user = {
  username: 'Himaya1',
  // must be a valid email to pass model validation
  email: 'himaya1@example.com',
  firstName: 'Himaya',
  lastName: 'Fernando',
  password: 'Himaya12',
  role: 'finance-manager',
  isActive: true
};

async function seed() {
  try {
    await connectDB();
    console.log('Connected to MongoDB for seeding finance user');

    const existing = await User.findOne({ $or: [{ username: user.username }, { email: user.email }] }).select('+password');
    if (existing) {
      existing.firstName = user.firstName;
      existing.lastName = user.lastName;
      existing.role = user.role;
      existing.isActive = true;
      existing.email = user.email.toLowerCase();
      existing.password = user.password;
      await existing.save();
      console.log(`Updated user ${user.username} (${user.role})`);
    } else {
      const newUser = new User({
        username: user.username,
        email: user.email.toLowerCase(),
        firstName: user.firstName,
        lastName: user.lastName,
        password: user.password,
        role: user.role,
        isActive: true
      });
      await newUser.save();
      console.log(`Created user ${user.username} (${user.role})`);
    }

    console.log('Seeding finance user complete');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error', err);
    process.exit(1);
  }
}

seed();
