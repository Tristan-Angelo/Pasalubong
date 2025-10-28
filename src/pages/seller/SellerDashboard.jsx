import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import DashboardSidebar from '../../components/DashboardSidebar';
import DashboardNavbar from '../../components/DashboardNavbar';
import ProductModal from '../../components/admin/ProductModal';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import ProfileSettings from '../../components/ProfileSettings';
import AccountSettings from '../../components/AccountSettings';
import DeliveryPersonAutocomplete from '../../components/DeliveryPersonAutocomplete';
import LoadingProgressBar from '../../components/LoadingProgressBar';
import SkeletonLoader from '../../components/SkeletonLoader';
import useLazyDashboardData from '../../hooks/useLazyDashboardData';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  getSellerProfile,
  updateSellerProfile,
  changeSellerEmail,
  changeSellerPassword,
  getSellerProducts,
  addSellerProduct,
  updateSellerProduct,
  deleteSellerProduct,
  getSellerOrders,
  updateSellerOrderStatus,
  getSellerStatistics,
  getAvailableDeliveryPersons,
  assignDeliveryPerson
} from '../../utils/api';
import { getStatusChipColor, getStatusBackgroundColor, getStatusIcon, getDisplayStatus } from '../../utils/orderStatusStyles';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState(null);
  const [statistics, setStatistics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeProducts: 0,
    pendingOrders: 0
  });
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    stock: ''
  });
  const [productErrors, setProductErrors] = useState({});
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [profileFormData, setProfileFormData] = useState({
    businessName: '',
    ownerName: '',
    phone: '',
    palawanPayNumber: '',
    palawanPayName: '',
    businessType: '',
    photo: null
  });
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [updatingOrder, setUpdatingOrder] = useState({ id: null, action: null });
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [showAssignDeliveryModal, setShowAssignDeliveryModal] = useState(false);
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState(null);
  const [selectedDeliveryPersonId, setSelectedDeliveryPersonId] = useState('');
  const [isAssigningDelivery, setIsAssigningDelivery] = useState(false);
  const [showOrderTrackingModal, setShowOrderTrackingModal] = useState(false);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState(null);
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

  // Define data loaders for each section
  const loadProfile = useCallback(async () => {
    try {
      const response = await getSellerProfile();
      if (response.success) {
        setProfile(response.profile);
        setProfileFormData({
          businessName: response.profile.businessName || '',
          ownerName: response.profile.ownerName || '',
          phone: response.profile.phone || '',
          palawanPayNumber: response.profile.palawanPayNumber || '',
          palawanPayName: response.profile.palawanPayName || '',
          businessType: response.profile.businessType || '',
          photo: response.profile.photo || null
        });
        if (response.profile.photo) {
          setProfilePhotoPreview(response.profile.photo);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      const response = await getSellerProducts();
      if (response.success) {
        setProducts(response.products);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }, []);

  const loadOrders = useCallback(async (page = null) => {
    try {
      const currentPage = page !== null ? page : ordersPagination.currentPage;
      const response = await getSellerOrders(currentPage, ordersPagination.ordersPerPage);
      if (response.success) {
        setOrders(response.orders);
        if (response.pagination) {
          setOrdersPagination(response.pagination);
        }
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  }, [ordersPagination.currentPage, ordersPagination.ordersPerPage]);

  const loadStatistics = useCallback(async () => {
    try {
      const response = await getSellerStatistics();
      if (response.success) {
        setStatistics(response.statistics);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  }, []);

  const loadDeliveryPersons = useCallback(async () => {
    try {
      const response = await getAvailableDeliveryPersons();
      if (response.success) {
        // API already filters for available (isAvailable === true) and active (isActive === true) delivery persons
        setDeliveryPersons(response.deliveryPersons);
      }
    } catch (error) {
      console.error('Error loading delivery persons:', error);
    }
  }, []);

  // Define data loaders for each section
  const dataLoaders = useMemo(() => ({
    dashboard: [loadStatistics, loadOrders],
    orders: [loadOrders, loadStatistics],
    products: [loadProducts, loadStatistics],
    analytics: [loadOrders, loadStatistics],
    'profile-settings': [loadProfile],
    'account-settings': [loadProfile],
    profile: [loadProfile]
  }), [loadStatistics, loadOrders, loadProducts, loadProfile]);

  // Use lazy loading hook
  const { isLoading, isSectionLoaded, canRenderSection, canNavigate, reloadSection, initialLoadComplete, loadingRef } = useLazyDashboardData(
    activePage,
    dataLoaders
  );

  // Navigation handler - prevent navigation while loading
  const handleNavigate = useCallback((page) => {
    // Use ref for immediate check to prevent race conditions
    if (loadingRef.current || isLoading) {
      console.log('⏸️ Navigation blocked - loading in progress');
      return;
    }
    console.log(`✅ Navigating to: ${page}`);
    setActivePage(page);
  }, [isLoading, loadingRef]);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  // Load delivery persons once on mount (lightweight)
  useEffect(() => {
    loadDeliveryPersons();
  }, [loadDeliveryPersons]);

  // Auto-refresh orders and statistics every 30 seconds (only if section is loaded)
  useEffect(() => {
    const interval = setInterval(() => {
      // Only refresh if user is on dashboard or orders page and data is already loaded
      if ((activePage === 'dashboard' || activePage === 'orders') && isSectionLoaded(activePage)) {
        loadOrders();
        loadStatistics();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [activePage, isSectionLoaded, loadOrders, loadStatistics]);

  const handleAssignDelivery = async () => {
    if (!selectedDeliveryPersonId) {
      showToast('Please select a delivery person', 'warning');
      return;
    }

    setIsAssigningDelivery(true);
    try {
      const response = await assignDeliveryPerson(selectedOrderForDelivery.id, selectedDeliveryPersonId);
      if (response.success) {
        showToast('Delivery person assigned successfully!', 'success');
        setShowAssignDeliveryModal(false);
        setSelectedOrderForDelivery(null);
        setSelectedDeliveryPersonId('');
        await loadOrders();
      }
    } catch (error) {
      console.error('Error assigning delivery person:', error);
      showToast(error.message || 'Failed to assign delivery person', 'error');
    } finally {
      setIsAssigningDelivery(false);
    }
  };

  const showToast = (message, type = 'info') => {
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

    toast.className = `fixed top-4 right-4 z-50 ${bgColors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 max-w-sm`;
    toast.innerHTML = `
      <span>${icons[type]}</span>
      <span class="flex-1">${message}</span>
      <button onclick="this.parentElement.remove()" class="text-white hover:text-gray-200">✕</button>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 5000);
  };

  const validateProductForm = () => {
    const newErrors = {};

    if (!newProduct.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!newProduct.category) {
      newErrors.category = 'Category is required';
    }
    if (!newProduct.price || newProduct.price <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (newProduct.stock === '' || newProduct.stock < 0) {
      newErrors.stock = 'Valid stock quantity is required';
    }

    setProductErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setProductErrors(prev => ({
          ...prev,
          image: 'Only image files are allowed (jpeg, jpg, png, gif, webp)'
        }));
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setProductErrors(prev => ({
          ...prev,
          image: 'Image size must be less than 5MB'
        }));
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Clear error
      if (productErrors.image) {
        setProductErrors(prev => ({
          ...prev,
          image: ''
        }));
      }
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setNewProduct(prev => ({
      ...prev,
      image: ''
    }));
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (selectedProduct) {
        // Update existing product
        const response = await updateSellerProduct(selectedProduct._id, productData);
        if (response.success) {
          // Reload products and statistics to ensure UI is in sync
          await Promise.all([loadProducts(), loadStatistics()]);
          showToast('Product updated successfully!', 'success');
        }
      } else {
        // Add new product
        const response = await addSellerProduct(productData);
        if (response.success) {
          // Reload products and statistics to ensure UI is in sync
          await Promise.all([loadProducts(), loadStatistics()]);
          showToast('Product added successfully!', 'success');
        }
      }
    } catch (error) {
      console.error('Error saving product:', error);
      throw error;
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      const response = await deleteSellerProduct(productToDelete._id);
      if (response.success) {
        // Reload products and statistics to ensure UI is in sync
        await Promise.all([loadProducts(), loadStatistics()]);
        setShowDeleteModal(false);
        setProductToDelete(null);
        showToast('Product deleted successfully!', 'success');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      showToast(error.message || 'Failed to delete product', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrder({ id: orderId, action: newStatus });
    try {
      const response = await updateSellerOrderStatus(orderId, newStatus);
      if (response.success) {
        // Reload orders and statistics to ensure UI is in sync
        await Promise.all([loadOrders(), loadStatistics()]);
        showToast(`Order status updated to ${newStatus}`, 'success');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showToast(error.message || 'Failed to update order status', 'error');
    } finally {
      setUpdatingOrder({ id: null, action: null });
    }
  };

  const saveProfile = async () => {
    try {
      const dataToUpdate = { ...profileFormData };
      if (profilePhotoPreview && profilePhotoPreview !== profile?.photo) {
        dataToUpdate.photo = profilePhotoPreview;
      }
      const response = await updateSellerProfile(dataToUpdate);
      if (response.success) {
        setProfile(response.profile);
        showToast('Profile updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast(error.message || 'Failed to update profile', 'error');
    }
  };

  const handleProfileUpdate = async (updatedData) => {
    try {
      const response = await updateSellerProfile(updatedData);
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
      const response = await changeSellerPassword(passwordData);
      if (response.success) {
        showToast('Password updated successfully!', 'success');
      }
    } catch (error) {
      throw error;
    }
  };

  const handleEmailUpdate = async (emailData) => {
    try {
      const response = await changeSellerEmail({
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
      const response = await updateSellerProfile({ phone: phoneData.newPhone });
      if (response.success) {
        setProfile(response.profile);
        showToast('Phone number updated successfully!', 'success');
      }
    } catch (error) {
      throw error;
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

  // Use imported utility function
  const getStatusColor = getStatusChipColor;

  const { totalRevenue, totalOrders, activeProducts, pendingOrders } = statistics;

  const renderDashboardPage = () => (
    <section className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">₱{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-xl">💰</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-blue-600">{totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xl">📦</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Products</p>
              <p className="text-2xl font-bold text-purple-600">{activeProducts}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-xl">🛍️</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-orange-600">{pendingOrders}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-orange-600 text-xl">⏳</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Recent Orders</h3>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                await Promise.all([loadOrders(), loadStatistics()]);
                showToast('Orders refreshed!', 'success');
              }}
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-lg text-sm"
            >
              🔄 Refresh
            </button>
            <button
              onClick={() => handleNavigate('orders')}
              className="text-rose-600 hover:underline text-sm"
            >
              View All
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {orders.slice(0, 5).map(order => (
            <div
              key={order.id}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer hover:shadow-md transition-all ${getStatusBackgroundColor(getDisplayStatus(order))}`}
              onClick={() => {
                setSelectedOrderForTracking(order);
                setShowOrderTrackingModal(true);
              }}
            >
              <div>
                <p className="font-medium">Order #{order.orderNumber}</p>
                <p className="text-sm text-gray-600">{order.customerName}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">₱{order.total.toFixed(2)}</p>
                <span className={`chip ${getStatusColor(getDisplayStatus(order))}`}>
                  {getStatusIcon(getDisplayStatus(order))} {getDisplayStatus(order)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Products */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
        <div className="space-y-3">
          {products
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5)
            .map(product => (
              <div key={product.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
                <div className="flex-1">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.sales} sales</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₱{product.price}</p>
                  <p className="text-sm text-gray-600">Stock: {product.stock}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );

  const renderProductsPage = () => (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">My Products</h3>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              await Promise.all([loadProducts(), loadStatistics()]);
              showToast('Products refreshed!', 'success');
            }}
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm"
          >
            🔄 Refresh Products
          </button>
          <button
            onClick={() => {
              setSelectedProduct(null);
              setShowProductModal(true);
            }}
            className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded-lg btn-shine"
          >
            ➕ Add Product
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="text-left text-sm border-b">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3 w-[140px]">Category</th>
                <th className="p-3 w-[100px]">Price</th>
                <th className="p-3 w-[90px]">Stock</th>
                <th className="p-3 w-[100px]">Status</th>
                <th className="p-3 w-[120px]">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No products yet. Click "Add Product" to create your first product.
                  </td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300'}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300';
                          }}
                        />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{product.name}</p>
                          <p className="text-xs text-gray-600 truncate">{product.description?.substring(0, 50)}{product.description?.length > 50 ? '...' : ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">{product.category}</td>
                    <td className="p-3 font-semibold">₱{product.price}</td>
                    <td className="p-3">
                      <span className={`chip ${product.stock <= 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="chip bg-green-100 text-green-800">Active</span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowProductModal(true);
                          }}
                          className="p-1 hover:bg-blue-100 rounded text-blue-600"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => {
                            setProductToDelete(product);
                            setShowDeleteModal(true);
                          }}
                          className="p-1 hover:bg-red-100 rounded text-red-600"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );

  const renderOrdersPage = () => {
    // Filter orders based on search term and status
    const filteredOrders = orders.filter(order => {
      const matchesSearch = !orderSearchTerm || 
        order.id?.toString().toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        order.orderNumber?.toString().toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        order.items?.some(item => item.name?.toLowerCase().includes(orderSearchTerm.toLowerCase()));
      
      const matchesStatus = !orderStatusFilter || order.status === orderStatusFilter;
      
      return matchesSearch && matchesStatus;
    });

    return (
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="text-lg font-semibold">Order Management ({ordersPagination.totalOrders})</h3>
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
                await Promise.all([loadOrders(), loadStatistics()]);
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
                  : 'No orders available.'}
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
              setSelectedOrderForTracking(order);
              setShowOrderTrackingModal(true);
            }}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold">Order #{order.orderNumber}</h3>
                <p className="text-sm text-gray-600">Customer: {order.customerName}</p>
                <p className="text-sm text-gray-600">Date: {new Date(order.date).toLocaleDateString()}</p>
                <p className="text-sm text-gray-600">Address: {order.deliveryAddress?.address}, {order.deliveryAddress?.city}</p>
                {order.proofOfPayment && (
                  <p className="text-sm text-green-600">✅ Payment proof received</p>
                )}
                {order.deliveryPerson && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-2">🚚 Delivery Person Assigned</p>
                    <div className="flex items-start gap-3">
                      {/* Delivery Person Photo */}
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-100 flex-shrink-0 border-2 border-blue-300">
                        {order.deliveryPerson.photo ? (
                          <img
                            src={order.deliveryPerson.photo}
                            alt={order.deliveryPerson.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-blue-600 text-2xl font-semibold">
                            🚚
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm text-blue-800 font-semibold">{order.deliveryPerson.name}</p>
                        <p className="text-xs text-blue-700">📱 Phone: {order.deliveryPerson.phone}</p>
                        <p className="text-xs text-blue-700">🚗 Vehicle: {order.deliveryPerson.vehicleType} ({order.deliveryPerson.vehiclePlate})</p>
                        <p className="text-xs text-blue-700">📍 Status: {order.deliveryStatus}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold">₱{order.total.toFixed(2)}</p>
                <span className={`chip ${getStatusColor(getDisplayStatus(order))}`}>
                  {getStatusIcon(getDisplayStatus(order))} {getDisplayStatus(order)}
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-3">
              {order.items.map((item, idx) => `${item.name} (${item.quantity}x)`).join(', ')}
            </div>
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              {order.status === 'Pending' && (
                <>
                  <button
                    onClick={() => updateOrderStatus(order.id, 'Confirmed')}
                    disabled={updatingOrder.id === order.id}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {updatingOrder.id === order.id && updatingOrder.action === 'Confirmed' && (
                      <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    )}
                    {updatingOrder.id === order.id && updatingOrder.action === 'Confirmed' ? 'Confirming...' : 'Confirm'}
                  </button>
                  <button
                    onClick={() => updateOrderStatus(order.id, 'Cancelled')}
                    disabled={updatingOrder.id === order.id}
                    className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {updatingOrder.id === order.id && updatingOrder.action === 'Cancelled' && (
                      <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    )}
                    {updatingOrder.id === order.id && updatingOrder.action === 'Cancelled' ? 'Cancelling...' : 'Cancel'}
                  </button>
                </>
              )}
              {order.status === 'Confirmed' && (
                <button
                  onClick={() => updateOrderStatus(order.id, 'Preparing')}
                  disabled={updatingOrder.id === order.id}
                  className="bg-orange-500 hover:bg-orange-600 text-white py-1 px-3 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {updatingOrder.id === order.id && updatingOrder.action === 'Preparing' && (
                    <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  )}
                  {updatingOrder.id === order.id && updatingOrder.action === 'Preparing' ? 'Processing...' : 'Start Preparing'}
                </button>
              )}
              {order.status === 'Preparing' && (
                <button
                  onClick={() => updateOrderStatus(order.id, 'Ready')}
                  disabled={updatingOrder.id === order.id}
                  className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {updatingOrder.id === order.id && updatingOrder.action === 'Ready' && (
                    <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  )}
                  {updatingOrder.id === order.id && updatingOrder.action === 'Ready' ? 'Processing...' : 'Mark Ready'}
                </button>
              )}
              {/* Show Assign Delivery button if order is Ready and no delivery person assigned */}
              {order.status === 'Ready' && !order.deliveryPerson && (
                <button
                  onClick={async () => {
                    setSelectedOrderForDelivery(order);
                    setShowAssignDeliveryModal(true);
                    // Refresh delivery persons list to get latest availability
                    await loadDeliveryPersons();
                  }}
                  className="bg-purple-500 hover:bg-purple-600 text-white py-1 px-3 rounded text-sm flex items-center gap-1"
                >
                  🚚 Assign Delivery
                </button>
              )}
              {/* Show Re-assign button if delivery was declined (deliveryStatus is Assigned but no deliveryPerson) */}
              {order.deliveryStatus === 'Assigned' && !order.deliveryPerson && order.status !== 'Ready' && (
                <button
                  onClick={async () => {
                    setSelectedOrderForDelivery(order);
                    setShowAssignDeliveryModal(true);
                    // Refresh delivery persons list to get latest availability
                    await loadDeliveryPersons();
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white py-1 px-3 rounded text-sm flex items-center gap-1"
                >
                  🔄 Re-assign Delivery
                </button>
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
                  await loadOrders(newPage);
                  setIsPaginationLoading(false);
                }}
                disabled={ordersPagination.currentPage === 1 || isPaginationLoading}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  ordersPagination.currentPage === 1 || isPaginationLoading
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                ← Previous
              </button>
              <button
                onClick={async () => {
                  const newPage = ordersPagination.currentPage + 1;
                  setIsPaginationLoading(true);
                  setOrdersPagination(prev => ({ ...prev, currentPage: newPage }));
                  await loadOrders(newPage);
                  setIsPaginationLoading(false);
                }}
                disabled={ordersPagination.currentPage === ordersPagination.totalPages || isPaginationLoading}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  ordersPagination.currentPage === ordersPagination.totalPages || isPaginationLoading
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
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

  // Calculate sales data for the last 7 days
  const salesChartData = useMemo(() => {
    const last7Days = [];
    const today = new Date();

    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      last7Days.push({
        date: date,
        dateStr: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: 0,
        orders: 0
      });
    }

    // Aggregate orders by date
    orders.forEach(order => {
      const orderDate = new Date(order.date);
      orderDate.setHours(0, 0, 0, 0);

      const dayData = last7Days.find(day => day.date.getTime() === orderDate.getTime());
      if (dayData && (order.status === 'Delivered' || order.status === 'Confirmed' || order.status === 'Preparing' || order.status === 'Ready' || order.status === 'Out for Delivery')) {
        dayData.revenue += order.total;
        dayData.orders += 1;
      }
    });

    return last7Days.map(day => ({
      date: day.dateStr,
      revenue: parseFloat(day.revenue.toFixed(2)),
      orders: day.orders
    }));
  }, [orders]);

  const renderAnalyticsPage = () => (
    <section className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Sales Analytics</h3>
        <button
          onClick={async () => {
            await Promise.all([loadOrders(), loadStatistics()]);
            showToast('Analytics refreshed!', 'success');
          }}
          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm"
        >
          🔄 Refresh Analytics
        </button>
      </div>

      {/* Sales Revenue Chart */}
      <div className="card p-6">
        <h4 className="font-semibold mb-4">Revenue Overview (Last 7 Days)</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `₱${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value) => [`₱${value.toFixed(2)}`, 'Revenue']}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#f43f5e"
              strokeWidth={3}
              dot={{ fill: '#f43f5e', r: 5 }}
              activeDot={{ r: 7 }}
              name="Revenue (₱)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Orders Chart */}
      <div className="card p-6">
        <h4 className="font-semibold mb-4">Orders Overview (Last 7 Days)</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value) => [value, 'Orders']}
            />
            <Legend />
            <Bar
              dataKey="orders"
              fill="#3b82f6"
              radius={[8, 8, 0, 0]}
              name="Number of Orders"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Product Performance */}
      <div className="card p-6 bg-white">
        <h4 className="font-semibold mb-4">Product Performance</h4>
        <div className="space-y-3">
          {products.length > 0 ? (
            products
              .sort((a, b) => (b.sales || 0) - (a.sales || 0))
              .slice(0, 10)
              .map(product => (
                <div key={product._id || product.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300'}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300';
                      }}
                    />
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.sales || 0} sales</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₱{((product.price || 0) * (product.sales || 0)).toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Revenue</p>
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No products available</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );

  const renderProfilePage = () => (
    <section className="space-y-4">
      <div className="card p-6 hover-animate reveal">
        <h2 className="text-lg font-semibold mb-4">Business Profile</h2>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full border-2 border-rose-500 overflow-hidden bg-rose-50 flex items-center justify-center">
            {profilePhotoPreview ? (
              <img
                src={profilePhotoPreview}
                alt="Business Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl text-rose-600 font-semibold">🏪</span>
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
              📷 Change Logo
            </label>
            <p className="text-xs text-gray-500 mt-2">
              JPG, PNG or GIF. Max size 5MB.
            </p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">Business Name</span>
            <input
              className="px-3 py-2 rounded-xl border"
              value={profileFormData.businessName}
              onChange={(e) => setProfileFormData({ ...profileFormData, businessName: e.target.value })}
              placeholder="Carigara Delicacies"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">Owner Name</span>
            <input
              className="px-3 py-2 rounded-xl border"
              value={profileFormData.ownerName}
              onChange={(e) => setProfileFormData({ ...profileFormData, ownerName: e.target.value })}
              placeholder="Juan Dela Cruz"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">Phone</span>
            <input
              className="px-3 py-2 rounded-xl border"
              value={profileFormData.phone}
              onChange={(e) => setProfileFormData({ ...profileFormData, phone: e.target.value })}
              placeholder="+63 900 000 0000"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">Palawan Pay Number</span>
            <input
              className="px-3 py-2 rounded-xl border"
              value={profileFormData.palawanPayNumber}
              onChange={(e) => setProfileFormData({ ...profileFormData, palawanPayNumber: e.target.value })}
              placeholder="09XX XXX XXXX"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">Palawan Pay Name</span>
            <input
              className="px-3 py-2 rounded-xl border"
              value={profileFormData.palawanPayName}
              onChange={(e) => setProfileFormData({ ...profileFormData, palawanPayName: e.target.value })}
              placeholder="Juan Dela Cruz"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">Business Type</span>
            <select
              className="px-3 py-2 rounded-xl border"
              value={profileFormData.businessType}
              onChange={(e) => setProfileFormData({ ...profileFormData, businessType: e.target.value })}
            >
              <option value="">Select Type</option>
              <option value="Food & Beverages">Food & Beverages</option>
              <option value="Handicrafts">Handicrafts</option>
              <option value="Agricultural Products">Agricultural Products</option>
              <option value="Local Delicacies">Local Delicacies</option>
            </select>
          </label>
        </div>
        <div className="mt-4">
          <button
            onClick={saveProfile}
            className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded-lg btn-shine"
          >
            💾 Save Profile
          </button>
        </div>
      </div>
    </section>
  );

  const renderCurrentPage = () => {
    // Don't render section content until data is loaded
    if (!canRenderSection(activePage)) {
      return (
        <div className="space-y-6">
          {activePage === 'dashboard' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <SkeletonLoader variant="stat-card" count={4} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SkeletonLoader variant="chart" count={2} />
              </div>
            </>
          )}
          {activePage === 'products' && (
            <>
              <div className="h-12 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="text-left text-sm border-b">
                      <tr>
                        <th className="p-3">Product</th>
                        <th className="p-3 w-[140px]">Category</th>
                        <th className="p-3 w-[100px]">Price</th>
                        <th className="p-3 w-[90px]">Stock</th>
                        <th className="p-3 w-[100px]">Status</th>
                        <th className="p-3 w-[120px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {Array.from({ length: 8 }).map((_, index) => (
                        <tr key={index} className="border-b animate-pulse">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                          </td>
                          <td className="p-3">
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                          </td>
                          <td className="p-3">
                            <div className="h-6 bg-gray-200 rounded w-12"></div>
                          </td>
                          <td className="p-3">
                            <div className="h-6 bg-gray-200 rounded w-16"></div>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <div className="w-8 h-8 bg-gray-200 rounded"></div>
                              <div className="w-8 h-8 bg-gray-200 rounded"></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
          {activePage === 'analytics' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
              </div>
              <div className="space-y-6">
                <SkeletonLoader variant="chart" count={1} />
                <SkeletonLoader variant="chart" count={1} />
                <div className="card p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="h-5 bg-gray-200 rounded w-20"></div>
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
          {activePage === 'profile' && (
            <SkeletonLoader variant="profile" count={1} />
          )}
          {(activePage === 'profile-settings' || activePage === 'account-settings') && (
            <SkeletonLoader variant="profile" count={1} />
          )}
        </div>
      );
    }

    switch (activePage) {
      case 'dashboard':
        return renderDashboardPage();
      case 'products':
        return renderProductsPage();
      case 'orders':
        return renderOrdersPage();
      case 'analytics':
        return renderAnalyticsPage();
      case 'profile':
        return renderProfilePage();
      case 'profile-settings':
        return (
          <ProfileSettings
            userType="seller"
            userData={profile}
            onUpdate={handleProfileUpdate}
            onCancel={() => handleNavigate('dashboard')}
          />
        );
      case 'account-settings':
        return (
          <AccountSettings
            userType="seller"
            userData={profile}
            onUpdateEmail={handleEmailUpdate}
            onUpdatePhone={handlePhoneUpdate}
            onUpdatePassword={handlePasswordUpdate}
            onCancel={() => handleNavigate('dashboard')}
          />
        );
      default:
        return renderDashboardPage();
    }
  };

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      products: 'Product Management',
      orders: 'Order Management',
      analytics: 'Sales Analytics',
      profile: 'Business Profile',
      'profile-settings': 'Profile Settings',
      'account-settings': 'Account Settings'
    };
    return titles[activePage] || 'Dashboard';
  };

  const handleLogout = () => {
    // Clear all seller-related data from storage
    localStorage.removeItem('seller_logged_in');
    localStorage.removeItem('seller_user');
    localStorage.removeItem('seller_login_email');
    localStorage.removeItem('seller_token');
    sessionStorage.removeItem('seller_logged_in');
    sessionStorage.removeItem('seller_user');
    sessionStorage.removeItem('seller_token');

    // Navigate to login page
    navigate('/seller/login');
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
                <SkeletonLoader variant="stat-card" count={4} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-800">
      {/* Dashboard Navbar */}
      <DashboardNavbar
        userType="seller"
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        userData={profile}
        onToggleSidebar={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <DashboardSidebar
          activePage={activePage}
          setActivePage={handleNavigate}
          userType="seller"
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

      {/* Product Modal */}
      <ProductModal
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setSelectedProduct(null);
        }}
        userType="seller"
        onSave={handleSaveProduct}
        editingProduct={selectedProduct}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setProductToDelete(null);
        }}
        onConfirm={handleDeleteProduct}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        itemName={productToDelete?.name}
        isDeleting={isDeleting}
      />

      {/* Assign Delivery Person Modal */}
      {showAssignDeliveryModal && selectedOrderForDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Assign Delivery Person</h2>
                <button
                  onClick={() => {
                    setShowAssignDeliveryModal(false);
                    setSelectedOrderForDelivery(null);
                    setSelectedDeliveryPersonId('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Order: <span className="font-medium">#{selectedOrderForDelivery.orderNumber}</span>
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    Customer: <span className="font-medium">{selectedOrderForDelivery.customerName}</span>
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Total: <span className="font-medium">₱{selectedOrderForDelivery.total.toFixed(2)}</span>
                  </p>
                </div>

                <DeliveryPersonAutocomplete
                  deliveryPersons={deliveryPersons}
                  value={selectedDeliveryPersonId}
                  onChange={setSelectedDeliveryPersonId}
                  placeholder="Type to search delivery person..."
                  label="Select Delivery Person"
                  required
                />

                {deliveryPersons.length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                    <p className="text-yellow-800 font-medium mb-1">⚠️ No delivery persons available</p>
                    <p className="text-yellow-700 text-xs">
                      All delivery persons are either inactive or unavailable. Please contact admin to activate delivery persons.
                    </p>
                  </div>
                )}

                {deliveryPersons.length > 0 && deliveryPersons.length < 3 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                    <p className="text-blue-800 font-medium mb-1">ℹ️ Limited availability</p>
                    <p className="text-blue-700 text-xs">
                      Only {deliveryPersons.length} delivery {deliveryPersons.length === 1 ? 'person is' : 'persons are'} currently active and available. Some riders may be inactive or unavailable.
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowAssignDeliveryModal(false);
                      setSelectedOrderForDelivery(null);
                      setSelectedDeliveryPersonId('');
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg"
                    disabled={isAssigningDelivery}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignDelivery}
                    disabled={!selectedDeliveryPersonId || isAssigningDelivery}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isAssigningDelivery && (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    )}
                    {isAssigningDelivery ? 'Assigning...' : 'Assign'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Tracking Modal */}
      {showOrderTrackingModal && selectedOrderForTracking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Order Tracking</h2>
                <button
                  onClick={() => {
                    setShowOrderTrackingModal(false);
                    setSelectedOrderForTracking(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Order Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Order Number</p>
                    <p className="font-semibold">{selectedOrderForTracking.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-semibold">{selectedOrderForTracking.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-semibold">₱{selectedOrderForTracking.total.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Status</p>
                    <span className={`chip ${getStatusColor(getDisplayStatus(selectedOrderForTracking))}`}>
                      {getStatusIcon(getDisplayStatus(selectedOrderForTracking))} {getDisplayStatus(selectedOrderForTracking)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Person Info */}
              {selectedOrderForTracking.deliveryPerson && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm font-medium text-blue-900 mb-3">🚚 Delivery Person</p>
                  <div className="flex items-start gap-4 mb-3">
                    {/* Delivery Person Photo */}
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-blue-100 flex-shrink-0 border-2 border-blue-300">
                      {selectedOrderForTracking.deliveryPerson.photo ? (
                        <img
                          src={selectedOrderForTracking.deliveryPerson.photo}
                          alt={selectedOrderForTracking.deliveryPerson.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-blue-600 text-3xl font-semibold">
                          🚚
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-blue-900 text-lg mb-1">{selectedOrderForTracking.deliveryPerson.name}</p>
                      <p className="text-sm text-blue-700">📱 {selectedOrderForTracking.deliveryPerson.phone}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-blue-700">Vehicle:</p>
                      <p className="font-semibold text-blue-900">{selectedOrderForTracking.deliveryPerson.vehicleType}</p>
                    </div>
                    <div>
                      <p className="text-blue-700">Plate:</p>
                      <p className="font-semibold text-blue-900">{selectedOrderForTracking.deliveryPerson.vehiclePlate}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Timeline */}
              <div className="mb-6">
                <h3 className="font-semibold mb-4">Order Timeline</h3>
                <div className="space-y-4">
                  {selectedOrderForTracking.statusHistory && selectedOrderForTracking.statusHistory.length > 0 ? (
                    selectedOrderForTracking.statusHistory.map((history, index) => (
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
                            Updated by {history.updatedBy}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p className="text-sm">No status history available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Proof of Payment */}
              {selectedOrderForTracking.proofOfPayment && (
                <div className="border-t pt-4 mb-6">
                  <h3 className="font-semibold mb-3">Proof of Payment</h3>
                  <img
                    src={selectedOrderForTracking.proofOfPayment}
                    alt="Proof of payment"
                    className="w-full max-h-64 object-contain rounded-lg border"
                  />
                </div>
              )}

              {/* Order Items */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrderForTracking.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                      <span>{item.name} x{item.quantity}</span>
                      <span className="font-semibold">₱{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Proof of Delivery */}
              {(selectedOrderForTracking.proofOfDeliveryImages?.length > 0 || selectedOrderForTracking.proofOfDelivery) && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-3">Proof of Delivery</h3>
                  {selectedOrderForTracking.proofOfDeliveryImages?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedOrderForTracking.proofOfDeliveryImages.map((image, index) => (
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
                      src={selectedOrderForTracking.proofOfDelivery}
                      alt="Proof of delivery"
                      className="w-full max-h-64 object-contain rounded-lg border"
                    />
                  )}
                  {selectedOrderForTracking.deliveredAt && (
                    <p className="text-sm text-gray-600 mt-3">
                      Delivered on: {new Date(selectedOrderForTracking.deliveredAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading Progress Bar */}
      <LoadingProgressBar isLoading={isLoading || isPaginationLoading} />
    </div>
  );
};

export default SellerDashboard;
