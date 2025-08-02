import React from 'react';
import { MapPin } from 'lucide-react';

interface UserReport {
  id: string;
  lat: number;
  lng: number;
  type: 'safe' | 'risky';
  reportedBy: string;
  description: string;
  timestamp: Date;
  upvotes: number;
  downvotes: number;
}

interface SafetyLocation {
  id: string;
  lat: number;
  lng: number;
  type: 'safe' | 'risky';
  name: string;
  description: string;
  reports?: number;
}

interface FallbackMapProps {
  userReports: UserReport[];
  safetyLocations: SafetyLocation[];
  onMapClick?: (lat: number, lng: number) => void;
  isReporting?: boolean;
  className?: string;
}

const FallbackMap: React.FC<FallbackMapProps> = ({
  userReports,
  safetyLocations,
  onMapClick,
  isReporting = false,
  className = "h-64 w-full rounded-xl"
}) => {
  const handleAreaClick = (location: SafetyLocation) => {
    if (isReporting && onMapClick) {
      onMapClick(location.lat, location.lng);
    }
  };

  const allLocations = [...safetyLocations, ...userReports.map(report => ({
    id: report.id,
    lat: report.lat,
    lng: report.lng,
    type: report.type,
    name: `User Report: ${report.description.substring(0, 30)}...`,
    description: report.description
  }))];

  return (
    <div className={`${className} bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-purple-200 rounded-xl relative overflow-hidden`}>
      {/* Header */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-lg">🇮🇳</span>
          <span className="text-sm font-semibold text-gray-700">India Safety Map</span>
        </div>
      </div>

      {/* Map visualization */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-64 h-48 mx-auto">
          {/* Simplified India outline */}
          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 300 240" 
            className="absolute inset-0"
          >
            {/* India shape */}
            <path 
              d="M 150 40 Q 180 30 210 50 L 250 80 Q 270 120 250 160 L 220 200 Q 180 220 150 200 L 120 180 Q 100 140 110 100 Q 120 60 150 40 Z" 
              fill="url(#indiaGradient)" 
              stroke="#8b5cf6" 
              strokeWidth="2"
              opacity="0.8"
            />
            <defs>
              <linearGradient id="indiaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#e0e7ff', stopOpacity: 0.8}} />
                <stop offset="100%" style={{stopColor: '#c7d2fe', stopOpacity: 0.8}} />
              </linearGradient>
            </defs>
            
            {/* Location markers */}
            {safetyLocations.slice(0, 8).map((location, index) => {
              // Simple projection for demo
              const x = 120 + (index % 4) * 40 + Math.random() * 20;
              const y = 60 + Math.floor(index / 4) * 60 + Math.random() * 20;
              
              return (
                <g key={location.id}>
                  <circle
                    cx={x}
                    cy={y}
                    r="6"
                    fill={location.type === 'safe' ? '#10b981' : '#ef4444'}
                    stroke="white"
                    strokeWidth="2"
                    className={`cursor-pointer hover:scale-110 transition-transform ${isReporting ? 'animate-pulse' : ''}`}
                    onClick={() => handleAreaClick(location)}
                  />
                  <text
                    x={x}
                    y={y + 20}
                    textAnchor="middle"
                    className="text-xs fill-gray-700 font-medium"
                    style={{ fontSize: '10px' }}
                  >
                    {location.name.split(',')[0]}
                  </text>
                </g>
              );
            })}
            
            {/* Current location */}
            <g>
              <circle
                cx="170"
                cy="140"
                r="8"
                fill="#8b5cf6"
                stroke="white"
                strokeWidth="3"
                className="animate-pulse"
              />
              <text
                x="170"
                y="160"
                textAnchor="middle"
                className="text-xs fill-purple-700 font-bold"
                style={{ fontSize: '10px' }}
              >
                You
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* Location list overlay */}
      <div className="absolute bottom-4 left-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm max-h-32 overflow-y-auto">
        <h4 className="text-sm font-semibold mb-2 text-gray-700">Safety Locations</h4>
        <div className="space-y-1">
          {safetyLocations.slice(0, 6).map((location) => (
            <div 
              key={location.id}
              className={`flex items-center space-x-2 text-xs p-1 rounded cursor-pointer transition-colors ${
                isReporting ? 'hover:bg-purple-100' : ''
              }`}
              onClick={() => handleAreaClick(location)}
            >
              <div 
                className={`w-3 h-3 rounded-full ${
                  location.type === 'safe' ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="flex-1 font-medium text-gray-700">
                {location.name}
              </span>
              {location.reports && (
                <span className="text-gray-500">{location.reports}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-sm">
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Safe</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Risky</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
            <span>You</span>
          </div>
        </div>
      </div>

      {/* Reporting instruction */}
      {isReporting && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 bg-purple-600/90 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
          Click on a location to report
        </div>
      )}

      {/* Bottom info */}
      <div className="absolute bottom-1 right-1 text-xs text-gray-500 bg-white/70 px-2 py-1 rounded">
        Fallback Map • {safetyLocations.length} locations • {userReports.length} reports
      </div>
    </div>
  );
};

export default FallbackMap;
