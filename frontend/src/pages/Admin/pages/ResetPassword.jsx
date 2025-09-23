import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
  // Ensure we target the backend when VITE_API_URL is not provided (dev fallback)
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  // Normalize API base so we don't end up with double '/api' if VITE_API_URL already contains '/api'
  const apiBase = baseUrl.replace(/\/+$/,'') + (baseUrl.endsWith('/api') ? '' : '/api');
  const res = await fetch(`${apiBase}/users/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      const data = await res.json();

      if (res.ok) {
        setMessage('Password reset successful. You can login now.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Error resetting password');
      }
    } catch (err) {
      setError('Something went wrong.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 card p-8">
      <h2 className="text-2xl font-bold mb-6">Reset Password</h2>
      {message && <p className="text-green-600">{message}</p>}
      {error && <p className="text-red-600">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="input-field w-full"
          required
          maxLength={6}
        />
        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="input-field w-full"
          required
        />
        <button type="submit" className="btn-primary w-full py-3">
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
