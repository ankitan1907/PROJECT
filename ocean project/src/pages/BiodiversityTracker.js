import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaChevronDown, 
  FaFilter, 
  FaTimes, 
  FaSearch, 
  FaMap, 
  FaChartBar,
  FaFish
} from 'react-icons/fa';

// Components
import BiodiversityCard from '../components/biodiversity/BiodiversityCard';
import BarChart from '../components/ui/BarChart';
import PieChart from '../components/ui/PieChart';
import LineChart from '../components/ui/LineChart';


// API
import { fetchBiodiversity } from '../api';

const BiodiversityTracker = () => {
  const [loading, setLoading] = useState(true);
  const [biodiversityData, setBiodiversityData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'map', or 'chart'
  const [chartType, setChartType] = useState('species'); // 'species', 'coral', or 'trends'
  
  // Filters
  const [filters, setFilters] = useState({
    minCoralHealth: 0,
    showEndangeredOnly: false,
    hasMigration: false,
    sortBy: 'date' // 'date', 'species', or 'coral'
  });
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchBiodiversity();
        setBiodiversityData(data);
        applyFilters(data, filters, searchTerm);
      } catch (error) {
        console.error("Error fetching biodiversity data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Apply filters
  const applyFilters = (data, currentFilters, term) => {
    let result = [...data];
    
    // Filter by coral health
    if (currentFilters.minCoralHealth > 0) {
      result = result.filter(d => d.coral_health_index >= currentFilters.minCoralHealth);
    }
    
    // Filter by endangered species
    if (currentFilters.showEndangeredOnly) {
      result = result.filter(d => 
        d.species.some(s => s.endangered)
      );
    }
    
    // Filter by migration patterns
    if (currentFilters.hasMigration) {
      result = result.filter(d => 
        d.migration_patterns && d.migration_patterns.length > 0
      );
    }
    
    // Filter by search term
    if (term) {
      const lowercaseTerm = term.toLowerCase();
      result = result.filter(d => 
        d.species.some(s => 
          s.name.toLowerCase().includes(lowercaseTerm) || 
          (s.scientific_name && s.scientific_name.toLowerCase().includes(lowercaseTerm))
        ) ||
        (d.migration_patterns && d.migration_patterns.some(m => 
          m.species.toLowerCase().includes(lowercaseTerm)
        ))
      );
    }
    
    // Sort data
    if (currentFilters.sortBy === 'date') {
      result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else if (currentFilters.sortBy === 'species') {
      result.sort((a, b) => b.species_count - a.species_count);
    } else if (currentFilters.sortBy === 'coral') {
      result.sort((a, b) => b.coral_health_index - a.coral_health_index);
    }
    
    setFilteredData(result);
  };
  
  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    let updatedFilters = { ...filters };
    
    if (filterType === 'minCoralHealth') {
      updatedFilters.minCoralHealth = value;
    } else if (filterType === 'showEndangeredOnly') {
      updatedFilters.showEndangeredOnly = !updatedFilters.showEndangeredOnly;
    } else if (filterType === 'hasMigration') {
      updatedFilters.hasMigration = !updatedFilters.hasMigration;
    } else if (filterType === 'sortBy') {
      updatedFilters.sortBy = value;
    }
    
    setFilters(updatedFilters);
    applyFilters(biodiversityData, updatedFilters, searchTerm);
  };
  
  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    applyFilters(biodiversityData, filters, term);
  };
  
  // Handle card click
  const handleCardClick = (data) => {
    setSelectedData(data);
  };
  
  // Close detail view
  const closeDetail = () => {
    setSelectedData(null);
  };
  
  // Prepare chart data for species distribution
  const prepareSpeciesChartData = () => {
    if (!filteredData.length) return { data: [], labels: [] };
    
    // Use the latest data
    const latest = filteredData[0];
    if (!latest || !latest.species) return { data: [], labels: [] };
    
    // Get all species and their counts
    const allSpecies = latest.species.sort((a, b) => b.count - a.count);
    
    return {
      data: allSpecies.map(s => ({
        label: s.name,
        value: s.count,
        color: s.endangered ? '#FF6B6B' : '#00B4D8'
      })),
      labels: allSpecies.map(s => s.name)
    };
  };
  
  // Prepare chart data for coral health trends
  const prepareCoralHealthChartData = () => {
    if (!filteredData.length) return { labels: [], data: [] };
    
    // Sort by timestamp (oldest first for charts)
    const sortedData = [...filteredData].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    // Create labels from timestamps
    const labels = sortedData.map(d => 
      new Date(d.timestamp).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    );
    
    // Create datasets
    return {
      labels,
      data: [
        {
          label: 'Coral Health Index',
          data: sortedData.map(d => d.coral_health_index),
          color: '#4CAF50'
        }
      ]
    };
  };
  
  // Prepare chart data for species trends
  const prepareSpeciesTrendsChartData = () => {
    if (!filteredData.length || filteredData.length < 2) 
      return { labels: [], data: [] };
    
    // Sort by timestamp (oldest first for charts)
    const sortedData = [...filteredData].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    // Create labels from timestamps
    const labels = sortedData.map(d => 
      new Date(d.timestamp).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    );
    
    // Create datasets for total species count
    return {
      labels,
      data: [
        {
          label: 'Total Species Count',
          data: sortedData.map(d => d.species_count),
          color: '#00B4D8'
        }
      ]
    };
  };
  
  // Prepare map features
  const prepareMapFeatures = () => {
    return filteredData.map(item => ({
      id: item.id,
      feature_type: 'biodiversity',
      name: `Biodiversity Survey (${new Date(item.timestamp).toLocaleDateString()})`,
      coordinates: [item.location.lng, item.location.lat],
      description: `${item.species_count} species, Coral Health: ${item.coral_health_index}/10`,
      properties: {
        species_count: item.species_count,
        coral_health_index: item.coral_health_index,
        timestamp: new Date(item.timestamp).toLocaleDateString()
      }
    }));
  };
  
  const speciesChartData = prepareSpeciesChartData();
  const coralHealthChartData = prepareCoralHealthChartData();
  const speciesTrendsChartData = prepareSpeciesTrendsChartData();
  const mapFeatures = prepareMapFeatures();
  
  // Render loading state
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="ocean-loader"></div>
        <p className="ml-4 text-lg text-ocean-dark">Loading biodiversity data...</p>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Biodiversity Tracker</h1>
        <p className="text-gray-600">Monitor marine species and coral health</p>
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
            placeholder="Search species or migrations..."
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
            <h3 className="font-semibold text-gray-800">Filter Biodiversity Data</h3>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setShowFilters(false)}
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Coral health */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Minimum Coral Health</h4>
              <div className="flex items-center">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={filters.minCoralHealth}
                  onChange={(e) => handleFilterChange('minCoralHealth', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="ml-2 text-sm font-medium w-8">{filters.minCoralHealth}</span>
              </div>
            </div>
            
            {/* Other filters */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Special Filters</h4>
              <div className="space-y-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-ocean rounded border-gray-300"
                    checked={filters.showEndangeredOnly}
                    onChange={() => handleFilterChange('showEndangeredOnly')}
                  />
                  <span className="ml-2 text-gray-700">Show only endangered species</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-ocean rounded border-gray-300"
                    checked={filters.hasMigration}
                    onChange={() => handleFilterChange('hasMigration')}
                  />
                  <span className="ml-2 text-gray-700">Has migration patterns</span>
                </label>
              </div>
            </div>
            
            {/* Sort options */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Sort By</h4>
              <div className="relative">
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-ocean focus:border-ocean rounded-md"
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <option value="date">Date (newest first)</option>
                  <option value="species">Species Count (highest first)</option>
                  <option value="coral">Coral Health (highest first)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <FaChevronDown className="h-4 w-4" />
                </div>
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
              chartType === 'species' 
                ? 'bg-ocean text-white' 
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => setChartType('species')}
          >
            Species Distribution
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              chartType === 'coral' 
                ? 'bg-ocean text-white' 
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => setChartType('coral')}
          >
            Coral Health
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              chartType === 'trends' 
                ? 'bg-ocean text-white' 
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => setChartType('trends')}
          >
            Species Trends
          </button>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {/* View modes */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-4">
            {filteredData.map(data => (
              <BiodiversityCard 
                key={data.id} 
                data={data} 
                onClick={handleCardClick}
              />
            ))}
            
            {filteredData.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
                <FaFish className="w-16 h-16 mb-4 text-gray-300" />
                <p className="text-lg font-medium">No biodiversity data found</p>
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
            {chartType === 'species' && (
              <>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Species Distribution</h3>
                <div className="mb-4 text-sm text-gray-500">
                  <span className="inline-flex items-center mr-4">
                    <span className="w-3 h-3 rounded-full bg-ocean mr-1"></span>
                    <span>Regular Species</span>
                  </span>
                  <span className="inline-flex items-center">
                    <span className="w-3 h-3 rounded-full bg-coral mr-1"></span>
                    <span>Endangered Species</span>
                  </span>
                </div>
                <PieChart 
                  data={speciesChartData.data}
                  height={500}
                />
              </>
            )}
            
            {chartType === 'coral' && (
              <>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Coral Health Trends</h3>
                <LineChart 
                  data={coralHealthChartData.data}
                  labels={coralHealthChartData.labels}
                  height={500}
                  yAxisLabel="Coral Health Index (0-10)"
                  xAxisLabel="Date"
                />
              </>
            )}
            
            {chartType === 'trends' && (
              <>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Species Count Trends</h3>
                <LineChart 
                  data={speciesTrendsChartData.data}
                  labels={speciesTrendsChartData.labels}
                  height={500}
                  yAxisLabel="Species Count"
                  xAxisLabel="Date"
                />
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Detail modal */}
      {selectedData && (
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
                  Biodiversity Report
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
                    <h3 className="text-sm font-medium text-gray-500">Date</h3>
                    <p className="text-base font-medium text-gray-800">
                      {new Date(selectedData.timestamp).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500">Location</h3>
                    <p className="text-base font-medium text-gray-800">
                      {selectedData.location.lat.toFixed(4)}°, {selectedData.location.lng.toFixed(4)}°
                    </p>
                  </div>
                  
                  <div className="mb-4 grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Species Count</h3>
                      <p className="text-lg font-semibold text-gray-800">
                        {selectedData.species_count.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Coral Health</h3>
                      <div className="flex items-center mt-1">
                        <p className="text-lg font-semibold text-gray-800 mr-2">
                          {selectedData.coral_health_index}/10
                        </p>
                        <div className={`w-3 h-6 rounded-full ${
                          selectedData.coral_health_index >= 8 ? 'bg-success' :
                          selectedData.coral_health_index >= 6 ? 'bg-algae' :
                          selectedData.coral_health_index >= 4 ? 'bg-warning' :
                          'bg-coral'
                        }`}></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Migration pattern */}
                  {selectedData.migration_patterns && selectedData.migration_patterns.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Migration Patterns</h3>
                      {selectedData.migration_patterns.map((pattern, index) => (
                        <div key={index} className="bg-ocean-lightest p-3 rounded-md mb-2">
                          <p className="font-medium text-ocean-dark">{pattern.species}</p>
                          <div className="flex justify-between mt-1 text-sm">
                            <span>Direction: {pattern.direction}</span>
                            <span>Distance: {pattern.distance_km} km</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">Season: {pattern.season}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Species Distribution</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <BarChart 
                      data={selectedData.species.slice(0, 5).map(s => s.count)}
                      labels={selectedData.species.slice(0, 5).map(s => s.name)}
                      horizontal={true}
                      height={200}
                    />
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Species List</h3>
                    <div className="max-h-60 overflow-y-auto bg-gray-50 rounded-lg p-3">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr>
                            <th className="text-left font-medium text-gray-700 pb-2">Species</th>
                            <th className="text-left font-medium text-gray-700 pb-2">Scientific Name</th>
                            <th className="text-right font-medium text-gray-700 pb-2">Count</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedData.species.map((species, index) => (
                            <tr key={index} className="border-t border-gray-100">
                              <td className="py-2 flex items-center">
                                {species.endangered && (
                                  <span className="w-2 h-2 rounded-full bg-coral mr-2"></span>
                                )}
                                {species.name}
                              </td>
                              <td className="py-2 text-gray-600 italic">{species.scientific_name}</td>
                              <td className="py-2 text-right">{species.count.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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

export default BiodiversityTracker;