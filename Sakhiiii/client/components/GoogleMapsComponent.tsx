import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleMap, LoadScript, Marker, Circle, InfoWindow } from '@react-google-maps/api';
import { MapPin, Shield, AlertTriangle, Navigation, Phone } from 'lucide-react';
import EnhancedFallbackMap from './EnhancedFallbackMap';
import { sampleDataService } from '@/services/sampleData';

interface MapLocation {
  lat: number;
  lng: number;
}

interface SafeZone {
  id: string;
  label: string;
  description: string;
  type: 'safe_zone' | 'risk_zone';
  coordinates: [number, number]; // [lng, lat]
  address: string;
  city: string;
  radius: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'extreme';
  incidentCount?: number;
  lastIncident?: string;
}

interface IncidentReport {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'extreme';
  description: string;
  address: string;
  coordinates: [number, number];
  timestamp: string;
  reportedBy: string;
}

interface SafeBusiness {
  id: string;
  name: string;
  category: string;
  coordinates: [number, number];
  address: string;
  phone?: string;
  rating: number;
  amenities: string[];
}

interface GoogleMapsComponentProps {
  center?: MapLocation;
  zoom?: number;
  height?: string;
  onLocationSelect?: (location: MapLocation) => void;
  showSafeZones?: boolean;
  showIncidents?: boolean;
  showSafeBusinesses?: boolean;
  currentLocation?: MapLocation;
}

