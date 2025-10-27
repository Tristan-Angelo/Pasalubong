import React from 'react';

const StarRating = ({ value = 0, onChange, size = 'md', readonly = false, showValue = false }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10'
  };

  const sizeClass = sizes[size] || sizes.md;

  const handleClick = (rating) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          disabled={readonly}
          className={`${sizeClass} transition-all duration-200 ${
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={star <= value ? '#fbbf24' : '#e5e7eb'}
            className={`w-full h-full transition-colors duration-200 ${
              !readonly && 'hover:fill-amber-300'
            }`}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
      {showValue && (
        <span className="ml-2 text-sm font-semibold text-gray-700">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;