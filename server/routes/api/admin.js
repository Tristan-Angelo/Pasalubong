import { Router } from 'express';
import bcrypt from 'bcryptjs';
import Buyer from '../../models/Buyer.js';
import Seller from '../../models/Seller.js';
import Delivery from '../../models/Delivery.js';
import Admin from '../../models/Admin.js';
import Product from '../../models/Product.js';
import Order from '../../models/Order.js';
import BuyerOrder from '../../models/BuyerOrder.js';
import upload from '../../config/upload.js';
import { authenticateAdmin } from '../../middleware/authMiddleware.js';
import { getUserNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } from '../../utils/notificationService.js';

const router = Router();

// ============= NOTIFICATION ROUTES =============

// Get admin notifications
router.get('/notifications', authenticateAdmin, async (req, res) => {
  try {
    const { limit = 20, skip = 0 } = req.query;
    const notifications = await getUserNotifications(req.adminId, 'Admin', parseInt(limit), parseInt(skip));
    const unreadCount = await getUnreadCount(req.adminId, 'Admin');

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
router.get('/notifications/unread-count', authenticateAdmin, async (req, res) => {
  try {
    const count = await getUnreadCount(req.adminId, 'Admin');
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
router.put('/notifications/:id/read', authenticateAdmin, async (req, res) => {
  try {
    const notification = await markAsRead(req.params.id, req.adminId);
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
router.put('/notifications/read-all', authenticateAdmin, async (req, res) => {
  try {
    await markAllAsRead(req.adminId, 'Admin');
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
router.delete('/notifications/:id', authenticateAdmin, async (req, res) => {
  try {
    await deleteNotification(req.params.id, req.adminId);
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

// ============= ADMIN PROFILE ROUTES =============

// Get admin profile
router.get('/profile', authenticateAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId).select('-password').lean();

    res.json({
      success: true,
      profile: admin
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      error: 'Failed to fetch profile',
      message: 'An error occurred while fetching profile'
    });
  }
});

// Update admin profile
router.put('/profile', authenticateAdmin, async (req, res) => {
  try {
    const { fullName, phone, photo } = req.body;

    const admin = await Admin.findById(req.adminId);
    if (!admin) {
      return res.status(404).json({
        error: 'Admin not found',
        message: 'Admin account not found'
      });
    }

    // Update fields
    if (fullName !== undefined) admin.fullName = fullName;
    if (phone !== undefined) admin.phone = phone;
    if (photo !== undefined) admin.photo = photo;

    await admin.save();

    const updatedAdmin = await Admin.findById(req.adminId).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedAdmin
    });
  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: 'An error occurred while updating profile'
    });
  }
});

// Change admin email
router.put('/change-email', authenticateAdmin, async (req, res) => {
  try {
    const { newEmail, password } = req.body;

    if (!newEmail || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Please provide new email and password'
      });
    }

    const admin = await Admin.findById(req.adminId);
    if (!admin) {
      return res.status(404).json({
        error: 'Admin not found',
        message: 'Admin account not found'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid password',
        message: 'Password is incorrect'
      });
    }

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ email: newEmail.toLowerCase() });
    if (existingAdmin && existingAdmin._id.toString() !== req.adminId.toString()) {
      return res.status(409).json({
        error: 'Email already exists',
        message: 'This email is already registered'
      });
    }

    // Update email
    admin.email = newEmail.toLowerCase();
    await admin.save();

    res.json({
      success: true,
      message: 'Email updated successfully'
    });
  } catch (error) {
    console.error('Change admin email error:', error);
    res.status(500).json({
      error: 'Failed to change email',
      message: 'An error occurred while changing email'
    });
  }
});

// Change admin password
router.put('/change-password', authenticateAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Please provide current and new password'
      });
    }

    const admin = await Admin.findById(req.adminId);
    if (!admin) {
      return res.status(404).json({
        error: 'Admin not found',
        message: 'Admin account not found'
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid password',
        message: 'Current password is incorrect'
      });
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    await admin.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change admin password error:', error);
    res.status(500).json({
      error: 'Failed to change password',
      message: 'An error occurred while changing password'
    });
  }
});

