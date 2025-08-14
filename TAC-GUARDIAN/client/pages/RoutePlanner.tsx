import { Navigation } from "@/components/Navigation";
import { useState, useEffect } from "react";
import { Route, MapPin, Navigation as NavigationIcon, Fuel, Clock, AlertTriangle, Zap, Truck, Plane } from "lucide-react";

// Mock route data
const currentRoute = {
  id: "ROUTE-ALPHA-001",
  name: "Primary Extraction Route",
  distance: "12.4 km",
  estimatedTime: "18 minutes",
  fuelConsumption: "2.1L",
  threatLevel: 65,
  status: "ACTIVE",
  waypoints: [
    { id: 1, name: "LZ Alpha", coordinates: "34.0522, -118.2437", type: "start", eta: "00:00", status: "completed" },
    { id: 2, name: "Checkpoint Bravo", coordinates: "34.0545, -118.2401", type: "checkpoint", eta: "00:06", status: "completed" },
    { id: 3, name: "Bridge Charlie", coordinates: "34.0567, -118.2365", type: "bridge", eta: "00:11", status: "current" },
    { id: 4, name: "Sector Delta", coordinates: "34.0589, -118.2329", type: "checkpoint", eta: "00:15", status: "pending" },
    { id: 5, name: "Extraction Point", coordinates: "34.0612, -118.2293", type: "destination", eta: "00:18", status: "pending" }
  ]
};

const aiOptimizedRoute = {
  id: "ROUTE-AI-OPTIMIZED",
  name: "AI Optimized Safe Route",
  distance: "15.8 km",
  estimatedTime: "22 minutes", 
  fuelConsumption: "2.8L",
  threatLevel: 25,
  status: "RECOMMENDED",
  improvementReason: "Avoids high-threat zones in sectors 7-B and 5-A",
  waypoints: [
    { id: 1, name: "LZ Alpha", coordinates: "34.0522, -118.2437", type: "start", eta: "00:00", status: "pending" },
    { id: 2, name: "Safe House Echo", coordinates: "34.0498, -118.2456", type: "safe_house", eta: "00:05", status: "pending" },
    { id: 3, name: "Bypass Route Fox", coordinates: "34.0534, -118.2398", type: "bypass", eta: "00:12", status: "pending" },
    { id: 4, name: "Cover Point Golf", coordinates: "34.0578, -118.2342", type: "cover", eta: "00:17", status: "pending" },
    { id: 5, name: "Extraction Point", coordinates: "34.0612, -118.2293", type: "destination", eta: "00:22", status: "pending" }
  ]
};

const vehicles = [
  { id: "VHC-001", name: "Armored Personnel Carrier", type: "APC", fuel: 78, speed: "45 km/h", capacity: 12, status: "AVAILABLE" },
  { id: "VHC-002", name: "Light Tactical Vehicle", type: "LTV", fuel: 92, speed: "80 km/h", capacity: 6, status: "ACTIVE" },
  { id: "VHC-003", name: "Medical Evacuation Unit", type: "MEDIVAC", fuel: 56, speed: "60 km/h", capacity: 4, status: "AVAILABLE" },
  { id: "VHC-004", name: "Supply Transport", type: "TRANSPORT", fuel: 34, speed: "50 km/h", capacity: 20, status: "MAINTENANCE" },
];

const reroutingLog = [
  { time: "14:35:22", event: "Threat zone detected in sector 7-B", action: "Rerouting Alpha-1 through bypass", status: "COMPLETED" },
  { time: "14:32:15", event: "Bridge Charlie structural damage", action: "Alternative crossing point selected", status: "COMPLETED" },
  { time: "14:28:45", event: "Civilian convoy blocking main route", action: "Temporary delay, holding position", status: "RESOLVED" },
  { time: "14:25:33", event: "Weather condition update", action: "Route timing adjusted for visibility", status: "COMPLETED" },
];

