import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaChartLine, 
  FaExclamationTriangle, 
  FaCloudRain, 
  FaFish,
  FaAngleRight
} from 'react-icons/fa';
import MapboxMap from '../components/MapBoxMap';
import { MAPBOX_TOKEN } from '../config/mapConfig';

// Components
import StatCard from '../components/ui/StatCard';
import LineChart from '../components/ui/LineChart';
import PieChart from '../components/ui/PieChart';
import AnomalyCard from '../components/anomaly/AnomalyCard';
import DisasterCard from '../components/disaster/DisasterCard';
import MapboxMap from '../components/map/MapboxMap';

// API
import { 
  fetchAnomalies, 
  fetchDisasterPredictions, 
  fetchBiodiversity,
  fetchHistoricalData,
  fetchMapFeatures
} from '../api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [anomalies, setAnomalies] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [biodiversity, setBiodiversity] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [mapFeatures, setMapFeatures] = useState([]);
  
  // Stats
  const [stats, setStats] = useState({
    anomalyCount: 0,
    disasterCount: 0,
    speciesCount: 0,
    avgTemp: 0,
  });
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [anomalyData, disasterData, biodiversityData, historicalData, mapFeatures] = await Promise.all([
          fetchAnomalies(),
          fetchDisasterPredictions(),
          fetchBiodiversity(),
          fetchHistoricalData(),
          fetchMapFeatures()
        ]);
        
        // Set state with fetched data
        setAnomalies(anomalyData);
        setDisasters(disasterData);
        setBiodiversity(biodiversityData);
        setHistoricalData(historicalData);
        setMapFeatures(mapFeatures);
        
        // Calculate stats
        const anomalyCount = anomalyData.filter(a => a.is_anomaly).length;
        const activeDisasters = disasterData.filter(d => d.probability > 0.5).length;
        const latestBiodiversity = biodiversityData.length > 0 ? biodiversityData[biodiversityData.length - 1] : null;
        const speciesCount = latestBiodiversity ? latestBiodiversity.species_count : 0;
        
        // Average temperature from last 30 days
        const recentData = historicalData.slice(-30);
        const avgTemp = recentData.reduce((sum, item) => sum + item.average_temperature, 0) / recentData.length;
        
        setStats({
          anomalyCount,
          disasterCount: activeDisasters,
          speciesCount,
          avgTemp: avgTemp.toFixed(1),
        });
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Prepare chart data
  const temperatureChartData = () => {
    if (!historicalData.length) return { labels: [], data: [] };
    
    // Get the last 365 data points
    const recentData = historicalData.slice(-365);
    
    return {
      labels: recentData.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })),
      data: [
        {
          label: 'Ocean Temperature (°C)',
          data: recentData.map(d => d.average_temperature),
          color: '#00B4D8'
        },
        {
          label: 'Sea Level Rise (mm)',
          data: recentData.map(d => d.sea_level_rise_mm / 10), // Scale down for visualization
          color: '#0077B6'
        }
      ]
    };
  };
  
  const biodiversityChartData = () => {
    if (!biodiversity.length) return { data: [], labels: [] };
    
    // Use the latest biodiversity data
    const latest = biodiversity[biodiversity.length - 1];
    if (!latest || !latest.species) return { data: [], labels: [] };
    
    // Get top 5 species by count
    const topSpecies = [...latest.species]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return {
      data: topSpecies.map(s => s.count),
      labels: topSpecies.map(s => s.name)
    };
  };
  
  const temperatureChart = temperatureChartData();
  const biodiversityChart = biodiversityChartData();
  
  // Loader component
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="ocean-loader"></div>
        <p className="ml-4 text-lg text-ocean-dark">Loading ocean data...</p>
      </div>
    );
  }
  
  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Ocean Dashboard</h1>
        <p className="text-gray-600">Monitor ocean conditions and anomalies in real-time</p>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Temperature"
          value={`${stats.avgTemp}°C`}
          icon={<FaChartLine className="w-5 h-5 text-ocean" />}
          color="light"
          trend="up"
          trendValue="0.8°C"
        />
        <StatCard 
          title="Active Anomalies"
          value={stats.anomalyCount}
          icon={<FaExclamationTriangle className="w-5 h-5 text-white" />}
          color="blue"
        />
        <StatCard 
          title="Disaster Alerts"
          value={stats.disasterCount}
          icon={<FaCloudRain className="w-5 h-5 text-white" />}
          color="red"
        />
        <StatCard 
          title="Species Tracked"
          value={stats.speciesCount.toLocaleString()}
          icon={<FaFish className="w-5 h-5 text-white" />}
          color="green"
        />
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Temperature chart */}
          <motion.div 
            className="bg-white p-4 rounded-lg shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Ocean Temperature & Sea Level</h2>
              <Link to="/timeline" className="text-ocean-medium hover:text-ocean-dark text-sm flex items-center">
                View timeline <FaAngleRight className="ml-1" />
              </Link>
            </div>
            <LineChart 
              data={temperatureChart.data}
              labels={temperatureChart.labels}
              height={300}
              yAxisLabel="Temperature (°C)"
            />
          </motion.div>
          
          {/* Map */}
          <motion.div 
            className="bg-white p-4 rounded-lg shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Ocean Features</h2>
              <Link to="/map" className="text-ocean-medium hover:text-ocean-dark text-sm flex items-center">
                Explore map <FaAngleRight className="ml-1" />
              </Link>
            </div>
            <div className="h-[300px] rounded-lg overflow-hidden">
              <MapboxMap 
                features={mapFeatures.slice(0, 20)} 
                initialViewState={{
                  longitude: 0,
                  latitude: 0,
                  zoom: 1
                }}
              />
            </div>
          </motion.div>
        </div>
        
        {/* Right column */}
        <div className="space-y-6">
          {/* Species distribution */}
          <motion.div 
            className="bg-white p-4 rounded-lg shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Species Distribution</h2>
              <Link to="/biodiversity" className="text-ocean-medium hover:text-ocean-dark text-sm flex items-center">
                View all <FaAngleRight className="ml-1" />
              </Link>
            </div>
            <PieChart 
              data={biodiversityChart.data}
              labels={biodiversityChart.labels}
              height={220}
              doughnut={true}
            />
          </motion.div>
          
          {/* Anomalies */}
          <motion.div 
            className="bg-white p-4 rounded-lg shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Recent Anomalies</h2>
              <Link to="/anomalies" className="text-ocean-medium hover:text-ocean-dark text-sm flex items-center">
                View all <FaAngleRight className="ml-1" />
              </Link>
            </div>
            <div className="space-y-3">
              {anomalies
                .filter(a => a.is_anomaly)
                .slice(0, 2)
                .map(anomaly => (
                  <AnomalyCard key={anomaly.id} anomaly={anomaly} />
                ))}
            </div>
          </motion.div>
          
          {/* Disaster predictions */}
          <motion.div 
            className="bg-white p-4 rounded-lg shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Disaster Predictions</h2>
              <Link to="/disasters" className="text-ocean-medium hover:text-ocean-dark text-sm flex items-center">
                View all <FaAngleRight className="ml-1" />
              </Link>
            </div>
            <div className="space-y-3">
              {disasters
                .filter(d => d.probability > 0.5)
                .slice(0, 2)
                .map(disaster => (
                  <DisasterCard key={disaster.id} disaster={disaster} />
                ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;