// ============= ADMIN DATA API =============

// Get all customers (buyers)
router.get('/customers', async (req, res) => {
  try {
    const customers = await Buyer.find()
      .select('-password -verificationToken -resetPasswordToken -resetPasswordCode -resetPasswordExpires')
      .sort({ createdAt: -1 })
      .lean();

    // Transform data to match frontend format
    const transformedCustomers = customers.map(customer => ({
      id: customer._id.toString(),
      name: customer.fullname,
      email: customer.email,
      phone: customer.phone,
      address: `${customer.barangay}, ${customer.city}, ${customer.province}`,
      region: customer.region,
      province: customer.province,
      city: customer.city,
      barangay: customer.barangay,
      isEmailVerified: customer.isEmailVerified,
      isActive: customer.isActive,
      createdAt: customer.createdAt,
      image: customer.photo || `https://i.pravatar.cc/150?u=${customer.email}` // Use actual photo if available
    }));

    res.json({
      success: true,
      customers: transformedCustomers
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      error: 'Failed to fetch customers',
      message: 'An error occurred while fetching customers'
    });
  }
});

// Get all sellers
router.get('/sellers', async (req, res) => {
  try {
    const sellers = await Seller.find()
      .select('-password -verificationToken -resetPasswordToken -resetPasswordCode -resetPasswordExpires')
      .sort({ createdAt: -1 })
      .limit(1000)
      .lean();

    // Transform data to match frontend format
    const transformedSellers = sellers.map(seller => ({
      id: seller._id.toString(),
      name: seller.ownerName,
      email: seller.email,
      phone: seller.phone,
      address: `${seller.barangay}, ${seller.city}, ${seller.province}`,
      storeName: seller.businessName,
      businessLicense: seller.businessType,
      storeDescription: seller.businessType,
      region: seller.region,
      province: seller.province,
      city: seller.city,
      barangay: seller.barangay,
      isEmailVerified: seller.isEmailVerified,
      isActive: seller.isActive,
      createdAt: seller.createdAt,
      image: seller.photo || `https://i.pravatar.cc/150?u=${seller.email}` // Use actual photo if available
    }));

    res.json({
      success: true,
      sellers: transformedSellers
    });
  } catch (error) {
    console.error('Get sellers error:', error);
    res.status(500).json({
      error: 'Failed to fetch sellers',
      message: 'An error occurred while fetching sellers'
    });
  }
});

// Get all riders (delivery partners)
router.get('/riders', async (req, res) => {
  try {
    const riders = await Delivery.find()
      .select('-password -verificationToken -resetPasswordToken -resetPasswordCode -resetPasswordExpires')
      .sort({ createdAt: -1 })
      .limit(1000)
      .lean();

    // Transform data to match frontend format
    const transformedRiders = riders.map(rider => ({
      id: rider._id.toString(),
      name: rider.fullName,
      email: rider.email,
      phone: rider.phone,
      address: `${rider.barangay}, ${rider.city}, ${rider.province}`,
      vehicleType: rider.vehicleType,
      licenseNumber: rider.licenseNumber,
      plateNumber: rider.vehiclePlate || rider.licenseNumber, // Use actual plate number if available
      emergencyContact: rider.phone,
      region: rider.region,
      province: rider.province,
      city: rider.city,
      barangay: rider.barangay,
      isEmailVerified: rider.isEmailVerified,
      isAvailable: rider.isAvailable,
      isActive: rider.isActive,
      createdAt: rider.createdAt,
      image: rider.photo || `https://i.pravatar.cc/150?u=${rider.email}` // Use actual photo if available
    }));

    res.json({
      success: true,
      riders: transformedRiders
    });
  } catch (error) {
    console.error('Get riders error:', error);
    res.status(500).json({
      error: 'Failed to fetch riders',
      message: 'An error occurred while fetching riders'
    });
  }
});

