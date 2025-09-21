// Nav.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGauge, faUsers, faCalendarAlt, faBox, faChartPie, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

const navItems = [
  { to: '/', label: 'Dashboard', icon: faGauge, description: 'Overview & Analytics' },
  { to: '/suppliers', label: 'Suppliers', icon: faUsers, description: 'Manage Partners' },
  { to: '/calendar', label: 'Calendar', icon: faCalendarAlt, description: 'Schedule & Events' },
  { to: '/order-details', label: 'Orders', icon: faBox, description: 'Track & Manage' },
  { to: '/reports', label: 'Reports', icon: faChartPie, description: 'Insights & Data' },
];

export default function Nav() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-gradient-to-r from-slate-800 via-gray-800 to-slate-900 text-white shadow-2xl border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-6">
        {/* Desktop Navigation */}
        <div className="hidden lg:block">
          <ul className="flex justify-center space-x-2 py-4">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.to;
              return (
                <li key={item.to} className="group">
                  <Link
                    to={item.to}
                    className={`relative flex flex-col items-center px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                      isActive 
                        ? 'bg-gradient-to-r from-emerald-600 to-green-600 shadow-lg shadow-emerald-500/25 text-white' 
                        : 'hover:bg-gray-700/50 text-gray-300 hover:text-white'
                    }`}
                  >
                    <div className={`flex items-center space-x-3 ${isActive ? 'animate-pulse' : ''}`}>
                      <FontAwesomeIcon 
                        icon={item.icon} 
                        className={`text-xl transition-colors duration-300 ${
                          isActive ? 'text-emerald-200' : 'text-gray-400 group-hover:text-emerald-400'
                        }`} 
                      />
                      <div className="text-left">
                        <span className="block text-sm font-semibold">{item.label}</span>
                        <span className="block text-xs opacity-75">{item.description}</span>
                      </div>
                    </div>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-emerald-300 rounded-full shadow-lg"></div>
                    )}

                    {/* Hover effect */}
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-600/10 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isActive ? 'hidden' : ''}`}></div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between py-4">
            <span className="text-lg font-semibold text-emerald-400">Navigation</span>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors duration-200"
            >
              <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} className="text-xl" />
            </button>
          </div>

          {/* Mobile Menu */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-96 pb-4' : 'max-h-0'
          }`}>
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive 
                          ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg' 
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <FontAwesomeIcon 
                        icon={item.icon} 
                        className={`text-lg ${isActive ? 'text-emerald-200' : 'text-gray-400'}`} 
                      />
                      <div>
                        <span className="block text-sm font-medium">{item.label}</span>
                        <span className="block text-xs opacity-75">{item.description}</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
    </nav>
  );
}