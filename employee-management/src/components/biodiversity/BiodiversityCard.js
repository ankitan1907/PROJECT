import React from 'react';
import { motion } from 'framer-motion';
import { FaFish, FaLink } from 'react-icons/fa';

const BiodiversityCard = ({ data, onClick }) => {
  if (!data) return null;
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Format coral health as a color
  const getCoralHealthColor = (health) => {
    if (health >= 8) return 'bg-success';
    if (health >= 6) return 'bg-algae';
    if (health >= 4) return 'bg-warning';
    return 'bg-coral';
  };
  
  const coralHealthColor = getCoralHealthColor(data.coral_health_index);
  
  return (
    <motion.div
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
      onClick={() => onClick && onClick(data)}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center">
              <FaFish className="text-ocean-medium w-4 h-4" />
              <span className="ml-2 text-sm font-medium text-gray-700">
                {formatDate(data.timestamp)}
              </span>
            </div>
            <h3 className="mt-2 text-lg font-semibold text-gray-800">
              {data.species_count.toLocaleString()} Species
            </h3>
          </div>
          
          <div className="flex items-center">
            <div className="text-right">
              <p className="text-xs text-gray-500">Coral Health</p>
              <p className="text-lg font-semibold text-gray-800">{data.coral_health_index}/10</p>
            </div>
            <div className={`ml-2 w-3 h-8 rounded-full ${coralHealthColor}`}></div>
          </div>
        </div>
        
        {/* Top species */}
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Top Species</h4>
          <div className="space-y-2">
            {data.species.slice(0, 3).map((species, index) => (
              <div key={index} className="flex justify-between text-sm">
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-ocean-medium mr-2"></span>
                  <span className="text-gray-800">
                    {species.name}
                    {species.endangered && (
                      <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-coral-light text-coral">
                        endangered
                      </span>
                    )}
                  </span>
                </div>
                <span className="text-gray-600">{species.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Migration pattern */}
        {data.migration_patterns && data.migration_patterns.length > 0 && (
          <div className="mt-4 py-2 px-3 bg-ocean-lightest rounded-md">
            <div className="flex items-center text-sm text-ocean-dark">
              <FaLink className="w-3 h-3 mr-1" />
              <span className="font-medium">Migration Pattern:</span>
              <span className="ml-1">{data.migration_patterns[0].species}</span>
              <span className="ml-auto">{data.migration_patterns[0].direction}</span>
            </div>
          </div>
        )}
        
        <div className="mt-4 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Location:</span>
            <span className="font-medium text-gray-700">
              {data.location?.lat.toFixed(2)}°, {data.location?.lng.toFixed(2)}°
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BiodiversityCard;