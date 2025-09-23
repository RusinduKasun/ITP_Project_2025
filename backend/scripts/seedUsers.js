import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/Admin/User.js';
import connectDB from '../config/db.js';

dotenv.config();

const usersToSeed = [
	{
		username: 'Kasun',
		email: 'kasun@gmail.com',
		firstName: 'Kasun',
		lastName: 'Perera',
		password: 'Kasun123',
		role: 'supplier'
	},
	{
		username: 'Himaya',
		email: 'himaya@gmail.com',
		firstName: 'Himaya',
		lastName: 'Fernando',
		password: 'Himaya123',
		role: 'finance-manager'
	},
	{
		username: 'Dinithi',
		email: 'dinithi@gmail.com',
		firstName: 'Dinithi',
		lastName: 'Kumari',
		password: 'Dinithi123',
		role: 'inventory-manager'
	}
];

async function seed() {
	try {
		await connectDB();
		console.log('Connected to MongoDB for seeding users');

		for (const u of usersToSeed) {
			const existing = await User.findOne({ $or: [{ username: u.username }, { email: u.email }] }).select('+password');
			if (existing) {
				// Update allowed fields and password
				existing.firstName = u.firstName;
				existing.lastName = u.lastName;
				existing.role = u.role;
				existing.isActive = true;
				existing.email = u.email.toLowerCase();
				// Set password directly so pre-save hook will hash when saving
				existing.password = u.password;
				await existing.save();
				console.log(`Updated user ${u.username} (${u.role})`);
			} else {
				const newUser = new User({
					username: u.username,
					email: u.email.toLowerCase(),
					firstName: u.firstName,
					lastName: u.lastName,
					password: u.password,
					role: u.role,
					isActive: true
				});
				await newUser.save();
				console.log(`Created user ${u.username} (${u.role})`);
			}
		}

		console.log('Seeding complete');
		process.exit(0);
	} catch (err) {
		console.error('Seeding error', err);
		process.exit(1);
	}
}

seed();
