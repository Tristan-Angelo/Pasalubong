import { Router } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { authenticateBuyer } from '../../middleware/authMiddleware.js';
import Buyer from '../../models/Buyer.js';
import BuyerProfile from '../../models/BuyerProfile.js';
import BuyerAddress from '../../models/BuyerAddress.js';
import BuyerCart from '../../models/BuyerCart.js';
import BuyerFavorite from '../../models/BuyerFavorite.js';
import BuyerOrder from '../../models/BuyerOrder.js';
import Product from '../../models/Product.js';
import Seller from '../../models/Seller.js';
import Admin from '../../models/Admin.js';
import { notifyNewOrder, notifyAdminNewOrder } from '../../utils/notificationService.js';

const router = Router();

// All routes require authentication
router.use(authenticateBuyer);

// ============= PROFILE ROUTES =============

// Get buyer profile
router.get('/profile', async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.buyerId)
      .select('-password -verificationToken -resetPasswordToken -resetPasswordCode')
      .lean();
    const profile = await BuyerProfile.findOne({ buyerId: req.buyerId })
      .select('photo birthday')
      .lean();

    res.json({
      success: true,
      profile: {
        ...buyer,
        photo: profile?.photo || null,
        birthday: profile?.birthday || null
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to fetch profile',
      message: 'An error occurred while fetching profile'
    });
  }
});

// Update buyer profile
router.put('/profile', async (req, res) => {
  try {
    const { fullname, phone, birthday, photo } = req.body;

    const updateData = {};
    if (fullname !== undefined) updateData.fullname = fullname;
    if (phone !== undefined) updateData.phone = phone;

    // Update buyer basic info
    const buyer = await Buyer.findByIdAndUpdate(
      req.buyerId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -verificationToken -resetPasswordToken -resetPasswordCode');

    // Update or create profile
    let profile = await BuyerProfile.findOne({ buyerId: req.buyerId });
    
    if (!profile) {
      profile = new BuyerProfile({ buyerId: req.buyerId });
    }

    if (photo !== undefined) profile.photo = photo;
    if (birthday !== undefined) profile.birthday = birthday;

    await profile.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        ...buyer.toObject(),
        photo: profile.photo,
        birthday: profile.birthday
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: 'An error occurred while updating profile'
    });
  }
});

// Change email
router.put('/profile/email', async (req, res) => {
  try {
    const { newEmail, password } = req.body;

    if (!newEmail || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Please provide new email and password'
      });
    }

    const buyer = await Buyer.findById(req.buyerId);
    if (!buyer) {
      return res.status(404).json({
        error: 'Buyer not found',
        message: 'Buyer account not found'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, buyer.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid password',
        message: 'Password is incorrect'
      });
    }

    // Check if email already exists
    const existingBuyer = await Buyer.findOne({ email: newEmail.toLowerCase() });
    if (existingBuyer && existingBuyer._id.toString() !== req.buyerId.toString()) {
      return res.status(409).json({
        error: 'Email already exists',
        message: 'This email is already registered'
      });
    }

    // Update email
    buyer.email = newEmail.toLowerCase();
    buyer.isEmailVerified = false; // Require re-verification
    await buyer.save();

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
router.put('/profile/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Please provide current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'Invalid password',
        message: 'New password must be at least 6 characters',
        field: 'newPassword'
      });
    }

    const buyer = await Buyer.findById(req.buyerId);

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, buyer.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid password',
        message: 'Current password is incorrect',
        field: 'currentPassword'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    buyer.password = hashedPassword;
    await buyer.save();

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

// Get all products
router.get('/products', async (req, res) => {
  try {
    const { search, category, sortBy } = req.query;

    let query = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    let productsQuery = Product.find(query)
      .select('_id name price category image images stock seller rating reviewCount createdAt')
      .lean();

    // Sorting
    switch (sortBy) {
      case 'name':
        productsQuery = productsQuery.sort({ name: 1 });
        break;
      case 'price-low':
        productsQuery = productsQuery.sort({ price: 1 });
        break;
      case 'price-high':
        productsQuery = productsQuery.sort({ price: -1 });
        break;
      default:
        productsQuery = productsQuery.sort({ createdAt: -1 });
    }

    const products = await productsQuery.limit(500);

    // Transform products with actual ratings and reviews
    const transformedProducts = products.map(product => ({
      id: product._id.toString(),
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image,
      images: product.images || [product.image],
      description: product.description,
      rating: product.rating || 0,
      reviewCount: product.reviewCount || 0,
      reviews: product.reviews || [],
      stock: product.stock,
      seller: product.seller
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

// Get single product
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'No product found with this ID'
      });
    }

    res.json({
      success: true,
      product: {
        id: product._id.toString(),
        name: product.name,
        price: product.price,
        category: product.category,
        image: product.image,
        images: product.images || [product.image],
        description: product.description,
        rating: product.rating || 0,
        reviewCount: product.reviewCount || 0,
        reviews: product.reviews || [],
        stock: product.stock,
        seller: product.seller
      }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      error: 'Failed to fetch product',
      message: 'An error occurred while fetching product'
    });
  }
});

