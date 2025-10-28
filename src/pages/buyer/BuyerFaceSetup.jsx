import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FaceRegistration from '../../components/FaceRegistration';
import { registerBuyerFace } from '../../utils/api';

const BuyerFaceSetup = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleFaceRegistrationSuccess = async (faceDescriptor, faceImage) => {
    try {
      await registerBuyerFace(faceDescriptor, faceImage);
      
      // Update local storage to mark face as registered
      const buyerUser = JSON.parse(
        localStorage.getItem('buyer_user') || sessionStorage.getItem('buyer_user') || '{}'
      );
      buyerUser.isFaceRegistered = true;
      
      if (localStorage.getItem('buyer_user')) {
        localStorage.setItem('buyer_user', JSON.stringify(buyerUser));
      } else {
        sessionStorage.setItem('buyer_user', JSON.stringify(buyerUser));
      }

      // Navigate to dashboard
      navigate('/buyer/dashboard', { 
        state: { message: 'Face registered successfully!' },
        replace: true 
      });
    } catch (err) {
      console.error('Face registration error:', err);
      setError(err.message || 'Failed to register face. Please try again.');
    }
  };

  const handleSkip = () => {
    // Allow user to skip but show warning
    if (window.confirm('Are you sure you want to skip face registration? You will need to register your face before placing orders.')) {
      navigate('/buyer/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-rose-50 to-amber-50">
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg max-w-md">
          {error}
        </div>
      )}
      
      <FaceRegistration
        onSuccess={handleFaceRegistrationSuccess}
        onSkip={handleSkip}
      />
    </div>
  );
};

export default BuyerFaceSetup;