// Update a customer
router.put('/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated this way
    delete updateData.password;
    delete updateData.verificationToken;
    delete updateData.resetPasswordToken;

    const customer = await Buyer.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found',
        message: 'No customer found with this ID'
      });
    }

    res.json({
      success: true,
      message: 'Customer updated successfully',
      customer
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({
      error: 'Failed to update customer',
      message: 'An error occurred while updating the customer'
    });
  }
});

// Toggle customer status
router.patch('/customers/:id/toggle-status', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const customer = await Buyer.findByIdAndUpdate(
      id,
      { isActive: isActive },
      { new: true }
    ).select('-password');
    
    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found',
        message: 'No customer found with this ID'
      });
    }

    res.json({
      success: true,
      message: `Customer ${isActive ? 'activated' : 'deactivated'} successfully`,
      customer
    });
  } catch (error) {
    console.error('Toggle customer status error:', error);
    res.status(500).json({
      error: 'Failed to toggle customer status',
      message: 'An error occurred while updating the customer status'
    });
  }
});

// Delete a customer
router.delete('/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Buyer.findByIdAndDelete(id);
    
    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found',
        message: 'No customer found with this ID'
      });
    }

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({
      error: 'Failed to delete customer',
      message: 'An error occurred while deleting the customer'
    });
  }
});

// Update a seller
router.put('/sellers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove sensitive fields
    delete updateData.password;
    delete updateData.verificationToken;
    delete updateData.resetPasswordToken;

    const seller = await Seller.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!seller) {
      return res.status(404).json({
        error: 'Seller not found',
        message: 'No seller found with this ID'
      });
    }

    res.json({
      success: true,
      message: 'Seller updated successfully',
      seller
    });
  } catch (error) {
    console.error('Update seller error:', error);
    res.status(500).json({
      error: 'Failed to update seller',
      message: 'An error occurred while updating the seller'
    });
  }
});

// Toggle seller status
router.patch('/sellers/:id/toggle-status', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const seller = await Seller.findByIdAndUpdate(
      id,
      { isActive: isActive },
      { new: true }
    ).select('-password');
    
    if (!seller) {
      return res.status(404).json({
        error: 'Seller not found',
        message: 'No seller found with this ID'
      });
    }

    res.json({
      success: true,
      message: `Seller ${isActive ? 'activated' : 'deactivated'} successfully`,
      seller
    });
  } catch (error) {
    console.error('Toggle seller status error:', error);
    res.status(500).json({
      error: 'Failed to toggle seller status',
      message: 'An error occurred while updating the seller status'
    });
  }
});

// Delete a seller
router.delete('/sellers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const seller = await Seller.findByIdAndDelete(id);
    
    if (!seller) {
      return res.status(404).json({
        error: 'Seller not found',
        message: 'No seller found with this ID'
      });
    }

    res.json({
      success: true,
      message: 'Seller deleted successfully'
    });
  } catch (error) {
    console.error('Delete seller error:', error);
    res.status(500).json({
      error: 'Failed to delete seller',
      message: 'An error occurred while deleting the seller'
    });
  }
});

// Update a rider
router.put('/riders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove sensitive fields
    delete updateData.password;
    delete updateData.verificationToken;
    delete updateData.resetPasswordToken;

    const rider = await Delivery.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!rider) {
      return res.status(404).json({
        error: 'Rider not found',
        message: 'No rider found with this ID'
      });
    }

    res.json({
      success: true,
      message: 'Rider updated successfully',
      rider
    });
  } catch (error) {
    console.error('Update rider error:', error);
    res.status(500).json({
      error: 'Failed to update rider',
      message: 'An error occurred while updating the rider'
    });
  }
});

// Toggle rider status
router.patch('/riders/:id/toggle-status', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const rider = await Delivery.findByIdAndUpdate(
      id,
      { isActive: isActive },
      { new: true }
    ).select('-password');
    
    if (!rider) {
      return res.status(404).json({
        error: 'Rider not found',
        message: 'No rider found with this ID'
      });
    }

    res.json({
      success: true,
      message: `Rider ${isActive ? 'activated' : 'deactivated'} successfully`,
      rider
    });
  } catch (error) {
    console.error('Toggle rider status error:', error);
    res.status(500).json({
      error: 'Failed to toggle rider status',
      message: 'An error occurred while updating the rider status'
    });
  }
});

