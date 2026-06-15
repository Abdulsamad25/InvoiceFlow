// Script to update existing user's role from STAFF to ADMIN or ACCOUNTANT
// Run with: node backend/scripts/updateUserRole.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../models/user.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from backend directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const updateUserRole = async () => {
  try {
    // Try both common environment variable names
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!mongoUri) {
      console.error('❌ MongoDB URI is not defined in .env file');
      console.log('Please make sure your .env file contains either:');
      console.log('  MONGODB_URI=your_mongodb_connection_string');
      console.log('  or');
      console.log('  MONGO_URI=your_mongodb_connection_string');
      process.exit(1);
    }
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Update user with email samadolalekan15@gmail.com to ADMIN
    const result = await User.updateOne(
      { email: 'samadolalekan15@gmail.com' },
      { $set: { role: 'ADMIN' } }
    );

    if (result.matchedCount === 0) {
      console.log('User not found');
    } else if (result.modifiedCount === 0) {
      console.log('User role already set to ADMIN');
    } else {
      console.log('✅ User role updated to ADMIN successfully');
    }

    // Show all users
    const users = await User.find().select('name email role');
    console.log('\nAll users:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}): ${user.role}`);
    });

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateUserRole();
