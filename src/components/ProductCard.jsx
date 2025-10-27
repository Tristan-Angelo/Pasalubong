import React, { useState } from 'react';

const ProductCard = ({ product, onAddToCart, isFavorite, onToggleFavorite, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div 
      className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2"
      onClick={onClick}
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .float-on-hover:hover .float-element {
          animation: float 2s ease-in-out infinite;
        }
      `}</style>

      {/* Image Container with Gradient Overlay */}
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 float-on-hover">
        {!imageLoaded && (
          <div className="absolute inset-0 skeleton" />
        )}
        <img 
          src={product.image} 
          alt={product.name} 
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 float-element ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Favorite Button - Top Right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product.id);
          }}
          className="absolute top-3 right-3 z-10 p-2.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg transition-all duration-300 hover:scale-125 hover:rotate-12 active:scale-95"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <span className="text-xl">{isFavorite ? '❤️' : '🤍'}</span>
        </button>

        {/* Stock Badge - Top Left */}
        {product.stock <= 10 && product.stock > 0 && (
          <div className="absolute top-3 left-3 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            Only {product.stock} left!
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            Out of Stock
          </div>
        )}

        {/* Quick View Button - Appears on Hover */}
        <div className="absolute inset-x-0 bottom-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="w-full text-white py-2.5 px-4 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105"
            style={{ 
              filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'
            }}
          >
            Quick View
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-3">
        {/* Title and Category */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-lg line-clamp-1 text-gray-900 group-hover:text-rose-600 transition-colors duration-300">
              {product.name}
            </h3>
          </div>
          
          {/* Rating and Category Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              <span className="text-amber-500 text-sm">⭐</span>
              <span className="text-xs font-bold text-amber-700">
                {product.rating > 0 ? product.rating.toFixed(1) : 'New'}
              </span>
              {product.reviewCount > 0 && (
                <span className="text-xs text-amber-600">({product.reviewCount})</span>
              )}
            </div>
            <span className="chip bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
              {product.category}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed min-h-[2.5rem]">
          {product.description || 'Authentic local delicacy, carefully crafted with traditional methods.'}
        </p>

        {/* Price and Action Row */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-medium">Price</span>
            <span className="text-2xl font-bold text-rose-600 font-playfair">₱{product.price}</span>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product.id);
            }}
            disabled={!product.id || product.stock === 0}
            className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95 btn-shine flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>

      {/* Decorative Corner Accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-rose-500/10 to-transparent rounded-bl-full transform translate-x-10 -translate-y-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500" />
    </div>
  );
};

export default ProductCard;