import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaFilter, FaTimes, FaSearch, FaMap, FaChartBar } from 'react-icons/fa';

// Components
import AnomalyCard from '../components/anomaly/AnomalyCard';
import LineChart from '../components/ui/LineChart';
import MapboxMap from '../components/MapBoxMap';
import { MAPBOX_TOKEN } from '../config/mapConfig';


// API
import { fetchAnomalies } from '../api';

const AnomalyDetection = () => {
  const [loading, setLoading] = useState(true);
  const [anomalies, setAnomalies] = useState([]);
  const [filteredAnomalies, setFilteredAnomalies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'map', or 'chart'
  
  // Filters
  const [filters, setFilters] = useState({
    types: {
      temperature_spike: true,
      salinity_change: true,
      algal_bloom: true
    },
    severity: {
      min: 1,
      max: 5
    },
    onlyAnomalies: true
  });
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchAnomalies();
        setAnomalies(data);
        applyFilters(data, filters, searchTerm);
      } catch (error) {
        console.error("Error fetching anomalies:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Apply filters
  const applyFilters = (data, currentFilters, term) => {
    let result = [...data];
    
    // Filter by anomaly status
    if (currentFilters.onlyAnomalies) {
      result = result.filter(a => a.is_anomaly);
    }
    
    // Filter by type
    result = result.filter(a => 
      !a.anomaly_type || currentFilters.types[a.anomaly_type]
    );
    
    // Filter by severity
    result = result.filter(a => 
      !a.severity || 
      (a.severity >= currentFilters.severity.min && 
       a.severity <= currentFilters.severity.max)
    );
    
    // Filter by search term
    if (term) {
      const lowercaseTerm = term.toLowerCase();
      result = result.filter(a => 
        (a.anomaly_type && a.anomaly_type.toLowerCase().includes(lowercaseTerm)) ||
        a.id.toLowerCase().includes(lowercaseTerm)
      );
    }
    
    // Sort by timestamp (newest first)
    result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    setFilteredAnomalies(result);
  };
  
  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    let updatedFilters = { ...filters };
    
    if (filterType === 'type') {
      updatedFilters.types = {
        ...updatedFilters.types,
        [value]: !updatedFilters.types[value]
      };
    } else if (filterType === 'severity') {
      updatedFilters.severity = {
        ...updatedFilters.severity,
        ...value
      };
    } else if (filterType === 'onlyAnomalies') {
      updatedFilters.onlyAnomalies = !updatedFilters.onlyAnomalies;
    }
    
    setFilters(updatedFilters);
    applyFilters(anomalies, updatedFilters, searchTerm);
  };
  
  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    applyFilters(anomalies, filters, term);
  };
  
  // Handle card click
  const handleCardClick = (anomaly) => {
    setSelectedAnomaly(anomaly);
  };
  
  // Close detail view
  const closeDetail = () => {
    setSelectedAnomaly(null);
  };
  
  // Prepare chart data
  const prepareChartData = () => {
    if (!filteredAnomalies.length) return { labels: [], datasets: [] };
    
    // Sort by timestamp (oldest first for charts)
    const sortedData = [...filteredAnomalies].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    // Create labels from timestamps
    const labels = sortedData.map(a => 
      new Date(a.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );
    
    // Create datasets
    const datasets = [
      {
        label: 'Temperature (°C)',
        data: sortedData.map(a => a.temperature),
        color: '#FF6B6B'
      },
      {
        label: 'Salinity (PSU)',
        data: sortedData.map(a => a.salinity),
        color: '#00B4D8'
      },
      {
        label: 'Algae Concentration (μg/L)',
        data: sortedData.map(a => a.algae_concentration / 10), // Scale down for visualization
        color: '#4CAF50'
      }
    ];
    
    return { labels, datasets };
  };
  
  // Prepare map features
  const prepareMapFeatures = () => {
    return filteredAnomalies.map(anomaly => ({
      id: anomaly.id,
      feature_type: 'anomaly',
      name: `${anomaly.anomaly_type?.replace('_', ' ')} Anomaly`,
      coordinates: [anomaly.location.lng, anomaly.location.lat],
      description: `${anomaly.anomaly_type?.replace('_', ' ')} detected on ${new Date(anomaly.timestamp).toLocaleDateString()}`,
      properties: {
        temperature: `${anomaly.temperature}°C`,
        salinity: `${anomaly.salinity} PSU`,
        algae_concentration: `${anomaly.algae_concentration} μg/L`,
        severity: anomaly.severity || 'N/A'
      }
    }));
  };
  
  const chartData = prepareChartData();
  const mapFeatures = prepareMapFeatures();
  
  // Render loading state
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="ocean-loader"></div>
        <p className="ml-4 text-lg text-ocean-dark">Loading anomaly data...</p>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Anomaly Detection</h1>
        <p className="text-gray-600">Monitor and analyze ocean anomalies</p>
      </div>
      
      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:border-ocean-medium"
            placeholder="Search anomalies..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className="flex gap-4">
          {/* View mode toggle */}
          <div className="flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                viewMode === 'grid' 
                  ? 'bg-ocean text-white border-ocean' 
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium border-y ${
                viewMode === 'map' 
                  ? 'bg-ocean text-white border-ocean' 
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setViewMode('map')}
            >
              <FaMap className="h-4 w-4" />
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-r-md border ${
                viewMode === 'chart' 
                  ? 'bg-ocean text-white border-ocean' 
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setViewMode('chart')}
            >
              <FaChartBar className="h-4 w-4" />
            </button>
          </div>
          
          {/* Filter button */}
          <button
            className={`flex items-center px-4 py-2 text-sm font-medium border rounded-md ${
              showFilters 
                ? 'bg-ocean text-white border-ocean' 
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter className="mr-2 h-4 w-4" />
            Filters
          </button>
        </div>
      </div>
      
      {/* Filters panel */}
      {showFilters && (
        <motion.div
          className="bg-white p-4 rounded-lg shadow-md mb-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800">Filter Anomalies</h3>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setShowFilters(false)}
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Anomaly types */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Anomaly Types</h4>
              <div className="space-y-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-ocean rounded border-gray-300"
                    checked={filters.types.temperature_spike}
                    onChange={() => handleFilterChange('type', 'temperature_spike')}
                  />
                  <span className="ml-2 text-gray-700">Temperature Spikes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-ocean rounded border-gray-300"
                    checked={filters.types.salinity_change}
                    onChange={() => handleFilterChange('type', 'salinity_change')}
                  />
                  <span className="ml-2 text-gray-700">Salinity Changes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-ocean rounded border-gray-300"
                    checked={filters.types.algal_bloom}
                    onChange={() => handleFilterChange('type', 'algal_bloom')}
                  />
                  <span className="ml-2 text-gray-700">Algal Blooms</span>
                </label>
              </div>
            </div>
            
            {/* Severity */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Severity Level</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 w-8">Min</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={filters.severity.min}
                    onChange={(e) => handleFilterChange('severity', { min: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="ml-2 text-sm font-medium w-8">{filters.severity.min}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 w-8">Max</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={filters.severity.max}
                    onChange={(e) => handleFilterChange('severity', { max: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="ml-2 text-sm font-medium w-8">{filters.severity.max}</span>
                </div>
              </div>
            </div>
            
            {/* Other filters */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Other Filters</h4>
              <div className="space-y-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-ocean rounded border-gray-300"
                    checked={filters.onlyAnomalies}
                    onChange={() => handleFilterChange('onlyAnomalies')}
                  />
                  <span className="ml-2 text-gray-700">Show only anomalies</span>
                </label>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {/* View modes */}
        {viewMode === 'grid' && (
  <div className="flex-1 overflow-hidden">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-full overflow-y-auto pb-4 pr-2">
      {filteredAnomalies.map(anomaly => (
        <AnomalyCard 
          key={anomaly.id} 
          anomaly={anomaly} 
          onClick={handleCardClick}
        />
      ))}
      
      {filteredAnomalies.length === 0 && (
        <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
          <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium">No anomalies found</p>
          <p className="text-sm mt-1">Try changing your filters or search term</p>
        </div>
      )}
    </div>
  </div>
)}
        
        {viewMode === 'map' && (
          <div className="h-full rounded-lg overflow-hidden shadow-md">
            <MapboxMap 
              features={mapFeatures}
              initialViewState={{
                longitude: 0,
                latitude: 0,
                zoom: 1.5
              }}
            />
          </div>
        )}
        
        {viewMode === 'chart' && (
          <div className="bg-white p-4 rounded-lg shadow-md h-full overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Anomaly Trends</h3>
            <LineChart 
              data={chartData.datasets}
              labels={chartData.labels}
              height={500}
              yAxisLabel="Value"
              xAxisLabel="Date"
            />
          </div>
        )}
      </div>
      
      {/* Detail modal */}
      {selectedAnomaly && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div 
            className="bg-white rounded-lg shadow-lg w-full max-w-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold text-gray-800">
                  {selectedAnomaly.anomaly_type?.replace('_', ' ')} Anomaly
                </h2>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={closeDetail}
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500">Date Detected</h3>
                    <p className="text-base font-medium text-gray-800">
                      {new Date(selectedAnomaly.timestamp).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500">Location</h3>
                    <p className="text-base font-medium text-gray-800">
                      {selectedAnomaly.location.lat.toFixed(4)}°, {selectedAnomaly.location.lng.toFixed(4)}°
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500">Severity</h3>
                    <div className="flex mt-1">
                      {[...Array(5)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-6 h-2 rounded-full mr-1 ${
                            i < selectedAnomaly.severity ? 'bg-coral' : 'bg-gray-200'
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Measurements</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500">Temperature</p>
                        <p className="text-lg font-semibold text-gray-800 mt-1">{selectedAnomaly.temperature}°C</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500">Salinity</p>
                        <p className="text-lg font-semibold text-gray-800 mt-1">{selectedAnomaly.salinity} PSU</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500">Algae</p>
                        <p className="text-lg font-semibold text-gray-800 mt-1">{selectedAnomaly.algae_concentration} μg/L</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="h-64 md:h-auto">
                  <MapboxMap 
                    features={[{
                      id: selectedAnomaly.id,
                      feature_type: 'anomaly',
                      name: `${selectedAnomaly.anomaly_type?.replace('_', ' ')} Anomaly`,
                      coordinates: [selectedAnomaly.location.lng, selectedAnomaly.location.lat],
                    }]}
                    initialViewState={{
                      longitude: selectedAnomaly.location.lng,
                      latitude: selectedAnomaly.location.lat,
                      zoom: 5
                    }}
                  />
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Analysis</h3>
                <p className="text-gray-600">
                  This {selectedAnomaly.anomaly_type?.replace('_', ' ')} was detected on {new Date(selectedAnomaly.timestamp).toLocaleDateString()} with a severity rating of {selectedAnomaly.severity}/5. 
                  {selectedAnomaly.anomaly_type === 'temperature_spike' && 
                    ` The temperature reading of ${selectedAnomaly.temperature}°C is significantly above the expected range for this location and time of year.`
                  }
                  {selectedAnomaly.anomaly_type === 'salinity_change' && 
                    ` The salinity reading of ${selectedAnomaly.salinity} PSU indicates unusual changes in the water composition at this location.`
                  }
                  {selectedAnomaly.anomaly_type === 'algal_bloom' && 
                    ` The algae concentration of ${selectedAnomaly.algae_concentration} μg/L suggests a significant bloom event that may impact marine life.`
                  }
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-3 flex justify-end">
              <button
                className="btn-primary"
                onClick={closeDetail}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AnomalyDetection;