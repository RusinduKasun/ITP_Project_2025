import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../Context/AuthContext.jsx";
import {
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
    if (!user) return;

    const uid = user._id || user.id || user.email;
    const key = `cartCount_user_${uid}`;
    setCartCount(parseInt(localStorage.getItem(key) || "0"));

    const handleStorage = (e) => {
      if (e.key === key) {
        setCartCount(e.newValue ? parseInt(e.newValue) : 0);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <nav className="bg-gradient-to-r from-green-700 via-green-600 to-green-500 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/home" className="flex items-center space-x-2">
            <GiFruitBowl className="text-white text-2xl" />
            <span className="text-xl font-bold text-white tracking-wide">
              Taste of Ceylon
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6 text-white font-medium">
            <Link to="/home" className="hover:text-yellow-300 flex items-center">
              <FaHome className="mr-1" /> Home
            </Link>
            <Link to="/products" className="hover:text-yellow-300">
              Products
            </Link>
            <Link to="/about" className="hover:text-yellow-300">
              About Us
            </Link>
            <Link to="/contact" className="hover:text-yellow-300">
              Contact
            </Link>

            {/* Role-based dashboards */}
            {user?.role === "admin" && (
              <Link to="/admin-dashboard" className="hover:text-yellow-300">
                <FaCrown className="inline mr-1" /> Admin
              </Link>
            )}
            {user?.role === "supplier" && (
              <Link to="/supplier-dashboard" className="hover:text-yellow-300">
                <FaTruck className="inline mr-1" /> Supplier
              </Link>
            )}
            {user?.role === "finance-manager" && (
              <Link to="/finance-dashboard" className="hover:text-yellow-300">
                <FaDollarSign className="inline mr-1" /> Finance
              </Link>
            )}
            {user?.role === "inventory-manager" && (
              <Link to="/inventory-dashboard" className="hover:text-yellow-300">
                <FaWarehouse className="inline mr-1" /> Inventory
              </Link>
            )}
            {user?.role === "order-manager" && (
              <Link to="/order-dashboard" className="hover:text-yellow-300">
                <FaClipboardList className="inline mr-1" /> Orders
              </Link>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link to="/cart" className="relative text-white hover:text-yellow-300">
              <FaShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-black rounded-full px-2 text-xs font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {user ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate("/profile")}
                  className="flex items-center group"
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border-2 border-white"
                    />
                  ) : (
                    <FaUserCircle size={28} className="text-white" />
                  )}
                  <span className="hidden sm:block ml-2 text-sm font-medium group-hover:text-yellow-300 text-white">
                    {user.firstName} {user.lastName}
                  </span>
                </button>
                <button
                  onClick={handleLogout}
                  className="hidden sm:block bg-white text-green-700 px-3 py-1 rounded-lg text-sm font-medium hover:bg-yellow-300 hover:text-black transition"
                >
                  <FaSignOutAlt className="inline mr-1" /> Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="bg-white text-green-700 px-3 py-1 rounded-lg text-sm font-medium hover:bg-yellow-300 hover:text-black transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-yellow-400 text-black px-3 py-1 rounded-lg text-sm font-bold hover:bg-white hover:text-green-700 transition"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-white hover:text-yellow-300"
            >
              {isMobileMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-green-600 text-white shadow-lg rounded-b-lg">
            <div className="px-4 py-3 space-y-2">
              <Link to="/home" onClick={toggleMobileMenu} className="block py-1 hover:text-yellow-300">Home</Link>
              <Link to="/products" onClick={toggleMobileMenu} className="block py-1 hover:text-yellow-300">Products</Link>
              <Link to="/about" onClick={toggleMobileMenu} className="block py-1 hover:text-yellow-300">About Us</Link>
              <Link to="/contact" onClick={toggleMobileMenu} className="block py-1 hover:text-yellow-300">Contact</Link>

              {/* Role-based */}
              {user?.role === "admin" && <Link to="/admin-dashboard" onClick={toggleMobileMenu} className="block py-1 hover:text-yellow-300">Admin</Link>}
              {user?.role === "supplier" && <Link to="/supplier-dashboard" onClick={toggleMobileMenu} className="block py-1 hover:text-yellow-300">Supplier</Link>}
              {user?.role === "finance-manager" && <Link to="/finance-dashboard" onClick={toggleMobileMenu} className="block py-1 hover:text-yellow-300">Finance</Link>}
              {user?.role === "inventory-manager" && <Link to="/inventory-dashboard" onClick={toggleMobileMenu} className="block py-1 hover:text-yellow-300">Inventory</Link>}
              {user?.role === "order-manager" && <Link to="/order-dashboard" onClick={toggleMobileMenu} className="block py-1 hover:text-yellow-300">Orders</Link>}

              {user && (
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2 text-red-200 hover:text-red-400"
                >
                  <FaSignOutAlt className="inline mr-1" /> Logout
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
