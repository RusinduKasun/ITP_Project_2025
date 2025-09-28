import React, { useState, useEffect } from 'react';
import '../../Customer/Payment.css';
import Nav from '../../Home/Nav/Nav.jsx';
import { useAuth } from '../../../Context/AuthContext';
import axios from 'axios';
import { FaUser, FaEnvelope, FaPhone, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

const Profile = () => {
  const { user, updateUser, enableTwoFactor, disableTwoFactor, logout } = useAuth();
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
    username: user?.username || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || ''
      });
    }
  }, [user]);

  // Auto-hide success/info messages after a short delay to reduce clutter
  useEffect(() => {
    if (message || pictureMessage || twofaMsg) {
      const t = setTimeout(() => {
        setMessage('');
        setPictureMessage('');
        setTwofaMsg('');
      }, 4500);
      return () => clearTimeout(t);
    }
  }, [message, pictureMessage, twofaMsg]);

  // Auto-hide errors after a longer delay (still visible enough for the user)
  useEffect(() => {
    if (error || pictureError || twofaErr) {
      const t = setTimeout(() => {
        setError('');
        setPictureError('');
        setTwofaErr('');
      }, 7000);
      return () => clearTimeout(t);
    }
  }, [error, pictureError, twofaErr]);

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
      console.log('updateProfile response', response.data);
      if (response.data && (response.data.user || response.data.success)) {
        const updated = response.data.user || response.data;
        // Update auth context and local form state so UI reflects the saved username
        updateUser(updated);
        setFormData(prev => ({
          ...prev,
          username: updated.username || prev.username,
          firstName: updated.firstName || prev.firstName,
          lastName: updated.lastName || prev.lastName,
          phoneNumber: updated.phoneNumber || prev.phoneNumber
        }));
        setMessage(response.data.message || 'Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (err) {
      console.error('updateProfile error', err.response?.data || err.message || err);
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
        username: user.username || '',
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
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="loader mb-4" aria-hidden></div>
          <div>Loading profile...</div>
        </div>
      </div>
    );
  }

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();

  return (
    <>
      <Nav />
      <div className="max-w-6xl mx-auto px-4 py-8 pt-20">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Your Profile</h2>
              <p className="text-emerald-100 text-sm mt-1">Manage account settings and personal information</p>
            </div>
            <div className="flex items-center gap-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white text-emerald-600 px-4 py-2 rounded-md font-medium shadow-sm hover:shadow"
                >
                  <FaEdit className="inline mr-2" /> Edit
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-white text-emerald-600 px-4 py-2 rounded-md font-medium shadow-sm hover:shadow disabled:opacity-60"
                  >
                    <FaSave className="inline mr-2" /> {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-white/20 text-white px-4 py-2 rounded-md font-medium ml-2"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 md:flex md:space-x-6">
          {/* Left column - avatar/card */}
          <aside className="md:w-1/3 mb-6 md:mb-0">
            <div className="bg-emerald-50 rounded-lg p-5 text-center">
              <div className="mx-auto w-32 h-32 rounded-full overflow-hidden border-4 border-white -mt-16 shadow-lg bg-white">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <FaUser className="text-4xl text-emerald-600" />
                  </div>
                )}
              </div>

              <h3 className="mt-4 text-lg font-semibold text-emerald-800">{fullName || user.username}</h3>
              <p className="text-sm text-emerald-600">{user.role === 'admin' ? 'Administrator' : 'User'}</p>

              <div className="mt-4">
                <label className="block text-sm text-left mb-2">Update avatar</label>
                <input type="file" accept="image/*" onChange={handlePictureChange} className="block w-full text-sm mb-2" />
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={handleUploadPicture}
                    disabled={pictureUploading}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm disabled:opacity-60"
                  >{pictureUploading ? 'Uploading...' : 'Upload'}</button>
                  {user?.profilePicture && (
                    <button
                      onClick={handleRemovePicture}
                      disabled={pictureUploading}
                      className="px-4 py-2 bg-white border rounded-md text-sm"
                    >Remove</button>
                  )}
                </div>

                {previewSrc && (
                  <div className="mt-3">
                    <div className="text-sm text-emerald-700 mb-2">Preview</div>
                    <img src={previewSrc} alt="Preview" className="mx-auto w-24 h-24 rounded-full object-cover border" />
                  </div>
                )}

                {pictureMessage && <div className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">{pictureMessage}</div>}
                {pictureError && <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{pictureError}</div>}
              </div>
            </div>
          </aside>

          {/* Right column - form */}
          <main className="md:flex-1">
            {/* notifications */}
            {message && <div className="mb-4 px-4 py-3 rounded bg-green-50 border border-green-200 text-green-700">{message}</div>}
            {error && <div className="mb-4 px-4 py-3 rounded bg-red-50 border border-red-200 text-red-700">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`mt-1 block w-full rounded-md border-gray-200 p-2 ${!isEditing ? 'bg-gray-50' : ''}`}
                    placeholder="Username"
                  />
                  {!isEditing && <p className="text-xs text-gray-500 mt-1">Toggle edit to change your username</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full rounded-md border-gray-200 p-2" placeholder="Phone number" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First name</label>
                  <input name="firstName" value={formData.firstName} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full rounded-md border-gray-200 p-2" placeholder="First name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last name</label>
                  <input name="lastName" value={formData.lastName} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full rounded-md border-gray-200 p-2" placeholder="Last name" />
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-800">Two-Factor Authentication</div>
                    <div className="text-sm text-gray-600">Status: {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}</div>
                  </div>
                  <div>
                    {user?.twoFactorEnabled ? (
                      <button
                        type="button"
                        onClick={async () => {
                          setTwofaMsg(''); setTwofaErr('');
                          const res = await disableTwoFactor();
                          if (res.success) setTwofaMsg('Two-factor authentication disabled');
                          else setTwofaErr(res.message || 'Failed to disable 2FA');
                        }}
                        className="px-3 py-2 bg-white border rounded-md text-sm"
                      >Disable</button>
                    ) : (
                      <button
                        type="button"
                        onClick={async () => {
                          setTwofaMsg(''); setTwofaErr('');
                          const res = await enableTwoFactor();
                          if (res.success) setTwofaMsg('Two-factor authentication enabled');
                          else setTwofaErr(res.message || 'Failed to enable 2FA');
                        }}
                        className="px-3 py-2 bg-emerald-600 text-white rounded-md text-sm"
                      >Enable</button>
                    )}
                  </div>
                </div>
                {twofaMsg && <div className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">{twofaMsg}</div>}
                {twofaErr && <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{twofaErr}</div>}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-600 text-white rounded-md">{loading ? 'Saving...' : 'Save changes'}</button>
                  <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-100 rounded-md">Cancel</button>
                </div>

                <div>
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
                          logout();
                          setMessage('Account deleted — redirecting to home...');
                          setTimeout(() => { window.location.href = '/home'; }, 1200);
                        } else {
                          setError(res.data?.message || 'Failed to delete account');
                        }
                      } catch (err) {
                        setError(err.response?.data?.message || 'Failed to delete account');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md"
                  >Delete account</button>
                </div>
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
    </>
  );
};

export default Profile;
