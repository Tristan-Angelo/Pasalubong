import mongoose from 'mongoose';
import dotenv from 'dotenv';
import BuyerOrder from '../models/BuyerOrder.js';
import Product from '../models/Product.js';
import Delivery from '../models/Delivery.js';

dotenv.config();

const addIndexes = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n📊 Adding database indexes for performance optimization...\n');

    // BuyerOrder indexes
    console.log('Adding BuyerOrder indexes...');
    await BuyerOrder.collection.createIndex({ 'items.seller': 1 });
    console.log('✅ Index on items.seller created');
    
    await BuyerOrder.collection.createIndex({ deliveryPersonId: 1, deliveryStatus: 1 });
    console.log('✅ Index on deliveryPersonId + deliveryStatus created');
    
    await BuyerOrder.collection.createIndex({ status: 1, deliveryPersonId: 1, deliveryStatus: 1 });
    console.log('✅ Index on status + deliveryPersonId + deliveryStatus created');
    
    await BuyerOrder.collection.createIndex({ createdAt: -1 });
    console.log('✅ Index on createdAt created');
    
    await BuyerOrder.collection.createIndex({ buyerId: 1 });
    console.log('✅ Index on buyerId created');

    // Product indexes
    console.log('\nAdding Product indexes...');
    await Product.collection.createIndex({ seller: 1 });
    console.log('✅ Index on seller created');
    
    await Product.collection.createIndex({ category: 1 });
    console.log('✅ Index on category created');

    // Delivery indexes
    console.log('\nAdding Delivery indexes...');
    await Delivery.collection.createIndex({ isActive: 1, isAvailable: 1 });
    console.log('✅ Index on isActive + isAvailable created');
    
    // Email index already exists as unique index from schema, skip it
    console.log('ℹ️  Index on email already exists (unique index from schema)');

    console.log('\n✅ All indexes created successfully!');
    console.log('\n📋 Summary of indexes:');
    console.log('   - BuyerOrder: items.seller, deliveryPersonId+deliveryStatus, status+deliveryPersonId+deliveryStatus, createdAt, buyerId');
    console.log('   - Product: seller, category');
    console.log('   - Delivery: isActive+isAvailable, email (existing)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding indexes:', error);
    process.exit(1);
  }
};

addIndexes();