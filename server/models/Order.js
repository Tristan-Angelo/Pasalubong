import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: [true, 'Order number is required'],
    unique: true,
    trim: true
  },
  customer: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buyer',
    default: null
  },
  amount: {
    type: Number,
    required: [true, 'Order amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  status: {
    type: String,
    required: [true, 'Order status is required'],
    enum: ['Pending', 'Processing', 'Out for Delivery', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: '',
    trim: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    productName: String,
    productImage: String,
    quantity: Number,
    price: Number
  }],
  shippingAddress: {
    type: String,
    default: ''
  },
  paymentMethod: {
    type: String,
    default: 'Cash on Delivery'
  }
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${year}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;