// Delete a rider
router.delete('/riders/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const rider = await Delivery.findByIdAndDelete(id);
    
    if (!rider) {
      return res.status(404).json({
        error: 'Rider not found',
        message: 'No rider found with this ID'
      });
    }

    res.json({
      success: true,
      message: 'Rider deleted successfully'
    });
  } catch (error) {
    console.error('Delete rider error:', error);
    res.status(500).json({
      error: 'Failed to delete rider',
      message: 'An error occurred while deleting the rider'
    });
  }
});

// ============= PRODUCT ROUTES =============

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

// Get all products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find()
      .select('_id sku name category price stock seller description image images createdAt')
      .sort({ createdAt: -1 })
      .limit(1000)
      .lean();

    // Transform data to match frontend format
    const transformedProducts = products.map(product => ({
      id: product._id.toString(),
      sku: product.sku,
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      seller: product.seller,
      description: product.description,
      image: product.image,
      images: product.images || [product.image],
      createdAt: product.createdAt
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

// Create a new product
router.post('/products', async (req, res) => {
  try {
    const { name, category, price, stock, seller, description, image, images } = req.body;

    // Auto-generate unique SKU
    const sku = await generateUniqueSKU(category);

    // Handle images array - use provided images or fallback to single image or default
    const productImages = images && images.length > 0 
      ? images 
      : (image ? [image] : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300']);

    const product = new Product({
      sku,
      name,
      category,
      price,
      stock,
      seller,
      description,
      image: productImages[0], // First image as primary
      images: productImages // All images
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: {
        id: product._id.toString(),
        sku: product.sku,
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        seller: product.seller,
        description: product.description,
        image: product.image,
        images: product.images,
        createdAt: product.createdAt
      }
    });
  } catch (error) {
    console.error('Create product error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0];
      return res.status(400).json({
        error: 'Validation error',
        message: firstError.message,
        field: firstError.path
      });
    }

    res.status(500).json({
      error: 'Failed to create product',
      message: 'An error occurred while creating the product'
    });
  }
});

// Update a product
router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, stock, seller, description, image, images } = req.body;

    // Get existing product to preserve SKU
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'Product not found'
      });
    }

    // Keep the existing SKU (SKU should not change after creation)
    const sku = existingProduct.sku;

    // Handle images update
    const updateData = { sku, name, category, price, stock, seller, description };
    
    if (images && images.length > 0) {
      updateData.images = images;
      updateData.image = images[0]; // Update primary image
    } else if (image) {
      updateData.image = image;
      updateData.images = [image];
    }

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'No product found with this ID'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: {
        id: product._id.toString(),
        sku: product.sku,
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        seller: product.seller,
        description: product.description,
        image: product.image,
        images: product.images,
        createdAt: product.createdAt
      }
    });
  } catch (error) {
    console.error('Update product error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0];
      return res.status(400).json({
        error: 'Validation error',
        message: firstError.message,
        field: firstError.path
      });
    }

    res.status(500).json({
      error: 'Failed to update product',
      message: 'An error occurred while updating the product'
    });
  }
});

// Delete a product
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'No product found with this ID'
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
      message: 'An error occurred while deleting the product'
    });
  }
});

// ============= ORDER ROUTES =============

