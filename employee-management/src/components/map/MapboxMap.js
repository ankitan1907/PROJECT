import React, { useState, useEffect, useRef } from 'react';
import Map, { 
  NavigationControl, 
  Source, 
  Layer,
  Popup,
  FullscreenControl,
  ScaleControl
} from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Define a placeholder API key (would be replaced with a real one)
const MAPBOX_TOKEN = 'pk.eyJ1Ijoib2NlYW5leWVhcHAiLCJhIjoiY2xwNTJsYng1MDd4bTJrcGt2bmE0cDBsYyJ9.J7PLNHl3TyK0nHKnUj7aJA';

const MapboxMap = ({ 
  features = [], 
  initialViewState = { 
    longitude: 0, 
    latitude: 0, 
    zoom: 1.5 
  },
  style = 'mapbox://styles/mapbox/ocean',
  showPopup = true,
  onClick = null,
  showTerrain = true,
  showBathymetry = true
}) => {
  const [viewState, setViewState] = useState(initialViewState);
  const [popupInfo, setPopupInfo] = useState(null);
  const mapRef = useRef(null);
  
  // Feature styling based on type
  const getFeatureColor = (type) => {
    switch (type) {
      case 'tectonic_plate':
        return '#FF6B6B';
      case 'deep_sea_vent':
        return '#FFC107';
      case 'ocean_trench':
        return '#0077B6';
      case 'coral_reef':
        return '#4CAF50';
      case 'anomaly':
        return '#9C27B0';
      default:
        return '#00B4D8';
    }
  };
  
  // Process features into GeoJSON format
  const getGeoJSONData = () => {
    if (!features || features.length === 0) return null;
    
    return {
      type: 'FeatureCollection',
      features: features.map(feature => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: Array.isArray(feature.coordinates) 
            ? feature.coordinates 
            : [feature.location?.lng || 0, feature.location?.lat || 0]
        },
        properties: {
          ...feature,
          color: getFeatureColor(feature.feature_type || feature.anomaly_type || feature.disaster_type)
        }
      }))
    };
  };
  
  // Handle feature click
  const handleFeatureClick = (event) => {
    if (!showPopup) return;
    
    const { features } = event;
    if (features && features.length > 0) {
      const clickedFeature = features[0];
      setPopupInfo({
        longitude: clickedFeature.geometry.coordinates[0],
        latitude: clickedFeature.geometry.coordinates[1],
        properties: clickedFeature.properties
      });
      
      // Call the onClick callback if provided
      if (onClick) {
        onClick(clickedFeature.properties);
      }
    }
  };
  
  // Close popup when clicking elsewhere
  const handleMapClick = (event) => {
    const { features } = event;
    if (!features || features.length === 0) {
      setPopupInfo(null);
    }
  };
  
  // Layers for the map
  const pointLayer = {
    id: 'data-points',
    type: 'circle',
    paint: {
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        1, 4,
        3, 5,
        5, 8,
        10, 12
      ],
      'circle-color': ['get', 'color'],
      'circle-opacity': 0.8,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff'
    }
  };
  
  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle={style}
        mapboxAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={['data-points']}
        onClick={handleMapClick}
        onMouseEnter={() => {
          if (mapRef.current) {
            mapRef.current.getCanvas().style.cursor = 'pointer';
          }
        }}
        onMouseLeave={() => {
          if (mapRef.current) {
            mapRef.current.getCanvas().style.cursor = '';
          }
        }}
        attributionControl={false}
      >
        {/* Controls */}
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />
        <ScaleControl position="bottom-right" />
        
        {/* Feature data */}
        {getGeoJSONData() && (
          <Source id="features-source" type="geojson" data={getGeoJSONData()}>
            <Layer 
              {...pointLayer} 
              onClick={handleFeatureClick}
            />
          </Source>
        )}
        
        {/* Popup for feature info */}
        {popupInfo && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            anchor="bottom"
            closeButton={true}
            closeOnClick={false}
            onClose={() => setPopupInfo(null)}
            className="ocean-popup"
          >
            <div className="p-2">
              <h3 className="font-semibold text-ocean-dark">{popupInfo.properties.name || 'Ocean Feature'}</h3>
              {popupInfo.properties.description && (
                <p className="text-sm mt-1 text-gray-600">{popupInfo.properties.description}</p>
              )}
              {popupInfo.properties.properties && (
                <div className="mt-2 text-xs">
                  {Object.entries(popupInfo.properties.properties).map(([key, value]) => (
                    <div key={key} className="flex justify-between mt-1">
                      <span className="text-gray-500">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-medium ml-2">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};

export default MapboxMap;