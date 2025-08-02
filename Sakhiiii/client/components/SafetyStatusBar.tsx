import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, MapPin, Clock, Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface LocationSafety {
  score: number; // 0-100
  level: 'high' | 'medium' | 'low';
  factors: string[];
  nearbyIncidents: number;
  lastUpdated: Date;
}

export default function SafetyStatusBar() {
  const [location, setLocation] = useState<string | null>(null);
  const [safetyData, setSafetyData] = useState<LocationSafety | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    checkSafetyStatus();
  }, []);

  const checkSafetyStatus = async () => {
    setIsLoading(true);
    
    try {
      // Get user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            // Simulate location name (in real app, use reverse geocoding)
            const mockLocation = getMockLocationName(latitude, longitude);
            setLocation(mockLocation);
            
            // Calculate safety score based on various factors
            const safetyScore = calculateSafetyScore(latitude, longitude);
            setSafetyData(safetyScore);
            setIsLoading(false);
          },
          (error) => {
            console.log('Location access denied, using mock data');
            setLocation('Your Area');
            setSafetyData(getMockSafetyData());
            setIsLoading(false);
          }
        );
      } else {
        setLocation('Your Area');
        setSafetyData(getMockSafetyData());
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error checking safety status:', error);
      setIsLoading(false);
    }
  };

  const getMockLocationName = (lat: number, lng: number): string => {
    // Simulate location names based on coordinates
    const areas = [
      'Koramangala', 'Indiranagar', 'MG Road', 'Whitefield', 'Electronic City',
      'Jayanagar', 'HSR Layout', 'BTM Layout', 'Malleswaram', 'Rajajinagar'
    ];
    const index = Math.floor((lat + lng) * 100) % areas.length;
    return areas[index];
  };

  const calculateSafetyScore = (lat: number, lng: number): LocationSafety => {
    // Simulate safety calculation based on location
    const baseScore = 75;
    const timeOfDay = new Date().getHours();
    
    // Adjust score based on time (lower at night)
    let timeAdjustment = 0;
    if (timeOfDay >= 22 || timeOfDay <= 6) {
      timeAdjustment = -15; // Night time
    } else if (timeOfDay >= 18 || timeOfDay <= 8) {
      timeAdjustment = -8; // Evening/early morning
    }

    // Random factors for demonstration
    const randomAdjustment = Math.floor(Math.random() * 20) - 10;
    const finalScore = Math.max(20, Math.min(95, baseScore + timeAdjustment + randomAdjustment));

    let level: 'high' | 'medium' | 'low';
    let factors: string[] = [];
    let nearbyIncidents = 0;

    if (finalScore >= 75) {
      level = 'high';
      factors = ['Well-lit area', 'Active community', 'Police patrolling', 'Safe public transport'];
      nearbyIncidents = Math.floor(Math.random() * 2);
    } else if (finalScore >= 50) {
      level = 'medium';
      factors = ['Moderate lighting', 'Some activity', 'Regular transport', 'Few recent incidents'];
      nearbyIncidents = Math.floor(Math.random() * 4) + 1;
    } else {
      level = 'low';
      factors = ['Poor lighting', 'Isolated area', 'Limited transport', 'Recent incidents reported'];
      nearbyIncidents = Math.floor(Math.random() * 6) + 3;
    }

    return {
      score: finalScore,
      level,
      factors,
      nearbyIncidents,
      lastUpdated: new Date()
    };
  };

  const getMockSafetyData = (): LocationSafety => {
    return {
      score: 78,
      level: 'high',
      factors: ['Well-lit area', 'Active community', 'Police presence'],
      nearbyIncidents: 1,
      lastUpdated: new Date()
    };
  };

  const getSafetyColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSafetyTextColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSafetyMessage = (level: string) => {
    switch (level) {
      case 'high': return 'You\'re in a safe area!';
      case 'medium': return 'Stay alert and aware';
      case 'low': return 'Extra caution recommended';
      default: return 'Checking safety status...';
    }
  };

  if (isLoading || !safetyData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-3 border border-primary/20"
      >
        <div className="flex items-center gap-3">
          <div className="animate-pulse bg-muted rounded-full w-8 h-8"></div>
          <div className="flex-1">
            <div className="animate-pulse bg-muted rounded h-4 w-32 mb-1"></div>
            <div className="animate-pulse bg-muted rounded h-3 w-20"></div>
          </div>
          <div className="flex items-center gap-1">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-xl p-3 border border-primary/20 ${
        safetyData.level === 'high' 
          ? 'bg-green-50/50 dark:bg-green-900/20' 
          : safetyData.level === 'medium'
          ? 'bg-yellow-50/50 dark:bg-yellow-900/20'
          : 'bg-red-50/50 dark:bg-red-900/20'
      }`}
    >
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className={`rounded-full p-2 ${
            safetyData.level === 'high' 
              ? 'bg-green-500/20' 
              : safetyData.level === 'medium'
              ? 'bg-yellow-500/20'
              : 'bg-red-500/20'
          }`}
        >
          {safetyData.level === 'high' ? (
            <Shield className="w-4 h-4 text-green-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
          )}
        </motion.div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`font-medium text-sm ${getSafetyTextColor(safetyData.level)}`}>
              {getSafetyMessage(safetyData.level)}
            </span>
            <Badge 
              variant="secondary" 
              className={`text-xs ${getSafetyColor(safetyData.level)} text-white border-0`}
            >
              {safetyData.score}/100
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <MapPin className="w-3 h-3" />
            <span>{location}</span>
            {safetyData.nearbyIncidents > 0 && (
              <>
                <span>•</span>
                <span>{safetyData.nearbyIncidents} recent incidents</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={checkSafetyStatus}
            disabled={isLoading}
            className="p-1 h-6 w-6 rounded"
          >
            <Clock className="w-3 h-3" />
          </Button>
          
          {isOnline ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="bg-muted rounded-full h-1.5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${safetyData.score}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full ${getSafetyColor(safetyData.level)}`}
          />
        </div>
      </div>
    </motion.div>
  );
}
