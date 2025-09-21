import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext.jsx";
import {
  FaUser,
  FaSignOutAlt,
  FaHome,
  FaCrown,
  FaTruck,
  FaDollarSign,
  FaWarehouse,
  FaClipboardList,
  FaBars,
  FaTimes,
  FaShoppingCart,
  FaUserCircle,
} from "react-icons/fa";
import { GiFruitBowl } from "react-icons/gi";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Get cart count from per-user localStorage
    const getCount = () => {
      if (!user) return 0;
      const uid = user._id || user.id || user.email;
      const key = `cartCount_user_${uid}`;
      return parseInt(localStorage.getItem(key) || '0');
    };
    setCartCount(getCount());

    // Update on storage change (multi-tab support)
    const handleStorage = (e) => {
      // If storage key is user-scoped cart count for current user, update
      if (!user) return;
      const uid = user._id || user.id || user.email;
      const key = `cartCount_user_${uid}`;
      if (e.key === key) {
        setCartCount(e.newValue ? parseInt(e.newValue) : 0);
      }
    };
    // Also listen for a custom event so same-tab updates are reflected immediately
    const handleCartUpdated = () => {
      const current = (() => {
        if (!user) return 0;
        const uid = user._id || user.id || user.email;
        const key = `cartCount_user_${uid}`;
        return parseInt(localStorage.getItem(key) || '0');
      })();
      setCartCount(current);
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener('cart-updated', handleCartUpdated);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener('cart-updated', handleCartUpdated);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-soft border-b border-secondary-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <GiFruitBowl className="text-primary-600 text-2xl" />
            <span className="text-xl font-bold text-secondary-900">
              Taste of Ceylon
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-secondary-600 hover:text-primary-600 font-medium"
            >
              <FaHome className="inline mr-2" /> Home
            </Link>
            <Link
              to="/products"
              className="text-secondary-600 hover:text-primary-600 font-medium"
            >
              Products
            </Link>
            <Link
              to="/about"
              className="text-secondary-600 hover:text-primary-600 font-medium"
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className="text-secondary-600 hover:text-primary-600 font-medium"
            >
              Contact
            </Link>

            {/* Role-based dashboards */}
            {user?.role === "admin" && (
              <Link
                to="/admin-dashboard"
                className="text-secondary-600 hover:text-primary-600 font-medium"
              >
                <FaCrown className="inline mr-2" /> Admin Dashboard
              </Link>
            )}
            {user?.role === "supplier" && (
              <Link
                to="/supplier-dashboard"
                className="text-secondary-600 hover:text-primary-600 font-medium"
              >
                <FaTruck className="inline mr-2" /> Supplier Dashboard
              </Link>
            )}
            {user?.role === "finance-manager" && (
              <Link
                to="/finance-dashboard"
                className="text-secondary-600 hover:text-primary-600 font-medium"
              >
                <FaDollarSign className="inline mr-2" /> Finance Dashboard
              </Link>
            )}
            {user?.role === "inventory-manager" && (
              <Link
                to="/inventory-dashboard"
                className="text-secondary-600 hover:text-primary-600 font-medium"
              >
                <FaWarehouse className="inline mr-2" /> Inventory Dashboard
              </Link>
            )}
            {user?.role === "order-manager" && (
              <Link
                to="/order-dashboard"
                className="text-secondary-600 hover:text-primary-600 font-medium"
              >
                <FaClipboardList className="inline mr-2" /> Order Dashboard
              </Link>
            )}
          </div>

          {/* Right Side (Cart + Auth/Profile) */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative text-secondary-600 hover:text-primary-600"
              title="Cart"
            >
              <FaShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 text-xs font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate("/profile")}
                  className="flex items-center space-x-2 group"
                  aria-label="Go to profile"
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border"
                    />
                  ) : (
                    <FaUserCircle size={28} className="text-primary-500" />
                  )}
                  <span className="hidden sm:block text-sm font-medium text-secondary-700 group-hover:text-primary-600">
                    {user.firstName} {user.lastName}
                  </span>
                </button>

                <button
                  onClick={handleLogout}
                  className="border border-primary-500 text-primary-600 text-sm py-1.5 px-3 rounded hidden sm:block"
                >
                  <FaSignOutAlt className="inline mr-1" /> Logout
                </button>

                {/* Mobile menu toggle */}
                <button
                  onClick={toggleMobileMenu}
                  className="md:hidden p-2 rounded-lg text-secondary-600 hover:text-primary-600 hover:bg-primary-50"
                >
                  {isMobileMenuOpen ? (
                    <FaTimes className="text-xl" />
                  ) : (
                    <FaBars className="text-xl" />
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="border border-primary-500 text-primary-600 text-sm py-1.5 px-3 rounded">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-500 hover:bg-primary-600 text-white text-sm py-1.5 px-3 rounded"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-secondary-200 bg-white">
            <div className="px-4 py-2 space-y-1">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2"
              >
                Home
              </Link>
              <Link
                to="/products"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2"
              >
                Products
              </Link>
              <Link
                to="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2"
              >
                About Us
              </Link>
              <Link
                to="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2"
              >
                Contact
              </Link>

              {/* Role-based */}
              {user?.role === "admin" && (
                <Link
                  to="/admin-dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2"
                >
                  Admin Dashboard
                </Link>
              )}
              {user?.role === "supplier" && (
                <Link
                  to="/supplier-dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2"
                >
                  Supplier Dashboard
                </Link>
              )}
              {user?.role === "finance-manager" && (
                <Link
                  to="/finance-dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2"
                >
                  Finance Dashboard
                </Link>
              )}
              {user?.role === "inventory-manager" && (
                <Link
                  to="/inventory-dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2"
                >
                  Inventory Dashboard
                </Link>
              )}
              {user?.role === "order-manager" && (
                <Link
                  to="/order-dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2"
                >
                  Order Dashboard
                </Link>
              )}

              {user && (
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2 text-red-600"
                >
                  <FaSignOutAlt className="inline mr-2" /> Logout
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
