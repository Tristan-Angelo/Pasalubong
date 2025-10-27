import mongoose from 'mongoose';

const buyerProfileSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buyer',
    required: true,
    unique: true,
    index: true
  },
  photo: {
    type: String,
    default: null
  },
  birthday: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const BuyerProfile = mongoose.model('BuyerProfile', buyerProfileSchema);

export default BuyerProfile;