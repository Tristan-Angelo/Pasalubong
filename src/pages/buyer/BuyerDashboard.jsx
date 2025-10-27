import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import DashboardSidebar from '../../components/DashboardSidebar';
import DashboardNavbar from '../../components/DashboardNavbar';
import ProfileSettings from '../../components/ProfileSettings';
import AccountSettings from '../../components/AccountSettings';
import AddressAutocomplete from '../../components/AddressAutocomplete';
import OpenStreetMapAutocomplete from '../../components/OpenStreetMapAutocomplete';
import ProductViewModal from '../../components/ProductViewModal';
import ProductCard from '../../components/ProductCard';
import ReviewModal from '../../components/ReviewModal';
import FaceCaptureModal from '../../components/FaceCaptureModal';
import LoadingProgressBar from '../../components/LoadingProgressBar';
import SkeletonLoader from '../../components/SkeletonLoader';
import useLazyDashboardData from '../../hooks/useLazyDashboardData';
import {
  getBuyerProfile,
  updateBuyerProfile,
  changeBuyerEmail,
  changeBuyerPassword,
  getBuyerProducts,
  getBuyerCart,
  addToCart as addToCartAPI,
  updateCartItem,
  removeFromCart as removeFromCartAPI,
  clearCart,
  getBuyerFavorites,
  addToFavorites,
  removeFromFavorites,
  getBuyerAddresses,
  addBuyerAddress,
  updateBuyerAddress,
  deleteBuyerAddress,
  setDefaultAddress,
  getBuyerOrders,
  placeBuyerOrder,
  submitOrderReviews
} from '../../utils/api';
import { getStatusChipColor, getStatusBackgroundColor, getStatusIcon, getDisplayStatus } from '../../utils/orderStatusStyles';

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('shop');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [capturedFaceData, setCapturedFaceData] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showTrackOrderModal, setShowTrackOrderModal] = useState(false);
  const [showFaceCaptureModal, setShowFaceCaptureModal] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [profileFormData, setProfileFormData] = useState({
    fullname: '',
    phone: '',
    birthday: '',
    photo: null
  });
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [newAddressData, setNewAddressData] = useState({
    label: '',
    address: '',
    city: '',
    barangay: '',
    postal: '',
    phone: '',
    isDefault: false
  });
  const [selectedAddressData, setSelectedAddressData] = useState(null);
  const [selectedDeliveryAddressId, setSelectedDeliveryAddressId] = useState(null);
  const [addressSearchTerm, setAddressSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [proofOfPaymentsBySeller, setProofOfPaymentsBySeller] = useState({});
  const [proofOfPaymentPreviewsBySeller, setProofOfPaymentPreviewsBySeller] = useState({});
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Address, 2: Payment, 3: Verification, 4: Review
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showProductViewModal, setShowProductViewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [ordersPagination, setOrdersPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    ordersPerPage: 10
  });
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const updateQuantityTimeoutRef = useRef({});

  // Define data loaders for each section
  const loadProductsData = useCallback(async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter) params.category = categoryFilter;
      if (sortBy) params.sortBy = sortBy;

      console.log('🔍 Fetching buyer products with params:', params);
      const response = await getBuyerProducts(params);
      console.log('📦 Buyer products response:', response);

      if (response.success) {
        setProducts(response.products);
        console.log(`✅ Loaded ${response.products.length} products`);
      } else {
        console.warn('⚠️ Products fetch returned success=false:', response);
      }
    } catch (error) {
      console.error('❌ Error loading products:', error);
      showToast(error.message || 'Failed to load products', 'error');
    }
  }, [searchTerm, categoryFilter, sortBy]);

  const loadCartData = useCallback(async () => {
    try {
      console.log('🛒 Fetching buyer cart...');
      const response = await getBuyerCart();
      console.log('📦 Cart response:', response);
      if (response.success) {
        setCart(response.cart);
        console.log(`✅ Loaded ${response.cart.length} cart items`);
      }
    } catch (error) {
      console.error('❌ Error loading cart:', error);
    }
  }, []);

  const loadFavoritesData = useCallback(async () => {
    try {
      console.log('⭐ Fetching buyer favorites...');
      const response = await getBuyerFavorites();
      console.log('📦 Favorites response:', response);
      if (response.success) {
        setFavorites(response.favorites);
        console.log(`✅ Loaded ${response.favorites.length} favorites`);
      }
    } catch (error) {
      console.error('❌ Error loading favorites:', error);
    }
  }, []);

  const loadAddressesData = useCallback(async () => {
    try {
      console.log('📍 Fetching buyer addresses...');
      const response = await getBuyerAddresses();
      console.log('📦 Addresses response:', response);
      if (response.success) {
        setAddresses(response.addresses);
        console.log(`✅ Loaded ${response.addresses.length} addresses`);
      }
    } catch (error) {
      console.error('❌ Error loading addresses:', error);
    }
  }, []);

  const loadOrdersData = useCallback(async (page = null) => {
    try {
      console.log('📦 Fetching buyer orders...');
      const currentPage = page !== null ? page : ordersPagination.currentPage;
      const response = await getBuyerOrders(currentPage, ordersPagination.ordersPerPage);
      console.log('📦 Orders response:', response);
      if (response.success) {
        setOrders(response.orders);
        if (response.pagination) {
          setOrdersPagination(response.pagination);
        }
        console.log(`✅ Loaded ${response.orders.length} orders`);
      }
    } catch (error) {
      console.error('❌ Error loading orders:', error);
    }
  }, [ordersPagination.currentPage, ordersPagination.ordersPerPage]);

  const loadProfileData = useCallback(async () => {
    try {
      console.log('👤 Fetching buyer profile...');
      const response = await getBuyerProfile();
      console.log('📦 Profile response:', response);
      if (response.success) {
        setProfile(response.profile);
        setProfileFormData({
          fullname: response.profile.fullname || '',
          phone: response.profile.phone || '',
          birthday: response.profile.birthday || '',
          photo: response.profile.photo || null
        });
        if (response.profile.photo) {
          setProfilePhotoPreview(response.profile.photo);
        }
        console.log('✅ Profile loaded successfully');
      }
    } catch (error) {
      console.error('❌ Error loading profile:', error);
      showToast(error.message || 'Failed to load profile', 'error');
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  // Define data loaders for each section
  // Keep this stable by not including it in dependencies of the hook
  const dataLoaders = {
    shop: [loadProductsData, loadCartData, loadFavoritesData],
    cart: [loadCartData],
    favorites: [loadFavoritesData, loadProductsData],
    orders: [loadOrdersData],
    addresses: [loadAddressesData],
    profile: [loadProfileData],
    'profile-settings': [loadProfileData],
    'account-settings': [loadProfileData],
    help: []
  };

  // Use lazy loading hook
  const { isLoading, isSectionLoaded, canRenderSection, canNavigate, reloadSection, initialLoadComplete, loadingRef } = useLazyDashboardData(
    activePage,
    dataLoaders
  );

  // Load profile on mount
  useEffect(() => {
    loadProfileData();
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('📊 Dashboard state:', {
      activePage,
      isLoading,
      initialLoadComplete,
      isSectionLoaded: isSectionLoaded(activePage),
      canRender: canRenderSection(activePage)
    });
  }, [activePage, isLoading, initialLoadComplete, isSectionLoaded, canRenderSection]);

  // Navigation handler - prevent navigation while loading
  const handleNavigate = useCallback((page) => {
    // Use ref for immediate check to prevent race conditions
    if (loadingRef.current || isLoading) {
      console.log('⏸️ Navigation blocked - loading in progress');
      return; // Prevent navigation while loading
    }
    console.log(`✅ Navigating to: ${page}`);
    setActivePage(page);
  }, [isLoading, loadingRef]);

  // Reload products when filters change
  const prevFiltersRef = useRef({ searchTerm, categoryFilter, sortBy });
  const isFirstRenderRef = useRef(true);
  
  useEffect(() => {
    // Skip on first render
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      prevFiltersRef.current = { searchTerm, categoryFilter, sortBy };
      return;
    }

    const filtersChanged = 
      prevFiltersRef.current.searchTerm !== searchTerm ||
      prevFiltersRef.current.categoryFilter !== categoryFilter ||
      prevFiltersRef.current.sortBy !== sortBy;

    if (filtersChanged) {
      console.log('🔄 Filters changed, reloading products...', { searchTerm, categoryFilter, sortBy });
      prevFiltersRef.current = { searchTerm, categoryFilter, sortBy };
      
      if (!isLoading && activePage === 'shop' && isSectionLoaded('shop')) {
        reloadSection('shop');
      }
    }
  }, [searchTerm, categoryFilter, sortBy]);

  // Auto-refresh orders every 30 seconds when on orders page
  useEffect(() => {
    if (activePage !== 'orders') return;

    const interval = setInterval(() => {
      // Only refresh if user is on orders page and not currently loading
      if (!loadingRef.current && !isLoading) {
        console.log('🔄 Auto-refreshing orders...');
        reloadSection('orders');
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [activePage]);


  const updateCartBadge = () => {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    return totalItems;
  };

  const addToCartHandler = async (productId) => {
    try {
      console.log('🛒 Adding to cart, productId:', productId);

      if (!productId) {
        showToast('Invalid product ID', 'error');
        return;
      }

      const product = products.find(p => p.id === productId);
      console.log('📦 Found product:', product);

      const response = await addToCartAPI(productId, 1);
      console.log('✅ Add to cart response:', response);

      if (response.success) {
        // Reload cart to ensure UI is in sync
        await loadCartData();
        showToast(`${product?.name || 'Product'} added to cart!`, 'success');
      }
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      showToast(error.message || 'Failed to add to cart', 'error');
    }
  };

  const toggleFavorite = async (productId) => {
    try {
      const isFavorite = favorites.includes(productId);

      if (isFavorite) {
        const response = await removeFromFavorites(productId);
        if (response.success) {
          // Reload favorites to ensure UI is in sync
          await loadFavoritesData();
          showToast('Removed from favorites', 'info');
        }
      } else {
        const response = await addToFavorites(productId);
        if (response.success) {
          // Reload favorites to ensure UI is in sync
          await loadFavoritesData();
          showToast('Added to favorites!', 'success');
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showToast(error.message || 'Failed to update favorites', 'error');
    }
  };

  const updateQuantity = async (productId, change) => {
    try {
      const item = cart.find(i => i.id === productId);
      if (!item) return;

      const newQuantity = item.quantity + change;
      if (newQuantity <= 0) {
        await removeFromCartHandler(productId);
        return;
      }

      // Optimistic update - update UI immediately
      setCart(prevCart => 
        prevCart.map(cartItem => 
          cartItem.id === productId 
            ? { ...cartItem, quantity: newQuantity }
            : cartItem
        )
      );

      // Clear any existing timeout for this product
      if (updateQuantityTimeoutRef.current[productId]) {
        clearTimeout(updateQuantityTimeoutRef.current[productId]);
      }

      // Debounce API call - only call after 800ms of no changes
      updateQuantityTimeoutRef.current[productId] = setTimeout(async () => {
        try {
          const response = await updateCartItem(productId, newQuantity);
          if (response.success) {
            // Reload cart to ensure UI is in sync with server
            await loadCartData();
          }
        } catch (error) {
          console.error('Error updating quantity:', error);
          showToast(error.message || 'Failed to update quantity', 'error');
          // Revert optimistic update on error
          await loadCartData();
        } finally {
          // Clean up timeout reference
          delete updateQuantityTimeoutRef.current[productId];
        }
      }, 800); // Wait 800ms after last change before syncing with server
    } catch (error) {
      console.error('Error updating quantity:', error);
      showToast(error.message || 'Failed to update quantity', 'error');
    }
  };

  const removeFromCartHandler = async (productId) => {
    try {
      const response = await removeFromCartAPI(productId);
      if (response.success) {
        // Reload cart to ensure UI is in sync
        await loadCartData();
        showToast('Item removed from cart', 'info');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      showToast(error.message || 'Failed to remove from cart', 'error');
    }
  };

  const placeOrder = async () => {
    if (cart.length === 0) {
      showToast('Your cart is empty!', 'error');
      return;
    }

    if (!capturedFaceData) {
      showToast('Please capture your face for verification', 'error');
      return;
    }

    // Validate Palawan Pay payment proof for all sellers
    if (paymentMethod === 'palawanpay') {
      const sellers = [...new Set(cart.map(item => item.seller || 'unknown'))];
      const missingProofs = sellers.filter(seller => !proofOfPaymentsBySeller[seller]);

      if (missingProofs.length > 0) {
        console.log('Missing proofs for sellers:', missingProofs);
        console.log('Available proofs:', Object.keys(proofOfPaymentsBySeller));
        showToast('Please upload proof of payment for all sellers', 'error');
        return;
      }
    }

    setIsPlacingOrder(true);

    // Use selected address or fall back to default/first address
    let deliveryAddress = null;
    if (selectedDeliveryAddressId) {
      deliveryAddress = addresses.find(addr => addr.id === selectedDeliveryAddressId);
    }

    // If no address selected, use primary profile address or first additional address
    if (!deliveryAddress) {
      deliveryAddress = addresses.find(addr => addr.isDefault) || addresses[0];
    }

    // If still no address, use profile address
    if (!deliveryAddress && profile) {
      deliveryAddress = {
        id: 'profile',
        address: `${profile.barangay ? `Barangay ${profile.barangay}, ` : ''}${profile.city}`,
        city: profile.city,
        phone: profile.phone
      };
    }

    if (!deliveryAddress) {
      showToast('Please add a delivery address', 'error');
      return;
    }

    try {
      const orderData = {
        items: cart,
        addressId: deliveryAddress.id,
        paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Palawan Pay',
        specialInstructions: '',
        faceVerification: capturedFaceData,
        proofOfPaymentsBySeller: paymentMethod === 'palawanpay' ? proofOfPaymentsBySeller : null
      };

      const response = await placeBuyerOrder(orderData);
      if (response.success) {
        setCapturedFaceData(null);
        setProofOfPaymentsBySeller({});
        setProofOfPaymentPreviewsBySeller({});
        setPaymentMethod('cod');
        setCheckoutStep(1); // Reset checkout step for next order
        setShowCheckoutModal(false);
        showToast('Order placed successfully!', 'success');
        // Reload both cart and orders to ensure UI is in sync
        await Promise.all([loadCartData(), loadOrdersData()]);
        setActivePage('orders');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      showToast(error.message || 'Failed to place order', 'error');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Use imported utility function
  const getStatusColor = getStatusChipColor;

  const showToast = (message, type = 'info') => {
    // Get or create toast container
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none';
      toastContainer.style.maxWidth = '400px';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    const bgColors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500',
      warning: 'bg-yellow-500'
    };

    const icons = {
      success: '✅',
      error: '❌',
      info: 'ℹ️',
      warning: '⚠️'
    };

    toast.className = `${bgColors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 pointer-events-auto transform transition-all duration-300 ease-out`;
    toast.style.animation = 'slideInRight 0.3s ease-out';
    toast.innerHTML = `
      <span>${icons[type]}</span>
      <span class="flex-1">${message}</span>
      <button onclick="this.parentElement.remove()" class="text-white hover:text-gray-200 transition-colors">✕</button>
    `;

    // Add animation styles if not already present
    if (!document.getElementById('toast-animations')) {
      const style = document.createElement('style');
      style.id = 'toast-animations';
      style.textContent = `
        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(400px);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    toastContainer.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
          toast.remove();
          // Remove container if empty
          if (toastContainer.children.length === 0) {
            toastContainer.remove();
          }
        }, 300);
      }
    }, 5000);
  };

  const handleSaveProfile = async () => {
    try {
      const dataToUpdate = { ...profileFormData };
      if (profilePhotoPreview && profilePhotoPreview !== profile?.photo) {
        dataToUpdate.photo = profilePhotoPreview;
      }
      const response = await updateBuyerProfile(dataToUpdate);
      if (response.success) {
        setProfile(response.profile);
        showToast('Profile updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast(error.message || 'Failed to update profile', 'error');
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file', 'error');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be less than 5MB', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordFormData.currentPassword || !passwordFormData.newPassword || !passwordFormData.confirmPassword) {
      showToast('Please fill in all password fields', 'error');
      return;
    }

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    if (passwordFormData.newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }

    try {
      const response = await changeBuyerPassword({
        currentPassword: passwordFormData.currentPassword,
        newPassword: passwordFormData.newPassword
      });

      if (response.success) {
        setPasswordFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        showToast('Password changed successfully!', 'success');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showToast(error.message || 'Failed to change password', 'error');
    }
  };

  const handleAddAddress = async () => {
    if (!newAddressData.label || !newAddressData.address || !newAddressData.phone) {
      showToast('Please fill in all required address fields', 'error');
      return;
    }

    try {
      const response = await addBuyerAddress(newAddressData);
      if (response.success) {
        await loadAddressesData();
        setShowAddAddressModal(false);
        setNewAddressData({
          label: '',
          address: '',
          city: '',
          barangay: '',
          postal: '',
          phone: '',
          isDefault: false
        });
        setSelectedAddressData(null);
        showToast('Address added successfully!', 'success');
      }
    } catch (error) {
      console.error('Error adding address:', error);
      showToast(error.message || 'Failed to add address', 'error');
    }
  };

  const handleAddressSelect = (addressData) => {
    setSelectedAddressData(addressData);
    // Auto-fill the form fields with selected address data
    setNewAddressData(prev => ({
      ...prev,
      city: addressData.city || prev.city,
      barangay: addressData.barangay || prev.barangay,
      postal: addressData.postalCode || prev.postal
    }));
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const response = await deleteBuyerAddress(addressId);
      if (response.success) {
        await loadAddressesData();
        showToast('Address deleted successfully!', 'success');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      showToast(error.message || 'Failed to delete address', 'error');
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 50;
  const totalAmount = cartTotal + deliveryFee;

  const renderShopPage = () => (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex flex-wrap gap-2 flex-1">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 rounded-xl border outline-none"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border"
          >
            <option value="">All Categories</option>
            <option value="Sweets">Sweets</option>
            <option value="Snacks">Snacks</option>
            <option value="Clothing">Clothing</option>
            <option value="Handicrafts">Handicrafts</option>
            <option value="Beverages">Beverages</option>
            <option value="Other">Other</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl border"
          >
            <option value="name">Sort by Name</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
        <button
          onClick={async () => {
            await reloadSection('shop');
            showToast('Products refreshed!', 'success');
          }}
          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-xl text-sm font-medium transition-colors"
          title="Refresh products"
        >
          🔄 Refresh Products
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🛍️</div>
          <h3 className="text-xl font-semibold mb-2">No Products Available</h3>
          <p className="text-gray-600 mb-4">There are currently no products in the shop.</p>
          <p className="text-sm text-gray-500">Please check back later or contact support if this issue persists.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCartHandler}
              isFavorite={favorites.includes(product.id)}
              onToggleFavorite={toggleFavorite}
              onClick={() => {
                setSelectedProduct(product);
                setShowProductViewModal(true);
              }}
            />
          ))}
        </div>
      )}
    </section>
  );

  const renderCartPage = () => (
    <section className="space-y-4">
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Shopping Cart</h2>
        {cart.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Your cart is empty</p>
            <button
              onClick={() => setActivePage('shop')}
              className="mt-2 text-rose-600 hover:underline"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-4 border rounded-xl">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-gray-600">₱{item.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCartHandler(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <h3 className="font-semibold mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₱{cartTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span>₱{deliveryFee}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>₱{totalAmount}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  // Set default selected address when opening checkout
                  const defaultAddr = addresses.find(addr => addr.isDefault) || addresses[0];
                  setSelectedDeliveryAddressId(defaultAddr ? defaultAddr.id : 'profile');
                  setShowCheckoutModal(true);
                }}
                className="w-full mt-4 bg-rose-500 hover:bg-rose-600 text-white py-3 px-4 rounded-lg btn-shine"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );

  const renderOrdersPage = () => {
    // Filter orders based on search term and status
    const filteredOrders = orders.filter(order => {
      const matchesSearch = !orderSearchTerm || 
        order.id?.toString().toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        order.orderNumber?.toString().toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        order.items?.some(item => item.name?.toLowerCase().includes(orderSearchTerm.toLowerCase()));
      
      const matchesStatus = !orderStatusFilter || order.status === orderStatusFilter;
      
      return matchesSearch && matchesStatus;
    });

    return (
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="text-lg font-semibold">My Orders ({ordersPagination.totalOrders})</h3>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Search orders..."
              value={orderSearchTerm}
              onChange={(e) => setOrderSearchTerm(e.target.value)}
              className="px-3 py-2 rounded-xl border outline-none"
            />
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Preparing">Preparing</option>
              <option value="Ready">Ready</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <button
              onClick={async () => {
                await reloadSection('orders');
                showToast('Orders refreshed!', 'success');
              }}
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm"
            >
              🔄 Refresh Orders
            </button>
          </div>
        </div>
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold mb-2">No Orders Found</h3>
              <p className="text-gray-600 mb-4">
                {orderSearchTerm || orderStatusFilter 
                  ? 'No orders match your search criteria. Try adjusting your filters.'
                  : 'You haven\'t placed any orders yet.'}
              </p>
              {(orderSearchTerm || orderStatusFilter) && (
                <button
                  onClick={() => {
                    setOrderSearchTerm('');
                    setOrderStatusFilter('');
                  }}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            filteredOrders.map(order => (
              <div
                key={order.id}
                className={`card p-4 hover-animate cursor-pointer hover:shadow-lg transition-shadow ${getStatusBackgroundColor(getDisplayStatus(order))}`}
              onClick={() => {
                setSelectedOrder(order);
                setShowTrackOrderModal(true);
              }}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold">Order #{order.id}</h3>
                  <p className="text-sm text-gray-600">{new Date(order.date).toLocaleDateString()}</p>
                  {order.deliveryPerson && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-900 mb-2">🚚 Delivery Person</p>
                      <div className="flex items-start gap-2">
                        {/* Delivery Person Photo */}
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-green-100 flex-shrink-0 border-2 border-green-300">
                          {order.deliveryPerson.photo ? (
                            <img
                              src={order.deliveryPerson.photo}
                              alt={order.deliveryPerson.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-green-600 text-lg font-semibold">
                              🚚
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-green-700 font-semibold">{order.deliveryPerson.name}</p>
                          <p className="text-xs text-green-700">📱 {order.deliveryPerson.phone}</p>
                          <p className="text-xs text-green-700">🚗 {order.deliveryPerson.vehicleType} ({order.deliveryPerson.vehiclePlate})</p>
                          <p className="text-xs text-green-700">📍 {order.deliveryStatus}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold">₱{order.total}</p>
                  <span className={`chip ${getStatusColor(getDisplayStatus(order))}`}>
                    {getStatusIcon(getDisplayStatus(order))} {getDisplayStatus(order)}
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-600 mb-3">
                {order.items.map(item => `${item.name} (${item.quantity}x)`).join(', ')}
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedOrder(order);
                    setShowTrackOrderModal(true);
                  }}
                  className="text-rose-600 hover:underline text-sm"
                >
                  View Details
                </button>
                {order.status === 'Delivered' && order.canReview !== false && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOrderForReview(order);
                      setShowReviewModal(true);
                    }}
                    className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                  >
                    ⭐ Rate Order
                  </button>
                )}
                {order.status === 'Delivered' && order.canReview === false && (
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-medium">
                    ✅ Reviewed
                  </span>
                )}
              </div>
            </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {ordersPagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 p-4 bg-white rounded-lg border">
            <div className="text-sm text-gray-600">
              Showing page {ordersPagination.currentPage} of {ordersPagination.totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  const newPage = ordersPagination.currentPage - 1;
                  setIsPaginationLoading(true);
                  setOrdersPagination(prev => ({ ...prev, currentPage: newPage }));
                  await loadOrdersData(newPage);
                  setIsPaginationLoading(false);
                }}
                disabled={ordersPagination.currentPage === 1 || isPaginationLoading}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  ordersPagination.currentPage === 1 || isPaginationLoading
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-rose-500 hover:bg-rose-600 text-white'
                }`}
              >
                ← Previous
              </button>
              <button
                onClick={async () => {
                  const newPage = ordersPagination.currentPage + 1;
                  setIsPaginationLoading(true);
                  setOrdersPagination(prev => ({ ...prev, currentPage: newPage }));
                  await loadOrdersData(newPage);
                  setIsPaginationLoading(false);
                }}
                disabled={ordersPagination.currentPage === ordersPagination.totalPages || isPaginationLoading}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  ordersPagination.currentPage === ordersPagination.totalPages || isPaginationLoading
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-rose-500 hover:bg-rose-600 text-white'
                }`}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </section>
    );
  };

  const renderFavoritesPage = () => (
    <section className="space-y-4">
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">My Favorites</h2>
        {favorites.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No favorites yet</p>
            <button
              onClick={() => setActivePage('shop')}
              className="mt-2 text-rose-600 hover:underline"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.filter(product => favorites.includes(product.id)).map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCartHandler}
                isFavorite={true}
                onToggleFavorite={toggleFavorite}
                onClick={() => {
                  setSelectedProduct(product);
                  setShowProductViewModal(true);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );

  const renderProfilePage = () => (
    <section className="space-y-4">
      <div className="card p-6 hover-animate">
        <h2 className="text-lg font-semibold mb-4">Profile Settings</h2>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full border-2 border-rose-500 overflow-hidden bg-rose-50 flex items-center justify-center">
            {profilePhotoPreview ? (
              <img
                src={profilePhotoPreview}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl text-rose-600 font-semibold">👤</span>
            )}
          </div>
          <div className="flex-1">
            <input
              type="file"
              id="photo-upload"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <label
              htmlFor="photo-upload"
              className="inline-flex items-center gap-2 bg-white border hover:bg-gray-50 py-2 px-4 rounded-lg text-sm cursor-pointer"
            >
              📷 Change Photo
            </label>
            <p className="text-xs text-gray-500 mt-2">
              JPG, PNG or GIF. Max size 5MB.
            </p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">Full Name</span>
            <input
              className="px-3 py-2 rounded-xl border"
              placeholder="Juan Dela Cruz"
              value={profileFormData.fullname}
              onChange={(e) => setProfileFormData({ ...profileFormData, fullname: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">Email</span>
            <input
              type="email"
              className="px-3 py-2 rounded-xl border bg-gray-50"
              value={profile?.email || ''}
              readOnly
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">Phone</span>
            <input
              className="px-3 py-2 rounded-xl border"
              placeholder="+63 900 000 0000"
              value={profileFormData.phone}
              onChange={(e) => setProfileFormData({ ...profileFormData, phone: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">Birthday</span>
            <input
              type="date"
              className="px-3 py-2 rounded-xl border"
              value={profileFormData.birthday}
              onChange={(e) => setProfileFormData({ ...profileFormData, birthday: e.target.value })}
            />
          </label>
        </div>
        <div className="mt-4">
          <button
            onClick={handleSaveProfile}
            className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded-lg btn-shine"
          >
            💾 Save Profile
          </button>
        </div>
      </div>
    </section>
  );

  const renderAddressesPage = () => (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Delivery Addresses</h2>
        <button
          onClick={() => setShowAddAddressModal(true)}
          className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded-lg btn-shine"
        >
          ➕ Add Address
        </button>
      </div>
      <div className="space-y-4">
        {/* Primary Registration Address */}
        {profile && (
          <div className="card p-4 hover-animate border-2 border-blue-200 bg-blue-50">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">Primary Address (Registration)</h3>
                  <span className="chip bg-blue-100 text-blue-800">📍 From Profile</span>
                </div>
                <p className="text-gray-700 text-sm mb-1">
                  {profile.barangay && `Barangay ${profile.barangay}, `}
                  {profile.city}
                </p>
                <p className="text-gray-700 text-sm">
                  {profile.province && `${profile.province}, `}
                  {profile.region}
                </p>
                <p className="text-gray-700 text-sm mt-1">📞 {profile.phone}</p>
              </div>
            </div>
            <div className="mt-2 p-2 bg-white rounded border border-blue-200">
              <p className="text-xs text-blue-700">
                <strong>Note:</strong> This is your primary address from registration. To update this address, please contact support or register a new account.
              </p>
            </div>
          </div>
        )}

        {/* Additional Delivery Addresses */}
        {addresses.length > 0 && (
          <>
            <div className="pt-2">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Additional Delivery Addresses</h3>
            </div>
            {addresses.map(address => (
              <div key={address.id} className="card p-4 hover-animate">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{address.label}</h3>
                      {address.isDefault && <span className="chip bg-rose-100 text-rose-800">Default</span>}
                    </div>
                    <p className="text-gray-600 text-sm mb-1">{address.address}</p>
                    <p className="text-gray-600 text-sm">{address.city} {address.postal}</p>
                    <p className="text-gray-600 text-sm">{address.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {addresses.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">No additional delivery addresses yet</p>
            <p className="text-sm">Click "Add Address" to create a new delivery address</p>
          </div>
        )}
      </div>
    </section>
  );

  const renderHelpPage = () => (
    <section className="space-y-4">
      <div className="card p-6 hover-animate">
        <h2 className="text-lg font-semibold mb-4">Help Center</h2>
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h3 className="font-medium mb-2">How to place an order?</h3>
            <p className="text-gray-600 text-sm">Browse products, add to cart, and proceed to checkout. You can track your order in the "My Orders" section.</p>
          </div>
          <div className="border-b pb-4">
            <h3 className="font-medium mb-2">Payment methods</h3>
            <p className="text-gray-600 text-sm">We accept cash on delivery, Palawan Pay, PayMaya, and major credit cards.</p>
          </div>
          <div className="border-b pb-4">
            <h3 className="font-medium mb-2">Delivery information</h3>
            <p className="text-gray-600 text-sm">Standard delivery takes 1-3 business days. Express delivery is available for same-day orders.</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Contact Support</h3>
            <p className="text-gray-600 text-sm">Email: support@pasalubong.com | Phone: +63 900 000 0000</p>
          </div>
        </div>
      </div>
    </section>
  );

  const handleProfileUpdate = async (updatedData) => {
    try {
      const response = await updateBuyerProfile(updatedData);
      if (response.success) {
        setProfile(response.profile);
        if (updatedData.photo) {
          setProfilePhotoPreview(updatedData.photo);
        }
        showToast('Profile updated successfully!', 'success');
      }
    } catch (error) {
      throw error;
    }
  };

  const handlePasswordUpdate = async (passwordData) => {
    try {
      const response = await changeBuyerPassword(passwordData);
      if (response.success) {
        showToast('Password updated successfully!', 'success');
      }
    } catch (error) {
      throw error;
    }
  };

  const handleEmailUpdate = async (emailData) => {
    try {
      const response = await changeBuyerEmail({
        newEmail: emailData.newEmail,
        password: emailData.password
      });
      if (response.success) {
        showToast(response.message || 'Email updated successfully!', 'success');
      }
    } catch (error) {
      throw error;
    }
  };

  const handlePhoneUpdate = async (phoneData) => {
    try {
      const response = await updateBuyerProfile({ phone: phoneData.newPhone });
      if (response.success) {
        setProfile(response.profile);
        showToast('Phone number updated successfully!', 'success');
      }
    } catch (error) {
      throw error;
    }
  };

  const handleSubmitReviews = async (reviews) => {
    if (!selectedOrderForReview) return;

    try {
      const response = await submitOrderReviews(selectedOrderForReview._id, reviews);
      if (response.success) {
        showToast('Reviews submitted successfully!', 'success');
        // Reload orders and products to update ratings
        await Promise.all([loadOrdersData(), loadProductsData()]);
        // Close modal after successful submission
        setShowReviewModal(false);
        setSelectedOrderForReview(null);
      }
    } catch (error) {
      console.error('Error submitting reviews:', error);
      showToast(error.message || 'Failed to submit reviews', 'error');
      // Re-throw error so ReviewModal can reset its state
      throw error;
    }
  };

  const renderCurrentPage = () => {
    // Don't render section content until data is loaded
    const canRender = canRenderSection(activePage);
    const sectionLoaded = isSectionLoaded(activePage);
    
    console.log('🎨 Render check:', { 
      activePage, 
      canRender, 
      sectionLoaded, 
      isLoading,
      initialLoadComplete 
    });
    
    if (!canRender) {
      console.log('⏳ Showing skeleton for:', activePage);
      return (
        <div className="space-y-6">
          {activePage === 'shop' && (
            <>
              <div className="h-12 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <SkeletonLoader variant="product-card" count={8} />
              </div>
            </>
          )}
          {activePage === 'cart' && (
            <>
              <div className="space-y-4">
                <SkeletonLoader variant="order-card" count={4} />
              </div>
            </>
          )}
          {activePage === 'orders' && (
            <>
              <div className="h-12 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-4">
                <SkeletonLoader variant="order-card" count={6} />
              </div>
            </>
          )}
          {activePage === 'favorites' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <SkeletonLoader variant="product-card" count={8} />
              </div>
            </>
          )}
          {activePage === 'addresses' && (
            <>
              <div className="h-12 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-4">
                <SkeletonLoader variant="card" count={3} />
              </div>
            </>
          )}
          {activePage === 'profile' && (
            <SkeletonLoader variant="profile" count={1} />
          )}
          {(activePage === 'profile-settings' || activePage === 'account-settings') && (
            <SkeletonLoader variant="profile" count={1} />
          )}
          {activePage === 'help' && (
            <SkeletonLoader variant="card" count={1} />
          )}
        </div>
      );
    }

    switch (activePage) {
      case 'shop':
        return renderShopPage();
      case 'cart':
        return renderCartPage();
      case 'orders':
        return renderOrdersPage();
      case 'favorites':
        return renderFavoritesPage();
      case 'profile':
        return renderProfilePage();
      case 'profile-settings':
        return (
          <ProfileSettings
            userType="buyer"
            userData={profile}
            onUpdate={handleProfileUpdate}
            onCancel={() => setActivePage('shop')}
          />
        );
      case 'account-settings':
        return (
          <AccountSettings
            userType="buyer"
            userData={profile}
            onUpdateEmail={handleEmailUpdate}
            onUpdatePhone={handlePhoneUpdate}
            onUpdatePassword={handlePasswordUpdate}
            onCancel={() => setActivePage('shop')}
          />
        );
      case 'addresses':
        return renderAddressesPage();
      case 'help':
        return renderHelpPage();
      default:
        return renderShopPage();
    }
  };

  const getPageTitle = () => {
    const titles = {
      shop: 'Shop',
      cart: 'Shopping Cart',
      orders: 'My Orders',
      favorites: 'My Favorites',
      profile: 'Profile Settings',
      'profile-settings': 'Profile Settings',
      'account-settings': 'Account Settings',
      addresses: 'Delivery Addresses',
      help: 'Help Center'
    };
    return titles[activePage] || 'Dashboard';
  };

  const handleLogout = () => {
    localStorage.removeItem('buyer_logged_in');
    localStorage.removeItem('buyer_user');
    localStorage.removeItem('buyer_email');
    localStorage.removeItem('buyer_token');
    sessionStorage.removeItem('buyer_logged_in');
    sessionStorage.removeItem('buyer_user');
    sessionStorage.removeItem('buyer_token');
    navigate('/buyer/login');
  };

  // Show loading state only while initial profile is being fetched
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="h-20 bg-white border-b border-gray-200 animate-pulse">
          <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
            <div className="h-8 bg-gray-200 rounded w-32"></div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="flex h-[calc(100vh-80px)]">
          <div className="w-64 bg-white border-r border-gray-200 p-4 space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
          <div className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <SkeletonLoader variant="product-card" count={8} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-800">
      {/* Loading Progress Bar */}
      <LoadingProgressBar isLoading={isLoading} />
      
      {/* Dashboard Navbar */}
      <DashboardNavbar
        userType="buyer"
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        userData={profile}
        cartCount={updateCartBadge()}
        onToggleSidebar={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <DashboardSidebar
          activePage={activePage}
          setActivePage={handleNavigate}
          userType="buyer"
          cartCount={updateCartBadge()}
          userData={profile}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          isLoading={isLoading}
        />

        {/* Main content */}
        <main className="flex-1 p-6 overflow-y-auto lg:ml-0">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 mt-12 lg:mt-0">{getPageTitle()}</h1>
            {renderCurrentPage()}
          </div>
        </main>
      </div>

      {/* Checkout Modal - Multi-Step */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Checkout</h2>
                <button
                  onClick={() => {
                    setShowCheckoutModal(false);
                    setCheckoutStep(1); // Reset to step 1 when closing
                    setAddressSearchTerm('');
                    setSpecialInstructions(''); // Also clear special instructions
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-between">
                {[
                  { num: 1, label: 'Address', icon: '📍' },
                  { num: 2, label: 'Payment', icon: '💳' },
                  { num: 3, label: 'Verify', icon: '🔒' },
                  { num: 4, label: 'Review', icon: '✓' }
                ].map((step, idx) => (
                  <React.Fragment key={step.num}>
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${checkoutStep === step.num
                          ? 'bg-rose-500 text-white scale-110'
                          : checkoutStep > step.num
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                        {checkoutStep > step.num ? '✓' : step.icon}
                      </div>
                      <span className={`text-xs mt-1 font-medium ${checkoutStep === step.num ? 'text-rose-600' : 'text-gray-500'
                        }`}>
                        {step.label}
                      </span>
                    </div>
                    {idx < 3 && (
                      <div className={`h-0.5 flex-1 mx-2 transition-all ${checkoutStep > step.num ? 'bg-green-500' : 'bg-gray-200'
                        }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Step 1: Address Selection */}
              {checkoutStep === 1 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Delivery Address</label>

                  {/* Search bar for addresses - only show if there are multiple addresses */}
                  {(addresses.length > 2 || (addresses.length > 1 && profile)) && (
                    <div className="mb-3">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search addresses by label, location, or phone..."
                          value={addressSearchTerm}
                          onChange={(e) => setAddressSearchTerm(e.target.value)}
                          className="w-full px-4 py-2 pl-10 rounded-xl border border-gray-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm"
                        />
                        <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                        {addressSearchTerm && (
                          <button
                            onClick={() => setAddressSearchTerm('')}
                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Selected Address Display - Show at top when search is active */}
                  {addressSearchTerm && selectedDeliveryAddressId && (
                    <div className="mb-3 p-3 bg-gradient-to-r from-rose-50 to-pink-50 border-2 border-rose-300 rounded-xl">
                      <div className="text-xs font-medium text-rose-700 mb-2 flex items-center gap-1">
                        <span>✓</span>
                        <span>SELECTED ADDRESS</span>
                      </div>
                      {selectedDeliveryAddressId === 'profile' && profile ? (
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">Primary Address (Registration)</span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Profile</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {profile.barangay && `Barangay ${profile.barangay}, `}
                            {profile.city}
                            {profile.province && `, ${profile.province}`}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">📞 {profile.phone}</p>
                        </div>
                      ) : (
                        (() => {
                          const selectedAddr = addresses.find(a => a.id === selectedDeliveryAddressId);
                          return selectedAddr ? (
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{selectedAddr.label}</span>
                                {selectedAddr.isDefault && (
                                  <span className="text-xs bg-rose-100 text-rose-800 px-2 py-0.5 rounded">Default</span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{selectedAddr.address}</p>
                              <p className="text-sm text-gray-600">
                                {selectedAddr.city} {selectedAddr.postal}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">📞 {selectedAddr.phone}</p>
                            </div>
                          ) : null;
                        })()
                      )}
                    </div>
                  )}

                  {/* Address List Container with max height */}
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {/* Primary Profile Address Option */}
                    {profile && (!addressSearchTerm ||
                      `Primary Address Registration ${profile.barangay} ${profile.city} ${profile.province} ${profile.phone}`.toLowerCase().includes(addressSearchTerm.toLowerCase())
                    ) && (
                        <div
                          onClick={() => setSelectedDeliveryAddressId('profile')}
                          className={`p-3 border-2 rounded-xl cursor-pointer transition-all ${selectedDeliveryAddressId === 'profile'
                              ? 'border-rose-500 bg-rose-50'
                              : 'border-gray-200 hover:border-rose-300'
                            }`}
                        >
                          <div className="flex items-start gap-2">
                            <input
                              type="radio"
                              name="deliveryAddress"
                              checked={selectedDeliveryAddressId === 'profile'}
                              onChange={() => setSelectedDeliveryAddressId('profile')}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">Primary Address (Registration)</span>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Profile</span>
                              </div>
                              <p className="text-sm text-gray-600">
                                {profile.barangay && `Barangay ${profile.barangay}, `}
                                {profile.city}
                                {profile.province && `, ${profile.province}`}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">📞 {profile.phone}</p>
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Additional Addresses - Filtered */}
                    {addresses.length > 0 && (() => {
                      const filteredAddresses = addressSearchTerm
                        ? addresses.filter(address =>
                          `${address.label} ${address.address} ${address.city} ${address.postal} ${address.phone}`.toLowerCase().includes(addressSearchTerm.toLowerCase())
                        )
                        : addresses;

                      return filteredAddresses.length > 0 ? (
                        filteredAddresses.map(address => (
                          <div
                            key={address.id}
                            onClick={() => setSelectedDeliveryAddressId(address.id)}
                            className={`p-3 border-2 rounded-xl cursor-pointer transition-all ${selectedDeliveryAddressId === address.id
                                ? 'border-rose-500 bg-rose-50'
                                : 'border-gray-200 hover:border-rose-300'
                              }`}
                          >
                            <div className="flex items-start gap-2">
                              <input
                                type="radio"
                                name="deliveryAddress"
                                checked={selectedDeliveryAddressId === address.id}
                                onChange={() => setSelectedDeliveryAddressId(address.id)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm">{address.label}</span>
                                  {address.isDefault && (
                                    <span className="text-xs bg-rose-100 text-rose-800 px-2 py-0.5 rounded">Default</span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">{address.address}</p>
                                <p className="text-sm text-gray-600">
                                  {address.city} {address.postal}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">📞 {address.phone}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-gray-500 border-2 border-dashed rounded-xl">
                          <p className="text-sm">No addresses match your search</p>
                          <button
                            onClick={() => setAddressSearchTerm('')}
                            className="text-rose-600 hover:underline text-sm mt-2"
                          >
                            Clear search
                          </button>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Show count of addresses */}
                  {(profile || addresses.length > 0) && (
                    <div className="mt-2 text-xs text-gray-500 text-center">
                      {addressSearchTerm ? (
                        <>
                          Showing {addresses.filter(a =>
                            `${a.label} ${a.address} ${a.city} ${a.postal} ${a.phone}`.toLowerCase().includes(addressSearchTerm.toLowerCase())
                          ).length + (profile && `Primary Address Registration ${profile.barangay} ${profile.city} ${profile.province} ${profile.phone}`.toLowerCase().includes(addressSearchTerm.toLowerCase()) ? 1 : 0)} of {addresses.length + (profile ? 1 : 0)} addresses
                        </>
                      ) : (
                        <>Total: {addresses.length + (profile ? 1 : 0)} address{addresses.length + (profile ? 1 : 0) !== 1 ? 'es' : ''}</>
                      )}
                    </div>
                  )}

                  {!profile && addresses.length === 0 && (
                    <div className="text-center py-4 text-gray-500 border-2 border-dashed rounded-xl">
                      <p className="text-sm">No delivery address available</p>
                      <button
                        onClick={() => {
                          setShowCheckoutModal(false);
                          setActivePage('addresses');
                        }}
                        className="text-rose-600 hover:underline text-sm mt-2"
                      >
                        Add an address
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Payment Method & Proof */}
              {checkoutStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg mb-4">Payment Details</h3>

                  <div>
                    <label className="block text-sm font-medium mb-2">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value);
                        // Clear proof of payment when switching methods
                        if (e.target.value === 'cod') {
                          setProofOfPaymentsBySeller({});
                          setProofOfPaymentPreviewsBySeller({});
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl border focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    >
                      <option value="cod">Cash on Delivery</option>
                      <option value="palawanpay">Palawan Pay</option>
                    </select>
                  </div>

                  {/* Palawan Pay Proof of Payment Section - Grouped by Seller */}
                  {paymentMethod === 'palawanpay' && (() => {
                    // Group cart items by seller
                    const itemsBySeller = cart.reduce((acc, item) => {
                      const sellerKey = item.seller || 'unknown';
                      if (!acc[sellerKey]) {
                        acc[sellerKey] = {
                          items: [],
                          sellerInfo: item.sellerInfo || {
                            businessName: 'Unknown Seller',
                            palawanPayNumber: '',
                            palawanPayName: ''
                          }
                        };
                      }
                      acc[sellerKey].items.push(item);
                      return acc;
                    }, {});

                    return (
                      <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                          <p className="text-xs text-blue-800 font-medium">
                            ℹ️ Your cart contains items from {Object.keys(itemsBySeller).length} seller{Object.keys(itemsBySeller).length > 1 ? 's' : ''}. Please send payment to each seller's Palawan Pay number and upload proof of payment for each.
                          </p>
                        </div>

                        {Object.entries(itemsBySeller).map(([sellerEmail, { items, sellerInfo }], index) => {
                          const sellerTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                          const hasProof = proofOfPaymentPreviewsBySeller[sellerEmail];

                          return (
                            <div key={sellerEmail} className="border rounded-xl p-4 bg-green-50 border-green-200">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="bg-green-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                  {index + 1}
                                </span>
                                <span className="text-sm font-medium text-gray-600">Seller {index + 1} of {Object.keys(itemsBySeller).length}</span>
                              </div>
                              <div className="mb-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-green-600">🏪</span>
                                    <span className="text-sm font-semibold text-green-900">{sellerInfo.businessName}</span>
                                  </div>
                                  <span className="text-sm font-bold text-green-800">₱{sellerTotal.toFixed(2)}</span>
                                </div>

                                {/* Items from this seller */}
                                <div className="bg-white rounded-lg p-2 mb-2">
                                  <p className="text-xs text-gray-600 mb-1">Items:</p>
                                  {items.map(item => (
                                    <div key={item.id} className="text-xs text-gray-700 flex justify-between">
                                      <span>• {item.name} (x{item.quantity})</span>
                                      <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>

                                {/* Palawan Pay Details */}
                                {sellerInfo.palawanPayNumber ? (
                                  <div className="bg-white rounded-lg p-3 border border-green-300">
                                    <p className="text-xs font-medium text-green-800 mb-1">Send payment to:</p>
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm font-bold text-green-900">{sellerInfo.palawanPayNumber}</p>
                                        {sellerInfo.palawanPayName && (
                                          <p className="text-xs text-gray-600">{sellerInfo.palawanPayName}</p>
                                        )}
                                      </div>
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(sellerInfo.palawanPayNumber);
                                          showToast('Palawan Pay number copied!', 'success');
                                        }}
                                        className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg"
                                      >
                                        Copy
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-2">
                                    <p className="text-xs text-yellow-800">⚠️ Seller hasn't set up Palawan Pay number yet. Please contact them directly.</p>
                                  </div>
                                )}
                              </div>

                              {/* Upload Proof */}
                              <div className="border-t border-green-300 pt-3">
                                <label className="text-xs font-medium text-green-800 mb-2 block">
                                  Upload Proof of Payment for {sellerInfo.businessName}
                                </label>

                                {hasProof ? (
                                  <div className="space-y-2">
                                    <div className="relative bg-white rounded-lg border border-green-200 p-2">
                                      <img
                                        src={proofOfPaymentPreviewsBySeller[sellerEmail]}
                                        alt="Proof of payment"
                                        className="w-full h-32 object-contain rounded-lg"
                                      />
                                      <button
                                        onClick={() => {
                                          const newProofs = { ...proofOfPaymentsBySeller };
                                          const newPreviews = { ...proofOfPaymentPreviewsBySeller };
                                          delete newProofs[sellerEmail];
                                          delete newPreviews[sellerEmail];
                                          setProofOfPaymentsBySeller(newProofs);
                                          setProofOfPaymentPreviewsBySeller(newPreviews);
                                        }}
                                        className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg text-xs"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-green-200">
                                      <span className="text-green-600 text-sm">✅</span>
                                      <span className="text-xs text-green-800 font-medium">Uploaded</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                          if (file.size > 5 * 1024 * 1024) {
                                            showToast('File size must be less than 5MB', 'error');
                                            return;
                                          }

                                          const reader = new FileReader();
                                          reader.onloadend = () => {
                                            console.log('Uploading proof for seller:', sellerEmail);
                                            setProofOfPaymentPreviewsBySeller(prev => {
                                              const updated = {
                                                ...prev,
                                                [sellerEmail]: reader.result
                                              };
                                              console.log('Updated previews:', Object.keys(updated));
                                              return updated;
                                            });
                                            setProofOfPaymentsBySeller(prev => {
                                              const updated = {
                                                ...prev,
                                                [sellerEmail]: reader.result
                                              };
                                              console.log('Updated proofs:', Object.keys(updated));
                                              return updated;
                                            });
                                            showToast(`Proof uploaded for ${sellerInfo.businessName}`, 'success');
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      }}
                                      className="hidden"
                                      id={`proof-upload-${sellerEmail}`}
                                    />
                                    <label
                                      htmlFor={`proof-upload-${sellerEmail}`}
                                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-xs cursor-pointer flex items-center justify-center gap-2 transition-colors"
                                    >
                                      <span>📤</span>
                                      <span>Upload Proof</span>
                                    </label>
                                    <p className="text-xs text-gray-600 mt-1 text-center">
                                      JPG, PNG (Max 5MB)
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Step 3: Face Verification */}
              {checkoutStep === 3 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg mb-4">Identity Verification</h3>

                  <div className="border rounded-xl p-4 bg-blue-50 border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-blue-600">🔒</span>
                      <label className="text-sm font-medium text-blue-800">Face Verification Required</label>
                    </div>

                    {capturedFaceData ? (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200">
                        <img src={capturedFaceData} alt="Captured face" className="w-20 h-20 rounded-full object-cover border-2 border-green-500" />
                        <div className="flex-1">
                          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-lg text-sm font-medium">
                            <span>✅</span>
                            <span>Face Captured Successfully</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">Identity verification ready</p>
                        </div>
                        <button
                          onClick={() => setCapturedFaceData(null)}
                          className="text-blue-600 hover:text-blue-800 text-sm underline"
                        >
                          Retake
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-blue-700 mb-3">Please capture your face for secure checkout verification to prevent fraud and ensure order authenticity.</p>
                        <button
                          onClick={() => setShowFaceCaptureModal(true)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm"
                        >
                          📷 Capture Face
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Special Instructions (Optional)</label>
                    <textarea
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border"
                      rows="3"
                      placeholder="Any special instructions for your order..."
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Review Order */}
              {checkoutStep === 4 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg mb-4">Review Your Order</h3>

                  {/* Selected Address */}
                  <div className="border rounded-xl p-4 bg-gray-50">
                    <h4 className="font-medium text-sm mb-2 text-gray-700">📍 Delivery Address</h4>
                    {selectedDeliveryAddressId === 'profile' && profile ? (
                      <div>
                        <p className="text-sm font-medium">Primary Address</p>
                        <p className="text-sm text-gray-600">
                          {profile.barangay && `Barangay ${profile.barangay}, `}
                          {profile.city}
                          {profile.province && `, ${profile.province}`}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">📞 {profile.phone}</p>
                      </div>
                    ) : (() => {
                      const selectedAddr = addresses.find(a => a.id === selectedDeliveryAddressId);
                      return selectedAddr ? (
                        <div>
                          <p className="text-sm font-medium">{selectedAddr.label}</p>
                          <p className="text-sm text-gray-600">{selectedAddr.address}</p>
                          <p className="text-sm text-gray-600">{selectedAddr.city} {selectedAddr.postal}</p>
                          <p className="text-xs text-gray-500 mt-1">📞 {selectedAddr.phone}</p>
                        </div>
                      ) : <p className="text-sm text-gray-500">No address selected</p>;
                    })()}
                  </div>

                  {/* Payment Method */}
                  <div className="border rounded-xl p-4 bg-gray-50">
                    <h4 className="font-medium text-sm mb-2 text-gray-700">💳 Payment Method</h4>
                    <p className="text-sm">{paymentMethod === 'cod' ? 'Cash on Delivery' : 'Palawan Pay'}</p>

                    {paymentMethod === 'palawanpay' && (() => {
                      const itemsBySeller = cart.reduce((acc, item) => {
                        const sellerKey = item.seller || 'unknown';
                        if (!acc[sellerKey]) {
                          acc[sellerKey] = {
                            items: [],
                            sellerInfo: item.sellerInfo || {
                              businessName: 'Unknown Seller',
                              palawanPayNumber: '',
                              palawanPayName: ''
                            }
                          };
                        }
                        acc[sellerKey].items.push(item);
                        return acc;
                      }, {});

                      return (
                        <div className="mt-3 space-y-2">
                          {Object.entries(itemsBySeller).map(([sellerEmail, { sellerInfo }]) => (
                            <div key={sellerEmail} className="flex items-center gap-2 text-xs bg-white p-2 rounded-lg">
                              <span className={proofOfPaymentPreviewsBySeller[sellerEmail] ? 'text-green-600' : 'text-yellow-600'}>
                                {proofOfPaymentPreviewsBySeller[sellerEmail] ? '✅' : '⚠️'}
                              </span>
                              <span className="flex-1">{sellerInfo.businessName}</span>
                              <span className="text-gray-500">
                                {proofOfPaymentPreviewsBySeller[sellerEmail] ? 'Proof uploaded' : 'No proof'}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Cart Items Summary */}
                  <div className="border rounded-xl p-4 bg-gray-50">
                    <h4 className="font-medium text-sm mb-3 text-gray-700">🛒 Order Items ({cart.length})</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {cart.map(item => (
                        <div key={item.id} className="flex items-center gap-3 bg-white p-2 rounded-lg">
                          <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.name}</p>
                            <p className="text-xs text-gray-500">x{item.quantity}</p>
                          </div>
                          <p className="text-sm font-semibold">₱{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Face Verification Status */}
                  <div className="border rounded-xl p-4 bg-gray-50">
                    <h4 className="font-medium text-sm mb-2 text-gray-700">🔒 Verification</h4>
                    <div className="flex items-center gap-2">
                      {capturedFaceData ? (
                        <>
                          <img src={capturedFaceData} alt="Face" className="w-12 h-12 rounded-full object-cover border-2 border-green-500" />
                          <span className="text-sm text-green-600 font-medium">✅ Face verified</span>
                        </>
                      ) : (
                        <span className="text-sm text-red-600">❌ Face not captured</span>
                      )}
                    </div>
                  </div>

                  {specialInstructions && (
                    <div className="border rounded-xl p-4 bg-gray-50">
                      <h4 className="font-medium text-sm mb-2 text-gray-700">📝 Special Instructions</h4>
                      <p className="text-sm text-gray-600">{specialInstructions}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer with Navigation */}
            <div className="border-t p-6 bg-gray-50">
              {checkoutStep < 4 ? (
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setCheckoutStep(prev => Math.max(1, prev - 1))}
                    disabled={checkoutStep === 1}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${checkoutStep === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                  >
                    ← Back
                  </button>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-rose-600">₱{totalAmount}</p>
                  </div>

                  <button
                    onClick={() => {
                      // Validation for each step
                      if (checkoutStep === 1) {
                        if (!selectedDeliveryAddressId) {
                          showToast('Please select a delivery address', 'error');
                          return;
                        }
                      } else if (checkoutStep === 2) {
                        if (paymentMethod === 'palawanpay') {
                          const sellers = [...new Set(cart.map(item => item.seller || 'unknown'))];
                          const missingProofs = sellers.filter(seller => !proofOfPaymentsBySeller[seller]);
                          if (missingProofs.length > 0) {
                            showToast('Please upload proof of payment for all sellers', 'error');
                            return;
                          }
                        }
                      } else if (checkoutStep === 3) {
                        if (!capturedFaceData) {
                          showToast('Please capture your face for verification', 'error');
                          return;
                        }
                      }
                      setCheckoutStep(prev => Math.min(4, prev + 1));
                    }}
                    className="px-6 py-2 rounded-lg font-medium bg-rose-500 hover:bg-rose-600 text-white transition-colors"
                  >
                    Continue →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-rose-600">₱{totalAmount}</span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCheckoutStep(3)}
                      className="flex-1 px-6 py-3 rounded-lg font-medium bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={placeOrder}
                      disabled={isPlacingOrder}
                      className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                        isPlacingOrder
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-rose-500 hover:bg-rose-600 btn-shine'
                      } text-white`}
                    >
                      {isPlacingOrder ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="animate-spin">⏳</span>
                          Processing Order...
                        </span>
                      ) : (
                        'Place Order'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {/* Track Order Modal */}
      {showTrackOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Track Order</h2>
                <button
                  onClick={() => setShowTrackOrderModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold">Order #{selectedOrder.id}</h3>
                    <p className="text-sm text-gray-600">Placed on {new Date(selectedOrder.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₱{selectedOrder.total}</p>
                    <span className={`chip ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</span>
                  </div>
                </div>
              </div>

              {/* Seller Status Breakdown */}
              {selectedOrder.sellerStatus && selectedOrder.sellerStatus.length > 0 && (
                <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h4 className="font-medium text-sm mb-3 text-blue-900">Seller Progress</h4>
                  <div className="space-y-2">
                    {selectedOrder.sellerStatus.map((sellerStat, idx) => {
                      const sellerItems = selectedOrder.items?.filter(item => item.seller === sellerStat.seller) || [];
                      const sellerName = sellerItems[0]?.sellerInfo?.businessName || sellerStat.seller;
                      return (
                        <div key={idx} className="flex items-center justify-between bg-white p-2 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">🏪</span>
                            <span className="text-sm font-medium">{sellerName}</span>
                          </div>
                          <span className={`chip text-xs ${getStatusColor(sellerStat.status)}`}>
                            {sellerStat.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tracking Progress with Timestamps */}
              <div className="space-y-4">
                {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 ? (
                  selectedOrder.statusHistory.map((history, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0">
                        ✓
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{history.status}</h4>
                          <span className="text-sm text-gray-500">
                            {new Date(history.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Status updated by {history.updatedBy}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  // Fallback to old timeline if no history
                  <>
                    <div className={`flex items-center gap-4 ${['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'].includes(selectedOrder.status) ? '' : 'opacity-50'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${['Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'].includes(selectedOrder.status) ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                        {['Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'].includes(selectedOrder.status) ? '✓' : '⏳'}
                      </div>
                      <div>
                        <h4 className="font-medium">Order Placed</h4>
                        <p className="text-sm text-gray-600">Your order has been received</p>
                        {selectedOrder.date && (
                          <p className="text-xs text-gray-500">{new Date(selectedOrder.date).toLocaleString()}</p>
                        )}
                      </div>
                    </div>

                    <div className={`flex items-center gap-4 ${['Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'].includes(selectedOrder.status) ? '' : 'opacity-50'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${['Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'].includes(selectedOrder.status) ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                        {['Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'].includes(selectedOrder.status) ? '✓' : '📋'}
                      </div>
                      <div>
                        <h4 className="font-medium">Order Confirmed</h4>
                        <p className="text-sm text-gray-600">Seller has confirmed your order</p>
                      </div>
                    </div>

                    <div className={`flex items-center gap-4 ${['Preparing', 'Out for Delivery', 'Delivered'].includes(selectedOrder.status) ? '' : 'opacity-50'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${selectedOrder.status === 'Preparing' ? 'bg-blue-500 text-white animate-pulse' : ['Out for Delivery', 'Delivered'].includes(selectedOrder.status) ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                        {['Out for Delivery', 'Delivered'].includes(selectedOrder.status) ? '✓' : '🍳'}
                      </div>
                      <div>
                        <h4 className="font-medium">Preparing</h4>
                        <p className="text-sm text-gray-600">Your order is being prepared</p>
                      </div>
                    </div>

                    <div className={`flex items-center gap-4 ${['Out for Delivery', 'Delivered'].includes(selectedOrder.status) ? '' : 'opacity-50'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${selectedOrder.status === 'Out for Delivery' ? 'bg-purple-500 text-white animate-pulse' : selectedOrder.status === 'Delivered' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                        {selectedOrder.status === 'Delivered' ? '✓' : '🚚'}
                      </div>
                      <div>
                        <h4 className="font-medium">Out for Delivery</h4>
                        <p className="text-sm text-gray-600">Your order is on the way</p>
                      </div>
                    </div>

                    <div className={`flex items-center gap-4 ${selectedOrder.status === 'Delivered' ? '' : 'opacity-50'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${selectedOrder.status === 'Delivered' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                        {selectedOrder.status === 'Delivered' ? '✓' : '📦'}
                      </div>
                      <div>
                        <h4 className="font-medium">Delivered</h4>
                        <p className="text-sm text-gray-600">Order delivered successfully</p>
                      </div>
                    </div>

                    {selectedOrder.status === 'Cancelled' && (
                      <div className="flex items-center gap-4 p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-sm">✕</div>
                        <div>
                          <h4 className="font-medium text-red-900">Order Cancelled</h4>
                          <p className="text-sm text-red-700">This order has been cancelled</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Order Items */}
              <div className="mt-6 border-t pt-4">
                <h4 className="font-medium mb-3">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                      <span>{item.name} x{item.quantity}</span>
                      <span className="font-semibold">₱{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Proof of Payment */}
              {selectedOrder.proofOfPayment && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-3">Proof of Payment</h3>
                  <img
                    src={selectedOrder.proofOfPayment}
                    alt="Proof of payment"
                    className="w-full max-h-64 object-contain rounded-lg border"
                  />
                </div>
              )}

              {/* Proof of Delivery */}
              {(selectedOrder.proofOfDeliveryImages?.length > 0 || selectedOrder.proofOfDelivery) && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-3">Proof of Delivery</h3>
                  {selectedOrder.proofOfDeliveryImages?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedOrder.proofOfDeliveryImages.map((image, index) => (
                        <div key={index} className="space-y-2">
                          <p className="text-xs text-gray-600 font-medium">
                            Photo {index + 1}: {index === 0 ? 'Package/Product' : 'Delivery Location'}
                          </p>
                          <img
                            src={image}
                            alt={`Proof of delivery ${index + 1}`}
                            className="w-full h-48 object-contain rounded-lg border"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <img
                      src={selectedOrder.proofOfDelivery}
                      alt="Proof of delivery"
                      className="w-full max-h-64 object-contain rounded-lg border"
                    />
                  )}
                  {selectedOrder.deliveredAt && (
                    <p className="text-sm text-gray-600 mt-3">
                      Delivered on: {new Date(selectedOrder.deliveredAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Face Capture Modal */}
      <FaceCaptureModal
        isOpen={showFaceCaptureModal}
        onClose={() => setShowFaceCaptureModal(false)}
        onCapture={(imageData) => {
          setCapturedFaceData(imageData);
          showToast('Face captured successfully!', 'success');
        }}
      />

      {/* Add Address Modal */}
      {showAddAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Add New Address</h2>
                <button
                  onClick={() => setShowAddAddressModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Address Label</label>
                  <input
                    className="w-full px-3 py-2 rounded-xl border"
                    placeholder="Home, Office, etc."
                    value={newAddressData.label}
                    onChange={(e) => setNewAddressData({ ...newAddressData, label: e.target.value })}
                  />
                </div>

                <OpenStreetMapAutocomplete
                  label="Search Full Address"
                  value={newAddressData.address}
                  onChange={(value) => setNewAddressData({ ...newAddressData, address: value })}
                  onSelectAddress={handleAddressSelect}
                  placeholder="Type street, barangay, city... (e.g., Ilang-ilang Batasan Hills Quezon)"
                  required
                />

                {selectedAddressData && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs text-green-700 font-medium mb-1">✅ Address Selected</p>
                    <div className="text-xs text-gray-600 space-y-1">
                      {selectedAddressData.street && <p>Street: {selectedAddressData.street}</p>}
                      {selectedAddressData.barangay && <p>Barangay: {selectedAddressData.barangay}</p>}
                      {selectedAddressData.city && <p>City: {selectedAddressData.city}</p>}
                      {selectedAddressData.province && <p>Province: {selectedAddressData.province}</p>}
                      {selectedAddressData.postalCode && <p>Postal: {selectedAddressData.postalCode}</p>}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">City</label>
                    <input
                      className="w-full px-3 py-2 rounded-xl border bg-gray-50"
                      placeholder="Auto-filled from search"
                      value={newAddressData.city}
                      onChange={(e) => setNewAddressData({ ...newAddressData, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Barangay</label>
                    <input
                      className="w-full px-3 py-2 rounded-xl border bg-gray-50"
                      placeholder="Auto-filled from search"
                      value={newAddressData.barangay}
                      onChange={(e) => setNewAddressData({ ...newAddressData, barangay: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Postal Code</label>
                  <input
                    className="w-full px-3 py-2 rounded-xl border bg-gray-50"
                    placeholder="Auto-filled from search"
                    value={newAddressData.postal}
                    onChange={(e) => setNewAddressData({ ...newAddressData, postal: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Contact Number</label>
                  <input
                    className="w-full px-3 py-2 rounded-xl border"
                    placeholder="+63 900 000 0000"
                    value={newAddressData.phone}
                    onChange={(e) => setNewAddressData({ ...newAddressData, phone: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={newAddressData.isDefault}
                    onChange={(e) => setNewAddressData({ ...newAddressData, isDefault: e.target.checked })}
                  />
                  <label className="text-sm">Set as default address</label>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700">
                    💡 <strong>Tip:</strong> Type at least 3 characters to search. The system will auto-fill city, barangay, and postal code from OpenStreetMap.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAddAddressModal(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddAddress}
                    className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded-lg"
                  >
                    Save Address
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product View Modal */}
      <ProductViewModal
        isOpen={showProductViewModal}
        onClose={() => {
          setShowProductViewModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onAddToCart={addToCartHandler}
        isFavorite={selectedProduct ? favorites.includes(selectedProduct.id) : false}
        onToggleFavorite={toggleFavorite}
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedOrderForReview(null);
        }}
        order={selectedOrderForReview}
        onSubmit={handleSubmitReviews}
        userProfile={profile}
      />

      {/* Loading Progress Bar */}
      <LoadingProgressBar isLoading={isLoading || isPaginationLoading} />
    </div>
  );
};

export default BuyerDashboard;
