import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function fixIndexes() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('buyerorders');

    console.log('📋 Listing current indexes...');
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(i => i.name));

    // Drop the problematic index if it exists
    const problematicIndexName = 'items.seller_1_sellerStatus.seller_1';
    const indexExists = indexes.some(i => i.name === problematicIndexName);

    if (indexExists) {
      console.log(`🗑️  Dropping problematic index: ${problematicIndexName}`);
      await collection.dropIndex(problematicIndexName);
      console.log('✅ Problematic index dropped successfully');
    } else {
      console.log('ℹ️  Problematic index not found, nothing to drop');
    }

    // Create the new index if it doesn't exist
    console.log('🔨 Creating new index on sellerStatus.seller...');
    await collection.createIndex({ 'sellerStatus.seller': 1 });
    console.log('✅ New index created successfully');

    console.log('📋 Final indexes:');
    const finalIndexes = await collection.indexes();
    finalIndexes.forEach(i => {
      console.log(`  - ${i.name}: ${JSON.stringify(i.key)}`);
    });

    console.log('✅ Index fix completed successfully!');
  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  }
}

fixIndexes();