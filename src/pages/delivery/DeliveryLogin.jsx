import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { deliveryLogin } from '../../utils/api';

const DeliveryLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: ''
  });

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

    // Check for success message from navigation state
    if (location.state?.message) {
      setShowSuccess(true);
      // Clear the state to prevent showing message on refresh
      window.history.replaceState({}, document.title);
    }

    // Auto-fill remembered email
    const savedEmail = localStorage.getItem('delivery_login_email');
    if (savedEmail) {
      setFormData(prev => ({
        ...prev,
        email: savedEmail,
        rememberMe: true
      }));
    }
  }, [location]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear field-specific error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear general error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setFieldErrors({ email: '', password: '' });

    try {
      // Call backend API
      const response = await deliveryLogin({
        email: formData.email,
        password: formData.password
      });

      // Check if email is verified
      if (response.user && !response.user.isEmailVerified) {
        // Redirect to verification page
        navigate('/delivery/verify-email', {
          state: {
            email: formData.email,
            userType: 'delivery'
          }
        });
        return;
      }

      setShowSuccess(true);

      // Store login state, user data, and token
      const userData = JSON.stringify(response.user);
      const token = response.token;
      
      if (formData.rememberMe) {
        localStorage.setItem('delivery_login_email', formData.email);
        localStorage.setItem('delivery_logged_in', 'true');
        localStorage.setItem('delivery_user', userData);
        localStorage.setItem('delivery_token', token);
      } else {
        localStorage.removeItem('delivery_login_email');
        sessionStorage.setItem('delivery_logged_in', 'true');
        sessionStorage.setItem('delivery_user', userData);
        sessionStorage.setItem('delivery_token', token);
      }

      // Navigate to dashboard after delay
      setTimeout(() => {
        navigate('/delivery/dashboard');
      }, 1500);
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please try again.';
      const errorField = err.field; // Get the field from API response
      setError(errorMessage);
      
      // Set field-specific errors based on the field property from API
      if (errorField === 'email') {
        setFieldErrors(prev => ({ ...prev, email: errorMessage }));
      } else if (errorField === 'password') {
        setFieldErrors(prev => ({ ...prev, password: errorMessage }));
      } else {
        // Fallback to message-based detection if field is not provided
        if (errorMessage.toLowerCase().includes('email') && !errorMessage.toLowerCase().includes('password')) {
          setFieldErrors(prev => ({ ...prev, email: errorMessage }));
        } else if (errorMessage.toLowerCase().includes('password') || errorMessage.toLowerCase().includes('incorrect')) {
          setFieldErrors(prev => ({ ...prev, password: errorMessage }));
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePassword = (fieldId) => {
    const input = document.getElementById(fieldId);
    const button = input.nextElementSibling;
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    button.textContent = isPassword ? 'Hide' : 'Show';
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
              Delivery Login<span className="text-gray-900">.</span>
            </h1>
            <p className="mt-3 md:mt-4 text-gray-600 max-w-xl">
              Access your delivery dashboard to manage orders, track deliveries, and earn with our platform.
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-rose-500">•</span> Flexible schedule
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-500">•</span> Competitive rates
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-rose-500">•</span> Real-time tracking
              </div>
            </div>
          </div>

          <div className="reveal">
            <div className="glass rounded-2xl p-6 md:p-8">
              {showSuccess && (
                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 text-green-800 px-4 py-3 text-sm">
                  ✅ {location.state?.message || 'Login successful! Redirecting to dashboard...'}
                </div>
              )}
              
              <h2 className="text-xl font-bold">Sign in</h2>
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="loginEmail" className="block text-sm font-semibold">Email Address</label>
                  <input
                    id="loginEmail"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`input mt-1 w-full rounded-lg border ${
                      fieldErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                    } bg-white px-3 py-2`}
                    required
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="loginPassword" className="block text-sm font-semibold">Password</label>
                  <div className="relative">
                    <input
                      id="loginPassword"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`input mt-1 w-full rounded-lg border ${
                        fieldErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                      } bg-white px-3 py-2 pr-16`}
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-3 my-auto text-xs text-gray-500 hover:text-gray-700"
                      onClick={() => togglePassword('loginPassword')}
                    >
                      Show
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
                  )}
                </div>

                <div className="flex justify-between items-center text-sm">
                  <label className="inline-flex items-center gap-2 select-none">
                    <input
                      id="rememberMe"
                      name="rememberMe"
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate('/delivery/forgot-password')}
                    className="text-rose-600 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2.5 rounded-lg shadow-md hover-animate btn-shine ${
                    isLoading ? 'btn-loading' : ''
                  }`}
                >
                  <span className="btn-text">Login</span>
                </button>

                <p className="text-center text-sm">
                  Don't have an account?{' '}
                  <button
                    onClick={() => navigate('/delivery/register')}
                    className="text-rose-600 font-semibold hover:underline"
                  >
                    Register as delivery partner
                  </button>
                </p>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default DeliveryLogin;
