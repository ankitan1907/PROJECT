import { useState } from "react";
import { Activity, Heart, Thermometer, Battery, MapPin, AlertTriangle, Eye, MessageSquare, Navigation } from "lucide-react";

const soldiers = [
  { 
    id: "TAC-1058", 
    name: "SGT Alpha Marcus", 
    rank: "Sergeant",
    photo: "👤",
    status: "normal", 
    hr: 85, 
    temp: 98.6, 
    battery: 78, 
    lastSeen: "2 min ago",
    location: "Sector 7-A",
    mission: "Patrol Route Alpha"
  },
  { 
    id: "TAC-2041", 
    name: "CPL Bravo Johnson", 
    rank: "Corporal",
    photo: "👤",
    status: "elevated", 
    hr: 115, 
    temp: 99.2, 
    battery: 45, 
    lastSeen: "30 sec ago",
    location: "Sector 5-B",
    mission: "Overwatch Position"
  },
  { 
    id: "TAC-3092", 
    name: "PVT Charlie Williams", 
    rank: "Private",
    photo: "👤",
    status: "critical", 
    hr: 165, 
    temp: 101.8, 
    battery: 12, 
    lastSeen: "1 min ago",
    location: "Sector 3-C",
    mission: "Medical Evacuation"
  },
  { 
    id: "TAC-4015", 
    name: "SGT Delta Rodriguez", 
    rank: "Sergeant",
    photo: "👤",
    status: "normal", 
    hr: 78, 
    temp: 98.1, 
    battery: 92, 
    lastSeen: "45 sec ago",
    location: "Sector 9-D",
    mission: "Supply Drop"
  },
  { 
    id: "TAC-5023", 
    name: "CPL Echo Thompson", 
    rank: "Corporal",
    photo: "👤",
    status: "elevated", 
    hr: 108, 
    temp: 99.0, 
    battery: 67, 
    lastSeen: "3 min ago",
    location: "Sector 2-E",
    mission: "Reconnaissance"
  },
  { 
    id: "TAC-6017", 
    name: "PVT Foxtrot Chen", 
    rank: "Private",
    photo: "👤",
    status: "normal", 
    hr: 82, 
    temp: 98.3, 
    battery: 88, 
    lastSeen: "1 min ago",
    location: "Sector 6-F",
    mission: "Perimeter Security"
  },
];

