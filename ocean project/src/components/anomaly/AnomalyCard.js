import React from 'react';
import { motion } from 'framer-motion';

const getAnomalyColor = (type) => {
  switch (type) {
    case 'temperature_spike':
      return 'bg-coral';
    case 'salinity_change':
      return 'bg-ocean';
    case 'algal_bloom':
      return 'bg-algae';
    default:
      return 'bg-ocean-medium';
  }
};

const getAnomalyIcon = (type) => {
  switch (type) {
    case 'temperature_spike':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case 'salinity_change':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
    case 'algal_bloom':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      );
    default:
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
  }
};

const AnomalyCard = ({ anomaly, onClick }) => {
  if (!anomaly) return null;
  
  const bgColor = getAnomalyColor(anomaly.anomaly_type);
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return (
    <motion.div
      className={`${bgColor} text-white rounded-lg shadow-md overflow-hidden cursor-pointer`}
      onClick={() => onClick && onClick(anomaly)}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center">
              <span className="text-sm font-medium bg-white bg-opacity-20 px-2 py-0.5 rounded">
                {anomaly.anomaly_type?.replace('_', ' ')}
              </span>
              {anomaly.severity && (
                <div className="ml-2 flex">
                  {[...Array(anomaly.severity)].map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-white mr-0.5"></div>
                  ))}
                </div>
              )}
            </div>
            <h3 className="mt-2 text-lg font-semibold">
              {anomaly.anomaly_type === 'temperature_spike'
                ? `${anomaly.temperature}°C`
                : anomaly.anomaly_type === 'salinity_change'
                ? `${anomaly.salinity} PSU`
                : `${anomaly.algae_concentration} μg/L`}
            </h3>
            <p className="text-xs text-white text-opacity-80 mt-1">
              {formatDate(anomaly.timestamp)}
            </p>
          </div>
          <div className="p-2 rounded-full bg-white bg-opacity-20">
            {getAnomalyIcon(anomaly.anomaly_type)}
          </div>
        </div>
        
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-white text-opacity-90">
          <div>
            <p className="font-medium">Temperature</p>
            <p>{anomaly.temperature}°C</p>
          </div>
          <div>
            <p className="font-medium">Salinity</p>
            <p>{anomaly.salinity} PSU</p>
          </div>
          <div>
            <p className="font-medium">Algae</p>
            <p>{anomaly.algae_concentration} μg/L</p>
          </div>
        </div>
        
        <div className="mt-4 text-xs">
          <div className="flex justify-between">
            <span>Location:</span>
            <span className="font-medium">
              {anomaly.location?.lat.toFixed(2)}°, {anomaly.location?.lng.toFixed(2)}°
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AnomalyCard;