const fuelConsumptionData = [
  { segment: "LZ Alpha → Checkpoint Bravo", distance: "2.8 km", fuel: "0.4L", efficiency: "7.0 km/L" },
  { segment: "Checkpoint Bravo → Bridge Charlie", distance: "3.1 km", fuel: "0.5L", efficiency: "6.2 km/L" },
  { segment: "Bridge Charlie → Sector Delta", distance: "3.4 km", fuel: "0.6L", efficiency: "5.7 km/L" },
  { segment: "Sector Delta → Extraction", distance: "3.1 km", fuel: "0.6L", efficiency: "5.2 km/L" },
];

export default function RoutePlanner() {
  const [selectedRoute, setSelectedRoute] = useState<"current" | "optimized">("current");
  const [selectedVehicle, setSelectedVehicle] = useState(vehicles[1]);
  const [showFuelOverlay, setShowFuelOverlay] = useState(false);

  const route = selectedRoute === "current" ? currentRoute : aiOptimizedRoute;

  const getWaypointIcon = (type: string) => {
    switch (type) {
      case "start": return "🏁";
      case "destination": return "🎯";
      case "checkpoint": return "🔍";
      case "bridge": return "🌉";
      case "safe_house": return "🏠";
      case "bypass": return "↗️";
      case "cover": return "🛡️";
      default: return "📍";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-cyborg-teal bg-cyborg-teal/20";
      case "current": return "text-neon-amber bg-neon-amber/20 pulse-animation";
      case "pending": return "text-gray-400 bg-gray-400/20";
      default: return "text-gray-400 bg-gray-400/20";
    }
  };

  const getThreatColor = (level: number) => {
    if (level >= 60) return "text-alert-red";
    if (level >= 30) return "text-neon-amber";
    return "text-cyborg-teal";
  };

  const handleRouteSwitch = () => {
    setSelectedRoute(selectedRoute === "current" ? "optimized" : "current");
  };

  const handleDeployDrone = () => {
    alert("Recon drone deployed to scout ahead on selected route");
  };

  const handleEmergencyReroute = () => {
    alert("Emergency rerouting initiated - calculating fastest safe route");
  };

  return (
    <div className="min-h-screen bg-void text-cyborg-teal">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-cyborg-teal neon-glow">Route & Evac Planner</h1>
            <p className="text-gray-400 mt-2">The Escape Artist - AI-Optimized Route Planning</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400 font-mono">
              Active Routes: {vehicles.filter(v => v.status === 'ACTIVE').length}
            </div>
            <div className="w-2 h-2 bg-cyborg-teal rounded-full pulse-animation"></div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel - Route Comparison */}
          <div className="col-span-4">
            <div className="glass-panel rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-cyborg-teal mb-4 flex items-center">
                <Route className="w-5 h-5 mr-2" />
                Route Comparison
              </h3>

              {/* Current Route */}
              <div className={`p-4 rounded-lg border mb-4 cursor-pointer transition-all duration-300 ${
                selectedRoute === "current" 
                  ? 'bg-cyborg-teal/20 border-cyborg-teal neon-glow' 
                  : 'bg-ghost-gray/30 border-gray-600 hover:border-cyborg-teal/50'
              }`} onClick={() => setSelectedRoute("current")}>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-white">Current Route</h4>
                  <span className="text-xs px-2 py-1 bg-cyborg-teal/20 text-cyborg-teal rounded">ACTIVE</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-cyborg-teal" />
                    <span className="text-gray-300">{currentRoute.distance}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-neon-amber" />
                    <span className="text-gray-300">{currentRoute.estimatedTime}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Fuel className="w-3 h-3 text-blue-400" />
                    <span className="text-gray-300">{currentRoute.fuelConsumption}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <AlertTriangle className={`w-3 h-3 ${getThreatColor(currentRoute.threatLevel)}`} />
                    <span className={getThreatColor(currentRoute.threatLevel)}>{currentRoute.threatLevel}%</span>
                  </div>
                </div>
              </div>

              {/* AI Optimized Route */}
              <div className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                selectedRoute === "optimized" 
                  ? 'bg-cyborg-teal/20 border-cyborg-teal neon-glow' 
                  : 'bg-ghost-gray/30 border-gray-600 hover:border-cyborg-teal/50'
              }`} onClick={() => setSelectedRoute("optimized")}>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-white">AI Optimized</h4>
                  <span className="text-xs px-2 py-1 bg-neon-amber/20 text-neon-amber rounded">RECOMMENDED</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-cyborg-teal" />
                    <span className="text-gray-300">{aiOptimizedRoute.distance}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-neon-amber" />
                    <span className="text-gray-300">{aiOptimizedRoute.estimatedTime}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Fuel className="w-3 h-3 text-blue-400" />
                    <span className="text-gray-300">{aiOptimizedRoute.fuelConsumption}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <AlertTriangle className={`w-3 h-3 ${getThreatColor(aiOptimizedRoute.threatLevel)}`} />
                    <span className={getThreatColor(aiOptimizedRoute.threatLevel)}>{aiOptimizedRoute.threatLevel}%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 italic">{aiOptimizedRoute.improvementReason}</p>
              </div>

              <button 
                onClick={handleRouteSwitch}
                className="w-full mt-4 px-4 py-2 bg-cyborg-teal/20 border border-cyborg-teal text-cyborg-teal rounded-lg hover:bg-cyborg-teal/30 transition-all duration-300"
              >
                Switch to {selectedRoute === "current" ? "AI Optimized" : "Current"} Route
              </button>
            </div>

            {/* Vehicle Selection */}
            <div className="glass-panel rounded-lg p-4">
              <h3 className="text-lg font-semibold text-cyborg-teal mb-4 flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Vehicle Fleet
              </h3>
              <div className="space-y-3">
                {vehicles.map((vehicle) => (
                  <div 
                    key={vehicle.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-300 ${
                      selectedVehicle.id === vehicle.id 
                        ? 'bg-cyborg-teal/20 border-cyborg-teal' 
                        : 'bg-ghost-gray/30 border-gray-600 hover:border-cyborg-teal/50'
                    } ${vehicle.status === 'MAINTENANCE' ? 'opacity-50' : ''}`}
                    onClick={() => vehicle.status !== 'MAINTENANCE' && setSelectedVehicle(vehicle)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-white text-sm">{vehicle.name}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        vehicle.status === 'AVAILABLE' ? 'bg-cyborg-teal/20 text-cyborg-teal' :
                        vehicle.status === 'ACTIVE' ? 'bg-neon-amber/20 text-neon-amber' :
                        'bg-alert-red/20 text-alert-red'
                      }`}>
                        {vehicle.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-gray-400">Fuel: <span className="text-blue-400">{vehicle.fuel}%</span></div>
                      <div className="text-gray-400">Speed: <span className="text-white">{vehicle.speed}</span></div>
                      <div className="text-gray-400">Capacity: <span className="text-white">{vehicle.capacity}</span></div>
                      <div className="text-gray-400">Type: <span className="text-white">{vehicle.type}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center Panel - Route Visualization */}
          <div className="col-span-5">
            <div className="glass-panel rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-cyborg-teal">{route.name}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowFuelOverlay(!showFuelOverlay)}
                    className={`px-3 py-1 text-xs rounded transition-all duration-300 ${
                      showFuelOverlay 
                        ? 'bg-blue-400/20 text-blue-400 border border-blue-400' 
                        : 'bg-ghost-gray/30 text-gray-400 border border-gray-600'
                    }`}
                  >
                    Fuel Overlay
                  </button>
                </div>
              </div>

              {/* Route Map Visualization */}
              <div className="bg-ghost-gray/20 rounded-lg p-6 h-80 relative overflow-hidden border border-cyborg-teal/30">
                <div className="absolute inset-0 bg-gradient-to-br from-cyborg-teal/5 to-alert-red/5"></div>
                
                {/* Animated route line */}
                <svg className="absolute inset-0 w-full h-full">
                  <defs>
                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#FF2E4D" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 50 50 Q 150 100 250 80 Q 350 120 450 90"
                    stroke="url(#routeGradient)"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="10,5"
                    className="animate-pulse"
                  />
                </svg>

                {/* Waypoints */}
                {route.waypoints.map((waypoint, index) => (
                  <div 
                    key={waypoint.id}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${getStatusColor(waypoint.status)} rounded-full p-2 border`}
                    style={{ 
                      left: `${20 + (index * 15)}%`, 
                      top: `${30 + (index % 2) * 20}%` 
                    }}
                  >
                    <div className="text-center">
                      <div className="text-lg">{getWaypointIcon(waypoint.type)}</div>
                      <div className="text-xs font-semibold mt-1">{waypoint.name}</div>
                      <div className="text-xs text-gray-400">{waypoint.eta}</div>
                    </div>
                  </div>
                ))}

                {/* Moving vehicle indicator */}
                <div className="absolute w-4 h-4 bg-cyborg-teal rounded-full animate-pulse" style={{ left: '35%', top: '35%' }}>
                  <div className="absolute -top-1 -left-1 w-6 h-6 bg-cyborg-teal/30 rounded-full animate-ping"></div>
                </div>

                {/* Threat zones */}
                <div className="absolute w-16 h-16 bg-alert-red/20 rounded-full border-2 border-alert-red/50 animate-pulse" style={{ left: '60%', top: '20%' }}>
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-alert-red font-bold">
                    THREAT
                  </div>
                </div>
              </div>

              {/* Waypoint Details */}
              <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                {route.waypoints.map((waypoint, index) => (
                  <div key={waypoint.id} className="flex items-center space-x-3 p-2 bg-ghost-gray/30 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(waypoint.status)}`}>
                      {waypoint.id}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white text-sm">{waypoint.name}</div>
                      <div className="text-xs text-gray-400">{waypoint.coordinates}</div>
                    </div>
                    <div className="text-xs text-gray-400">ETA: {waypoint.eta}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Controls & Logs */}
          <div className="col-span-3 space-y-4">
            <div className="glass-panel rounded-lg p-4">
              <h3 className="text-lg font-semibold text-cyborg-teal mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={handleDeployDrone}
                  className="w-full px-3 py-2 bg-cyborg-teal/20 border border-cyborg-teal text-cyborg-teal rounded-lg hover:bg-cyborg-teal/30 transition-all duration-300 text-sm"
                >
                  <Plane className="w-4 h-4 inline mr-2" />
                  Deploy Recon Drone
                </button>
                <button 
                  onClick={handleEmergencyReroute}
                  className="w-full px-3 py-2 bg-alert-red/20 border border-alert-red text-alert-red rounded-lg hover:bg-alert-red/30 transition-all duration-300 text-sm"
                >
                  <Zap className="w-4 h-4 inline mr-2" />
                  Emergency Reroute
                </button>
                <button className="w-full px-3 py-2 bg-neon-amber/20 border border-neon-amber text-neon-amber rounded-lg hover:bg-neon-amber/30 transition-all duration-300 text-sm">
                  <NavigationIcon className="w-4 h-4 inline mr-2" />
                  Update Waypoints
                </button>
              </div>
            </div>

            {/* Rerouting Log */}
            <div className="glass-panel rounded-lg p-4">
              <h3 className="text-lg font-semibold text-cyborg-teal mb-4">Rerouting Log</h3>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {reroutingLog.map((log, index) => (
                  <div key={index} className="p-3 bg-ghost-gray/30 rounded-lg">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-mono text-gray-400">{log.time}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        log.status === 'COMPLETED' ? 'bg-cyborg-teal/20 text-cyborg-teal' :
                        log.status === 'RESOLVED' ? 'bg-neon-amber/20 text-neon-amber' :
                        'bg-alert-red/20 text-alert-red'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-1">{log.event}</p>
                    <p className="text-xs text-gray-400 italic">{log.action}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Fuel Consumption */}
            {showFuelOverlay && (
              <div className="glass-panel rounded-lg p-4">
                <h3 className="text-lg font-semibold text-cyborg-teal mb-4 flex items-center">
                  <Fuel className="w-5 h-5 mr-2" />
                  Fuel Analysis
                </h3>
                <div className="space-y-2">
                  {fuelConsumptionData.map((segment, index) => (
                    <div key={index} className="text-xs">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-400">{segment.segment}</span>
                        <span className="text-blue-400">{segment.fuel}</span>
                      </div>
                      <div className="text-gray-500">{segment.distance} • {segment.efficiency}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Consumption:</span>
                    <span className="text-blue-400 font-bold">{route.fuelConsumption}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
