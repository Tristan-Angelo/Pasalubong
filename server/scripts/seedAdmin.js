import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pasalubong';

// Default admin credentials
const DEFAULT_ADMIN = {
  username: 'admin',
  email: 'admin@pasalubong.com',
  password: 'pasalubong123',
  fullName: 'System Administrator',
  phone: '+63 900 000 0000'
};

async function seedAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: DEFAULT_ADMIN.username });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log('Username:', DEFAULT_ADMIN.username);
      console.log('Email:', existingAdmin.email);
      
      // Ask if user wants to reset password
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      readline.question('Do you want to reset the admin password? (yes/no): ', async (answer) => {
        if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
          const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
          existingAdmin.password = hashedPassword;
          await existingAdmin.save();
          console.log('✅ Admin password has been reset');
          console.log('Username:', DEFAULT_ADMIN.username);
          console.log('Password:', DEFAULT_ADMIN.password);
        } else {
          console.log('❌ Password reset cancelled');
        }
        readline.close();
        await mongoose.connection.close();
        process.exit(0);
      });
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 10);

      // Create admin user
      const admin = await Admin.create({
        username: DEFAULT_ADMIN.username,
        email: DEFAULT_ADMIN.email,
        password: hashedPassword,
        fullName: DEFAULT_ADMIN.fullName,
        phone: DEFAULT_ADMIN.phone
      });

      console.log('✅ Admin user created successfully!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Username:', DEFAULT_ADMIN.username);
      console.log('Password:', DEFAULT_ADMIN.password);
      console.log('Email:', DEFAULT_ADMIN.email);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('⚠️  Please change the password after first login!');

      await mongoose.connection.close();
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the seed function
seedAdmin();