// Get all buyer orders (new system)
router.get('/buyer-orders', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const totalOrders = await BuyerOrder.countDocuments();
    const orders = await BuyerOrder.find()
      .select('orderNumber buyerId items total status deliveryAddress paymentMethod specialInstructions deliveryPersonId deliveryStatus sellerStatus proofOfDelivery proofOfDeliveryImages deliveredAt statusHistory createdAt')
      .populate('buyerId', 'fullname email phone')
      .populate('deliveryPersonId', 'fullname phone vehicleType vehiclePlate licenseNumber photo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const transformedOrders = orders.map(order => ({
      id: order._id,
      orderNumber: order.orderNumber,
      customerName: order.buyerId?.fullname || 'Unknown',
      customerEmail: order.buyerId?.email || '',
      customerPhone: order.buyerId?.phone || '',
      date: order.createdAt,
      status: order.status,
      total: order.total,
      items: order.items,
      deliveryAddress: order.deliveryAddress,
      paymentMethod: order.paymentMethod,
      specialInstructions: order.specialInstructions,
      deliveryPerson: order.deliveryPersonId ? {
        id: order.deliveryPersonId._id,
        name: order.deliveryPersonId.fullname,
        phone: order.deliveryPersonId.phone,
        vehicleType: order.deliveryPersonId.vehicleType,
        vehiclePlate: order.deliveryPersonId.vehiclePlate || order.deliveryPersonId.licenseNumber,
        photo: order.deliveryPersonId.photo
      } : null,
      deliveryStatus: order.deliveryStatus,
      sellerStatus: order.sellerStatus || [],
      proofOfDelivery: order.proofOfDelivery,
      proofOfDeliveryImages: order.proofOfDeliveryImages || [],
      deliveredAt: order.deliveredAt,
      statusHistory: order.statusHistory || []
    }));

    res.json({
      success: true,
      orders: transformedOrders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / parseInt(limit)),
        totalOrders,
        ordersPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get buyer orders error:', error);
    res.status(500).json({
      error: 'Failed to fetch orders',
      message: 'An error occurred while fetching orders'
    });
  }
});

