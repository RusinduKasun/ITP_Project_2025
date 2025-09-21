import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
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

  const redirectByRole = (role) => {
    switch (role) {
      case 'admin': return '/admin-dashboard';
      case 'supplier': return '/supplier-dashboard';
      case 'finance-manager': return '/finance-dashboard';
      case 'inventory-manager': return '/inventory-dashboard';
      case 'order-manager': return '/order-dashboard';
      default: return '/';
    }
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
        navigate(redirectByRole(result.user.role));
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
            navigate('/');
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 bg-gray-50">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow p-8 border border-gray-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <FaSignInAlt className="text-emerald-600 text-2xl" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
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
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                      Email or username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="text-secondary-400" />
                      </div>
                      <input
                        autoFocus
                        autoComplete="username"
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        className="pl-10 bg-white text-gray-900 placeholder-gray-400 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full py-2"
                        placeholder="Enter your email or username"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-secondary-400" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        autoComplete="current-password"
                        aria-describedby="password-help"
                        className="pl-10 bg-white text-gray-900 placeholder-gray-400 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full py-2"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-600"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                      <p id="password-help" className="text-xs text-secondary-500 mt-1">Use at least 6 characters.</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-600 text-white rounded-md shadow-sm"
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </button>
                </form>
)

           : (
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
                className="w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-secondary-200 text-primary-600 rounded-md shadow-sm"
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
