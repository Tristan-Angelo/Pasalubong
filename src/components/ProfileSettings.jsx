import React, { useState, useEffect } from 'react';
import OpenStreetMapAutocomplete from './OpenStreetMapAutocomplete';

const ProfileSettings = ({ userType, userData, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedAddressData, setSelectedAddressData] = useState(null);
  const [fullAddress, setFullAddress] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    if (userData) {
      // Initialize form data based on user type
      switch (userType) {
        case 'buyer':
          setFormData({
            fullname: userData.fullname || '',
            email: userData.email || '',
            phone: userData.phone || '',
            region: userData.region || '',
            province: userData.province || '',
            city: userData.city || '',
            barangay: userData.barangay || '',
            birthday: userData.birthday ? new Date(userData.birthday).toISOString().split('T')[0] : '',
            photo: userData.photo || null
          });
          setPhotoPreview(userData.photo || null);
          break;
        case 'seller':
          setFormData({
            businessName: userData.businessName || '',
            ownerName: userData.ownerName || '',
            email: userData.email || '',
            phone: userData.phone || '',
            palawanPayNumber: userData.palawanPayNumber || '',
            palawanPayName: userData.palawanPayName || '',
            businessType: userData.businessType || '',
            region: userData.region || '',
            province: userData.province || '',
            city: userData.city || '',
            barangay: userData.barangay || '',
            photo: userData.photo || null
          });
          setPhotoPreview(userData.photo || null);
          // Build full address for autocomplete
          const addressParts = [
            userData.barangay && `Barangay ${userData.barangay}`,
            userData.city,
            userData.province,
            userData.region
          ].filter(Boolean);
          setFullAddress(addressParts.join(', '));
          break;
        case 'delivery':
          setFormData({
            fullName: userData.fullName || '',
            email: userData.email || '',
            phone: userData.phone || '',
            vehicleType: userData.vehicleType || '',
            licenseNumber: userData.licenseNumber || '',
            region: userData.region || '',
            province: userData.province || '',
            city: userData.city || '',
            barangay: userData.barangay || '',
            photo: userData.photo || null
          });
          setPhotoPreview(userData.photo || null);
          setIsAvailable(userData.isAvailable !== undefined ? userData.isAvailable : true);
          break;
        case 'admin':
          setFormData({
            username: userData.username || '',
            fullName: userData.fullName || '',
            email: userData.email || '',
            phone: userData.phone || '',
            photo: userData.photo || null
          });
          setPhotoPreview(userData.photo || null);
          break;
        default:
          setFormData({});
      }
    }
  }, [userData, userType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select a valid image file' });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size should be less than 5MB' });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setFormData(prev => ({
          ...prev,
          photo: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddressSelect = (addressData) => {
    setSelectedAddressData(addressData);
    // Auto-fill the form fields with selected address data
    setFormData(prev => ({
      ...prev,
      city: addressData.city || prev.city,
      barangay: addressData.barangay || prev.barangay,
      province: addressData.province || prev.province,
      region: addressData.region || prev.region
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const dataToUpdate = { ...formData };
      // Include isAvailable status for delivery users
      if (userType === 'delivery') {
        dataToUpdate.isAvailable = isAvailable;
      }
      await onUpdate(dataToUpdate);
      // Don't set message here - parent component handles toast notification
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-save isAvailable status when toggled (for delivery users only)
  const handleActiveToggle = async () => {
    const newAvailableStatus = !isAvailable;
    setIsAvailable(newAvailableStatus);
    
    if (userType === 'delivery') {
      try {
        await onUpdate({ isAvailable: newAvailableStatus });
        // Parent component will show toast notification
      } catch (error) {
        // Revert on error
        setIsAvailable(!newAvailableStatus);
        setMessage({ type: 'error', text: error.message || 'Failed to update status' });
      }
    }
  };

  const renderBuyerFields = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            name="fullname"
            value={formData.fullname || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Birthday</label>
          <input
            type="date"
            name="birthday"
            value={formData.birthday || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
        </div>
      </div>
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> To manage your delivery addresses, please visit the <strong>Addresses</strong> section from the sidebar menu.
        </p>
      </div>
    </>
  );

  const renderSellerFields = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
          <input
            type="text"
            name="businessName"
            value={formData.businessName || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Owner Name</label>
          <input
            type="text"
            name="ownerName"
            value={formData.ownerName || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
          <select
            name="businessType"
            value={formData.businessType || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          >
            <option value="">Select Business Type</option>
            <option value="Food & Beverages">Food & Beverages</option>
            <option value="Souvenirs & Gifts">Souvenirs & Gifts</option>
            <option value="Agricultural Products">Agricultural Products</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Palawan Pay Number</label>
          <input
            type="tel"
            name="palawanPayNumber"
            value={formData.palawanPayNumber || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="09XX XXX XXXX"
          />
          <p className="text-xs text-gray-500 mt-1">Enter your Palawan Pay number for receiving payments</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Palawan Pay Account Name</label>
          <input
            type="text"
            name="palawanPayName"
            value={formData.palawanPayName || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="Juan Dela Cruz"
          />
          <p className="text-xs text-gray-500 mt-1">Name registered on your Palawan Pay account</p>
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-800">
          <strong>💡 Payment Setup:</strong> Add your Palawan Pay details to receive payments from buyers. Make sure the Palawan Pay number and name match your registered Palawan Pay account.
        </p>
      </div>
      
      <div className="mt-4">
        <OpenStreetMapAutocomplete
          label="Search Full Address"
          value={fullAddress}
          onChange={(value) => setFullAddress(value)}
          onSelectAddress={handleAddressSelect}
          placeholder="Type street, barangay, city... (e.g., Ilang-ilang Batasan Hills Quezon)"
        />
        
        {selectedAddressData && (
          <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs text-green-700 font-medium mb-1">✅ Address Selected</p>
            <div className="text-xs text-gray-600 space-y-1">
              {selectedAddressData.barangay && <p>Barangay: {selectedAddressData.barangay}</p>}
              {selectedAddressData.city && <p>City: {selectedAddressData.city}</p>}
              {selectedAddressData.province && <p>Province: {selectedAddressData.province}</p>}
              {selectedAddressData.region && <p>Region: {selectedAddressData.region}</p>}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
          <input
            type="text"
            name="region"
            value={formData.region || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-gray-50"
            placeholder="Auto-filled from search"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
          <input
            type="text"
            name="province"
            value={formData.province || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-gray-50"
            placeholder="Auto-filled from search"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
          <input
            type="text"
            name="city"
            value={formData.city || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-gray-50"
            placeholder="Auto-filled from search"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Barangay <span className="text-gray-500 font-normal">(optional)</span></label>
          <input
            type="text"
            name="barangay"
            value={formData.barangay || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-gray-50"
            placeholder="Auto-filled from search"
          />
        </div>
      </div>
    </>
  );

  const renderDeliveryFields = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
          <input
            type="text"
            name="vehicleType"
            value={formData.vehicleType || ''}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
          <input
            type="text"
            name="licenseNumber"
            value={formData.licenseNumber || ''}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
            disabled
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
          <input
            type="text"
            name="region"
            value={formData.region || ''}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
          <input
            type="text"
            name="province"
            value={formData.province || ''}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
          <input
            type="text"
            name="city"
            value={formData.city || ''}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Barangay <span className="text-gray-500 font-normal">(optional)</span></label>
          <input
            type="text"
            name="barangay"
            value={formData.barangay || ''}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
            disabled
          />
        </div>
      </div>
    </>
  );

  const renderAdminFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
        <input
          type="text"
          name="username"
          value={formData.username || ''}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
          disabled
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName || ''}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email || ''}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
          disabled
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone || ''}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
        />
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Profile Settings</h2>
            <p className="text-gray-600 mt-1">View and update your profile information</p>
          </div>
          
          {/* Active/Inactive Toggle - Only for delivery users */}
          {userType === 'delivery' && (
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${isAvailable ? 'text-green-600' : 'text-gray-500'}`}>
                {isAvailable ? 'Available' : 'Unavailable'}
              </span>
              <button
                type="button"
                onClick={handleActiveToggle}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 ${
                  isAvailable ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    isAvailable ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}
        </div>
      </div>

      {message.text && message.type === 'error' && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-800">
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Profile Photo Upload - For all user types */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-rose-50 flex items-center justify-center border-2 border-rose-500">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-5xl text-rose-600 font-semibold">
                  {userType === 'buyer' && '👤'}
                  {userType === 'seller' && '🏪'}
                  {userType === 'delivery' && '🚚'}
                  {userType === 'admin' && '⚙️'}
                </span>
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                id="photo-upload"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <label
                htmlFor="photo-upload"
                className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 py-2 px-4 rounded-lg cursor-pointer text-sm transition-colors"
              >
                📷 Change Photo
              </label>
              <p className="text-xs text-gray-500 mt-2">
                JPG, PNG or GIF. Max size 5MB.
              </p>
            </div>
          </div>
        </div>
        {userType === 'buyer' && renderBuyerFields()}
        {userType === 'seller' && renderSellerFields()}
        {userType === 'delivery' && (
          <>
            {renderDeliveryFields()}
            
            {/* Status Information for Delivery */}
            <div className={`mt-4 p-4 rounded-lg border-2 ${isAvailable ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-start gap-3">
                <div className="text-2xl">
                  {isAvailable ? '✅' : '⏸️'}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">
                    {isAvailable ? 'You are currently available' : 'You are currently unavailable'}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {isAvailable 
                      ? 'You will receive new delivery assignments. Toggle off when you want to stop receiving new orders.'
                      : 'You will not receive new delivery assignments. Toggle on when you are ready to accept deliveries.'}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
        {userType === 'admin' && renderAdminFields()}

        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;