// ============= CART ROUTES =============

// Get cart
router.get('/cart', async (req, res) => {
  try {
    let cart = await BuyerCart.findOne({ buyerId: req.buyerId })
      .select('buyerId items')
      .populate({
        path: 'items.productId',
        select: 'name price image stock seller'
      })
      .lean();

    if (!cart) {
      cart = await BuyerCart.create({ buyerId: req.buyerId, items: [] });
    }

    // Get unique seller emails from cart items
    const sellerEmails = [...new Set(
      cart.items
        .filter(item => item.productId)
        .map(item => item.productId.seller)
    )];

    // Fetch seller information
    const sellers = await Seller.find({ email: { $in: sellerEmails } })
      .select('email businessName palawanPayNumber palawanPayName')
      .lean();
    
    const sellerMap = {};
    sellers.forEach(seller => {
      sellerMap[seller.email] = {
        businessName: seller.businessName,
        palawanPayNumber: seller.palawanPayNumber || '',
        palawanPayName: seller.palawanPayName || ''
      };
    });

    // Transform cart items with seller info
    const items = cart.items
      .filter(item => item.productId) // Filter out items with deleted products
      .map(item => {
        const sellerEmail = item.productId.seller;
        const sellerInfo = sellerMap[sellerEmail] || {
          businessName: 'Unknown Seller',
          palawanPayNumber: '',
          palawanPayName: ''
        };
        console.log(`📦 Cart item "${item.productId.name}" - seller: ${sellerEmail}, Palawan Pay: ${sellerInfo.palawanPayNumber || 'NOT SET'}`);
        
        return {
          id: item.productId._id.toString(),
          name: item.productId.name,
          price: item.productId.price,
          image: item.productId.image,
          category: item.productId.category,
          description: item.productId.description,
          quantity: item.quantity,
          rating: 4.5,
          seller: sellerEmail,
          sellerInfo: sellerInfo
        };
      });
    
    console.log('🛒 Cart loaded with', items.length, 'items. Sellers:', [...new Set(items.map(i => i.seller))]);

    res.json({
      success: true,
      cart: items
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      error: 'Failed to fetch cart',
      message: 'An error occurred while fetching cart'
    });
  }
});

// Add to cart
router.post('/cart', async (req, res) => {
  try {
    console.log('🛒 Add to cart request body:', req.body);
    const { productId, quantity = 1 } = req.body;
    console.log('📦 Extracted productId:', productId, 'quantity:', quantity);

    if (!productId) {
      console.log('❌ Missing productId in request');
      return res.status(400).json({
        error: 'Missing product ID',
        message: 'Please provide a product ID'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'No product found with this ID'
      });
    }

    let cart = await BuyerCart.findOne({ buyerId: req.buyerId });

    if (!cart) {
      cart = new BuyerCart({ buyerId: req.buyerId, items: [] });
    }

    // Check if item already in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    await cart.populate('items.productId');

    const items = cart.items.map(item => ({
      id: item.productId._id.toString(),
      name: item.productId.name,
      price: item.productId.price,
      image: item.productId.image,
      category: item.productId.category,
      description: item.productId.description,
      quantity: item.quantity,
      rating: 4.5
    }));

    res.json({
      success: true,
      message: 'Item added to cart',
      cart: items
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      error: 'Failed to add to cart',
      message: 'An error occurred while adding to cart'
    });
  }
});

// Update cart item quantity
router.put('/cart/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        error: 'Invalid quantity',
        message: 'Quantity must be at least 1'
      });
    }

    const cart = await BuyerCart.findOne({ buyerId: req.buyerId });

    if (!cart) {
      return res.status(404).json({
        error: 'Cart not found',
        message: 'No cart found'
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        error: 'Item not found',
        message: 'Item not found in cart'
      });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    await cart.populate('items.productId');

    const items = cart.items.map(item => ({
      id: item.productId._id.toString(),
      name: item.productId.name,
      price: item.productId.price,
      image: item.productId.image,
      category: item.productId.category,
      description: item.productId.description,
      quantity: item.quantity,
      rating: 4.5
    }));

    res.json({
      success: true,
      message: 'Cart updated',
      cart: items
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      error: 'Failed to update cart',
      message: 'An error occurred while updating cart'
    });
  }
});

