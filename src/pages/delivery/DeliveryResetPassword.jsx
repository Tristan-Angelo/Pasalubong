import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { resetPassword, verifyResetToken } from '../../utils/api';

const DeliveryResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Invalid or missing reset token');
        setIsValidating(false);
        return;
      }

      try {
        await verifyResetToken(token, 'delivery');
        setIsValidToken(true);
      } catch (err) {
        setError(err.message || 'Invalid or expired reset token');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
    if (error) setError('');
  };

  const togglePassword = (fieldId) => {
    const input = document.getElementById(fieldId);
    const button = input.nextElementSibling;
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    button.textContent = isPassword ? 'Hide' : 'Show';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(token, formData.password, 'delivery');
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/delivery/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-rose-50 to-amber-50 flex items-center justify-center overflow-x-hidden">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validating reset token...</p>
        </div>
      </div>
    );
  }

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
              Reset Password<span className="text-gray-900">.</span>
            </h1>
            <p className="mt-3 md:mt-4 text-gray-600 max-w-xl">
              Create a new password for your account. Make sure it's strong and secure.
            </p>
            <div className="mt-6 space-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-rose-500">•</span> At least 8 characters
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-500">•</span> Mix of letters and numbers
              </div>
              <div className="flex items-center gap-2">
                <span className="text-rose-500">•</span> Include special characters
              </div>
            </div>
          </div>

          <div className="reveal">
            <div className="glass rounded-2xl p-6 md:p-8">
              {!isValidToken ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold mb-2">Invalid Reset Link</h2>
                  <p className="text-gray-600 mb-6">{error}</p>
                  <button
                    onClick={() => navigate('/delivery/forgot-password')}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2.5 rounded-lg shadow-md hover-animate"
                  >
                    Request New Link
                  </button>
                </div>
              ) : showSuccess ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold mb-2">Password Reset Successful!</h2>
                  <p className="text-gray-600 mb-6">
                    Your password has been reset successfully. Redirecting to login...
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold mb-4">Create New Password</h2>
                  
                  {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm">
                      {error}
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="password" className="block text-sm font-semibold mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          name="password"
                          type="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="input w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-16"
                          required
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-3 my-auto text-xs text-gray-500 hover:text-gray-700"
                          onClick={() => togglePassword('password')}
                        >
                          Show
                        </button>
                      </div>
                      {formData.password && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${getStrengthColor()}`}
                                style={{ width: `${(passwordStrength / 5) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600">{getStrengthText()}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-semibold mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="input w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-16"
                          required
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-3 my-auto text-xs text-gray-500 hover:text-gray-700"
                          onClick={() => togglePassword('confirmPassword')}
                        >
                          Show
                        </button>
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
                        {isLoading ? 'Resetting...' : 'Reset Password'}
                      </span>
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => navigate('/delivery/login')}
                        className="text-sm text-gray-600 hover:text-rose-600"
                      >
                        ← Back to Login
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

export default DeliveryResetPassword;