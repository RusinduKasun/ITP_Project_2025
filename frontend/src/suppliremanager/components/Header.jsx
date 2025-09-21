// Header.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAppleAlt, faBell, faUser, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

export default function Header() {
  return (
    <header className="relative bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 text-white shadow-xl border-b border-emerald-800 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay -translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay translate-x-48 translate-y-48"></div>
      </div>
      
      <div className="relative container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo and Brand Section */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute -inset-2 bg-white/20 rounded-full blur-sm"></div>
              <FontAwesomeIcon 
                icon={faAppleAlt} 
                className="relative text-4xl text-emerald-200 transform hover:scale-110 transition-transform duration-300" 
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-wide bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
                Sri Lanka Fruit Seller
              </h1>
              <p className="text-emerald-200 text-sm font-medium opacity-90">
                Fresh Fruits, Fresh Business
              </p>
            </div>
          </div>

          {/* Right Side - Status and Actions */}
          <div className="flex items-center space-x-6">
            {/* Location Indicator */}
            <div className="hidden md:flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-emerald-200" />
              <span className="text-sm font-medium">Colombo, LK</span>
            </div>


            {/* User Profile Section */}
            <div className="flex items-center space-x-3 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
              <div className="w-10 h-10 bg-emerald-200 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faUser} className="text-emerald-700" />
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-semibold">Welcome, Admin</p>
                <p className="text-xs text-emerald-200 opacity-90">
                  {new Date().toLocaleTimeString('en-US', { 
                    timeZone: 'Asia/Colombo',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom highlight line */}
      <div className="h-1 bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-500"></div>
    </header>
  );
}