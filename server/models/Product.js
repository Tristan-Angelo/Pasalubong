import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Sweets', 'Snacks', 'Clothing', 'Handicrafts', 'Beverages', 'Other']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive']
  },
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  seller: {
    type: String,
    required: [true, 'Seller is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300'
  },
  images: {
    type: [String],
    default: function() {
      return [this.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300'];
    }
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  reviews: [{
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Buyer'
    },
    buyerName: String,
    buyerPhoto: String,
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BuyerOrder'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 500
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now
    },
    helpful: {
      type: Number,
      default: 0
    }
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
productSchema.index({ seller: 1, createdAt: -1 });
productSchema.index({ seller: 1 });
productSchema.index({ category: 1 });
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product;