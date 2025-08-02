import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Navigation,
  MapPin,
  Search,
  Route,
  AlertTriangle,
  Shield,
  Clock,
  Ruler,
  Volume2,
  Smartphone,
  Star,
  Coffee,
  ShoppingBag,
  Building,
  Car,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/contexts/LanguageContext';
import LeafletMap from '@/components/LeafletMap';
import { enhancedVoiceService } from '@/services/enhancedVoiceService';

interface Location {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  type: 'mall' | 'hospital' | 'college' | 'office' | 'restaurant' | 'transport';
  safetyRating: number;
  isPopular: boolean;
}

interface RouteOption {
  id: string;
  name: string;
  duration: string;
  distance: string;
  safetyScore: number;
  highlights: string[];
  waypoints: [number, number][];
  riskZones: Array<{
    coordinates: [number, number];
    type: 'high' | 'medium' | 'low';
    reason: string;
  }>;
}

// Hyderabad popular locations
const hyderabadLocations: Location[] = [
  {
    id: '1',
    name: 'Hitech City',
    address: 'Cyberabad, Madhapur, Hyderabad',
    coordinates: [17.4475, 78.3563],
    type: 'office',
    safetyRating: 4.5,
    isPopular: true
  },
  {
    id: '2',
    name: 'Inorbit Mall',
    address: 'Mindspace Rd, HITEC City, Hyderabad',
    coordinates: [17.4326, 78.3871],
    type: 'mall',
    safetyRating: 4.8,
    isPopular: true
  },
  {
    id: '3',
    name: 'Gachibowli Stadium',
    address: 'Gachibowli, Hyderabad',
    coordinates: [17.4239, 78.3428],
    type: 'transport',
    safetyRating: 4.2,
    isPopular: true
  },
  {
    id: '4',
    name: 'Forum Sujana Mall',
    address: 'Kukatpally, Hyderabad',
    coordinates: [17.4840, 78.4071],
    type: 'mall',
    safetyRating: 4.6,
    isPopular: true
  },
  {
    id: '5',
    name: 'Charminar',
    address: 'Char Kaman, Ghansi Bazaar, Hyderabad',
    coordinates: [17.3616, 78.4747],
    type: 'restaurant',
    safetyRating: 3.8,
    isPopular: true
  },
  {
    id: '6',
    name: 'Begumpet Airport',
    address: 'Begumpet, Hyderabad',
    coordinates: [17.4530, 78.4678],
    type: 'transport',
    safetyRating: 4.7,
    isPopular: true
  },
  {
    id: '7',
    name: 'Apollo Hospital',
    address: 'Film Nagar, Jubilee Hills, Hyderabad',
    coordinates: [17.4126, 78.4071],
    type: 'hospital',
    safetyRating: 4.9,
    isPopular: true
  },
  {
    id: '8',
    name: 'University of Hyderabad',
    address: 'Gachibowli, Hyderabad',
    coordinates: [17.4569, 78.3262],
    type: 'college',
    safetyRating: 4.3,
    isPopular: true
  },
  {
    id: '9',
    name: 'Banjara Hills',
    address: 'Banjara Hills, Hyderabad',
    coordinates: [17.4126, 78.4482],
    type: 'restaurant',
    safetyRating: 4.4,
    isPopular: true
  },
  {
    id: '10',
    name: 'Secunderabad Railway Station',
    address: 'Secunderabad, Hyderabad',
    coordinates: [17.4399, 78.5017],
    type: 'transport',
    safetyRating: 4.1,
    isPopular: true
  }
];