// Remove from cart
router.delete('/cart/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await BuyerCart.findOne({ buyerId: req.buyerId });

    if (!cart) {
      return res.status(404).json({
        error: 'Cart not found',
        message: 'No cart found'
      });
    }

    cart.items = cart.items.filter(
      item => item.productId.toString() !== productId
    );

    await cart.save();
    await cart.populate('items.productId');

    const items = cart.items.map(item => ({
      id: item.productId._id.toString(),
      name: item.productId.name,
      price: item.productId.price,
      image: item.productId.image,
      category: item.productId.category,
      description: item.productId.description,
      quantity: item.quantity,
      rating: 4.5
    }));

    res.json({
      success: true,
      message: 'Item removed from cart',
      cart: items
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      error: 'Failed to remove from cart',
      message: 'An error occurred while removing from cart'
    });
  }
});

// Clear cart
router.delete('/cart', async (req, res) => {
  try {
    const cart = await BuyerCart.findOne({ buyerId: req.buyerId });

    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.json({
      success: true,
      message: 'Cart cleared',
      cart: []
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      error: 'Failed to clear cart',
      message: 'An error occurred while clearing cart'
    });
  }
});

// ============= FAVORITES ROUTES =============

// Get favorites
router.get('/favorites', async (req, res) => {
  try {
    const favorites = await BuyerFavorite.find({ buyerId: req.buyerId })
      .select('buyerId productId')
      .populate({
        path: 'productId',
        select: 'name price category image images stock seller rating reviewCount'
      })
      .limit(200)
      .lean();

    const productIds = favorites
      .filter(fav => fav.productId)
      .map(fav => fav.productId._id.toString());

    res.json({
      success: true,
      favorites: productIds
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      error: 'Failed to fetch favorites',
      message: 'An error occurred while fetching favorites'
    });
  }
});

// Add to favorites
router.post('/favorites/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'No product found with this ID'
      });
    }

    // Check if already favorited
    const existing = await BuyerFavorite.findOne({ buyerId: req.buyerId, productId });
    
    if (existing) {
      return res.json({
        success: true,
        message: 'Already in favorites'
      });
    }

    await BuyerFavorite.create({ buyerId: req.buyerId, productId });

    const favorites = await BuyerFavorite.find({ buyerId: req.buyerId });
    const productIds = favorites.map(fav => fav.productId.toString());

    res.json({
      success: true,
      message: 'Added to favorites',
      favorites: productIds
    });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({
      error: 'Failed to add to favorites',
      message: 'An error occurred while adding to favorites'
    });
  }
});

// Remove from favorites
router.delete('/favorites/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    await BuyerFavorite.deleteOne({ buyerId: req.buyerId, productId });

    const favorites = await BuyerFavorite.find({ buyerId: req.buyerId });
    const productIds = favorites.map(fav => fav.productId.toString());

    res.json({
      success: true,
      message: 'Removed from favorites',
      favorites: productIds
    });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({
      error: 'Failed to remove from favorites',
      message: 'An error occurred while removing from favorites'
    });
  }
});

// ============= ADDRESS ROUTES =============

// Get all addresses
router.get('/addresses', async (req, res) => {
  try {
    const addresses = await BuyerAddress.find({ buyerId: req.buyerId })
      .select('label address city postal phone isDefault createdAt')
      .sort({ isDefault: -1, createdAt: -1 })
      .limit(50)
      .lean();

    const transformedAddresses = addresses.map(addr => ({
      id: addr._id.toString(),
      label: addr.label,
      address: addr.address,
      city: addr.city,
      postal: addr.postal,
      phone: addr.phone,
      isDefault: addr.isDefault
    }));

    res.json({
      success: true,
      addresses: transformedAddresses
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      error: 'Failed to fetch addresses',
      message: 'An error occurred while fetching addresses'
    });
  }
});

// Add new address
router.post('/addresses', async (req, res) => {
  try {
    const { label, address, city, postal, phone, isDefault } = req.body;

    const newAddress = await BuyerAddress.create({
      buyerId: req.buyerId,
      label,
      address,
      city,
      postal,
      phone,
      isDefault: isDefault || false
    });

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      address: {
        id: newAddress._id.toString(),
        label: newAddress.label,
        address: newAddress.address,
        city: newAddress.city,
        postal: newAddress.postal,
        phone: newAddress.phone,
        isDefault: newAddress.isDefault
      }
    });
  } catch (error) {
    console.error('Add address error:', error);
    
    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0];
      return res.status(400).json({
        error: 'Validation error',
        message: firstError.message,
        field: firstError.path
      });
    }

    res.status(500).json({
      error: 'Failed to add address',
      message: 'An error occurred while adding address'
    });
  }
});

