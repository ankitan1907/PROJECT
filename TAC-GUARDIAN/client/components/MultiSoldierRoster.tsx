import { useState, useEffect } from "react";
import { Activity, Heart, Shield, Radio, MapPin, Eye, Zap } from "lucide-react";
import { showMissionModal, showSuccessModal } from "./ModalNotification";

const soldiers = [
  { 
    id: "TAC-1058", 
    name: "Marcus Reynolds", 
    rank: "Sergeant",
    avatar: "👤",
    status: "normal", 
    hr: 85, 
    temp: 98.6, 
    battery: 78, 
    encryption: "AES-256",
    threatProximity: "SAFE",
    lastAction: "Checkpoint secured",
    mission: "Patrol Route Alpha",
    coordinates: "34.0522, -118.2437"
  },
  { 
    id: "TAC-2041", 
    name: "Sarah Chen", 
    rank: "Corporal",
    avatar: "👤",
    status: "elevated", 
    hr: 115, 
    temp: 99.2, 
    battery: 45, 
    encryption: "AES-192",
    threatProximity: "CAUTION",
    lastAction: "Visual on hostiles",
    mission: "Overwatch Position",
    coordinates: "34.0545, -118.2401"
  },
  { 
    id: "TAC-3092", 
    name: "James Wilson", 
    rank: "Private",
    avatar: "👤",
    status: "critical", 
    hr: 165, 
    temp: 101.8, 
    battery: 12, 
    encryption: "AES-128",
    threatProximity: "DANGER",
    lastAction: "Under fire",
    mission: "Emergency Extraction",
    coordinates: "34.0567, -118.2365"
  },
  { 
    id: "TAC-4015", 
    name: "Alex Torres", 
    rank: "Staff Sergeant",
    avatar: "👤",
    status: "normal", 
    hr: 78, 
    temp: 98.1, 
    battery: 92, 
    encryption: "AES-256",
    threatProximity: "SAFE",
    lastAction: "Package delivered",
    mission: "Supply Drop Complete",
    coordinates: "34.0589, -118.2329"
  },
  { 
    id: "TAC-5023", 
    name: "Riley Foster", 
    rank: "Lieutenant",
    avatar: "👤",
    status: "elevated", 
    hr: 108, 
    temp: 99.0, 
    battery: 67, 
    encryption: "AES-256",
    threatProximity: "CAUTION",
    lastAction: "Recon in progress",
    mission: "Intelligence Gathering",
    coordinates: "34.0498, -118.2456"
  },
  { 
    id: "TAC-6017", 
    name: "Jordan Kim", 
    rank: "Medic",
    avatar: "👤",
    status: "normal", 
    hr: 82, 
    temp: 98.3, 
    battery: 88, 
    encryption: "AES-256",
    threatProximity: "SAFE",
    lastAction: "Medical check complete",
    mission: "Medical Support",
    coordinates: "34.0534, -118.2398"
  },
];

