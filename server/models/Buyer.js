import mongoose from 'mongoose';

const buyerSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    index: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  region: {
    type: String,
    required: [true, 'Region is required']
  },
  province: {
    type: String,
    required: [true, 'Province is required']
  },
  city: {
    type: String,
    required: [true, 'City is required']
  },
  barangay: {
    type: String,
    required: [true, 'Barangay is required']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    default: null
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordCode: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  role: {
    type: String,
    default: 'buyer',
    immutable: true
  }
}, {
  timestamps: true
});

const Buyer = mongoose.model('Buyer', buyerSchema);

export default Buyer;