export function MultiSoldierView({ onSoldierSelect, blackoutMode }: { 
  onSoldierSelect: (soldier: any) => void; 
  blackoutMode: boolean; 
}) {
  const [selectedSoldier, setSelectedSoldier] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"summary" | "detailed">("summary");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical": return "text-alert-red";
      case "elevated": return "text-neon-amber";
      default: return "text-cyborg-teal";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "critical": return "bg-alert-red/20 border-alert-red/50";
      case "elevated": return "bg-neon-amber/20 border-neon-amber/50";
      default: return "bg-cyborg-teal/20 border-cyborg-teal/50";
    }
  };

  const handleSoldierClick = (soldier: any) => {
    setSelectedSoldier(selectedSoldier === soldier.id ? null : soldier.id);
    onSoldierSelect(soldier);
  };

  const handleTrackSoldier = (soldier: any) => {
    alert(`📍 TRACKING ACTIVATED\n\nNow tracking ${soldier.name}\nLocation: ${soldier.location}\nGPS coordinates logged\nReal-time position updates enabled`);
  };

  const handleMessageSoldier = (soldier: any) => {
    const message = prompt(`📱 Send message to ${soldier.name}:`);
    if (message) {
      alert(`✅ MESSAGE SENT\n\nTo: ${soldier.name}\nMessage: "${message}"\nDelivery: Confirmed\nRead receipt: Pending`);
    }
  };

  const handleMedicalAlert = (soldier: any) => {
    alert(`🚑 MEDICAL ALERT ACTIVATED\n\nPatient: ${soldier.name}\nVitals: HR ${soldier.hr}, Temp ${soldier.temp}°F\nMedic Team Charlie dispatched\nETA: 4 minutes`);
  };

  const handleNavigateTo = (soldier: any) => {
    alert(`🧭 NAVIGATION SET\n\nDestination: ${soldier.location}\nRoute calculated to ${soldier.name}\nDistance: 1.2km\nETA: 8 minutes`);
  };

  const handleEmergencyEvac = (soldier: any) => {
    alert(`🚨 EMERGENCY EVACUATION\n\n${soldier.name} marked for immediate extraction\nNearest LZ: Charlie-7 (400m)\nEvac bird ETA: 6 minutes\nMedical team standing by`);
  };

  const handleVitalsMonitor = (soldier: any) => {
    alert(`💓 VITALS MONITORING\n\n${soldier.name} - Enhanced monitoring activated\nHeart Rate: ${soldier.hr} BPM (${soldier.hr > 120 ? 'HIGH' : soldier.hr > 100 ? 'ELEVATED' : 'NORMAL'})\nTemperature: ${soldier.temp}°F (${soldier.temp > 100 ? 'FEVER' : 'NORMAL'})\nAlert thresholds set`);
  };

  const filteredSoldiers = blackoutMode 
    ? soldiers.filter(s => s.status === "critical")
    : soldiers;

  return (
    <div className="glass-panel rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-semibold flex items-center ${
          blackoutMode ? 'text-alert-red' : 'text-cyborg-teal'
        }`}>
          <Activity className="w-5 h-5 mr-2" />
          {blackoutMode ? 'Critical Personnel' : 'Active Personnel'}
        </h3>
        
        {!blackoutMode && (
          <div className="flex space-x-1">
            <button
              onClick={() => setViewMode("summary")}
              className={`px-2 py-1 text-xs rounded transition-all duration-300 ${
                viewMode === "summary"
                  ? 'bg-cyborg-teal/20 text-cyborg-teal'
                  : 'bg-ghost-gray/20 text-gray-400 hover:text-cyborg-teal'
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setViewMode("detailed")}
              className={`px-2 py-1 text-xs rounded transition-all duration-300 ${
                viewMode === "detailed"
                  ? 'bg-cyborg-teal/20 text-cyborg-teal'
                  : 'bg-ghost-gray/20 text-gray-400 hover:text-cyborg-teal'
              }`}
            >
              Detailed
            </button>
          </div>
        )}
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredSoldiers.map((soldier) => (
          <div 
            key={soldier.id}
            className={`p-3 rounded-lg border cursor-pointer transition-all duration-300 hover:scale-105 ${
              getStatusBg(soldier.status)
            } ${selectedSoldier === soldier.id ? 'ring-2 ring-cyborg-teal' : ''}`}
            onClick={() => handleSoldierClick(soldier)}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{soldier.photo}</div>
                <div>
                  <div className="font-semibold text-white">
                    {blackoutMode ? `UNIT-${soldier.id.split('-')[1]}` : soldier.name}
                  </div>
                  <div className="text-xs text-gray-400 font-mono">
                    {soldier.rank} • {soldier.id}
                  </div>
                  {!blackoutMode && (
                    <div className="text-xs text-gray-500">{soldier.mission}</div>
                  )}
                </div>
              </div>
              <div className={`text-xs px-2 py-1 rounded ${getStatusColor(soldier.status)} border border-current`}>
                {soldier.status.toUpperCase()}
              </div>
            </div>
            
            {viewMode === "detailed" && (
              <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                <div className="flex items-center space-x-1">
                  <Heart className="w-3 h-3 text-alert-red" />
                  <span className="text-gray-300">{soldier.hr} BPM</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Thermometer className="w-3 h-3 text-neon-amber" />
                  <span className="text-gray-300">{soldier.temp}°F</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Battery className="w-3 h-3 text-cyborg-teal" />
                  <span className="text-gray-300">{soldier.battery}%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-300 truncate">{soldier.location}</span>
                </div>
              </div>
            )}
            
            {selectedSoldier === soldier.id && (
              <div className="mt-3 pt-3 border-t border-gray-600">
                <div className="text-xs text-gray-400 mb-3">
                  Last Contact: {soldier.lastSeen}
                </div>
                
                {/* Quick Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTrackSoldier(soldier);
                    }}
                    className="px-2 py-1 bg-cyborg-teal/30 text-cyborg-teal text-xs rounded hover:bg-cyborg-teal/50 transition-colors flex items-center justify-center"
                  >
                    <MapPin className="w-3 h-3 mr-1" />
                    Track
                  </button>
                  
                  {!blackoutMode && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMessageSoldier(soldier);
                      }}
                      className="px-2 py-1 bg-neon-amber/30 text-neon-amber text-xs rounded hover:bg-neon-amber/50 transition-colors flex items-center justify-center"
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Message
                    </button>
                  )}
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVitalsMonitor(soldier);
                    }}
                    className="px-2 py-1 bg-blue-400/30 text-blue-400 text-xs rounded hover:bg-blue-400/50 transition-colors flex items-center justify-center"
                  >
                    <Activity className="w-3 h-3 mr-1" />
                    Vitals
                  </button>
                  
                  {!blackoutMode && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigateTo(soldier);
                      }}
                      className="px-2 py-1 bg-purple-400/30 text-purple-400 text-xs rounded hover:bg-purple-400/50 transition-colors flex items-center justify-center"
                    >
                      <Navigation className="w-3 h-3 mr-1" />
                      Navigate
                    </button>
                  )}
                  
                  {soldier.status === "critical" && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEmergencyEvac(soldier);
                      }}
                      className="px-2 py-1 bg-alert-red/30 text-alert-red text-xs rounded hover:bg-alert-red/50 transition-colors flex items-center justify-center animate-pulse col-span-2"
                    >
                      🚨 Emergency Evac
                    </button>
                  )}
                  
                  {soldier.status === "elevated" && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMedicalAlert(soldier);
                      }}
                      className="px-2 py-1 bg-alert-red/30 text-alert-red text-xs rounded hover:bg-alert-red/50 transition-colors flex items-center justify-center col-span-2"
                    >
                      🚑 Medical Alert
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-600">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">
            {blackoutMode ? 'Critical:' : 'Active:'}
          </span>
          <span className={blackoutMode ? 'text-alert-red' : 'text-cyborg-teal'}>
            {filteredSoldiers.length}/{soldiers.length}
          </span>
        </div>
        
        {!blackoutMode && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                alert("📊 TEAM DIAGNOSTICS\n\nRunning full team health scan...\nEstimated completion: 30 seconds\nWill alert on any anomalies detected");
              }}
              className="px-2 py-1 bg-cyborg-teal/20 text-cyborg-teal text-xs rounded hover:bg-cyborg-teal/30 transition-all duration-300"
            >
              <Eye className="w-3 h-3 inline mr-1" />
              Team Scan
            </button>
            <button
              onClick={() => {
                alert("📍 FORMATION UPDATE\n\nAll units report current positions\nEstablishing optimal formation\nMinimizing exposure to threats");
              }}
              className="px-2 py-1 bg-neon-amber/20 text-neon-amber text-xs rounded hover:bg-neon-amber/30 transition-all duration-300"
            >
              <Navigation className="w-3 h-3 inline mr-1" />
              Formation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
