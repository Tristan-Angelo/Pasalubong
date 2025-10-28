import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import EmailIcon from '../../components/icons/EmailIcon';
import CheckCircleIcon from '../../components/icons/CheckCircleIcon';
import WarningIcon from '../../components/icons/WarningIcon';
import ResendIcon from '../../components/icons/ResendIcon';
import { verifyEmail, resendVerificationEmail, checkVerificationStatus } from '../../utils/api';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const hasVerified = useRef(false);

  // Extract userType from URL path (e.g., /buyer/verify-email -> 'buyer')
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const userType = pathSegments[0] || 'buyer'; // First segment is the user type
  
  const email = location.state?.email || '';

  const [verificationStatus, setVerificationStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    // Initialize reveal animations
    const initializeRevealAnimations = () => {
      const els = Array.from(document.querySelectorAll('.reveal'));
      if (!('IntersectionObserver' in window) || !els.length) {
        els.forEach(e => e.classList.add('in-view'));
        return;
      }

      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      els.forEach(el => io.observe(el));
    };

    initializeRevealAnimations();

    // Check if there's a verification token in URL
    const token = searchParams.get('token');
    if (token && !hasVerified.current) {
      hasVerified.current = true;
      handleVerifyToken(token);
    } else if (!token) {
      setVerificationStatus('pending');
    }

    // Listen for storage events to detect verification in other tabs (same browser)
    const handleStorageChange = (e) => {
      if (e.key === `email_verified_${userType}_${email}` && e.newValue === 'true') {
        // Email was verified in another tab
        setVerificationStatus('success');
        setMessage('Email verified successfully!');
        
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate(`/${userType}/login`, {
            state: { message: 'Email verified! You can now log in.' },
            replace: true
          });
        }, 1500);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Poll backend to check verification status (for cross-device detection)
    let pollInterval;
    if (!token && email && verificationStatus === 'pending') {
      pollInterval = setInterval(async () => {
        try {
          const response = await checkVerificationStatus(email, userType);
          if (response.isVerified) {
            // Email was verified (possibly on another device)
            setVerificationStatus('success');
            setMessage('Email verified successfully!');
            
            // Clear the interval
            clearInterval(pollInterval);
            
            // Redirect to login after a short delay
            setTimeout(() => {
              navigate(`/${userType}/login`, {
                state: { message: 'Email verified! You can now log in.' },
                replace: true
              });
            }, 1500);
          }
        } catch (error) {
          // Silently fail - user might not exist or network error
          console.log('Verification status check failed:', error.message);
        }
      }, 5000); // Check every 5 seconds
    }

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [searchParams, email, navigate, userType, verificationStatus]);

  const handleVerifyToken = async (token) => {
    try {
      const response = await verifyEmail(token, userType);
      setVerificationStatus('success');
      setMessage(response.message || 'Email verified successfully!');

      // Store verification status in localStorage to notify other tabs
      // Extract email from response or use a generic key
      const verificationKey = `email_verified_${userType}_${email || 'user'}`;
      localStorage.setItem(verificationKey, 'true');
      
      // Set a timestamp to auto-clear old verification flags
      setTimeout(() => {
        localStorage.removeItem(verificationKey);
      }, 60000); // Clear after 1 minute

      // Redirect to login after 1.5 seconds
      setTimeout(() => {
        navigate(`/${userType}/login`, {
          state: { message: 'Email verified! You can now log in.' },
          replace: true // Replace history entry to prevent back navigation
        });
      }, 1500);
    } catch (error) {
      setVerificationStatus('error');
      setMessage(error.message || 'Invalid or expired verification link');
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      setMessage('Email address not found. Please register again.');
      return;
    }

    setIsResending(true);
    setMessage('');

    try {
      const response = await resendVerificationEmail(email, userType);
      setMessage(response.message || 'Verification link sent! Please check your email.');
      setVerificationStatus('pending');
    } catch (error) {
      setMessage(error.message || 'Failed to send verification email. Please try again.');
      setVerificationStatus('error');
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    navigate(`/${userType}/login`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-rose-50 to-amber-50 text-gray-800 overflow-x-hidden flex flex-col">

      <main className="relative flex-1">
        {/* Background accents */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="w-[800px] h-[800px] rounded-full bg-rose-200/60 blur-3xl absolute -top-40 -left-40"></div>
          <div className="w-[800px] h-[800px] rounded-full bg-amber-200/60 blur-3xl absolute -bottom-40 -right-40"></div>
        </div>

        <section className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-20">
          <div className="reveal">
            <div className="glass rounded-2xl p-8 md:p-12 text-center">
              {/* Icon based on status */}
              <div className="flex justify-center mb-6">
                {verificationStatus === 'success' && (
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircleIcon width={48} height={48} color="#10b981" />
                  </div>
                )}
                {verificationStatus === 'error' && (
                  <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                    <WarningIcon width={48} height={48} color="#ef4444" />
                  </div>
                )}
                {(verificationStatus === 'pending' || verificationStatus === 'verifying') && (
                  <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center">
                    <EmailIcon width={48} height={48} color="#f43f5e" />
                  </div>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
                {verificationStatus === 'success' && 'Email Verified!'}
                {verificationStatus === 'error' && 'Verification Failed'}
                {verificationStatus === 'verifying' && 'Verifying...'}
                {verificationStatus === 'pending' && 'Verify Your Email'}
              </h1>

              {/* Message */}
              {verificationStatus === 'success' && (
                <div className="mb-6">
                  <p className="text-lg text-gray-700 mb-2">
                    Your email has been verified successfully.
                  </p>
                  <p className="text-gray-600">
                    Redirecting to login...
                  </p>
                </div>
              )}

              {verificationStatus === 'error' && (
                <div className="mb-6">
                  <p className="text-lg text-red-600 mb-4">
                    {message || 'Invalid or expired verification link'}
                  </p>
                  <p className="text-gray-600">
                    Please request a new verification email below.
                  </p>
                </div>
              )}

              {verificationStatus === 'verifying' && (
                <div className="mb-6">
                  <p className="text-lg text-gray-700 mb-2">
                    Verifying your email address...
                  </p>
                  <p className="text-gray-600">
                    Please wait a moment.
                  </p>
                </div>
              )}

              {verificationStatus === 'pending' && (
                <div className="mb-6">
                  <p className="text-lg text-gray-700 mb-2">
                    Check your inbox
                  </p>
                  {email && (
                    <p className="text-gray-600 mb-4">
                      We've sent a verification link to <strong>{email}</strong>
                    </p>
                  )}
                  <p className="text-gray-600">
                    Click the link in the email to verify your account and get started.
                  </p>
                </div>
              )}

              {/* Success/Error message from resend */}
              {message && verificationStatus === 'pending' && (
                <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 text-blue-800 px-4 py-3 text-sm">
                  {message}
                </div>
              )}

              {/* Action buttons */}
              {verificationStatus !== 'success' && verificationStatus !== 'verifying' && (
                <div className="space-y-4">
                  <button
                    onClick={handleResendEmail}
                    disabled={isResending || !email}
                    className={`w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-lg shadow-md hover-animate btn-shine flex items-center justify-center gap-2 ${isResending || !email ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                    <ResendIcon width={20} height={20} color="white" />
                    <span>{isResending ? 'Sending...' : 'Resend Verification Email'}</span>
                  </button>

                  <button
                    onClick={handleBackToLogin}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg shadow-sm transition-all duration-300"
                  >
                    Back to Login
                  </button>
                </div>
              )}

              {/* Tips */}
              {(verificationStatus === 'pending' || verificationStatus === 'verifying') && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Didn't receive the email?</strong>
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Check your spam or junk folder</li>
                    <li>• Make sure the email address is correct</li>
                    <li>• Click the resend button above to get a new link</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

    </div>
  );
};

export default VerifyEmail;