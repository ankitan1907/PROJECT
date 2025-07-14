import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaFilter, FaTimes, FaSearch, FaMap, FaChartBar } from 'react-icons/fa';

// Components
import AnomalyCard from '../components/anomaly/AnomalyCard';
import LineChart from '../components/ui/LineChart';
import MapboxMap from '../components/map/OceanAnomalyMap';

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
           






ChatGPT said:
Filters
</button>
</div>
</div>

javascript
Copy
Edit
  {/* Filter modal */}
  {showFilters && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center"
    >
      <div className="bg-white p-4 rounded-md shadow-lg max-w-md w-full">
        <div className="flex justify-between">
          <h3 className="text-xl font-semibold text-gray-700">Filters</h3>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setShowFilters(false)}
          >
            <FaTimes />
          </button>
        </div>

        <div className="mt-4">
          <h4 className="text-md font-medium text-gray-600">Anomaly Type</h4>
          <div className="mt-2">
            {Object.keys(filters.types).map(type => (
              <label key={type} className="inline-flex items-center mr-4">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={filters.types[type]}
                  onChange={() => handleFilterChange('type', type)}
                />
                <span className="ml-2 text-sm text-gray-600 capitalize">{type.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <h4 className="text-md font-medium text-gray-600">Severity</h4>
          <div className="mt-2 flex items-center gap-4">
            <input
              type="number"
              className="w-20 p-2 border border-gray-300 rounded-md"
              value={filters.severity.min}
              onChange={e => handleFilterChange('severity', { min: e.target.value })}
              min={1}
              max={5}
            />
            <span>to</span>
            <input
              type="number"
              className="w-20 p-2 border border-gray-300 rounded-md"
              value={filters.severity.max}
              onChange={e => handleFilterChange('severity', { max: e.target.value })}
              min={1}
              max={5}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center">
          <input
            type="checkbox"
            checked={filters.onlyAnomalies}
            onChange={() => handleFilterChange('onlyAnomalies', true)}
            className="form-checkbox"
          />
          <span className="ml-2 text-sm text-gray-600">Show only anomalies</span>
        </div>
      </div>
    </motion.div>
  )}

  {/* Content based on viewMode */}
  {viewMode === 'grid' && (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {filteredAnomalies.map((anomaly) => (
        <AnomalyCard key={anomaly.id} anomaly={anomaly} onClick={() => handleCardClick(anomaly)} />
      ))}
    </div>
  )}

  {viewMode === 'map' && (
    <div className="h-full w-full">
      <MapboxMap features={mapFeatures} />
    </div>
  )}

  {viewMode === 'chart' && (
    <div className="h-full w-full">
      <LineChart data={chartData} />
    </div>
  )}

  {/* Anomaly Detail Modal */}
  {selectedAnomaly && (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-md shadow-lg max-w-lg w-full">
        <div className="flex justify-between">
          <h3 className="text-xl font-semibold text-gray-700">Anomaly Detail</h3>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={closeDetail}
          >
            <FaTimes />
          </button>
        </div>

        {/* Show selected anomaly details */}
        <div className="mt-4">
          <p><strong>Type:</strong> {selectedAnomaly.anomaly_type}</p>
          <p><strong>Temperature:</strong> {selectedAnomaly.temperature}°C</p>
          <p><strong>Salinity:</strong> {selectedAnomaly.salinity} PSU</p>
          <p><strong>Severity:</strong> {selectedAnomaly.severity}</p>
          <p><strong>Location:</strong> ({selectedAnomaly.location.lat}, {selectedAnomaly.location.lng})</p>
          <p><strong>Timestamp:</strong> {new Date(selectedAnomaly.timestamp).toLocaleString()}</p>
        </div>
      </div>
    </div>
  )}
</div>
);
};

export default AnomalyDetection;