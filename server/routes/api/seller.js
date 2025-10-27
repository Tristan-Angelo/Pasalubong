import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { authenticateSeller } from '../../middleware/authMiddleware.js';
import Seller from '../../models/Seller.js';
import Product from '../../models/Product.js';
import BuyerOrder from '../../models/BuyerOrder.js';
import Delivery from '../../models/Delivery.js';
import upload from '../../config/upload.js';
import { getUserNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification, notifyOrderStatusChange, notifyLowStock, notifyDeliveryAssigned } from '../../utils/notificationService.js';

const router = Router();

// All routes require authentication
router.use(authenticateSeller);

// ============= NOTIFICATION ROUTES =============

// Get seller notifications
router.get('/notifications', async (req, res) => {
  try {
    const { limit = 20, skip = 0 } = req.query;
    const notifications = await getUserNotifications(req.sellerId, 'Seller', parseInt(limit), parseInt(skip));
    const unreadCount = await getUnreadCount(req.sellerId, 'Seller');

    res.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      error: 'Failed to fetch notifications',
      message: 'An error occurred while fetching notifications'
    });
  }
});

// Get unread notification count
router.get('/notifications/unread-count', async (req, res) => {
  try {
    const count = await getUnreadCount(req.sellerId, 'Seller');
    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      error: 'Failed to fetch unread count',
      message: 'An error occurred while fetching unread count'
    });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', async (req, res) => {
  try {
    const notification = await markAsRead(req.params.id, req.sellerId);
    if (!notification) {
      return res.status(404).json({
        error: 'Notification not found',
        message: 'Notification not found or already deleted'
      });
    }

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      error: 'Failed to mark notification as read',
      message: 'An error occurred while updating notification'
    });
  }
});

// Mark all notifications as read
router.put('/notifications/read-all', async (req, res) => {
  try {
    await markAllAsRead(req.sellerId, 'Seller');
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      error: 'Failed to mark all notifications as read',
      message: 'An error occurred while updating notifications'
    });
  }
});

// Delete notification
router.delete('/notifications/:id', async (req, res) => {
  try {
    await deleteNotification(req.params.id, req.sellerId);
    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      error: 'Failed to delete notification',
      message: 'An error occurred while deleting notification'
    });
  }
});

// ============= PROFILE ROUTES =============

// Get seller profile
router.get('/profile', async (req, res) => {
  try {
    const seller = await Seller.findById(req.sellerId).select('-password -verificationToken -resetPasswordToken -resetPasswordCode');

    res.json({
      success: true,
      profile: seller
    });
  } catch (error) {
    console.error('Get seller profile error:', error);
    res.status(500).json({
      error: 'Failed to fetch profile',
      message: 'An error occurred while fetching profile'
    });
  }
});

// Update seller profile
router.put('/profile', async (req, res) => {
  try {
    const { businessName, ownerName, phone, palawanPayNumber, palawanPayName, businessType, region, province, city, barangay, photo } = req.body;

    const seller = await Seller.findById(req.sellerId);
    if (!seller) {
      return res.status(404).json({
        error: 'Seller not found',
        message: 'Seller account not found'
      });
    }

    // Update fields
    if (businessName) seller.businessName = businessName;
    if (ownerName) seller.ownerName = ownerName;
    if (phone) seller.phone = phone;
    if (palawanPayNumber !== undefined) seller.palawanPayNumber = palawanPayNumber;
    if (palawanPayName !== undefined) seller.palawanPayName = palawanPayName;
    if (businessType) seller.businessType = businessType;
    if (region) seller.region = region;
    if (province) seller.province = province;
    if (city) seller.city = city;
    if (barangay) seller.barangay = barangay;
    if (photo !== undefined) seller.photo = photo;

    await seller.save();

    const updatedSeller = await Seller.findById(req.sellerId).select('-password -verificationToken -resetPasswordToken -resetPasswordCode');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedSeller
    });
  } catch (error) {
    console.error('Update seller profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: 'An error occurred while updating profile'
    });
  }
});

