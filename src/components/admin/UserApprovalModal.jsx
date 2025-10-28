import React, { useState } from 'react';
import { ASSETS_BASE_URL } from '../../utils/api';

const UserApprovalModal = ({ user, userType, onApprove, onDecline, onClose }) => {
  const [isApproving, setIsApproving] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [showDeclineReason, setShowDeclineReason] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await onApprove(user.id || user._id);
      onClose();
    } catch (error) {
      console.error('Approve error:', error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleDecline = async () => {
    if (!declineReason.trim()) {
      alert('Please provide a reason for declining');
      return;
    }
    
    setIsDeclining(true);
    try {
      await onDecline(user.id || user._id, declineReason);
      onClose();
    } catch (error) {
      console.error('Decline error:', error);
    } finally {
      setIsDeclining(false);
    }
  };

  const isSeller = userType === 'seller';

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-rose-500 to-pink-600 text-white p-6 rounded-t-3xl z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {isSeller ? 'Seller' : 'Delivery Partner'} Verification
                </h2>
                <p className="text-rose-100 text-sm mt-1">Review and approve account</p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all"
              >
                <span className="text-xl">✕</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* User Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <span>👤</span> Personal Information
                </h3>
                
                {isSeller ? (
                  <>
                    <div>
                      <label className="text-sm text-gray-600">Business Name</label>
                      <p className="font-semibold">{user.businessName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Owner Name</label>
                      <p className="font-semibold">{user.ownerName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Business Type</label>
                      <p className="font-semibold">{user.businessType}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-sm text-gray-600">Full Name</label>
                      <p className="font-semibold">{user.fullname}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Vehicle Type</label>
                      <p className="font-semibold">{user.vehicleType}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">License Number</label>
                      <p className="font-semibold">{user.licenseNumber}</p>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <span>📞</span> Contact Information
                </h3>
                
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="font-semibold">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Phone</label>
                  <p className="font-semibold">{user.phone}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Location</label>
                  <p className="font-semibold">
                    {user.barangay}, {user.city}, {user.province}
                  </p>
                </div>
              </div>
            </div>

            {/* Valid ID Images */}
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span>🆔</span> Valid ID Images
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Front ID */}
                <div className="border-2 border-gray-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Front of ID</p>
                  {user.validIdFront ? (
                    <img
                      src={`${ASSETS_BASE_URL}${user.validIdFront}`}
                      alt="Front ID"
                      className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setSelectedImage(`${ASSETS_BASE_URL}${user.validIdFront}`)}
                    />
                  ) : (
                    <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500">
                      No image uploaded
                    </div>
                  )}
                </div>

                {/* Back ID */}
                <div className="border-2 border-gray-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Back of ID</p>
                  {user.validIdBack ? (
                    <img
                      src={`${ASSETS_BASE_URL}${user.validIdBack}`}
                      alt="Back ID"
                      className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setSelectedImage(`${ASSETS_BASE_URL}${user.validIdBack}`)}
                    />
                  ) : (
                    <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500">
                      No image uploaded
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                💡 Click on images to view in full size
              </p>
            </div>

            {/* Decline Reason Input */}
            {showDeclineReason && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <label className="block text-sm font-semibold text-red-900 mb-2">
                  Reason for Declining
                </label>
                <textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows="3"
                  placeholder="Please provide a reason for declining this application..."
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              {!showDeclineReason ? (
                <>
                  <button
                    onClick={handleApprove}
                    disabled={isApproving}
                    className="flex-1 py-3 px-6 rounded-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isApproving ? 'Approving...' : '✓ Approve Account'}
                  </button>
                  
                  <button
                    onClick={() => setShowDeclineReason(true)}
                    className="flex-1 py-3 px-6 rounded-xl font-bold bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 shadow-lg hover:shadow-xl transition-all"
                  >
                    ✕ Decline Account
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleDecline}
                    disabled={isDeclining || !declineReason.trim()}
                    className="flex-1 py-3 px-6 rounded-xl font-bold bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeclining ? 'Declining...' : 'Confirm Decline'}
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowDeclineReason(false);
                      setDeclineReason('');
                    }}
                    className="px-6 py-3 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-6xl max-h-[90vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-all"
            >
              ✕
            </button>
            <img
              src={selectedImage}
              alt="ID Preview"
              className="max-w-full max-h-[90vh] rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.9);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </>
  );
};

export default UserApprovalModal;