// API base URL - adjust based on environment
const API_BASE_URL = import.meta.env.PROD 
  ? '/api/v1' 
  : 'http://localhost:3000/api/v1';

// Base URL for static assets
// In development, Vite proxy handles /uploads, so we don't need the full URL
export const ASSETS_BASE_URL = '';

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  try {
    // Separate headers from other options to prevent override
    const { headers: optionHeaders, ...restOptions } = options;
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...restOptions,
      headers: {
        'Content-Type': 'application/json',
        ...optionHeaders,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // Create error object with message and field
      const error = new Error(data.message || data.error || 'An error occurred');
      error.field = data.field; // Pass the field property if available
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// ============= PUBLIC API (No Auth Required) =============

export const getPublicProducts = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(`/public/products${queryString ? `?${queryString}` : ''}`, {
    method: 'GET'
  });
};

export const getPublicProduct = async (id) => {
  return apiCall(`/public/products/${id}`, { method: 'GET' });
};

export const getPublicCategories = async () => {
  return apiCall('/public/categories', { method: 'GET' });
};

// ============= BUYER API =============

export const buyerRegister = async (userData) => {
  return apiCall('/auth/buyer/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const buyerLogin = async (credentials) => {
  return apiCall('/auth/buyer/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

// ============= SELLER API =============

export const sellerRegister = async (userData) => {
  return apiCall('/auth/seller/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const sellerLogin = async (credentials) => {
  return apiCall('/auth/seller/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

// ============= DELIVERY API =============

export const deliveryRegister = async (userData) => {
  return apiCall('/auth/delivery/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const deliveryLogin = async (credentials) => {
  return apiCall('/auth/delivery/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

// ============= EMAIL VERIFICATION API =============

export const verifyEmail = async (token, userType) => {
  return apiCall(`/auth/${userType}/verify-email?token=${token}`, {
    method: 'GET',
  });
};

export const resendVerificationEmail = async (email, userType) => {
  return apiCall(`/auth/${userType}/resend-verification`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

export const checkVerificationStatus = async (email, userType) => {
  return apiCall(`/auth/${userType}/check-verification?email=${encodeURIComponent(email)}`, {
    method: 'GET',
  });
};

// ============= PASSWORD RESET API =============

export const forgotPassword = async (email, userType) => {
  return apiCall(`/auth/${userType}/forgot-password`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

export const verifyResetCode = async (email, code, userType) => {
  return apiCall(`/auth/${userType}/verify-reset-code`, {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });
};

export const verifyResetToken = async (token, userType) => {
  return apiCall(`/auth/${userType}/verify-reset-token?token=${token}`, {
    method: 'GET',
  });
};

export const resetPassword = async (token, password, userType) => {
  return apiCall(`/auth/${userType}/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
};

// ============= ADMIN API =============

// Admin authenticated API call
const adminApiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('admin_token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  return apiCall(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });
};

export const adminLogin = async (credentials) => {
  return apiCall('/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

export const adminRegister = async (userData) => {
  return apiCall('/auth/admin/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

// Admin Profile
export const getAdminProfile = async () => {
  return adminApiCall('/admin/profile', {
    method: 'GET'
  });
};

export const updateAdminProfile = async (profileData) => {
  return adminApiCall('/admin/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  });
};

export const changeAdminEmail = async (emailData) => {
  return adminApiCall('/admin/change-email', {
    method: 'PUT',
    body: JSON.stringify(emailData)
  });
};

export const changeAdminPassword = async (passwordData) => {
  return adminApiCall('/admin/change-password', {
    method: 'PUT',
    body: JSON.stringify(passwordData)
  });
};

// ============= ADMIN DATA API =============

export const getCustomers = async (page = 1, limit = 10) => {
  return apiCall(`/admin/customers?page=${page}&limit=${limit}`, {
    method: 'GET',
  });
};

export const getSellers = async (page = 1, limit = 10) => {
  return apiCall(`/admin/sellers?page=${page}&limit=${limit}`, {
    method: 'GET',
  });
};

export const getRiders = async (page = 1, limit = 10) => {
  return apiCall(`/admin/riders?page=${page}&limit=${limit}`, {
    method: 'GET',
  });
};

export const updateCustomer = async (id, userData) => {
  return apiCall(`/admin/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
};

export const updateSeller = async (id, userData) => {
  return apiCall(`/admin/sellers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
};

export const updateRider = async (id, userData) => {
  return apiCall(`/admin/riders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
};

export const toggleUserStatus = async (userType, id, isActive) => {
  return apiCall(`/admin/${userType}/${id}/toggle-status`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive }),
  });
};

export const deleteCustomer = async (id) => {
  return apiCall(`/admin/customers/${id}`, {
    method: 'DELETE',
  });
};

export const deleteSeller = async (id) => {
  return apiCall(`/admin/sellers/${id}`, {
    method: 'DELETE',
  });
};

export const deleteRider = async (id) => {
  return apiCall(`/admin/riders/${id}`, {
    method: 'DELETE',
  });
};

// ============= PRODUCT API =============

export const uploadProductImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`${API_BASE_URL}/admin/products/upload-image`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header, let browser set it with boundary
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || data.error || 'Upload failed');
      error.field = data.field;
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Upload multiple product images at once
export const uploadProductImages = async (files) => {
  const formData = new FormData();
  
  // Append all files to FormData
  files.forEach(file => {
    formData.append('images', file);
  });

  try {
    const response = await fetch(`${API_BASE_URL}/admin/products/upload-images`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header, let browser set it with boundary
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || data.error || 'Upload failed');
      error.field = data.field;
      throw error;
    }

    return data;
  } catch (error) {
    // Check if it's a network error
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      const networkError = new Error('Cannot connect to server. Please ensure the backend server is running on port 3000. Run "npm run dev" to start both servers.');
      console.error('Backend server connection failed. Make sure to run: npm run dev');
      throw networkError;
    }
    throw error;
  }
};

export const getProducts = async () => {
  return apiCall('/admin/products', {
    method: 'GET',
  });
};

export const createProduct = async (productData) => {
  return apiCall('/admin/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
};

export const updateProduct = async (id, productData) => {
  return apiCall(`/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  });
};

export const deleteProduct = async (id) => {
  return apiCall(`/admin/products/${id}`, {
    method: 'DELETE',
  });
};

// ============= ORDER API =============

export const getOrders = async () => {
  return adminApiCall('/admin/orders', {
    method: 'GET',
  });
};

export const getOrder = async (id) => {
  return adminApiCall(`/admin/orders/${id}`, {
    method: 'GET',
  });
};

export const createOrder = async (orderData) => {
  return adminApiCall('/admin/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
};

export const updateOrder = async (id, orderData) => {
  return adminApiCall(`/admin/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(orderData),
  });
};

export const deleteOrder = async (id) => {
  return adminApiCall(`/admin/orders/${id}`, {
    method: 'DELETE',
  });
};

export const updateOrderStatus = async (id, status) => {
  return adminApiCall(`/admin/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

// Buyer Orders (new system) - Admin functions
export const getAdminBuyerOrders = async (page = 1, limit = 20) => {
  return adminApiCall(`/admin/buyer-orders?page=${page}&limit=${limit}`, { method: 'GET' });
};

export const getAdminDeliveryPersons = async () => {
  return adminApiCall('/admin/delivery-persons', { method: 'GET' });
};

export const adminAssignDeliveryPerson = async (orderId, deliveryPersonId) => {
  return adminApiCall(`/admin/buyer-orders/${orderId}/assign-delivery`, {
    method: 'PUT',
    body: JSON.stringify({ deliveryPersonId })
  });
};

// ============= BUYER API =============

// Helper to get auth token
const getBuyerToken = () => {
  return localStorage.getItem('buyer_token') || sessionStorage.getItem('buyer_token');
};

// Buyer API call with authentication
const buyerApiCall = async (endpoint, options = {}) => {
  const token = getBuyerToken();
  
  return apiCall(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  });
};

// Profile
export const getBuyerProfile = async () => {
  return buyerApiCall('/buyer/profile', { method: 'GET' });
};

export const updateBuyerProfile = async (profileData) => {
  return buyerApiCall('/buyer/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  });
};

export const changeBuyerEmail = async (emailData) => {
  return buyerApiCall('/buyer/profile/email', {
    method: 'PUT',
    body: JSON.stringify(emailData)
  });
};

export const changeBuyerPassword = async (passwordData) => {
  return buyerApiCall('/buyer/profile/password', {
    method: 'PUT',
    body: JSON.stringify(passwordData)
  });
};

// Face Recognition
export const registerBuyerFace = async (faceDescriptor, faceImage) => {
  return buyerApiCall('/buyer/face/register', {
    method: 'POST',
    body: JSON.stringify({ faceDescriptor, faceImage })
  });
};

export const verifyBuyerFace = async (faceDescriptor) => {
  return buyerApiCall('/buyer/face/verify', {
    method: 'POST',
    body: JSON.stringify({ faceDescriptor })
  });
};

export const getBuyerFaceStatus = async () => {
  return buyerApiCall('/buyer/face/status', { method: 'GET' });
};

// Products
export const getBuyerProducts = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return buyerApiCall(`/buyer/products${queryString ? `?${queryString}` : ''}`, {
    method: 'GET'
  });
};

export const getBuyerProduct = async (id) => {
  return buyerApiCall(`/buyer/products/${id}`, { method: 'GET' });
};

// Cart
export const getBuyerCart = async () => {
  return buyerApiCall('/buyer/cart', { method: 'GET' });
};

export const addToCart = async (productId, quantity = 1) => {
  console.log('🔧 API addToCart called with:', { productId, quantity });
  const payload = { productId, quantity };
  console.log('📤 Sending payload:', JSON.stringify(payload));
  
  return buyerApiCall('/buyer/cart', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

export const updateCartItem = async (productId, quantity) => {
  return buyerApiCall(`/buyer/cart/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity })
  });
};

export const removeFromCart = async (productId) => {
  return buyerApiCall(`/buyer/cart/${productId}`, { method: 'DELETE' });
};

export const clearCart = async () => {
  return buyerApiCall('/buyer/cart', { method: 'DELETE' });
};

// Favorites
export const getBuyerFavorites = async () => {
  return buyerApiCall('/buyer/favorites', { method: 'GET' });
};

export const addToFavorites = async (productId) => {
  return buyerApiCall(`/buyer/favorites/${productId}`, { method: 'POST' });
};

export const removeFromFavorites = async (productId) => {
  return buyerApiCall(`/buyer/favorites/${productId}`, { method: 'DELETE' });
};

// Addresses
export const getBuyerAddresses = async () => {
  return buyerApiCall('/buyer/addresses', { method: 'GET' });
};

export const addBuyerAddress = async (addressData) => {
  return buyerApiCall('/buyer/addresses', {
    method: 'POST',
    body: JSON.stringify(addressData)
  });
};

export const updateBuyerAddress = async (id, addressData) => {
  return buyerApiCall(`/buyer/addresses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(addressData)
  });
};

export const deleteBuyerAddress = async (id) => {
  return buyerApiCall(`/buyer/addresses/${id}`, { method: 'DELETE' });
};

export const setDefaultAddress = async (id) => {
  return buyerApiCall(`/buyer/addresses/${id}/default`, { method: 'PUT' });
};

// Orders
export const getBuyerOrders = async (page = 1, limit = 20) => {
  return buyerApiCall(`/buyer/orders?page=${page}&limit=${limit}`, { method: 'GET' });
};

export const getBuyerOrder = async (id) => {
  return buyerApiCall(`/buyer/orders/${id}`, { method: 'GET' });
};

export const placeBuyerOrder = async (orderData) => {
  return buyerApiCall('/buyer/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  });
};

export const cancelBuyerOrder = async (id) => {
  return buyerApiCall(`/buyer/orders/${id}/cancel`, { method: 'PUT' });
};

// Reviews
export const submitOrderReviews = async (orderId, reviews) => {
  return buyerApiCall(`/buyer/orders/${orderId}/reviews`, {
    method: 'POST',
    body: JSON.stringify({ reviews })
  });
};

export const getBuyerReviews = async () => {
  return buyerApiCall('/buyer/reviews', { method: 'GET' });
};

export const updateReview = async (reviewId, reviewData) => {
  return buyerApiCall(`/buyer/reviews/${reviewId}`, {
    method: 'PUT',
    body: JSON.stringify(reviewData)
  });
};

export const deleteReview = async (reviewId) => {
  return buyerApiCall(`/buyer/reviews/${reviewId}`, { method: 'DELETE' });
};

export const getProductReviews = async (productId, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(`/public/products/${productId}/reviews${queryString ? `?${queryString}` : ''}`, {
    method: 'GET'
  });
};

export const getRecentReviews = async (limit = 10) => {
  return apiCall(`/public/reviews/recent?limit=${limit}`, { method: 'GET' });
};

// ============= SELLER API =============

// Helper to get seller auth token
const getSellerToken = () => {
  return localStorage.getItem('seller_token') || sessionStorage.getItem('seller_token');
};

// Seller API call with authentication
const sellerApiCall = async (endpoint, options = {}) => {
  const token = getSellerToken();
  
  return apiCall(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  });
};

// Profile
export const getSellerProfile = async () => {
  return sellerApiCall('/seller/profile', { method: 'GET' });
};

export const updateSellerProfile = async (profileData) => {
  return sellerApiCall('/seller/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  });
};

export const changeSellerEmail = async (emailData) => {
  return sellerApiCall('/seller/change-email', {
    method: 'PUT',
    body: JSON.stringify(emailData)
  });
};

export const changeSellerPassword = async (passwordData) => {
  return sellerApiCall('/seller/change-password', {
    method: 'PUT',
    body: JSON.stringify(passwordData)
  });
};

// Upload seller product images
export const uploadSellerProductImage = async (file) => {
  const token = getSellerToken();
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`${API_BASE_URL}/seller/products/upload-image`, {
      method: 'POST',
      body: formData,
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || data.error || 'Upload failed');
      error.field = data.field;
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const uploadSellerProductImages = async (files) => {
  const token = getSellerToken();
  const formData = new FormData();
  
  // Append all files to FormData
  files.forEach(file => {
    formData.append('images', file);
  });

  try {
    const response = await fetch(`${API_BASE_URL}/seller/products/upload-images`, {
      method: 'POST',
      body: formData,
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || data.error || 'Upload failed');
      error.field = data.field;
      throw error;
    }

    return data;
  } catch (error) {
    // Check if it's a network error
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      const networkError = new Error('Cannot connect to server. Please ensure the backend server is running on port 3000. Run "npm run dev" to start both servers.');
      console.error('Backend server connection failed. Make sure to run: npm run dev');
      throw networkError;
    }
    throw error;
  }
};

// Products
export const getSellerProducts = async () => {
  return sellerApiCall('/seller/products', { method: 'GET' });
};

export const addSellerProduct = async (productData) => {
  return sellerApiCall('/seller/products', {
    method: 'POST',
    body: JSON.stringify(productData)
  });
};

export const updateSellerProduct = async (productId, productData) => {
  return sellerApiCall(`/seller/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(productData)
  });
};

export const deleteSellerProduct = async (productId) => {
  return sellerApiCall(`/seller/products/${productId}`, { method: 'DELETE' });
};

// Orders
export const getSellerOrders = async (page = 1, limit = 20) => {
  return sellerApiCall(`/seller/orders?page=${page}&limit=${limit}`, { method: 'GET' });
};

export const updateSellerOrderStatus = async (orderId, status) => {
  return sellerApiCall(`/seller/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
};

// Statistics
export const getSellerStatistics = async () => {
  return sellerApiCall('/seller/statistics', { method: 'GET' });
};

// Delivery Persons
export const getAvailableDeliveryPersons = async () => {
  return sellerApiCall('/seller/delivery-persons', { method: 'GET' });
};

export const assignDeliveryPerson = async (orderId, deliveryPersonId) => {
  return sellerApiCall(`/seller/orders/${orderId}/assign-delivery`, {
    method: 'PUT',
    body: JSON.stringify({ deliveryPersonId })
  });
};

// ============= DELIVERY API =============

// Helper to get delivery auth token
const getDeliveryToken = () => {
  return localStorage.getItem('delivery_token') || sessionStorage.getItem('delivery_token');
};

// Delivery API call with authentication
const deliveryApiCall = async (endpoint, options = {}) => {
  const token = getDeliveryToken();
  
  return apiCall(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  });
};

// Profile
export const getDeliveryProfile = async () => {
  return deliveryApiCall('/delivery/profile', { method: 'GET' });
};

export const updateDeliveryProfile = async (profileData) => {
  return deliveryApiCall('/delivery/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  });
};

export const changeDeliveryEmail = async (emailData) => {
  return deliveryApiCall('/delivery/change-email', {
    method: 'PUT',
    body: JSON.stringify(emailData)
  });
};

export const changeDeliveryPassword = async (passwordData) => {
  return deliveryApiCall('/delivery/change-password', {
    method: 'PUT',
    body: JSON.stringify(passwordData)
  });
};

// Deliveries
export const getDeliveryAssignments = async (page = 1, limit = 20) => {
  return deliveryApiCall(`/delivery/deliveries?page=${page}&limit=${limit}`, { method: 'GET' });
};

export const acceptDelivery = async (orderId) => {
  return deliveryApiCall(`/delivery/deliveries/${orderId}/accept`, { method: 'POST' });
};

export const declineDelivery = async (orderId) => {
  return deliveryApiCall(`/delivery/deliveries/${orderId}/decline`, { method: 'POST' });
};

export const updateDeliveryStatus = async (orderId, status, proofOfDelivery = null, proofOfDeliveryImages = null) => {
  const body = { status };
  if (proofOfDelivery) {
    body.proofOfDelivery = proofOfDelivery;
  }
  if (proofOfDeliveryImages && proofOfDeliveryImages.length > 0) {
    body.proofOfDeliveryImages = proofOfDeliveryImages;
  }
  return deliveryApiCall(`/delivery/deliveries/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify(body)
  });
};

// Statistics
export const getDeliveryStatistics = async () => {
  return deliveryApiCall('/delivery/statistics', { method: 'GET' });
};

export const getDeliveryEarnings = async () => {
  return deliveryApiCall('/delivery/earnings', { method: 'GET' });
};

export const getDeliveryRoute = async (orderId) => {
  return deliveryApiCall(`/delivery/deliveries/${orderId}/route`, { method: 'GET' });
};

// ============= NOTIFICATION API =============

// Seller Notifications
export const getSellerNotifications = async (limit = 20, skip = 0) => {
  return sellerApiCall(`/seller/notifications?limit=${limit}&skip=${skip}`, { method: 'GET' });
};

export const getSellerUnreadCount = async () => {
  return sellerApiCall('/seller/notifications/unread-count', { method: 'GET' });
};

export const markSellerNotificationRead = async (notificationId) => {
  return sellerApiCall(`/seller/notifications/${notificationId}/read`, { method: 'PUT' });
};

export const markAllSellerNotificationsRead = async () => {
  return sellerApiCall('/seller/notifications/read-all', { method: 'PUT' });
};

export const deleteSellerNotification = async (notificationId) => {
  return sellerApiCall(`/seller/notifications/${notificationId}`, { method: 'DELETE' });
};

// Admin Notifications
export const getAdminNotifications = async (limit = 20, skip = 0) => {
  return adminApiCall(`/admin/notifications?limit=${limit}&skip=${skip}`, { method: 'GET' });
};

export const getAdminUnreadCount = async () => {
  return adminApiCall('/admin/notifications/unread-count', { method: 'GET' });
};

export const markAdminNotificationRead = async (notificationId) => {
  return adminApiCall(`/admin/notifications/${notificationId}/read`, { method: 'PUT' });
};

export const markAllAdminNotificationsRead = async () => {
  return adminApiCall('/admin/notifications/read-all', { method: 'PUT' });
};

export const deleteAdminNotification = async (notificationId) => {
  return adminApiCall(`/admin/notifications/${notificationId}`, { method: 'DELETE' });
};

// Delivery Notifications
export const getDeliveryNotifications = async (limit = 20, skip = 0) => {
  return deliveryApiCall(`/delivery/notifications?limit=${limit}&skip=${skip}`, { method: 'GET' });
};

export const getDeliveryUnreadCount = async () => {
  return deliveryApiCall('/delivery/notifications/unread-count', { method: 'GET' });
};

export const markDeliveryNotificationRead = async (notificationId) => {
  return deliveryApiCall(`/delivery/notifications/${notificationId}/read`, { method: 'PUT' });
};

export const markAllDeliveryNotificationsRead = async () => {
  return deliveryApiCall('/delivery/notifications/read-all', { method: 'PUT' });
};

export const deleteDeliveryNotification = async (notificationId) => {
  return deliveryApiCall(`/delivery/notifications/${notificationId}`, { method: 'DELETE' });
};

// ============= VALID ID UPLOAD API =============

// Seller Valid ID Upload
export const uploadSellerValidId = async (formData) => {
  const token = localStorage.getItem('seller_token') || sessionStorage.getItem('seller_token');
  
  const response = await fetch(`${API_BASE_URL}/seller/upload-valid-id`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData // Don't set Content-Type, let browser set it with boundary
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message || data.error || 'Upload failed');
    throw error;
  }
  return data;
};

// Delivery Valid ID Upload
export const uploadDeliveryValidId = async (formData) => {
  const token = localStorage.getItem('delivery_token') || sessionStorage.getItem('delivery_token');
  
  const response = await fetch(`${API_BASE_URL}/delivery/upload-valid-id`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message || data.error || 'Upload failed');
    throw error;
  }
  return data;
};

// Get Seller Approval Status
export const getSellerApprovalStatus = async () => {
  return sellerApiCall('/seller/approval-status', { method: 'GET' });
};

// Get Delivery Approval Status
export const getDeliveryApprovalStatus = async () => {
  return deliveryApiCall('/delivery/approval-status', { method: 'GET' });
};

// ============= ADMIN APPROVAL API =============

// Get Pending Approvals
export const getPendingApprovals = async (page = 1, limit = 10, type = null) => {
  const params = new URLSearchParams({ page, limit });
  if (type) params.append('type', type);
  return adminApiCall(`/admin/pending-approvals?${params.toString()}`, { method: 'GET' });
};

// Approve Seller
export const approveSeller = async (sellerId) => {
  return adminApiCall(`/admin/approve-seller/${sellerId}`, { method: 'PUT' });
};

// Decline Seller
export const declineSeller = async (sellerId, reason) => {
  return adminApiCall(`/admin/decline-seller/${sellerId}`, {
    method: 'PUT',
    body: JSON.stringify({ reason })
  });
};

// Approve Delivery
export const approveDelivery = async (deliveryId) => {
  return adminApiCall(`/admin/approve-delivery/${deliveryId}`, { method: 'PUT' });
};

// Decline Delivery Person (Admin)
export const declineDeliveryPerson = async (deliveryId, reason) => {
  return adminApiCall(`/admin/decline-delivery/${deliveryId}`, {
    method: 'PUT',
    body: JSON.stringify({ reason })
  });
};