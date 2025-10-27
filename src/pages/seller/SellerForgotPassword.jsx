import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { forgotPassword, verifyResetCode } from '../../utils/api';

const SellerForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: verification code
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

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
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await forgotPassword(email, 'seller');
      setStep(2);
      setResendTimer(60);
    } catch (err) {
      setError(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index, value) => {
    if (value.length > 1) {
      value = value[0];
    }

    if (!/^\d*$/.test(value)) {
      return;
    }

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setVerificationCode(newCode);

    // Focus last filled input or next empty
    const lastIndex = Math.min(pastedData.length, 5);
    const input = document.getElementById(`code-${lastIndex}`);
    if (input) input.focus();
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    const code = verificationCode.join('');
    
    if (code.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await verifyResetCode(email, code, 'seller');
      // Navigate to reset password with token
      navigate(`/seller/reset-password?token=${response.token}`);
    } catch (err) {
      setError(err.message || 'Invalid verification code. Please try again.');
      setVerificationCode(['', '', '', '', '', '']);
      document.getElementById('code-0')?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;

    setIsLoading(true);
    setError('');

    try {
      await forgotPassword(email, 'seller');
      setResendTimer(60);
      setVerificationCode(['', '', '', '', '', '']);
    } catch (err) {
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-rose-50 to-amber-50 text-gray-800 overflow-x-hidden flex flex-col">
      <Navigation />

      <main className="relative flex-1">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="w-[800px] h-[800px] rounded-full bg-rose-200/60 blur-3xl absolute -top-40 -left-40"></div>
          <div className="w-[800px] h-[800px] rounded-full bg-amber-200/60 blur-3xl absolute -bottom-40 -right-40"></div>
        </div>

        <section className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center min-h-[calc(100vh-180px)]">
          <div className="reveal">
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              {step === 1 ? 'Forgot Password' : 'Verify Code'}
              <span className="text-gray-900">?</span>
            </h1>
            <p className="mt-3 md:mt-4 text-gray-600 max-w-xl">
              {step === 1 
                ? "No worries! Enter your email address and we'll send you a 6-digit verification code."
                : "Enter the 6-digit code we sent to your email address."}
            </p>
            <div className="mt-6 flex items-center gap-6 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-rose-500">•</span> Quick & secure
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-500">•</span> Email verification
              </div>
            </div>
          </div>

          <div className="reveal">
            <div className="glass rounded-2xl p-6 md:p-8">
              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              {step === 1 ? (
                <>
                  <h2 className="text-xl font-bold mb-4">Enter Your Email</h2>
                  
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold mb-1">
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
                        placeholder="Enter your email"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2.5 rounded-lg shadow-md hover-animate btn-shine ${
                        isLoading ? 'btn-loading' : ''
                      }`}
                    >
                      <span className="btn-text">
                        {isLoading ? 'Sending...' : 'Send Verification Code'}
                      </span>
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => navigate('/seller/login')}
                        className="text-sm text-gray-600 hover:text-rose-600"
                      >
                        ← Back to Login
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold mb-2">Enter Verification Code</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    We sent a code to <strong>{email}</strong>
                  </p>
                  
                  <form onSubmit={handleCodeSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        6-Digit Code
                      </label>
                      <div className="flex gap-2 justify-between">
                        {verificationCode.map((digit, index) => (
                          <input
                            key={index}
                            id={`code-${index}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleCodeChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={index === 0 ? handlePaste : undefined}
                            className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none"
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2.5 rounded-lg shadow-md hover-animate btn-shine ${
                        isLoading ? 'btn-loading' : ''
                      }`}
                    >
                      <span className="btn-text">
                        {isLoading ? 'Verifying...' : 'Verify Code'}
                      </span>
                    </button>

                    <div className="text-center space-y-2">
                      <p className="text-sm text-gray-600">
                        Didn't receive the code?{' '}
                        {resendTimer > 0 ? (
                          <span className="text-gray-500">
                            Resend in {resendTimer}s
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResendCode}
                            className="text-rose-600 font-semibold hover:underline"
                            disabled={isLoading}
                          >
                            Resend Code
                          </button>
                        )}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setStep(1);
                          setVerificationCode(['', '', '', '', '', '']);
                          setError('');
                        }}
                        className="text-sm text-gray-600 hover:text-rose-600"
                      >
                        ← Change Email
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SellerForgotPassword;