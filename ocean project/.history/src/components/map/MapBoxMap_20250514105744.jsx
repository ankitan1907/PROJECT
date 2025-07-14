import React, { useState } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN } from '../../config/mapConfig';
import MapboxMap from './MapboxMap';
import ChartComponent from './ChartComponent';  // Your chart component for visualizing data
import GridView from './GridView';  // Your component for showing data in grid view

const OceanAnomalyDashboard = ({ features, initialViewState }) => {
  const [viewMode, setViewMode] = useState('map');  // Can be 'map', 'grid', or 'chart'
  const [filteredFeatures, setFilteredFeatures] = useState(features);
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [selectedFeatureType, setSelectedFeatureType] = useState('All');

  const handleSeverityChange = (e) => {
    setSelectedSeverity(e.target.value);
    filterFeatures(e.target.value, selectedFeatureType);
  };

  const handleFeatureTypeChange = (e) => {
    setSelectedFeatureType(e.target.value);
    filterFeatures(selectedSeverity, e.target.value);
  };

  const filterFeatures = (severity, featureType) => {
    let filtered = features;

    if (severity !== 'All') {
      filtered = filtered.filter(f => f.severity === severity);
    }

    if (featureType !== 'All') {
      filtered = filtered.filter(f => f.feature_type === featureType);
    }

    setFilteredFeatures(filtered);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const getMarkerColor = (featureType) => {
    switch (featureType) {
      case 'tectonic_plate':
        return 'bg-coral';
      case 'deep_sea_vent':
        return 'bg-warning';
      case 'ocean_trench':
        return 'bg-ocean-dark';
      case 'coral_reef':
        return 'bg-algae';
      case 'anomaly':
        return 'bg-purple-500';
      case 'disaster':
        return 'bg-danger';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="dashboard">
      <div className="controls">
        <select onChange={handleSeverityChange} value={selectedSeverity}>
          <option value="All">All Severities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <select onChange={handleFeatureTypeChange} value={selectedFeatureType}>
          <option value="All">All Feature Types</option>
          <option value="tectonic_plate">Tectonic Plates</option>
          <option value="deep_sea_vent">Deep Sea Vents</option>
          <option value="ocean_trench">Ocean Trenches</option>
          <option value="coral_reef">Coral Reefs</option>
          <option value="anomaly">Anomalies</option>
          <option value="disaster">Disasters</option>
        </select>

        <button onClick={() => handleViewModeChange('map')}>Map View</button>
        <button onClick={() => handleViewModeChange('grid')}>Grid View</button>
        <button onClick={() => handleViewModeChange('chart')}>Chart View</button>
      </div>

      {viewMode === 'map' && (
        <Map
          mapboxAccessToken={MAPBOX_TOKEN}
          initialViewState={initialViewState}
          mapStyle="mapbox://styles/mapbox/light-v11"
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl position="top-left" />

          {filteredFeatures.map((feature, idx) => (
            <Marker
              key={idx}
              longitude={feature.coordinates[0]}
              latitude={feature.coordinates[1]}
              anchor="bottom"
            >
              <div
                className={`w-3 h-3 rounded-full ${getMarkerColor(feature.feature_type)}`}
                title={feature.name}
              />
            </Marker>
          ))}
        </Map>
      )}

      {viewMode === 'grid' && <GridView features={filteredFeatures} />}
      {viewMode === 'chart' && <ChartComponent features={filteredFeatures} />}
    </div>
  );
};

export default OceanAnomalyDashboard;
