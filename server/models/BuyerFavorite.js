import mongoose from 'mongoose';

const buyerFavoriteSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buyer',
    required: true,
    index: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  }
}, {
  timestamps: true
});

// Ensure unique favorite per buyer-product combination
buyerFavoriteSchema.index({ buyerId: 1, productId: 1 }, { unique: true });

const BuyerFavorite = mongoose.model('BuyerFavorite', buyerFavoriteSchema);

export default BuyerFavorite;