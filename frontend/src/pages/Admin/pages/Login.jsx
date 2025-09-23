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
    console.log('handleSubmit called'); // <-- Add this line

    try {
      console.log('Calling login function'); // <-- Add this line
      const result = await login(formData.username, formData.password);
      console.log('Login result:', result); // <-- Existing debug line

      if (result.success && result.twofaRequired) {
        setTwofaRequired(true);
        setTempToken(result.tempToken);
      } else if (result.success && result.user) {
        // Redirect based on user role (use hyphenated routes)
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
      console.error('Login error:', err); // <-- Existing error log
      console.log('Error caught in handleSubmit'); // <-- Add this line
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 ">
      <div className="max-w-md w-full">
        <div className="card p-8 flex flex-col w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaSignInAlt className="text-primary-600 text-2xl" />
            </div>
            <h2 className="text-3xl font-bold text-secondary-900">Welcome Back</h2>
            <p className="text-secondary-600 mt-2">Sign in to your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Login or 2FA Form */}
          {!twofaRequired ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-secondary-700 mb-2">
                  Email or Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-secondary-400" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="input-field pl-10"
                    placeholder="Enter your email or username"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-secondary-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="input-field pl-10"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-secondary-700 mb-2">
                  Enter 2FA Code
                </label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="input-field"
                  placeholder="6-digit code"
                  maxLength={6}
                />
                <p className="text-sm text-secondary-500 mt-2">Check your email for the code.</p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>
          )}
          <p className="mt-4 text-sm">
            <Link to="/forgot-password" className="text-primary-600 hover:text-primary-700">
              Forgot your password?
            </Link>
          </p>


          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-secondary-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