// Update address
router.put('/addresses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { label, address, city, postal, phone, isDefault } = req.body;

    const updateData = {};
    if (label !== undefined) updateData.label = label;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (postal !== undefined) updateData.postal = postal;
    if (phone !== undefined) updateData.phone = phone;
    if (isDefault !== undefined) updateData.isDefault = isDefault;

    const updatedAddress = await BuyerAddress.findOneAndUpdate(
      { _id: id, buyerId: req.buyerId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedAddress) {
      return res.status(404).json({
        error: 'Address not found',
        message: 'No address found with this ID'
      });
    }

    res.json({
      success: true,
      message: 'Address updated successfully',
      address: {
        id: updatedAddress._id.toString(),
        label: updatedAddress.label,
        address: updatedAddress.address,
        city: updatedAddress.city,
        postal: updatedAddress.postal,
        phone: updatedAddress.phone,
        isDefault: updatedAddress.isDefault
      }
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      error: 'Failed to update address',
      message: 'An error occurred while updating address'
    });
  }
});

// Delete address
router.delete('/addresses/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAddress = await BuyerAddress.findOneAndDelete({
      _id: id,
      buyerId: req.buyerId
    });

    if (!deletedAddress) {
      return res.status(404).json({
        error: 'Address not found',
        message: 'No address found with this ID'
      });
    }

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      error: 'Failed to delete address',
      message: 'An error occurred while deleting address'
    });
  }
});

// Set default address
router.put('/addresses/:id/default', async (req, res) => {
  try {
    const { id } = req.params;

    // Unset all defaults
    await BuyerAddress.updateMany(
      { buyerId: req.buyerId },
      { isDefault: false }
    );

    // Set new default
    const updatedAddress = await BuyerAddress.findOneAndUpdate(
      { _id: id, buyerId: req.buyerId },
      { isDefault: true },
      { new: true }
    );

    if (!updatedAddress) {
      return res.status(404).json({
        error: 'Address not found',
        message: 'No address found with this ID'
      });
    }

    res.json({
      success: true,
      message: 'Default address updated'
    });
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({
      error: 'Failed to set default address',
      message: 'An error occurred while setting default address'
    });
  }
});

// ============= ORDER ROUTES =============

// Get all orders
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const totalOrders = await BuyerOrder.countDocuments({ buyerId: req.buyerId });
    const orders = await BuyerOrder.find({ buyerId: req.buyerId })
      .select('orderNumber items total status deliveryAddress sellerStatus deliveryPersonId deliveryStatus proofOfDelivery proofOfDeliveryImages deliveredAt statusHistory itemReviews canReview createdAt')
      .populate('deliveryPersonId', 'fullname phone vehicleType vehiclePlate licenseNumber photo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const transformedOrders = orders.map(order => ({
      _id: order._id,
      id: order.orderNumber,
      orderNumber: order.orderNumber,
      date: order.createdAt,
      status: order.status,
      total: order.total,
      items: order.items.map(item => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
        seller: item.seller,
        sellerInfo: item.sellerInfo
      })),
      address: order.deliveryAddress,
      sellerStatus: order.sellerStatus || [],
      deliveryPerson: order.deliveryPersonId ? {
        name: order.deliveryPersonId.fullname,
        phone: order.deliveryPersonId.phone,
        vehicleType: order.deliveryPersonId.vehicleType,
        vehiclePlate: order.deliveryPersonId.vehiclePlate || order.deliveryPersonId.licenseNumber,
        photo: order.deliveryPersonId.photo
      } : null,
      deliveryStatus: order.deliveryStatus,
      proofOfDelivery: order.proofOfDelivery,
      proofOfDeliveryImages: order.proofOfDeliveryImages || [],
      deliveredAt: order.deliveredAt,
      statusHistory: order.statusHistory || [],
      itemReviews: order.itemReviews || [],
      canReview: order.canReview
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
    console.error('Get orders error:', error);
    res.status(500).json({
      error: 'Failed to fetch orders',
      message: 'An error occurred while fetching orders'
    });
  }
});

