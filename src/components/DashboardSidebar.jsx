import React, { useState } from 'react';

const DashboardSidebar = ({ activePage, setActivePage, userType = 'buyer', cartCount = 0, userData = null, isMobileMenuOpen = false, setIsMobileMenuOpen }) => {
  const toggleMobileMenu = () => {
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    }
  };

  const handleMenuItemClick = (pageId) => {
    setActivePage(pageId);
    setIsMobileMenuOpen(false); // Close mobile menu after selection
  };
  const getMenuItems = () => {
    switch (userType) {
      case 'buyer':
        return [
          { id: 'shop', label: 'Shop', icon: '🛍️' },
          { id: 'cart', label: 'Cart', icon: '🛒', badge: cartCount },
          { id: 'orders', label: 'Orders', icon: '📦' },
          { id: 'favorites', label: 'Favorites', icon: '❤️' },
          { id: 'addresses', label: 'Addresses', icon: '📍' },
          { id: 'help', label: 'Help', icon: '❓' }
        ];
      case 'seller':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: '📊' },
          { id: 'products', label: 'Products', icon: '📦' },
          { id: 'orders', label: 'Orders', icon: '📋' },
          { id: 'analytics', label: 'Analytics', icon: '📈' }
        ];
      case 'delivery':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: '📊' },
          { id: 'deliveries', label: 'Deliveries', icon: '🚚' },
          { id: 'earnings', label: 'Earnings', icon: '💰' }
        ];
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: '📊' },
          { id: 'products', label: 'Products', icon: '🍪' },
          { id: 'orders', label: 'Orders', icon: '🧾' },
          { id: 'sellers', label: 'Sellers', icon: '🏪' },
          { id: 'riders', label: 'Riders', icon: '🚴' },
          { id: 'customers', label: 'Customers', icon: '👥' },
          { id: 'reports', label: 'Reports', icon: '📈' }
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const getUserInfo = () => {
    if (userData) {
      let name, avatar, photo;

      switch (userType) {
        case 'buyer':
          name = userData.fullname || 'Buyer';
          avatar = '👤';
          photo = userData.photo || null;
          break;
        case 'seller':
          name = userData.businessName || userData.ownerName || 'Seller';
          avatar = '🏪';
          photo = userData.photo || null;
          break;
        case 'delivery':
          name = userData.fullname || userData.fullName || 'Rider';
          avatar = '🚚';
          photo = userData.photo || null;
          break;
        case 'admin':
          name = userData.fullName || userData.username || 'Admin';
          avatar = '⚙️';
          photo = userData.photo || null;
          break;
        default:
          name = 'User';
          avatar = '👤';
          photo = null;
      }

      return { name, avatar, photo };
    }

    // Fallback to default values
    switch (userType) {
      case 'buyer':
        return { name: 'Buyer', avatar: '👤', photo: null };
      case 'seller':
        return { name: 'Seller', avatar: '🏪', photo: null };
      case 'delivery':
        return { name: 'Rider', avatar: '🚚', photo: null };
      case 'admin':
        return { name: 'Admin', avatar: '⚙️', photo: null };
      default:
        return { name: 'User', avatar: '👤', photo: null };
    }
  };

  const userInfo = getUserInfo();

  return (
    <>
      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:relative
          w-64 bg-white shadow-lg h-full flex flex-col
          z-40
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">
          {userType === 'buyer' && '🛍️ Buyer Dashboard'}
          {userType === 'seller' && '🏪 Seller Dashboard'}
          {userType === 'delivery' && '🚚 Delivery Dashboard'}
          {userType === 'admin' && '⚙️ Admin Dashboard'}
        </h2>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleMenuItemClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  activePage === item.id
                    ? 'bg-rose-100 text-rose-700 border-l-4 border-rose-500'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium flex-1">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-rose-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center overflow-hidden">
            {userInfo.photo ? (
              <img
                src={userInfo.photo}
                alt={userInfo.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-rose-600 font-semibold">{userInfo.avatar}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate" title={userInfo.name}>
              {userInfo.name}
            </p>
            <p className="text-xs text-gray-500 capitalize">{userType}</p>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default DashboardSidebar;
