import React, { useEffect, useState } from 'react';

const LoadingProgressBar = ({ isLoading }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setIsVisible(true);
      setProgress(10);
      
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          const increment = Math.random() * 10;
          return Math.min(prev + increment, 90);
        });
      }, 300);

      return () => clearInterval(interval);
    } else {
      setProgress(100);
      const timeout = setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999]">
      <div
        className="h-1 bg-gradient-to-r from-rose-500 via-rose-600 to-rose-500 shadow-lg transition-all duration-300 ease-out"
        style={{ 
          width: `${progress}%`,
          boxShadow: '0 0 10px rgba(244, 63, 94, 0.5)'
        }}
      >
        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-r from-transparent to-white opacity-30 animate-pulse" />
      </div>
    </div>
  );
};

export default LoadingProgressBar;