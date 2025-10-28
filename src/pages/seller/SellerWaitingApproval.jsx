import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSellerApprovalStatus } from '../../utils/api';

const SellerWaitingApproval = () => {
  const navigate = useNavigate();
  const [approvalStatus, setApprovalStatus] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkApprovalStatus();
    
    // Poll approval status every 10 seconds
    const interval = setInterval(() => {
      checkApprovalStatus();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const checkApprovalStatus = async () => {
    try {
      const response = await getSellerApprovalStatus();
      setApprovalStatus(response.approvalStatus);
      setIsLoading(false);

      // If approved, redirect to dashboard
      if (response.approvalStatus === 'approved' && response.isApproved) {
        setTimeout(() => {
          navigate('/seller/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking approval status:', error);
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('seller_logged_in');
    localStorage.removeItem('seller_user');
    localStorage.removeItem('seller_token');
    sessionStorage.removeItem('seller_logged_in');
    sessionStorage.removeItem('seller_user');
    sessionStorage.removeItem('seller_token');
    navigate('/seller/login');
  };

  const getStatusConfig = () => {
    switch (approvalStatus) {
      case 'approved':
        return {
          icon: '✅',
          title: 'Account Approved!',
          message: 'Your account has been approved. Redirecting to dashboard...',
          color: 'green',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800'
        };
      case 'declined':
        return {
          icon: '❌',
          title: 'Account Declined',
          message: 'Unfortunately, your account verification was declined. Please contact support for more information or re-upload your valid ID.',
          color: 'red',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800'
        };
      default:
        return {
          icon: '⏳',
          title: 'Pending Approval',
          message: 'Your account is currently under review. This usually takes 24-48 hours.',
          color: 'yellow',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800'
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-rose-50 to-amber-50 text-gray-800 overflow-x-hidden flex flex-col">
      {/* Simple Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b border-white/60">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl md:text-2xl font-extrabold tracking-tight gradient-text">
            Pasalubong
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="relative flex-1 flex items-center justify-center">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="w-[800px] h-[800px] rounded-full bg-rose-200/60 blur-3xl absolute -top-40 -left-40"></div>
          <div className="w-[800px] h-[800px] rounded-full bg-amber-200/60 blur-3xl absolute -bottom-40 -right-40"></div>
        </div>

        <section className="relative z-10 max-w-2xl mx-auto px-6 py-12">
          <div className="glass rounded-3xl p-8 md:p-12 text-center">
            {/* Animated Icon */}
            <div className="relative inline-block mb-6">
              <div className={`text-8xl ${approvalStatus === 'pending' ? 'animate-pulse' : ''}`}>
                {statusConfig.icon}
              </div>
              {approvalStatus === 'pending' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Status Title */}
            <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
              {statusConfig.title}
            </h1>

            {/* Status Message */}
            <div className={`mb-8 p-4 rounded-lg ${statusConfig.bgColor} border ${statusConfig.borderColor}`}>
              <p className={`${statusConfig.textColor} text-sm md:text-base`}>
                {statusConfig.message}
              </p>
            </div>

            {/* Additional Info for Pending */}
            {approvalStatus === 'pending' && (
              <div className="mb-8 space-y-4 text-left">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📋</span>
                  <div>
                    <h3 className="font-semibold mb-1">What happens next?</h3>
                    <p className="text-sm text-gray-600">
                      Our admin team will review your submitted documents and verify your information.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⏰</span>
                  <div>
                    <h3 className="font-semibold mb-1">How long does it take?</h3>
                    <p className="text-sm text-gray-600">
                      Most approvals are completed within 24-48 hours during business days.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📧</span>
                  <div>
                    <h3 className="font-semibold mb-1">Stay updated</h3>
                    <p className="text-sm text-gray-600">
                      You'll receive an email notification once your account is approved.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            {approvalStatus === 'declined' && (
              <div className="flex justify-center">
                <button
                  onClick={() => navigate('/seller/upload-valid-id')}
                  className="px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:from-rose-600 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all"
                >
                  Re-upload Valid ID
                </button>
              </div>
            )}

            {/* Contact Support */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Need help? <a href="mailto:support@pasalubong.com" className="text-rose-600 hover:underline font-semibold">Contact Support</a>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SellerWaitingApproval;