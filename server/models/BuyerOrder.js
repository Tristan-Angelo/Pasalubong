import mongoose from 'mongoose';

const buyerOrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buyer',
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    name: String,
    price: Number,
    quantity: Number,
    image: String,
    seller: String,
    sellerInfo: {
      businessName: String,
      palawanPayNumber: String,
      palawanPayName: String
    }
  }],
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  deliveryAddress: {
    label: String,
    address: String,
    city: String,
    postal: String,
    phone: String
  },
  paymentMethod: {
    type: String,
    default: 'Cash on Delivery'
  },
  specialInstructions: {
    type: String,
    default: ''
  },
  faceVerification: {
    type: String,
    default: null
  },
  proofOfPaymentsBySeller: [{
    seller: String,
    proofImage: String
  }],
  deliveryFee: {
    type: Number,
    default: 50
  },
  deliveryPersonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Delivery',
    default: null
  },
  deliveryStatus: {
    type: String,
    enum: ['Pending', 'Assigned', 'Accepted', 'Picked Up', 'In Transit', 'Delivered'],
    default: 'Pending'
  },
  sellerStatus: [{
    seller: String,
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Cancelled'],
      default: 'Pending'
    }
  }],
  proofOfDelivery: {
    type: String,
    default: null
  },
  proofOfDeliveryImages: [{
    type: String
  }],
  deliveredAt: {
    type: Date,
    default: null
  },
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: String
  }],
  itemReviews: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    reviewed: {
      type: Boolean,
      default: false
    },
    reviewId: String
  }],
  canReview: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
buyerOrderSchema.index({ buyerId: 1, createdAt: -1 });
buyerOrderSchema.index({ deliveryPersonId: 1, deliveryStatus: 1 });
buyerOrderSchema.index({ 'items.seller': 1, createdAt: -1 });
buyerOrderSchema.index({ 'items.seller': 1, 'sellerStatus.seller': 1 });
buyerOrderSchema.index({ status: 1 });
buyerOrderSchema.index({ createdAt: -1 });

// Generate order number before saving
buyerOrderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  next();
});

const BuyerOrder = mongoose.model('BuyerOrder', buyerOrderSchema);

export default BuyerOrder;