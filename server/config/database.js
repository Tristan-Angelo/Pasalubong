import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pasalubong';
    
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    console.log('\n⚠️  MongoDB is not running or not accessible.');
    console.log('📖 Please check MONGODB_SETUP.md for installation instructions.\n');
    console.log('Options:');
    console.log('  1. Install MongoDB locally (see MONGODB_SETUP.md)');
    console.log('  2. Use MongoDB Atlas (free cloud database)');
    console.log('  3. Update MONGODB_URI in .env file\n');
    
    // Don't exit process in development, just log the error
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.log('⚠️  Server will continue without database connection.');
      console.log('   Authentication endpoints will not work until MongoDB is connected.\n');
    }
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection error: ${err}`);
});

export default connectDB;