import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadDeliveryValidId } from '../../utils/api';

const DeliveryUploadValidId = () => {
  const navigate = useNavigate();
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);

  const handleFileSelect = (e, side) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload only JPG, JPEG, or PNG files');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (side === 'front') {
        setFrontImage(file);
        setFrontPreview(reader.result);
      } else {
        setBackImage(file);
        setBackPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!frontImage || !backImage) {
      setError('Please upload both front and back images of your valid ID');
      return;
    }

    setIsUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('front', frontImage);
      formData.append('back', backImage);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await uploadDeliveryValidId(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Navigate to waiting page after successful upload
      setTimeout(() => {
        navigate('/delivery/waiting-approval');
      }, 1000);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload valid ID. Please try again.');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('delivery_logged_in');
    localStorage.removeItem('delivery_user');
    localStorage.removeItem('delivery_token');
    sessionStorage.removeItem('delivery_logged_in');
    sessionStorage.removeItem('delivery_user');
    sessionStorage.removeItem('delivery_token');
    navigate('/delivery/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-rose-50 to-amber-50 text-gray-800 overflow-x-hidden flex flex-col">
      {/* Simple Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b border-white/60">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl md:text-2xl font-extrabold tracking-tight gradient-text">
            Pasalubong
          </div>
          <button
            onClick={handleLogout}
            disabled={isUploading}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="relative flex-1">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="w-[800px] h-[800px] rounded-full bg-rose-200/60 blur-3xl absolute -top-40 -left-40"></div>
          <div className="w-[800px] h-[800px] rounded-full bg-amber-200/60 blur-3xl absolute -bottom-40 -right-40"></div>
        </div>

        <section className="relative z-10 max-w-6xl mx-auto px-6 py-12 md:py-20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl mb-4 shadow-lg">
              <span className="text-4xl">🆔</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
              Upload Valid ID
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              For security purposes, please upload clear photos of both sides of your valid government-issued ID.
            </p>
          </div>

          {/* Upload Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Front ID */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span>📄</span> Front of ID
              </h3>
              
              <div
                onClick={() => frontInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  frontPreview
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-rose-500 hover:bg-rose-50'
                }`}
              >
                {frontPreview ? (
                  <div className="relative">
                    <img
                      src={frontPreview}
                      alt="Front ID Preview"
                      className="max-h-64 mx-auto rounded-lg shadow-md"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFrontImage(null);
                        setFrontPreview(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="text-5xl mb-3">📸</div>
                    <p className="font-semibold text-gray-700 mb-1">Click to upload</p>
                    <p className="text-sm text-gray-500">JPG, JPEG, PNG (Max 5MB)</p>
                  </div>
                )}
              </div>
              
              <input
                ref={frontInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={(e) => handleFileSelect(e, 'front')}
                className="hidden"
              />
            </div>

            {/* Back ID */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span>📄</span> Back of ID
              </h3>
              
              <div
                onClick={() => backInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  backPreview
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-rose-500 hover:bg-rose-50'
                }`}
              >
                {backPreview ? (
                  <div className="relative">
                    <img
                      src={backPreview}
                      alt="Back ID Preview"
                      className="max-h-64 mx-auto rounded-lg shadow-md"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setBackImage(null);
                        setBackPreview(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="text-5xl mb-3">📸</div>
                    <p className="font-semibold text-gray-700 mb-1">Click to upload</p>
                    <p className="text-sm text-gray-500">JPG, JPEG, PNG (Max 5MB)</p>
                  </div>
                )}
              </div>
              
              <input
                ref={backInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={(e) => handleFileSelect(e, 'back')}
                className="hidden"
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="glass rounded-2xl p-6 mb-8">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span>📋</span> Guidelines
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Use a valid government-issued ID (Driver's License, Passport, National ID, etc.)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Ensure all text and details are clearly visible</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Take photos in good lighting without glare or shadows</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Make sure the ID is not expired</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">✗</span>
                <span>Do not upload blurry or cropped images</span>
              </li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Uploading...</span>
                <span className="text-sm font-semibold text-rose-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-rose-500 to-pink-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-center">
            <button
              onClick={handleUpload}
              disabled={!frontImage || !backImage || isUploading}
              className={`w-full sm:w-auto px-8 py-3 rounded-lg font-semibold transition-all ${
                !frontImage || !backImage || isUploading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:from-rose-600 hover:to-pink-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {isUploading ? 'Uploading...' : 'Submit for Approval'}
            </button>
          </div>

          {/* Privacy Notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <strong>🔒 Privacy Protected:</strong> Your ID information is encrypted and stored securely. 
            We only use it for verification purposes and never share it with third parties.
          </div>
        </section>
      </main>
    </div>
  );
};

export default DeliveryUploadValidId;