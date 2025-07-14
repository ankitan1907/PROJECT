import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MapboxGL from 'mapbox-gl'; // Import Mapbox GL
import { FaMap } from 'react-icons/fa';
import { fetchDisasterPredictions } from '../api'; // Assuming you already have an API call to fetch disaster data

// Initialize Mapbox with your access token
MapboxGL.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN'; // Replace with your Mapbox access token

const DisasterPrediction = () => {
  const [loading, setLoading] = useState(true);
  const [disasters, setDisasters] = useState([]);
  const [filteredDisasters, setFilteredDisasters] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'map', or 'chart'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchDisasterPredictions();
        setDisasters(data);
        setFilteredDisasters(data);
      } catch (error) {
        console.error("Error fetching disaster predictions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Prepare map features
  const prepareMapFeatures = () => {
    return filteredDisasters.map(disaster => ({
      id: disaster.id,
      coordinates: [disaster.location.lng, disaster.location.lat], // Assuming `lng` and `lat` are available in the disaster data
      description: disaster.advisory,
      name: `${disaster.disaster_type} - ${Math.round(disaster.probability * 100)}%`
    }));
  };

  const mapFeatures = prepareMapFeatures();

  // Render loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* View mode toggle */}
      <div className="flex gap-4">
        <button
          onClick={() => setViewMode('grid')}
          className={viewMode === 'grid' ? 'bg-blue-500' : ''}
        >
          Grid
        </button>
        <button
          onClick={() => setViewMode('map')}
          className={viewMode === 'map' ? 'bg-blue-500' : ''}
        >
          <FaMap />
        </button>
        <button
          onClick={() => setViewMode('chart')}
          className={viewMode === 'chart' ? 'bg-blue-500' : ''}
        >
          Chart
        </button>
      </div>

      {/* Render map view */}
      {viewMode === 'map' && (
        <div id="map" style={{ height: '500px' }}></div> // Map container
      )}

      {/* Initialize the Mapbox map when the map view is shown */}
      {viewMode === 'map' && useEffect(() => {
        const map = new MapboxGL.Map({
          container: 'map', // The ID of the container element
          style: 'mapbox://styles/mapbox/streets-v11',
          center: [-73.935242, 40.730610], // Default center (can be dynamic)
          zoom: 5,
        });

        mapFeatures.forEach(feature => {
          new MapboxGL.Marker()
            .setLngLat(feature.coordinates)
            .setPopup(new MapboxGL.Popup().setHTML(`<h3>${feature.name}</h3><p>${feature.description}</p>`))
            .addTo(map);
        });

        return () => map.remove(); // Cleanup map on unmount
      }, [viewMode, mapFeatures])}

    </div>
  );
};

export default DisasterPrediction;
