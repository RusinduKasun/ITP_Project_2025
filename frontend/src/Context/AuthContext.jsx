import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (usernameOrPayload, maybePassword) => {
    try {
      // Support either login(username, password) or login({ username, password })
      let payload = {};
      if (typeof usernameOrPayload === 'object') {
        payload = { ...usernameOrPayload };
      } else {
        payload = { username: usernameOrPayload, password: maybePassword };
      }

      const response = await axios.post('http://localhost:5000/api/auth/login', payload);
      
      // If 2FA required, return temp token to caller
      if (response.data.twofaRequired) {
        return { success: true, twofaRequired: true, tempToken: response.data.tempToken };
      }

      const { user: userData, token: authToken } = response.data;

      setUser(userData);
      setToken(authToken);
      localStorage.setItem('token', authToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      
      return { success: true, user: userData };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const verifyTwoFactor = async (tempToken, otp) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/verify-2fa', { tempToken, otp });
      const { user: userData, token: authToken } = response.data;
      setUser(userData);
      setToken(authToken);
      localStorage.setItem('token', authToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Verification failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', userData);
      
      const { user: newUser, token: authToken } = response.data;
      
      setUser(newUser);
      setToken(authToken);
      localStorage.setItem('token', authToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      
      return { success: true, user: newUser };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const enableTwoFactor = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/enable-2fa');
      if (response.data && response.data.twoFactorEnabled) {
        const updated = { ...(user || {}), twoFactorEnabled: true };
        setUser(updated);
        return { success: true };
      }
      return { success: false, message: 'Failed to enable 2FA' };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to enable 2FA' };
    }
  };

  const disableTwoFactor = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/disable-2fa');
      if (response.data && response.data.twoFactorEnabled === false) {
        const updated = { ...(user || {}), twoFactorEnabled: false };
        setUser(updated);
        return { success: true };
      }
      return { success: false, message: 'Failed to disable 2FA' };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to disable 2FA' };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    verifyTwoFactor,
    enableTwoFactor,
    disableTwoFactor
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
