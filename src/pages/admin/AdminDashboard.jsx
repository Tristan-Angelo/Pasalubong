import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import OpenStreetMapAutocomplete from '../../components/OpenStreetMapAutocomplete';
import StatisticsCard from '../../components/admin/StatisticsCard';
import NotificationCenter from '../../components/admin/NotificationCenter';
import AnalyticsChart from '../../components/admin/AnalyticsChart';
import ActivityLog from '../../components/admin/ActivityLog';
import BulkActionsModal from '../../components/admin/BulkActionsModal';
import LoadingProgressBar from '../../components/LoadingProgressBar';
import SkeletonLoader from '../../components/SkeletonLoader';
import UserApprovalModal from '../../components/admin/UserApprovalModal';
import useLazyDashboardData from '../../hooks/useLazyDashboardData';
import { getCustomers, getSellers, getRiders, updateCustomer, updateSeller, updateRider, toggleUserStatus, deleteCustomer, deleteSeller, deleteRider, getProducts, createProduct, updateProduct, deleteProduct, getOrders, createOrder, updateOrder, deleteOrder, updateOrderStatus, getAdminProfile, updateAdminProfile, changeAdminEmail, changeAdminPassword, getAdminDeliveryPersons, adminAssignDeliveryPerson, getAdminBuyerOrders, getAdminUnreadCount, getPendingApprovals, approveSeller, declineSeller, approveDelivery, declineDelivery } from '../../utils/api';
import { getStatusChipColor, getStatusBackgroundColor, getStatusIcon, getDisplayStatus } from '../../utils/orderStatusStyles';
import { exportDashboardSummary } from '../../utils/excelExport';

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

  // Notification states
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  // Bulk actions states
  const [selectedItems, setSelectedItems] = useState([]);
  const [isBulkActionsModalOpen, setIsBulkActionsModalOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState('');

  // Pending approvals states
  const [pendingSellers, setPendingSellers] = useState([]);
  const [pendingDeliveries, setPendingDeliveries] = useState([]);
  const [selectedUserForApproval, setSelectedUserForApproval] = useState(null);
  const [approvalUserType, setApprovalUserType] = useState('');
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

  // Analytics states
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [dateRange, setDateRange] = useState('7days');

  // Activity log
  const [activityLog, setActivityLog] = useState([]);

  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [currentUserType, setCurrentUserType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editedUserData, setEditedUserData] = useState(null);
  const [isSavingUser, setIsSavingUser] = useState(false);

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

  // Define data loaders for each section
  const loadProductsData = useCallback(async () => {
    try {
      const productsData = await getProducts();
      if (productsData.success) {
        setProducts(productsData.products);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }, []);

  const loadCustomersData = useCallback(async () => {
    try {
      const customersData = await getCustomers();
      if (customersData.success) {
        setCustomers(customersData.customers);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  }, []);

  const loadSellersData = useCallback(async () => {
    try {
      const sellersData = await getSellers();
      if (sellersData.success) {
        setSellers(sellersData.sellers);
      }
    } catch (error) {
      console.error('Error loading sellers:', error);
    }
  }, []);

  const loadRidersData = useCallback(async () => {
    try {
      const ridersData = await getRiders();
      if (ridersData.success) {
        setRiders(ridersData.riders);
      }
    } catch (error) {
      console.error('Error loading riders:', error);
    }
  }, []);

  const [ordersPagination, setOrdersPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    ordersPerPage: 10
  });

  const loadOrdersData = useCallback(async () => {
    try {
      const [ordersData, buyerOrdersData] = await Promise.all([
        getOrders(),
        getAdminBuyerOrders(ordersPagination.currentPage, ordersPagination.ordersPerPage)
      ]);

      let allOrders = [];

      if (ordersData.success) {
        allOrders = [...ordersData.orders];
      }

      // Update pagination info
      if (buyerOrdersData.pagination) {
        setOrdersPagination(buyerOrdersData.pagination);
      }

      // Merge buyer orders with old orders for comprehensive view
      if (buyerOrdersData.success) {
        const buyerOrders = buyerOrdersData.orders.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customer: order.customerName,
          amount: order.total,
          status: order.status,
          date: order.date,
          deliveryPerson: order.deliveryPerson,
          deliveryStatus: order.deliveryStatus,
          statusHistory: order.statusHistory,
          proofOfDelivery: order.proofOfDelivery,
          proofOfDeliveryImages: order.proofOfDeliveryImages,
          deliveredAt: order.deliveredAt,
          items: order.items
        }));
        allOrders = [...buyerOrders, ...allOrders];
      }

      setOrders(allOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  }, []);

  const loadDeliveryPersonsData = useCallback(async () => {
    try {
      const deliveryPersonsData = await getAdminDeliveryPersons();
      if (deliveryPersonsData.success) {
        setDeliveryPersons(deliveryPersonsData.deliveryPersons);
      }
    } catch (error) {
      console.error('Error loading delivery persons:', error);
    }
  }, []);

  const loadProfileData = useCallback(async () => {
    try {
      const profileData = await getAdminProfile();
      if (profileData.success) {
        setAdminProfile(profileData.profile);
        if (profileData.profile.photo) {
          setProfilePhotoPreview(profileData.profile.photo);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  const loadPendingApprovalsData = useCallback(async () => {
    try {
      const approvalsData = await getPendingApprovals();
      if (approvalsData.success) {
        setPendingSellers(approvalsData.pendingSellers || []);
        setPendingDeliveries(approvalsData.pendingDeliveries || []);
      }
    } catch (error) {
      console.error('Error loading pending approvals:', error);
    }
  }, []);

  // Define data loaders for each section
  const dataLoaders = useMemo(() => ({
    dashboard: [loadProductsData, loadCustomersData, loadSellersData, loadOrdersData],
    'pending-approvals': [loadPendingApprovalsData],
    products: [loadProductsData],
    orders: [loadOrdersData, loadDeliveryPersonsData],
    customers: [loadCustomersData],
    sellers: [loadSellersData],
    riders: [loadRidersData],
    'profile-settings': [loadProfileData],
    'account-settings': [loadProfileData]
  }), [loadProductsData, loadCustomersData, loadSellersData, loadRidersData, loadOrdersData, loadDeliveryPersonsData, loadProfileData, loadPendingApprovalsData]);

  // Use lazy loading hook
  const { isLoading, isSectionLoaded, canRenderSection, canNavigate, reloadSection, initialLoadComplete, loadingRef } = useLazyDashboardData(
    currentPage,
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
    setCurrentPage(page);
  }, [isLoading, loadingRef]);

  // Initialize on mount
  useEffect(() => {
    loadNotificationCount();
    generateActivityLog();

    // Initialize reveal animations
    setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(el => {
        el.classList.add('in-view');
      });
    }, 100);

    // Refresh notification count every 30 seconds
    const notificationInterval = setInterval(loadNotificationCount, 30000);
    return () => clearInterval(notificationInterval);
  }, []);

  // Load notification count
  const loadNotificationCount = async () => {
    try {
      const response = await getAdminUnreadCount();
      if (response.success) {
        setNotificationCount(response.count);
      }
    } catch (error) {
      console.error('Error loading notification count:', error);
    }
  };

  // Generate activity log from recent data
  const generateActivityLog = () => {
    const activities = [];

    // Recent orders
    orders.slice(-5).forEach(order => {
      activities.push({
        type: 'order_created',
        title: `New order ${order.orderNumber}`,
        description: `Order from ${order.customer} - ₱${order.amount}`,
        timestamp: order.date || order.createdAt
      });
    });

    // Recent products
    products.slice(-3).forEach(product => {
      activities.push({
        type: 'product_added',
        title: `Product added: ${product.name}`,
        description: `${product.category} - ₱${product.price}`,
        timestamp: product.createdAt
      });
    });

    // Sort by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    setActivityLog(activities);
  };

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

  // Navigation handler - prevent navigation while loading
  const navigateTo = (page) => {
    handleNavigate(page);
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
      'pending-approvals': 'Pending Approvals',
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

  // Approval handlers
  const handleApproveUser = async (userId, userType) => {
    try {
      if (userType === 'seller') {
        await approveSeller(userId);
        showToast('Seller approved successfully', 'success');
      } else {
        await approveDelivery(userId);
        showToast('Delivery partner approved successfully', 'success');
      }
      // Reload pending approvals
      await loadPendingApprovalsData();
    } catch (error) {
      console.error('Approve error:', error);
      showToast('Failed to approve user', 'error');
    }
  };

  const handleDeclineUser = async (userId, reason, userType) => {
    try {
      if (userType === 'seller') {
        await declineSeller(userId, reason);
        showToast('Seller declined', 'success');
      } else {
        await declineDelivery(userId, reason);
        showToast('Delivery partner declined', 'success');
      }
      // Reload pending approvals
      await loadPendingApprovalsData();
    } catch (error) {
      console.error('Decline error:', error);
      showToast('Failed to decline user', 'error');
    }
  };

  const openApprovalModal = (user, userType) => {
    setSelectedUserForApproval(user);
    setApprovalUserType(userType);
    setIsApprovalModalOpen(true);
  };

  // Calculate statistics
  const totalSales = orders.reduce((sum, order) => sum + (order.status === 'Completed' || order.status === 'Delivered' ? order.amount : 0), 0);
  const lowStockProducts = products.filter(p => p.stock <= 10);
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const activeDeliveries = orders.filter(o => o.status === 'Out for Delivery' || o.deliveryStatus === 'In Transit').length;

  // Calculate trends (mock data - in real app, compare with previous period)
  const salesTrend = { trend: 'up', value: '+12.5%' };
  const ordersTrend = { trend: 'up', value: '+8.3%' };
  const productsTrend = { trend: 'neutral', value: '0%' };
  const usersTrend = { trend: 'up', value: '+5.2%' };

  // Analytics data
  const orderStatusData = [
    { label: 'Pending', value: orders.filter(o => o.status === 'Pending').length },
    { label: 'Confirmed', value: orders.filter(o => o.status === 'Confirmed').length },
    { label: 'Preparing', value: orders.filter(o => o.status === 'Preparing').length },
    { label: 'Processing', value: orders.filter(o => o.status === 'Processing').length },
    { label: 'Out for Delivery', value: orders.filter(o => o.status === 'Out for Delivery').length },
    { label: 'Delivered', value: orders.filter(o => o.status === 'Delivered' || o.status === 'Completed').length },
    { label: 'Cancelled', value: orders.filter(o => o.status === 'Cancelled').length }
  ].filter(item => item.value > 0); // Only show statuses with orders

  // Calculate top products based on actual sales from orders
  const productSalesMap = {};
  orders.forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        const productId = item.productId || item.id;
        const productName = item.name || item.productName;
        if (productName) {
          if (!productSalesMap[productName]) {
            productSalesMap[productName] = {
              name: productName,
              quantity: 0,
              revenue: 0
            };
          }
          productSalesMap[productName].quantity += item.quantity || 0;
          productSalesMap[productName].revenue += (item.price || 0) * (item.quantity || 0);
        }
      });
    }
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
    .map(p => ({
      label: p.name,
      value: p.quantity,
      revenue: p.revenue
    }));

  // Calculate category data based on products with sales
  const categoryData = [...new Set(products.map(p => p.category))].map(cat => {
    const categoryProducts = products.filter(p => p.category === cat);
    const categorySales = categoryProducts.reduce((sum, product) => {
      const productSales = productSalesMap[product.name];
      return sum + (productSales ? productSales.quantity : 0);
    }, 0);

    return {
      label: cat,
      value: categoryProducts.length,
      sales: categorySales
    };
  }).filter(cat => cat.value > 0); // Only show categories with products

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

  // Bulk actions handler
  const handleBulkAction = async (action, items, newStatus) => {
    try {
      if (action === 'delete') {
        // Delete selected items
        for (const itemId of items) {
          if (bulkActionType === 'products') {
            await deleteProduct(itemId);
          } else if (bulkActionType === 'orders') {
            await deleteOrder(itemId);
          }
        }
        showToast(`${items.length} ${bulkActionType} deleted successfully!`, 'success');
      } else if (action === 'update_status' && bulkActionType === 'orders') {
        // Update order status
        for (const itemId of items) {
          await updateOrderStatus(itemId, newStatus);
        }
        showToast(`${items.length} orders updated successfully!`, 'success');
      } else if (action === 'export') {
        // Export to CSV
        exportToCSV(items, bulkActionType);
        showToast('Data exported successfully!', 'success');
      }

      // Refresh data
      const refreshData = async () => {
        if (bulkActionType === 'products') {
          const productsData = await getProducts();
          if (productsData.success) setProducts(productsData.products);
        } else if (bulkActionType === 'orders') {
          const ordersData = await getOrders();
          if (ordersData.success) setOrders(ordersData.orders);
        }
      };
      await refreshData();
      setSelectedItems([]);
    } catch (error) {
      console.error('Bulk action error:', error);
      showToast('Failed to perform bulk action', 'error');
    }
  };

  // Export to CSV
  const exportToCSV = (itemIds, type) => {
    let data = [];
    let headers = [];

    if (type === 'products') {
      data = products.filter(p => itemIds.includes(p.id));
      headers = ['SKU', 'Name', 'Category', 'Price', 'Stock', 'Seller'];
      const csvContent = [
        headers.join(','),
        ...data.map(p => [p.sku, p.name, p.category, p.price, p.stock, p.seller].join(','))
      ].join('\n');
      downloadCSV(csvContent, 'products.csv');
    } else if (type === 'orders') {
      data = orders.filter(o => itemIds.includes(o.id));
      headers = ['Order Number', 'Customer', 'Amount', 'Status', 'Date'];
      const csvContent = [
        headers.join(','),
        ...data.map(o => [o.orderNumber, o.customer, o.amount, o.status, new Date(o.date).toLocaleDateString()].join(','))
      ].join('\n');
      downloadCSV(csvContent, 'orders.csv');
    }
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Toggle item selection
  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Select all items
  const selectAllItems = (items) => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item.id));
    }
  };

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

  // Show loading state only while initial profile is being fetched
  if (isLoadingProfile) {
    return (
      <div className="font-inter text-gray-800 bg-gradient-to-b from-white to-gray-50 min-h-screen">
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
            {[1, 2, 3, 4, 5, 6].map(i => (
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
    <div className="font-inter text-gray-800 bg-gradient-to-b from-white to-gray-50 min-h-screen">
      {/* Loading Progress Bar */}
      <LoadingProgressBar isLoading={isLoading} />

      {/* Header */}
      <DashboardNavbar
        userType="admin"
        onLogout={handleLogout}
        onNavigate={(page) => {
          setCurrentPage(page);
          loadNotificationCount();
        }}
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
          isLoading={isLoading}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-4 overflow-y-auto lg:ml-0">
          <div key={currentPage}>
            <h1 className="text-xl font-bold mb-4 mt-12 lg:mt-0">{getPageTitle()}</h1>

            {/* Loading State */}
            {!canRenderSection(currentPage) ? (
              <div className="space-y-6">
                {currentPage === 'dashboard' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <SkeletonLoader variant="stat-card" count={4} />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <SkeletonLoader variant="chart" count={2} />
                    </div>
                  </>
                )}
                {currentPage === 'products' && (
                  <>
                    <div className="h-12 bg-gray-200 rounded animate-pulse mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      <SkeletonLoader variant="product-card" count={8} />
                    </div>
                  </>
                )}
                {currentPage === 'orders' && (
                  <>
                    <div className="h-12 bg-gray-200 rounded animate-pulse mb-4"></div>
                    <div className="space-y-4">
                      <SkeletonLoader variant="order-card" count={6} />
                    </div>
                  </>
                )}
                {(currentPage === 'sellers' || currentPage === 'riders' || currentPage === 'customers' || currentPage === 'pending-approvals') && (
                  <>
                    <div className="h-12 bg-gray-200 rounded animate-pulse mb-4"></div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <SkeletonLoader variant="user-card" count={6} />
                    </div>
                  </>
                )}
                {(currentPage === 'profile-settings' || currentPage === 'account-settings') && (
                  <SkeletonLoader variant="profile" count={1} />
                )}
              </div>
            ) : (
              <>
                {/* Dashboard Page */}
                {currentPage === 'dashboard' && (
                  <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={async () => {
                          try {
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
                            showToast('Dashboard refreshed!', 'success');
                          } catch (error) {
                            console.error('Refresh error:', error);
                            showToast('Failed to refresh dashboard', 'error');
                          }
                        }}
                        className="inline-flex items-center gap-2 bg-white border hover:bg-gray-50 py-2 px-4 rounded-lg"
                      >
                        🔄 Refresh
                      </button>
                      <button
                        onClick={() => setShowAnalytics(!showAnalytics)}
                        className={`inline-flex items-center gap-2 py-2 px-4 rounded-lg ${showAnalytics ? 'bg-rose-500 text-white' : 'bg-white border hover:bg-gray-50'
                          }`}
                      >
                        📊 {showAnalytics ? 'Hide' : 'Show'} Analytics
                      </button>
                      <button
                        onClick={() => {
                          try {
                            exportDashboardSummary({
                              statistics: {
                                totalProducts: products.length,
                                totalOrders: orders.length,
                                totalSellers: sellers.length,
                                totalRiders: riders.length,
                                totalCustomers: customers.length,
                                totalSales: totalSales,
                                lowStockProducts: lowStockProducts.length,
                                pendingOrders: pendingOrders,
                                activeDeliveries: activeDeliveries
                              },
                              products,
                              orders,
                              sellers,
                              riders,
                              customers,
                              lowStockProducts,
                              topProducts,
                              orderStatusData,
                              categoryData
                            });
                            showToast('Dashboard summary exported to Excel!', 'success');
                          } catch (error) {
                            console.error('Export error:', error);
                            showToast('Failed to export summary', 'error');
                          }
                        }}
                        className="inline-flex items-center gap-2 bg-white border hover:bg-gray-50 py-2 px-4 rounded-lg"
                      >
                        📊 Export to Excel
                      </button>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                      <StatisticsCard
                        title="Total Sales"
                        value={`₱${totalSales.toLocaleString()}`}
                        icon="💰"
                        trend={salesTrend.trend}
                        trendValue={salesTrend.value}
                        color="rose"
                        delay={0}
                      />
                      <StatisticsCard
                        title="Total Orders"
                        value={orders.length}
                        icon="📦"
                        trend={ordersTrend.trend}
                        trendValue={ordersTrend.value}
                        color="blue"
                        delay={0.05}
                      />
                      <StatisticsCard
                        title="Products"
                        value={products.length}
                        icon="🏷️"
                        trend={productsTrend.trend}
                        trendValue={productsTrend.value}
                        color="green"
                        delay={0.1}
                      />
                      <StatisticsCard
                        title="Pending Orders"
                        value={pendingOrders}
                        icon="⏳"
                        color="yellow"
                        delay={0.15}
                      />
                      <StatisticsCard
                        title="Active Deliveries"
                        value={activeDeliveries}
                        icon="🚚"
                        color="purple"
                        delay={0.2}
                      />
                      <StatisticsCard
                        title="Total Users"
                        value={sellers.length + riders.length + customers.length}
                        icon="👥"
                        trend={usersTrend.trend}
                        trendValue={usersTrend.value}
                        color="orange"
                        delay={0.25}
                      />
                    </div>

                    {/* Analytics Section */}
                    {showAnalytics && (
                      <>
                        {/* Sales Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="card p-4 text-center">
                            <p className="text-sm text-gray-600 mb-1">Total Products Sold</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {Object.values(productSalesMap).reduce((sum, p) => sum + p.quantity, 0)}
                            </p>
                          </div>
                          <div className="card p-4 text-center">
                            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                            <p className="text-2xl font-bold text-green-600">
                              ₱{Object.values(productSalesMap).reduce((sum, p) => sum + p.revenue, 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="card p-4 text-center">
                            <p className="text-sm text-gray-600 mb-1">Avg Order Value</p>
                            <p className="text-2xl font-bold text-purple-600">
                              ₱{orders.length > 0 ? (orders.reduce((sum, o) => sum + (o.amount || o.total || 0), 0) / orders.length).toFixed(2) : '0'}
                            </p>
                          </div>
                          <div className="card p-4 text-center">
                            <p className="text-sm text-gray-600 mb-1">Unique Products Sold</p>
                            <p className="text-2xl font-bold text-orange-600">
                              {Object.keys(productSalesMap).length}
                            </p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <AnalyticsChart
                            title="Order Status Distribution"
                            data={orderStatusData}
                            type="bar"
                            color="blue"
                          />
                          <AnalyticsChart
                            title="Top 5 Products by Sales"
                            data={topProducts.length > 0 ? topProducts : [{ label: 'No sales yet', value: 0 }]}
                            type="bar"
                            color="green"
                          />
                          <AnalyticsChart
                            title="Products by Category"
                            data={categoryData.length > 0 ? categoryData : [{ label: 'No products yet', value: 0 }]}
                            type="bar"
                            color="orange"
                          />
                        </div>
                      </>
                    )}

                    {/* Recent Activity & Low Stock */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <ActivityLog activities={activityLog} limit={8} />
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

                {/* Pending Approvals Page */}
                {currentPage === 'pending-approvals' && (
                  <div className="space-y-6">
                    {/* Refresh Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={async () => {
                          try {
                            await loadPendingApprovalsData();
                            showToast('Pending approvals refreshed!', 'success');
                          } catch (error) {
                            console.error('Refresh error:', error);
                            showToast('Failed to refresh pending approvals', 'error');
                          }
                        }}
                        className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
                      >
                        🔄 Refresh
                      </button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="card p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">Pending Sellers</h3>
                          <span className="text-3xl">🏪</span>
                        </div>
                        <p className="text-4xl font-bold text-rose-600">{pendingSellers.length}</p>
                        <p className="text-sm text-gray-600 mt-2">Awaiting approval</p>
                      </div>

                      <div className="card p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">Pending Riders</h3>
                          <span className="text-3xl">🚴</span>
                        </div>
                        <p className="text-4xl font-bold text-blue-600">{pendingDeliveries.length}</p>
                        <p className="text-sm text-gray-600 mt-2">Awaiting approval</p>
                      </div>
                    </div>

                    {/* Pending Sellers Section */}
                    {pendingSellers.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Pending Sellers</h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {pendingSellers.map(seller => (
                            <div
                              key={seller.id || seller._id}
                              className="card p-4 hover:shadow-lg transition-all cursor-pointer"
                              onClick={() => openApprovalModal(seller, 'seller')}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">{seller.businessName}</h4>
                                  <p className="text-sm text-gray-600">{seller.ownerName}</p>
                                </div>
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                  Pending
                                </span>
                              </div>

                              <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <span>📧</span>
                                  <span className="truncate">{seller.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span>📞</span>
                                  <span>{seller.phone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span>🏢</span>
                                  <span className="truncate">{seller.businessType}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span>📍</span>
                                  <span className="truncate">{seller.city}, {seller.province}</span>
                                </div>
                              </div>

                              <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500">
                                Registered: {new Date(seller.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pending Delivery Partners Section */}
                    {pendingDeliveries.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Pending Delivery Partners</h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {pendingDeliveries.map(delivery => (
                            <div
                              key={delivery.id || delivery._id}
                              className="card p-4 hover:shadow-lg transition-all cursor-pointer"
                              onClick={() => openApprovalModal(delivery, 'delivery')}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">{delivery.fullname}</h4>
                                  <p className="text-sm text-gray-600">{delivery.vehicleType}</p>
                                </div>
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                  Pending
                                </span>
                              </div>

                              <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <span>📧</span>
                                  <span className="truncate">{delivery.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span>📞</span>
                                  <span>{delivery.phone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span>🚗</span>
                                  <span className="truncate">{delivery.vehiclePlate || delivery.licenseNumber}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span>📍</span>
                                  <span className="truncate">{delivery.city}, {delivery.province}</span>
                                </div>
                              </div>

                              <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500">
                                Registered: {new Date(delivery.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Empty State */}
                    {pendingSellers.length === 0 && pendingDeliveries.length === 0 && (
                      <div className="card p-12 text-center">
                        <div className="text-6xl mb-4">✅</div>
                        <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
                        <p className="text-gray-600">There are no pending approvals at the moment.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Products Page */}
                {currentPage === 'products' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">Products</h3>
                        {selectedItems.length > 0 && (
                          <span className="bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-sm font-medium">
                            {selectedItems.length} selected
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={async () => {
                            try {
                              const productsData = await getProducts();
                              if (productsData.success) {
                                setProducts(productsData.products);
                                showToast('Products refreshed!', 'success');
                              }
                            } catch (error) {
                              console.error('Refresh error:', error);
                              showToast('Failed to refresh products', 'error');
                            }
                          }}
                          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
                        >
                          🔄 Refresh
                        </button>
                        {selectedItems.length > 0 && (
                          <button
                            onClick={() => {
                              setBulkActionType('products');
                              setIsBulkActionsModalOpen(true);
                            }}
                            className="inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg"
                          >
                            ⚡ Bulk Actions
                          </button>
                        )}
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
                              <th className="p-3 w-[50px]">
                                <input
                                  type="checkbox"
                                  checked={selectedItems.length === getFilteredProducts().length && getFilteredProducts().length > 0}
                                  onChange={() => selectAllItems(getFilteredProducts())}
                                  className="w-4 h-4 rounded border-gray-300"
                                />
                              </th>
                              <th className="p-3 w-[120px]">SKU</th>
                              <th className="p-3">Name</th>
                              <th className="p-3 w-[140px]">Category</th>
                              <th className="p-3 w-[120px]">Seller</th>
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
                                  <td className="p-3">
                                    <input
                                      type="checkbox"
                                      checked={selectedItems.includes(product.id)}
                                      onChange={() => toggleItemSelection(product.id)}
                                      className="w-4 h-4 rounded border-gray-300"
                                    />
                                  </td>
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
                                  <td className="p-3">
                                    <span className="text-sm text-gray-600">
                                      {product.seller || product.sellerName || 'N/A'}
                                    </span>
                                  </td>
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
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">Orders</h3>
                        {selectedItems.length > 0 && (
                          <span className="bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-sm font-medium">
                            {selectedItems.length} selected
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={async () => {
                            try {
                              const ordersData = await getOrders();
                              if (ordersData.success) {
                                setOrders(ordersData.orders);
                                showToast('Orders refreshed!', 'success');
                              }
                            } catch (error) {
                              console.error('Refresh error:', error);
                              showToast('Failed to refresh orders', 'error');
                            }
                          }}
                          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
                        >
                          🔄 Refresh
                        </button>
                        {selectedItems.length > 0 && (
                          <button
                            onClick={() => {
                              setBulkActionType('orders');
                              setIsBulkActionsModalOpen(true);
                            }}
                            className="inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg"
                          >
                            ⚡ Bulk Actions
                          </button>
                        )}
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
                              <th className="p-3 w-[50px]">
                                <input
                                  type="checkbox"
                                  checked={selectedItems.length === getFilteredOrders().length && getFilteredOrders().length > 0}
                                  onChange={() => selectAllItems(getFilteredOrders())}
                                  className="w-4 h-4 rounded border-gray-300"
                                />
                              </th>
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
                                    className={`border-b hover:shadow-md transition-all ${getStatusBackgroundColor(getDisplayStatus(order))}`}
                                  >
                                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                                      <input
                                        type="checkbox"
                                        checked={selectedItems.includes(order.id)}
                                        onChange={() => toggleItemSelection(order.id)}
                                        className="w-4 h-4 rounded border-gray-300"
                                      />
                                    </td>
                                    <td
                                      className="p-3 cursor-pointer"
                                      onClick={() => {
                                        setSelectedOrderForTracking(order);
                                        setShowOrderTrackingModal(true);
                                      }}
                                    >
                                      <div>
                                        <p className="font-medium">{order.orderNumber || 'N/A'}</p>
                                        {order.deliveryPerson && (
                                          <p className="text-xs text-blue-600 mt-1">
                                            🚚 {order.deliveryPerson.name}
                                          </p>
                                        )}
                                      </div>
                                    </td>
                                    <td
                                      className="p-3 cursor-pointer"
                                      onClick={() => {
                                        setSelectedOrderForTracking(order);
                                        setShowOrderTrackingModal(true);
                                      }}
                                    >{order.customer || 'N/A'}</td>
                                    <td
                                      className="p-3 cursor-pointer"
                                      onClick={() => {
                                        setSelectedOrderForTracking(order);
                                        setShowOrderTrackingModal(true);
                                      }}
                                    >₱{(order.amount || 0).toLocaleString()}</td>
                                    <td
                                      className="p-3 cursor-pointer"
                                      onClick={() => {
                                        setSelectedOrderForTracking(order);
                                        setShowOrderTrackingModal(true);
                                      }}
                                    >
                                      <span className={`chip ${getStatusColor(getDisplayStatus(order))}`}>
                                        {getStatusIcon(getDisplayStatus(order))} {getDisplayStatus(order)}
                                      </span>
                                    </td>
                                    <td
                                      className="p-3 cursor-pointer"
                                      onClick={() => {
                                        setSelectedOrderForTracking(order);
                                        setShowOrderTrackingModal(true);
                                      }}
                                    >{order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}</td>
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
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold capitalize">{currentPage}</h3>
                        {currentPage === 'riders' && (
                          <div className="group relative">
                            <button className="text-blue-500 hover:text-blue-600 text-sm">
                              ℹ️
                            </button>
                            <div className="hidden group-hover:block absolute left-0 top-6 z-10 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
                              <p className="font-semibold text-gray-800 mb-2">📋 Rider Status Guide</p>
                              <div className="space-y-2 text-gray-600">
                                <p><span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span> <strong>Active:</strong> Can be assigned deliveries</p>
                                <p><span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1"></span> <strong>Inactive:</strong> Cannot be assigned</p>
                                <p><span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1"></span> <strong>Available:</strong> Ready for new deliveries</p>
                                <p><span className="inline-block w-2 h-2 bg-gray-500 rounded-full mr-1"></span> <strong>Unavailable:</strong> Busy or offline</p>
                                <p className="mt-2 pt-2 border-t text-yellow-700">
                                  💡 <strong>Note:</strong> Only riders who are both Active AND Available will appear in the "Assign Delivery" modal.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={async () => {
                            try {
                              let data;
                              if (currentPage === 'sellers') {
                                data = await getSellers();
                                if (data.success) {
                                  setSellers(data.sellers);
                                  showToast('Sellers refreshed!', 'success');
                                }
                              } else if (currentPage === 'riders') {
                                data = await getRiders();
                                if (data.success) {
                                  setRiders(data.riders);
                                  showToast('Riders refreshed!', 'success');
                                }
                              } else {
                                data = await getCustomers();
                                if (data.success) {
                                  setCustomers(data.customers);
                                  showToast('Customers refreshed!', 'success');
                                }
                              }
                            } catch (error) {
                              console.error('Refresh error:', error);
                              showToast(`Failed to refresh ${currentPage}`, 'error');
                            }
                          }}
                          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
                        >
                          🔄 Refresh
                        </button>
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
                              <div key={user.id} className="card p-4 hover-animate relative">
                                {/* Account Status Indicator for all user types */}
                                <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${(user.isActive !== undefined ? user.isActive : true)
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                    }`}>
                                    <span className={`w-2 h-2 rounded-full ${(user.isActive !== undefined ? user.isActive : true) ? 'bg-green-500' : 'bg-red-500'
                                      }`}></span>
                                    {(user.isActive !== undefined ? user.isActive : true) ? 'Active' : 'Inactive'}
                                  </span>
                                  {/* Availability Status for Riders only */}
                                  {currentPage === 'riders' && (
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${(user.isAvailable !== undefined ? user.isAvailable : true)
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-800'
                                      }`}>
                                      <span className={`w-2 h-2 rounded-full ${(user.isAvailable !== undefined ? user.isAvailable : true) ? 'bg-blue-500' : 'bg-gray-500'
                                        }`}></span>
                                      {(user.isAvailable !== undefined ? user.isAvailable : true) ? 'Available' : 'Unavailable'}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-3 mb-3">
                                  <div className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center border-2 ${currentPage === 'sellers'
                                      ? 'bg-rose-50 border-rose-500'
                                      : currentPage === 'riders'
                                        ? 'bg-blue-50 border-blue-500'
                                        : 'bg-purple-50 border-purple-500'
                                    }`}>
                                    {user.image ? (
                                      <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <span className={`text-2xl font-semibold ${currentPage === 'sellers'
                                          ? 'text-rose-600'
                                          : currentPage === 'riders'
                                            ? 'text-blue-600'
                                            : 'text-purple-600'
                                        }`}>
                                        {currentPage === 'sellers' ? '🏪' : currentPage === 'riders' ? '🚚' : '👤'}
                                      </span>
                                    )}
                                  </div>
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
                                      setEditedUserData(user);
                                      setCurrentUserType(currentPage.slice(0, -1));
                                      setIsUserModalOpen(true);
                                    }}
                                    className="flex-1 py-2 px-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm"
                                  >
                                    Edit
                                  </button>
                                  {(currentPage === 'riders' || currentPage === 'sellers' || currentPage === 'customers') && (
                                    <button
                                      onClick={async () => {
                                        try {
                                          const currentStatus = user.isActive !== undefined ? user.isActive : true;
                                          const newStatus = !currentStatus;
                                          const userType = currentPage; // 'riders', 'sellers', or 'customers'

                                          // Call API to toggle status
                                          const response = await toggleUserStatus(userType, user.id, newStatus);

                                          if (response.success) {
                                            // Refresh the data from server to ensure consistency
                                            let refreshData;
                                            if (currentPage === 'riders') {
                                              refreshData = await getRiders();
                                              if (refreshData.success) {
                                                setRiders(refreshData.riders);
                                              }
                                            } else if (currentPage === 'sellers') {
                                              refreshData = await getSellers();
                                              if (refreshData.success) {
                                                setSellers(refreshData.sellers);
                                              }
                                            } else if (currentPage === 'customers') {
                                              refreshData = await getCustomers();
                                              if (refreshData.success) {
                                                setCustomers(refreshData.customers);
                                              }
                                            }

                                            const userTypeName = currentPage.slice(0, -1).charAt(0).toUpperCase() + currentPage.slice(1, -1);
                                            showToast(`${userTypeName} ${newStatus ? 'activated' : 'deactivated'} successfully!`, 'success');
                                          }
                                        } catch (error) {
                                          console.error('Toggle status error:', error);
                                          showToast(`Failed to update ${currentPage.slice(0, -1)} status`, 'error');
                                        }
                                      }}
                                      className={`flex-1 py-2 px-3 rounded-lg text-sm ${(user.isActive !== undefined ? user.isActive : true)
                                          ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                                        }`}
                                    >
                                      {(user.isActive !== undefined ? user.isActive : true) ? 'Deactivate' : 'Activate'}
                                    </button>
                                  )}
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
                        try {
                          exportDashboardSummary({
                            statistics: {
                              totalProducts: products.length,
                              totalOrders: orders.length,
                              totalSellers: sellers.length,
                              totalRiders: riders.length,
                              totalCustomers: customers.length,
                              totalSales: totalSales,
                              lowStockProducts: lowStockProducts.length,
                              pendingOrders: pendingOrders,
                              activeDeliveries: activeDeliveries
                            },
                            products,
                            orders,
                            sellers,
                            riders,
                            customers,
                            lowStockProducts,
                            topProducts,
                            orderStatusData,
                            categoryData
                          });
                          showToast('Summary report exported to Excel!', 'success');
                        } catch (error) {
                          console.error('Export error:', error);
                          showToast('Failed to export summary', 'error');
                        }
                      }}
                      className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded-lg btn-shine"
                    >
                      📊 Download Excel Report
                    </button>
                  </div>
                )}

                {/* Profile Settings Page */}
                {currentPage === 'profile-settings' && (
                  <ProfileSettings
                    userType="admin"
                    userData={adminProfile}
                    onUpdate={handleProfileUpdate}
                    onCancel={() => handleNavigate('dashboard')}
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
                    onCancel={() => handleNavigate('dashboard')}
                  />
                )}
              </>
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
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-rose-50 border-2 border-rose-500 flex items-center justify-center">
                        {profilePhotoPreview ? (
                          <img
                            src={profilePhotoPreview}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-rose-600 text-5xl font-semibold">⚙️</span>
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

            {editingItem && editedUserData && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-gray-300">
                    {editedUserData.image || editedUserData.photo ? (
                      <img src={editedUserData.image || editedUserData.photo} alt={editedUserData.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-600 text-3xl font-semibold">
                        {currentUserType === 'customer' ? '👤' : currentUserType === 'seller' ? '🏪' : currentUserType === 'rider' ? '🚚' : '👤'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold">{editedUserData.name || editedUserData.fullName}</h4>
                    <p className="text-sm text-gray-600">{editedUserData.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {currentUserType.charAt(0).toUpperCase() + currentUserType.slice(1)}
                      </span>
                      <button
                        onClick={async () => {
                          try {
                            const currentStatus = editedUserData.isActive !== undefined ? editedUserData.isActive : true;
                            const newStatus = !currentStatus;
                            const userTypeMap = {
                              'customer': 'customers',
                              'seller': 'sellers',
                              'rider': 'riders'
                            };

                            // Call API to toggle status
                            const response = await toggleUserStatus(userTypeMap[currentUserType], editedUserData.id, newStatus);

                            if (response.success) {
                              // Update the edited data
                              const updatedData = { ...editedUserData, isActive: newStatus };
                              setEditedUserData(updatedData);
                              setEditingItem(updatedData);

                              // Refresh the data from server to ensure consistency
                              let refreshData;
                              if (currentUserType === 'rider') {
                                refreshData = await getRiders();
                                if (refreshData.success) {
                                  setRiders(refreshData.riders);
                                }
                              } else if (currentUserType === 'seller') {
                                refreshData = await getSellers();
                                if (refreshData.success) {
                                  setSellers(refreshData.sellers);
                                }
                              } else if (currentUserType === 'customer') {
                                refreshData = await getCustomers();
                                if (refreshData.success) {
                                  setCustomers(refreshData.customers);
                                }
                              }

                              const userTypeName = currentUserType.charAt(0).toUpperCase() + currentUserType.slice(1);
                              showToast(`${userTypeName} ${newStatus ? 'activated' : 'deactivated'} successfully!`, 'success');
                            }
                          } catch (error) {
                            console.error('Toggle status error:', error);
                            showToast(`Failed to update ${currentUserType} status`, 'error');
                          }
                        }}
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${(editedUserData.isActive !== undefined ? editedUserData.isActive : true)
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${(editedUserData.isActive !== undefined ? editedUserData.isActive : true) ? 'bg-green-500' : 'bg-red-500'
                          }`}></span>
                        {(editedUserData.isActive !== undefined ? editedUserData.isActive : true) ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={editedUserData.name || editedUserData.fullName || ''}
                      onChange={(e) => setEditedUserData({ ...editedUserData, name: e.target.value, fullName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email (Read-only)</label>
                    <input
                      type="email"
                      value={editedUserData.email || ''}
                      readOnly
                      className="w-full px-3 py-2 rounded-xl border bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input
                      type="text"
                      value={editedUserData.phone || ''}
                      onChange={(e) => setEditedUserData({ ...editedUserData, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <OpenStreetMapAutocomplete
                      value={editedUserData.address || ''}
                      onChange={(value) => setEditedUserData({ ...editedUserData, address: value })}
                      onSelectAddress={(addressData) => {
                        // Store the full address string and optionally the detailed data
                        setEditedUserData({
                          ...editedUserData,
                          address: addressData.street
                            ? `${addressData.street}, ${addressData.barangay ? addressData.barangay + ', ' : ''}${addressData.city}, ${addressData.province}`
                            : editedUserData.address
                        });
                      }}
                      label="Address"
                      placeholder="Start typing address..."
                      className="w-full"
                    />
                  </div>

                  {/* User ID - Read Only */}
                  {editedUserData.id && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                      <input
                        type="text"
                        value={editedUserData.id}
                        readOnly
                        className="w-full px-3 py-2 rounded-xl border bg-gray-50 font-mono text-xs cursor-not-allowed"
                      />
                    </div>
                  )}

                  {/* Registration Date - Read Only */}
                  {editedUserData.createdAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Registered On</label>
                      <input
                        type="text"
                        value={new Date(editedUserData.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                        readOnly
                        className="w-full px-3 py-2 rounded-xl border bg-gray-50 cursor-not-allowed"
                      />
                    </div>
                  )}

                  {/* Seller-specific fields */}
                  {currentUserType === 'seller' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                        <input
                          type="text"
                          value={editedUserData.storeName || ''}
                          onChange={(e) => setEditedUserData({ ...editedUserData, storeName: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                          placeholder="Enter store name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Business License</label>
                        <input
                          type="text"
                          value={editedUserData.businessLicense || ''}
                          onChange={(e) => setEditedUserData({ ...editedUserData, businessLicense: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                          placeholder="Enter business license"
                        />
                      </div>
                    </>
                  )}

                  {/* Rider-specific fields */}
                  {currentUserType === 'rider' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                        <select
                          value={editedUserData.vehicleType || ''}
                          onChange={(e) => setEditedUserData({ ...editedUserData, vehicleType: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        >
                          <option value="">Select vehicle type</option>
                          <option value="Motorcycle">Motorcycle</option>
                          <option value="Bicycle">Bicycle</option>
                          <option value="Car">Car</option>
                          <option value="Van">Van</option>
                          <option value="Truck">Truck</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Plate Number</label>
                        <input
                          type="text"
                          value={editedUserData.plateNumber || editedUserData.vehiclePlate || ''}
                          onChange={(e) => setEditedUserData({ ...editedUserData, plateNumber: e.target.value, vehiclePlate: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                          placeholder="Enter plate number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Driver's License Number</label>
                        <input
                          type="text"
                          value={editedUserData.licenseNumber || ''}
                          onChange={(e) => setEditedUserData({ ...editedUserData, licenseNumber: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                          placeholder="Enter license number"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setIsUserModalOpen(false);
                      setEditingItem(null);
                      setEditedUserData(null);
                    }}
                    disabled={isSavingUser}
                    className="inline-flex items-center gap-2 bg-white border hover:bg-gray-50 py-2 px-4 rounded-lg disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        setIsSavingUser(true);

                        // Prepare update data
                        const updateData = {
                          name: editedUserData.name || editedUserData.fullName,
                          phone: editedUserData.phone,
                          address: editedUserData.address,
                        };

                        // Add type-specific fields
                        if (currentUserType === 'seller') {
                          updateData.storeName = editedUserData.storeName;
                          updateData.businessLicense = editedUserData.businessLicense;
                        } else if (currentUserType === 'rider') {
                          updateData.vehicleType = editedUserData.vehicleType;
                          updateData.plateNumber = editedUserData.plateNumber || editedUserData.vehiclePlate;
                          updateData.licenseNumber = editedUserData.licenseNumber;
                        }

                        // Call appropriate update function
                        let response;
                        if (currentUserType === 'customer') {
                          response = await updateCustomer(editedUserData.id, updateData);
                          if (response.success) {
                            setCustomers(customers.map(c =>
                              c.id === editedUserData.id ? { ...c, ...editedUserData } : c
                            ));
                          }
                        } else if (currentUserType === 'seller') {
                          response = await updateSeller(editedUserData.id, updateData);
                          if (response.success) {
                            setSellers(sellers.map(s =>
                              s.id === editedUserData.id ? { ...s, ...editedUserData } : s
                            ));
                          }
                        } else if (currentUserType === 'rider') {
                          response = await updateRider(editedUserData.id, updateData);
                          if (response.success) {
                            setRiders(riders.map(r =>
                              r.id === editedUserData.id ? { ...r, ...editedUserData } : r
                            ));
                          }
                        }

                        showToast(`${currentUserType.charAt(0).toUpperCase() + currentUserType.slice(1)} updated successfully!`, 'success');
                        setIsUserModalOpen(false);
                        setEditingItem(null);
                        setEditedUserData(null);
                      } catch (error) {
                        console.error('Update user error:', error);
                        showToast(error.message || 'Failed to update user', 'error');
                      } finally {
                        setIsSavingUser(false);
                      }
                    }}
                    disabled={isSavingUser}
                    className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded-lg disabled:opacity-50 btn-shine"
                  >
                    {isSavingUser ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        💾 Save Changes
                      </>
                    )}
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

                {deliveryPersons.length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                    <p className="text-yellow-800 font-medium mb-1">⚠️ No delivery persons available</p>
                    <p className="text-yellow-700 text-xs">
                      All delivery persons are either inactive or unavailable. Please activate riders in the Riders section.
                    </p>
                  </div>
                )}

                {deliveryPersons.length > 0 && deliveryPersons.length < 3 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                    <p className="text-blue-800 font-medium mb-1">ℹ️ Limited availability</p>
                    <p className="text-blue-700 text-xs">
                      Only {deliveryPersons.length} delivery {deliveryPersons.length === 1 ? 'person is' : 'persons are'} currently active and available. Check the Riders section to activate more.
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

      {/* Notification Center */}
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        onNavigate={(page) => {
          handleNavigate(page);
          setIsNotificationCenterOpen(false);
        }}
      />

      {/* Bulk Actions Modal */}
      <BulkActionsModal
        isOpen={isBulkActionsModalOpen}
        onClose={() => {
          setIsBulkActionsModalOpen(false);
          setSelectedItems([]);
        }}
        selectedItems={selectedItems}
        itemType={bulkActionType}
        onBulkAction={handleBulkAction}
      />

      {/* User Approval Modal */}
      {isApprovalModalOpen && selectedUserForApproval && (
        <UserApprovalModal
          user={selectedUserForApproval}
          userType={approvalUserType}
          onApprove={(userId) => handleApproveUser(userId, approvalUserType)}
          onDecline={(userId, reason) => handleDeclineUser(userId, reason, approvalUserType)}
          onClose={() => {
            setIsApprovalModalOpen(false);
            setSelectedUserForApproval(null);
            setApprovalUserType('');
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;