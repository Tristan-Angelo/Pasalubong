// Utility functions for order status styling across all dashboards

/**
 * Get chip/badge color classes for order status
 * @param {string} status - Order status
 * @returns {string} Tailwind classes for chip styling
 */
export const getStatusChipColor = (status) => {
  const colors = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Processing': 'bg-blue-100 text-blue-800',
    'Confirmed': 'bg-blue-100 text-blue-800',
    'Preparing': 'bg-orange-100 text-orange-800',
    'Ready': 'bg-teal-100 text-teal-800',
    'Out for Delivery': 'bg-purple-100 text-purple-800',
    'In Transit': 'bg-purple-100 text-purple-800',
    'Completed': 'bg-green-100 text-green-800',
    'Delivered': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-red-100 text-red-800',
    'Assigned': 'bg-blue-100 text-blue-800',
    'Accepted': 'bg-yellow-100 text-yellow-800',
    'Picked Up': 'bg-orange-100 text-orange-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Get background color classes for order cards/rows
 * @param {string} status - Order status
 * @returns {string} Tailwind classes for card/row background
 */
export const getStatusBackgroundColor = (status) => {
  const backgrounds = {
    'Pending': 'bg-yellow-100 border-2 border-yellow-300',
    'Processing': 'bg-blue-100 border-2 border-blue-300',
    'Confirmed': 'bg-blue-100 border-2 border-blue-300',
    'Preparing': 'bg-orange-100 border-2 border-orange-300',
    'Ready': 'bg-teal-100 border-2 border-teal-300',
    'Out for Delivery': 'bg-purple-100 border-2 border-purple-300',
    'In Transit': 'bg-purple-100 border-2 border-purple-300',
    'Completed': 'bg-green-100 border-2 border-green-400',
    'Delivered': 'bg-green-100 border-2 border-green-400',
    'Cancelled': 'bg-red-100 border-2 border-red-300',
    'Assigned': 'bg-blue-100 border-2 border-blue-300',
    'Accepted': 'bg-yellow-100 border-2 border-yellow-300',
    'Picked Up': 'bg-orange-100 border-2 border-orange-300'
  };
  return backgrounds[status] || 'bg-gray-100 border-2 border-gray-300';
};

/**
 * Get status icon emoji
 * @param {string} status - Order status
 * @returns {string} Emoji representing the status
 */
export const getStatusIcon = (status) => {
  const icons = {
    'Pending': '⏳',
    'Processing': '⚙️',
    'Confirmed': '✅',
    'Preparing': '👨‍🍳',
    'Ready': '📦',
    'Out for Delivery': '🚚',
    'In Transit': '🚚',
    'Completed': '✅',
    'Delivered': '✅',
    'Cancelled': '❌',
    'Assigned': '📋',
    'Accepted': '👍',
    'Picked Up': '📤'
  };
  return icons[status] || '📄';
};

/**
 * Get the actual display status for an order
 * Priority: deliveryStatus "Delivered" > order status
 * @param {Object} order - Order object with status and deliveryStatus
 * @returns {string} The status to display
 */
export const getDisplayStatus = (order) => {
  // Handle null/undefined order
  if (!order) return 'Pending';
  
  // If delivery is completed, always show "Delivered"
  if (order.deliveryStatus === 'Delivered' || order.status === 'Delivered') {
    return 'Delivered';
  }
  // If order is cancelled, show that
  if (order.status === 'Cancelled') {
    return 'Cancelled';
  }
  // Otherwise show the order status
  return order.status || 'Pending';
};