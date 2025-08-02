import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Navigation,
  AlertTriangle,
  Shield,
  MapPin,
  Route,
  Clock,
  Star,
  Plus,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import GoogleMapsComponent from '@/components/GoogleMapsComponent';
import FallbackMap from '@/components/FallbackMap';

interface RouteInfo {
  distance: string;
  duration: string;
  safetyScore: number;
  warnings: string[];
}

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

// Indian locations for the safety app
const indianSafetyLocations = [
  // Bangalore
  { id: '1', lat: 12.9716, lng: 77.5946, type: 'safe', name: 'MG Road Metro Station', description: 'Well-lit area with security cameras and police presence', reports: 45 },
  { id: '2', lat: 12.9698, lng: 77.5926, type: 'risky', name: 'Dark Alley near Commercial Street', description: 'Poorly lit, avoid after sunset', reports: 12 },
  { id: '3', lat: 12.9352, lng: 77.6245, type: 'safe', name: 'Koramangala Police Station', description: 'Police station - safe zone', reports: 67 },
  
  // Mumbai
  { id: '4', lat: 19.0760, lng: 72.8777, type: 'safe', name: 'Bandra Station', description: 'Busy area with good security', reports: 89 },
  { id: '5', lat: 19.0596, lng: 72.8295, type: 'risky', name: 'Isolated area near Mahim Creek', description: 'Secluded area, avoid during late hours', reports: 23 },
  
  // Delhi
  { id: '6', lat: 28.6139, lng: 77.2090, type: 'safe', name: 'Connaught Place Central Park', description: 'Central location with good foot traffic', reports: 134 },
  { id: '7', lat: 28.5355, lng: 77.3910, type: 'risky', name: 'Secluded area in East Delhi', description: 'Reported incidents, be cautious', reports: 18 },
  
  // Chennai
  { id: '8', lat: 13.0827, lng: 80.2707, type: 'safe', name: 'Marina Beach Main Area', description: 'Popular tourist spot with police patrol', reports: 76 },
  
  // Hyderabad  
  { id: '9', lat: 17.4065, lng: 78.4772, type: 'safe', name: 'Hitech City Main Road', description: 'Well-maintained tech hub area', reports: 98 },
  { id: '10', lat: 17.3850, lng: 78.4867, type: 'risky', name: 'Old City narrow lanes', description: 'Narrow lanes, minimal lighting', reports: 15 },
];

const mockRoutes: RouteInfo[] = [
  { distance: '2.3 km', duration: '8 mins', safetyScore: 95, warnings: [] },
  { distance: '1.8 km', duration: '6 mins', safetyScore: 70, warnings: ['Poorly lit area ahead', 'Recent incident reported'] },
  { distance: '3.1 km', duration: '11 mins', safetyScore: 85, warnings: ['Construction zone'] }
];

const indianDestinations = [
  'Koramangala, Bangalore', 'MG Road, Bangalore', 'Indiranagar, Bangalore',
  'Bandra, Mumbai', 'Andheri, Mumbai', 'Powai, Mumbai',
  'Connaught Place, Delhi', 'Khan Market, Delhi', 'Karol Bagh, Delhi',
  'Marina Beach, Chennai', 'T Nagar, Chennai', 'Anna Nagar, Chennai',
  'Hitech City, Hyderabad', 'Banjara Hills, Hyderabad', 'Secunderabad'
];

// Real India map using Google Maps with proper geography