// Change email
router.put('/change-email', async (req, res) => {
  try {
    const { newEmail, password } = req.body;

    if (!newEmail || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Please provide new email and password'
      });
    }

    const seller = await Seller.findById(req.sellerId);
    if (!seller) {
      return res.status(404).json({
        error: 'Seller not found',
        message: 'Seller account not found'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, seller.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid password',
        message: 'Password is incorrect'
      });
    }

    // Check if email already exists
    const existingSeller = await Seller.findOne({ email: newEmail.toLowerCase() });
    if (existingSeller && existingSeller._id.toString() !== req.sellerId.toString()) {
      return res.status(409).json({
        error: 'Email already exists',
        message: 'This email is already registered'
      });
    }

    // Update email
    seller.email = newEmail.toLowerCase();
    seller.isEmailVerified = false; // Require re-verification
    await seller.save();

    res.json({
      success: true,
      message: 'Email updated successfully. Please verify your new email.'
    });
  } catch (error) {
    console.error('Change email error:', error);
    res.status(500).json({
      error: 'Failed to change email',
      message: 'An error occurred while changing email'
    });
  }
});

// Change password
router.put('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Please provide current and new password'
      });
    }

    const seller = await Seller.findById(req.sellerId);
    if (!seller) {
      return res.status(404).json({
        error: 'Seller not found',
        message: 'Seller account not found'
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, seller.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid password',
        message: 'Current password is incorrect'
      });
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    seller.password = hashedPassword;
    await seller.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Failed to change password',
      message: 'An error occurred while changing password'
    });
  }
});

// ============= PRODUCT ROUTES =============

// Get seller's products
router.get('/products', async (req, res) => {
  try {
    const seller = await Seller.findById(req.sellerId);
    const products = await Product.find({ seller: seller.email });

    // Transform products to ensure images array is included
    const transformedProducts = products.map(product => ({
      ...product.toObject(),
      id: product._id.toString(),
      images: product.images || [product.image]
    }));

    res.json({
      success: true,
      products: transformedProducts
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      error: 'Failed to fetch products',
      message: 'An error occurred while fetching products'
    });
  }
});

// Helper function to generate unique SKU
const generateUniqueSKU = async (category) => {
  let sku;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    // Generate SKU: CATEGORY-RANDOM-TIMESTAMP
    const categoryPrefix = category.substring(0, 3).toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    sku = `${categoryPrefix}-${randomPart}-${timestamp}`;

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku });
    if (!existingProduct) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    throw new Error('Failed to generate unique SKU after multiple attempts');
  }

  return sku;
};

