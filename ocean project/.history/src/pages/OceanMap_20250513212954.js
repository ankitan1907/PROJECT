import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaLayerGroup, FaFilter, FaTimes, FaInfoCircle } from 'react-icons/fa';
import Map, { Marker, Popup } from 'react-map-gl'; // react-map-gl import
import 'mapbox-gl/dist/mapbox-gl.css'; // Mapbox styles

import { MAPBOX_TOKEN } from '../config/mapConfig';
import { fetchMapFeatures, fetchAnomalies, fetchDisasterPredictions } from '../api';

// Main component
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
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 0,
    zoom: 1.7
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
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

  const filteredFeatures = () => {
    let features = [];

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

    if (filters.showAnomalies && anomalies.length > 0) {
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

    if (filters.showDisasters && disasters.length > 0) {
      const disasterFeatures = disasters
        .filter(d => d.probability > 0.3)
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

  const handleFeatureClick = (feature) => {
    setSelectedFeature(feature);
    setShowInfo(true);
  };

  // Map component
  const MapboxMap = ({ features }) => (
    <Map
      mapboxAccessToken={MAPBOX_TOKEN}
      initialViewState={viewState}
      mapStyle="mapbox://styles/mapbox/outdoors-v11"
      style={{ width: '100%', height: '100%' }}
      onMove={evt => setViewState(evt.viewState)}
    >
      {features.map(feature => (
        <Marker
          key={feature.id}
          longitude={feature.coordinates[0]}
          latitude={feature.coordinates[1]}
          anchor="bottom"
          onClick={e => {
            e.originalEvent.stopPropagation();
            handleFeatureClick(feature);
          }}
        >
          <div className="w-4 h-4 rounded-full bg-blue-600 border border-white cursor-pointer"></div>
        </Marker>
      ))}
      {selectedFeature && (
        <Popup
          longitude={selectedFeature.coordinates[0]}
          latitude={selectedFeature.coordinates[1]}
          onClose={() => setSelectedFeature(null)}
        >
          <div className="text-sm">
            <strong>{selectedFeature.name}</strong>
            <p>{selectedFeature.description}</p>
          </div>
        </Popup>
      )}
    </Map>
  );

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
      <div className="relative flex-1 rounded-lg overflow-hidden shadow-lg">
        <MapboxMap features={filteredFeatures()} />
        {/* Filter/Info Panel Buttons */}
        {/* ... (your filter & info UI code stays unchanged) */}
      </div>
    </div>
  );
};

export default OceanMap;