// Get available delivery persons
router.get('/delivery-persons', authenticateAdmin, async (req, res) => {
  try {
    const deliveryPersons = await Delivery.find({
      isActive: true,
      isAvailable: true
    })
    .select('fullname phone vehicleType vehiclePlate licenseNumber city barangay photo isActive isAvailable')
    .limit(200)
    .lean();

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
        isActive: dp.isActive,
        isAvailable: dp.isAvailable
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
router.put('/buyer-orders/:orderId/assign-delivery', authenticateAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryPersonId } = req.body;

    if (!deliveryPersonId) {
      return res.status(400).json({
        error: 'Missing delivery person',
        message: 'Please select a delivery person'
      });
    }

    const order = await BuyerOrder.findById(orderId);

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Order not found'
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
    if (order.deliveryStatus === 'Pending') {
      order.deliveryStatus = 'Assigned';
    }
    await order.save();

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

// Get all orders (old system - keeping for backward compatibility)
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .select('orderNumber customer customerId amount status date notes items shippingAddress paymentMethod createdAt')
      .populate('customerId', 'fullname email')
      .populate('items.productId', 'name price image')
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    // Transform data to match frontend format
    const transformedOrders = orders.map(order => ({
      id: order._id.toString(),
      orderNumber: order.orderNumber,
      customer: order.customer,
      customerId: order.customerId?._id?.toString() || null,
      amount: order.amount,
      status: order.status,
      date: order.date,
      notes: order.notes,
      items: order.items.map(item => ({
        productId: item.productId?._id?.toString() || item.productId,
        productName: item.productName || item.productId?.name,
        productImage: item.productImage || item.productId?.image,
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt
    }));

    res.json({
      success: true,
      orders: transformedOrders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      error: 'Failed to fetch orders',
      message: 'An error occurred while fetching orders'
    });
  }
});

// Get a single order by ID
router.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('customerId', 'fullname email phone')
      .populate('items.productId', 'name price image')
      .lean();

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'No order found with this ID'
      });
    }

    res.json({
      success: true,
      order: {
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        customer: order.customer,
        customerId: order.customerId?._id?.toString() || null,
        amount: order.amount,
        status: order.status,
        date: order.date,
        notes: order.notes,
        items: order.items.map(item => ({
          productId: item.productId?._id?.toString() || item.productId,
          productName: item.productName || item.productId?.name,
          productImage: item.productImage || item.productId?.image,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      error: 'Failed to fetch order',
      message: 'An error occurred while fetching the order'
    });
  }
});

// Create a new order
router.post('/orders', async (req, res) => {
  try {
    const { 
      orderNumber, 
      customer, 
      customerId, 
      amount, 
      status, 
      date, 
      notes, 
      items, 
      shippingAddress, 
      paymentMethod 
    } = req.body;

    // Check if order number already exists (if provided)
    if (orderNumber) {
      const existingOrder = await Order.findOne({ orderNumber });
      if (existingOrder) {
        return res.status(400).json({
          error: 'Order number already exists',
          message: 'An order with this number already exists',
          field: 'orderNumber'
        });
      }
    }

    const order = new Order({
      orderNumber,
      customer,
      customerId: customerId || null,
      amount,
      status: status || 'Pending',
      date: date || new Date(),
      notes: notes || '',
      items: items || [],
      shippingAddress: shippingAddress || '',
      paymentMethod: paymentMethod || 'Cash on Delivery'
    });

    await order.save();

    // Populate product details for response
    await order.populate('items.productId', 'name price image');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        customer: order.customer,
        customerId: order.customerId,
        amount: order.amount,
        status: order.status,
        date: order.date,
        notes: order.notes,
        items: order.items.map(item => ({
          productId: item.productId?._id?.toString() || item.productId,
          productName: item.productName || item.productId?.name,
          productImage: item.productImage || item.productId?.image,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0];
      return res.status(400).json({
        error: 'Validation error',
        message: firstError.message,
        field: firstError.path
      });
    }

    res.status(500).json({
      error: 'Failed to create order',
      message: 'An error occurred while creating the order'
    });
  }
});

// Update an order
router.put('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      orderNumber, 
      customer, 
      customerId, 
      amount, 
      status, 
      date, 
      notes, 
      items, 
      shippingAddress, 
      paymentMethod 
    } = req.body;

    // Check if order number is being changed and if it already exists
    if (orderNumber) {
      const existingOrder = await Order.findOne({ orderNumber, _id: { $ne: id } });
      if (existingOrder) {
        return res.status(400).json({
          error: 'Order number already exists',
          message: 'An order with this number already exists',
          field: 'orderNumber'
        });
      }
    }

    const updateData = {};
    if (orderNumber !== undefined) updateData.orderNumber = orderNumber;
    if (customer !== undefined) updateData.customer = customer;
    if (customerId !== undefined) updateData.customerId = customerId || null;
    if (amount !== undefined) updateData.amount = amount;
    if (status !== undefined) updateData.status = status;
    if (date !== undefined) updateData.date = date;
    if (notes !== undefined) updateData.notes = notes;
    if (items !== undefined) updateData.items = items;
    if (shippingAddress !== undefined) updateData.shippingAddress = shippingAddress;
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;

    const order = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('items.productId', 'name price image');

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'No order found with this ID'
      });
    }

    res.json({
      success: true,
      message: 'Order updated successfully',
      order: {
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        customer: order.customer,
        customerId: order.customerId,
        amount: order.amount,
        status: order.status,
        date: order.date,
        notes: order.notes,
        items: order.items.map(item => ({
          productId: item.productId?._id?.toString() || item.productId,
          productName: item.productName || item.productId?.name,
          productImage: item.productImage || item.productId?.image,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error('Update order error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0];
      return res.status(400).json({
        error: 'Validation error',
        message: firstError.message,
        field: firstError.path
      });
    }

    res.status(500).json({
      error: 'Failed to update order',
      message: 'An error occurred while updating the order'
    });
  }
});

// Delete an order
router.delete('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByIdAndDelete(id);
    
    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'No order found with this ID'
      });
    }

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({
      error: 'Failed to delete order',
      message: 'An error occurred while deleting the order'
    });
  }
});

// Update order status
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        error: 'Status is required',
        message: 'Please provide a status',
        field: 'status'
      });
    }

    const validStatuses = ['Pending', 'Processing', 'Out for Delivery', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Status must be one of: ' + validStatuses.join(', '),
        field: 'status'
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'No order found with this ID'
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: {
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        customer: order.customer,
        amount: order.amount,
        status: order.status,
        date: order.date
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      error: 'Failed to update order status',
      message: 'An error occurred while updating the order status'
    });
  }
});

export default router;