// Upload product image (single)
router.post('/products/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select an image file to upload'
      });
    }

    // Return the file path that can be used in the frontend
    const imagePath = `/uploads/products/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      imagePath: imagePath
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({
      error: 'Failed to upload image',
      message: error.message || 'An error occurred while uploading the image'
    });
  }
});

// Upload multiple product images
router.post('/products/upload-images', upload.array('images', 4), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No files uploaded',
        message: 'Please select image files to upload'
      });
    }

    // Return array of file paths
    const imagePaths = req.files.map(file => `/uploads/products/${file.filename}`);
    
    res.json({
      success: true,
      message: `${req.files.length} image(s) uploaded successfully`,
      imagePaths: imagePaths
    });
  } catch (error) {
    console.error('Upload images error:', error);
    res.status(500).json({
      error: 'Failed to upload images',
      message: error.message || 'An error occurred while uploading the images'
    });
  }
});

// Add product
router.post('/products', async (req, res) => {
  try {
    const { name, description, price, category, image, images, stock } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Please provide name, price, and category'
      });
    }

    const seller = await Seller.findById(req.sellerId);

    // Generate unique SKU
    const sku = await generateUniqueSKU(category);

    // Handle images array - use provided images or fallback to single image or default
    const productImages = images && images.length > 0 
      ? images 
      : (image ? [image] : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300']);

    const product = await Product.create({
      sku,
      name,
      description: description || '',
      price: parseFloat(price),
      category,
      image: productImages[0], // First image as primary
      images: productImages, // All images
      stock: parseInt(stock) || 0,
      seller: seller.email
    });

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      product
    });
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({
      error: 'Failed to add product',
      message: 'An error occurred while adding product'
    });
  }
});

// Update product
router.put('/products/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, description, price, category, image, images, stock } = req.body;

    const seller = await Seller.findById(req.sellerId);
    const product = await Product.findOne({ _id: productId, seller: seller.email });

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'Product not found or you do not have permission to edit it'
      });
    }

    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (price) product.price = parseFloat(price);
    if (category) product.category = category;
    
    const oldStock = product.stock;
    if (stock !== undefined) product.stock = parseInt(stock);
    
    // Handle images update
    if (images && images.length > 0) {
      product.images = images;
      product.image = images[0]; // Update primary image
    } else if (image) {
      product.image = image;
      product.images = [image];
    }

    await product.save();

    // Send low stock notification if stock is low
    if (product.stock <= 10 && oldStock > 10) {
      try {
        await notifyLowStock(req.sellerId, product);
      } catch (notifError) {
        console.error('Error sending low stock notification:', notifError);
      }
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      error: 'Failed to update product',
      message: 'An error occurred while updating product'
    });
  }
});

// Delete product
router.delete('/products/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const seller = await Seller.findById(req.sellerId);

    const product = await Product.findOneAndDelete({ _id: productId, seller: seller.email });

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'Product not found or you do not have permission to delete it'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      error: 'Failed to delete product',
      message: 'An error occurred while deleting product'
    });
  }
});

// ============= ORDER ROUTES =============

// Get seller's orders
router.get('/orders', async (req, res) => {
  try {
    const seller = await Seller.findById(req.sellerId);
    console.log('🔍 Fetching orders for seller:', seller.email);
    
    // Find all orders that contain items from this seller
    const orders = await BuyerOrder.find({
      'items.seller': seller.email
    })
    .populate('buyerId', 'fullname email phone')
    .populate('deliveryPersonId', 'fullname phone vehicleType vehiclePlate licenseNumber photo')
    .sort({ createdAt: -1 });
    
    console.log('📦 Found orders:', orders.length);
    
    // Debug: Check all orders to see if seller field exists
    const allOrders = await BuyerOrder.find({}).limit(5);
    console.log('🔍 Debug - Sample of all orders in DB:', allOrders.length);
    allOrders.forEach((order, idx) => {
      console.log(`Order ${idx + 1} (${order.orderNumber}):`, 
        order.items.map(i => ({ 
          name: i.name, 
          seller: i.seller,
          hasSellerField: !!i.seller 
        }))
      );
    });
    
    if (orders.length > 0) {
      console.log('✅ First matching order items:', orders[0].items.map(i => ({ name: i.name, seller: i.seller })));
    } else {
      console.log('⚠️ No orders found for seller:', seller.email);
    }

    // Filter items to only show this seller's items
    const sellerOrders = orders.map(order => {
      const sellerItems = order.items.filter(item => item.seller === seller.email);
      const sellerTotal = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Find seller status from array
      const sellerStatusObj = order.sellerStatus?.find(s => s.seller === seller.email);
      const sellerStatus = sellerStatusObj?.status || 'Pending';
      
      // Find proof of payment from array
      const proofObj = order.proofOfPaymentsBySeller?.find(p => p.seller === seller.email);
      const proofOfPayment = proofObj?.proofImage || null;
      
      // Get delivery person info
      const deliveryPerson = order.deliveryPersonId ? {
        name: order.deliveryPersonId.fullname,
        phone: order.deliveryPersonId.phone,
        vehicleType: order.deliveryPersonId.vehicleType,
        vehiclePlate: order.deliveryPersonId.vehiclePlate || order.deliveryPersonId.licenseNumber,
        photo: order.deliveryPersonId.photo
      } : null;
      
      return {
        id: order._id,
        orderNumber: order.orderNumber,
        customerName: order.buyerId?.fullname || 'Unknown',
        customerEmail: order.buyerId?.email || '',
        customerPhone: order.deliveryAddress?.phone || order.buyerId?.phone || '',
        date: order.createdAt,
        status: sellerStatus,
        total: sellerTotal,
        items: sellerItems,
        deliveryAddress: order.deliveryAddress,
        paymentMethod: order.paymentMethod,
        specialInstructions: order.specialInstructions,
        proofOfPayment: proofOfPayment,
        deliveryPerson: deliveryPerson,
        deliveryStatus: order.deliveryStatus,
        proofOfDelivery: order.proofOfDelivery,
        proofOfDeliveryImages: order.proofOfDeliveryImages || [],
        deliveredAt: order.deliveredAt,
        statusHistory: order.statusHistory || []
      };
    });

    res.json({
      success: true,
      orders: sellerOrders
    });
  } catch (error) {
    console.error('Get seller orders error:', error);
    res.status(500).json({
      error: 'Failed to fetch orders',
      message: 'An error occurred while fetching orders'
    });
  }
});

// Update order status
router.put('/orders/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Invalid order status'
      });
    }

    const seller = await Seller.findById(req.sellerId);
    const order = await BuyerOrder.findById(orderId);

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Order not found'
      });
    }

    // Check if this seller has items in this order
    const hasSellerItems = order.items.some(item => item.seller === seller.email);
    if (!hasSellerItems) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'You do not have permission to update this order'
      });
    }

    // Update seller status for this order
    if (!order.sellerStatus) {
      order.sellerStatus = [];
    }
    
    // Get all unique sellers from order items
    const allSellers = [...new Set(order.items.map(item => item.seller))];
    
    // Find existing status entry for this seller
    const existingStatusIndex = order.sellerStatus.findIndex(s => s.seller === seller.email);
    if (existingStatusIndex >= 0) {
      order.sellerStatus[existingStatusIndex].status = status;
    } else {
      order.sellerStatus.push({ seller: seller.email, status });
    }

    // Track status change in history
    if (!order.statusHistory) {
      order.statusHistory = [];
    }
    order.statusHistory.push({
      status: status,
      timestamp: new Date(),
      updatedBy: 'seller'
    });

    // Update overall order status based on all seller statuses
    // Get status for each seller (default to 'Pending' if not set)
    const sellerStatuses = allSellers.map(sellerEmail => {
      const sellerStatusObj = order.sellerStatus.find(s => s.seller === sellerEmail);
      return sellerStatusObj?.status || 'Pending';
    });

    console.log('📊 All sellers:', allSellers);
    console.log('📊 Seller statuses:', sellerStatuses);

    // Determine overall order status based on seller statuses
    const allCancelled = sellerStatuses.every(s => s === 'Cancelled');
    const anyCancelled = sellerStatuses.some(s => s === 'Cancelled');
    const allReady = sellerStatuses.every(s => s === 'Ready');
    const allPreparing = sellerStatuses.every(s => s === 'Preparing' || s === 'Ready');
    const allConfirmed = sellerStatuses.every(s => s === 'Confirmed' || s === 'Preparing' || s === 'Ready');

    if (allCancelled) {
      order.status = 'Cancelled';
    } else if (anyCancelled) {
      // If any seller cancelled but not all, keep current status or set to Cancelled
      order.status = 'Cancelled';
    } else if (allReady) {
      order.status = 'Out for Delivery';
      // Update delivery status so it appears in delivery dashboard
      if (order.deliveryStatus === 'Pending') {
        order.deliveryStatus = 'Assigned';
      }
    } else if (allPreparing) {
      order.status = 'Preparing';
    } else if (allConfirmed) {
      order.status = 'Confirmed';
    } else {
      order.status = 'Pending';
    }

    console.log('✅ Updated overall order status to:', order.status);
    console.log('✅ Delivery status:', order.deliveryStatus);

    await order.save();

    // Send notification to buyer about status change
    if (order.buyerId) {
      try {
        await notifyOrderStatusChange(order.buyerId, order, status);
      } catch (notifError) {
        console.error('Error sending notification:', notifError);
        // Don't fail the request if notification fails
      }
    }

    res.json({
      success: true,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      error: 'Failed to update order status',
      message: 'An error occurred while updating order status'
    });
  }
});

// Get available delivery persons
router.get('/delivery-persons', async (req, res) => {
  try {
    // Get all active delivery persons
    const deliveryPersons = await Delivery.find({
      isActive: true
    }).select('fullname phone vehicleType vehiclePlate licenseNumber city barangay photo isActive');

    res.json({
      success: true,
      deliveryPersons: deliveryPersons.map(dp => ({
        id: dp._id,
        name: dp.fullname,
        phone: dp.phone,
        vehicleType: dp.vehicleType,
        vehiclePlate: dp.vehiclePlate || dp.licenseNumber || 'N/A',
        location: `${dp.barangay}, ${dp.city}`,
        photo: dp.photo,
        isActive: dp.isActive
      }))
    });
  } catch (error) {
    console.error('Get delivery persons error:', error);
    res.status(500).json({
      error: 'Failed to fetch delivery persons',
      message: 'An error occurred while fetching delivery persons'
    });
  }
});

// Assign delivery person to order
router.put('/orders/:orderId/assign-delivery', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryPersonId } = req.body;

    if (!deliveryPersonId) {
      return res.status(400).json({
        error: 'Missing delivery person',
        message: 'Please select a delivery person'
      });
    }

    const seller = await Seller.findById(req.sellerId);
    const order = await BuyerOrder.findById(orderId);

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Order not found'
      });
    }

    // Check if this seller has items in this order
    const hasSellerItems = order.items.some(item => item.seller === seller.email);
    if (!hasSellerItems) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'You do not have permission to assign delivery for this order'
      });
    }

    // Check if order is ready for delivery
    if (order.status !== 'Out for Delivery') {
      return res.status(400).json({
        error: 'Invalid order status',
        message: 'Order must be marked as "Out for Delivery" before assigning a delivery person'
      });
    }

    // Verify delivery person exists and is available
    const deliveryPerson = await Delivery.findById(deliveryPersonId);
    if (!deliveryPerson) {
      return res.status(404).json({
        error: 'Delivery person not found',
        message: 'Selected delivery person not found'
      });
    }

    if (!deliveryPerson.isAvailable) {
      return res.status(400).json({
        error: 'Delivery person unavailable',
        message: 'Selected delivery person is not available'
      });
    }

    // Assign delivery person
    order.deliveryPersonId = deliveryPersonId;
    order.deliveryStatus = 'Assigned';
    await order.save();

    // Send notification to delivery person
    try {
      await notifyDeliveryAssigned(deliveryPersonId, order);
    } catch (notifError) {
      console.error('Error sending delivery assignment notification:', notifError);
    }

    res.json({
      success: true,
      message: 'Delivery person assigned successfully'
    });
  } catch (error) {
    console.error('Assign delivery person error:', error);
    res.status(500).json({
      error: 'Failed to assign delivery person',
      message: 'An error occurred while assigning delivery person'
    });
  }
});

// Get seller statistics
router.get('/statistics', async (req, res) => {
  try {
    const seller = await Seller.findById(req.sellerId);
    
    // Get all orders with seller's items
    const orders = await BuyerOrder.find({
      'items.seller': seller.email
    });

    // Calculate statistics
    let totalRevenue = 0;
    let totalOrders = orders.length;
    let pendingOrders = 0;

    orders.forEach(order => {
      const sellerItems = order.items.filter(item => item.seller === seller.email);
      const sellerTotal = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      totalRevenue += sellerTotal;

      // Find seller status from array
      const sellerStatusObj = order.sellerStatus?.find(s => s.seller === seller.email);
      const sellerStatus = sellerStatusObj?.status || 'Pending';
      if (sellerStatus === 'Pending') {
        pendingOrders++;
      }
    });

    // Get active products count
    const products = await Product.find({ seller: seller.email });
    const activeProducts = products.length;

    res.json({
      success: true,
      statistics: {
        totalRevenue,
        totalOrders,
        activeProducts,
        pendingOrders
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      message: 'An error occurred while fetching statistics'
    });
  }
});

export default router;