const GoogleMapsComponent: React.FC<GoogleMapsComponentProps> = ({
  center = { lat: 12.9716, lng: 77.5946 }, // Default to Bangalore
  zoom = 13,
  height = '400px',
  onLocationSelect,
  showSafeZones = true,
  showIncidents = true,
  showSafeBusinesses = true,
  currentLocation
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [safeBusinesses, setSafeBusinesses] = useState<SafeBusiness[]>([]);
  const [userLocation, setUserLocation] = useState<MapLocation | null>(currentLocation || null);
  const [loading, setLoading] = useState(true);
  const [mapsError, setMapsError] = useState(false);

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  // Google Maps libraries to load
  const libraries = useMemo(() => ['places'], []);

  // Map container style
  const mapContainerStyle = {
    width: '100%',
    height: height
  };

  // Map options
  const mapOptions = useMemo(() => ({
    disableDefaultUI: false,
    clickableIcons: true,
    scrollwheel: true,
    mapTypeControl: true,
    streetViewControl: true,
    fullscreenControl: true,
    zoomControl: true,
    styles: [
      {
        featureType: 'poi.business',
        stylers: [{ visibility: 'on' }]
      },
      {
        featureType: 'transit',
        stylers: [{ visibility: 'on' }]
      }
    ]
  }), []);

  // Fetch data from backend
  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const lat = userLocation?.lat || center.lat;
        const lng = userLocation?.lng || center.lng;

        // Import secure network service
        const { secureNetworkService } = await import('../services/secureNetworkService');

        // Generate fallback data for each endpoint
        const demoZones = sampleDataService.getAllZones().map(zone => ({
          id: zone.id,
          label: zone.label,
          description: zone.description,
          type: zone.type as 'safe_zone' | 'risk_zone',
          coordinates: zone.coordinates ? [zone.coordinates.lng, zone.coordinates.lat] : [lng, lat],
          address: zone.address,
          city: zone.city || 'Demo City',
          radius: zone.radius,
          riskLevel: zone.riskLevel,
          incidentCount: zone.incidentCount || 0,
          lastIncident: zone.lastIncident
        })).filter(zone => zone.coordinates[0] && zone.coordinates[1]); // Filter out invalid coordinates

        const demoIncidents = sampleDataService.getNearbyIncidents(lat, lng, 10000).map(incident => ({
          id: incident.id,
          type: incident.type,
          severity: incident.severity,
          description: incident.description,
          address: incident.address,
          city: incident.city || 'Demo City',
          coordinates: incident.coordinates ? [incident.coordinates.lng, incident.coordinates.lat] : [lng, lat],
          timestamp: incident.timestamp,
          reportedBy: incident.reportedBy,
          isVerified: incident.isVerified || false
        })).filter(incident => incident.coordinates[0] && incident.coordinates[1]); // Filter out invalid coordinates

        const demoBusinesses = sampleDataService.getSafeBusinesses().map(business => ({
          id: business.id,
          name: business.name,
          category: business.category,
          coordinates: business.coordinates ? [business.coordinates.lng, business.coordinates.lat] : [lng, lat],
          address: business.address,
          city: business.city || 'Demo City',
          phone: business.phone,
          hours: business.hours,
          rating: business.rating,
          amenities: business.amenities || []
        })).filter(business => business.coordinates[0] && business.coordinates[1]); // Filter out invalid coordinates

        // Fetch with fallbacks
        const [zonesResult, incidentsResult, businessesResult] = await Promise.all([
          secureNetworkService.fetchWithFallback(
            `${backendUrl}/api/zones?lat=${lat}&lng=${lng}&radius=10000`,
            { success: true, zones: demoZones },
            { showUserError: true, timeout: 8000 }
          ),
          secureNetworkService.fetchWithFallback(
            `${backendUrl}/api/incidents?lat=${lat}&lng=${lng}&radius=10000&limit=50`,
            { success: true, incidents: demoIncidents },
            { showUserError: false, timeout: 8000 }
          ),
          secureNetworkService.fetchWithFallback(
            `${backendUrl}/api/safe-businesses?lat=${lat}&lng=${lng}&radius=5000`,
            { success: true, businesses: demoBusinesses },
            { showUserError: false, timeout: 8000 }
          )
        ]);

        // Process results
        if (zonesResult.success && zonesResult.data?.zones) {
          setSafeZones(zonesResult.data.zones);
        }

        if (incidentsResult.success && incidentsResult.data?.incidents) {
          setIncidents(incidentsResult.data.incidents);
        }

        if (businessesResult.success && businessesResult.data?.businesses) {
          setSafeBusinesses(businessesResult.data.businesses);
        }

        // Show demo mode notification if any requests were blocked
        const usingFallback = zonesResult.usingFallback || incidentsResult.usingFallback || businessesResult.usingFallback;
        if (usingFallback) {
          console.log('📊 Map data loaded in demo mode due to security software protection');
        }

      } catch (error) {
        console.error('Error fetching map data:', error);
        // Load demo data as last resort
        loadDemoData();
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();
  }, [userLocation, center, backendUrl]);

  // Load sample data from service
  const loadDemoData = () => {
    const zones = sampleDataService.getAllZones();
    const mappedZones = zones.map(zone => ({
      id: zone.id,
      label: zone.label,
      description: zone.description,
      type: zone.type,
      coordinates: [zone.lng, zone.lat], // MongoDB format [lng, lat]
      address: zone.address,
      city: zone.city,
      radius: zone.radius,
      riskLevel: zone.riskLevel,
      incidentCount: zone.incidentCount
    }));
    setSafeZones(mappedZones);

    const incidentReports = sampleDataService.getIncidentReports();
    const mappedIncidents = incidentReports.map(incident => ({
      id: incident.id,
      type: incident.type,
      severity: incident.severity,
      description: incident.description,
      address: incident.location.address,
      coordinates: [incident.location.lng, incident.location.lat],
      timestamp: incident.timestamp,
      reportedBy: incident.reportedBy,
      isVerified: false
    }));
    setIncidents(mappedIncidents);

    // Keep existing safe businesses or add some sample ones
    setSafeBusinesses([
      {
        id: '1',
        name: 'Cafe Coffee Day - MG Road',
        category: 'cafe',
        coordinates: [77.6041, 12.9761],
        address: 'MG Road, Bangalore',
        phone: '+91-80-12345678',
        rating: 4.5,
        amenities: ['cctv', 'well_lit', 'female_staff']
      },
      {
        id: '2',
        name: 'Women-Safe Auto Stand',
        category: 'auto_stand',
        coordinates: [77.2168, 28.6305],
        address: 'Connaught Place, Delhi',
        phone: '+91-11-87654321',
        rating: 4.8,
        amenities: ['female_drivers', 'security', 'well_lit']
      }
    ]);

    console.log('✅ Loaded sample safety data:', {
      zones: mappedZones.length,
      incidents: mappedIncidents.length,
      stats: sampleDataService.getSafetyStats()
    });
  };

  // Get current location
  useEffect(() => {
    if (!currentLocation) {
      const getLocation = async () => {
        try {
          const { locationService } = await import('../services/locationService');
          const location = await locationService.getCurrentLocation(true);
          setUserLocation({
            lat: location.latitude,
            lng: location.longitude
          });
        } catch (error) {
          console.warn('Error getting location:', error);
          // Location error is already handled by locationService with user notifications
        }
      };

      getLocation();
    }
  }, [currentLocation]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng && onLocationSelect) {
      const location = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      onLocationSelect(location);
    }
  }, [onLocationSelect]);

  // Marker icons - safe access to google.maps
  const getMarkerIcon = (type: string, severity?: string) => {
    const baseUrl = 'data:image/svg+xml;base64,';

    // Check if Google Maps API is loaded properly
    if (typeof google === 'undefined' || !google.maps || !google.maps.Size) {
      return undefined; // Return undefined if Google Maps isn't loaded yet
    }

    // Safe size creation with fallback
    const createSize = (width: number, height: number) => {
      try {
        return new google.maps.Size(width, height);
      } catch (error) {
        console.warn('Google Maps Size constructor failed, using fallback');
        return { width, height }; // Fallback object
      }
    };

    switch (type) {
      case 'safe_zone':
        return {
          url: `${baseUrl}${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#10B981" width="24" height="24"><path d="M12 22s8-4 8-10V6l-8-2-8 2v6c0 6 8 10 8 10z"/></svg>')}`,
          scaledSize: createSize(30, 30)
        };
      case 'risk_zone':
        return {
          url: `${baseUrl}${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#EF4444" width="24" height="24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>')}`,
          scaledSize: createSize(30, 30)
        };
      case 'incident':
        const color = severity === 'high' || severity === 'extreme' ? '#DC2626' : severity === 'medium' ? '#F59E0B' : '#6B7280';
        return {
          url: `${baseUrl}${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="20" height="20"><circle cx="12" cy="12" r="10"/></svg>`)}`,
          scaledSize: createSize(20, 20)
        };
      case 'safe_business':
        return {
          url: `${baseUrl}${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3B82F6" width="20" height="20"><path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/></svg>')}`,
          scaledSize: createSize(20, 20)
        };
      default:
        return {
          url: `${baseUrl}${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#6366F1" width="24" height="24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>')}`,
          scaledSize: createSize(30, 30)
        };
    }
  };

  // Circle colors for zones
  const getCircleOptions = (zone: SafeZone) => {
    const isSafe = zone.type === 'safe_zone';
    return {
      strokeColor: isSafe ? '#10B981' : '#EF4444',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: isSafe ? '#10B981' : '#EF4444',
      fillOpacity: 0.15,
    };
  };

  if (!googleMapsApiKey || googleMapsApiKey === 'your_google_maps_api_key') {
    return (
      <div className="w-full rounded-lg overflow-hidden" style={{ height }}>
        <div className="w-full h-full bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
          <div className="text-center p-8">
            <MapPin className="mx-auto h-16 w-16 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Demo Map Mode</h3>
            <p className="text-gray-600 mb-4">Interactive map will load with real Google Maps API</p>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-500">Showing demo safety zones:</p>
              <div className="flex justify-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-700">Safe Zones</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-red-700">Risk Zones</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <LoadScript
        googleMapsApiKey={googleMapsApiKey}
        libraries={libraries}
        onError={(error) => {
          console.warn('⚠️ Google Maps loading error:', error);
          setMapsError(true);
          setLoading(false);
        }}
        loadingElement={
          <div className="w-full bg-gray-100 rounded-lg flex items-center justify-center" style={{ height }}>
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading Google Maps...</p>
            </div>
          </div>
        }
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={userLocation || center}
          zoom={zoom}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={handleMapClick}
          options={mapOptions}
        >
          {/* Current location marker */}
          {userLocation && typeof google !== 'undefined' && google.maps && (
            <Marker
              position={userLocation}
              icon={getMarkerIcon('current_location')}
              title="Your Location"
            />
          )}

          {/* Safe zones and risk zones */}
          {showSafeZones && typeof google !== 'undefined' && google.maps && safeZones.filter(zone =>
            zone.coordinates && zone.coordinates[0] && zone.coordinates[1]
          ).map((zone) => (
            <React.Fragment key={zone.id}>
              <Marker
                position={{ lat: zone.coordinates[1], lng: zone.coordinates[0] }}
                icon={getMarkerIcon(zone.type)}
                title={zone.label}
                onClick={() => setSelectedMarker(`zone-${zone.id}`)}
              />
              <Circle
                center={{ lat: zone.coordinates[1], lng: zone.coordinates[0] }}
                radius={zone.radius}
                options={getCircleOptions(zone)}
              />
              {selectedMarker === `zone-${zone.id}` && (
                <InfoWindow
                  position={{ lat: zone.coordinates[1], lng: zone.coordinates[0] }}
                  onCloseClick={() => setSelectedMarker(null)}
                >
                  <div className="p-2 max-w-xs">
                    <div className="flex items-center gap-2 mb-2">
                      {zone.type === 'safe_zone' ? (
                        <Shield className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                      <h3 className="font-semibold text-sm">{zone.label}</h3>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{zone.description}</p>
                    <p className="text-xs text-gray-500">{zone.address}</p>
                    {zone.incidentCount && (
                      <p className="text-xs text-red-600 mt-1">
                        {zone.incidentCount} recent incidents
                      </p>
                    )}
                  </div>
                </InfoWindow>
              )}
            </React.Fragment>
          ))}

          {/* Incident reports */}
          {showIncidents && typeof google !== 'undefined' && google.maps && incidents.filter(incident =>
            incident.coordinates && incident.coordinates[0] && incident.coordinates[1]
          ).map((incident) => (
            <React.Fragment key={incident.id}>
              <Marker
                position={{ lat: incident.coordinates[1], lng: incident.coordinates[0] }}
                icon={getMarkerIcon('incident', incident.severity)}
                title={`${incident.type} - ${incident.severity}`}
                onClick={() => setSelectedMarker(`incident-${incident.id}`)}
              />
              {selectedMarker === `incident-${incident.id}` && (
                <InfoWindow
                  position={{ lat: incident.coordinates[1], lng: incident.coordinates[0] }}
                  onCloseClick={() => setSelectedMarker(null)}
                >
                  <div className="p-2 max-w-xs">
                    <h3 className="font-semibold text-sm capitalize mb-1">{incident.type}</h3>
                    <p className="text-xs text-gray-600 mb-2">{incident.description}</p>
                    <p className="text-xs text-gray-500 mb-1">{incident.address}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className={`px-2 py-1 rounded text-white ${
                        incident.severity === 'extreme' ? 'bg-red-600' :
                        incident.severity === 'high' ? 'bg-red-500' :
                        incident.severity === 'medium' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}>
                        {incident.severity}
                      </span>
                      <span className="text-gray-500">
                        {new Date(incident.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </React.Fragment>
          ))}

          {/* Safe businesses */}
          {showSafeBusinesses && typeof google !== 'undefined' && google.maps && safeBusinesses.filter(business =>
            business.coordinates && business.coordinates[0] && business.coordinates[1]
          ).map((business) => (
            <React.Fragment key={business.id}>
              <Marker
                position={{ lat: business.coordinates[1], lng: business.coordinates[0] }}
                icon={getMarkerIcon('safe_business')}
                title={business.name}
                onClick={() => setSelectedMarker(`business-${business.id}`)}
              />
              {selectedMarker === `business-${business.id}` && (
                <InfoWindow
                  position={{ lat: business.coordinates[1], lng: business.coordinates[0] }}
                  onCloseClick={() => setSelectedMarker(null)}
                >
                  <div className="p-2 max-w-xs">
                    <h3 className="font-semibold text-sm mb-1">{business.name}</h3>
                    <p className="text-xs text-gray-600 mb-2 capitalize">{business.category}</p>
                    <p className="text-xs text-gray-500 mb-2">{business.address}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-yellow-500">★ {business.rating}</span>
                      {business.phone && (
                        <div className="flex items-center gap-1 text-blue-600">
                          <Phone className="h-3 w-3" />
                          <span>{business.phone}</span>
                        </div>
                      )}
                    </div>
                    {business.amenities.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Amenities:</p>
                        <div className="flex flex-wrap gap-1">
                          {business.amenities.slice(0, 3).map((amenity) => (
                            <span key={amenity} className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
                              {amenity.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </InfoWindow>
              )}
            </React.Fragment>
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default GoogleMapsComponent;
