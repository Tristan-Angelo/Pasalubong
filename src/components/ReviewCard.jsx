import React, { useState } from 'react';
import StarRating from './StarRating';

const ReviewCard = ({ review }) => {
  const [showAllImages, setShowAllImages] = useState(false);

  const formatDate = (date) => {
    const reviewDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - reviewDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return reviewDate.toLocaleDateString();
  };

  return (
    <div className="border-b border-gray-200 py-4 last:border-b-0">
      <div className="flex items-start gap-3">
        {/* Buyer Avatar */}
        <div className="flex-shrink-0">
          {review.buyerPhoto ? (
            <img
              src={review.buyerPhoto}
              alt={review.buyerName}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center text-white font-bold">
              {review.buyerName?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </div>

        {/* Review Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h4 className="font-semibold text-gray-900">{review.buyerName || 'Anonymous'}</h4>
              <div className="flex items-center gap-2 mt-1">
                <StarRating value={review.rating} size="sm" readonly />
                <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
              </div>
            </div>
            {review.orderId && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                ✓ Verified Purchase
              </span>
            )}
          </div>

          {/* Review Comment */}
          {review.comment && (
            <p className="text-gray-700 text-sm mt-2 leading-relaxed">
              {review.comment}
            </p>
          )}

          {/* Review Images */}
          {review.images && review.images.length > 0 && (
            <div className="mt-3">
              <div className="flex gap-2 flex-wrap">
                {(showAllImages ? review.images : review.images.slice(0, 3)).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Review image ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => window.open(image, '_blank')}
                  />
                ))}
                {!showAllImages && review.images.length > 3 && (
                  <button
                    onClick={() => setShowAllImages(true)}
                    className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500 hover:border-rose-400 hover:text-rose-600 transition-colors"
                  >
                    <span className="text-xs font-medium">+{review.images.length - 3} more</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Helpful Count */}
          {review.helpful > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              👍 {review.helpful} {review.helpful === 1 ? 'person' : 'people'} found this helpful
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;