import mongoose from 'mongoose';
import Delivery from '../models/Delivery.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pasalubong';

async function setDeliveryPersonsAvailable() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all delivery persons
    const deliveryPersons = await Delivery.find({});

    if (deliveryPersons.length === 0) {
      console.log('⚠️  No delivery persons found in the database');
      await mongoose.connection.close();
      process.exit(0);
      return;
    }

    console.log(`📋 Found ${deliveryPersons.length} delivery person(s)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Update all delivery persons to be available
    const result = await Delivery.updateMany(
      {},
      {
        $set: {
          isAvailable: true
        }
      }
    );

    console.log(`✅ Set ${result.modifiedCount} delivery person(s) as available`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Display available delivery persons
    const availableDeliveryPersons = await Delivery.find({ isAvailable: true });
    availableDeliveryPersons.forEach((dp, index) => {
      console.log(`${index + 1}. ${dp.fullname}`);
      console.log(`   Email: ${dp.email}`);
      console.log(`   Phone: ${dp.phone}`);
      console.log(`   Vehicle: ${dp.vehicleType} (${dp.licenseNumber})`);
      console.log(`   Location: ${dp.barangay}, ${dp.city}`);
      console.log(`   Status: ${dp.isAvailable ? '🟢 Available' : '🔴 Unavailable'}`);
      console.log('');
    });

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting delivery persons as available:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the function
setDeliveryPersonsAvailable();