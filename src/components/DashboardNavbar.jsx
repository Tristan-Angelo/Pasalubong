import React, { useState, useEffect } from 'react';
import {
  getSellerNotifications,
  getSellerUnreadCount,
  markSellerNotificationRead,
  markAllSellerNotificationsRead,
  getAdminNotifications,
  getAdminUnreadCount,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  getDeliveryNotifications,
  getDeliveryUnreadCount,
  markDeliveryNotificationRead,
  markAllDeliveryNotificationsRead
} from '../utils/api';

const DashboardNavbar = ({ userType = 'buyer', onLogout, onNavigate, adminPhoto = null, adminName = null, adminEmail = null, userData = null, cartCount = 0, onToggleSidebar }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  const handleCartClick = () => {
    if (onNavigate) {
      onNavigate('cart');
    }
  };

  const handleNotificationToggle = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && userType !== 'buyer') {
      await loadNotifications();
    }
  };

  // Load notifications based on user type
  const loadNotifications = async () => {
    if (userType === 'buyer') return;

    setIsLoadingNotifications(true);
    try {
      let response;
      if (userType === 'seller') {
        response = await getSellerNotifications(10, 0);
      } else if (userType === 'admin') {
        response = await getAdminNotifications(10, 0);
      } else if (userType === 'delivery') {
        response = await getDeliveryNotifications(10, 0);
      }

      if (response && response.success) {
        setNotifications(response.notifications || []);
        setUnreadCount(response.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  // Load unread count
  const loadUnreadCount = async () => {
    if (userType === 'buyer') return;

    try {
      let response;
      if (userType === 'seller') {
        response = await getSellerUnreadCount();
      } else if (userType === 'admin') {
        response = await getAdminUnreadCount();
      } else if (userType === 'delivery') {
        response = await getDeliveryUnreadCount();
      }

      if (response && response.success) {
        setUnreadCount(response.count || 0);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  // Get navigation page based on notification type and user type
  const getNavigationPage = (notificationType) => {
    if (userType === 'delivery') {
      switch (notificationType) {
        case 'delivery_assigned':
        case 'delivery_accepted':
        case 'new_order':
        case 'order_status_change':
        case 'order_cancelled':
        case 'order_delivered':
          return 'deliveries';
        case 'payment_received':
          return 'earnings';
        case 'system_alert':
        default:
          return 'dashboard';
      }
    } else if (userType === 'seller') {
      switch (notificationType) {
        case 'new_order':
        case 'order_status_change':
        case 'order_cancelled':
        case 'order_delivered':
          return 'orders';
        case 'low_stock':
        case 'new_product':
          return 'products';
        case 'new_review':
          return 'reviews';
        case 'payment_received':
          return 'earnings';
        case 'system_alert':
        default:
          return 'dashboard';
      }
    } else if (userType === 'admin') {
      switch (notificationType) {
        case 'new_order':
        case 'order_status_change':
          return 'orders';
        case 'new_product':
          return 'products';
        case 'system_alert':
        default:
          return 'dashboard';
      }
    }
    return 'dashboard';
  };

  // Handle individual notification click - mark as read and navigate
  const handleIndividualNotificationClick = async (notification) => {
    try {
      // Mark as read if unread
      if (!notification.isRead) {
        let response;
        if (userType === 'seller') {
          response = await markSellerNotificationRead(notification._id);
        } else if (userType === 'admin') {
          response = await markAdminNotificationRead(notification._id);
        } else if (userType === 'delivery') {
          response = await markDeliveryNotificationRead(notification._id);
        }

        if (response && response.success) {
          // Update local state
          setNotifications(prev =>
            prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n)
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }

      // Navigate to appropriate section
      const targetPage = getNavigationPage(notification.type);
      if (onNavigate && targetPage) {
        setShowNotifications(false);
        onNavigate(targetPage);
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      let response;
      if (userType === 'seller') {
        response = await markAllSellerNotificationsRead();
      } else if (userType === 'admin') {
        response = await markAllAdminNotificationsRead();
      } else if (userType === 'delivery') {
        response = await markAllDeliveryNotificationsRead();
      }

      if (response && response.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Load unread count on mount and set up polling
  useEffect(() => {
    if (userType !== 'buyer') {
      loadUnreadCount();

      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        loadUnreadCount();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [userType]);

  // Get notification icon color based on type
  const getNotificationColor = (type) => {
    const colors = {
      new_order: 'bg-blue-500',
      order_status_change: 'bg-green-500',
      low_stock: 'bg-yellow-500',
      delivery_assigned: 'bg-purple-500',
      system_alert: 'bg-red-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  // Format time ago
  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const handleProfileClick = () => {
    setShowUserMenu(false);
    if (onNavigate) {
      onNavigate('profile-settings');
    }
  };

  const handleAccountSettingsClick = () => {
    setShowUserMenu(false);
    if (onNavigate) {
      onNavigate('account-settings');
    }
  };

  const getUserInfo = () => {
    // Use actual user data if provided
    if (userData) {
      let name, email, avatar, photo;

      switch (userType) {
        case 'buyer':
          name = userData.fullname || 'Buyer';
          email = userData.email || '';
          avatar = '👤';
          photo = userData.photo || null;
          break;
        case 'seller':
          name = userData.ownerName || userData.businessName || 'Seller';
          email = userData.email || '';
          avatar = '🏪';
          photo = userData.photo || null;
          break;
        case 'delivery':
          name = userData.fullname || userData.fullName || 'Rider';
          email = userData.email || '';
          avatar = '🚚';
          photo = userData.photo || null;
          break;
        case 'admin':
          name = userData.fullName || userData.username || adminName || 'Admin';
          email = userData.email || adminEmail || '';
          avatar = '⚙️';
          photo = userData.photo || adminPhoto || null;
          break;
        default:
          name = 'User';
          email = '';
          avatar = '👤';
          photo = null;
      }

      return { name, email, avatar, photo };
    }

    // Fallback to default values
    switch (userType) {
      case 'buyer':
        return {
          name: 'Buyer',
          email: 'buyer@example.com',
          avatar: '👤',
          photo: null
        };
      case 'seller':
        return {
          name: 'Seller',
          email: 'seller@example.com',
          avatar: '🏪',
          photo: null
        };
      case 'delivery':
        return {
          name: 'Rider',
          email: 'rider@example.com',
          avatar: '🚚',
          photo: null
        };
      case 'admin':
        return {
          name: adminName || 'Admin',
          email: adminEmail || 'admin@pasalubong.com',
          avatar: '⚙️',
          photo: adminPhoto
        };
      default:
        return {
          name: 'User',
          email: 'user@example.com',
          avatar: '👤',
          photo: null
        };
    }
  };

  const userInfo = getUserInfo();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Hamburger + Title */}
        <div className="flex items-center gap-4">
          {/* Mobile Hamburger Button - Only show on medium and small screens */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <img
              src="/PasalubongLogo.svg"
              alt="Pasalubong Logo"
              className="h-6 w-6 md:h-8 md:w-8"
            />
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight gradient-text">
              Pasalubong
            </h1>
          </div>
        </div>

        {/* Right side - User menu and notifications */}
        <div className="flex items-center gap-4">

          <div className="relative">
            <div className="border border-gray-300 rounded-lg">
              <button
                id="notifBtn"
                className="p-2 rounded hover:bg-gray-100"
                onClick={() => {
                  if (userType === 'buyer') {
                    handleCartClick();
                  } else {
                    handleNotificationToggle();
                  }
                }}
              >
                {userType === 'buyer' ? '🛒' : '🔔'}
              </button>

              {userType === 'buyer' ? (
                cartCount > 0 && (
                  <span
                    id="cartCount"
                    className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 text-xs font-semibold text-white bg-red-500 rounded-full"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )
              ) : (
                unreadCount > 0 && (
                  <span
                    id="notifDot"
                    className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 text-xs font-semibold text-white bg-red-500 rounded-full"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )
              )}
            </div>

            {/* Notifications Dropdown */}
            {showNotifications && userType !== 'buyer' && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {isLoadingNotifications ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto"></div>
                    <p className="text-xs text-gray-500 mt-2">Loading...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-sm text-gray-500">No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-blue-50' : ''}`}
                        onClick={() => handleIndividualNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 ${getNotificationColor(notification.type)} rounded-full mt-1.5 flex-shrink-0`}></div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!notification.isRead ? 'font-semibold' : 'font-medium'} text-gray-800 truncate`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatTimeAgo(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-3 border-t border-gray-200 text-center">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      // Could navigate to a full notifications page if needed
                    }}
                    className="text-sm text-rose-600 hover:text-rose-700 font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>


          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center overflow-hidden">
                {userInfo.photo ? (
                  <img
                    src={userInfo.photo}
                    alt={userInfo.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-rose-600 text-sm">{userInfo.avatar}</span>
                )}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-gray-800">{userInfo.name}</p>
                <p className="text-xs text-gray-500">{userInfo.email}</p>
              </div>
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-800">{userInfo.name}</p>
                  <p className="text-xs text-gray-500">{userInfo.email}</p>
                </div>
                <button
                  onClick={handleProfileClick}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Profile Settings
                </button>
                <button
                  onClick={handleAccountSettingsClick}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Account Settings
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;