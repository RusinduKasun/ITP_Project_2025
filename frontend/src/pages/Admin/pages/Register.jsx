import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../Context/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaUserPlus } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    // sanitize inputs: for username allow alphanumerics, dot, underscore, hyphen; for names allow letters, spaces, apostrophe and hyphen
    if (name === 'username') {
      const sanitized = value.replace(/[^a-zA-Z0-9._-]/g, '');
      setFormData({ ...formData, [name]: sanitized });
      return;
    }
    if (name === 'firstName' || name === 'lastName') {
      const sanitized = value.replace(/[^a-zA-Z\s'-]/g, '');
      setFormData({ ...formData, [name]: sanitized });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});

    // Client-side validation
    const errs = {};
    if (!formData.username || formData.username.trim().length < 3) errs.username = 'Username must be at least 3 characters';
    if (!formData.firstName || formData.firstName.trim().length === 0) errs.firstName = 'First name is required';
    if (!formData.lastName || formData.lastName.trim().length === 0) errs.lastName = 'Last name is required';
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) errs.email = 'Valid email is required';
    if (!formData.password || formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
  if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber)) errs.phoneNumber = 'Enter a valid 10-digit phone number';

    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      setLoading(false);
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    // Validate username length
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      setLoading(false);
      return;
    }

    try {
      const userData = {
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber
      };

      const result = await register(userData);
      
      if (result.success) {
        navigate('/home');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred');
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
              <FaUserPlus className="text-emerald-600 text-2xl" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Create account</h2>
            <p className="text-gray-600 mt-2">Join our user management system</p>
          </div>

          {/* Error Message */}
          {error && (
            <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
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
                  aria-invalid={fieldErrors.username ? 'true' : 'false'}
                  className="w-full pl-10 bg-white text-gray-900 placeholder-gray-400 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 py-2"
                  placeholder="Choose a username"
                  minLength={3}
                  maxLength={30}
                />
                {fieldErrors.username && <p className="text-xs text-red-600 mt-1">{fieldErrors.username}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-secondary-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    aria-invalid={fieldErrors.firstName ? 'true' : 'false'}
                    className="w-full pl-10 bg-white text-gray-900 placeholder-gray-400 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 py-2"
                    placeholder="First name"
                  />
                  {fieldErrors.firstName && <p className="text-xs text-red-600 mt-1">{fieldErrors.firstName}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-secondary-700 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    aria-invalid={fieldErrors.lastName ? 'true' : 'false'}
                    className="w-full pl-10 bg-white text-gray-900 placeholder-gray-400 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 py-2"
                    placeholder="Last name"
                  />
                  {fieldErrors.lastName && <p className="text-xs text-red-600 mt-1">{fieldErrors.lastName}</p>}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                    required
                    aria-invalid={fieldErrors.email ? 'true' : 'false'}
                  className="w-full pl-10 bg-white text-gray-900 placeholder-gray-400 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 py-2"
                  placeholder="Enter your email"
                />
                  {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-secondary-700 mb-2">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, '') })}
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                    className="w-full pl-10 bg-white text-gray-900 placeholder-gray-400 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 py-2"
                    aria-invalid={fieldErrors.phoneNumber ? 'true' : 'false'}
                  placeholder="Enter 10-digit phone number"
                />
                  {fieldErrors.phoneNumber && <p className="text-xs text-red-600 mt-1">{fieldErrors.phoneNumber}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    aria-invalid={fieldErrors.password ? 'true' : 'false'}
                    autoComplete="new-password"
                    aria-describedby="password-help"
                    className="w-full pl-10 bg-white text-gray-900 placeholder-gray-400 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 py-2"
                    placeholder="Create a password"
                    minLength={6}
                  />
                  {fieldErrors.password && <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>}
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                  <p id="password-help" className="text-xs text-gray-500 mt-1">Password must be at least 6 characters.</p>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    aria-invalid={fieldErrors.confirmPassword ? 'true' : 'false'}
                    autoComplete="new-password"
                    className="w-full pl-10 bg-white text-gray-900 placeholder-gray-400 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 py-2"
                    placeholder="Confirm your password"
                    minLength={6}
                  />
                  {fieldErrors.confirmPassword && <p className="text-xs text-red-600 mt-1">{fieldErrors.confirmPassword}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-600 text-white rounded-md shadow-sm"
              aria-disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-secondary-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
