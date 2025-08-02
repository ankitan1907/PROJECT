import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, AlertTriangle, Shield, Coffee, Heart, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface SafePlace {
  id: string;
  name: string;
  type: 'police' | 'hospital' | 'cafe' | 'pharmacy' | 'washroom' | 'clinic';
  coordinates: [number, number];
  rating: number;
  verified: boolean;
  amenities?: string[];
  isOpen24x7?: boolean;
}

interface IncidentMarker {
  id: string;
  type: 'harassment' | 'stalking' | 'suspicious_activity';
  coordinates: [number, number];
  severity: 'low' | 'medium' | 'high' | 'extreme';
  timestamp: string;
  verified: boolean;
}

interface LeafletMapProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  showHeatmap?: boolean;
  showSafePlaces?: boolean;
  showIncidents?: boolean;
  showHyderabadLocations?: boolean;
  onLocationSelect?: (coordinates: [number, number]) => void;
  onPointClick?: (coordinates: [number, number]) => void;
}

// Hyderabad popular locations for route finding
const hyderabadLocations = [
  { id: '1', name: 'Hitech City', coordinates: [17.4475, 78.3563] as [number, number], type: 'office', safetyRating: 4.5 },
  { id: '2', name: 'Inorbit Mall', coordinates: [17.4326, 78.3871] as [number, number], type: 'mall', safetyRating: 4.8 },
  { id: '3', name: 'Gachibowli Stadium', coordinates: [17.4239, 78.3428] as [number, number], type: 'transport', safetyRating: 4.2 },
  { id: '4', name: 'Forum Sujana Mall', coordinates: [17.4840, 78.4071] as [number, number], type: 'mall', safetyRating: 4.6 },
  { id: '5', name: 'Charminar', coordinates: [17.3616, 78.4747] as [number, number], type: 'restaurant', safetyRating: 3.8 },
  { id: '6', name: 'Begumpet Airport', coordinates: [17.4530, 78.4678] as [number, number], type: 'transport', safetyRating: 4.7 },
  { id: '7', name: 'Apollo Hospital', coordinates: [17.4126, 78.4071] as [number, number], type: 'hospital', safetyRating: 4.9 },
  { id: '8', name: 'University of Hyderabad', coordinates: [17.4569, 78.3262] as [number, number], type: 'college', safetyRating: 4.3 },
  { id: '9', name: 'Banjara Hills', coordinates: [17.4126, 78.4482] as [number, number], type: 'restaurant', safetyRating: 4.4 },
  { id: '10', name: 'Secunderabad Railway Station', coordinates: [17.4399, 78.5017] as [number, number], type: 'transport', safetyRating: 4.1 }
];

// Mock data for safe places and incidents
const mockSafePlaces: SafePlace[] = [
  {
    id: '1',
    name: 'City Police Station',
    type: 'police',
    coordinates: [12.9716, 77.5946], // Bangalore
    rating: 4.8,
    verified: true,
    isOpen24x7: true
  },
  {
    id: '2',
    name: 'Women\'s Hospital',
    type: 'hospital',
    coordinates: [12.9696, 77.5936],
    rating: 4.5,
    verified: true,
    amenities: ['Emergency Care', 'Gynecology', 'Pharmacy']
  },
  {
    id: '3',
    name: 'Safe Haven Cafe',
    type: 'cafe',
    coordinates: [12.9726, 77.5956],
    rating: 4.7,
    verified: true,
    amenities: ['Clean Washrooms', 'Women-Friendly', 'Safe Space']
  },
  {
    id: '4',
    name: 'Apollo Pharmacy',
    type: 'pharmacy',
    coordinates: [12.9686, 77.5926],
    rating: 4.3,
    verified: true,
    isOpen24x7: true
  },
  {
    id: '5',
    name: 'Women\'s Clinic',
    type: 'clinic',
    coordinates: [12.9736, 77.5966],
    rating: 4.6,
    verified: true,
    amenities: ['Gynecology', 'Contraception', 'Health Checkups']
  }
];

const mockIncidents: IncidentMarker[] = [
  {
    id: '1',
    type: 'harassment',
    coordinates: [12.9706, 77.5916],
    severity: 'medium',
    timestamp: '2024-01-15T10:30:00Z',
    verified: true
  },
  {
    id: '2',
    type: 'suspicious_activity',
    coordinates: [12.9746, 77.5976],
    severity: 'low',
    timestamp: '2024-01-14T18:45:00Z',
    verified: false
  }
];

