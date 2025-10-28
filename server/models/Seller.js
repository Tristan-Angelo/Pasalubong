import mongoose from 'mongoose';

const sellerSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  ownerName: {
    type: String,
    required: [true, 'Owner name is required'],
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
  palawanPayNumber: {
    type: String,
    trim: true,
    default: ''
  },
  palawanPayName: {
    type: String,
    trim: true,
    default: ''
  },
  businessType: {
    type: String,
    required: [true, 'Business type is required'],
    enum: ['Food & Beverages', 'Agricultural Products', 'Local Delicacies', 'Other']
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
    default: 'seller',
    immutable: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  validIdFront: {
    type: String,
    default: null
  },
  validIdBack: {
    type: String,
    default: null
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'declined'],
    default: 'pending'
  },
  approvalDate: {
    type: Date,
    default: null
  },
  approvedBy: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  photo: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient email lookups
sellerSchema.index({ email: 1 });

const Seller = mongoose.model('Seller', sellerSchema);

export default Seller;