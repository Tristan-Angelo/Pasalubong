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

    // Drop all problematic indexes that involve items.seller
    const problematicIndexes = [
      'items.seller_1_sellerStatus.seller_1',
      'items.seller_1_createdAt_-1',
      'items.seller_1'
    ];

    for (const indexName of problematicIndexes) {
      const indexExists = indexes.some(i => i.name === indexName);
      if (indexExists) {
        console.log(`🗑️  Dropping problematic index: ${indexName}`);
        try {
          await collection.dropIndex(indexName);
          console.log(`✅ Index ${indexName} dropped successfully`);
        } catch (error) {
          console.log(`⚠️  Could not drop ${indexName}: ${error.message}`);
        }
      } else {
        console.log(`ℹ️  Index ${indexName} not found, skipping`);
      }
    }

    // Create the new index if it doesn't exist
    console.log('🔨 Creating index on sellerStatus.seller...');
    try {
      await collection.createIndex({ 'sellerStatus.seller': 1 });
      console.log('✅ Index on sellerStatus.seller created successfully');
    } catch (error) {
      console.log(`ℹ️  Index on sellerStatus.seller already exists or error: ${error.message}`);
    }

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