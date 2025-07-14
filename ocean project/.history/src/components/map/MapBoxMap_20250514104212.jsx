// src/components/MapboxMap.jsx
import React from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN } from '../../config/mapConfig';

const MapboxMap = ({ features, initialViewState, style, onClick }) => {
  const handleClick = (event) => {
    const { lngLat } = event;
    const clickedFeature = features.find(f => {
      const [lng, lat] = f.coordinates;
      return Math.abs(lng - lngLat.lng) < 0.5 && Math.abs(lat - lngLat.lat) < 0.5;
    });

    if (clickedFeature) {
      onClick(clickedFeature);
    }
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
   <Map
  mapboxAccessToken={MAPBOX_TOKEN}
  {...props}
  mapStyle={props.style || "mapbox://styles/mapbox/streets-v11"}
>

      <NavigationControl position="top-left" />

      {features.map((feature, idx) => (
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
  );
};

export default MapboxMap;  // Export with the correct name
