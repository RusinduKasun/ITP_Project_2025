import React from 'react';
import { LuSearch, LuBell } from 'react-icons/lu';
import { FaRegUserCircle } from "react-icons/fa";

const Header = () => {
  return (
    <header className="bg-white p-4 border-b flex justify-between items-center">
      {/* Search Bar */}
      <div className="relative">
        <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search fruits, products..."
          className="bg-gray-50 border border-gray-200 rounded-lg py-2 pl-10 pr-4 w-96 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {/* Icons */}
      <div className="flex items-center gap-5">
        <div className="relative">
          <LuBell size={22} className="text-gray-600 cursor-pointer" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">1</span>
        </div>
        <FaRegUserCircle  size={24} className="text-gray-600 cursor-pointer" />
      </div>
    </header>
  );
};

export default Header;