const RouteCard = ({ route, index, isSelected, onSelect }: {
  route: RouteInfo;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const getSafetyColor = (score: number) => {
    if (score >= 90) return 'text-safe';
    if (score >= 70) return 'text-warning';
    return 'text-danger';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onSelect}
      className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${
        isSelected 
          ? 'bg-primary/20 border-primary shadow-lg' 
          : 'bg-card/80 border-border hover:shadow-md'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Route className="w-5 h-5 text-primary" />
          <span className="font-semibold">Route {index + 1}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Star className={`w-4 h-4 ${getSafetyColor(route.safetyScore)}`} />
          <span className={`text-sm font-bold ${getSafetyColor(route.safetyScore)}`}>
            {route.safetyScore}%
          </span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4 mb-2">
        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span>{route.distance}</span>
        </div>
        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{route.duration}</span>
        </div>
      </div>
      
      {route.warnings.length > 0 && (
        <div className="space-y-1">
          {route.warnings.map((warning, idx) => (
            <div key={idx} className="flex items-center space-x-2 text-xs">
              <AlertTriangle className="w-3 h-3 text-warning" />
              <span className="text-warning">{warning}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default function SafeRouteFinder() {
  const [destination, setDestination] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedRoute, setSelectedRoute] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [showRoutes, setShowRoutes] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [userReports, setUserReports] = useState<UserReport[]>([]);
  const [isReporting, setIsReporting] = useState(false);
  const [reportingLocation, setReportingLocation] = useState<[number, number] | null>(null);
  const [useGoogleMaps, setUseGoogleMaps] = useState(true);

  const handleSearch = async () => {
    if (!destination.trim()) return;
    
    setIsSearching(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSearching(false);
    setShowRoutes(true);
    setSuggestions([]);
    
    const riskyAreas = ['dark alley', 'isolated', 'secluded'];
    const isRiskyDestination = riskyAreas.some(area => 
      destination.toLowerCase().includes(area)
    );
    
    if (isRiskyDestination) {
      setShowAlert(true);
      setAlertMessage('⚠️ Warning: Destination area has recent safety concerns. Please choose a safer route.');
    }
  };

  const handleInputChange = (value: string) => {
    setDestination(value);
    if (value.length > 2) {
      const filtered = indianDestinations.filter(dest =>
        dest.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setDestination(suggestion);
    setSuggestions([]);
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (isReporting) {
      setReportingLocation([lat, lng]);
    }
  };

  const submitReport = (type: 'safe' | 'risky', description: string) => {
    if (!reportingLocation) return;
    
    const newReport: UserReport = {
      id: Date.now().toString(),
      lat: reportingLocation[0],
      lng: reportingLocation[1],
      type,
      reportedBy: 'Current User',
      description,
      timestamp: new Date(),
      upvotes: 0,
      downvotes: 0,
    };
    
    setUserReports(prev => [...prev, newReport]);
    setIsReporting(false);
    setReportingLocation(null);
  };

  const voteOnReport = (reportId: string, voteType: 'up' | 'down') => {
    setUserReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, [voteType === 'up' ? 'upvotes' : 'downvotes']: report[voteType === 'up' ? 'upvotes' : 'downvotes'] + 1 }
        : report
    ));
  };

  // Simulate entering risky zone
  useEffect(() => {
    if (showRoutes) {
      const timer = setTimeout(() => {
        setShowAlert(true);
        setAlertMessage('🚨 Red Zone Alert: You are approaching an unsafe area. Consider alternative route.');
        
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showRoutes]);

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Safe Route Finder 🇮🇳
        </h1>
        <p className="text-muted-foreground">
          Navigate safely across India with community reports
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Where do you want to go in India?"
              value={destination}
              onChange={(e) => handleInputChange(e.target.value)}
              className="pl-10 rounded-2xl"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          
          {suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-card rounded-2xl shadow-lg border border-border">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => selectSuggestion(suggestion)}
                  className="w-full text-left px-4 py-3 hover:bg-muted/50 first:rounded-t-2xl last:rounded-b-2xl transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Button
            onClick={handleSearch}
            disabled={!destination.trim() || isSearching}
            className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 rounded-2xl py-6 text-base font-medium"
          >
            {isSearching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Finding Safe Routes...
              </>
            ) : (
              <>
                <Navigation className="w-5 h-5 mr-2" />
                Find Safe Route
              </>
            )}
          </Button>
          
          <Button
            onClick={() => setIsReporting(!isReporting)}
            variant={isReporting ? "destructive" : "outline"}
            className="rounded-2xl py-6"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
        
        {isReporting && (
          <div className="bg-primary/10 rounded-2xl p-4">
            <p className="text-sm text-foreground mb-2">📍 Click on the map to report a location</p>
            {reportingLocation && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Selected: {reportingLocation[0].toFixed(4)}, {reportingLocation[1].toFixed(4)}
                </p>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => submitReport('safe', 'User reported this area as safe')}
                    className="bg-safe hover:bg-safe/90"
                  >
                    Mark as Safe
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => submitReport('risky', 'User reported safety concerns in this area')}
                    variant="destructive"
                  >
                    Mark as Risky
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Alert */}
      {showAlert && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Alert className="border-warning/30 bg-warning/10">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <AlertDescription className="text-warning">
              {alertMessage}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Routes */}
      {showRoutes && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold text-foreground">Available Routes</h2>
          <div className="space-y-3">
            {mockRoutes.map((route, index) => (
              <RouteCard
                key={index}
                route={route}
                index={index}
                isSelected={selectedRoute === index}
                onSelect={() => setSelectedRoute(index)}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Real Leaflet Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-pastel-pink/30"
      >
        <div className="relative">
          {/* Map type toggle */}
          <div className="absolute top-2 left-2 z-[1001] flex gap-1">
            <Button
              size="sm"
              variant={useGoogleMaps ? "default" : "outline"}
              onClick={() => setUseGoogleMaps(true)}
              className="text-xs px-2 py-1 h-7"
            >
              Google Maps
            </Button>
            <Button
              size="sm"
              variant={!useGoogleMaps ? "default" : "outline"}
              onClick={() => setUseGoogleMaps(false)}
              className="text-xs px-2 py-1 h-7"
            >
              Simple
            </Button>
          </div>

          {/* Conditional map rendering */}
          {useGoogleMaps ? (
            <GoogleMapsComponent
              height="320px"
              showSafeZones={true}
              showIncidents={true}
              showSafeBusinesses={true}
              onLocationSelect={(location) => handleMapClick([location.lat, location.lng])}
            />
          ) : (
            <FallbackMap
              userReports={userReports}
              safetyLocations={indianSafetyLocations}
              onMapClick={handleMapClick}
              isReporting={isReporting}
              className="h-80 w-full rounded-xl"
            />
          )}
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-safe rounded-full"></div>
              <span>Safe Zones ({indianSafetyLocations.filter(l => l.type === 'safe').length})</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-danger rounded-full"></div>
              <span>Risk Zones ({indianSafetyLocations.filter(l => l.type === 'risky').length})</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Your Location</span>
            </div>
          </div>
          <div className="text-xs">
            {userReports.length} user reports • 🇮🇳 {useGoogleMaps ? 'Interactive India Map with Google Maps' : 'Simplified India Map'}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
