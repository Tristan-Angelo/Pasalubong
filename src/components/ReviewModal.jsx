import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';

const ReviewModal = ({ isOpen, onClose, order, onSubmit, userProfile }) => {
  const [reviews, setReviews] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && order) {
      // Initialize reviews state for each item
      const initialReviews = {};
      order.items.forEach(item => {
        // Check if already reviewed
        const existingReview = order.itemReviews?.find(
          ir => ir.productId.toString() === item.productId.toString()
        );
        
        initialReviews[item.productId] = {
          productId: item.productId,
          rating: 0,
          comment: '',
          images: [],
          alreadyReviewed: existingReview?.reviewed || false
        };
      });
      setReviews(initialReviews);
    }
  }, [isOpen, order]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const handleRatingChange = (productId, rating) => {
    setReviews(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        rating
      }
    }));
  };

  const handleCommentChange = (productId, comment) => {
    setReviews(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        comment
      }
    }));
  };

  const handleImageUpload = (productId, e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const currentImages = reviews[productId]?.images || [];
    if (currentImages.length + files.length > 3) {
      alert('You can upload maximum 3 images per review');
      return;
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert('Each image must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setReviews(prev => ({
          ...prev,
          [productId]: {
            ...prev[productId],
            images: [...(prev[productId]?.images || []), reader.result]
          }
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (productId, imageIndex) => {
    setReviews(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        images: prev[productId].images.filter((_, idx) => idx !== imageIndex)
      }
    }));
  };

  const handleSubmit = async () => {
    // Validate that at least one item has a rating
    const reviewsToSubmit = Object.values(reviews).filter(
      review => review.rating > 0 && !review.alreadyReviewed
    );

    if (reviewsToSubmit.length === 0) {
      alert('Please rate at least one product');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(reviewsToSubmit);
      // Don't close here - let the parent handle closing after success
    } catch (error) {
      console.error('Error submitting reviews:', error);
      // Reset submitting state on error
      setIsSubmitting(false);
    }
  };

  const unreviewedItems = order.items.filter(item => {
    const existingReview = order.itemReviews?.find(
      ir => ir.productId.toString() === item.productId.toString()
    );
    return !existingReview?.reviewed;
  });

  const reviewedCount = order.items.length - unreviewedItems.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-rose-50 to-orange-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              {userProfile?.photo ? (
                <img
                  src={userProfile.photo}
                  alt="Your profile"
                  className="w-12 h-12 rounded-full object-cover border-2 border-rose-300"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center text-white font-bold text-lg">
                  {userProfile?.fullname?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Rate Your Order</h2>
                <p className="text-sm text-gray-600">
                  Order #{order.orderNumber} {reviewedCount > 0 && `• ${reviewedCount}/${order.items.length} items reviewed`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {unreviewedItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold mb-2">All Items Reviewed!</h3>
              <p className="text-gray-600">You've already reviewed all items in this order.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {unreviewedItems.map((item) => {
                const review = reviews[item.productId] || {};
                
                return (
                  <div key={item.productId} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                    {/* Product Info */}
                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">₱{item.price} × {item.quantity}</p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Rating <span className="text-red-500">*</span>
                      </label>
                      <StarRating
                        value={review.rating || 0}
                        onChange={(rating) => handleRatingChange(item.productId, rating)}
                        size="lg"
                      />
                    </div>

                    {/* Comment */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Review (Optional)
                      </label>
                      <textarea
                        value={review.comment || ''}
                        onChange={(e) => handleCommentChange(item.productId, e.target.value)}
                        placeholder="Share your experience with this product..."
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
                        rows="3"
                        maxLength="500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {(review.comment || '').length}/500 characters
                      </p>
                    </div>

                    {/* Images */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Add Photos (Optional)
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {review.images?.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image}
                              alt={`Review ${index + 1}`}
                              className="w-20 h-20 object-cover rounded-lg border"
                            />
                            <button
                              onClick={() => handleRemoveImage(item.productId, index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 shadow-lg"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {(!review.images || review.images.length < 3) && (
                          <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-rose-400 hover:bg-rose-50 transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => handleImageUpload(item.productId, e)}
                              className="hidden"
                            />
                            <span className="text-2xl text-gray-400">+</span>
                          </label>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Max 3 images, 5MB each
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {unreviewedItems.length > 0 && (
          <div className="p-6 border-t bg-gray-50">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || Object.values(reviews).every(r => r.rating === 0 || r.alreadyReviewed)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-lg font-semibold hover:from-rose-600 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Submitting...
                  </span>
                ) : (
                  'Submit Reviews'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;