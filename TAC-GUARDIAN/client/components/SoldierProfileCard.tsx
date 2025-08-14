import { useState } from "react";
import { X, Heart, Thermometer, Activity, Battery, MapPin, Phone, Navigation, AlertTriangle, Eye } from "lucide-react";

export function SoldierProfileCard({ soldier, onClose, blackoutMode }: { 
  soldier: any; 
  onClose: () => void; 
  blackoutMode: boolean; 
}) {
  const [activeTab, setActiveTab] = useState("vitals");

  const handleDirectCall = () => {
    alert(`📞 DIRECT CALL INITIATED\n\nCalling ${soldier.name} (${soldier.id})\nUsing encrypted channel Alpha-7\nConnection established\nVoice quality: Excellent`);
  };

  const handleVideoCall = () => {
    alert(`📹 VIDEO CALL INITIATED\n\nVideo link with ${soldier.name}\nHelmet cam feed: Active\nBandwidth: Optimal\nFull situational awareness enabled`);
  };

  const handleSendWaypoint = () => {
    const waypoint = prompt("📍 Enter waypoint coordinates (e.g., 34.0522, -118.2437):");
    if (waypoint) {
      alert(`🧭 WAYPOINT SENT\n\nCoordinates: ${waypoint}\nSent to: ${soldier.name}\nNavigation updated\nRoute calculated and transmitted`);
    }
  };

  const handleEmergencyExtraction = () => {
    const confirm = window.confirm(`🚨 EMERGENCY EXTRACTION\n\nInitiate immediate extraction for ${soldier.name}?\nThis will deploy nearest extraction team.`);
    if (confirm) {
      alert(`🚁 EXTRACTION INITIATED\n\nEmergency extraction for ${soldier.name}\nNearest LZ: Charlie-7 (600m)\nExtraction team ETA: 4 minutes\nMedical team standing by`);
    }
  };

  const handleMedicalOverride = () => {
    alert(`🏥 MEDICAL OVERRIDE\n\nMedical override activated for ${soldier.name}\nOverriding field decisions\nMedical evacuation prioritized\nField medic en route`);
  };

  const handleEquipmentCheck = () => {
    alert(`🔧 EQUIPMENT CHECK\n\nRemote diagnostics initiated for ${soldier.name}\nWeapons system: Operational\nComms array: Functional\nMedical kit: Stocked\nBattery level: ${soldier.battery || 75}%`);
  };

  const handleShareLocation = () => {
    alert(`📍 LOCATION SHARED\n\n${soldier.name}'s position shared with team\nReal-time tracking enabled\nAll units updated\nCoordination improved`);
  };

  const handleDetailedVitals = () => {
    alert(`💓 DETAILED VITALS\n\n${soldier.name} - Full Medical Report:\n\nHeart Rate: ${soldier.hr} BPM (${soldier.hr > 120 ? 'Elevated' : 'Normal'})\nBody Temperature: ${soldier.temp || 98.6}°F\nBlood Pressure: 125/80 mmHg\nO2 Saturation: 97%\nHydration: 78%\nFatigue Level: Moderate`);
  };

  const vitalsData = [
    { time: "14:40", hr: soldier.hr, temp: soldier.temp || 98.6, stress: 65 },
    { time: "14:35", hr: soldier.hr - 5, temp: (soldier.temp || 98.6) - 0.2, stress: 55 },
    { time: "14:30", hr: soldier.hr - 8, temp: (soldier.temp || 98.6) - 0.3, stress: 45 },
    { time: "14:25", hr: soldier.hr - 12, temp: (soldier.temp || 98.6) - 0.5, stress: 35 },
    { time: "14:20", hr: soldier.hr - 15, temp: (soldier.temp || 98.6) - 0.6, stress: 30 }
  ];

  const equipmentStatus = [
    { item: "Primary Weapon", status: "Operational", level: 95 },
    { item: "Communication", status: "Operational", level: soldier.battery || 75 },
    { item: "GPS Unit", status: "Operational", level: 88 },
    { item: "Medical Kit", status: "Stocked", level: 92 },
    { item: "Night Vision", status: "Standby", level: 76 },
    { item: "Body Armor", status: "Intact", level: 100 }
  ];

  const getStatusColor = (status: string) => {
    switch (soldier.status) {
      case "critical": return "text-alert-red bg-alert-red/20 border-alert-red";
      case "elevated": return "text-neon-amber bg-neon-amber/20 border-neon-amber";
      default: return "text-cyborg-teal bg-cyborg-teal/20 border-cyborg-teal";
    }
  };

  const tabs = [
    { id: "vitals", label: "Vitals", icon: Heart },
    { id: "equipment", label: "Equipment", icon: Battery },
    { id: "location", label: "Location", icon: MapPin }
  ];

  return (
    <div className="glass-panel rounded-lg p-4 max-h-96 overflow-y-auto">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{soldier.photo || "👤"}</div>
          <div>
            <h3 className="font-bold text-white text-lg">
              {blackoutMode ? `UNIT-${soldier.id.split('-')[1]}` : soldier.name}
            </h3>
            <p className="text-gray-400 text-sm">{soldier.rank || "Soldier"} • {soldier.id}</p>
            <span className={`inline-block px-2 py-1 rounded text-xs border ${getStatusColor(soldier.status)}`}>
              {soldier.status.toUpperCase()}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Emergency Actions */}
      {soldier.status === "critical" && (
        <div className="mb-4 p-3 bg-alert-red/20 border border-alert-red rounded-lg">
          <h4 className="text-alert-red font-semibold mb-2 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-1" />
            Critical Status - Emergency Actions
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleEmergencyExtraction}
              className="px-2 py-1 bg-alert-red/30 text-alert-red rounded text-xs hover:bg-alert-red/50 transition-all duration-300 animate-pulse"
            >
              🚁 Emergency Extract
            </button>
            <button
              onClick={handleMedicalOverride}
              className="px-2 py-1 bg-alert-red/30 text-alert-red rounded text-xs hover:bg-alert-red/50 transition-all duration-300"
            >
              🏥 Medical Override
            </button>
          </div>
        </div>
      )}

      {/* Communication Actions */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={handleDirectCall}
          className="px-3 py-2 bg-cyborg-teal/20 border border-cyborg-teal text-cyborg-teal rounded-lg hover:bg-cyborg-teal/30 transition-all duration-300 text-sm flex items-center justify-center"
        >
          <Phone className="w-4 h-4 mr-1" />
          Direct Call
        </button>
        
        {!blackoutMode && (
          <button
            onClick={handleVideoCall}
            className="px-3 py-2 bg-neon-amber/20 border border-neon-amber text-neon-amber rounded-lg hover:bg-neon-amber/30 transition-all duration-300 text-sm flex items-center justify-center"
          >
            <Eye className="w-4 h-4 mr-1" />
            Video Link
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      {!blackoutMode && (
        <div className="flex space-x-1 mb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-300 text-sm ${
                  activeTab === tab.id
                    ? "bg-cyborg-teal/20 text-cyborg-teal"
                    : "text-gray-400 hover:text-cyborg-teal hover:bg-cyborg-teal/10"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "vitals" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-ghost-gray/30 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Heart className="w-4 h-4 text-alert-red" />
                <span className="text-sm text-gray-400">Heart Rate</span>
              </div>
              <span className="text-alert-red font-bold">{soldier.hr} BPM</span>
            </div>
            
            <div className="p-3 bg-ghost-gray/30 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Thermometer className="w-4 h-4 text-neon-amber" />
                <span className="text-sm text-gray-400">Temperature</span>
              </div>
              <span className="text-neon-amber font-bold">{soldier.temp || 98.6}°F</span>
            </div>
          </div>

          <button
            onClick={handleDetailedVitals}
            className="w-full px-3 py-2 bg-blue-400/20 border border-blue-400 text-blue-400 rounded-lg hover:bg-blue-400/30 transition-all duration-300 text-sm"
          >
            📊 Detailed Medical Report
          </button>

          {/* Vitals Trend */}
          <div>
            <h5 className="text-sm font-semibold text-cyborg-teal mb-2">Recent Vitals Trend</h5>
            <div className="space-y-1">
              {vitalsData.map((data, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">{data.time}</span>
                  <span className="text-alert-red">{data.hr} BPM</span>
                  <span className="text-neon-amber">{data.temp}°F</span>
                  <span className="text-cyborg-teal">{data.stress}% stress</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "equipment" && (
        <div className="space-y-3">
          {equipmentStatus.map((equipment, index) => (
            <div key={index} className="p-3 bg-ghost-gray/30 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-semibold text-sm">{equipment.item}</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  equipment.status === 'Operational' || equipment.status === 'Intact' || equipment.status === 'Stocked' 
                    ? 'bg-cyborg-teal/20 text-cyborg-teal' 
                    : 'bg-neon-amber/20 text-neon-amber'
                }`}>
                  {equipment.status}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      equipment.level > 70 ? 'bg-cyborg-teal' : 
                      equipment.level > 40 ? 'bg-neon-amber' : 'bg-alert-red'
                    }`}
                    style={{ width: `${equipment.level}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{equipment.level}%</span>
              </div>
            </div>
          ))}
          
          <button
            onClick={handleEquipmentCheck}
            className="w-full px-3 py-2 bg-cyborg-teal/20 border border-cyborg-teal text-cyborg-teal rounded-lg hover:bg-cyborg-teal/30 transition-all duration-300 text-sm"
          >
            �� Run Equipment Diagnostic
          </button>
        </div>
      )}

      {activeTab === "location" && (
        <div className="space-y-3">
          <div className="p-3 bg-ghost-gray/30 rounded-lg">
            <h5 className="text-sm font-semibold text-white mb-2">Current Position</h5>
            <p className="text-xs text-gray-400">Sector: {soldier.location || "Unknown"}</p>
            <p className="text-xs text-gray-400 font-mono">Grid: 34.0522, -118.2437</p>
            <p className="text-xs text-gray-400">Elevation: 245m</p>
            <p className="text-xs text-gray-400">Last Update: {soldier.lastSeen || "1 min ago"}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleSendWaypoint}
              className="px-2 py-1 bg-neon-amber/20 border border-neon-amber text-neon-amber rounded text-xs hover:bg-neon-amber/30 transition-all duration-300"
            >
              <Navigation className="w-3 h-3 inline mr-1" />
              Send Waypoint
            </button>
            
            <button
              onClick={handleShareLocation}
              className="px-2 py-1 bg-cyborg-teal/20 border border-cyborg-teal text-cyborg-teal rounded text-xs hover:bg-cyborg-teal/30 transition-all duration-300"
            >
              <MapPin className="w-3 h-3 inline mr-1" />
              Share Location
            </button>
          </div>

          {/* Location History */}
          <div>
            <h5 className="text-sm font-semibold text-cyborg-teal mb-2">Movement History</h5>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">14:40</span>
                <span className="text-white">Current: {soldier.location || "Sector 7-A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">14:35</span>
                <span className="text-gray-500">Previous: Sector 6-A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">14:30</span>
                <span className="text-gray-500">Checkpoint Bravo</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Contact for Critical Status */}
      {soldier.status === "critical" && (
        <div className="mt-4 p-2 bg-alert-red/20 rounded-lg">
          <p className="text-alert-red text-xs text-center animate-pulse">
            ⚠️ CRITICAL STATUS - MAINTAIN CONSTANT CONTACT ⚠️
          </p>
        </div>
      )}
    </div>
  );
}
