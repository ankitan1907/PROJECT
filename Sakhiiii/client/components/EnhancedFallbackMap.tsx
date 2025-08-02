import React, { useState } from 'react';
import { MapPin, Shield, AlertTriangle, Navigation, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Zone {
  id: string;
  name: string;
  type: 'safe' | 'risk';
  lat: number;
  lng: number;
  description: string;
}

interface EnhancedFallbackMapProps {
  height?: string;
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
}

const EnhancedFallbackMap: React.FC<EnhancedFallbackMapProps> = ({
  height = '400px',
  onLocationSelect
}) => {
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  const demoZones: Zone[] = [
    {
      id: '1',
      name: 'MG Road Safe Zone',
      type: 'safe',
      lat: 12.9760,
      lng: 77.6031,
      description: 'Well-lit commercial area with police patrolling'
    },
    {
      id: '2',
      name: 'Brigade Road',
      type: 'safe',
      lat: 12.9720,
      lng: 77.6040,
      description: 'Popular shopping street with good security'
    },
    {
      id: '3',
      name: 'Isolated Construction Area',
      type: 'risk',
      lat: 12.9716,
      lng: 77.5946,
      description: 'Poorly lit area with recent incidents reported'
    },
    {
      id: '4',
      name: 'Safe Transit Hub',
      type: 'safe',
      lat: 12.9750,
      lng: 77.6100,
      description: 'Metro station with CCTV and security'
    }
  ];

  const handleZoneClick = (zone: Zone) => {
    setSelectedZone(zone);
    if (onLocationSelect) {
      onLocationSelect({ lat: zone.lat, lng: zone.lng });
    }
  };

  return (
    <div className="w-full rounded-lg overflow-hidden border border-purple-200" style={{ height }}>
      {/* Map Header */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          <h3 className="font-semibold">Bangalore Safety Map (Demo)</h3>
        </div>
        <p className="text-xs text-purple-100 mt-1">
          Interactive demo showing safety zones and incident data
        </p>
      </div>

      {/* Map Content */}
      <div className="relative h-full bg-gradient-to-br from-blue-50 to-purple-50">
        {/* Demo Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
          {/* Grid pattern for map-like appearance */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="gray" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Zone Markers */}
          <div className="absolute inset-0 p-8">
            {demoZones.map((zone, index) => (
              <button
                key={zone.id}
                onClick={() => handleZoneClick(zone)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
                  zone.type === 'safe' 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-red-500 hover:bg-red-600'
                }`}
                style={{
                  left: `${20 + (index % 3) * 30}%`,
                  top: `${25 + Math.floor(index / 3) * 40}%`
                }}
              >
                {zone.type === 'safe' ? (
                  <Shield className="h-4 w-4 text-white" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-white" />
                )}
              </button>
            ))}

            {/* Current Location Marker */}
            <div 
              className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
              style={{ left: '50%', top: '60%' }}
            >
              <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded whitespace-nowrap">
                  Your Location
                </span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
            <h4 className="font-semibold text-sm mb-2">Map Legend</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Shield className="h-3 w-3 text-green-500" />
                <span className="text-xs">Safe Zones</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3 w-3 text-red-500" />
                <span className="text-xs">Risk Zones</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <span className="text-xs">Your Location</span>
              </div>
            </div>
          </div>

          {/* Zone Info Panel */}
          {selectedZone && (
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
              <div className="flex items-start gap-2">
                {selectedZone.type === 'safe' ? (
                  <Shield className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-semibold text-sm">{selectedZone.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">{selectedZone.description}</p>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" className="text-xs h-6">
                      <Navigation className="h-3 w-3 mr-1" />
                      Navigate
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs h-6">
                      <Phone className="h-3 w-3 mr-1" />
                      Report
                    </Button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedZone(null)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          )}

          {/* Demo Notice */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs">
              🎭 Demo Mode - Click zones to explore
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedFallbackMap;
