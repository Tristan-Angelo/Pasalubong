import mongoose from 'mongoose';

const buyerAddressSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buyer',
    required: true,
    index: true
  },
  label: {
    type: String,
    required: [true, 'Address label is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  postal: {
    type: String,
    required: [true, 'Postal code is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure only one default address per buyer
buyerAddressSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await mongoose.model('BuyerAddress').updateMany(
      { buyerId: this.buyerId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

const BuyerAddress = mongoose.model('BuyerAddress', buyerAddressSchema);

export default BuyerAddress;