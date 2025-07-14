import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaFilter, 
  FaTimes, 
  FaSearch, 
  FaMap, 
  FaChartBar,
  FaExclamationTriangle
} from 'react-icons/fa';

// Components
import DisasterCard from '../components/disaster/DisasterCard';
import BarChart from '../components/ui/BarChart';
import PieChart from '../components/ui/PieChart';


// API
import { fetchDisasterPredictions } from '../api';

const DisasterPrediction = () => {
  const [loading, setLoading] = useState(true);
  const [disasters, setDisasters] = useState([]);
  const [filteredDisasters, setFilteredDisasters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'map', or 'chart'
  const [chartType, setChartType] = useState('type'); // 'type', 'severity', or 'probability'
  
  // Filters
  const [filters, setFilters] = useState({
    types: {
      cyclone: true,
      tsunami: true,
      underwater_earthquake: true,
      marine_heatwave: true
    },
    probabilityThreshold: 0,
    severity: {
      min: 1,
      max: 5
    },
    sortBy: 'probability' // 'probability', 'severity', or 'date'
  });
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchDisasterPredictions();
        setDisasters(data);
        applyFilters(data, filters, searchTerm);
      } catch (error) {
        console.error("Error fetching disaster predictions:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Apply filters
  const applyFilters = (data, currentFilters, term) => {
    let result = [...data];
    
    // Filter by disaster type
    result = result.filter(d => currentFilters.types[d.disaster_type]);
    
    // Filter by probability threshold
    if (currentFilters.probabilityThreshold > 0) {
      result = result.filter(d => d.probability >= currentFilters.probabilityThreshold);
    }
    
    // Filter by severity
    result = result.filter(d => 
      d.severity >= currentFilters.severity.min && 
      d.severity <= currentFilters.severity.max
    );
    
    // Filter by search term
    if (term) {
      const lowercaseTerm = term.toLowerCase();
      result = result.filter(d => 
        d.disaster_type.toLowerCase().includes(lowercaseTerm) ||
        d.advisory.toLowerCase().includes(lowercaseTerm)
      );
    }
    
    // Sort data
    if (currentFilters.sortBy === 'probability') {
      result.sort((a, b) => b.probability - a.probability);
    } else if (currentFilters.sortBy === 'severity') {
      result.sort((a, b) => b.severity - a.severity);
    } else if (currentFilters.sortBy === 'date') {
      result.sort((a, b) => new Date(a.predicted_time) - new Date(b.predicted_time));
    }
    
    setFilteredDisasters(result);
  };
  
  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    let updatedFilters = { ...filters };
    
    if (filterType === 'type') {
      updatedFilters.types = {
        ...updatedFilters.types,
        [value]: !updatedFilters.types[value]
      };
    } else if (filterType === 'probabilityThreshold') {
      updatedFilters.probabilityThreshold = value;
    } else if (filterType === 'severityMin') {
      updatedFilters.severity.min = value;
    } else if (filterType === 'severityMax') {
      updatedFilters.severity.max = value;
    } else if (filterType === 'sortBy') {
      updatedFilters.sortBy = value;
    }
    
    setFilters(updatedFilters);
    applyFilters(disasters, updatedFilters, searchTerm);
  };
  
  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    applyFilters(disasters, filters, term);
  };
  
  // Handle card click
  const handleCardClick = (disaster) => {
    setSelectedDisaster(disaster);
  };
  
  // Close detail view
  const closeDetail = () => {
    setSelectedDisaster(null);
  };
  
  // Prepare type distribution chart data
  const prepareTypeChartData = () => {
    if (!filteredDisasters.length) return { data: [], labels: [] };
    
    // Count disaster types
    const typeCounts = {};
    filteredDisasters.forEach(d => {
      const type = d.disaster_type;
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    
    // Transform for chart
    const data = Object.keys(typeCounts).map(type => ({
      label: type.replace('_', ' '),
      value: typeCounts[type],
      color: type === 'cyclone' ? '#0A4B70' :
             type === 'tsunami' ? '#FF6B6B' :
             type === 'underwater_earthquake' ? '#03045E' :
             '#FFC107' // marine_heatwave
    }));
    
    return { data, labels: data.map(d => d.label) };
  };
  
  // Prepare severity distribution chart data
  const prepareSeverityChartData = () => {
    if (!filteredDisasters.length) return { data: [], labels: [] };
    
    // Count severities
    const severityCounts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    filteredDisasters.forEach(d => {
      severityCounts[d.severity] = (severityCounts[d.severity] || 0) + 1;
    });
    
    // Transform for chart
    const data = Object.keys(severityCounts)
      .filter(severity => severityCounts[severity] > 0)
      .map(severity => severityCounts[severity]);
    
    const labels = Object.keys(severityCounts)
      .filter(severity => severityCounts[severity] > 0)
      .map(severity => `Level ${severity}`);
    
    return { data, labels };
  };
  
  // Prepare probability distribution chart data
  const prepareProbabilityChartData = () => {
    if (!filteredDisasters.length) return { data: [], labels: [] };
    
    // Group by probability ranges
    const ranges = {
      '0-20%': 0,
      '21-40%': 0,
      '41-60%': 0,
      '61-80%': 0,
      '81-100%': 0
    };
    
    filteredDisasters.forEach(d => {
      const prob = d.probability * 100;
      if (prob <= 20) ranges['0-20%']++;
      else if (prob <= 40) ranges['21-40%']++;
      else if (prob <= 60) ranges['41-60%']++;
      else if (prob <= 80) ranges['61-80%']++;
      else ranges['81-100%']++;
    });
    
    // Transform for chart
    const data = Object.values(ranges);
    const labels = Object.keys(ranges);
    
    return { data, labels };
  };
  
  // Prepare map features
  const prepareMapFeatures = () => {
    return filteredDisasters.map(disaster => ({
      id: disaster.id,
      feature_type: 'disaster',
      name: `${disaster.disaster_type.replace('_', ' ')} (${Math.round(disaster.probability * 100)}% probability)`,
      coordinates: [disaster.location.lng, disaster.location.lat],
      description: disaster.advisory,
      properties: {
        probability: `${Math.round(disaster.probability * 100)}%`,
        severity: disaster.severity,
        predicted_time: new Date(disaster.predicted_time).toLocaleDateString()
      }
    }));
  };
  
  const typeChartData = prepareTypeChartData();
  const severityChartData = prepareSeverityChartData();
  const probabilityChartData = prepareProbabilityChartData();
  const mapFeatures = prepareMapFeatures();
  
  // Render loading state
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="ocean-loader"></div>
        <p className="ml-4 text-lg text-ocean-dark">Loading disaster prediction data...</p>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Disaster Predictions</h1>
        <p className="text-gray-600">Monitor and analyze potential oceanic disasters</p>
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
            placeholder="Search disaster types or advisories..."
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
            <h3 className="font-semibold text-gray-800">Filter Disaster Predictions</h3>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setShowFilters(false)}
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Disaster types */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Disaster Types</h4>
              <div className="space-y-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-ocean rounded border-gray-300"
                    checked={filters.types.cyclone}
                    onChange={() => handleFilterChange('type', 'cyclone')}
                  />
                  <span className="ml-2 text-gray-700">Cyclones</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-ocean rounded border-gray-300"
                    checked={filters.types.tsunami}
                    onChange={() => handleFilterChange('type', 'tsunami')}
                  />
                  <span className="ml-2 text-gray-700">Tsunamis</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-ocean rounded border-gray-300"
                    checked={filters.types.underwater_earthquake}
                    onChange={() => handleFilterChange('type', 'underwater_earthquake')}
                  />
                  <span className="ml-2 text-gray-700">Underwater Earthquakes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-ocean rounded border-gray-300"
                    checked={filters.types.marine_heatwave}
                    onChange={() => handleFilterChange('type', 'marine_heatwave')}
                  />
                  <span className="ml-2 text-gray-700">Marine Heatwaves</span>
                </label>
              </div>
            </div>
            
            {/* Probability threshold */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Minimum Probability</h4>
              <div className="flex items-center">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={filters.probabilityThreshold}
                  onChange={(e) => handleFilterChange('probabilityThreshold', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="ml-2 text-sm font-medium w-12">{Math.round(filters.probabilityThreshold * 100)}%</span>
              </div>
            </div>
            
            {/* Severity range */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Severity Range</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 w-8">Min</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={filters.severity.min}
                    onChange={(e) => handleFilterChange('severityMin', parseInt(e.target.value))}
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
                    onChange={(e) => handleFilterChange('severityMax', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="ml-2 text-sm font-medium w-8">{filters.severity.max}</span>
                </div>
              </div>
            </div>
            
            {/* Sort options */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Sort By</h4>
              <div className="space-y-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio h-5 w-5 text-ocean border-gray-300"
                    checked={filters.sortBy === 'probability'}
                    onChange={() => handleFilterChange('sortBy', 'probability')}
                  />
                  <span className="ml-2 text-gray-700">Probability (highest first)</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio h-5 w-5 text-ocean border-gray-300"
                    checked={filters.sortBy === 'severity'}
                    onChange={() => handleFilterChange('sortBy', 'severity')}
                  />
                  <span className="ml-2 text-gray-700">Severity (highest first)</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio h-5 w-5 text-ocean border-gray-300"
                    checked={filters.sortBy === 'date'}
                    onChange={() => handleFilterChange('sortBy', 'date')}
                  />
                  <span className="ml-2 text-gray-700">Date (soonest first)</span>
                </label>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Chart type selector (only for chart view) */}
      {viewMode === 'chart' && (
        <div className="flex space-x-2 mb-4">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              chartType === 'type' 
                ? 'bg-ocean text-white' 
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => setChartType('type')}
          >
            By Type
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              chartType === 'severity' 
                ? 'bg-ocean text-white' 
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => setChartType('severity')}
          >
            By Severity
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              chartType === 'probability' 
                ? 'bg-ocean text-white' 
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => setChartType('probability')}
          >
            By Probability
          </button>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {/* View modes */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-4">
            {filteredDisasters.map(disaster => (
              <DisasterCard 
                key={disaster.id} 
                disaster={disaster} 
                onClick={handleCardClick}
              />
            ))}
            
            {filteredDisasters.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
                <FaExclamationTriangle className="w-16 h-16 mb-4 text-gray-300" />
                <p className="text-lg font-medium">No disaster predictions found</p>
                <p className="text-sm mt-1">Try changing your filters or search term</p>
              </div>
            )}
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
            {chartType === 'type' && (
              <>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Disaster Type Distribution</h3>
                <PieChart 
                  data={typeChartData.data}
                  height={400}
                />
              </>
            )}
            
            {chartType === 'severity' && (
              <>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Severity Distribution</h3>
                <BarChart 
                  data={severityChartData.data}
                  labels={severityChartData.labels}
                  height={400}
                  yAxisLabel="Number of Events"
                  xAxisLabel="Severity Level"
                  colors={['#0077B6', '#0096C7', '#00B4D8', '#48CAE4', '#90E0EF']}
                />
              </>
            )}
            
            {chartType === 'probability' && (
              <>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Probability Distribution</h3>
                <BarChart 
                  data={probabilityChartData.data}
                  labels={probabilityChartData.labels}
                  height={400}
                  yAxisLabel="Number of Events"
                  xAxisLabel="Probability Range"
                  colors={['#CAF0F8', '#90E0EF', '#48CAE4', '#00B4D8', '#0077B6']}
                />
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Detail modal */}
      {selectedDisaster && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div 
            className="bg-white rounded-lg shadow-lg w-full max-w-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className={`p-4 text-white ${
              selectedDisaster.disaster_type === 'cyclone' ? 'bg-ocean-dark' :
              selectedDisaster.disaster_type === 'tsunami' ? 'bg-coral' :
              selectedDisaster.disaster_type === 'underwater_earthquake' ? 'bg-ocean-darkest' :
              'bg-warning'
            }`}>
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold">
                  {selectedDisaster.disaster_type.replace('_', ' ')} Warning
                </h2>
                <button
                  className="text-white opacity-80 hover:opacity-100"
                  onClick={closeDetail}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="flex items-center mt-2">
                <span className="text-sm opacity-90">
                  Predicted: {new Date(selectedDisaster.predicted_time).toLocaleDateString()}
                </span>
                <span className="mx-2">•</span>
                <span className="text-sm font-medium bg-white bg-opacity-20 px-2 py-0.5 rounded">
                  {Math.round(selectedDisaster.probability * 100)}% probability
                </span>
                <div className="ml-2 flex">
                  {[...Array(selectedDisaster.severity)].map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-white mr-0.5"></div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500">Advisory</h3>
                    <p className="text-base text-gray-800 mt-1">
                      {selectedDisaster.advisory}
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500">Location</h3>
                    <p className="text-base font-medium text-gray-800">
                      {selectedDisaster.location.lat.toFixed(4)}°, {selectedDisaster.location.lng.toFixed(4)}°
                    </p>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Risk Assessment</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">Probability</span>
                          <span className="text-sm font-medium text-gray-700">
                            {Math.round(selectedDisaster.probability * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-ocean h-2 rounded-full" 
                            style={{ width: `${selectedDisaster.probability * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">Severity</span>
                          <span className="text-sm font-medium text-gray-700">
                            Level {selectedDisaster.severity} of 5
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-coral h-2 rounded-full" 
                            style={{ width: `${(selectedDisaster.severity / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">Time to Event</span>
                          <span className="text-sm font-medium text-gray-700">
                            {Math.ceil((new Date(selectedDisaster.predicted_time) - new Date()) / (1000 * 60 * 60 * 24))} days
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-warning h-2 rounded-full" 
                            style={{ 
                              width: `${Math.min(100, 100 - Math.ceil((new Date(selectedDisaster.predicted_time) - new Date()) / (1000 * 60 * 60 * 24)) * 3)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="h-64 mb-4">
                    <MapboxMap 
                      features={[{
                        id: selectedDisaster.id,
                        feature_type: 'disaster',
                        name: `${selectedDisaster.disaster_type.replace('_', ' ')} Warning`,
                        coordinates: [selectedDisaster.location.lng, selectedDisaster.location.lat],
                      }]}
                      initialViewState={{
                        longitude: selectedDisaster.location.lng,
                        latitude: selectedDisaster.location.lat,
                        zoom: 5
                      }}
                    />
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Recommended Actions</h3>
                    <div className="bg-ocean-lightest rounded-lg p-4">
                      <ul className="space-y-2">
                        {selectedDisaster.disaster_type === 'cyclone' && (
                          <>
                            <li className="text-sm flex items-start">
                              <span className="w-1.5 h-1.5 rounded-full bg-ocean-dark mt-1.5 mr-2"></span>
                              <span>Monitor weather updates and official advisories regularly</span>
                            </li>
                            <li className="text-sm flex items-start">
                              <span className="w-1.5 h-1.5 rounded-full bg-ocean-dark mt-1.5 mr-2"></span>
                              <span>Secure vessels or move them to safe harbor</span>
                            </li>
                            <li className="text-sm flex items-start">
                              <span className="w-1.5 h-1.5 rounded-full bg-ocean-dark mt-1.5 mr-2"></span>
                              <span>Prepare coastal communities for potential evacuation</span>
                            </li>
                          </>
                        )}
                        
                        {selectedDisaster.disaster_type === 'tsunami' && (
                          <>
                            <li className="text-sm flex items-start">
                              <span className="w-1.5 h-1.5 rounded-full bg-coral mt-1.5 mr-2"></span>
                              <span>Monitor tsunami warning systems and be prepared to move to higher ground</span>
                            </li>
                            <li className="text-sm flex items-start">
                              <span className="w-1.5 h-1.5 rounded-full bg-coral mt-1.5 mr-2"></span>
                              <span>Evacuate low-lying coastal areas if warnings are issued</span>
                            </li>
                            <li className="text-sm flex items-start">
                              <span className="w-1.5 h-1.5 rounded-full bg-coral mt-1.5 mr-2"></span>
                              <span>Follow emergency response protocols for coastal communities</span>
                            </li>
                          </>
                        )}
                        
                        {selectedDisaster.disaster_type === 'underwater_earthquake' && (
                          <>
                            <li className="text-sm flex items-start">
                              <span className="w-1.5 h-1.5 rounded-full bg-ocean-darkest mt-1.5 mr-2"></span>
                              <span>Monitor seismic activity updates from reliable sources</span>
                            </li>
                            <li className="text-sm flex items-start">
                              <span className="w-1.5 h-1.5 rounded-full bg-ocean-darkest mt-1.5 mr-2"></span>
                              <span>Watch for tsunami potential following significant seismic events</span>
                            </li>
                            <li className="text-sm flex items-start">
                              <span className="w-1.5 h-1.5 rounded-full bg-ocean-darkest mt-1.5 mr-2"></span>
                              <span>Ensure emergency communication systems are operational</span>
                            </li>
                          </>
                        )}
                        
                        {selectedDisaster.disaster_type === 'marine_heatwave' && (
                          <>
                            <li className="text-sm flex items-start">
                              <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 mr-2"></span>
                              <span>Monitor coral reef health and be alert for bleaching events</span>
                            </li>
                            <li className="text-sm flex items-start">
                              <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 mr-2"></span>
                              <span>Reduce additional stressors on marine ecosystems in the affected area</span>
                            </li>
                            <li className="text-sm flex items-start">
                              <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 mr-2"></span>
                              <span>Prepare for potential impacts on local fisheries and marine life</span>
                            </li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
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

export default DisasterPrediction;