export function MultiSoldierRoster({ onSoldierSelect, blackoutMode }: { 
  onSoldierSelect: (soldier: any) => void; 
  blackoutMode: boolean; 
}) {
  const [selectedSoldier, setSelectedSoldier] = useState<string | null>(null);
  const [soldierData, setSoldierData] = useState(soldiers);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSoldierData(prev => prev.map(soldier => ({
        ...soldier,
        hr: soldier.hr + (Math.random() - 0.5) * 6,
        battery: Math.max(0, soldier.battery - Math.random() * 0.5)
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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

  const getThreatColor = (threat: string) => {
    switch (threat) {
      case "DANGER": return "text-alert-red animate-pulse";
      case "CAUTION": return "text-neon-amber";
      default: return "text-cyborg-teal";
    }
  };

  const handleSoldierClick = (soldier: any) => {
    setSelectedSoldier(selectedSoldier === soldier.id ? null : soldier.id);
    onSoldierSelect(soldier);
    
    // Show detailed profile modal
    showMissionModal(
      `${soldier.rank} ${soldier.name}`,
      `Full Personnel Profile\n\n• Status: ${soldier.status.toUpperCase()}\n• Heart Rate: ${Math.round(soldier.hr)} BPM\n• Temperature: ${soldier.temp}°F\n• Battery: ${Math.round(soldier.battery)}%\n• Encryption: ${soldier.encryption}\n• Threat Proximity: ${soldier.threatProximity}\n• Last Action: ${soldier.lastAction}\n• Current Mission: ${soldier.mission}\n• Coordinates: ${soldier.coordinates}`,
      [
        { label: "Direct Contact", action: () => handleDirectContact(soldier), variant: "primary" },
        { label: "Track Location", action: () => handleTrackLocation(soldier), variant: "secondary" },
        ...(soldier.status === "critical" ? [{ label: "Emergency Evac", action: () => handleEmergencyEvac(soldier), variant: "danger" }] : [])
      ]
    );
  };

  const handleDirectContact = (soldier: any) => {
    showSuccessModal(
      "📞 DIRECT CONTACT ESTABLISHED",
      `Secure channel opened with ${soldier.name}\n\n• Channel: Encrypted Alpha-7\n• Signal Quality: Excellent\n• Response Time: <1s\n• Connection Status: SECURE`
    );
  };

  const handleTrackLocation = (soldier: any) => {
    showSuccessModal(
      "📍 TRACKING ACTIVATED",
      `Real-time tracking enabled for ${soldier.name}\n\n• GPS Lock: CONFIRMED\n• Update Interval: 5 seconds\n• Movement History: LOGGED\n• Geofence Alerts: ACTIVE`
    );
  };

  const handleEmergencyEvac = (soldier: any) => {
    showMissionModal(
      "🚨 EMERGENCY EVACUATION",
      `Immediate extraction protocol for ${soldier.name}\n\n• Nearest LZ: Charlie-7 (400m)\n• Medical Team: En Route\n• ETA: 6 minutes\n• Evac Status: PRIORITY ONE`,
      [
        { label: "AUTHORIZE EVAC", action: () => {
          showSuccessModal("🚁 EVAC AUTHORIZED", `Emergency extraction approved for ${soldier.name}\n\n• Helicopter dispatched\n• Medical team ready\n• Extraction in progress`);
        }, variant: "danger" },
        { label: "Hold Position", action: () => {}, variant: "secondary" }
      ]
    );
  };

  const filteredSoldiers = blackoutMode 
    ? soldierData.filter(s => s.status === "critical")
    : soldierData;

  return (
    <div className="glass-panel rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-semibold flex items-center ${
          blackoutMode ? 'text-alert-red' : 'text-cyborg-teal'
        }`}>
          <Activity className="w-5 h-5 mr-2" />
          {blackoutMode ? 'Critical Personnel' : 'Active Personnel'}
        </h3>
        
        <div className="text-xs text-gray-400">
          {filteredSoldiers.length}/{soldiers.length} Online
        </div>
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
            <div className="flex items-center space-x-3 mb-2">
              <div className="text-2xl">{soldier.avatar}</div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div className="font-semibold text-white">
                    {blackoutMode ? `UNIT-${soldier.id.split('-')[1]}` : soldier.name}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded ${getStatusColor(soldier.status)} border border-current`}>
                    {soldier.status.toUpperCase()}
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {soldier.rank} • {soldier.id}
                </div>
                {!blackoutMode && (
                  <div className="text-xs text-gray-500 truncate">{soldier.mission}</div>
                )}
              </div>
            </div>

            {/* Vitals Snapshot */}
            <div className="grid grid-cols-3 gap-2 text-xs mb-2">
              <div className="flex items-center space-x-1">
                <Heart className="w-3 h-3 text-alert-red" />
                <span className="text-gray-300">{Math.round(soldier.hr)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3 text-cyborg-teal" />
                <span className="text-gray-300">{Math.round(soldier.battery)}%</span>
              </div>
              <div className={`flex items-center space-x-1 ${getThreatColor(soldier.threatProximity)}`}>
                <Zap className="w-3 h-3" />
                <span className="text-xs">{soldier.threatProximity}</span>
              </div>
            </div>

            {/* Encryption Level Indicator */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1">
                <Radio className="w-3 h-3 text-green-400" />
                <span className="text-green-400">{soldier.encryption}</span>
              </div>
              <div className="text-gray-400">
                {soldier.lastAction}
              </div>
            </div>

            {/* Stress-Based Encryption Animation */}
            <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  soldier.status === 'critical' ? 'bg-alert-red animate-pulse' :
                  soldier.status === 'elevated' ? 'bg-neon-amber' : 'bg-cyborg-teal'
                }`}
                style={{ 
                  width: soldier.encryption === 'AES-256' ? '100%' : 
                         soldier.encryption === 'AES-192' ? '75%' : '50%' 
                }}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-600">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="text-cyborg-teal font-bold">{soldierData.filter(s => s.status === 'normal').length}</div>
            <div className="text-gray-400">NORMAL</div>
          </div>
          <div className="text-center">
            <div className="text-neon-amber font-bold">{soldierData.filter(s => s.status === 'elevated').length}</div>
            <div className="text-gray-400">ELEVATED</div>
          </div>
          <div className="text-center">
            <div className="text-alert-red font-bold">{soldierData.filter(s => s.status === 'critical').length}</div>
            <div className="text-gray-400">CRITICAL</div>
          </div>
        </div>
      </div>
    </div>
  );
}
