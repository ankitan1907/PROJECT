import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaLayerGroup, FaFilter, FaTimes, FaInfoCircle } from 'react-icons/fa';

// Components
import MapboxMap from '../components/map/MapBoxMap'; // Ensure the correct import path








// API
import { fetchMapFeatures, fetchAnomalies, fetchDisasterPredictions } from '../api';

const OceanMap = () => {
  const [loading, setLoading] = useState(true);
  const [mapFeatures, setMapFeatures] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [filters, setFilters] = useState({
    showTectonicPlates: true,
    showDeepSeaVents: true,
    showOceanTrenches: true,
    showCoralReefs: true,
    showAnomalies: false,
    showDisasters: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [mapFeaturesData, anomaliesData, disastersData] = await Promise.all([
          fetchMapFeatures(),
          fetchAnomalies(),
          fetchDisasterPredictions()
        ]);
        
        setMapFeatures(mapFeaturesData);
        setAnomalies(anomaliesData.filter(a => a.is_anomaly));
        setDisasters(disastersData);
        
      } catch (error) {
        console.error("Error fetching map data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter features based on selected filters
  const filteredFeatures = () => {
    let features = [];
    
    // Filter map features
    if (mapFeatures.length > 0) {
      if (filters.showTectonicPlates) {
        features = features.concat(mapFeatures.filter(f => f.feature_type === 'tectonic_plate'));
      }
      if (filters.showDeepSeaVents) {
        features = features.concat(mapFeatures.filter(f => f.feature_type === 'deep_sea_vent'));
      }
      if (filters.showOceanTrenches) {
        features = features.concat(mapFeatures.filter(f => f.feature_type === 'ocean_trench'));
      }
      if (filters.showCoralReefs) {
        features = features.concat(mapFeatures.filter(f => f.feature_type === 'coral_reef'));
      }
    }
    
    // Add anomalies if filter is active
    if (filters.showAnomalies && anomalies.length > 0) {
      // Transform anomalies to match feature format
      const anomalyFeatures = anomalies.map(a => ({
        id: a.id,
        feature_type: 'anomaly',
        name: `${a.anomaly_type} Anomaly`,
        coordinates: [a.location.lng, a.location.lat],
        description: `${a.anomaly_type} detected on ${new Date(a.timestamp).toLocaleDateString()}`,
        properties: {
          temperature: `${a.temperature}°C`,
          salinity: `${a.salinity} PSU`,
          algae_concentration: `${a.algae_concentration} μg/L`,
          severity: a.severity || 'N/A'
        }
      }));
      features = features.concat(anomalyFeatures);
    }
    
    // Add disasters if filter is active
    if (filters.showDisasters && disasters.length > 0) {
      // Transform disasters to match feature format
      const disasterFeatures = disasters
        .filter(d => d.probability > 0.3) // Only show higher probability disasters
        .map(d => ({
          id: d.id,
          feature_type: 'disaster',
          name: `${d.disaster_type} Warning`,
          coordinates: [d.location.lng, d.location.lat],
          description: d.advisory,
          properties: {
            probability: `${Math.round(d.probability * 100)}%`,
            predicted_time: new Date(d.predicted_time).toLocaleDateString(),
            severity: d.severity || 'N/A'
          }
        }));
      features = features.concat(disasterFeatures);
    }
    
    return features;
  };
  
  // Handle filter toggle
  const toggleFilter = (filterName) => {
    setFilters({
      ...filters,
      [filterName]: !filters[filterName]
    });
  };
  
  // Handle feature click
  const handleFeatureClick = (feature) => {
    setSelectedFeature(feature);
    setShowInfo(true);
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="ocean-loader"></div>
        <p className="ml-4 text-lg text-ocean-dark">Loading map data...</p>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Interactive Ocean Map</h1>
        <p className="text-gray-600">Explore ocean features, tectonic plates, and deep-sea vents</p>
      </div>
      
      {/* Map container */}
      <div className="relative flex-1 rounded-lg overflow-hidden shadow-lg">
        <MapboxMap 
          features={filteredFeatures()} 
          initialViewState={{
            longitude: 0,
            latitude: 0,
            zoom: 1.7
          }}
          style="mapbox://styles/mapbox/outdoors-v11"
          onClick={handleFeatureClick}
        />
        
        {/* Map controls */}
        <div className="absolute top-4 right-16 z-10 flex space-x-2">
          <motion.button
            className="bg-white rounded-full p-3 shadow-md text-ocean-dark hover:text-ocean transition-colors"
            onClick={() => setShowFilters(!showFilters)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Show filters"
          >
            <FaFilter className="w-5 h-5" />
          </motion.button>
          <motion.button
            className="bg-white rounded-full p-3 shadow-md text-ocean-dark hover:text-ocean transition-colors"
            onClick={() => setShowInfo(!showInfo)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Feature information"
          >
            <FaLayerGroup className="w-5 h-5" />
          </motion.button>
        </div>
        
        {/* Filters panel */}
        {showFilters && (
          <motion.div
            className="absolute top-16 right-16 z-10 bg-white rounded-lg shadow-lg w-64 p-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-800">Map Filters</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowFilters(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-ocean-medium rounded border-gray-300 focus:ring-ocean-medium"
                    checked={filters.showTectonicPlates}
                    onChange={() => toggleFilter('showTectonicPlates')}
                  />
                  <span className="ml-2 text-gray-700">Tectonic Plates</span>
                </label>
                <span className="h-4 w-4 rounded-full bg-coral"></span>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-ocean-medium rounded border-gray-300 focus:ring-ocean-medium"
                    checked={filters.showDeepSeaVents}
                    onChange={() => toggleFilter('showDeepSeaVents')}
                  />
                  <span className="ml-2 text-gray-700">Deep-Sea Vents</span>
                </label>
                <span className="h-4 w-4 rounded-full bg-warning"></span>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-ocean-medium rounded border-gray-300 focus:ring-ocean-medium"
                    checked={filters.showOceanTrenches}
                    onChange={() => toggleFilter('showOceanTrenches')}
                  />
                  <span className="ml-2 text-gray-700">Ocean Trenches</span>
                </label>
                <span className="h-4 w-4 rounded-full bg-ocean-dark"></span>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-ocean-medium rounded border-gray-300 focus:ring-ocean-medium"
                    checked={filters.showCoralReefs}
                    onChange={() => toggleFilter('showCoralReefs')}
                  />
                  <span className="ml-2 text-gray-700">Coral Reefs</span>
                </label>
                <span className="h-4 w-4 rounded-full bg-algae"></span>
              </div>
              
              <div className="border-t border-gray-200 my-2"></div>
              
              <div className="flex items-center justify-between">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-ocean-medium rounded border-gray-300 focus:ring-ocean-medium"
                    checked={filters.showAnomalies}
                    onChange={() => toggleFilter('showAnomalies')}
                  />
                  <span className="ml-2 text-gray-700">Anomalies</span>
                </label>
                <span className="h-4 w-4 rounded-full bg-purple-500"></span>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-ocean-medium rounded border-gray-300 focus:ring-ocean-medium"
                    checked={filters.showDisasters}
                    onChange={() => toggleFilter('showDisasters')}
                  />
                  <span className="ml-2 text-gray-700">Disaster Warnings</span>
                </label>
                <span className="h-4 w-4 rounded-full bg-danger"></span>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Info panel */}
        {showInfo && (
          <motion.div
            className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg w-72 sm:w-80 p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-800">Feature Information</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowInfo(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            {selectedFeature ? (
              <div>
                <h4 className="font-medium text-ocean-dark">{selectedFeature.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{selectedFeature.description}</p>
                
                {selectedFeature.properties && (
                  <div className="mt-3 text-sm">
                    <h5 className="font-medium text-gray-700 mb-1">Properties:</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(selectedFeature.properties).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-gray-500">{key.replace(/_/g, ' ')}:</span>
                          <span className="ml-1 text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-3 text-sm text-gray-500">
                  Coordinates: {selectedFeature.coordinates[1].toFixed(2)}°, {selectedFeature.coordinates[0].toFixed(2)}°
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center py-2">
                <FaInfoCircle className="w-10 h-10 text-ocean-light mb-2" />
                <p className="text-gray-600">Click on any feature on the map to see detailed information.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OceanMap;