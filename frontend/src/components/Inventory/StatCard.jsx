import React from 'react';

const StatCard = ({ icon, title, value, change, changeColor = 'text-green-500' }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className="text-emerald-500">
          {icon}
        </div>
      </div>
      <p className={`text-sm mt-2 ${changeColor}`}>{change}</p>
    </div>
  );
};

export default StatCard;