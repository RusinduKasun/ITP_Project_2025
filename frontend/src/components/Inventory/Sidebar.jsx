import React from 'react';
import { LuLayoutDashboard, LuBoxes, LuFactory, LuSprout } from 'react-icons/lu';
import { HiOutlineDocumentReport } from "react-icons/hi";
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { name: 'Dashboard', icon: <LuLayoutDashboard />, path: '/inventoryDashboard' },
  { name: 'Fruits', icon: <HiOutlineDocumentReport />, path: '/Fruits' },
  { name: 'Inventory', icon: <LuBoxes />, path: '/Inventory' },
  { name: 'Production', icon: <LuFactory />, path: '/Production' },
  { name: 'Reports', icon: <HiOutlineDocumentReport />, path: '/inventoryReports' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="w-64 bg-white h-screen p-4 flex flex-col shadow-md">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="bg-emerald-500 p-2 rounded-lg">
          <LuSprout size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">FreshStock</h1>
          <p className="text-xs text-gray-500">Fruit Business Manager</p>
        </div>
      </div>

      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.name} className="mb-2">
              <button
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${location.pathname === item.path
                    ? 'bg-emerald-100 text-emerald-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;