// Get single order
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await BuyerOrder.findOne({
      orderNumber: req.params.id,
      buyerId: req.buyerId
    }).populate('deliveryPersonId', 'fullname phone vehicleType vehiclePlate licenseNumber photo');

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'No order found with this ID'
      });
    }

    res.json({
      success: true,
      order: {
        _id: order._id,
        id: order.orderNumber,
        orderNumber: order.orderNumber,
        date: order.createdAt,
        status: order.status,
        total: order.total,
        items: order.items.map(item => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
          seller: item.seller,
          sellerInfo: item.sellerInfo
        })),
        address: order.deliveryAddress,
        paymentMethod: order.paymentMethod,
        specialInstructions: order.specialInstructions,
        sellerStatus: order.sellerStatus || [],
        deliveryPerson: order.deliveryPersonId ? {
          name: order.deliveryPersonId.fullname,
          phone: order.deliveryPersonId.phone,
          vehicleType: order.deliveryPersonId.vehicleType,
          vehiclePlate: order.deliveryPersonId.vehiclePlate || order.deliveryPersonId.licenseNumber
        } : null,
        deliveryStatus: order.deliveryStatus,
        itemReviews: order.itemReviews || [],
        canReview: order.canReview
      }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      error: 'Failed to fetch order',
      message: 'An error occurred while fetching order'
    });
  }
});

// Place new order
router.post('/orders', async (req, res) => {
  try {
    console.log('📥 Received order request body:', JSON.stringify(req.body, null, 2));
    const { items, addressId, paymentMethod, specialInstructions, faceVerification, proofOfPaymentsBySeller } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        error: 'Empty cart',
        message: 'Cannot place order with empty cart'
      });
    }

    if (!addressId) {
      return res.status(400).json({
        error: 'Missing address',
        message: 'Please select a delivery address'
      });
    }

    // Get address - handle both BuyerAddress and profile address
    let address;
    
    if (addressId === 'profile') {
      // Use buyer's profile address
      const buyer = await Buyer.findById(req.buyerId).select('fullname phone city barangay province region');
      
      if (!buyer || !buyer.city) {
        return res.status(400).json({
          error: 'Profile address incomplete',
          message: 'Please complete your profile address information'
        });
      }
      
      address = {
        label: 'Primary Address (Registration)',
        address: `${buyer.barangay ? `Barangay ${buyer.barangay}, ` : ''}${buyer.city}${buyer.province ? `, ${buyer.province}` : ''}`,
        city: buyer.city,
        postal: '',
        phone: buyer.phone || ''
      };
    } else {
      // Use saved address from BuyerAddress collection
      address = await BuyerAddress.findOne({
        _id: addressId,
        buyerId: req.buyerId
      });

      if (!address) {
        return res.status(404).json({
          error: 'Address not found',
          message: 'Selected address not found'
        });
      }
    }

    // Calculate total
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 50;
    const total = subtotal + deliveryFee;

    // Convert proofOfPaymentsBySeller object to array format
    const proofsArray = proofOfPaymentsBySeller 
      ? Object.entries(proofOfPaymentsBySeller).map(([seller, proofImage]) => ({
          seller,
          proofImage
        }))
      : [];

    // Generate order number
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `ORD-${timestamp}-${random}`;

    // Create order
    console.log('🛒 Creating order with items:', items.map(i => ({ name: i.name, seller: i.seller })));
    
    // Validate that all items have seller field
    const itemsWithoutSeller = items.filter(i => !i.seller);
    if (itemsWithoutSeller.length > 0) {
      console.error('❌ ERROR: Some items missing seller field:', itemsWithoutSeller);
      return res.status(400).json({
        error: 'Invalid cart items',
        message: 'Some items are missing seller information. Please refresh and try again.'
      });
    }
    
    // Get unique sellers and initialize their statuses
    const uniqueSellers = [...new Set(items.map(item => item.seller))];
    const initialSellerStatuses = uniqueSellers.map(sellerEmail => ({
      seller: sellerEmail,
      status: 'Pending'
    }));
    
    console.log('👥 Initializing seller statuses for:', uniqueSellers);
    
    const order = new BuyerOrder({
      orderNumber,
      buyerId: req.buyerId,
      items: items.map(item => ({
        productId: new mongoose.Types.ObjectId(item.id),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        seller: item.seller,
        sellerInfo: item.sellerInfo
      })),
      total,
      deliveryAddress: {
        label: address.label,
        address: address.address,
        city: address.city,
        postal: address.postal,
        phone: address.phone
      },
      paymentMethod: paymentMethod || 'Cash on Delivery',
      specialInstructions: specialInstructions || '',
      faceVerification: faceVerification || null,
      proofOfPaymentsBySeller: proofsArray,
      deliveryFee,
      sellerStatus: initialSellerStatuses
    });

    await order.save();
    
    console.log('✅ Order saved successfully:', orderNumber);
    console.log('📋 Order items with sellers:', order.items.map(i => ({ 
      name: i.name, 
      seller: i.seller,
      hasSellerField: !!i.seller,
      sellerInfo: i.sellerInfo 
    })));
    
    // Verify the order was saved correctly by fetching it back
    const savedOrder = await BuyerOrder.findOne({ orderNumber });
    console.log('🔍 Verification - Fetched saved order items:', savedOrder.items.map(i => ({
      name: i.name,
      seller: i.seller,
      hasSellerField: !!i.seller
    })));

    // Note: Stock will be decremented when order is delivered, not at order placement
    console.log('📦 Stock will be updated when order is marked as delivered');

    // Clear cart
    await BuyerCart.findOneAndUpdate(
      { buyerId: req.buyerId },
      { items: [] }
    );

    // Send notifications to sellers and admin
    try {
      // Get buyer info for notification
      const buyer = await Buyer.findById(req.buyerId).select('fullname');
      const orderData = {
        _id: order._id,
        orderNumber: order.orderNumber,
        customerName: buyer?.fullname || 'Customer'
      };

      // Notify each seller
      for (const sellerEmail of uniqueSellers) {
        try {
          const seller = await Seller.findOne({ email: sellerEmail });
          if (seller) {
            await notifyNewOrder(seller._id, orderData);
          }
        } catch (sellerNotifError) {
          console.error(`Error notifying seller ${sellerEmail}:`, sellerNotifError);
        }
      }

      // Notify admin (get first admin)
      try {
        const admin = await Admin.findOne();
        if (admin) {
          await notifyAdminNewOrder(admin._id, orderData);
        }
      } catch (adminNotifError) {
        console.error('Error notifying admin:', adminNotifError);
      }
    } catch (notifError) {
      console.error('Error sending order notifications:', notifError);
      // Don't fail the order if notifications fail
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: {
        id: order.orderNumber,
        date: order.createdAt,
        status: order.status,
        total: order.total
      }
    });
  } catch (error) {
    console.error('Place order error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    res.status(500).json({
      error: 'Failed to place order',
      message: error.message || 'An error occurred while placing order',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Cancel order
router.put('/orders/:id/cancel', async (req, res) => {
  try {
    const order = await BuyerOrder.findOne({
      orderNumber: req.params.id,
      buyerId: req.buyerId
    });

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'No order found with this ID'
      });
    }

    if (order.status === 'Delivered' || order.status === 'Cancelled') {
      return res.status(400).json({
        error: 'Cannot cancel order',
        message: `Order is already ${order.status.toLowerCase()}`
      });
    }

    order.status = 'Cancelled';
    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      error: 'Failed to cancel order',
      message: 'An error occurred while cancelling order'
    });
  }
});

