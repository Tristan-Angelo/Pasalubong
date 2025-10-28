import React, { useState, useRef, useEffect } from 'react';
import { loadFaceApiModels, detectFaceAndGetDescriptor, drawDetection } from '../utils/faceApi';

const FaceVerification = ({ onSuccess, onCancel, onFail }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [stream, setStream] = useState(null);
  const [modelsReady, setModelsReady] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const maxAttempts = 3;
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const isDetectingRef = useRef(false);

  useEffect(() => {
    initializeCamera();
    return () => {
      cleanup();
    };
  }, []);

  const initializeCamera = async () => {
    try {
      setMessage('Loading face detection models...');
      const loaded = await loadFaceApiModels();
      
      if (!loaded) {
        setError('Failed to load face detection models. Please refresh the page.');
        setIsLoading(false);
        return;
      }

      setModelsReady(true);
      setMessage('Requesting camera access...');

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setIsLoading(false);
          setMessage('Position your face in the frame');
          startDetection();
        };
      }
    } catch (err) {
      console.error('Camera initialization error:', err);
      setError('Failed to access camera. Please grant camera permissions.');
      setIsLoading(false);
    }
  };

  const startDetection = () => {
    if (detectionIntervalRef.current) return;

    detectionIntervalRef.current = setInterval(async () => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4 && !isVerifying && attempts < maxAttempts && !isDetectingRef.current) {
        isDetectingRef.current = true;
        const result = await detectFaceAndGetDescriptor(videoRef.current);
        
        if (result.success && result.detection) {
          drawDetection(canvasRef.current, { detection: result.detection }, 'Face Detected');
          setFaceDetected(true);
          setError('');
          setMessage('Face detected! Click "Verify Now" to proceed');
        } else {
          const ctx = canvasRef.current.getContext('2d');
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          setMessage('Position your face in the frame');
          setFaceDetected(false);
        }
        isDetectingRef.current = false;
      }
    }, 500);
  };

  const stopDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  };

  const cleanup = () => {
    stopDetection();
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    isDetectingRef.current = false;
  };

  const handleVerify = async () => {
    if (!videoRef.current || isVerifying) return;

    setIsVerifying(true);
    setError('');
    setMessage('Verifying face...');

    try {
      const result = await detectFaceAndGetDescriptor(videoRef.current);

      if (!result.success) {
        setError(result.error || 'No face detected. Please try again.');
        setIsVerifying(false);
        return;
      }

      setMessage('Face captured! Verifying with stored data...');
      
      // Call parent success handler with descriptor
      const verificationResult = await onSuccess(result.descriptor);
      
      if (!verificationResult.isMatch) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= maxAttempts) {
          setError(`Face verification failed after ${maxAttempts} attempts. Order blocked for security.`);
          setTimeout(() => {
            cleanup();
            onFail();
          }, 3000);
        } else {
          setError(`Face does not match. ${maxAttempts - newAttempts} attempts remaining.`);
          setIsVerifying(false);
        }
      } else {
        setMessage('Face verified successfully!');
        setTimeout(() => {
          cleanup();
        }, 1000);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Failed to verify face. Please try again.');
      setIsVerifying(false);
    }
  };

  const handleCancel = () => {
    cleanup();
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden animate-scaleIn">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-rose-500 via-rose-600 to-pink-600 p-6 text-white overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">🔒</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Identity Verification</h2>
                  <p className="text-rose-100 text-sm">Secure checkout with face recognition</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Attempts indicator */}
                {attempts > 0 && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 animate-slideDown">
                    <span className="text-lg">⚠️</span>
                    <span className="text-sm font-medium">
                      Attempt {attempts} of {maxAttempts}
                    </span>
                  </div>
                )}
                <button
                  onClick={handleCancel}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110"
                >
                  <span className="text-xl">✕</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Left Column - Camera */}
          <div className="space-y-4">
            {/* Camera View with modern frame */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: '4/3' }}>
                {/* Corner decorations */}
                <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-rose-500 rounded-tl-xl z-20"></div>
                <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-rose-500 rounded-tr-xl z-20"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-rose-500 rounded-bl-xl z-20"></div>
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-rose-500 rounded-br-xl z-20"></div>
                
                {/* Scanning line animation when face detected */}
                {faceDetected && !isVerifying && (
                  <div className="absolute inset-0 z-10 pointer-events-none">
                    <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent animate-scan"></div>
                  </div>
                )}
                
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  playsInline
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full"
                  width={640}
                  height={480}
                />
                
                {/* Loading overlay */}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm z-30">
                    <div className="text-center text-white">
                      <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-rose-500/30 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-transparent border-t-rose-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-2 border-4 border-transparent border-t-pink-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                      </div>
                      <p className="text-lg font-medium">{message}</p>
                      <p className="text-sm text-gray-400 mt-2">Please wait...</p>
                    </div>
                  </div>
                )}

                {/* Face detection status indicator */}
                {!isLoading && !isVerifying && (
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20">
                    {faceDetected ? (
                      <div className="px-4 py-2 rounded-full backdrop-blur-md transition-all duration-300 bg-green-500/90 text-white shadow-lg shadow-green-500/50 animate-slideDown">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                          <span className="text-sm font-medium">Face Detected</span>
                        </div>
                      </div>
                    ) : (
                      <div className="px-4 py-2 rounded-full backdrop-blur-md transition-all duration-300 bg-blue-500/90 text-white shadow-lg shadow-blue-500/50">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                          <span className="text-sm font-medium">Detecting Face... Stay Still</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Verifying overlay */}
                {isVerifying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-rose-600/95 to-pink-600/95 backdrop-blur-sm z-30 animate-fadeIn">
                    <div className="text-center text-white">
                      <div className="relative w-24 h-24 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-white/30 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
                        <div className="absolute inset-3 flex items-center justify-center">
                          <span className="text-3xl">🔍</span>
                        </div>
                      </div>
                      <p className="text-xl font-bold mb-2">Verifying Identity</p>
                      <p className="text-rose-100">Comparing with registered face...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Instructions and Actions */}
          <div className="space-y-4 flex flex-col">
            {/* Status Messages */}
            <div className="space-y-3">
              {message && !error && !isLoading && (
                <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl animate-slideDown">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm">ℹ️</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-blue-900 font-medium text-sm">{message}</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 rounded-xl animate-shake">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm">✕</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-red-900 font-medium text-sm">{error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Instructions Card */}
            <div className="flex-1 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">📋</span>
                <h3 className="font-bold text-gray-900">Verification Instructions</h3>
              </div>
              <ul className="space-y-2">
                {[
                  { icon: '🎯', text: 'Center your face in the frame' },
                  { icon: '💡', text: 'Ensure good lighting on your face' },
                  { icon: '👀', text: 'Look directly at the camera' },
                  { icon: '😊', text: 'Use the same appearance as registration' },
                  { icon: '🔘', text: 'Click "Verify Now" when ready' }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="text-lg flex-shrink-0">{item.icon}</span>
                    <span className="pt-0.5">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleVerify}
                disabled={isLoading || isVerifying || !modelsReady || attempts >= maxAttempts || !faceDetected}
                className={`flex-1 py-4 px-6 rounded-xl font-bold text-base transition-all duration-300 transform ${
                  isLoading || isVerifying || !modelsReady || attempts >= maxAttempts || !faceDetected
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:from-rose-600 hover:to-pink-700 shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {isVerifying ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>🔍</span>
                      <span>Verify Now</span>
                    </>
                  )}
                </div>
              </button>
              
              <button
                onClick={handleCancel}
                disabled={isVerifying}
                className="px-6 py-4 rounded-xl font-bold text-base bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>

            {/* Security Notice */}
            <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <span className="text-xl flex-shrink-0">🔐</span>
              <p className="text-xs text-green-800 leading-relaxed">
                <strong className="font-semibold">Privacy Protected:</strong> Your face data is processed securely and encrypted. 
                We only store mathematical representations, never actual images.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.9);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
        
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default FaceVerification;