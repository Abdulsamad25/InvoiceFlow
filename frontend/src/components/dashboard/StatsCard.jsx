import React from 'react';

const StatsCard = ({ title, value, icon, trend, trendValue }) => {
  return (
    <div className="bg-gray-100 shadow-sm p-6 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-gray-600 text-sm">{title}</h3>
        <div className="flex justify-center items-center bg-blue-100 rounded-lg w-10 h-10">
          {icon}
        </div>
      </div>
      <p className="mb-2 font-bold text-gray-900 text-2xl">{value}</p>
      {trend && (
        <p className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trendValue}
        </p>
      )}
    </div>
  );
};

export default StatsCard;