import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ToastNotification from '../../components/admin/ToastNotification';
import DashboardNavbar from '../../components/DashboardNavbar';
import DashboardSidebar from '../../components/DashboardSidebar';
import ProductModal from '../../components/admin/ProductModal';
import OrderModal from '../../components/admin/OrderModal';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import ProfileSettings from '../../components/ProfileSettings';
import AccountSettings from '../../components/AccountSettings';
import DeliveryPersonAutocomplete from '../../components/DeliveryPersonAutocomplete';
import { getCustomers, getSellers, getRiders, deleteCustomer, deleteSeller, deleteRider, getProducts, createProduct, updateProduct, deleteProduct, getOrders, createOrder, updateOrder, deleteOrder, updateOrderStatus, getAdminProfile, updateAdminProfile, changeAdminEmail, changeAdminPassword, getAdminDeliveryPersons, adminAssignDeliveryPerson } from '../../utils/api';
import { getStatusChipColor, getStatusBackgroundColor, getStatusIcon, getDisplayStatus } from '../../utils/orderStatusStyles';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Admin profile states
  const [adminProfile, setAdminProfile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Data states
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [riders, setRiders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [deliveryPersons, setDeliveryPersons] = useState([]);

  // Pagination states
  const [currentProductPage, setCurrentProductPage] = useState(0);
  const [currentOrderPage, setCurrentOrderPage] = useState(0);
  const itemsPerPage = 10;

  // Filter states
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sellerSearch, setSellerSearch] = useState('');
  const [riderSearch, setRiderSearch] = useState('');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');

  // Delivery assignment states
  const [showAssignDeliveryModal, setShowAssignDeliveryModal] = useState(false);
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState(null);
  const [selectedDeliveryPersonId, setSelectedDeliveryPersonId] = useState('');
  const [isAssigningDelivery, setIsAssigningDelivery] = useState(false);
  const [showOrderTrackingModal, setShowOrderTrackingModal] = useState(false);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState(null);

  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [currentUserType, setCurrentUserType] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState({
    type: '', // 'product', 'order', 'user'
    item: null,
    title: '',
    message: '',
    itemName: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize data from MongoDB
  useEffect(() => {
    const loadData = async () => {
      // Fetch all data from MongoDB
      try {
        const [productsData, customersData, sellersData, ridersData, ordersData, deliveryPersonsData] = await Promise.all([
          getProducts(),
          getCustomers(),
          getSellers(),
          getRiders(),
          getOrders(),
          getAdminDeliveryPersons()
        ]);

        if (productsData.success) {
          setProducts(productsData.products);
        }

        if (customersData.success) {
          setCustomers(customersData.customers);
        }

        if (sellersData.success) {
          setSellers(sellersData.sellers);
        }

        if (ridersData.success) {
          setRiders(ridersData.riders);
        }

        if (ordersData.success) {
          setOrders(ordersData.orders);
        }

        if (deliveryPersonsData.success) {
          // Filter only active delivery persons for assignment (isActive === true)
          const activeDeliveryPersons = deliveryPersonsData.deliveryPersons.filter(dp => dp.isActive === true);
          setDeliveryPersons(activeDeliveryPersons);
        }
      } catch (error) {
        console.error('Error fetching data from MongoDB:', error);
        showToast('Failed to load some data from server', 'error');
      }
    };

    loadData();

    // Initialize reveal animations
    setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(el => {
        el.classList.add('in-view');
      });
    }, 100);
  }, []);

  // Combined loading check - show loading if either profile or initial data is loading
  const isLoading = isLoadingProfile;

  // Load admin profile from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('admin_profile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setAdminProfile(profile);
      if (profile.photo) {
        setProfilePhotoPreview(profile.photo);
      }
    }
  }, []);

  // Toast notification helper
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in');
    navigate('/');
  };

  // Navigation handler
  const navigateTo = (page) => {
    setCurrentPage(page);
    setIsSidebarOpen(false);
  };

  // Trigger reveal animations when page changes
  useEffect(() => {
    setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(el => {
        el.classList.remove('in-view');
        setTimeout(() => el.classList.add('in-view'), 10);
      });
    }, 50);
  }, [currentPage]);

  // Refresh data when current page changes (for notification navigation)
  useEffect(() => {
    const refreshPageData = async () => {
      try {
        switch (currentPage) {
          case 'orders':
            const ordersData = await getOrders();
            if (ordersData.success) {
              setOrders(ordersData.orders);
            }
            break;
          case 'products':
            const productsData = await getProducts();
            if (productsData.success) {
              setProducts(productsData.products);
            }
            break;
          case 'sellers':
            const sellersData = await getSellers();
            if (sellersData.success) {
              setSellers(sellersData.sellers);
            }
            break;
          case 'riders':
            const ridersData = await getRiders();
            if (ridersData.success) {
              setRiders(ridersData.riders);
            }
            break;
          case 'customers':
            const customersData = await getCustomers();
            if (customersData.success) {
              setCustomers(customersData.customers);
            }
            break;
          case 'dashboard':
            // Refresh all data for dashboard
            const [productsRefresh, ordersRefresh, sellersRefresh, ridersRefresh, customersRefresh] = await Promise.all([
              getProducts(),
              getOrders(),
              getSellers(),
              getRiders(),
              getCustomers()
            ]);
            if (productsRefresh.success) setProducts(productsRefresh.products);
            if (ordersRefresh.success) setOrders(ordersRefresh.orders);
            if (sellersRefresh.success) setSellers(sellersRefresh.sellers);
            if (ridersRefresh.success) setRiders(ridersRefresh.riders);
            if (customersRefresh.success) setCustomers(customersRefresh.customers);
            break;
          case 'profile-settings':
          case 'account-settings':
            await loadAdminProfile();
            break;
          default:
            break;
        }
      } catch (error) {
        console.error('Error refreshing page data:', error);
      }
    };

    // Only refresh if not on initial load
    if (currentPage !== 'dashboard' || document.hasFocus()) {
      refreshPageData();
    }
  }, [currentPage]);

  // Load admin profile on mount
  useEffect(() => {
    loadAdminProfile();
  }, []);

  const loadAdminProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const response = await getAdminProfile();
      if (response.success) {
        setAdminProfile(response.profile);
        if (response.profile.photo) {
          setProfilePhotoPreview(response.profile.photo);
        }
      }
    } catch (error) {
      console.error('Error loading admin profile:', error);
      // If token is invalid, redirect to login
      if (error.message.includes('token') || error.message.includes('Unauthorized')) {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
      }
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Profile and account settings handlers
  const handleProfileUpdate = async (updatedData) => {
    try {
      const response = await updateAdminProfile(updatedData);
      if (response.success) {
        setAdminProfile(response.profile);
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
      const response = await changeAdminPassword(passwordData);
      if (response.success) {
        showToast('Password updated successfully!', 'success');
      }
    } catch (error) {
      throw error;
    }
  };

  const handleEmailUpdate = async (emailData) => {
    try {
      const response = await changeAdminEmail({
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
      const response = await updateAdminProfile({ phone: phoneData.newPhone });
      if (response.success) {
        setAdminProfile(response.profile);
        showToast('Phone number updated successfully!', 'success');
      }
    } catch (error) {
      throw error;
    }
  };

  const handleAssignDelivery = async () => {
    if (!selectedDeliveryPersonId) {
      showToast('Please select a delivery person', 'warning');
      return;
    }

    setIsAssigningDelivery(true);
    try {
      const response = await adminAssignDeliveryPerson(selectedOrderForDelivery.id, selectedDeliveryPersonId);
      if (response.success) {
        showToast('Delivery person assigned successfully!', 'success');
        setShowAssignDeliveryModal(false);
        setSelectedOrderForDelivery(null);
        setSelectedDeliveryPersonId('');
        // Reload orders to reflect the assignment
        const ordersData = await getOrders();
        if (ordersData.success) {
          setOrders(ordersData.orders);
        }
      }
    } catch (error) {
      console.error('Error assigning delivery person:', error);
      showToast(error.message || 'Failed to assign delivery person', 'error');
    } finally {
      setIsAssigningDelivery(false);
    }
  };

  // Get page title
  const getPageTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      products: 'Products',
      orders: 'Orders',
      sellers: 'Sellers',
      riders: 'Riders',
      customers: 'Customers',
      reports: 'Reports',
      settings: 'Settings',
      'profile-settings': 'Profile Settings',
      'account-settings': 'Account Settings'
    };
    return titles[currentPage] || 'Dashboard';
  };

  // Calculate statistics
  const totalSales = orders.reduce((sum, order) => sum + (order.status === 'Completed' ? order.amount : 0), 0);
  const lowStockProducts = products.filter(p => p.stock <= 10);

  // Get status color
  // Use imported utility function
  const getStatusColor = getStatusChipColor;

  // Filter products
  const getFilteredProducts = () => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        product.sku.toLowerCase().includes(productSearch.toLowerCase());
      const matchesCategory = !categoryFilter || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  };

  // Filter orders
  const getFilteredOrders = () => {
    return orders.filter(order => {
      if (!order || !order.orderNumber || !order.customer) return false;
      const matchesSearch = order.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
        order.customer.toLowerCase().includes(orderSearch.toLowerCase());
      const matchesStatus = !statusFilter || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  // Filter sellers
  const getFilteredSellers = () => {
    return sellers.filter(seller => {
      if (!seller) return false;
      const matchesSearch = !sellerSearch ||
        (seller.name && seller.name.toLowerCase().includes(sellerSearch.toLowerCase())) ||
        (seller.email && seller.email.toLowerCase().includes(sellerSearch.toLowerCase())) ||
        (seller.storeName && seller.storeName.toLowerCase().includes(sellerSearch.toLowerCase()));
      return matchesSearch;
    });
  };

  // Filter riders
  const getFilteredRiders = () => {
    return riders.filter(rider => {
      if (!rider) return false;
      const matchesSearch = !riderSearch ||
        (rider.name && rider.name.toLowerCase().includes(riderSearch.toLowerCase())) ||
        (rider.email && rider.email.toLowerCase().includes(riderSearch.toLowerCase())) ||
        (rider.vehicleType && rider.vehicleType.toLowerCase().includes(riderSearch.toLowerCase()));
      const matchesVehicle = !vehicleTypeFilter ||
        (rider.vehicleType && rider.vehicleType === vehicleTypeFilter);
      return matchesSearch && matchesVehicle;
    });
  };

  // Filter customers
  const getFilteredCustomers = () => {
    return customers.filter(customer => {
      if (!customer) return false;
      const matchesSearch = !customerSearch ||
        (customer.name && customer.name.toLowerCase().includes(customerSearch.toLowerCase())) ||
        (customer.email && customer.email.toLowerCase().includes(customerSearch.toLowerCase())) ||
        (customer.address && customer.address.toLowerCase().includes(customerSearch.toLowerCase()));
      return matchesSearch;
    });
  };

  // Get unique categories and vehicle types
  const categories = [...new Set(products.map(p => p.category))];
  const vehicleTypes = [...new Set(riders.map(r => r.vehicleType).filter(Boolean))];

  // Handle profile photo change
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

  // Save profile changes
  const handleSaveProfile = () => {
    const updatedProfile = {
      ...adminProfile,
      photo: profilePhotoPreview
    };
    setAdminProfile(updatedProfile);
    localStorage.setItem('admin_profile', JSON.stringify(updatedProfile));
    showToast('Profile updated successfully!', 'success');
  };

  // Handle password change
  const handleChangePassword = () => {
    // Validate passwords
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showToast('Please fill in all password fields', 'error');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showToast('New password must be at least 8 characters long', 'error');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    // In a real app, you would call an API here
    // For now, just show success message
    showToast('Password changed successfully!', 'success');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  // Show loading state while profile is being fetched
  if (isLoading) {
    return (
      <div className="font-inter text-gray-800 bg-gradient-to-b from-white to-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-inter text-gray-800 bg-gradient-to-b from-white to-gray-50 min-h-screen">
      {/* Header */}
      <DashboardNavbar
        userType="admin"
        onLogout={handleLogout}
        onNavigate={setCurrentPage}
        adminPhoto={adminProfile?.photo}
        adminName={adminProfile?.fullName || adminProfile?.username}
        adminEmail={adminProfile?.email}
        userData={adminProfile}
        onToggleSidebar={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <DashboardSidebar
          activePage={currentPage}
          setActivePage={navigateTo}
          userType="admin"
          userData={adminProfile}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-4 overflow-y-auto lg:ml-0">
          <div key={currentPage}>
            <h1 className="text-xl font-bold mb-4 mt-12 lg:mt-0">{getPageTitle()}</h1>

            {/* Dashboard Page */}
            {currentPage === 'dashboard' && (
              <div className="space-y-4">
                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                  <div className="card p-4 text-center reveal">
                    <p className="text-gray-500">Total Sales</p>
                    <p className="text-2xl font-extrabold text-rose-600">₱{totalSales.toLocaleString()}</p>
                  </div>
                  <div className="card p-4 text-center reveal" style={{ transitionDelay: '0.05s' }}>
                    <p className="text-gray-500">Orders</p>
                    <p className="text-2xl font-extrabold">{orders.length}</p>
                  </div>
                  <div className="card p-4 text-center reveal" style={{ transitionDelay: '0.1s' }}>
                    <p className="text-gray-500">Products</p>
                    <p className="text-2xl font-extrabold">{products.length}</p>
                  </div>
                  <div className="card p-4 text-center reveal" style={{ transitionDelay: '0.15s' }}>
                    <p className="text-gray-500">Sellers</p>
                    <p className="text-2xl font-extrabold">{sellers.length}</p>
                  </div>
                  <div className="card p-4 text-center reveal" style={{ transitionDelay: '0.2s' }}>
                    <p className="text-gray-500">Riders</p>
                    <p className="text-2xl font-extrabold">{riders.length}</p>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="card p-6 hover-animate reveal">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-lg font-semibold">Recent Orders</h2>
                      <button
                        onClick={() => navigateTo('orders')}
                        className="inline-flex items-center gap-2 bg-white border hover:bg-gray-50 py-2 px-4 rounded-lg text-sm"
                      >
                        View all →
                      </button>
                    </div>
                    <div className="text-sm space-y-2">
                      {orders.slice(-5).reverse().map(order => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{order.orderNumber}</p>
                            <p className="text-xs text-gray-600">{order.customer}</p>
                            {order.deliveryPerson && (
                              <p className="text-xs text-blue-600 mt-1">
                                🚚 {order.deliveryPerson.name}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₱{order.amount}</p>
                            <span className={`chip ${getStatusColor(order.status)}`}>{order.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="card p-6 hover-animate reveal" style={{ transitionDelay: '0.05s' }}>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-lg font-semibold">Low Stock Products</h2>
                      <button
                        onClick={() => navigateTo('products')}
                        className="inline-flex items-center gap-2 bg-white border hover:bg-gray-50 py-2 px-4 rounded-lg text-sm"
                      >
                        Manage →
                      </button>
                    </div>
                    <div className="text-sm space-y-2">
                      {lowStockProducts.length > 0 ? lowStockProducts.map(product => (
                        <div key={product.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-gray-600">{product.sku}</p>
                          </div>
                          <span className="chip bg-yellow-100 text-yellow-800">{product.stock} left</span>
                        </div>
                      )) : (
                        <p className="text-gray-500 text-center py-4">All products are well stocked!</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Page */}
            {currentPage === 'products' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold">Products</h3>
                  <div className="flex flex-wrap gap-2">
                    <input
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search product…"
                      className="px-3 py-2 rounded-xl border outline-none"
                    />
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl border"
                    >
                      <option value="">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        setEditingItem(null);
                        setIsProductModalOpen(true);
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
                          <th className="p-3 w-[120px]">SKU</th>
                          <th className="p-3">Name</th>
                          <th className="p-3 w-[140px]">Category</th>
                          <th className="p-3 w-[100px]">Price</th>
                          <th className="p-3 w-[90px]">Stock</th>
                          <th className="p-3 w-[120px]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {getFilteredProducts()
                          .slice(currentProductPage * itemsPerPage, (currentProductPage + 1) * itemsPerPage)
                          .map(product => (
                            <tr key={product.id} className="border-b hover:bg-gray-50">
                              <td className="p-3">{product.sku}</td>
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300'}
                                    alt={product.name}
                                    className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                                    onError={(e) => {
                                      e.target.onerror = null; // Prevent infinite loop
                                      e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300';
                                    }}
                                  />
                                  <div>
                                    <p className="font-medium">{product.name}</p>
                                    <p className="text-xs text-gray-600">{product.description?.substring(0, 50)}...</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">{product.category}</td>
                              <td className="p-3">₱{product.price}</td>
                              <td className="p-3">
                                <span className={`chip ${product.stock <= 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                  {product.stock}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => {
                                      setEditingItem(product);
                                      setIsProductModalOpen(true);
                                    }}
                                    className="p-1 hover:bg-blue-100 rounded text-blue-600"
                                    title="Edit"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => {
                                      setDeleteConfig({
                                        type: 'product',
                                        item: product,
                                        title: 'Delete Product',
                                        message: 'Are you sure you want to delete this product? This action cannot be undone.',
                                        itemName: product.name
                                      });
                                      setIsDeleteModalOpen(true);
                                    }}
                                    className="p-1 hover:bg-red-100 rounded text-red-600"
                                    title="Delete"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-3 flex items-center justify-between text-sm border-t">
                    <div className="text-gray-600">
                      Showing {currentProductPage * itemsPerPage + 1}-{Math.min((currentProductPage + 1) * itemsPerPage, getFilteredProducts().length)} of {getFilteredProducts().length} products
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentProductPage(Math.max(0, currentProductPage - 1))}
                        disabled={currentProductPage === 0}
                        className="inline-flex items-center gap-2 bg-white border hover:bg-gray-50 py-2 px-4 rounded-lg disabled:opacity-50"
                      >
                        Prev
                      </button>
                      <button
                        onClick={() => setCurrentProductPage(currentProductPage + 1)}
                        disabled={(currentProductPage + 1) * itemsPerPage >= getFilteredProducts().length}
                        className="inline-flex items-center gap-2 bg-white border hover:bg-gray-50 py-2 px-4 rounded-lg disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Page */}
            {currentPage === 'orders' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold">Orders</h3>
                  <div className="flex flex-wrap gap-2">
                    <input
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      placeholder="Search order…"
                      className="px-3 py-2 rounded-xl border outline-none"
                    />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl border"
                    >
                      <option value="">All Status</option>
                      <option>Pending</option>
                      <option>Processing</option>
                      <option>Out for Delivery</option>
                      <option>Completed</option>
                      <option>Cancelled</option>
                    </select>
                    <button
                      onClick={() => {
                        setEditingItem(null);
                        setIsOrderModalOpen(true);
                      }}
                      className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded-lg btn-shine"
                    >
                      ➕ Create Order
                    </button>
                  </div>
                </div>

                <div className="card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="text-left text-sm border-b">
                        <tr>
                          <th className="p-3 w-[240px]">Order #</th>
                          <th className="p-3">Customer</th>
                          <th className="p-3 w-[120px]">Amount</th>
                          <th className="p-3 w-[140px]">Status</th>
                          <th className="p-3 w-[140px]">Date</th>
                          <th className="p-3 w-[130px]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {getFilteredOrders().length === 0 ? (
                          <tr>
                            <td colSpan="6" className="p-8 text-center text-gray-500">
                              No orders found. {orderSearch || statusFilter ? 'Try adjusting your filters.' : 'Create your first order to get started.'}
                            </td>
                          </tr>
                        ) : (
                          getFilteredOrders()
                            .slice(currentOrderPage * itemsPerPage, (currentOrderPage + 1) * itemsPerPage)
                            .map(order => (
                              <tr 
                                key={order.id} 
                                className={`border-b hover:shadow-md cursor-pointer transition-all ${getStatusBackgroundColor(getDisplayStatus(order))}`}
                                onClick={() => {
                                  setSelectedOrderForTracking(order);
                                  setShowOrderTrackingModal(true);
                                }}
                              >
                                <td className="p-3">
                                  <div>
                                    <p className="font-medium">{order.orderNumber || 'N/A'}</p>
                                    {order.deliveryPerson && (
                                      <p className="text-xs text-blue-600 mt-1">
                                        🚚 {order.deliveryPerson.name}
                                      </p>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3">{order.customer || 'N/A'}</td>
                                <td className="p-3">₱{(order.amount || 0).toLocaleString()}</td>
                                <td className="p-3">
                                  <span className={`chip ${getStatusColor(getDisplayStatus(order))}`}>
                                    {getStatusIcon(getDisplayStatus(order))} {getDisplayStatus(order)}
                                  </span>
                                </td>
                                <td className="p-3">{order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}</td>
                                <td className="p-3" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => {
                                        setEditingItem(order);
                                        setIsOrderModalOpen(true);
                                      }}
                                      className="p-1 hover:bg-blue-100 rounded text-blue-600"
                                      title="Edit"
                                    >
                                      ✏️
                                    </button>
                                    {(order.status === 'Processing' || order.status === 'Pending') && !order.deliveryPerson && (
                                      <button
                                        onClick={() => {
                                          setSelectedOrderForDelivery(order);
                                          setShowAssignDeliveryModal(true);
                                        }}
                                        className="p-1 hover:bg-purple-100 rounded text-purple-600"
                                        title="Assign Delivery"
                                      >
                                        🚚
                                      </button>
                                    )}
                                    <button
                                      onClick={() => {
                                        setDeleteConfig({
                                          type: 'order',
                                          item: order,
                                          title: 'Delete Order',
                                          message: 'Are you sure you want to delete this order? This action cannot be undone.',
                                          itemName: `${order.orderNumber} - ${order.customer}`
                                        });
                                        setIsDeleteModalOpen(true);
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
                  <div className="p-3 flex items-center justify-between text-sm border-t">
                    <div className="text-gray-600">
                      Showing {currentOrderPage * itemsPerPage + 1}-{Math.min((currentOrderPage + 1) * itemsPerPage, getFilteredOrders().length)} of {getFilteredOrders().length} orders
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentOrderPage(Math.max(0, currentOrderPage - 1))}
                        disabled={currentOrderPage === 0}
                        className="inline-flex items-center gap-2 bg-white border hover:bg-gray-50 py-2 px-4 rounded-lg disabled:opacity-50"
                      >
                        Prev
                      </button>
                      <button
                        onClick={() => setCurrentOrderPage(currentOrderPage + 1)}
                        disabled={(currentOrderPage + 1) * itemsPerPage >= getFilteredOrders().length}
                        className="inline-flex items-center gap-2 bg-white border hover:bg-gray-50 py-2 px-4 rounded-lg disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sellers/Riders/Customers Pages */}
            {(currentPage === 'sellers' || currentPage === 'riders' || currentPage === 'customers') && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold capitalize">{currentPage}</h3>
                  <div className="flex flex-wrap gap-2">
                    {/* Search Input */}
                    <input
                      value={
                        currentPage === 'sellers' ? sellerSearch :
                          currentPage === 'riders' ? riderSearch :
                            customerSearch
                      }
                      onChange={(e) => {
                        if (currentPage === 'sellers') setSellerSearch(e.target.value);
                        else if (currentPage === 'riders') setRiderSearch(e.target.value);
                        else setCustomerSearch(e.target.value);
                      }}
                      placeholder={`Search ${currentPage.slice(0, -1)}...`}
                      className="px-3 py-2 rounded-xl border outline-none"
                    />

                    {/* Vehicle Type Filter for Riders */}
                    {currentPage === 'riders' && (
                      <select
                        value={vehicleTypeFilter}
                        onChange={(e) => setVehicleTypeFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl border"
                      >
                        <option value="">All Vehicles</option>
                        {vehicleTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    )}

                    <button
                      onClick={() => {
                        setEditingItem(null);
                        setCurrentUserType(currentPage.slice(0, -1));
                        setIsUserModalOpen(true);
                      }}
                      className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded-lg btn-shine"
                    >
                      ➕ Add {currentPage.slice(0, -1).charAt(0).toUpperCase() + currentPage.slice(1, -1)}
                    </button>
                  </div>
                </div>

                {/* User Cards Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(currentPage === 'sellers' ? getFilteredSellers() :
                    currentPage === 'riders' ? getFilteredRiders() :
                      getFilteredCustomers()).length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500">
                      No {currentPage} found. {
                        (currentPage === 'sellers' && sellerSearch) ||
                          (currentPage === 'riders' && (riderSearch || vehicleTypeFilter)) ||
                          (currentPage === 'customers' && customerSearch)
                          ? 'Try adjusting your search filters.'
                          : `Add your first ${currentPage.slice(0, -1)} to get started.`
                      }
                    </div>
                  ) : (
                    (currentPage === 'sellers' ? getFilteredSellers() :
                      currentPage === 'riders' ? getFilteredRiders() :
                        getFilteredCustomers()).map(user => (
                          <div key={user.id} className="card p-4 hover-animate">
                            <div className="flex items-center gap-3 mb-3">
                              <img src={user.image} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                              <div className="flex-1">
                                <h4 className="font-semibold">{user.name}</h4>
                                <p className="text-sm text-gray-600">{user.email}</p>
                                {user.storeName && <p className="text-xs text-gray-500">{user.storeName}</p>}
                                {user.vehicleType && <p className="text-xs text-gray-500">{user.vehicleType}</p>}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingItem(user);
                                  setCurrentUserType(currentPage.slice(0, -1));
                                  setIsUserModalOpen(true);
                                }}
                                className="flex-1 py-2 px-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  const userType = currentPage.slice(0, -1);
                                  setDeleteConfig({
                                    type: 'user',
                                    item: user,
                                    userType: userType,
                                    title: `Delete ${userType.charAt(0).toUpperCase() + userType.slice(1)}`,
                                    message: `Are you sure you want to delete this ${userType}? This action cannot be undone.`,
                                    itemName: user.name
                                  });
                                  setIsDeleteModalOpen(true);
                                }}
                                className="flex-1 py-2 px-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))
                  )}
                </div>
              </div>
            )}

            {/* Reports Page */}
            {currentPage === 'reports' && (
              <div className="card p-6 hover-animate reveal">
                <h2 className="text-lg font-semibold mb-4">Quick Reports</h2>
                <p className="text-gray-600 mb-4">Export summarized metrics as JSON.</p>
                <button
                  onClick={() => {
                    const summary = {
                      timestamp: new Date().toISOString(),
                      statistics: {
                        totalProducts: products.length,
                        totalOrders: orders.length,
                        totalSellers: sellers.length,
                        totalRiders: riders.length,
                        totalCustomers: customers.length,
                        totalSales: totalSales,
                        lowStockProducts: lowStockProducts.length
                      }
                    };
                    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `pasalubong-summary-${new Date().toISOString().split('T')[0]}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    showToast('Summary report exported successfully!', 'success');
                  }}
                  className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded-lg btn-shine"
                >
                  ⬇️ Download Summary
                </button>
              </div>
            )}

            {/* Profile Settings Page */}
            {currentPage === 'profile-settings' && (
              <ProfileSettings
                userType="admin"
                userData={adminProfile}
                onUpdate={handleProfileUpdate}
                onCancel={() => setCurrentPage('dashboard')}
              />
            )}

            {/* Account Settings Page */}
            {currentPage === 'account-settings' && (
              <AccountSettings
                userType="admin"
                userData={adminProfile}
                onUpdateEmail={handleEmailUpdate}
                onUpdatePhone={handlePhoneUpdate}
                onUpdatePassword={handlePasswordUpdate}
                onCancel={() => setCurrentPage('dashboard')}
              />
            )}

            {/* Settings Page */}
            {currentPage === 'settings' && (
              <div className="space-y-4">
                <div className="card p-6 hover-animate reveal">
                  <h2 className="text-lg font-semibold mb-4">Account Settings</h2>

                  {/* Profile Photo Section */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                        {profilePhotoPreview ? (
                          <img
                            src={profilePhotoPreview}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-4xl text-gray-400">⚙️</span>
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
                          className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 py-2 px-4 rounded-lg cursor-pointer text-sm"
                        >
                          📷 Change Photo
                        </label>
                        <p className="text-xs text-gray-500 mt-2">
                          JPG, PNG or GIF. Max size 5MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1">
                      <span className="text-sm text-gray-600">Full Name</span>
                      <input
                        className="px-3 py-2 rounded-xl border"
                        placeholder="Admin User"
                        value={adminProfile?.fullName || adminProfile?.username || ''}
                        onChange={(e) => setAdminProfile({ ...adminProfile, fullName: e.target.value })}
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-sm text-gray-600">Email</span>
                      <input
                        type="email"
                        className="px-3 py-2 rounded-xl border"
                        placeholder="admin@pasalubong.com"
                        value={adminProfile?.email || ''}
                        onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })}
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-sm text-gray-600">Phone</span>
                      <input
                        className="px-3 py-2 rounded-xl border"
                        placeholder="+63 900 000 0000"
                        value={adminProfile?.phone || ''}
                        onChange={(e) => setAdminProfile({ ...adminProfile, phone: e.target.value })}
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-sm text-gray-600">Role</span>
                      <input className="px-3 py-2 rounded-xl border bg-gray-50" value="Administrator" readOnly />
                    </label>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={handleSaveProfile}
                      className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded-lg btn-shine"
                    >
                      💾 Save Account
                    </button>
                  </div>
                </div>

                {/* Change Password Section */}
                <div className="card p-6 hover-animate reveal">
                  <h2 className="text-lg font-semibold mb-4">Change Password</h2>
                  <div className="max-w-md space-y-3">
                    <label className="flex flex-col gap-1">
                      <span className="text-sm text-gray-600">Current Password</span>
                      <input
                        type="password"
                        className="px-3 py-2 rounded-xl border"
                        placeholder="Enter current password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-sm text-gray-600">New Password</span>
                      <input
                        type="password"
                        className="px-3 py-2 rounded-xl border"
                        placeholder="Enter new password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      />
                      <span className="text-xs text-gray-500">Must be at least 8 characters</span>
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-sm text-gray-600">Confirm New Password</span>
                      <input
                        type="password"
                        className="px-3 py-2 rounded-xl border"
                        placeholder="Confirm new password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      />
                    </label>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={handleChangePassword}
                      className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded-lg btn-shine"
                    >
                      🔒 Change Password
                    </button>
                  </div>
                </div>

                <div className="card p-6 hover-animate reveal">
                  <h2 className="text-lg font-semibold mb-4">System Settings</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1">
                      <span className="text-sm text-gray-600">Store Name</span>
                      <input className="px-3 py-2 rounded-xl border" placeholder="Pasalubong Center" />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-sm text-gray-600">Currency</span>
                      <input className="px-3 py-2 rounded-xl border" placeholder="PHP" />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-sm text-gray-600">Timezone</span>
                      <select className="px-3 py-2 rounded-xl border">
                        <option value="Asia/Manila">Asia/Manila (GMT+8)</option>
                        <option value="UTC">UTC (GMT+0)</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-sm text-gray-600">Language</span>
                      <select className="px-3 py-2 rounded-xl border">
                        <option value="en">English</option>
                        <option value="fil">Filipino</option>
                      </select>
                    </label>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => showToast('System settings saved successfully!', 'success')}
                      className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded-lg btn-shine"
                    >
                      💾 Save Settings
                    </button>
                  </div>
                </div>
              </div>
            )}

            <footer className="py-6 text-center text-xs text-gray-500">
              © {new Date().getFullYear()} Pasalubong Center • Admin
            </footer>
          </div>
        </main>
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <ToastNotification
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      {/* User Edit Modal */}
      {isUserModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsUserModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingItem ? 'View' : 'Add'} {currentUserType.charAt(0).toUpperCase() + currentUserType.slice(1)}
              </h3>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {editingItem && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <img src={editingItem.image} alt={editingItem.name} className="w-20 h-20 rounded-full object-cover" />
                  <div>
                    <h4 className="text-xl font-semibold">{editingItem.name}</h4>
                    <p className="text-sm text-gray-600">{editingItem.email}</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={editingItem.name}
                      readOnly
                      className="w-full px-3 py-2 rounded-xl border bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={editingItem.email}
                      readOnly
                      className="w-full px-3 py-2 rounded-xl border bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={editingItem.phone}
                      readOnly
                      className="w-full px-3 py-2 rounded-xl border bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={editingItem.address}
                      readOnly
                      className="w-full px-3 py-2 rounded-xl border bg-gray-50"
                    />
                  </div>

                  {editingItem.storeName && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                        <input
                          type="text"
                          value={editingItem.storeName}
                          readOnly
                          className="w-full px-3 py-2 rounded-xl border bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                        <input
                          type="text"
                          value={editingItem.businessLicense}
                          readOnly
                          className="w-full px-3 py-2 rounded-xl border bg-gray-50"
                        />
                      </div>
                    </>
                  )}

                  {editingItem.vehicleType && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                        <input
                          type="text"
                          value={editingItem.vehicleType}
                          readOnly
                          className="w-full px-3 py-2 rounded-xl border bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                        <input
                          type="text"
                          value={editingItem.licenseNumber}
                          readOnly
                          className="w-full px-3 py-2 rounded-xl border bg-gray-50"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setIsUserModalOpen(false)}
                    className="inline-flex items-center gap-2 bg-white border hover:bg-gray-50 py-2 px-4 rounded-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingItem(null);
        }}
        userType="admin"
        onSave={async (productData) => {
          try {
            if (editingItem) {
              // Update existing product
              const response = await updateProduct(editingItem.id, productData);
              if (response.success) {
                const updatedProducts = products.map(p =>
                  p.id === editingItem.id ? response.product : p
                );
                setProducts(updatedProducts);
                showToast('Product updated successfully!', 'success');
              }
            } else {
              // Create new product
              const response = await createProduct(productData);
              if (response.success) {
                setProducts([response.product, ...products]);
                showToast('Product added successfully!', 'success');
              }
            }
          } catch (error) {
            console.error('Save product error:', error);
            throw error; // Re-throw to be handled by modal
          }
        }}
        editingProduct={editingItem}
      />

      {/* Order Modal */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setEditingItem(null);
        }}
        onSave={async (orderData) => {
          try {
            if (editingItem) {
              // Update existing order
              const response = await updateOrder(editingItem.id, orderData);
              if (response.success) {
                const updatedOrders = orders.map(o =>
                  o.id === editingItem.id ? response.order : o
                );
                setOrders(updatedOrders);
                showToast('Order updated successfully!', 'success');
              }
            } else {
              // Create new order
              const response = await createOrder(orderData);
              if (response.success) {
                setOrders([response.order, ...orders]);
                showToast('Order created successfully!', 'success');
              }
            }
          } catch (error) {
            console.error('Save order error:', error);
            throw error; // Re-throw to be handled by modal
          }
        }}
        editingOrder={editingItem}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteConfig({ type: '', item: null, title: '', message: '', itemName: '' });
        }}
        onConfirm={async () => {
          setIsDeleting(true);
          try {
            if (deleteConfig.type === 'product') {
              await deleteProduct(deleteConfig.item.id);
              const newProducts = products.filter(p => p.id !== deleteConfig.item.id);
              setProducts(newProducts);
              showToast('Product deleted successfully!', 'success');
            } else if (deleteConfig.type === 'order') {
              await deleteOrder(deleteConfig.item.id);
              const newOrders = orders.filter(o => o.id !== deleteConfig.item.id);
              setOrders(newOrders);
              showToast('Order deleted successfully!', 'success');
            } else if (deleteConfig.type === 'user') {
              let deleteFunc, newData, setData;

              if (deleteConfig.userType === 'seller') {
                deleteFunc = deleteSeller;
                newData = sellers.filter(u => u.id !== deleteConfig.item.id);
                setData = setSellers;
              } else if (deleteConfig.userType === 'rider') {
                deleteFunc = deleteRider;
                newData = riders.filter(u => u.id !== deleteConfig.item.id);
                setData = setRiders;
              } else {
                deleteFunc = deleteCustomer;
                newData = customers.filter(u => u.id !== deleteConfig.item.id);
                setData = setCustomers;
              }

              await deleteFunc(deleteConfig.item.id);
              setData(newData);
              showToast(`${deleteConfig.userType.charAt(0).toUpperCase() + deleteConfig.userType.slice(1)} deleted successfully!`, 'success');
            }

            setIsDeleteModalOpen(false);
            setDeleteConfig({ type: '', item: null, title: '', message: '', itemName: '' });
          } catch (error) {
            console.error('Delete error:', error);
            showToast(error.message || 'Failed to delete', 'error');
          } finally {
            setIsDeleting(false);
          }
        }}
        title={deleteConfig.title}
        message={deleteConfig.message}
        itemName={deleteConfig.itemName}
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
                    Customer: <span className="font-medium">{selectedOrderForDelivery.customer}</span>
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Total: <span className="font-medium">₱{selectedOrderForDelivery.amount?.toFixed(2) || '0.00'}</span>
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
                    <p className="font-semibold">{selectedOrderForTracking.orderNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-semibold">{selectedOrderForTracking.customer || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-semibold">₱{(selectedOrderForTracking.amount || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Status</p>
                    <span className={`chip ${getStatusColor(selectedOrderForTracking.status || 'Pending')}`}>
                      {selectedOrderForTracking.status || 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Person Info */}
              {selectedOrderForTracking.deliveryPerson && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm font-medium text-blue-900 mb-3">🚚 Delivery Person</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-blue-700">Name:</p>
                      <p className="font-semibold text-blue-900">{selectedOrderForTracking.deliveryPerson.name}</p>
                    </div>
                    <div>
                      <p className="text-blue-700">Phone:</p>
                      <p className="font-semibold text-blue-900">{selectedOrderForTracking.deliveryPerson.phone}</p>
                    </div>
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
              {selectedOrderForTracking.items && selectedOrderForTracking.items.length > 0 && (
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
              )}

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

      {/* Notification Modal */}
      {isNotificationModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsNotificationModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Notifications</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-sm font-medium text-blue-800">New order received</p>
                <p className="text-xs text-blue-600 mt-1">Order #ORD-2024-001 from Juan Dela Cruz</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                <p className="text-sm font-medium text-yellow-800">Low stock alert</p>
                <p className="text-xs text-yellow-600 mt-1">Ube Halaya has only 5 items left</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                <p className="text-sm font-medium text-green-800">Order completed</p>
                <p className="text-xs text-green-600 mt-1">Order #ORD-2024-002 has been delivered</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setIsNotificationModalOpen(false)}
                className="inline-flex items-center gap-2 bg-white border hover:bg-gray-50 py-2 px-4 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;