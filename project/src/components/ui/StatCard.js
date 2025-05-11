import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon, color, trend, trendValue }) => {
  const colors = {
    blue: 'bg-ocean text-white',
    green: 'bg-algae text-white',
    red: 'bg-coral text-white',
    yellow: 'bg-warning text-white',
    purple: 'bg-ocean-darkest text-white',
    light: 'bg-white text-ocean-dark',
  };
  
  const bgColor = colors[color] || colors.blue;
  const trendColor = trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-gray-500';
  
  return (
    <motion.div
      className={`rounded-lg shadow-md overflow-hidden ${color === 'light' ? 'border border-gray-100' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`p-5 ${bgColor}`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-medium opacity-90">{title}</h3>
            <div className="mt-1 flex items-baseline">
              <p className="text-2xl font-semibold">{value}</p>
              {trend && trendValue && (
                <span className={`ml-2 text-xs font-medium ${trendColor}`}>
                  {trend === 'up' ? '↑' : '↓'} {trendValue}
                </span>
              )}
            </div>
          </div>
          <div className="p-2 rounded-full bg-white bg-opacity-20">
            {icon}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;