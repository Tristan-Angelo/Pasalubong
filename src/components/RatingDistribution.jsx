import React from 'react';

const RatingDistribution = ({ distribution, totalReviews }) => {
  const ratings = [5, 4, 3, 2, 1];

  const getPercentage = (count) => {
    if (totalReviews === 0) return 0;
    return Math.round((count / totalReviews) * 100);
  };

  return (
    <div className="space-y-2">
      {ratings.map((rating) => {
        const count = distribution[rating] || 0;
        const percentage = getPercentage(count);

        return (
          <div key={rating} className="flex items-center gap-3">
            <div className="flex items-center gap-1 w-12">
              <span className="text-sm font-medium text-gray-700">{rating}</span>
              <span className="text-amber-500 text-sm">⭐</span>
            </div>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs text-gray-600 w-12 text-right">
              {percentage}%
            </span>
            <span className="text-xs text-gray-500 w-8 text-right">
              ({count})
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default RatingDistribution;