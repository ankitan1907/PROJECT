import { useState } from "react";
import { Activity, Heart, Thermometer, Battery, MapPin } from "lucide-react";

const soldiers = [
  { 
    id: "TAC-1058", 
    name: "SGT Alpha", 
    status: "normal", 
    hr: 85, 
    temp: 98.6, 
    battery: 78, 
    lastSeen: "2 min ago",
    location: "Sector 7-A"
  },
  { 
    id: "TAC-2041", 
    name: "CPL Bravo", 
    status: "elevated", 
    hr: 115, 
    temp: 99.2, 
    battery: 45, 
    lastSeen: "30 sec ago",
    location: "Sector 5-B"
  },
  { 
    id: "TAC-3092", 
    name: "PVT Charlie", 
    status: "critical", 
    hr: 165, 
    temp: 101.8, 
    battery: 12, 
    lastSeen: "1 min ago",
    location: "Sector 3-C"
  },
  { 
    id: "TAC-4015", 
    name: "SGT Delta", 
    status: "normal", 
    hr: 78, 
    temp: 98.1, 
    battery: 92, 
    lastSeen: "45 sec ago",
    location: "Sector 9-D"
  },
];

export function SoldierList() {
  const [selectedSoldier, setSelectedSoldier] = useState<string | null>(null);

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

  return (
    <div className="glass-panel rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-cyborg-teal flex items-center">
        <Activity className="w-5 h-5 mr-2" />
        Active Personnel
      </h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {soldiers.map((soldier) => (
          <div 
            key={soldier.id}
            className={`p-3 rounded-lg border cursor-pointer transition-all duration-300 hover:scale-105 ${
              getStatusBg(soldier.status)
            } ${selectedSoldier === soldier.id ? 'ring-2 ring-cyborg-teal' : ''}`}
            onClick={() => setSelectedSoldier(selectedSoldier === soldier.id ? null : soldier.id)}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-semibold text-white">{soldier.name}</div>
                <div className="text-xs text-gray-400 font-mono">{soldier.id}</div>
              </div>
              <div className={`text-xs px-2 py-1 rounded ${getStatusColor(soldier.status)} border border-current`}>
                {soldier.status.toUpperCase()}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
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
            
            {selectedSoldier === soldier.id && (
              <div className="mt-3 pt-3 border-t border-gray-600">
                <div className="text-xs text-gray-400">
                  Last Contact: {soldier.lastSeen}
                </div>
                <div className="mt-2 flex space-x-2">
                  <button className="px-2 py-1 bg-cyborg-teal/30 text-cyborg-teal text-xs rounded hover:bg-cyborg-teal/50 transition-colors">
                    Track
                  </button>
                  <button className="px-2 py-1 bg-neon-amber/30 text-neon-amber text-xs rounded hover:bg-neon-amber/50 transition-colors">
                    Message
                  </button>
                  {soldier.status === "critical" && (
                    <button className="px-2 py-1 bg-alert-red/30 text-alert-red text-xs rounded hover:bg-alert-red/50 transition-colors">
                      Evac
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
          <span className="text-gray-400">Active:</span>
          <span className="text-cyborg-teal">{soldiers.filter(s => s.status !== 'offline').length}/4</span>
        </div>
      </div>
    </div>
  );
}