export default function EnhancedRouteFinder() {
  const { currentLanguage } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<Location | null>(null);
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [riskAlerts, setRiskAlerts] = useState<string[]>([]);
  const [showVoiceButton, setShowVoiceButton] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log('Location access denied, using default Hyderabad location');
          setCurrentLocation([17.3850, 78.4867]); // Default Hyderabad center
        }
      );
    }
  }, []);

  const filteredLocations = hyderabadLocations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const generateRouteOptions = (destination: Location): RouteOption[] => {
    if (!currentLocation) return [];

    // Generate 3 different route options
    return [
      {
        id: '1',
        name: 'Fastest Route',
        duration: '25 mins',
        distance: '8.5 km',
        safetyScore: 85,
        highlights: ['Well-lit roads', 'CCTV coverage', 'Police checkpoints'],
        waypoints: [
          currentLocation,
          [currentLocation[0] + 0.02, currentLocation[1] + 0.03],
          [destination.coordinates[0] - 0.01, destination.coordinates[1] - 0.01],
          destination.coordinates
        ],
        riskZones: [
          {
            coordinates: [currentLocation[0] + 0.01, currentLocation[1] + 0.02] as [number, number],
            type: 'medium',
            reason: 'Construction area - reduced lighting'
          }
        ]
      },
      {
        id: '2',
        name: 'Safest Route',
        duration: '32 mins',
        distance: '10.2 km',
        safetyScore: 95,
        highlights: ['Main roads only', 'High foot traffic', 'Well-patrolled area'],
        waypoints: [
          currentLocation,
          [currentLocation[0] + 0.03, currentLocation[1] + 0.02],
          [destination.coordinates[0] + 0.01, destination.coordinates[1]],
          destination.coordinates
        ],
        riskZones: []
      },
      {
        id: '3',
        name: 'Scenic Route',
        duration: '28 mins',
        distance: '9.1 km',
        safetyScore: 78,
        highlights: ['Lakeside road', 'Park areas', 'Good public transport'],
        waypoints: [
          currentLocation,
          [currentLocation[0] + 0.01, currentLocation[1] + 0.04],
          [destination.coordinates[0] - 0.02, destination.coordinates[1] + 0.01],
          destination.coordinates
        ],
        riskZones: [
          {
            coordinates: [currentLocation[0] + 0.015, currentLocation[1] + 0.035] as [number, number],
            type: 'high',
            reason: 'Isolated park area - avoid after 7 PM'
          }
        ]
      }
    ];
  };

  const handleDestinationSelect = (location: Location) => {
    setSelectedDestination(location);
    const routes = generateRouteOptions(location);
    setRouteOptions(routes);
    setSelectedRoute(null);

    // Voice announcement
    enhancedVoiceService.speakCustom(`Destination selected: ${location.name}. I found ${routes.length} route options for you. Choose the safest one!`);
  };

  const handleRouteSelect = (route: RouteOption) => {
    setSelectedRoute(route);
    checkRiskZones(route);

    // Voice announcement
    enhancedVoiceService.speakCustom(`${route.name} selected. Safety score: ${route.safetyScore} percent. ${route.riskZones.length > 0 ? 'Please be cautious in risk zones.' : 'This route looks safe!'}`);
  };

  const checkRiskZones = (route: RouteOption) => {
    const alerts: string[] = [];
    const timeOfDay = new Date().getHours();

    route.riskZones.forEach(zone => {
      if (zone.type === 'high') {
        alerts.push(`⚠️ High risk area ahead: ${zone.reason}`);
        playVoiceAlert(`Warning! High risk area detected. ${zone.reason}. Please be extra cautious.`);
        vibrateDevice([200, 100, 200]);
      } else if (zone.type === 'medium' && (timeOfDay >= 20 || timeOfDay <= 6)) {
        alerts.push(`⚠️ Caution: ${zone.reason}`);
        playVoiceAlert(`Caution: ${zone.reason}. Stay alert.`);
        vibrateDevice([100]);
      }
    });

    setRiskAlerts(alerts);
  };

  const getLocalizedMessage = (englishMessage: string): string => {
    const messages = {
      'Warning! High risk area detected.': {
        'hi': 'चेतावनी! उच्च जोखिम क्षेत्र का पता चला।',
        'te': 'హెచ్చరిక! అధిక ప్రమాద ప్రాంతం గుర్తించబడింది।',
        'ta': 'எச்சரிக்கை! அதிக ஆபத்து பகுதி கண்டறியப்பட்டது।',
        'kn': 'ಎಚ್ಚರಿಕೆ! ಹೆಚ್ಚಿನ ಅಪಾಯದ ಪ್ರದೇಶ ಪತ್ತೆಯಾಗಿದೆ।'
      },
      'Navigation started. Stay safe and stay alert.': {
        'hi': 'नेव��गेशन शुरू हुआ। सुरक्षित रहें और सतर्क रहें।',
        'te': 'నావిగేషన్ ప్రారంభమైంది. సురక్షితంగా ఉండండి మరియు అప్రమత్తంగా ఉండండి।',
        'ta': 'வழிசெலுத்தல் தொடங்கியது. பாதுகாப்பாக இருங்கள் மற்றும் விழிப்புடன் இருங்கள்।',
        'kn': 'ನ್ಯಾವಿಗೇಷನ್ ಪ್ರಾರಂಭವಾಯಿತು. ಸುರಕ್ಷಿತವಾಗಿರಿ ಮತ್ತು ಜಾಗರೂಕರಾಗಿರಿ।'
      },
      'You are on the safest route. Continue straight for 500 meters.': {
        'hi': 'आप सबसे सुरक्षित मार्ग पर हैं। 500 मीटर तक सीधे चलते रहें।',
        'te': 'మీరు అత్యంత సురక్షితమైన మార్గంలో ఉన్నారు. 500 మీటర్లు నేరుగా కొనసాగండి।',
        'ta': 'நீங்கள் பாதுகாப்பான வழியில் உள்ளீர்கள். 500 மீட்டர் நேராக தொடரவும்।',
        'kn': 'ನೀವು ಸುರಕ್ಷಿತ ಮಾರ್ಗದಲ್ಲಿದ್ದೀರಿ. 500 ಮೀಟರ್ ನೇರವಾಗಿ ಮ���ಂದುವರಿಯಿರಿ।'
      }
    };

    const baseMessage = Object.keys(messages).find(key => englishMessage.includes(key.split('.')[0]));
    if (baseMessage && messages[baseMessage as keyof typeof messages][currentLanguage as keyof (typeof messages)[keyof typeof messages]]) {
      return messages[baseMessage as keyof typeof messages][currentLanguage as keyof (typeof messages)[keyof typeof messages]];
    }
    return englishMessage;
  };

  const playVoiceAlert = (message: string) => {
    if ('speechSynthesis' in window) {
      const localizedMessage = getLocalizedMessage(message);
      const utterance = new SpeechSynthesisUtterance(localizedMessage);
      utterance.rate = currentLanguage === 'en' ? 0.9 : 0.8;
      utterance.pitch = currentLanguage === 'hi' ? 1.1 : 1.0;
      utterance.volume = 0.8;

      // Set language and find best voice
      const langCode = currentLanguage === 'en' ? 'en-IN' :
                      currentLanguage === 'hi' ? 'hi-IN' :
                      currentLanguage === 'te' ? 'te-IN' :
                      currentLanguage === 'ta' ? 'ta-IN' :
                      currentLanguage === 'kn' ? 'kn-IN' : 'en-IN';

      utterance.lang = langCode;

      const voices = speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang === langCode) ||
                   voices.find(v => v.lang.startsWith(langCode.split('-')[0]));

      if (voice) {
        utterance.voice = voice;
      }

      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    }
  };

  const vibrateDevice = (pattern: number[]) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const startNavigation = () => {
    if (!selectedRoute) return;
    
    setIsNavigating(true);
    playVoiceAlert('Navigation started. Stay safe and stay alert.');
    vibrateDevice([100, 50, 100]);

    // Simulate navigation updates
    setTimeout(() => {
      playVoiceAlert('You are on the safest route. Continue straight for 500 meters.');
    }, 3000);
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'mall': return <ShoppingBag className="w-4 h-4" />;
      case 'hospital': return <Shield className="w-4 h-4" />;
      case 'college': return <Building className="w-4 h-4" />;
      case 'office': return <Building className="w-4 h-4" />;
      case 'restaurant': return <Coffee className="w-4 h-4" />;
      case 'transport': return <Car className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getSafetyColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
          <Navigation className="w-6 h-6 text-primary" />
          Safe Routes in Hyderabad
        </h1>
        <p className="text-muted-foreground">
          Find the safest routes to your destination with voice alerts
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search destinations in Hyderabad..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (e.target.value.length > 0) {
              setShowVoiceButton(true);
              enhancedVoiceService.speakCustom('Searching for locations in Hyderabad');
            } else {
              setShowVoiceButton(false);
            }
          }}
          onFocus={() => {
            setShowVoiceButton(true);
            enhancedVoiceService.speakCustom('Search for your destination. I can help you find the safest routes!');
          }}
          className="pl-10 pr-12 rounded-2xl"
        />
        {showVoiceButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => enhancedVoiceService.speakCustom('Voice assistant is ready to help you navigate safely!')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-xl text-purple-500 z-[10]"
          >
            <Volume2 className="w-4 h-4" />
          </Button>
        )}
      </motion.div>

      {/* Risk Alerts */}
      <AnimatePresence>
        {riskAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-2"
          >
            {riskAlerts.map((alert, index) => (
              <Alert key={index} className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  {alert}
                </AlertDescription>
              </Alert>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Show locations only when searching */}
      {searchQuery.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold mb-3">
            {filteredLocations.length > 0 ? 'Found Locations' : 'Popular Destinations'}
          </h3>
          <div className="grid gap-3">
            {(filteredLocations.length > 0 ? filteredLocations : hyderabadLocations).slice(0, 8).map((location) => (
            <motion.div
              key={location.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleDestinationSelect(location)}
              className="glass rounded-xl p-4 cursor-pointer border border-primary/20 hover:border-primary/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {getLocationIcon(location.type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{location.name}</h4>
                    <p className="text-sm text-muted-foreground">{location.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {location.isPopular && (
                    <Badge variant="secondary" className="text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                  <Badge className={`text-xs ${getSafetyColor(location.safetyRating * 20)}`}>
                    {location.safetyRating}/5
                  </Badge>
                </div>
              </div>
            </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Map View - Always visible with expand/collapse */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isMapExpanded ? 'h-[70vh]' : 'h-80'} rounded-2xl overflow-hidden mb-6 relative transition-all duration-300 border border-primary/20`}
      >
        {/* Map Expand/Collapse Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setIsMapExpanded(!isMapExpanded);
            enhancedVoiceService.speakCustom(isMapExpanded ? 'Map minimized' : 'Map expanded for better navigation');
          }}
          className="absolute top-3 right-3 z-[1001] bg-white/95 hover:bg-white shadow-md border border-primary/30 rounded-lg backdrop-blur-sm"
        >
          {isMapExpanded ? (
            <>
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
              </svg>
              Minimize
            </>
          ) : (
            <>
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 11l7-7 7 7M5 19l7-7 7 7" />
              </svg>
              Expand
            </>
          )}
        </Button>
        {currentLocation && (
          <div className="h-full w-full relative z-[1]">
            <LeafletMap
              center={selectedDestination?.coordinates || currentLocation}
              zoom={selectedDestination ? 14 : 12}
              showSafePlaces={true}
              showIncidents={true}
              showHyderabadLocations={true}
              onPointClick={(coordinates) => {
                console.log('Point clicked:', coordinates);
                enhancedVoiceService.speakCustom('Location selected! You can mark this as safe or dangerous.');
                vibrateDevice([50]);
              }}
              className="h-full w-full rounded-2xl"
            />
          </div>
        )}
      </motion.div>

      {/* Route Options - Only show when destination is selected */}
      {routeOptions.length > 0 && selectedDestination && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold">Route Options to {selectedDestination?.name}</h3>
          <div className="space-y-3">
            {routeOptions.map((route) => (
              <motion.div
                key={route.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleRouteSelect(route)}
                className={`glass rounded-xl p-4 cursor-pointer border transition-all ${
                  selectedRoute?.id === route.id
                    ? 'border-primary bg-primary/5'
                    : 'border-primary/20 hover:border-primary/40'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Route className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold text-foreground">{route.name}</h4>
                  </div>
                  <Badge className={`${getSafetyColor(route.safetyScore)} border-0`}>
                    {route.safetyScore}% Safe
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{route.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{route.distance}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{route.riskZones.length} risks</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {route.highlights.map((highlight, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {highlight}
                    </Badge>
                  ))}
                </div>

                {route.riskZones.length > 0 && (
                  <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                      ⚠️ {route.riskZones.length} area(s) need extra caution
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {selectedRoute && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Button
                onClick={startNavigation}
                disabled={isNavigating}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                {isNavigating ? (
                  <>
                    <Zap className="w-5 h-5 mr-2 animate-pulse" />
                    Navigating...
                  </>
                ) : (
                  <>
                    <Navigation className="w-5 h-5 mr-2" />
                    Start Safe Navigation
                  </>
                )}
              </Button>

              <div className="glass rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-purple-500" />
                    Voice Alerts Enabled
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => enhancedVoiceService.speakCustom('Voice assistant is working perfectly! Ready to guide you safely.')}
                    className="rounded-lg border-purple-200 text-purple-600 hover:bg-purple-50 px-3 py-1"
                  >
                    <Volume2 className="w-3 h-3 mr-1" />
                    Test
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  You'll receive voice warnings when approaching risk zones
                </p>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-muted-foreground">
                    Vibration alerts are active
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}


    </div>
  );
}
