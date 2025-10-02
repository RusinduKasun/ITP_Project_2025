import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../Context/AuthContext.jsx';
import { FaUsers, FaShieldAlt, FaChartLine, FaRocket, FaCrown, FaBox, FaStar, FaShoppingCart, FaClipboardList, FaUser } from 'react-icons/fa';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <div className="text-center py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-secondary-900 mb-6">
            Welcome to{' '}
            <span className="text-primary-500">Test of Ceylon</span>
          </h1>
          <p className="text-xl text-secondary-600 mb-6 max-w-2xl mx-auto">
            A comprehensive user management system built with modern technologies. 
            Manage users, profiles, and permissions with ease and security.
          </p>
          {user && (
            <div className="flex items-center justify-center mb-6">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center border">
                  <FaUser className="text-secondary-500 text-xl" />
                </div>
              )}
              <div className="ml-4 text-left">
                <Link to="/profile" className="text-secondary-900 font-semibold hover:text-primary-600">
                  {user.firstName} {user.lastName}
                </Link>
                <div className="text-secondary-600 text-sm">@{user.username}</div>
              </div>
            </div>
          )}
          
          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary text-lg py-3 px-8">
                <FaRocket className="inline mr-2" />
                Get Started
              </Link>
              <Link to="/login" className="btn-outline text-lg py-3 px-8">
                Sign In
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user.role === 'admin' ? (
                <Link to="/admin-dashboard" className="btn-primary text-lg py-3 px-8">
                  <FaCrown className="inline mr-2" />
                  Admin Dashboard
                </Link>
              ) : null}
              {user.role === 'order-manager' ? (
                <Link to="/order-dashboard" className="btn-primary text-lg py-3 px-8">
                  <FaClipboardList className="inline mr-2" />
                  Order Dashboard
                </Link>
              ) : null}
              <Link to="/profile" className="btn-outline text-lg py-3 px-8">
                View Profile
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-secondary-900 mb-12">
            Why Choose Test of Ceylon?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
                         <div className="card p-6 text-center">
               <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <FaUsers className="text-primary-500 text-2xl" />
               </div>
               <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                 User Management
               </h3>
               <p className="text-secondary-600">
                 Easily manage user accounts, profiles, and permissions with an intuitive interface.
               </p>
             </div>

             <div className="card p-6 text-center">
               <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <FaShieldAlt className="text-secondary-600 text-2xl" />
               </div>
               <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                 Secure Authentication
               </h3>
               <p className="text-secondary-600">
                 Built with JWT tokens, bcrypt hashing, and secure middleware for maximum security.
               </p>
             </div>

             <div className="card p-6 text-center">
               <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <FaChartLine className="text-accent-600 text-2xl" />
               </div>
               <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                 Modern Dashboard
               </h3>
               <p className="text-secondary-600">
                 Beautiful, responsive dashboard with real-time updates and analytics.
               </p>
             </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-secondary-900 mb-12">
            Featured Products
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBox className="text-blue-600 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                Premium Electronics
              </h3>
              <p className="text-secondary-600 mb-4">
                High-quality electronic components and devices for all your needs.
              </p>
              <div className="flex items-center justify-center mb-4">
                <FaStar className="text-yellow-400 text-sm" />
                <FaStar className="text-yellow-400 text-sm" />
                <FaStar className="text-yellow-400 text-sm" />
                <FaStar className="text-yellow-400 text-sm" />
                <FaStar className="text-yellow-400 text-sm" />
                <span className="ml-2 text-sm text-secondary-600">(4.9)</span>
              </div>
              <button className="btn-primary w-full">
                <FaShoppingCart className="inline mr-2" />
                View Details
              </button>
            </div>

            <div className="card p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBox className="text-green-600 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                Office Supplies
              </h3>
              <p className="text-secondary-600 mb-4">
                Complete range of office supplies and stationery items.
              </p>
              <div className="flex items-center justify-center mb-4">
                <FaStar className="text-yellow-400 text-sm" />
                <FaStar className="text-yellow-400 text-sm" />
                <FaStar className="text-yellow-400 text-sm" />
                <FaStar className="text-yellow-400 text-sm" />
                <FaStar className="text-gray-300 text-sm" />
                <span className="ml-2 text-sm text-secondary-600">(4.7)</span>
              </div>
              <button className="btn-primary w-full">
                <FaShoppingCart className="inline mr-2" />
                View Details
              </button>
            </div>

            <div className="card p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBox className="text-purple-600 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                Industrial Equipment
              </h3>
              <p className="text-secondary-600 mb-4">
                Professional industrial tools and equipment for businesses.
              </p>
              <div className="flex items-center justify-center mb-4">
                <FaStar className="text-yellow-400 text-sm" />
                <FaStar className="text-yellow-400 text-sm" />
                <FaStar className="text-yellow-400 text-sm" />
                <FaStar className="text-yellow-400 text-sm" />
                <FaStar className="text-yellow-400 text-sm" />
                <span className="ml-2 text-sm text-secondary-600">(5.0)</span>
              </div>
              <button className="btn-primary w-full">
                <FaShoppingCart className="inline mr-2" />
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>

             {/* Color Scheme Showcase */}
       <div className="py-16 px-4 bg-secondary-50">
         <div className="max-w-4xl mx-auto text-center">
           <h2 className="text-3xl font-bold text-secondary-900 mb-8">
             Our Color Palette
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="text-center">
               <div className="w-24 h-24 bg-primary-500 rounded-lg mx-auto mb-4 shadow-lg"></div>
               <h3 className="text-xl font-semibold text-secondary-900 mb-2">Primary (60%)</h3>
               <p className="text-secondary-600 mb-2">Fresh Green</p>
               <p className="text-sm text-secondary-500 font-mono">#4CAF50</p>
             </div>
             <div className="text-center">
               <div className="w-24 h-24 bg-secondary-600 rounded-lg mx-auto mb-4 shadow-lg"></div>
               <h3 className="text-xl font-semibold text-secondary-900 mb-2">Secondary (30%)</h3>
               <p className="text-secondary-600 mb-2">Cool Grey</p>
               <p className="text-sm text-secondary-500 font-mono">#757575</p>
             </div>
             <div className="text-center">
               <div className="w-24 h-24 bg-accent-500 rounded-lg mx-auto mb-4 shadow-lg"></div>
               <h3 className="text-xl font-semibold text-secondary-900 mb-2">Accent (10%)</h3>
               <p className="text-secondary-600 mb-2">Warm Yellow-Orange</p>
               <p className="text-sm text-secondary-500 font-mono">#FFC107</p>
             </div>
           </div>
         </div>
       </div>

       {/* Tech Stack Section */}
       <div className="py-16 px-4 bg-white">
         <div className="max-w-4xl mx-auto text-center">
           <h2 className="text-3xl font-bold text-secondary-900 mb-8">
             Built with Modern Technologies
           </h2>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
             <div className="p-4">
               <div className="text-2xl font-bold text-primary-500">React.js</div>
               <div className="text-sm text-secondary-600">Frontend Framework</div>
             </div>
             <div className="p-4">
               <div className="text-2xl font-bold text-secondary-600">Node.js</div>
               <div className="text-sm text-secondary-600">Backend Runtime</div>
             </div>
             <div className="p-4">
               <div className="text-2xl font-bold text-accent-600">MongoDB</div>
               <div className="text-sm text-secondary-600">Database</div>
             </div>
             <div className="p-4">
               <div className="text-2xl font-bold text-primary-500">Tailwind CSS</div>
               <div className="text-sm text-secondary-600">Styling Framework</div>
             </div>
           </div>
         </div>
       </div>
    </div>
  );
};

export default Home;
