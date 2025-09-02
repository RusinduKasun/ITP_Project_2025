import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext.jsx';
import { FaUser, FaSignOutAlt, FaHome, FaTachometerAlt, FaCrown, FaBox, FaTruck, FaDollarSign, FaWarehouse } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-soft border-b border-secondary-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <FaUser className="text-white text-sm" />
            </div>
            <span className="text-xl font-bold text-secondary-900">Test of Ceylon</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-secondary-600 hover:text-primary-600 transition-colors duration-200 font-medium"
            >
              <FaHome className="inline mr-2" />
              Home
            </Link>
            
            {user && (
              <>
                {/* Role-based Dashboard Links */}
                {user.role === 'admin' && (
                  <Link 
                    to="/admin-dashboard" 
                    className="text-secondary-600 hover:text-primary-600 transition-colors duration-200 font-medium"
                  >
                    <FaCrown className="inline mr-2" />
                    Admin Dashboard
                  </Link>
                )}
                
                {user.role === 'supplier' && (
                  <Link 
                    to="/supplier-dashboard" 
                    className="text-secondary-600 hover:text-primary-600 transition-colors duration-200 font-medium"
                  >
                    <FaTruck className="inline mr-2" />
                    Supplier Dashboard
                  </Link>
                )}
                
                {user.role === 'finance-manager' && (
                  <Link 
                    to="/finance-dashboard" 
                    className="text-secondary-600 hover:text-primary-600 transition-colors duration-200 font-medium"
                  >
                    <FaDollarSign className="inline mr-2" />
                    Finance Dashboard
                  </Link>
                )}
                
                {user.role === 'inventory-manager' && (
                  <Link 
                    to="/inventory-dashboard" 
                    className="text-secondary-600 hover:text-primary-600 transition-colors duration-200 font-medium"
                  >
                    <FaWarehouse className="inline mr-2" />
                    Inventory Dashboard
                  </Link>
                )}
                

                
                <Link 
                  to="/profile" 
                  className="text-secondary-600 hover:text-primary-600 transition-colors duration-200 font-medium"
                >
                  <FaUser className="text-primary-600 text-sm" />
                  Profile
                </Link>
              </>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    {user.role === 'admin' ? (
                      <FaCrown className="text-primary-500 text-sm" />
                    ) : user.role === 'supplier' ? (
                      <FaTruck className="text-primary-500 text-sm" />
                    ) : user.role === 'finance-manager' ? (
                      <FaDollarSign className="text-primary-500 text-sm" />
                    ) : user.role === 'inventory-manager' ? (
                      <FaWarehouse className="text-primary-500 text-sm" />
                    ) : (
                      <FaUser className="text-primary-500 text-sm" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-secondary-700 hidden sm:block">
                    {user.firstName} {user.lastName}
                    <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'supplier' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'finance-manager' ? 'bg-green-100 text-green-800' :
                      user.role === 'inventory-manager' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role === 'admin' ? 'Admin' :
                       user.role === 'supplier' ? 'Supplier' :
                       user.role === 'finance-manager' ? 'Finance Manager' :
                       user.role === 'inventory-manager' ? 'Inventory Manager' :
                       'User'}
                    </span>
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-outline text-sm py-1.5 px-3"
                >
                  <FaSignOutAlt className="inline mr-1" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="btn-outline text-sm py-1.5 px-3">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm py-1.5 px-3">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