// ============= FACE RECOGNITION ROUTES =============

// Register face descriptor
router.post('/face/register', async (req, res) => {
  try {
    const { faceDescriptor } = req.body;

    if (!faceDescriptor || !Array.isArray(faceDescriptor) || faceDescriptor.length !== 128) {
      return res.status(400).json({
        error: 'Invalid face descriptor',
        message: 'Face descriptor must be an array of 128 numbers'
      });
    }

    // Update buyer with face descriptor
    const buyer = await Buyer.findByIdAndUpdate(
      req.buyerId,
      {
        faceDescriptor,
        isFaceRegistered: true,
        faceRegisteredAt: new Date()
      },
      { new: true }
    ).select('-password -verificationToken -resetPasswordToken -resetPasswordCode');

    res.json({
      success: true,
      message: 'Face registered successfully',
      isFaceRegistered: buyer.isFaceRegistered
    });
  } catch (error) {
    console.error('Face registration error:', error);
    res.status(500).json({
      error: 'Failed to register face',
      message: 'An error occurred while registering face'
    });
  }
});

// Verify face descriptor
router.post('/face/verify', async (req, res) => {
  try {
    const { faceDescriptor } = req.body;

    if (!faceDescriptor || !Array.isArray(faceDescriptor) || faceDescriptor.length !== 128) {
      return res.status(400).json({
        error: 'Invalid face descriptor',
        message: 'Face descriptor must be an array of 128 numbers'
      });
    }

    // Get buyer's stored face descriptor
    const buyer = await Buyer.findById(req.buyerId).select('faceDescriptor isFaceRegistered');

    if (!buyer.isFaceRegistered || !buyer.faceDescriptor) {
      return res.status(400).json({
        error: 'Face not registered',
        message: 'Please register your face first'
      });
    }

    // Calculate Euclidean distance between descriptors
    const storedDescriptor = buyer.faceDescriptor;
    let sumSquaredDiff = 0;
    for (let i = 0; i < 128; i++) {
      const diff = faceDescriptor[i] - storedDescriptor[i];
      sumSquaredDiff += diff * diff;
    }
    const distance = Math.sqrt(sumSquaredDiff);

    // Threshold for face match (typically 0.6)
    const threshold = 0.6;
    const isMatch = distance < threshold;

    console.log(`Face verification: distance=${distance.toFixed(4)}, threshold=${threshold}, match=${isMatch}`);

    res.json({
      success: true,
      isMatch,
      distance: distance.toFixed(4),
      message: isMatch ? 'Face verified successfully' : 'Face does not match'
    });
  } catch (error) {
    console.error('Face verification error:', error);
    res.status(500).json({
      error: 'Failed to verify face',
      message: 'An error occurred while verifying face'
    });
  }
});

