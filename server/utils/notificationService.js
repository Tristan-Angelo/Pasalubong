import Notification from '../models/Notification.js';
import cache from './cache.js';

/**
 * Create a notification for a user
 */
export const createNotification = async ({
  recipientId,
  recipientModel,
  type,
  title,
  message,
  data = {},
  priority = 'medium'
}) => {
  try {
    const notification = await Notification.create({
      recipientId,
      recipientModel,
      type,
      title,
      message,
      data,
      priority
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Get notifications for a user
 */
export const getUserNotifications = async (userId, userModel, limit = 20, skip = 0) => {
  try {
    const notifications = await Notification.find({
      recipientId: userId,
      recipientModel: userModel
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    
    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Get unread notification count (with caching)
 */
export const getUnreadCount = async (userId, userModel) => {
  try {
    // Check cache first
    const cacheKey = `unread_count:${userId}:${userModel}`;
    const cachedCount = cache.get(cacheKey);
    
    if (cachedCount !== null) {
      return cachedCount;
    }

    // Query database if not in cache
    const count = await Notification.countDocuments({
      recipientId: userId,
      recipientModel: userModel,
      isRead: false
    });
    
    // Cache for 10 seconds
    cache.set(cacheKey, count, 10);
    
    return count;
  } catch (error) {
    console.error('Error counting unread notifications:', error);
    throw error;
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipientId: userId },
      { isRead: true },
      { new: true }
    );
    
    // Invalidate cache for all user models
    ['Admin', 'Seller', 'Delivery', 'Buyer'].forEach(model => {
      cache.delete(`unread_count:${userId}:${model}`);
    });
    
    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (userId, userModel) => {
  try {
    await Notification.updateMany(
      { recipientId: userId, recipientModel: userModel, isRead: false },
      { isRead: true }
    );
    
    // Invalidate cache
    cache.delete(`unread_count:${userId}:${userModel}`);
    
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId, userId) => {
  try {
    await Notification.findOneAndDelete({
      _id: notificationId,
      recipientId: userId
    });
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

/**
 * Helper functions to create specific notification types
 */

export const notifyNewOrder = async (sellerId, orderData) => {
  // Invalidate cache when creating new notification
  cache.delete(`unread_count:${sellerId}:Seller`);
  
  return createNotification({
    recipientId: sellerId,
    recipientModel: 'Seller',
    type: 'new_order',
    title: 'New Order Received',
    message: `Order #${orderData.orderNumber} from ${orderData.customerName}`,
    data: { orderId: orderData._id, orderNumber: orderData.orderNumber },
    priority: 'high'
  });
};

export const notifyOrderStatusChange = async (buyerId, orderData, newStatus) => {
  return createNotification({
    recipientId: buyerId,
    recipientModel: 'Buyer',
    type: 'order_status_change',
    title: 'Order Status Updated',
    message: `Your order #${orderData.orderNumber} is now ${newStatus}`,
    data: { orderId: orderData._id, orderNumber: orderData.orderNumber, status: newStatus },
    priority: 'medium'
  });
};

export const notifyDeliveryAssigned = async (deliveryPersonId, orderData) => {
  return createNotification({
    recipientId: deliveryPersonId,
    recipientModel: 'Delivery',
    type: 'delivery_assigned',
    title: 'New Delivery Assignment',
    message: `You have been assigned to deliver order #${orderData.orderNumber}`,
    data: { orderId: orderData._id, orderNumber: orderData.orderNumber },
    priority: 'high'
  });
};

export const notifyLowStock = async (sellerId, productData) => {
  return createNotification({
    recipientId: sellerId,
    recipientModel: 'Seller',
    type: 'low_stock',
    title: 'Low Stock Alert',
    message: `${productData.name} has only ${productData.stock} items left`,
    data: { productId: productData._id, productName: productData.name, stock: productData.stock },
    priority: 'medium'
  });
};

export const notifyAdminNewOrder = async (adminId, orderData) => {
  return createNotification({
    recipientId: adminId,
    recipientModel: 'Admin',
    type: 'new_order',
    title: 'New Order in System',
    message: `Order #${orderData.orderNumber} placed by ${orderData.customerName}`,
    data: { orderId: orderData._id, orderNumber: orderData.orderNumber },
    priority: 'medium'
  });
};