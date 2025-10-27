import React, { useState } from 'react';

const AccountSettings = ({ userType, userData, onUpdateEmail, onUpdatePhone, onUpdatePassword, onCancel }) => {
  const [activeTab, setActiveTab] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [emailData, setEmailData] = useState({
    newEmail: '',
    confirmEmail: '',
    password: ''
  });

  const [phoneData, setPhoneData] = useState({
    newPhone: '',
    confirmPhone: '',
    password: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e) => {
    const { name, value } = e.target;
    setPhoneData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    if (emailData.newEmail !== emailData.confirmEmail) {
      setMessage({ type: 'error', text: 'Email addresses do not match' });
      setIsLoading(false);
      return;
    }

    try {
      await onUpdateEmail(emailData);
      setMessage({ type: 'success', text: 'Email updated successfully! Please verify your new email.' });
      setEmailData({ newEmail: '', confirmEmail: '', password: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update email' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    if (phoneData.newPhone !== phoneData.confirmPhone) {
      setMessage({ type: 'error', text: 'Phone numbers do not match' });
      setIsLoading(false);
      return;
    }

    try {
      await onUpdatePhone(phoneData);
      setMessage({ type: 'success', text: 'Phone number updated successfully!' });
      setPhoneData({ newPhone: '', confirmPhone: '', password: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update phone number' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setIsLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      setIsLoading(false);
      return;
    }

    try {
      await onUpdatePassword(passwordData);
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update password' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Account Settings</h2>
        <p className="text-gray-600 mt-1">Manage your account security and contact information</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-6">
        <button
          onClick={() => {
            setActiveTab('password');
            setMessage({ type: '', text: '' });
          }}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'password'
              ? 'text-rose-600 border-b-2 border-rose-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Change Password
        </button>
        <button
          onClick={() => {
            setActiveTab('email');
            setMessage({ type: '', text: '' });
          }}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'email'
              ? 'text-rose-600 border-b-2 border-rose-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Change Email
        </button>
        <button
          onClick={() => {
            setActiveTab('phone');
            setMessage({ type: '', text: '' });
          }}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'phone'
              ? 'text-rose-600 border-b-2 border-rose-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Change Phone
        </button>
      </div>

      {message.text && (
        <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <form onSubmit={handlePasswordSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                required
                minLength="6"
              />
              <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                required
                minLength="6"
              />
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Updating...' : 'Update Password'}
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
      )}

      {/* Email Tab */}
      {activeTab === 'email' && (
        <form onSubmit={handleEmailSubmit}>
          <div className="mb-4 p-4 bg-blue-50 text-blue-800 rounded-lg">
            <p className="text-sm">Current Email: <strong>{userData?.email}</strong></p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Email</label>
              <input
                type="email"
                name="newEmail"
                value={emailData.newEmail}
                onChange={handleEmailChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Email</label>
              <input
                type="email"
                name="confirmEmail"
                value={emailData.confirmEmail}
                onChange={handleEmailChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <input
                type="password"
                name="password"
                value={emailData.password}
                onChange={handleEmailChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Enter your password to confirm this change</p>
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Updating...' : 'Update Email'}
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
      )}

      {/* Phone Tab */}
      {activeTab === 'phone' && (
        <form onSubmit={handlePhoneSubmit}>
          <div className="mb-4 p-4 bg-blue-50 text-blue-800 rounded-lg">
            <p className="text-sm">Current Phone: <strong>{userData?.phone}</strong></p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Phone Number</label>
              <input
                type="tel"
                name="newPhone"
                value={phoneData.newPhone}
                onChange={handlePhoneChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Phone Number</label>
              <input
                type="tel"
                name="confirmPhone"
                value={phoneData.confirmPhone}
                onChange={handlePhoneChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <input
                type="password"
                name="password"
                value={phoneData.password}
                onChange={handlePhoneChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Enter your password to confirm this change</p>
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Updating...' : 'Update Phone'}
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
      )}
    </div>
  );
};

export default AccountSettings;