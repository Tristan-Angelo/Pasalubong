import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';
import ReviewCard from './ReviewCard';
import RatingDistribution from './RatingDistribution';

const ProductViewModal = ({ isOpen, onClose, product, onAddToCart, isFavorite, onToggleFavorite }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const productImages = product?.images || (product?.image ? [product.image] : []);

  useEffect(() => {
    // Reset to first image when product changes
    setCurrentImageIndex(0);
    setImageLoaded(false);
  }, [product]);

  useEffect(() => {
    // Prevent body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const handlePrevImage = () => {
    setImageLoaded(false);
    setCurrentImageIndex(prev => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setImageLoaded(false);
    setCurrentImageIndex(prev => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
      style={{ animation: 'fadeIn 0.3s ease-out' }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes imageZoom {
          from { 
            opacity: 0;
            transform: scale(0.9);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .animate-imageZoom {
          animation: imageZoom 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }
        .scrollbar-custom {
          overflow-y: auto !important;
        }
        .scrollbar-custom::-webkit-scrollbar {
          width: 12px;
        }
        .scrollbar-custom::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 10px;
          border: 3px solid #f1f5f9;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
        /* Firefox scrollbar */
        .scrollbar-custom {
          scrollbar-width: auto;
          scrollbar-color: #94a3b8 #f1f5f9;
        }
      `}</style>
      
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid lg:grid-cols-[1.2fr,1fr] h-full max-h-[95vh]">
          {/* Left Side - Image Gallery */}
          <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex flex-col">
            {/* Favorite Button - Top Left */}
            <button
              onClick={() => onToggleFavorite && onToggleFavorite(product.id)}
              className="absolute top-6 left-6 z-20 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all hover:scale-125 duration-300"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <span className="text-2xl">{isFavorite ? '❤️' : '🤍'}</span>
            </button>

            {/* Main Image */}
            <div className="flex-1 flex items-center justify-center relative">
              <div className="relative w-full h-full max-h-[600px] rounded-2xl overflow-hidden shadow-2xl">
                {!imageLoaded && (
                  <div className="absolute inset-0 skeleton rounded-2xl" />
                )}
                <img 
                  src={productImages[currentImageIndex]} 
                  alt={`${product.name} - Image ${currentImageIndex + 1}`} 
                  className={`w-full h-full object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100 animate-imageZoom' : 'opacity-0'}`}
                  onLoad={() => setImageLoaded(true)}
                />
                
                {/* Navigation Arrows - Only show if multiple images */}
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/95 hover:bg-white rounded-full shadow-xl transition-all hover:scale-110 hover:-translate-x-1 duration-300 group"
                      aria-label="Previous image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800 group-hover:text-rose-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/95 hover:bg-white rounded-full shadow-xl transition-all hover:scale-110 hover:translate-x-1 duration-300 group"
                      aria-label="Next image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800 group-hover:text-rose-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* Image Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg">
                      {currentImageIndex + 1} / {productImages.length}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Thumbnail Navigation - Only show if multiple images */}
            {productImages.length > 1 && (
              <div className="flex gap-3 mt-6 overflow-x-auto pb-2 no-scrollbar">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setImageLoaded(false);
                      setCurrentImageIndex(index);
                    }}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-3 transition-all duration-300 ${
                      currentImageIndex === index 
                        ? 'border-rose-500 scale-105 shadow-lg ring-2 ring-rose-200' 
                        : 'border-gray-300 hover:border-rose-300 hover:scale-105 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`Thumbnail ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Product Details */}
          <div className="relative bg-white flex flex-col h-full">
            {/* Close Button - Top Right */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 z-20 p-3 bg-white hover:bg-gray-100 rounded-full shadow-lg transition-all hover:scale-110 hover:rotate-90 duration-300"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Scrollable Content */}
            <div className="p-8 pt-20 overflow-y-auto flex flex-col scrollbar-custom" style={{ height: 'calc(100vh - 5vh)' }}>
            {/* Product Header */}
            <div className="mb-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h2 className="text-3xl font-bold text-gray-900 font-playfair leading-tight">{product.name}</h2>
              </div>
              
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full cursor-pointer hover:bg-amber-100 transition-colors">
                  <span className="text-amber-500 text-lg">⭐</span>
                  <span className="text-sm font-semibold text-amber-700">
                    {product.rating > 0 ? product.rating.toFixed(1) : 'No ratings'}
                  </span>
                  {product.reviewCount > 0 && (
                    <span className="text-xs text-amber-600">({product.reviewCount})</span>
                  )}
                </div>
                <span className="chip bg-rose-50 text-rose-700 font-medium border border-rose-200">{product.category}</span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Description</h4>
              <p className="text-gray-600 leading-relaxed">
                {product.description || 'Experience the authentic taste of local craftsmanship with this carefully curated product. Perfect for gifts or personal enjoyment.'}
              </p>
            </div>

            {/* Seller Info */}
            {product.seller && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h4 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Seller</h4>
                <div className="flex items-center gap-3">
                  {product.sellerPhoto ? (
                    <img 
                      src={product.sellerPhoto} 
                      alt={product.seller}
                      className="w-10 h-10 rounded-full object-cover shadow-md ring-2 ring-rose-100"
                      onError={(e) => {
                        // Fallback to letter circle if image fails to load
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center text-white font-bold shadow-md"
                    style={{ display: product.sellerPhoto ? 'none' : 'flex' }}
                  >
                    {product.seller.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium">{product.seller}</p>
                    <p className="text-xs text-gray-500">Verified Seller</p>
                  </div>
                </div>
              </div>
            )}

            {/* Stock Status */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">Availability</span>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm ${
                  product.stock > 10 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : product.stock > 0
                    ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  {product.stock > 0 ? `${product.stock} units in stock` : 'Out of stock'}
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            {product.reviews && product.reviews.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Customer Reviews</h4>
                
                {/* Rating Summary */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-6 mb-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-amber-600 mb-1">
                        {product.rating > 0 ? product.rating.toFixed(1) : '0.0'}
                      </div>
                      <StarRating value={product.rating || 0} size="sm" readonly />
                      <div className="text-xs text-gray-600 mt-1">
                        {product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <RatingDistribution 
                        distribution={(() => {
                          const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
                          product.reviews.forEach(r => {
                            dist[r.rating] = (dist[r.rating] || 0) + 1;
                          });
                          return dist;
                        })()}
                        totalReviews={product.reviewCount}
                      />
                    </div>
                  </div>
                </div>

                {/* Review List */}
                <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
                  {product.reviews.slice(0, 5).map((review, index) => (
                    <ReviewCard key={review._id || index} review={review} />
                  ))}
                  {product.reviews.length > 5 && (
                    <div className="text-center py-2">
                      <p className="text-sm text-gray-500">
                        Showing 5 of {product.reviews.length} reviews
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {product.reviewCount === 0 && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Customer Reviews</h4>
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <div className="text-4xl mb-2">⭐</div>
                  <p className="text-gray-600 text-sm">No reviews yet</p>
                  <p className="text-gray-500 text-xs mt-1">Be the first to review this product!</p>
                </div>
              </div>
            )}

            {/* Price and Action */}
            <div className="space-y-4 pt-4 mt-6">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Price</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-rose-600 font-playfair">₱{product.price}</span>
                  <span className="text-sm text-gray-500">per unit</span>
                </div>
              </div>
              
              <button
                onClick={() => {
                  onAddToCart && onAddToCart(product.id);
                  onClose();
                }}
                disabled={!product.id || product.stock === 0}
                className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] btn-shine"
              >
                {product.stock === 0 ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Out of Stock
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Add to Cart
                  </span>
                )}
              </button>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductViewModal;