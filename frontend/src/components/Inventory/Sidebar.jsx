import React from 'react';
import { LuLayoutDashboard, LuBoxes, LuFactory, LuSprout } from 'react-icons/lu';
import { HiOutlineDocumentReport } from "react-icons/hi";
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { name: 'Dashboard', icon: <LuLayoutDashboard size={20} />, path: '/inventoryDashboard' },
  { name: 'Fruits', icon: <HiOutlineDocumentReport size={20} />, path: '/Fruits' },
  { name: 'Inventory', icon: <LuBoxes size={20} />, path: '/Inventory' },
  { name: 'Production', icon: <LuFactory size={20} />, path: '/Production' },
  { name: 'Reports', icon: <HiOutlineDocumentReport size={20} />, path: '/inventoryReports' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="w-64 bg-gradient-to-b from-emerald-50 to-white h-screen p-5 flex flex-col shadow-xl rounded-r-3xl">
      {/* Logo Section */}
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="bg-gradient-to-tr from-emerald-500 to-green-400 p-3 rounded-2xl shadow-md">
          <LuSprout size={26} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Taste of Ceylon</h1>
          <p className="text-xs text-gray-500">Inventory Manager</p>
        </div>
      </div>

      {/* Navigation */}
      <nav>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <button
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-300 
                ${location.pathname === item.path
                    ? 'bg-gradient-to-r from-emerald-500 to-green-400 text-white font-semibold shadow-md scale-[1.02]'
                    : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                  }`}
              >
                {item.icon}
                <span className="text-sm">{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="mt-auto text-center text-xs text-gray-400 border-t pt-4">
        © 2025 Taste of Ceylon
      </div>
    </div>
  );
};

export default Sidebar;
