import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext.jsx';
import { FaLeaf, FaShieldAlt, FaHandHoldingHeart, FaRocket, FaCrown, FaBox, FaStar, FaShoppingCart } from 'react-icons/fa';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] relative">
      {/* Background Image */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1606788075761-7a4b8f0a5d1b')] bg-cover bg-center opacity-20"></div>
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="text-center py-20 px-4 bg-gradient-to-b from-white/80 via-green-50/70 to-yellow-50/80">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-secondary-900 mb-6">
              Taste the Goodness of{' '}
              <span className="text-primary-500">Sri Lanka’s Fruits</span>
            </h1>
            <p className="text-xl text-secondary-700 mb-8 max-w-2xl mx-auto">
              Our platform is dedicated to bringing you natural, handmade, and value-added products made from traditional Sri Lankan fruits such as jak fruit, king coconut, veralu, divul, and beli. 
              We transform seasonal abundance into nutritious foods, snacks, and herbal products — reducing waste and empowering rural communities.
            </p>
            
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
                <Link to="/profile" className="btn-outline text-lg py-3 px-8">
                  View Profile
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 px-4 bg-white/80 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-secondary-900 mb-12">
              Why Choose Us?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card p-6 text-center bg-white/90">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaLeaf className="text-primary-500 text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                  100% Natural
                </h3>
                <p className="text-secondary-600">
                  All products are handmade from traditional fruits, free from harmful chemicals and preservatives.
                </p>
              </div>

              <div className="card p-6 text-center bg-white/90">
                <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaHandHoldingHeart className="text-secondary-600 text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                  Supporting Communities
                </h3>
                <p className="text-secondary-600">
                  Every purchase helps rural farmers and artisans earn sustainable livelihoods.
                </p>
              </div>

              <div className="card p-6 text-center bg-white/90">
                <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaShieldAlt className="text-accent-600 text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                  Trusted Quality
                </h3>
                <p className="text-secondary-600">
                  Carefully crafted with hygienic practices and quality checks to ensure your health and safety.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="py-16 px-4 bg-white/90 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-secondary-900 mb-12">
              Featured Products
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card p-6 text-center hover:shadow-lg transition-shadow duration-300 bg-white/95">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaBox className="text-orange-600 text-3xl" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                  Jak Fruit Chips
                </h3>
                <p className="text-secondary-600 mb-4">
                  Crispy, healthy, and rich in flavor — the perfect guilt-free snack.
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

              <div className="card p-6 text-center hover:shadow-lg transition-shadow duration-300 bg-white/95">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaBox className="text-blue-600 text-3xl" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                  King Coconut Drink
                </h3>
                <p className="text-secondary-600 mb-4">
                  Refreshing, natural hydration with authentic Sri Lankan taste.
                </p>
                <div className="flex items-center justify-center mb-4">
                  <FaStar className="text-yellow-400 text-sm" />
                  <FaStar className="text-yellow-400 text-sm" />
                  <FaStar className="text-yellow-400 text-sm" />
                  <FaStar className="text-yellow-400 text-sm" />
                  <FaStar className="text-gray-300 text-sm" />
                  <span className="ml-2 text-sm text-secondary-600">(4.8)</span>
                </div>
                <button className="btn-primary w-full">
                  <FaShoppingCart className="inline mr-2" />
                  View Details
                </button>
              </div>

              <div className="card p-6 text-center hover:shadow-lg transition-shadow duration-300 bg-white/95">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaBox className="text-green-600 text-3xl" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                  Herbal Belimal Tea
                </h3>
                <p className="text-secondary-600 mb-4">
                  A soothing traditional tea made from the sacred Bael fruit.
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

        {/* Tech Stack Section */}
        <div className="py-16 px-4 bg-secondary-50/80 backdrop-blur-sm">
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
    </div>
  );
};

export default Home;