// Check face registration status
router.get('/face/status', async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.buyerId).select('isFaceRegistered faceRegisteredAt');

    res.json({
      success: true,
      isFaceRegistered: buyer.isFaceRegistered || false,
      faceRegisteredAt: buyer.faceRegisteredAt || null
    });
  } catch (error) {
    console.error('Face status check error:', error);
    res.status(500).json({
      error: 'Failed to check face status',
      message: 'An error occurred while checking face status'
    });
  }
});

// ============= REVIEW ROUTES =============

// Submit review for order items
router.post('/orders/:orderId/reviews', async (req, res) => {
  try {
    const { reviews } = req.body; // Array of { productId, rating, comment, images }
    
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Please provide reviews array'
      });
    }

    // Find the order
    const order = await BuyerOrder.findOne({
      _id: req.params.orderId,
      buyerId: req.buyerId
    });

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'No order found with this ID'
      });
    }

    // Check if order is delivered
    if (order.status !== 'Delivered') {
      return res.status(400).json({
        error: 'Cannot review',
        message: 'You can only review delivered orders'
      });
    }

    // Get buyer info
    const buyer = await Buyer.findById(req.buyerId).select('fullname');
    const buyerProfile = await BuyerProfile.findOne({ buyerId: req.buyerId });

    // Initialize itemReviews if not exists
    if (!order.itemReviews) {
      order.itemReviews = [];
    }

    const reviewResults = [];

    // Process each review
    for (const reviewData of reviews) {
      const { productId, rating, comment, images } = reviewData;

      console.log('Processing review for productId:', productId);

      // Validate rating
      if (!rating || rating < 1 || rating > 5) {
        console.log('Invalid rating:', rating);
        continue; // Skip invalid ratings
      }

      // Check if product is in order
      const orderItem = order.items.find(item => {
        const itemProductId = item.productId ? item.productId.toString() : null;
        console.log('Comparing:', itemProductId, 'with', productId);
        return itemProductId === productId || itemProductId === productId.toString();
      });
      
      if (!orderItem) {
        console.log('Product not found in order items');
        console.log('Order items:', order.items.map(i => ({ id: i.productId, name: i.name })));
        continue; // Skip if product not in order
      }

      // Check if already reviewed
      const existingReview = order.itemReviews.find(
        ir => ir.productId && ir.productId.toString() === productId.toString()
      );
      if (existingReview && existingReview.reviewed) {
        console.log('Already reviewed');
        continue; // Skip if already reviewed
      }

      // Find product
      const product = await Product.findById(productId);
      if (!product) {
        console.log('Product not found in database:', productId);
        continue;
      }

      console.log('Adding review for product:', product.name);

      // Create review object
      const newReview = {
        buyerId: req.buyerId,
        buyerName: buyer.fullname,
        buyerPhoto: buyerProfile?.photo || null,
        orderId: order._id,
        rating: rating,
        comment: comment || '',
        images: images || [],
        createdAt: new Date(),
        helpful: 0
      };

      // Add review to product
      product.reviews.push(newReview);

      // Recalculate product rating
      const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
      product.rating = totalRating / product.reviews.length;
      product.reviewCount = product.reviews.length;

      await product.save();

      // Update order itemReviews
      const reviewId = product.reviews[product.reviews.length - 1]._id.toString();
      
      if (existingReview) {
        existingReview.reviewed = true;
        existingReview.reviewId = reviewId;
      } else {
        order.itemReviews.push({
          productId: productId,
          reviewed: true,
          reviewId: reviewId
        });
      }

      reviewResults.push({
        productId,
        reviewId,
        success: true
      });

      console.log('Review added successfully for:', product.name);
    }

    console.log('Total reviews processed:', reviewResults.length);

    // Check if all items are reviewed
    const allReviewed = order.items.every(item => {
      if (!item.productId) return false;
      return order.itemReviews.some(ir => 
        ir.productId && ir.productId.toString() === item.productId.toString() && ir.reviewed
      );
    });

    order.canReview = !allReviewed;
    await order.save();

    console.log('Order updated, canReview:', order.canReview);

    res.json({
      success: true,
      message: 'Reviews submitted successfully',
      reviews: reviewResults
    });
  } catch (error) {
    console.error('Submit review error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Failed to submit review',
      message: error.message || 'An error occurred while submitting review'
    });
  }
});

