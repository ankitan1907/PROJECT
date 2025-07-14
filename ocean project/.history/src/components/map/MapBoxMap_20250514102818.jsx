// src/components/MapboxMap.jsx
import React from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN } from '../../config/mapConfig';

const MapboxMap = ({ features, initialViewState, style, onClick }) => {
  return (
    <Map
      mapboxAccessToken={MAPBOX_TOKEN}
      initialViewState={initialViewState}
      mapStyle={style}
      style={{ width: '100%', height: '100%' }}
      onClick={(event) => {
        const { lngLat } = event;
        const clickedFeature = features.find(f => {
          const [lng, lat] = f.coordinates;
          return Math.abs(lng - lngLat.lng) < 0.5 && Math.abs(lat - lngLat.lat) < 0.5;
        });

        if (clickedFeature) {
          onClick(clickedFeature);
        }
      }}
    >
      <NavigationControl position="top-left" />
      
      {features.map((feature, idx) => (
        <Marker
          key={idx}
          longitude={feature.coordinates[0]}
          latitude={feature.coordinates[1]}
          anchor="bottom"
        >
          <div className={`w-3 h-3 rounded-full ${
            feature.feature_type === 'tectonic_plate' ? 'bg-coral' :
            feature.feature_type === 'deep_sea_vent' ? 'bg-warning' :
            feature.feature_type === 'ocean_trench' ? 'bg-ocean-dark' :
            feature.feature_type === 'coral_reef' ? 'bg-algae' :
            feature.feature_type === 'anomaly' ? 'bg-purple-500' :
            feature.feature_type === 'disaster' ? 'bg-danger' : 'bg-gray-500'
          }`} title={feature.name}></div>
        </Marker>
      ))}
    </Map>
  );
};

export default MapboxMap;
