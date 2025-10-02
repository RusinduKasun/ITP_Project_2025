// Footer.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCopyright, 
  faAppleAlt, 
  faLeaf, 
  faHeart, 
  faGlobe,
  faPhone,
  faEnvelope,
  faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-r from-slate-900 via-gray-900 to-slate-800 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500 rounded-full mix-blend-multiply -translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-green-500 rounded-full mix-blend-multiply translate-x-32 translate-y-32"></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-emerald-400 rounded-full mix-blend-multiply -translate-x-24 -translate-y-24"></div>
      </div>

      <div className="relative">
        {/* Top decorative line */}
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-600"></div>
        
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faAppleAlt} 
                    className="text-3xl text-emerald-400 filter drop-shadow-lg" 
                  />
                  <div className="absolute -inset-1 bg-emerald-400/20 rounded-full blur-sm"></div>
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                    Sri Lanka Fruit Seller
                  </h3>
                  <p className="text-sm text-gray-400">Fresh & Sustainable</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Connecting fresh Sri Lankan fruits with businesses worldwide through sustainable and reliable supply chain management.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-emerald-400">Quick Links</h4>
              <ul className="space-y-2">
                {[
                  { name: 'Dashboard', icon: faAppleAlt },
                  { name: 'Suppliers', icon: faLeaf },
                  { name: 'Orders', icon: faHeart },
                  { name: 'Reports', icon: faGlobe }
                ].map((link, index) => (
                  <li key={index}>
                    <a 
                      href="#" 
                      className="flex items-center space-x-2 text-gray-300 hover:text-emerald-400 transition-colors duration-300 group"
                    >
                      <FontAwesomeIcon 
                        icon={link.icon} 
                        className="text-sm group-hover:scale-110 transition-transform duration-300" 
                      />
                      <span className="text-sm">{link.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-emerald-400">Contact Info</h4>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3 text-gray-300">
                  <div className="w-8 h-8 bg-emerald-600/20 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-emerald-400 text-sm" />
                  </div>
                  <span className="text-sm">Colombo, Sri Lanka</span>
                </li>
                <li className="flex items-center space-x-3 text-gray-300">
                  <div className="w-8 h-8 bg-emerald-600/20 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faPhone} className="text-emerald-400 text-sm" />
                  </div>
                  <span className="text-sm">+94 11 123 4567</span>
                </li>
                <li className="flex items-center space-x-3 text-gray-300">
                  <div className="w-8 h-8 bg-emerald-600/20 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faEnvelope} className="text-emerald-400 text-sm" />
                  </div>
                  <span className="text-sm">info@slfruitseller.lk</span>
                </li>
              </ul>
            </div>

            {/* Sustainability Message */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-emerald-400">Our Mission</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faLeaf} className="text-green-400 text-lg" />
                  <span className="text-sm text-gray-300">100% Organic</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faHeart} className="text-red-400 text-lg" />
                  <span className="text-sm text-gray-300">Community First</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faGlobe} className="text-blue-400 text-lg" />
                  <span className="text-sm text-gray-300">Global Reach</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mt-3">
                  Supporting local farmers while delivering premium Sri Lankan fruits worldwide.
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-700/50 mb-6"></div>

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-600/20 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faCopyright} className="text-emerald-400 text-sm" />
              </div>
              <p className="text-sm text-gray-400">
                {currentYear} Sri Lanka Fruit Seller. All rights reserved.
              </p>
            </div>

            {/* Status Badge */}
            <div className="flex items-center space-x-2 bg-emerald-600/10 px-4 py-2 rounded-full border border-emerald-600/20">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
              <span className="text-xs text-emerald-400 font-medium">System Online</span>
            </div>
          </div>
        </div>

        {/* Bottom decorative line */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
      </div>
    </footer>
  );
}