// Get buyer's reviews
router.get('/reviews', async (req, res) => {
  try {
    // Find all products with reviews from this buyer
    const products = await Product.find({
      'reviews.buyerId': req.buyerId
    }).select('name image reviews rating reviewCount');

    const buyerReviews = [];

    products.forEach(product => {
      const userReviews = product.reviews.filter(
        review => review.buyerId.toString() === req.buyerId.toString()
      );

      userReviews.forEach(review => {
        buyerReviews.push({
          reviewId: review._id,
          productId: product._id,
          productName: product.name,
          productImage: product.image,
          rating: review.rating,
          comment: review.comment,
          images: review.images,
          createdAt: review.createdAt,
          helpful: review.helpful
        });
      });
    });

    // Sort by date (newest first)
    buyerReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      reviews: buyerReviews
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      error: 'Failed to fetch reviews',
      message: 'An error occurred while fetching reviews'
    });
  }
});

// Edit review
router.put('/reviews/:reviewId', async (req, res) => {
  try {
    const { rating, comment, images } = req.body;
    const { reviewId } = req.params;

    // Find product with this review
    const product = await Product.findOne({
      'reviews._id': reviewId,
      'reviews.buyerId': req.buyerId
    });

    if (!product) {
      return res.status(404).json({
        error: 'Review not found',
        message: 'No review found with this ID'
      });
    }

    // Find the review
    const review = product.reviews.id(reviewId);
    
    // Check if review is within 30 days
    const daysSinceReview = (new Date() - new Date(review.createdAt)) / (1000 * 60 * 60 * 24);
    if (daysSinceReview > 30) {
      return res.status(400).json({
        error: 'Cannot edit review',
        message: 'Reviews can only be edited within 30 days'
      });
    }

    // Update review
    if (rating !== undefined && rating >= 1 && rating <= 5) {
      review.rating = rating;
    }
    if (comment !== undefined) {
      review.comment = comment;
    }
    if (images !== undefined) {
      review.images = images;
    }

    // Recalculate product rating
    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating = totalRating / product.reviews.length;

    await product.save();

    res.json({
      success: true,
      message: 'Review updated successfully'
    });
  } catch (error) {
    console.error('Edit review error:', error);
    res.status(500).json({
      error: 'Failed to edit review',
      message: 'An error occurred while editing review'
    });
  }
});

// Delete review
router.delete('/reviews/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;

    // Find product with this review
    const product = await Product.findOne({
      'reviews._id': reviewId,
      'reviews.buyerId': req.buyerId
    });

    if (!product) {
      return res.status(404).json({
        error: 'Review not found',
        message: 'No review found with this ID'
      });
    }

    // Find the review
    const review = product.reviews.id(reviewId);
    
    // Check if review is within 30 days
    const daysSinceReview = (new Date() - new Date(review.createdAt)) / (1000 * 60 * 60 * 24);
    if (daysSinceReview > 30) {
      return res.status(400).json({
        error: 'Cannot delete review',
        message: 'Reviews can only be deleted within 30 days'
      });
    }

    // Remove review
    product.reviews.pull(reviewId);

    // Recalculate product rating
    if (product.reviews.length > 0) {
      const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
      product.rating = totalRating / product.reviews.length;
      product.reviewCount = product.reviews.length;
    } else {
      product.rating = 0;
      product.reviewCount = 0;
    }

    await product.save();

    // Update order itemReviews
    const order = await BuyerOrder.findOne({
      'itemReviews.reviewId': reviewId
    });

    if (order) {
      const itemReview = order.itemReviews.find(ir => ir.reviewId === reviewId);
      if (itemReview) {
        itemReview.reviewed = false;
        itemReview.reviewId = null;
        order.canReview = true;
        await order.save();
      }
    }

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      error: 'Failed to delete review',
      message: 'An error occurred while deleting review'
    });
  }
});

export default router;