import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import DashboardSidebar from '../../components/DashboardSidebar';
import DashboardNavbar from '../../components/DashboardNavbar';
import ProfileSettings from '../../components/ProfileSettings';
import AccountSettings from '../../components/AccountSettings';
import RouteMap from '../../components/RouteMap';
import LoadingProgressBar from '../../components/LoadingProgressBar';
import SkeletonLoader from '../../components/SkeletonLoader';
import useLazyDashboardData from '../../hooks/useLazyDashboardData';
import {
  getDeliveryProfile,
  updateDeliveryProfile,
  changeDeliveryEmail,
  changeDeliveryPassword,
  getDeliveryAssignments,
  acceptDelivery,
  declineDelivery,
  updateDeliveryStatus,
  getDeliveryStatistics,
  getDeliveryEarnings,
  getDeliveryRoute
} from '../../utils/api';
import { getStatusChipColor, getStatusBackgroundColor, getStatusIcon, getDisplayStatus } from '../../utils/orderStatusStyles';

const DeliveryDashboard = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deliveries, setDeliveries] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [profile, setProfile] = useState(null);
  const [statistics, setStatistics] = useState({
    activeDeliveries: 0,
    completedDeliveries: 0,
    totalEarnings: 0,
    todayEarnings: 0
  });
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [selectedRouteDelivery, setSelectedRouteDelivery] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [proofOfDeliveryImages, setProofOfDeliveryImages] = useState({});
  const [proofOfDeliveryImagePreviews, setProofOfDeliveryImagePreviews] = useState({});
  const [showProofUploadModal, setShowProofUploadModal] = useState(false);
  const [selectedDeliveryForProof, setSelectedDeliveryForProof] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [deliveriesPagination, setDeliveriesPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalDeliveries: 0,
    deliveriesPerPage: 10
  });
  const [deliverySearchTerm, setDeliverySearchTerm] = useState('');
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState('');
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);

  // Define data loaders for each section
  const loadProfile = useCallback(async () => {
    try {
      const response = await getDeliveryProfile();
      if (response.success) {
        setProfile(response.profile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  const loadDeliveries = useCallback(async (page = null) => {
    try {
      const currentPage = page !== null ? page : deliveriesPagination.currentPage;
      const response = await getDeliveryAssignments(currentPage, deliveriesPagination.deliveriesPerPage);
      if (response.success) {
        setDeliveries(response.deliveries);
        if (response.pagination) {
          setDeliveriesPagination(response.pagination);
        }
      }
    } catch (error) {
      console.error('Error loading deliveries:', error);
    }
  }, [deliveriesPagination.currentPage, deliveriesPagination.deliveriesPerPage]);

  const handleDeclineDelivery = async (deliveryId) => {
    try {
      const response = await declineDelivery(deliveryId);
      if (response.success) {
        // Reload deliveries and statistics to reflect the change
        await Promise.all([loadDeliveries(), loadStatistics()]);
        showToast('Delivery declined. It will be available for other delivery persons.', 'info');
      }
    } catch (error) {
      console.error('Error declining delivery:', error);
      showToast(error.message || 'Failed to decline delivery', 'error');
    }
  };

  const loadStatistics = useCallback(async () => {
    try {
      const response = await getDeliveryStatistics();
      if (response.success) {
        setStatistics(response.statistics);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  }, []);

  const loadEarnings = useCallback(async () => {
    try {
      const response = await getDeliveryEarnings();
      if (response.success) {
        setEarnings(response.earnings);
      }
    } catch (error) {
      console.error('Error loading earnings:', error);
    }
  }, []);

  // Define data loaders for each section
  const dataLoaders = useMemo(() => ({
    dashboard: [loadDeliveries, loadStatistics],
    deliveries: [loadDeliveries, loadStatistics],
    earnings: [loadEarnings],
    'profile-settings': [loadProfile],
    'account-settings': [loadProfile]
  }), [loadDeliveries, loadStatistics, loadEarnings, loadProfile]);

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

  // Get current location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Error getting location:', error);
        }
      );
    }
  }, []);

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

  const handleUpdateDeliveryStatus = async (deliveryId, newStatus, proofImage = null, proofImages = null) => {
    try {
      const response = await updateDeliveryStatus(deliveryId, newStatus, proofImage, proofImages);
      if (response.success) {
        await loadDeliveries();
        await loadStatistics();
        showToast(`Delivery status updated to ${newStatus}`, 'success');
      }
    } catch (error) {
      console.error('Error updating delivery status:', error);
      showToast(error.message || 'Failed to update delivery status', 'error');
    }
  };

  const handleProofOfDeliveryUpload = (e, deliveryId) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    const currentImages = proofOfDeliveryImages[deliveryId] || [];
    const totalImages = currentImages.length + files.length;
    
    if (totalImages > 2) {
      showToast('Maximum 2 images allowed. Please clear existing photos first or select fewer images.', 'error');
      return;
    }

    // Validate all files
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        showToast('Please select valid image files only', 'error');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showToast('Each image size must be less than 5MB', 'error');
        return;
      }
    }

    // Process all files
    const imagePromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then(results => {
      setProofOfDeliveryImagePreviews(prev => ({
        ...prev,
        [deliveryId]: [...(prev[deliveryId] || []), ...results]
      }));
      setProofOfDeliveryImages(prev => ({
        ...prev,
        [deliveryId]: [...(prev[deliveryId] || []), ...results]
      }));
    });
  };

  const handleMarkDelivered = async (deliveryId) => {
    const proofImages = proofOfDeliveryImages[deliveryId] || [];
    
    if (proofImages.length < 2 || !proofImages[0] || !proofImages[1]) {
      showToast('Please upload both proof of delivery images', 'error');
      return;
    }

    await handleUpdateDeliveryStatus(deliveryId, 'Delivered', null, proofImages);
    setShowProofUploadModal(false);
    setSelectedDeliveryForProof(null);
    setProofOfDeliveryImages(prev => {
      const newProofs = { ...prev };
      delete newProofs[deliveryId];
      return newProofs;
    });
    setProofOfDeliveryImagePreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[deliveryId];
      return newPreviews;
    });
  };

  const handleAcceptDelivery = async (deliveryId) => {
    try {
      const response = await acceptDelivery(deliveryId);
      if (response.success) {
        await loadDeliveries();
        await loadStatistics();
        setShowAcceptModal(false);
        setSelectedDelivery(null);
        showToast('Delivery accepted successfully!', 'success');
      }
    } catch (error) {
      console.error('Error accepting delivery:', error);
      showToast(error.message || 'Failed to accept delivery', 'error');
    }
  };

  const handleViewRoute = async (delivery) => {
    setSelectedRouteDelivery(delivery);
    setShowRouteModal(true);
    setIsLoadingRoute(true);
    setRouteData(null);

    try {
      const response = await getDeliveryRoute(delivery.id);
      if (response.success) {
        setRouteData(response.route);
      }
    } catch (error) {
      console.error('Error loading route:', error);
      showToast(error.message || 'Failed to load route', 'error');
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const handleProfileUpdate = async (updatedData) => {
    try {
      const response = await updateDeliveryProfile(updatedData);
      if (response.success) {
        setProfile(response.profile);
        showToast('Profile updated successfully!', 'success');
      }
    } catch (error) {
      throw error;
    }
  };

  const handlePasswordUpdate = async (passwordData) => {
    try {
      const response = await changeDeliveryPassword(passwordData);
      if (response.success) {
        showToast('Password updated successfully!', 'success');
      }
    } catch (error) {
      throw error;
    }
  };

  const handleEmailUpdate = async (emailData) => {
    try {
      const response = await changeDeliveryEmail({
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
      const response = await updateDeliveryProfile({ phone: phoneData.newPhone });
      if (response.success) {
        setProfile(response.profile);
        showToast('Phone number updated successfully!', 'success');
      }
    } catch (error) {
      throw error;
    }
  };

  // Use imported utility function
  const getStatusColor = getStatusChipColor;

  const { activeDeliveries, completedDeliveries, totalEarnings, todayEarnings } = statistics;

  const renderDashboardPage = () => (
    <section className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
            <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Deliveries</p>
              <p className="text-2xl font-bold text-blue-600">{activeDeliveries}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xl">🚚</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Earnings</p>
              <p className="text-2xl font-bold text-green-600">₱{todayEarnings}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-xl">💰</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-purple-600">₱{totalEarnings}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-xl">📊</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-orange-600">{completedDeliveries}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-orange-600 text-xl">✅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Location */}
      {currentLocation && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Current Location</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-xl">📍</span>
            </div>
            <div>
              <p className="font-medium">GPS Location Active</p>
              <p className="text-sm text-gray-600">
                Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Active Deliveries */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Active Deliveries</h3>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                await loadDeliveries();
                showToast('Deliveries refreshed!', 'success');
              }}
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-lg text-sm"
            >
              🔄 Refresh
            </button>
            <button
              onClick={() => setActivePage('deliveries')}
              className="text-rose-600 hover:underline text-sm"
            >
              View All
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {deliveries.filter(d => ['Assigned', 'Accepted', 'Picked Up', 'In Transit'].includes(d.status)).slice(0, 3).map(delivery => (
            <div 
              key={delivery.id} 
              className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${getStatusBackgroundColor(getDisplayStatus(delivery))}`}
              onClick={() => setActivePage('deliveries')}
            >
              <div>
                <p className="font-medium">Delivery #{delivery.id}</p>
                <p className="text-sm text-gray-600">{delivery.customerName}</p>
                <p className="text-sm text-gray-600">{delivery.distance}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">₱{delivery.deliveryFee}</p>
                <span className={`chip ${getStatusColor(delivery.status)}`}>{delivery.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const renderDeliveriesPage = () => {
    // Filter deliveries based on search term and status
    const filteredDeliveries = deliveries.filter(delivery => {
      const matchesSearch = !deliverySearchTerm || 
        delivery.id.toString().toLowerCase().includes(deliverySearchTerm.toLowerCase()) ||
        delivery.orderId?.toString().toLowerCase().includes(deliverySearchTerm.toLowerCase()) ||
        delivery.customerName?.toLowerCase().includes(deliverySearchTerm.toLowerCase()) ||
        delivery.customerPhone?.toLowerCase().includes(deliverySearchTerm.toLowerCase()) ||
        delivery.pickupAddress?.toLowerCase().includes(deliverySearchTerm.toLowerCase()) ||
        delivery.deliveryAddress?.toLowerCase().includes(deliverySearchTerm.toLowerCase());
      
      const matchesStatus = !deliveryStatusFilter || delivery.status === deliveryStatusFilter;
      
      return matchesSearch && matchesStatus;
    });

    return (
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="text-lg font-semibold">Delivery Assignments ({deliveriesPagination.totalDeliveries})</h3>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Search deliveries..."
              value={deliverySearchTerm}
              onChange={(e) => setDeliverySearchTerm(e.target.value)}
              className="px-3 py-2 rounded-xl border outline-none"
            />
            <select
              value={deliveryStatusFilter}
              onChange={(e) => setDeliveryStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border"
            >
              <option value="">All Status</option>
              <option value="Assigned">Assigned</option>
              <option value="Accepted">Accepted</option>
              <option value="Picked Up">Picked Up</option>
              <option value="In Transit">In Transit</option>
              <option value="Delivered">Delivered</option>
            </select>
            <button
              onClick={async () => {
                await Promise.all([loadDeliveries(), loadStatistics()]);
                showToast('Deliveries refreshed!', 'success');
              }}
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
        <div className="space-y-4">
          {filteredDeliveries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold mb-2">No Deliveries Found</h3>
              <p className="text-gray-600 mb-4">
                {deliverySearchTerm || deliveryStatusFilter 
                  ? 'No deliveries match your search criteria. Try adjusting your filters.'
                  : 'There are currently no delivery assignments available.'}
              </p>
              {(deliverySearchTerm || deliveryStatusFilter) && (
                <button
                  onClick={() => {
                    setDeliverySearchTerm('');
                    setDeliveryStatusFilter('');
                  }}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            filteredDeliveries.map(delivery => (
          <div key={delivery.id} className={`card p-4 hover-animate ${getStatusBackgroundColor(getDisplayStatus(delivery))}`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold">Delivery #{delivery.id}</h3>
                <p className="text-sm text-gray-600">Order: {delivery.orderId}</p>
                <p className="text-sm text-gray-600">Customer: {delivery.customerName}</p>
                <p className="text-sm text-gray-600">Phone: {delivery.customerPhone}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">₱{delivery.deliveryFee}</p>
                <span className={`chip ${getStatusColor(getDisplayStatus(delivery))}`}>
                  {getStatusIcon(getDisplayStatus(delivery))} {getDisplayStatus(delivery)}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Pickup Address:</p>
                <p className="text-sm text-gray-600">{delivery.pickupAddress}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Delivery Address:</p>
                <p className="text-sm text-gray-600">{delivery.deliveryAddress}</p>
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-3">
              <p className="font-medium">Items:</p>
              {delivery.items.map((item, index) => (
                <p key={index}>• {item.name} (x{item.quantity})</p>
              ))}
            </div>

            {delivery.notes && (
              <div className="text-sm text-gray-600 mb-3">
                <p className="font-medium">Notes:</p>
                <p>{delivery.notes}</p>
              </div>
            )}

            <div className="flex gap-2 flex-wrap">
              {/* View Route Button - Available for accepted deliveries */}
              {(delivery.status === 'Accepted' || delivery.status === 'Picked Up' || delivery.status === 'In Transit') && (
                <button
                  onClick={() => handleViewRoute(delivery)}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white py-1 px-3 rounded text-sm flex items-center gap-1"
                >
                  🗺️ View Route
                </button>
              )}
              {delivery.status === 'Assigned' && (
                <>
                  <button
                    onClick={() => {
                      setSelectedDelivery(delivery);
                      setShowAcceptModal(true);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-sm"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDeclineDelivery(delivery.id)}
                    className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm"
                  >
                    Decline
                  </button>
                </>
              )}
              {delivery.status === 'Accepted' && (
                <button
                  onClick={() => handleUpdateDeliveryStatus(delivery.id, 'Picked Up')}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
                >
                  Mark Picked Up
                </button>
              )}
              {delivery.status === 'Picked Up' && (
                <button
                  onClick={() => handleUpdateDeliveryStatus(delivery.id, 'In Transit')}
                  className="bg-orange-500 hover:bg-orange-600 text-white py-1 px-3 rounded text-sm"
                >
                  Start Delivery
                </button>
              )}
              {delivery.status === 'In Transit' && (
                <button
                  onClick={() => {
                    setSelectedDeliveryForProof(delivery);
                    setShowProofUploadModal(true);
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-sm"
                >
                  Mark Delivered
                </button>
              )}
            </div>
            </div>
          ))
          )}
        </div>

        {/* Pagination Controls */}
        {deliveriesPagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 p-4 bg-white rounded-lg border">
          <div className="text-sm text-gray-600">
            Showing page {deliveriesPagination.currentPage} of {deliveriesPagination.totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                const newPage = deliveriesPagination.currentPage - 1;
                setIsPaginationLoading(true);
                setDeliveriesPagination(prev => ({ ...prev, currentPage: newPage }));
                await loadDeliveries(newPage);
                setIsPaginationLoading(false);
              }}
              disabled={deliveriesPagination.currentPage === 1 || isPaginationLoading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                deliveriesPagination.currentPage === 1 || isPaginationLoading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              ← Previous
            </button>
            <button
              onClick={async () => {
                const newPage = deliveriesPagination.currentPage + 1;
                setIsPaginationLoading(true);
                setDeliveriesPagination(prev => ({ ...prev, currentPage: newPage }));
                await loadDeliveries(newPage);
                setIsPaginationLoading(false);
              }}
              disabled={deliveriesPagination.currentPage === deliveriesPagination.totalPages || isPaginationLoading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                deliveriesPagination.currentPage === deliveriesPagination.totalPages || isPaginationLoading
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

  const renderEarningsPage = () => (
    <section className="space-y-6">
      <h3 className="text-lg font-semibold">Earnings & Payouts</h3>
      
      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">This Week</p>
            <p className="text-2xl font-bold text-green-600">₱{earnings.slice(0, 7).reduce((sum, e) => sum + e.totalEarnings, 0)}</p>
          </div>
        </div>
        <div className="card p-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">This Month</p>
            <p className="text-2xl font-bold text-blue-600">₱{earnings.reduce((sum, e) => sum + e.totalEarnings, 0)}</p>
          </div>
        </div>
        <div className="card p-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">Pending Payout</p>
            <p className="text-2xl font-bold text-orange-600">₱{earnings.filter(e => e.status === 'Pending').reduce((sum, e) => sum + e.totalEarnings, 0)}</p>
          </div>
        </div>
      </div>

      {/* Earnings History */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold">Earnings History</h4>
          <button
            onClick={async () => {
              await loadEarnings();
              showToast('Earnings refreshed!', 'success');
            }}
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm"
          >
            🔄 Refresh Earnings
          </button>
        </div>
        <div className="space-y-3">
          {earnings.map(earning => (
            <div key={earning.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{new Date(earning.date).toLocaleDateString()}</p>
                <p className="text-sm text-gray-600">{earning.deliveries} deliveries</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">₱{earning.totalEarnings}</p>
                <span className={`chip ${earning.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {earning.status}
                </span>
              </div>
            </div>
          ))}
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
              <div className="space-y-4">
                <SkeletonLoader variant="delivery-card" count={4} />
              </div>
            </>
          )}
          {activePage === 'deliveries' && (
            <>
              <div className="h-12 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-4">
                <SkeletonLoader variant="delivery-card" count={6} />
              </div>
            </>
          )}
          {activePage === 'earnings' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <SkeletonLoader variant="stat-card" count={3} />
              </div>
              <SkeletonLoader variant="chart" count={1} />
            </>
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
      case 'deliveries':
        return renderDeliveriesPage();
      case 'earnings':
        return renderEarningsPage();
      case 'profile-settings':
        return (
          <ProfileSettings
            userType="delivery"
            userData={profile}
            onUpdate={handleProfileUpdate}
            onCancel={() => handleNavigate('dashboard')}
          />
        );
      case 'account-settings':
        return (
          <AccountSettings
            userType="delivery"
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
      deliveries: 'Delivery Assignments',
      earnings: 'Earnings & Payouts',
      'profile-settings': 'Profile Settings',
      'account-settings': 'Account Settings'
    };
    return titles[activePage] || 'Dashboard';
  };

  const handleLogout = () => {
    // Clear all delivery-related data from storage
    localStorage.removeItem('delivery_logged_in');
    localStorage.removeItem('delivery_user');
    localStorage.removeItem('delivery_login_email');
    localStorage.removeItem('delivery_token');
    sessionStorage.removeItem('delivery_logged_in');
    sessionStorage.removeItem('delivery_user');
    sessionStorage.removeItem('delivery_token');
    
    // Navigate to login page
    navigate('/delivery/login');
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
            {[1, 2, 3, 4].map(i => (
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
        userType="delivery" 
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
          userType="delivery"
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

      {/* Accept Delivery Modal */}
      {showAcceptModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Accept Delivery</h2>
                <button
                  onClick={() => setShowAcceptModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Delivery #{selectedDelivery.id}</h3>
                  <p className="text-sm text-gray-600">Customer: {selectedDelivery.customerName}</p>
                  <p className="text-sm text-gray-600">Distance: {selectedDelivery.distance}</p>
                  <p className="text-sm text-gray-600">Delivery Fee: ₱{selectedDelivery.deliveryFee}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">Pickup Address:</p>
                  <p className="text-sm text-gray-600">{selectedDelivery.pickupAddress}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">Delivery Address:</p>
                  <p className="text-sm text-gray-600">{selectedDelivery.deliveryAddress}</p>
                </div>

                {selectedDelivery.notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Notes:</p>
                    <p className="text-sm text-gray-600">{selectedDelivery.notes}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      handleDeclineDelivery(selectedDelivery.id);
                      setShowAcceptModal(false);
                      setSelectedDelivery(null);
                    }}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleAcceptDelivery(selectedDelivery.id)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg"
                  >
                    Accept Delivery
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Route Map Modal */}
      {showRouteModal && selectedRouteDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Delivery Route</h2>
                <button
                  onClick={() => {
                    setShowRouteModal(false);
                    setSelectedRouteDelivery(null);
                    setRouteData(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Order Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Order Number</p>
                    <p className="font-semibold">{selectedRouteDelivery.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-semibold">{selectedRouteDelivery.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pickup Address</p>
                    <p className="text-sm">{selectedRouteDelivery.pickupAddress}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Delivery Address</p>
                    <p className="text-sm">{selectedRouteDelivery.deliveryAddress}</p>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {isLoadingRoute && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
                  <p className="text-gray-600">Loading route...</p>
                </div>
              )}

              {/* Route Map */}
              {!isLoadingRoute && routeData && (
                <div className="space-y-4">
                  <RouteMap
                    pickupLocation={routeData.pickup}
                    deliveryLocation={routeData.delivery}
                    distance={routeData.distance}
                    estimatedTime={routeData.estimatedTime}
                  />

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <a
                      href={routeData.routeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg text-center font-medium"
                    >
                      🧭 Open in OpenStreetMap
                    </a>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${routeData.pickup.lat},${routeData.pickup.lon}&destination=${routeData.delivery.lat},${routeData.delivery.lon}&travelmode=walking`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg text-center font-medium"
                    >
                      📱 Open in Google Maps
                    </a>
                  </div>
                </div>
              )}

              {/* Error State */}
              {!isLoadingRoute && !routeData && (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">Failed to load route</p>
                  <button
                    onClick={() => handleViewRoute(selectedRouteDelivery)}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
                    )}
              
                    {/* Proof of Delivery Upload Modal */}
                    {showProofUploadModal && selectedDeliveryForProof && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full">
                          <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                              <h2 className="text-lg font-semibold">Upload Proof of Delivery</h2>
                              <button
                                onClick={() => {
                                  setShowProofUploadModal(false);
                                  setSelectedDeliveryForProof(null);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                ✕
                              </button>
                            </div>
              
                            <div className="space-y-4">
                              <div>
                                <h3 className="font-medium">Delivery #{selectedDeliveryForProof.id}</h3>
                                <p className="text-sm text-gray-600">Customer: {selectedDeliveryForProof.customerName}</p>
                                <p className="text-sm text-gray-600">Address: {selectedDeliveryForProof.deliveryAddress}</p>
                              </div>
              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Upload Proof of Delivery Photos (2 Required)
                                </label>
                                
                                {/* Image Previews */}
                                {proofOfDeliveryImagePreviews[selectedDeliveryForProof.id]?.length > 0 && (
                                  <div className="grid grid-cols-2 gap-3 mb-4">
                                    {proofOfDeliveryImagePreviews[selectedDeliveryForProof.id].map((preview, index) => (
                                      <div key={index} className="relative">
                                        <img 
                                          src={preview} 
                                          alt={`Proof of delivery ${index + 1}`} 
                                          className="w-full h-32 object-cover rounded-lg border-2 border-green-500"
                                        />
                                        <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                          Photo {index + 1}
                                        </div>
                                        <button
                                          onClick={() => {
                                            setProofOfDeliveryImagePreviews(prev => {
                                              const newPreviews = { ...prev };
                                              newPreviews[selectedDeliveryForProof.id] = newPreviews[selectedDeliveryForProof.id].filter((_, i) => i !== index);
                                              if (newPreviews[selectedDeliveryForProof.id].length === 0) {
                                                delete newPreviews[selectedDeliveryForProof.id];
                                              }
                                              return newPreviews;
                                            });
                                            setProofOfDeliveryImages(prev => {
                                              const newImages = { ...prev };
                                              newImages[selectedDeliveryForProof.id] = newImages[selectedDeliveryForProof.id].filter((_, i) => i !== index);
                                              if (newImages[selectedDeliveryForProof.id].length === 0) {
                                                delete newImages[selectedDeliveryForProof.id];
                                              }
                                              return newImages;
                                            });
                                          }}
                                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Single File Input for Multiple Images */}
                                <div className="mb-4">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => handleProofOfDeliveryUpload(e, selectedDeliveryForProof.id)}
                                    className="hidden"
                                    id="proof-upload-multiple"
                                  />
                                  <label
                                    htmlFor="proof-upload-multiple"
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg cursor-pointer flex items-center justify-center gap-2 font-medium"
                                  >
                                    <span>📷</span>
                                    <span>
                                      {proofOfDeliveryImagePreviews[selectedDeliveryForProof.id]?.length === 0 || !proofOfDeliveryImagePreviews[selectedDeliveryForProof.id]
                                        ? 'Select Photos (2 Required)'
                                        : proofOfDeliveryImagePreviews[selectedDeliveryForProof.id]?.length === 1
                                        ? 'Add 1 More Photo'
                                        : 'Replace Photos'}
                                    </span>
                                  </label>
                                  <p className="text-xs text-gray-500 text-center mt-2">
                                    {proofOfDeliveryImagePreviews[selectedDeliveryForProof.id]?.length === 2
                                      ? 'You can remove individual photos and add new ones. Max 5MB per image.'
                                      : `Select ${2 - (proofOfDeliveryImagePreviews[selectedDeliveryForProof.id]?.length || 0)} more image${2 - (proofOfDeliveryImagePreviews[selectedDeliveryForProof.id]?.length || 0) === 1 ? '' : 's'}. JPG, PNG or GIF. Max 5MB per image.`}
                                  </p>
                                </div>

                                {/* Clear Button */}
                                {proofOfDeliveryImagePreviews[selectedDeliveryForProof.id]?.length > 0 && (
                                  <button
                                    onClick={() => {
                                      setProofOfDeliveryImagePreviews(prev => {
                                        const newPreviews = { ...prev };
                                        delete newPreviews[selectedDeliveryForProof.id];
                                        return newPreviews;
                                      });
                                      setProofOfDeliveryImages(prev => {
                                        const newImages = { ...prev };
                                        delete newImages[selectedDeliveryForProof.id];
                                        return newImages;
                                      });
                                    }}
                                    className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg text-sm"
                                  >
                                    ✕ Clear All Photos
                                  </button>
                                )}
                              </div>
              
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-xs text-blue-800">
                                  📝 <strong>Note:</strong> Please upload 2 photos:
                                </p>
                                <ul className="text-xs text-blue-700 mt-1 ml-4 list-disc">
                                  <li>Photo 1: Clear image of the package/product</li>
                                  <li>Photo 2: Delivery location or with customer</li>
                                </ul>
                              </div>
              
                              <div className="flex gap-3 pt-4">
                                <button
                                  onClick={() => {
                                    setShowProofUploadModal(false);
                                    setSelectedDeliveryForProof(null);
                                  }}
                                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleMarkDelivered(selectedDeliveryForProof.id)}
                                  disabled={
                                    !proofOfDeliveryImages[selectedDeliveryForProof.id] ||
                                    !proofOfDeliveryImages[selectedDeliveryForProof.id][0] ||
                                    !proofOfDeliveryImages[selectedDeliveryForProof.id][1]
                                  }
                                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Confirm Delivery
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
              
      {/* Loading Progress Bar */}
      <LoadingProgressBar isLoading={isLoading || isPaginationLoading} />
                  </div>
  );
};

export default DeliveryDashboard;
