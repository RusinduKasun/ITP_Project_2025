import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import axios from 'axios';
import { FaUser, FaEnvelope, FaPhone, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

const Profile = () => {
  const { user, updateUser, enableTwoFactor, disableTwoFactor } = useAuth();
  const { logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [twofaMsg, setTwofaMsg] = useState('');
  const [twofaErr, setTwofaErr] = useState('');
  const [pictureUploading, setPictureUploading] = useState(false);
  const [pictureError, setPictureError] = useState('');
  const [pictureMessage, setPictureMessage] = useState('');
  const [previewSrc, setPreviewSrc] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await axios.put('http://localhost:5000/api/users/profile', formData);
      
      if (response.data.success) {
        updateUser(response.data.user);
        setMessage('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original user data
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || ''
      });
    }
  };

  const handlePictureChange = (e) => {
    const file = e.target.files && e.target.files[0];
    setPictureError('');
    setPictureMessage('');
    if (!file) {
      setPreviewSrc('');
      return;
    }
    // Validate it's an image of any type and within size limits
    if (!file.type || !file.type.startsWith('image/')) {
      setPreviewSrc('');
      setPictureError('Please select a valid image file (any image type is supported).');
      return;
    }
    const maxBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxBytes) {
      setPreviewSrc('');
      setPictureError('Image is too large. Please choose a file under 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setPreviewSrc(result);
      }
    };
    reader.onerror = () => {
      setPictureError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleUploadPicture = async () => {
    if (!previewSrc) {
      setPictureError('Please select an image first');
      return;
    }
    setPictureUploading(true);
    setPictureError('');
    setPictureMessage('');
    try {
      const response = await axios.put('http://localhost:5000/api/users/profile/picture', {
        profilePicture: previewSrc
      });
      if (response.data && response.data.user) {
        updateUser(response.data.user);
        setPictureMessage('Profile picture updated successfully!');
        setPreviewSrc('');
      }
    } catch (err) {
      setPictureError(err.response?.data?.message || 'Error updating profile picture');
    } finally {
      setPictureUploading(false);
    }
  };

  const handleRemovePicture = async () => {
    setPictureUploading(true);
    setPictureError('');
    setPictureMessage('');
    try {
      const response = await axios.put('http://localhost:5000/api/users/profile/picture', {
        profilePicture: ''
      });
      if (response.data && response.data.user) {
        updateUser(response.data.user);
        setPictureMessage('Profile picture removed successfully!');
        setPreviewSrc('');
      }
    } catch (err) {
      setPictureError(err.response?.data?.message || 'Error removing profile picture');
    } finally {
      setPictureUploading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card p-8">
        {/* Profile Picture */}
        <div className="flex items-center mb-8">
          <div className="mr-6">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-secondary-100 flex items-center justify-center border">
                <FaUser className="text-secondary-500 text-2xl" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePictureChange}
                  className="block text-sm"
                />
                <div className="text-xs text-secondary-500 mt-1">
                  Supported: JPG, PNG, GIF, WEBP, SVG, HEIC, etc. Max 5 MB.
                </div>
              </div>
              <button
                type="button"
                onClick={handleUploadPicture}
                disabled={pictureUploading}
                className="btn-primary px-4 py-2 disabled:opacity-50"
              >
                {pictureUploading ? 'Uploading...' : 'Upload'}
              </button>
              {user?.profilePicture && (
                <button
                  type="button"
                  onClick={handleRemovePicture}
                  disabled={pictureUploading}
                  className="btn-secondary px-4 py-2 disabled:opacity-50"
                >
                  Remove
                </button>
              )}
            </div>
            {previewSrc && (
              <div className="mt-3 flex items-center gap-3">
                <span className="text-sm text-secondary-600">Preview:</span>
                <img src={previewSrc} alt="Preview" className="w-12 h-12 rounded-full object-cover border" />
              </div>
            )}
            {pictureMessage && (
              <div className="mt-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
                {pictureMessage}
              </div>
            )}
            {pictureError && (
              <div className="mt-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
                {pictureError}
              </div>
            )}
          </div>
        </div>
       
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">User Profile</h1>
            <p className="text-secondary-600 mt-2">Manage your account information</p>
          </div>
          
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary"
            >
              <FaEdit className="inline mr-2" />
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary"
              >
                <FaSave className="inline mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancel}
                className="btn-secondary"
              >
                <FaTimes className="inline mr-2" />
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* 2FA Toggle */}
        <div className="mb-6 p-4 border rounded-lg bg-secondary-50">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-secondary-900">Two-Factor Authentication</div>
              <div className="text-secondary-600 text-sm mt-1">
                Status: {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </div>
            </div>
            {user?.twoFactorEnabled ? (
              <button
                className="btn-secondary"
                onClick={async () => {
                  setTwofaMsg(''); setTwofaErr('');
                  const res = await disableTwoFactor();
                  if (res.success) setTwofaMsg('Two-factor authentication disabled');
                  else setTwofaErr(res.message || 'Failed to disable 2FA');
                }}
              >
                Disable 2FA
              </button>
            ) : (
              <button
                className="btn-primary"
                onClick={async () => {
                  setTwofaMsg(''); setTwofaErr('');
                  const res = await enableTwoFactor();
                  if (res.success) setTwofaMsg('Two-factor authentication enabled');
                  else setTwofaErr(res.message || 'Failed to enable 2FA');
                }}
              >
                Enable 2FA
              </button>
            )}
          </div>
          {twofaMsg && (
            <div className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">{twofaMsg}</div>
          )}
          {twofaErr && (
            <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{twofaErr}</div>
          )}
        </div>

        {/* Messages */}
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {message}
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              <FaUser className="inline mr-2" />
              Username
            </label>
            <input
              type="text"
              value={user.username}
              disabled
              className="input-field bg-secondary-50"
            />
            <p className="text-sm text-secondary-500 mt-1">Username cannot be changed</p>
          </div>

          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                <FaUser className="inline mr-2" />
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={!isEditing}
                className={`input-field ${!isEditing ? 'bg-secondary-50' : ''}`}
                placeholder="Enter first name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                <FaUser className="inline mr-2" />
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={!isEditing}
                className={`input-field ${!isEditing ? 'bg-secondary-50' : ''}`}
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                <FaEnvelope className="inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="input-field bg-secondary-50"
              />
              <p className="text-sm text-secondary-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                <FaPhone className="inline mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                disabled={!isEditing}
                className={`input-field ${!isEditing ? 'bg-secondary-50' : ''}`}
                placeholder="Enter phone number"
              />
            </div>
          </div>

          {/* Role Information (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              <FaUser className="inline mr-2" />
              Account Role
            </label>
            <input
              type="text"
              value={user.role === 'admin' ? 'Administrator' : 'User'}
              disabled
              className="input-field bg-secondary-50"
            />
            <p className="text-sm text-secondary-500 mt-1">Role cannot be changed</p>
          </div>
        </form>
         {/* Delete Account */}
        <div className="mt-6">
          <div className="border-t pt-6">
            <button
              type="button"
              onClick={async () => {
                const ok = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
                if (!ok) return;
                try {
                  setLoading(true);
                  setError('');
                  const res = await axios.delete('http://localhost:5000/api/users/profile');
                  if (res.data && res.data.success) {
                    // clear auth and redirect to home
                    logout();
                    window.location.href = '/';
                  } else {
                    setError(res.data?.message || 'Failed to delete account');
                  }
                } catch (err) {
                  setError(err.response?.data?.message || 'Failed to delete account');
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
