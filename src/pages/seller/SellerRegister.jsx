import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import OpenStreetMapAutocomplete from '../../components/OpenStreetMapAutocomplete';
import { sellerRegister } from '../../utils/api';

const SellerRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    businessType: '',
    region: '',
    province: '',
    city: '',
    barangay: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    businessType: '',
    region: '',
    province: '',
    city: '',
    barangay: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedAddressData, setSelectedAddressData] = useState(null);

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
    setError('');
    setFieldErrors({
      businessName: '',
      ownerName: '',
      email: '',
      phone: '',
      businessType: '',
      region: '',
      province: '',
      city: '',
      barangay: '',
      password: '',
      confirmPassword: ''
    });
    
    if (formData.password !== formData.confirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      return;
    }

    setIsLoading(true);

    try {
      // Call backend API
      await sellerRegister({
        businessName: formData.businessName,
        ownerName: formData.ownerName,
        email: formData.email,
        phone: formData.phone,
        businessType: formData.businessType,
        region: formData.region,
        province: formData.province,
        city: formData.city,
        barangay: formData.barangay,
        password: formData.password
      });

      setShowSuccess(true);
      
      // Navigate to verification page after delay
      setTimeout(() => {
        navigate('/seller/verify-email', { 
          state: { 
            email: formData.email,
            userType: 'seller'
          }
        });
      }, 2500);
    } catch (err) {
      const errorMessage = err.message || 'Registration failed. Please try again.';
      const errorField = err.field;
      
      // Set field-specific errors based on the field property from API
      if (errorField && fieldErrors.hasOwnProperty(errorField)) {
        setFieldErrors(prev => ({ ...prev, [errorField]: errorMessage }));
      } else {
        // If no specific field, show general error
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else if (field === 'confirmPassword') {
      setShowConfirmPassword(!showConfirmPassword);
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

        <section className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start min-h-[calc(100vh-180px)]">
          <div className="reveal">
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              Become a Seller<span className="text-gray-900">.</span>
            </h1>
            <p className="mt-3 md:mt-4 text-gray-600 max-w-xl">
              Join our marketplace and start selling your authentic Carigara & Barugo products to customers worldwide.
            </p>
            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-rose-500">•</span> Easy product management
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-500">•</span> Fast payouts
              </li>
              <li className="flex items-center gap-2">
                <span className="text-rose-500">•</span> Marketing support
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-500">•</span> Analytics dashboard
              </li>
            </ul>
          </div>

          <div className="reveal">
            <div className="glass rounded-2xl p-6 md:p-8">
              {showSuccess && (
                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 text-green-800 px-4 py-3 text-sm">
                  ✅ Seller registration successful! Please verify your email.
                </div>
              )}
              
              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm">
                  ❌ {error}
                </div>
              )}
              
              <h2 className="text-xl font-bold">Register as Seller</h2>
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="businessName" className="block text-sm font-semibold">Business Name</label>
                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className={`input mt-1 w-full rounded-lg border ${
                      fieldErrors.businessName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                    } bg-white px-3 py-2`}
                    required
                  />
                  {fieldErrors.businessName && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.businessName}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="ownerName" className="block text-sm font-semibold">Owner/Contact Person</label>
                  <input
                    id="ownerName"
                    name="ownerName"
                    type="text"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    className={`input mt-1 w-full rounded-lg border ${
                      fieldErrors.ownerName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                    } bg-white px-3 py-2`}
                    required
                  />
                  {fieldErrors.ownerName && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.ownerName}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold">Email Address</label>
                    <input
                      id="email"
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
                    <label htmlFor="phone" className="block text-sm font-semibold">Phone Number</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`input mt-1 w-full rounded-lg border ${
                        fieldErrors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                      } bg-white px-3 py-2`}
                      required
                    />
                    {fieldErrors.phone && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="businessType" className="block text-sm font-semibold">Business Type</label>
                  <select
                    id="businessType"
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleInputChange}
                    className={`input mt-1 w-full rounded-lg border ${
                      fieldErrors.businessType ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                    } bg-white px-3 py-2`}
                    required
                  >
                    <option value="">--Select Business Type--</option>
                    <option value="Food & Beverages">Food & Beverages</option>
                    <option value="Handicrafts">Handicrafts</option>
                    <option value="Agricultural Products">Agricultural Products</option>
                    <option value="Local Delicacies">Local Delicacies</option>
                    <option value="Other">Other</option>
                  </select>
                  {fieldErrors.businessType && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.businessType}</p>
                  )}
                </div>

                <div className="pt-2">
                  <h3 className="text-sm font-bold text-gray-800 mb-2">Business Address</h3>

                  <OpenStreetMapAutocomplete
                        label="Search Business Address"
                        value={`${formData.barangay} ${formData.city} ${formData.province} ${formData.region}`.trim()}
                        onChange={(value) => {
                          // Update combined field if needed
                        }}
                        onSelectAddress={(addressData) => {
                          setSelectedAddressData(addressData);
                          setFormData(prev => ({
                            ...prev,
                            region: addressData.region || prev.region,
                            province: addressData.province || prev.province,
                            city: addressData.city || prev.city,
                            barangay: addressData.barangay || prev.barangay
                          }));
                          // Clear errors
                          setFieldErrors(prev => ({
                            ...prev,
                            region: '',
                            province: '',
                            city: '',
                            barangay: ''
                          }));
                        }}
                        placeholder="Type your business address (e.g., Carigara Leyte)"
                        required
                      />

                      {selectedAddressData && (
                        <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-xs text-green-700 font-medium mb-2">✅ Address Details</p>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                            {selectedAddressData.barangay && (
                              <div>
                                <span className="font-medium">Barangay:</span> {selectedAddressData.barangay}
                              </div>
                            )}
                            {selectedAddressData.city && (
                              <div>
                                <span className="font-medium">City:</span> {selectedAddressData.city}
                              </div>
                            )}
                            {selectedAddressData.province && (
                              <div>
                                <span className="font-medium">Province:</span> {selectedAddressData.province}
                              </div>
                            )}
                            {selectedAddressData.region && (
                              <div>
                                <span className="font-medium">Region:</span> {selectedAddressData.region}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-semibold mb-1">Region</label>
                          <input
                            type="text"
                            value={formData.region}
                            onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50"
                            placeholder="Auto-filled from search"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1">Province</label>
                          <input
                            type="text"
                            value={formData.province}
                            onChange={(e) => setFormData(prev => ({ ...prev, province: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50"
                            placeholder="Auto-filled from search"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1">City/Municipality</label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50"
                            placeholder="Auto-filled from search"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1">Barangay</label>
                          <input
                            type="text"
                            value={formData.barangay}
                            onChange={(e) => setFormData(prev => ({ ...prev, barangay: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50"
                            placeholder="Auto-filled from search"
                            required
                          />
                        </div>
                      </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold">Password</label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
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
                        onClick={() => togglePasswordVisibility('password')}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold">Confirm Password</label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`input mt-1 w-full rounded-lg border ${
                          fieldErrors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                        } bg-white px-3 py-2 pr-16`}
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-3 my-auto text-xs text-gray-500 hover:text-gray-700"
                        onClick={() => togglePasswordVisibility('confirmPassword')}
                      >
                        {showConfirmPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <label className="inline-flex items-center gap-2 select-none text-sm">
                  <input
                    id="termsAccepted"
                    name="termsAccepted"
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={handleInputChange}
                    className="rounded"
                    required
                  />
                  <span>I agree to the Terms of Service and Privacy Policy.</span>
                </label>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2.5 rounded-lg shadow-md hover-animate btn-shine ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Registering...' : 'Register as Seller'}
                </button>
                
                <p className="text-center text-sm">
                  Already have an account?{' '}
                  <button
                    onClick={() => navigate('/seller/login')}
                    className="text-rose-600 font-semibold hover:underline"
                  >
                    Login instead
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

export default SellerRegister;