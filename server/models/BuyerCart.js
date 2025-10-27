import mongoose from 'mongoose';

const buyerCartSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buyer',
    required: true,
    index: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    }
  }]
}, {
  timestamps: true
});

// Ensure one cart per buyer
buyerCartSchema.index({ buyerId: 1 }, { unique: true });

const BuyerCart = mongoose.model('BuyerCart', buyerCartSchema);

export default BuyerCart;