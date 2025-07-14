import React from 'react';
import { motion } from 'framer-motion';

const getDisasterColor = (type) => {
  switch (type) {
    case 'cyclone':
      return 'bg-ocean-dark';
    case 'tsunami':
      return 'bg-coral';
    case 'underwater_earthquake':
      return 'bg-ocean-darkest';
    case 'marine_heatwave':
      return 'bg-warning';
    default:
      return 'bg-ocean-medium';
  }
};

const getDisasterIcon = (type) => {
  switch (type) {
    case 'cyclone':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    case 'tsunami':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      );
    case 'underwater_earthquake':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    case 'marine_heatwave':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
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

const DisasterCard = ({ disaster, onClick }) => {
  if (!disaster) return null;
  
  const bgColor = getDisasterColor(disaster.disaster_type);
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Format probability
  const formatProbability = (prob) => {
    return `${Math.round(prob * 100)}%`;
  };
  
  return (
    <motion.div
      className={`${bgColor} text-white rounded-lg shadow-md overflow-hidden cursor-pointer`}
      onClick={() => onClick && onClick(disaster)}
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
                {disaster.disaster_type?.replace('_', ' ')}
              </span>
              {disaster.severity && (
                <div className="ml-2 flex">
                  {[...Array(disaster.severity)].map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-white mr-0.5"></div>
                  ))}
                </div>
              )}
            </div>
            <h3 className="mt-2 text-lg font-semibold">
              {formatProbability(disaster.probability)}
            </h3>
            <p className="text-xs text-white text-opacity-80 mt-1">
              Predicted: {formatDate(disaster.predicted_time)}
            </p>
          </div>
          <div className="p-2 rounded-full bg-white bg-opacity-20">
            {getDisasterIcon(disaster.disaster_type)}
          </div>
        </div>
        
        <div className="mt-3">
          <p className="text-sm text-white line-clamp-2">
            {disaster.advisory}
          </p>
        </div>
        
        <div className="mt-4 text-xs">
          <div className="flex justify-between">
            <span>Location:</span>
            <span className="font-medium">
              {disaster.location?.lat.toFixed(2)}°, {disaster.location?.lng.toFixed(2)}°
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DisasterCard;