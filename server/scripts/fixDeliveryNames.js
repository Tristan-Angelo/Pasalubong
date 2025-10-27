import mongoose from 'mongoose';
import Delivery from '../models/Delivery.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pasalubong';

async function fixDeliveryNames() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all delivery persons
    const deliveries = await Delivery.find({});
    console.log(`📋 Found ${deliveries.length} delivery person(s)`);

    if (deliveries.length === 0) {
      console.log('⚠️ No delivery persons found in database');
      await mongoose.connection.close();
      return;
    }

    let updatedCount = 0;
    let skippedCount = 0;

    for (const delivery of deliveries) {
      // Use MongoDB's native collection to access the raw fullName field
      const rawDoc = await mongoose.connection.collection('deliveries').findOne({ _id: delivery._id });
      
      // Check if there's a fullName field in the raw document
      if (rawDoc && rawDoc.fullName) {
        // Update fullname from fullName field
        delivery.fullname = rawDoc.fullName;
        await delivery.save();
        console.log(`✅ Updated: ${delivery.email} -> ${rawDoc.fullName} (from fullName field)`);
        updatedCount++;
      } else if (!delivery.fullname) {
        // Fallback to email username if no fullName exists
        const name = delivery.email.split('@')[0];
        delivery.fullname = name;
        await delivery.save();
        console.log(`✅ Updated: ${delivery.email} -> ${name} (from email)`);
        updatedCount++;
      } else {
        console.log(`⏭️ Skipped: ${delivery.email} (already has fullname: ${delivery.fullname})`);
        skippedCount++;
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Updated ${updatedCount} delivery person(s)`);
    console.log(`⏭️ Skipped ${skippedCount} delivery person(s)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Display all delivery persons with their names
    const allDeliveries = await Delivery.find({});
    allDeliveries.forEach((dp, index) => {
      console.log(`${index + 1}. ${dp.fullname || 'MISSING NAME'}`);
      console.log(`   Email: ${dp.email}`);
      console.log(`   Phone: ${dp.phone}`);
      console.log(`   Vehicle: ${dp.vehicleType} (${dp.vehiclePlate || dp.licenseNumber})`);
      console.log(`   Location: ${dp.barangay}, ${dp.city}`);
      console.log('');
    });

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixDeliveryNames();