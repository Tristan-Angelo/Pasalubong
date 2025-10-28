import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { authenticateDelivery } from '../../middleware/authMiddleware.js';
import Delivery from '../../models/Delivery.js';
import BuyerOrder from '../../models/BuyerOrder.js';
import Buyer from '../../models/Buyer.js';
import Seller from '../../models/Seller.js';
import Product from '../../models/Product.js';
import { generateRouteData } from '../../utils/geocoding.js';
import { getUserNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification, createNotification } from '../../utils/notificationService.js';
import { validIdUpload } from '../../config/upload.js';

const router = Router();

// ============= VALID ID UPLOAD ROUTES (No approval required) =============

// Upload valid ID images
router.post('/upload-valid-id', authenticateDelivery, validIdUpload.fields([
  { name: 'front', maxCount: 1 },
  { name: 'back', maxCount: 1 }
]), async (req, res) => {
  try {
    if (!req.files || !req.files.front || !req.files.back) {
      return res.status(400).json({
        error: 'Missing files',
        message: 'Please upload both front and back images of your valid ID'
      });
    }

    const delivery = await Delivery.findById(req.deliveryId);
    if (!delivery) {
      return res.status(404).json({
        error: 'Delivery person not found',
        message: 'Delivery account not found'
      });
    }

    // Store file paths
    const frontPath = `/uploads/valid_ids/${req.files.front[0].filename}`;
    const backPath = `/uploads/valid_ids/${req.files.back[0].filename}`;

    delivery.validIdFront = frontPath;
    delivery.validIdBack = backPath;
    delivery.approvalStatus = 'pending';
    await delivery.save();

    res.json({
      success: true,
      message: 'Valid ID uploaded successfully. Your account is pending admin approval.',
      validIdFront: frontPath,
      validIdBack: backPath
    });
  } catch (error) {
    console.error('Upload valid ID error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error.message || 'An error occurred while uploading valid ID'
    });
  }
});

// Get approval status
router.get('/approval-status', authenticateDelivery, async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.deliveryId).select('approvalStatus isApproved validIdFront validIdBack approvalDate');
    
    if (!delivery) {
      return res.status(404).json({
        error: 'Delivery person not found',
        message: 'Delivery account not found'
      });
    }

    res.json({
      success: true,
      approvalStatus: delivery.approvalStatus,
      isApproved: delivery.isApproved,
      hasUploadedIds: !!(delivery.validIdFront && delivery.validIdBack),
      approvalDate: delivery.approvalDate
    });
  } catch (error) {
    console.error('Get approval status error:', error);
    res.status(500).json({
      error: 'Failed to fetch status',
      message: 'An error occurred while fetching approval status'
    });
  }
});

// All other routes require authentication AND approval
router.use(authenticateDelivery);

// ============= NOTIFICATION ROUTES =============

// Get delivery notifications
router.get('/notifications', async (req, res) => {
  try {
    const { limit = 20, skip = 0 } = req.query;
    const notifications = await getUserNotifications(req.deliveryId, 'Delivery', parseInt(limit), parseInt(skip));
    const unreadCount = await getUnreadCount(req.deliveryId, 'Delivery');

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
    const count = await getUnreadCount(req.deliveryId, 'Delivery');
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
    const notification = await markAsRead(req.params.id, req.deliveryId);
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
    await markAllAsRead(req.deliveryId, 'Delivery');
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
    await deleteNotification(req.params.id, req.deliveryId);
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

// Get delivery profile
router.get('/profile', async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.deliveryId).select('-password -verificationToken -resetPasswordToken -resetPasswordCode').lean();

    // Transform to ensure fullName is available (map fullname to fullName)
    const profile = {
      ...delivery,
      fullName: delivery.fullname || delivery.fullName
    };

    res.json({
      success: true,
      profile: profile
    });
  } catch (error) {
    console.error('Get delivery profile error:', error);
    res.status(500).json({
      error: 'Failed to fetch profile',
      message: 'An error occurred while fetching profile'
    });
  }
});

// Update delivery profile
router.put('/profile', async (req, res) => {
  try {
    const { fullname, fullName, phone, vehicleType, vehiclePlate, serviceArea, photo, isAvailable } = req.body;

    const delivery = await Delivery.findById(req.deliveryId);
    if (!delivery) {
      return res.status(404).json({
        error: 'Delivery person not found',
        message: 'Delivery account not found'
      });
    }

    // Update fields - handle both fullname and fullName
    if (fullname || fullName) delivery.fullname = fullname || fullName;
    if (phone) delivery.phone = phone;
    if (vehicleType) delivery.vehicleType = vehicleType;
    if (vehiclePlate) delivery.vehiclePlate = vehiclePlate;
    if (serviceArea) delivery.serviceArea = serviceArea;
    if (photo !== undefined) delivery.photo = photo;
    if (isAvailable !== undefined) delivery.isAvailable = isAvailable;

    await delivery.save();

    const updatedDelivery = await Delivery.findById(req.deliveryId).select('-password -verificationToken -resetPasswordToken -resetPasswordCode');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedDelivery
    });
  } catch (error) {
    console.error('Update delivery profile error:', error);
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

    const delivery = await Delivery.findById(req.deliveryId);
    if (!delivery) {
      return res.status(404).json({
        error: 'Delivery person not found',
        message: 'Delivery account not found'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, delivery.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid password',
        message: 'Password is incorrect'
      });
    }

    // Check if email already exists
    const existingDelivery = await Delivery.findOne({ email: newEmail.toLowerCase() });
    if (existingDelivery && existingDelivery._id.toString() !== req.deliveryId.toString()) {
      return res.status(409).json({
        error: 'Email already exists',
        message: 'This email is already registered'
      });
    }

    // Update email
    delivery.email = newEmail.toLowerCase();
    delivery.isEmailVerified = false; // Require re-verification
    await delivery.save();

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

    const delivery = await Delivery.findById(req.deliveryId);
    if (!delivery) {
      return res.status(404).json({
        error: 'Delivery person not found',
        message: 'Delivery account not found'
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, delivery.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid password',
        message: 'Current password is incorrect'
      });
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    delivery.password = hashedPassword;
    await delivery.save();

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

// ============= DELIVERY ROUTES =============

// Get delivery assignments
router.get('/deliveries', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {
      $or: [
        { 
          deliveryPersonId: req.deliveryId,
          deliveryStatus: { $in: ['Assigned', 'Accepted', 'Picked Up', 'In Transit', 'Delivered'] }
        },
        { 
          status: 'Out for Delivery', 
          deliveryPersonId: null,
          deliveryStatus: 'Assigned'
        }
      ]
    };

    // Get total count
    const totalDeliveries = await BuyerOrder.countDocuments(query);

    // Get orders assigned to this delivery person (including newly assigned ones)
    // OR orders ready for assignment (unassigned and in Assigned status)
    const orders = await BuyerOrder.find(query)
    .select('orderNumber buyerId items deliveryAddress deliveryStatus deliveryFee status createdAt')
    .populate('buyerId', 'fullname email phone')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

    // Get all unique seller emails from orders
    const sellerEmails = [...new Set(orders.flatMap(order => 
      order.items.map(item => item.seller).filter(Boolean)
    ))];

    // Fetch all sellers in one query
    const sellers = await Seller.find({ email: { $in: sellerEmails } })
      .select('email businessName barangay city province')
      .lean();
    const sellerMap = new Map(sellers.map(seller => [seller.email, seller]));

    const deliveries = orders.map(order => {
      // Get seller info for pickup address
      const firstItem = order.items[0];
      let pickupAddress = 'Carigara, Leyte, Philippines';
      
      if (firstItem?.seller) {
        const seller = sellerMap.get(firstItem.seller);
        if (seller) {
          // Construct detailed pickup address from seller's location
          pickupAddress = `${seller.businessName}, ${seller.barangay}, ${seller.city}, ${seller.province}, Philippines`;
        } else if (firstItem.sellerInfo?.businessName) {
          // Fallback: use business name with default Carigara location
          pickupAddress = `${firstItem.sellerInfo.businessName}, Carigara, Leyte, Philippines`;
        }
      } else if (firstItem?.sellerInfo?.businessName) {
        pickupAddress = `${firstItem.sellerInfo.businessName}, Carigara, Leyte, Philippines`;
      }

      return {
        id: order._id,
        orderNumber: order.orderNumber,
        orderId: order.orderNumber,
        customerName: order.buyerId?.fullname || 'Unknown',
        customerPhone: order.deliveryAddress?.phone || order.buyerId?.phone || '',
        customerEmail: order.buyerId?.email || '',
        pickupAddress,
        deliveryAddress: `${order.deliveryAddress?.address || ''}, ${order.deliveryAddress?.city || ''}`,
        items: order.items.map(item => ({
          name: item.name,
          quantity: item.quantity
        })),
        total: order.total,
        deliveryFee: order.deliveryFee,
        status: order.deliveryStatus,
        assignedAt: order.updatedAt,
        distance: '10-15 km', // This would be calculated based on actual addresses
        notes: order.specialInstructions
      };
    });

    res.json({
      success: true,
      deliveries,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalDeliveries / parseInt(limit)),
        totalDeliveries,
        deliveriesPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get deliveries error:', error);
    res.status(500).json({
      error: 'Failed to fetch deliveries',
      message: 'An error occurred while fetching deliveries'
    });
  }
});

// Accept delivery
router.post('/deliveries/:orderId/accept', async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await BuyerOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Order not found'
      });
    }

    // Check if already assigned to a DIFFERENT delivery person
    if (order.deliveryPersonId && order.deliveryPersonId.toString() !== req.deliveryId.toString()) {
      return res.status(400).json({
        error: 'Already assigned',
        message: 'This delivery is already assigned to another person'
      });
    }

    // If already assigned to this person and already accepted, just return success
    if (order.deliveryPersonId && order.deliveryPersonId.toString() === req.deliveryId.toString() && order.deliveryStatus === 'Accepted') {
      return res.json({
        success: true,
        message: 'Delivery already accepted'
      });
    }

    order.deliveryPersonId = req.deliveryId;
    order.deliveryStatus = 'Accepted';
    await order.save();

    res.json({
      success: true,
      message: 'Delivery accepted successfully'
    });
  } catch (error) {
    console.error('Accept delivery error:', error);
    res.status(500).json({
      error: 'Failed to accept delivery',
      message: 'An error occurred while accepting delivery'
    });
  }
});

// Decline delivery
router.post('/deliveries/:orderId/decline', async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await BuyerOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Order not found'
      });
    }

    // Only allow declining if the order is in 'Assigned' status and not yet accepted by anyone
    // or if it was assigned to this delivery person but not yet accepted
    if (order.deliveryStatus !== 'Assigned' && order.deliveryStatus !== 'Pending') {
      return res.status(400).json({
        error: 'Cannot decline',
        message: 'This delivery cannot be declined at this stage'
      });
    }

    // If it was assigned to this specific delivery person, unassign them
    if (order.deliveryPersonId && order.deliveryPersonId.toString() === req.deliveryId.toString()) {
      order.deliveryPersonId = null;
    }

    // Keep the status as 'Assigned' so it remains available for other delivery persons
    order.deliveryStatus = 'Assigned';
    await order.save();

    res.json({
      success: true,
      message: 'Delivery declined successfully'
    });
  } catch (error) {
    console.error('Decline delivery error:', error);
    res.status(500).json({
      error: 'Failed to decline delivery',
      message: 'An error occurred while declining delivery'
    });
  }
});

// Update delivery status
router.put('/deliveries/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, proofOfDelivery, proofOfDeliveryImages } = req.body;

    const validStatuses = ['Assigned', 'Accepted', 'Picked Up', 'In Transit', 'Delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Invalid delivery status'
      });
    }

    const order = await BuyerOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Order not found'
      });
    }

    if (order.deliveryPersonId?.toString() !== req.deliveryId.toString()) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'You do not have permission to update this delivery'
      });
    }

    order.deliveryStatus = status;
    
    // Update overall order status and add proof of delivery
    if (status === 'Delivered') {
      order.status = 'Delivered';
      
      // Validate that 2 images are provided
      if (proofOfDeliveryImages && Array.isArray(proofOfDeliveryImages)) {
        if (proofOfDeliveryImages.length < 2) {
          return res.status(400).json({
            error: 'Insufficient proof images',
            message: 'Please provide 2 proof of delivery images'
          });
        }
        order.proofOfDeliveryImages = proofOfDeliveryImages;
        // Keep the first image as the main proof for backward compatibility
        order.proofOfDelivery = proofOfDeliveryImages[0];
      } else if (proofOfDelivery) {
        // Fallback for old single image format
        order.proofOfDelivery = proofOfDelivery;
      } else {
        return res.status(400).json({
          error: 'Missing proof of delivery',
          message: 'Please provide proof of delivery images'
        });
      }
      
      order.deliveredAt = new Date();
      
      // Enable reviews for delivered orders
      order.canReview = true;
    }

    // Track status change timestamps
    if (!order.statusHistory) {
      order.statusHistory = [];
    }
    order.statusHistory.push({
      status: status,
      timestamp: new Date(),
      updatedBy: 'delivery'
    });

    await order.save();

    // Update product stock when order is delivered
    if (status === 'Delivered') {
      console.log('📦 Updating product stock for delivered order:', order.orderNumber);
      
      for (const item of order.items) {
        try {
          // Find product by productId (stored in item)
          const product = await Product.findById(item.productId);
          if (product) {
            const oldStock = product.stock;
            const newStock = Math.max(0, product.stock - item.quantity);
            await Product.findByIdAndUpdate(
              item.productId,
              { stock: newStock },
              { new: true }
            );
            console.log(`📦 Updated stock for ${product.name}: ${oldStock} → ${newStock} (ordered: ${item.quantity})`);
          } else {
            console.warn(`⚠️ Product not found for item: ${item.name} (ID: ${item.productId})`);
          }
        } catch (stockError) {
          console.error(`⚠️ Failed to update stock for product ${item.productId}:`, stockError);
          // Continue with other items even if one fails
        }
      }
    }

    // Send notifications when order is delivered
    if (status === 'Delivered') {
      try {
        // Notify buyer
        if (order.buyerId) {
          await createNotification({
            recipientId: order.buyerId,
            recipientModel: 'Buyer',
            type: 'order_delivered',
            title: 'Order Delivered',
            message: `Your order #${order.orderNumber} has been delivered successfully!`,
            data: { orderId: order._id, orderNumber: order.orderNumber },
            priority: 'high'
          });
        }

        // Notify all sellers involved in this order
        if (order.items && order.items.length > 0) {
          const sellerIds = [...new Set(order.items.map(item => item.sellerId).filter(Boolean))];
          
          for (const sellerId of sellerIds) {
            try {
              const seller = await Seller.findById(sellerId);
              if (seller) {
                await createNotification({
                  recipientId: sellerId,
                  recipientModel: 'Seller',
                  type: 'order_delivered',
                  title: 'Order Delivered',
                  message: `Order #${order.orderNumber} has been delivered to the customer`,
                  data: { orderId: order._id, orderNumber: order.orderNumber },
                  priority: 'medium'
                });
              }
            } catch (notifError) {
              console.error(`Error notifying seller ${sellerId}:`, notifError);
            }
          }
        }
      } catch (notificationError) {
        console.error('Error sending delivery notifications:', notificationError);
        // Don't fail the request if notifications fail
      }
    }

    res.json({
      success: true,
      message: 'Delivery status updated successfully'
    });
  } catch (error) {
    console.error('Update delivery status error:', error);
    res.status(500).json({
      error: 'Failed to update delivery status',
      message: 'An error occurred while updating delivery status'
    });
  }
});

// Get delivery statistics
router.get('/statistics', async (req, res) => {
  try {
    const orders = await BuyerOrder.find({
      deliveryPersonId: req.deliveryId
    })
    .select('deliveryStatus deliveryFee updatedAt')
    .limit(5000)
    .lean();

    const activeDeliveries = orders.filter(o => 
      ['Assigned', 'Accepted', 'Picked Up', 'In Transit'].includes(o.deliveryStatus)
    ).length;

    const completedDeliveries = orders.filter(o => o.deliveryStatus === 'Delivered').length;

    const totalEarnings = orders
      .filter(o => o.deliveryStatus === 'Delivered')
      .reduce((sum, o) => sum + o.deliveryFee, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayEarnings = orders
      .filter(o => {
        const orderDate = new Date(o.updatedAt);
        orderDate.setHours(0, 0, 0, 0);
        return o.deliveryStatus === 'Delivered' && orderDate.getTime() === today.getTime();
      })
      .reduce((sum, o) => sum + o.deliveryFee, 0);

    res.json({
      success: true,
      statistics: {
        activeDeliveries,
        completedDeliveries,
        totalEarnings,
        todayEarnings
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

// Get route data for a delivery
router.get('/deliveries/:orderId/route', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await BuyerOrder.findById(orderId).populate('items.productId');
    
    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Order not found'
      });
    }
    
    // Check if this delivery person has access to this order
    if (order.deliveryPersonId?.toString() !== req.deliveryId.toString()) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'You do not have permission to view this route'
      });
    }
    
    // Get the seller email from the first item
    const firstItem = order.items[0];
    let pickupAddress = 'Carigara, Leyte, Philippines';
    let sellerEmail = null;
    
    // Try to get seller email from different sources
    if (firstItem?.productId?.seller) {
      sellerEmail = firstItem.productId.seller;
    } else if (firstItem?.seller) {
      sellerEmail = firstItem.seller;
    }
    
    console.log('Looking up seller:', sellerEmail);
    
    if (sellerEmail) {
      // Query seller by email (seller field stores email, not ObjectId)
      const seller = await Seller.findOne({ email: sellerEmail });
      
      console.log('Found seller:', seller ? {
        businessName: seller.businessName,
        barangay: seller.barangay,
        city: seller.city,
        province: seller.province
      } : 'Not found');
      
      if (seller) {
        // Construct detailed pickup address from seller's location
        pickupAddress = `${seller.barangay}, ${seller.city}, ${seller.province}, Philippines`;
      } else if (firstItem.sellerInfo?.businessName) {
        // Fallback: use business name with default Carigara location
        pickupAddress = `${firstItem.sellerInfo.businessName}, Carigara, Leyte, Philippines`;
      }
    } else if (firstItem?.sellerInfo?.businessName) {
      pickupAddress = `${firstItem.sellerInfo.businessName}, Carigara, Leyte, Philippines`;
    }
    
    // Get delivery address - use the full address if available, otherwise construct from city
    let deliveryAddress = 'Quezon City, Metro Manila, Philippines';
    if (order.deliveryAddress?.address) {
      // The address field already contains the full formatted address from geocoding
      // Check if it already ends with "Philippines"
      deliveryAddress = order.deliveryAddress.address;
      if (!deliveryAddress.toLowerCase().includes('philippines')) {
        deliveryAddress += ', Philippines';
      }
    } else if (order.deliveryAddress?.city) {
      deliveryAddress = `${order.deliveryAddress.city}, Philippines`;
    }
    
    console.log('Route addresses:', { pickupAddress, deliveryAddress });
    
    // Generate route data
    const routeData = await generateRouteData(pickupAddress, deliveryAddress);
    
    res.json({
      success: true,
      route: routeData
    });
  } catch (error) {
    console.error('Get route error:', error);
    res.status(500).json({
      error: 'Failed to generate route',
      message: error.message || 'An error occurred while generating the route'
    });
  }
});

// Get earnings history
router.get('/earnings', async (req, res) => {
  try {
    const orders = await BuyerOrder.find({
      deliveryPersonId: req.deliveryId,
      deliveryStatus: 'Delivered'
    })
    .select('deliveryFee updatedAt')
    .sort({ updatedAt: -1 })
    .limit(1000)
    .lean();

    // Group by date
    const earningsByDate = {};
    orders.forEach(order => {
      const date = new Date(order.updatedAt).toISOString().split('T')[0];
      if (!earningsByDate[date]) {
        earningsByDate[date] = {
          date,
          deliveries: 0,
          totalEarnings: 0,
          status: 'Paid' // In real app, this would be based on payout status
        };
      }
      earningsByDate[date].deliveries++;
      earningsByDate[date].totalEarnings += order.deliveryFee;
    });

    const earnings = Object.values(earningsByDate);

    res.json({
      success: true,
      earnings
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({
      error: 'Failed to fetch earnings',
      message: 'An error occurred while fetching earnings'
    });
  }
});

export default router;