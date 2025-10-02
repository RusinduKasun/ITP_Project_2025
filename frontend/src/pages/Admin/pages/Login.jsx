import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../Context/AuthContext';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [twofaRequired, setTwofaRequired] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [otp, setOtp] = useState('');

  const { login, verifyTwoFactor } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.username, formData.password);

      if (result.success && result.twofaRequired) {
        setTwofaRequired(true);
        setTempToken(result.tempToken);
      } else if (result.success && result.user) {
        switch (result.user.role) {
          case 'admin':
            navigate('/admin-dashboard');
            break;
          case 'supplier':
            navigate('/supplier-dashboard');
            break;
          case 'finance-manager':
            navigate('/finance-dashboard');
            break;
          case 'inventory-manager':
            navigate('/inventory-dashboard');
            break;
          case 'order-manager':
            navigate('/order-dashboard');
            break;
          default:
            navigate('/home');
        }
      } else {
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await verifyTwoFactor(tempToken, otp);
      if (result.success && result.user) {
        switch (result.user.role) {
          case 'admin':
            navigate('/admin-dashboard');
            break;
          case 'supplier':
            navigate('/supplier-dashboard');
            break;
          case 'finance-manager':
            navigate('/finance-dashboard');
            break;
          case 'inventory-manager':
            navigate('/inventory-dashboard');
            break;
          case 'order-manager':
            navigate('/order-dashboard');
            break;
          default:
            navigate('/home');
        }
      } else {
        setError(result.message || 'Invalid code. Please try again.');
      }
    } catch (err) {
      console.error('2FA verify error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 
                    bg-gradient-to-br from-green-50 via-emerald-100 to-lime-200">
      <div className="max-w-md w-full">
        <div className="p-8 bg-white/95 backdrop-blur-lg shadow-2xl rounded-2xl border border-green-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <FaSignInAlt className="text-green-700 text-2xl" />
            </div>
            <h2 className="text-3xl font-bold text-green-900">Welcome Back 👋</h2>
            <p className="text-green-700 mt-2">Login to access your dashboard</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Login or 2FA Form */}
          {!twofaRequired ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-green-900 mb-2">
                  Email or Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-green-500">
                    <FaUser />
                  </span>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none transition"
                    placeholder="Enter your email or username"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-green-900 mb-2">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-green-500">
                    <FaLock />
                  </span>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none transition"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-lg font-semibold rounded-lg bg-green-700 text-white hover:bg-green-800 active:scale-95 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-green-900 mb-2">
                  Enter 2FA Code
                </label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none transition"
                  placeholder="6-digit code"
                  maxLength={6}
                />
                <p className="text-xs text-green-700 mt-2">Check your email for the code.</p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-lg font-semibold rounded-lg bg-green-700 text-white hover:bg-green-800 active:scale-95 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>
          )}

          {/* Extra Links */}
          <div className="flex justify-between items-center mt-6 text-sm">
            <Link to="/forgot-password" className="text-green-700 hover:text-green-900">
              Forgot password?
            </Link>
            <Link to="/register" className="text-green-700 hover:text-green-900 font-medium">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