export default function LeafletMap({
  center = [17.3850, 78.4867], // Default to Hyderabad
  zoom = 13,
  className = '',
  showHeatmap = true,
  showSafePlaces = true,
  showIncidents = false,
  showHyderabadLocations = true,
  onLocationSelect,
  onPointClick
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<SafePlace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(coords);
        },
        (error) => {
          console.log('Location access denied, using default location');
        }
      );
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current).setView(center, zoom);
    mapInstance.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add click handler for marking points
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      const coordinates: [number, number] = [lat, lng];

      if (onPointClick) {
        onPointClick(coordinates);
      } else {
        // Default behavior - ask user to mark as safe or danger
        const pointType = confirm('Mark this location as SAFE? (Cancel for DANGER)') ? 'safe' : 'danger';
        const pointName = prompt('Give this location a name:') || `Point ${Date.now()}`;

        // Voice feedback
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(
            pointType === 'safe' ? 'Location marked as safe!' : 'Location marked as danger!'
          );
          speechSynthesis.speak(utterance);
        }

        // Add marker immediately
        const markerColor = pointType === 'safe' ? '#22c55e' : '#ef4444';
        const icon = L.divIcon({
          html: `<div style="background-color: ${markerColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          className: 'custom-div-icon',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        L.marker([lat, lng], { icon })
          .bindPopup(`<strong>${pointName}</strong><br>Marked as: ${pointType}`)
          .addTo(map);
      }
    });

    setIsLoading(false);

    // Cleanup function
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [center, zoom]);

  // Add user location marker
  useEffect(() => {
    if (!mapInstance.current || !userLocation) return;

    const userIcon = L.divIcon({
      className: 'user-location-marker',
      html: `
        <div style="
          width: 20px; 
          height: 20px; 
          background: #3b82f6; 
          border: 3px solid white; 
          border-radius: 50%; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    const userMarker = L.marker(userLocation, { icon: userIcon }).addTo(mapInstance.current);
    userMarker.bindPopup('📍 You are here');

    // Center map on user location
    mapInstance.current.setView(userLocation, zoom);

    return () => {
      mapInstance.current?.removeLayer(userMarker);
    };
  }, [userLocation, zoom]);

  // Add safe places markers
  useEffect(() => {
    if (!mapInstance.current || !showSafePlaces) return;

    const markers: L.Marker[] = [];

    mockSafePlaces.forEach((place) => {
      const iconColor = {
        police: '#ef4444', // red
        hospital: '#22c55e', // green
        cafe: '#f59e0b', // yellow
        pharmacy: '#3b82f6', // blue
        clinic: '#8b5cf6', // purple
        washroom: '#06b6d4' // cyan
      }[place.type];

      const icon = L.divIcon({
        className: 'safe-place-marker',
        html: `
          <div style="
            width: 24px; 
            height: 24px; 
            background: ${iconColor}; 
            border: 2px solid white; 
            border-radius: 50%; 
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            color: white;
            font-size: 12px;
          ">
            ${place.type === 'police' ? '🚔' : 
              place.type === 'hospital' ? '🏥' : 
              place.type === 'cafe' ? '☕' : 
              place.type === 'pharmacy' ? '💊' : 
              place.type === 'clinic' ? '🏥' : '🚻'}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker(place.coordinates, { icon }).addTo(mapInstance.current!);
      
      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold;">${place.name}</h3>
          <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 8px;">
            <span style="color: #f59e0b;">⭐</span>
            <span>${place.rating}</span>
            ${place.verified ? '<span style="color: #22c55e;">✓ Verified</span>' : ''}
          </div>
          ${place.amenities ? `
            <div style="margin-bottom: 8px;">
              ${place.amenities.map(amenity => `
                <span style="
                  background: #f3f4f6; 
                  padding: 2px 6px; 
                  border-radius: 12px; 
                  font-size: 10px;
                  margin-right: 4px;
                ">${amenity}</span>
              `).join('')}
            </div>
          ` : ''}
          ${place.isOpen24x7 ? '<div style="color: #22c55e; font-size: 12px;">🕐 Open 24/7</div>' : ''}
        </div>
      `;
      
      marker.bindPopup(popupContent);
      
      marker.on('click', () => {
        setSelectedPlace(place);
      });

      markers.push(marker);
    });

    return () => {
      markers.forEach(marker => mapInstance.current?.removeLayer(marker));
    };
  }, [showSafePlaces]);

  // Add Hyderabad locations markers
  useEffect(() => {
    if (!mapInstance.current || !showHyderabadLocations) return;

    const markers: L.Marker[] = [];

    hyderabadLocations.forEach((location) => {
      const safetyColor = location.safetyRating >= 4.5 ? '#22c55e' :
                         location.safetyRating >= 4.0 ? '#eab308' : '#ef4444';

      const typeEmoji = {
        mall: '🛍️',
        hospital: '🏥',
        college: '🎓',
        office: '🏢',
        restaurant: '🍽️',
        transport: '🚌'
      }[location.type] || '📍';

      const icon = L.divIcon({
        html: `<div style="
          background-color: ${safetyColor};
          width: 28px; height: 28px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          cursor: pointer;
          z-index: 1000;
          position: relative;
        ">${typeEmoji}</div>`,
        className: 'custom-div-icon clickable-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker(location.coordinates, { icon }).addTo(mapInstance.current!);

      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold;">${location.name}</h3>
          <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 8px;">
            <span style="color: #f59e0b;">⭐</span>
            <span>${location.safetyRating}/5 Safety Rating</span>
          </div>
          <div style="margin-bottom: 8px;">
            <span style="
              background: #f3f4f6;
              padding: 2px 6px;
              border-radius: 12px;
              font-size: 10px;
              margin-right: 4px;
            ">${location.type}</span>
          </div>
          <div style="
            background: #22c55e;
            color: white;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 11px;
            text-align: center;
            margin-top: 4px;
          ">Click marker to select as destination</div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        if (onLocationSelect) {
          onLocationSelect(location.coordinates);
        }
      });

      markers.push(marker);
    });

    return () => {
      markers.forEach(marker => mapInstance.current?.removeLayer(marker));
    };
  }, [showHyderabadLocations, onLocationSelect]);

  // Add incident markers
  useEffect(() => {
    if (!mapInstance.current || !showIncidents) return;

    const markers: L.Marker[] = [];

    mockIncidents.forEach((incident) => {
      const iconColor = {
        low: '#f59e0b',
        medium: '#f97316',
        high: '#ef4444',
        extreme: '#dc2626'
      }[incident.severity];

      const icon = L.divIcon({
        className: 'incident-marker',
        html: `
          <div style="
            width: 20px; 
            height: 20px; 
            background: ${iconColor}; 
            border: 2px solid white; 
            border-radius: 50%; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            opacity: 0.8;
          "></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker(incident.coordinates, { icon }).addTo(mapInstance.current!);
      
      const popupContent = `
        <div>
          <h4 style="margin: 0 0 4px 0; color: ${iconColor};">⚠️ ${incident.type.replace('_', ' ')}</h4>
          <p style="margin: 0; font-size: 12px; color: #666;">
            ${new Date(incident.timestamp).toLocaleDateString()}
          </p>
          <div style="margin-top: 4px;">
            <span style="
              background: ${iconColor}; 
              color: white; 
              padding: 2px 6px; 
              border-radius: 12px; 
              font-size: 10px;
            ">${incident.severity.toUpperCase()}</span>
            ${incident.verified ? '<span style="color: #22c55e; margin-left: 4px;">✓</span>' : ''}
          </div>
        </div>
      `;
      
      marker.bindPopup(popupContent);
      markers.push(marker);
    });

    return () => {
      markers.forEach(marker => mapInstance.current?.removeLayer(marker));
    };
  }, [showIncidents]);

  const navigateToPlace = (place: SafePlace) => {
    if (userLocation) {
      const directionsUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_foot&route=${userLocation[0]}%2C${userLocation[1]}%3B${place.coordinates[0]}%2C${place.coordinates[1]}`;
      window.open(directionsUrl, '_blank');
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-2xl overflow-hidden"
        style={{ minHeight: '400px' }}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 right-4 glass p-3 rounded-xl shadow-beautiful space-y-2"
      >
        <h4 className="text-xs font-semibold text-foreground mb-2">Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>You</span>
          </div>
          {showSafePlaces && (
            <>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Police</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Hospital</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Safe Cafe</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>Clinic</span>
              </div>
            </>
          )}
          {showIncidents && (
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-orange-500 rounded-full opacity-80"></div>
              <span>Incidents</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Selected Place Info */}
      {selectedPlace && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 right-4 glass p-4 rounded-xl shadow-beautiful"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">{selectedPlace.name}</h3>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">⭐</span>
                  <span className="text-sm">{selectedPlace.rating}</span>
                </div>
                {selectedPlace.verified && (
                  <Badge variant="secondary" className="text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {selectedPlace.isOpen24x7 && (
                  <Badge variant="outline" className="text-xs">
                    24/7
                  </Badge>
                )}
              </div>
              {selectedPlace.amenities && (
                <div className="flex flex-wrap gap-1">
                  {selectedPlace.amenities.slice(0, 2).map((amenity) => (
                    <Badge key={amenity} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => navigateToPlace(selectedPlace)}
                className="rounded-xl"
              >
                <Navigation className="w-4 h-4 mr-1" />
                Navigate
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedPlace(null)}
                className="rounded-xl"
              >
                ×
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
