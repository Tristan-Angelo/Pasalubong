import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { adminLogin } from '../../utils/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    username: '',
    password: ''
  });

  useEffect(() => {
    // Initialize reveal animations
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

    // Auto-fill remembered username
    const savedUsername = localStorage.getItem('admin_login_username');
    if (savedUsername) {
      setFormData(prev => ({
        ...prev,
        username: savedUsername,
        rememberMe: true
      }));
    }
  }, []);

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
    setFieldErrors({ username: '', password: '' });

    try {
      // Call backend API
      const response = await adminLogin({
        username: formData.username,
        password: formData.password
      });

      setShowSuccess(true);

      // Store authentication token
      if (response.token) {
        localStorage.setItem('admin_token', response.token);
      }

      // Store login state and user data
      const userData = JSON.stringify(response.user);
      if (formData.rememberMe) {
        localStorage.setItem('admin_login_username', formData.username);
        localStorage.setItem('admin_logged_in', 'true');
        localStorage.setItem('admin_user', userData);
      } else {
        localStorage.removeItem('admin_login_username');
        sessionStorage.setItem('admin_logged_in', 'true');
        sessionStorage.setItem('admin_user', userData);
      }

      // Navigate to dashboard after delay
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1500);
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please try again.';
      const errorField = err.field;
      setError(errorMessage);
      
      // Set field-specific errors based on the field property from API
      if (errorField === 'username') {
        setFieldErrors(prev => ({ ...prev, username: errorMessage }));
      } else if (errorField === 'password') {
        setFieldErrors(prev => ({ ...prev, password: errorMessage }));
      } else {
        // Fallback to message-based detection if field is not provided
        if (errorMessage.toLowerCase().includes('username')) {
          setFieldErrors(prev => ({ ...prev, username: errorMessage }));
        } else if (errorMessage.toLowerCase().includes('password')) {
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
              Admin Login<span className="text-gray-900">.</span>
            </h1>
            <p className="mt-3 md:mt-4 text-gray-600 max-w-xl">
              Access your admin dashboard to manage the entire platform, users, and system settings.
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-rose-500">•</span> Full system control
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-500">•</span> User management
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-rose-500">•</span> Analytics & reports
              </div>
            </div>
          </div>

          <div className="reveal">
            <div className="glass rounded-2xl p-6 md:p-8">
              {showSuccess && (
                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 text-green-800 px-4 py-3 text-sm">
                  ✅ Login successful! Redirecting...
                </div>
              )}

              <h2 className="text-xl font-bold">Admin Sign in</h2>
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-semibold">Username</label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`input mt-1 w-full rounded-lg border ${
                      fieldErrors.username ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                    } bg-white px-3 py-2`}
                    placeholder="Enter admin username"
                    required
                  />
                  {fieldErrors.username && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.username}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold">Password</label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`input mt-1 w-full rounded-lg border ${
                        fieldErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                      } bg-white px-3 py-2 pr-16`}
                      placeholder="Enter admin password"
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
                    className="text-rose-600 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2.5 rounded-lg shadow-md hover-animate btn-shine ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Logging in...' : 'Login as Admin'}
                </button>

                <p className="text-center text-sm">
                  Need access?{' '}
                  <button type="button" className="text-rose-600 font-semibold hover:underline">
                    Contact system administrator
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

export default AdminLogin;