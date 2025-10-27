import React, { useEffect } from 'react';

const ToastNotification = ({ message, type = 'info', onClose }) => {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };
  
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast ${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 max-w-sm animate-slideIn`}>
      <span>{icons[type]}</span>
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="text-white hover:text-gray-200">×</button>
    </div>
  );
};

export default ToastNotification;