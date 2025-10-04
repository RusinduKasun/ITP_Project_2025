import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
  // Ensure we target the backend when VITE_API_URL is not provided (dev fallback)
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  // Normalize API base so we don't end up with double '/api' if VITE_API_URL already contains '/api'
  const apiBase = baseUrl.replace(/\/+$/,'') + (baseUrl.endsWith('/api') ? '' : '/api');
  const res = await fetch(`${apiBase}/users/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (res.ok) {
        setMessage('OTP sent to your email.');
        navigate('/reset-password', { state: { email } });
      } else {
        setError(data.message || 'Error sending OTP');
      }
    } catch (err) {
      setError('Something went wrong.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 card p-8">
      <h2 className="text-2xl font-bold mb-6">Forgot Password</h2>
      {message && <p className="text-green-600">{message}</p>}
      {error && <p className="text-red-600">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Enter your email"
          className="input-field w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="btn-primary w-full py-3">
          Send OTP
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
