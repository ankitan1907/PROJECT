import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaChartLine, FaWater, FaFlask } from 'react-icons/fa';

// Components
import TimelinePlayer from '../components/timeline/TimelinePlayer';
import LineChart from '../components/ui/LineChart';
import StatCard from '../components/ui/StatCard';

// API
import { fetchHistoricalData } from '../api';

const TimelinePage = () => {
  const [loading, setLoading] = useState(true);
  const [historicalData, setHistoricalData] = useState([]);
  const [currentData, setCurrentData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dataRange, setDataRange] = useState({ start: 0, end: 0 });
  const [selectedMetric, setSelectedMetric] = useState('temperature'); // 'temperature', 'sea_level', or 'ph'
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchHistoricalData();
        
        // Sort by date (oldest first)
        data.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        setHistoricalData(data);
        setCurrentData(data[data.length - 1]); // Start with most recent
        setCurrentIndex(data.length - 1);
        
        // Set initial display range (last 30 years)
        const endIndex = data.length - 1;
        const startIndex = Math.max(0, endIndex - 360); // Approximately 30 years (12 months * 30)
        setDataRange({ start: startIndex, end: endIndex });
        
      } catch (error) {
        console.error("Error fetching historical data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle timeline changes
  const handleTimeChange = (data, index) => {
    setCurrentData(data);
    setCurrentIndex(index);
  };
  
  // Prepare chart data
  const prepareChartData = () => {
    if (!historicalData.length) return { labels: [], datasets: [] };
    
    // Get data within the selected range
    const rangeData = historicalData.slice(dataRange.start, dataRange.end + 1);
    
    // Step size to reduce data points for better visualization
    const stepSize = Math.max(1, Math.floor(rangeData.length / 100));
    
    // Sample data at regular intervals
    const sampledData = [];
    for (let i = 0; i < rangeData.length; i += stepSize) {
      sampledData.push(rangeData[i]);
    }
    
    // Create labels from dates
    const labels = sampledData.map(d => 
      new Date(d.date).getFullYear().toString()
    );
    
    // Create datasets based on selected metric
    let datasets = [];
    
    if (selectedMetric === 'temperature') {
      datasets = [
        {
          label: 'Average Temperature (°C)',
          data: sampledData.map(d => d.average_temperature),
          color: '#FF6B6B',
          fill: false
        }
      ];
    } else if (selectedMetric === 'sea_level') {
      datasets = [
        {
          label: 'Sea Level Rise (mm)',
          data: sampledData.map(d => d.sea_level_rise_mm),
          color: '#00B4D8',
          fill: false
        }
      ];
    } else if (selectedMetric === 'ph') {
      datasets = [
        {
          label: 'Ocean pH',
          data: sampledData.map(d => d.ocean_ph),
          color: '#4CAF50',
          fill: false
        }
      ];
    }
    
    return { labels, datasets };
  };
  
  // Prepare the smaller time window data (5 years around current point)
  const prepareWindowChartData = () => {
    if (!historicalData.length || currentIndex === undefined) 
      return { labels: [], datasets: [] };
    
    // Calculate window (2 years before, 2 years after)
    const windowSize = 24; // 24 months
    const startIndex = Math.max(0, currentIndex - windowSize);
    const endIndex = Math.min(historicalData.length - 1, currentIndex + windowSize);
    
    // Get data within the window
    const windowData = historicalData.slice(startIndex, endIndex + 1);
    
    // Create labels from dates
    const labels = windowData.map(d => 
      new Date(d.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    );
    
    // Create all datasets
    const datasets = [
      {
        label: 'Temperature (°C)',
        data: windowData.map(d => d.average_temperature),
        color: '#FF6B6B'
      },
      {
        label: 'Sea Level Rise (mm)',
        data: windowData.map(d => d.sea_level_rise_mm / 10), // Scale down for visualization
        color: '#00B4D8'
      },
      {
        label: 'Ocean pH',
        data: windowData.map(d => d.ocean_ph),
        color: '#4CAF50'
      }
    ];
    
    return { labels, datasets };
  };
  
  // Handle range change
  const handleRangeChange = (range) => {
    setDataRange(range);
  };
  
  // Format dates
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };
  
  // Calculate change rate (for stat cards)
  const calculateChange = (metric) => {
    if (!historicalData.length || !currentData) return { value: 0, trend: 'neutral' };
    
    // Get current and previous year values
    const currentYear = new Date(currentData.date).getFullYear();
    const previousYear = currentYear - 10; // Compare with 10 years ago
    
    // Find previous year data point
    const previousData = historicalData.find(d => new Date(d.date).getFullYear() === previousYear);
    
    if (!previousData) return { value: 0, trend: 'neutral' };
    
    // Calculate change
    let change = 0;
    let trend = 'neutral';
    
    if (metric === 'temperature') {
      change = currentData.average_temperature - previousData.average_temperature;
      trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
    } else if (metric === 'sea_level') {
      change = currentData.sea_level_rise_mm - previousData.sea_level_rise_mm;
      trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
    } else if (metric === 'ph') {
      change = currentData.ocean_ph - previousData.ocean_ph;
      trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
    }
    
    return { value: Math.abs(change).toFixed(2), trend };
  };
  
  const chartData = prepareChartData();
  const windowChartData = prepareWindowChartData();
  
  // Temperature change
  const tempChange = calculateChange('temperature');
  // Sea level change
  const seaLevelChange = calculateChange('sea_level');
  // pH change
  const phChange = calculateChange('ph');
  
  // Render loading state
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="ocean-loader"></div>
        <p className="ml-4 text-lg text-ocean-dark">Loading historical data...</p>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Ocean Timeline</h1>
        <p className="text-gray-600">Explore historical changes in ocean conditions</p>
      </div>
      
      {/* Stats cards */}
      {currentData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard 
            title="Ocean Temperature"
            value={`${currentData.average_temperature.toFixed(1)}°C`}
            icon={<FaChartLine className="w-5 h-5 text-white" />}
            color="red"
            trend={tempChange.trend}
            trendValue={`${tempChange.value}°C in 10 years`}
          />
          <StatCard 
            title="Sea Level Rise"
            value={`${currentData.sea_level_rise_mm.toFixed(1)} mm`}
            icon={<FaWater className="w-5 h-5 text-white" />}
            color="blue"
            trend={seaLevelChange.trend}
            trendValue={`${seaLevelChange.value} mm in 10 years`}
          />
          <StatCard 
            title="Ocean pH"
            value={currentData.ocean_ph.toFixed(2)}
            icon={<FaFlask className="w-5 h-5 text-white" />}
            color="green"
            trend={phChange.trend}
            trendValue={`${phChange.value} in 10 years`}
          />
        </div>
      )}
      
      {/* Timeline player */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Historical Timeline</h2>
        {historicalData.length > 0 && (
          <TimelinePlayer 
            data={historicalData}
            onTimeChange={handleTimeChange}
            initialIndex={historicalData.length - 1}
            interval={500}
            autoPlay={false}
          />
        )}
      </div>
      
      {/* Current point details */}
      {currentData && (
        <motion.div 
          className="bg-white p-4 rounded-lg shadow-md mb-6"
          key={currentData.id}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Data for {formatDate(currentData.date)}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Time Period Details</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Year</p>
                    <p className="text-lg font-semibold text-gray-800">{currentData.year}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Month</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {new Date(currentData.date).toLocaleString('default', { month: 'long' })}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Measurements</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Ocean Temperature:</span>
                      <span className="text-sm font-medium text-gray-800">{currentData.average_temperature.toFixed(2)}°C</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Sea Level Rise (since 1970):</span>
                      <span className="text-sm font-medium text-gray-800">{currentData.sea_level_rise_mm.toFixed(1)} mm</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Ocean pH:</span>
                      <span className="text-sm font-medium text-gray-800">{currentData.ocean_ph.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Environmental Context</h3>
              <div className="bg-gray-50 rounded-lg p-4 h-full">
                <p className="text-sm text-gray-600">
                  {currentData.year < 1980 && 
                    `In the ${currentData.year}s, ocean temperatures were generally lower than today. This period preceded significant climate change awareness. Sea levels were beginning to show early signs of acceleration in their rise rate.`
                  }
                  {currentData.year >= 1980 && currentData.year < 1990 &&
                    `The ${currentData.year}s saw increasing scientific attention to ocean health and climate change. During this decade, the first major international discussions on climate change began. Ocean temperatures were rising gradually.`
                  }
                  {currentData.year >= 1990 && currentData.year < 2000 &&
                    `In the ${currentData.year}s, ocean temperature rise accelerated. The decade witnessed significant coral bleaching events linked to ocean warming. The Intergovernmental Panel on Climate Change (IPCC) published influential reports during this period.`
                  }
                  {currentData.year >= 2000 && currentData.year < 2010 &&
                    `The ${currentData.year}s recorded several of the warmest years on record for ocean temperatures. Research confirmed accelerating sea level rise. Ocean acidification emerged as a major concern for marine ecosystems.`
                  }
                  {currentData.year >= 2010 &&
                    `Since ${currentData.year}, ocean temperatures have reached record highs multiple times. Sea level rise has continued to accelerate, impacting coastal communities worldwide. Marine heatwaves have become more frequent and intense, with significant impacts on marine biodiversity.`
                  }
                </p>
                
                {/* Impact analysis based on metric values */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Impact Analysis</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full ${
                          currentData.average_temperature > 17 ? 'bg-coral' : 
                          currentData.average_temperature > 16 ? 'bg-warning' : 'bg-success'
                        } mr-2`}></div>
                        <p className="text-sm font-medium text-gray-700">Temperature Impact</p>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {currentData.average_temperature > 17 
                          ? "High temperatures threatening coral reefs and marine biodiversity." 
                          : currentData.average_temperature > 16 
                          ? "Moderate warming affecting sensitive marine ecosystems." 
                          : "Temperatures within historical norms for marine life."}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full ${
                          currentData.sea_level_rise_mm > 100 ? 'bg-coral' : 
                          currentData.sea_level_rise_mm > 50 ? 'bg-warning' : 'bg-success'
                        } mr-2`}></div>
                        <p className="text-sm font-medium text-gray-700">Sea Level Impact</p>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {currentData.sea_level_rise_mm > 100 
                          ? "Significant rise threatening coastal communities and ecosystems." 
                          : currentData.sea_level_rise_mm > 50 
                          ? "Moderate rise affecting low-lying coastal areas." 
                          : "Minor sea level changes with limited coastal impact."}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full ${
                          currentData.ocean_ph < 8.0 ? 'bg-coral' : 
                          currentData.ocean_ph < 8.1 ? 'bg-warning' : 'bg-success'
                        } mr-2`}></div>
                        <p className="text-sm font-medium text-gray-700">pH Impact</p>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {currentData.ocean_ph < 8.0 
                          ? "Significant acidification threatening shellfish and coral reef formation." 
                          : currentData.ocean_ph < 8.1 
                          ? "Moderate acidification affecting sensitive marine organisms." 
                          : "pH levels supporting healthy marine calcification processes."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Long-term trend chart */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Long-term Trends</h2>
          
          {/* Metric selector */}
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                selectedMetric === 'temperature' 
                  ? 'bg-coral text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedMetric('temperature')}
            >
              Temperature
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                selectedMetric === 'sea_level' 
                  ? 'bg-ocean text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedMetric('sea_level')}
            >
              Sea Level
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                selectedMetric === 'ph' 
                  ? 'bg-algae text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedMetric('ph')}
            >
              Ocean pH
            </button>
          </div>
        </div>
        
        <LineChart 
          data={chartData.datasets}
          labels={chartData.labels}
          height={300}
          yAxisLabel={
            selectedMetric === 'temperature' 
              ? 'Temperature (°C)' 
              : selectedMetric === 'sea_level' 
              ? 'Sea Level Rise (mm)' 
              : 'Ocean pH'
          }
          xAxisLabel="Year"
        />
      </div>
      
      {/* Window chart */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Current Period Detail</h2>
        <LineChart 
          data={windowChartData.datasets}
          labels={windowChartData.labels}
          height={250}
        />
      </div>
    </div>
  );
};

export default TimelinePage;