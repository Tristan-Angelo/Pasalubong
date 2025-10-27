import mongoose from 'mongoose';
import Seller from './server/models/Seller.js';

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pasalubong';

async function checkSellerPalawanPay() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all sellers
    const sellers = await Seller.find({}).select('email businessName palawanPayNumber palawanPayName');

    console.log('\n📊 Seller Palawan Pay Information:');
    console.log('='.repeat(80));
    
    if (sellers.length === 0) {
      console.log('❌ No sellers found in database');
    } else {
      sellers.forEach((seller, index) => {
        console.log(`\n${index + 1}. ${seller.businessName}`);
        console.log(`   Email: ${seller.email}`);
        console.log(`   Palawan Pay Number: ${seller.palawanPayNumber || '❌ NOT SET'}`);
        console.log(`   Palawan Pay Name: ${seller.palawanPayName || '❌ NOT SET'}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log(`\nTotal sellers: ${sellers.length}`);
    console.log(`Sellers with Palawan Pay: ${sellers.filter(s => s.palawanPayNumber).length}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

checkSellerPalawanPay();