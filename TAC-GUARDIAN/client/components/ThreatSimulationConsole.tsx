import { useState } from "react";
import { Target, CloudSnow, Zap, Radio, Plus } from "lucide-react";
import { showMissionModal, showSuccessModal } from "./ModalNotification";

export function ThreatSimulationConsole({ onThreatSpawn }: { onThreatSpawn: (threat: any) => void }) {
  const [activeSimulations, setActiveSimulations] = useState<string[]>([]);

  const threatTypes = [
    { id: "sam", label: "SAM Site", icon: Target, color: "alert-red" },
    { id: "jamming", label: "EW Jamming", icon: Radio, color: "neon-amber" },
    { id: "weather", label: "Storm Front", icon: CloudSnow, color: "blue-400" },
    { id: "blackout", label: "Comm Blackout", icon: Zap, color: "purple-400" }
  ];

  const handleSpawnThreat = (threatType: any) => {
    const threat = {
      id: Date.now(),
      type: threatType.id.toUpperCase(),
      position: [
        (Math.random() - 0.5) * 8,
        0,
        (Math.random() - 0.5) * 8
      ],
      radius: 1 + Math.random() * 2,
      intensity: 0.5 + Math.random() * 0.5,
      active: true
    };

    onThreatSpawn(threat);
    setActiveSimulations(prev => [...prev, threatType.id]);

    showMissionModal(
      `${threatType.icon.name} ${threatType.label.toUpperCase()} SPAWNED`,
      `Simulation threat deployed\n\n• Type: ${threatType.label}\n• Location: Random Grid\n• Radius: ${threat.radius.toFixed(1)}km\n• Intensity: ${Math.round(threat.intensity * 100)}%\n• Status: ACTIVE`,
      [
        { label: "Countermeasures", action: () => {
          showSuccessModal("🛡️ COUNTERMEASURES DEPLOYED", `Defensive measures activated\n\n• Electronic jamming initiated\n• Alternate routes calculated\n• Personnel notified\n• Threat neutralization: 78%`);
        }, variant: "primary" }
      ]
    );
  };

  const handleWeatherChange = () => {
    const weatherTypes = ["Storm", "Fog", "Sandstorm", "Heavy Rain"];
    const weather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
    
    showMissionModal(
      "🌩️ WEATHER SIMULATION",
      `Triggering environmental change\n\n• Event: ${weather}\n• Visibility: Reduced 60%\n• Duration: 45 minutes\n• Impact: Mission timeline affected\n• Recommendation: Shelter in place`,
      [
        { label: "Adapt Mission", action: () => {
          showSuccessModal("✅ MISSION ADAPTED", `Mission parameters updated for ${weather}\n\n• Timeline extended\n• Routes recalculated\n• Safety protocols active\n• All units informed`);
        }, variant: "primary" }
      ]
    );
  };

  const handleCommBlackout = () => {
    showMissionModal(
      "📡 COMMUNICATION BLACKOUT",
      "Simulating total communication failure\n\n• All channels: OFFLINE\n• Emergency protocols: ACTIVE\n• Fallback procedures: INITIATED\n• Estimated duration: Unknown",
      [
        { label: "Emergency Restore", action: () => {
          showSuccessModal("📻 EMERGENCY COMMS RESTORED", "Backup communication systems online\n\n• Emergency channel: ACTIVE\n• Limited bandwidth available\n• All units responding\n• Full restore in progress");
        }, variant: "danger" }
      ]
    );
  };

  const handleClearSimulations = () => {
    setActiveSimulations([]);
    showSuccessModal("🧹 SIMULATIONS CLEARED", "All threat simulations removed\n\n• Map reset to baseline\n• Threats neutralized\n• Normal operations resumed\n• Training complete");
  };

  return (
    <div className="glass-panel rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-cyborg-teal flex items-center">
          <Target className="w-5 h-5 mr-2" />
          Threat Simulation
        </h3>
        <div className="text-xs text-gray-400">
          {activeSimulations.length} Active
        </div>
      </div>

      <div className="space-y-3">
        {threatTypes.map((threat) => {
          const Icon = threat.icon;
          const isActive = activeSimulations.includes(threat.id);
          
          return (
            <button
              key={threat.id}
              onClick={() => handleSpawnThreat(threat)}
              className={`w-full p-3 rounded-lg border transition-all duration-300 hover:scale-105 ${
                isActive
                  ? `bg-${threat.color}/30 border-${threat.color} text-${threat.color}`
                  : `bg-${threat.color}/10 border-${threat.color}/50 text-${threat.color} hover:bg-${threat.color}/20`
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5" />
                <div className="flex-1 text-left">
                  <div className="font-semibold">{threat.label}</div>
                  <div className="text-xs opacity-70">
                    {isActive ? "ACTIVE" : "Click to spawn"}
                  </div>
                </div>
                <Plus className="w-4 h-4" />
              </div>
            </button>
          );
        })}

        <button
          onClick={handleWeatherChange}
          className="w-full p-3 rounded-lg border bg-blue-400/10 border-blue-400/50 text-blue-400 hover:bg-blue-400/20 transition-all duration-300"
        >
          <div className="flex items-center space-x-3">
            <CloudSnow className="w-5 h-5" />
            <div className="flex-1 text-left">
              <div className="font-semibold">Weather Event</div>
              <div className="text-xs opacity-70">Trigger environmental change</div>
            </div>
          </div>
        </button>

        <button
          onClick={handleCommBlackout}
          className="w-full p-3 rounded-lg border bg-purple-400/10 border-purple-400/50 text-purple-400 hover:bg-purple-400/20 transition-all duration-300"
        >
          <div className="flex items-center space-x-3">
            <Zap className="w-5 h-5" />
            <div className="flex-1 text-left">
              <div className="font-semibold">Comm Blackout</div>
              <div className="text-xs opacity-70">Simulate communication failure</div>
            </div>
          </div>
        </button>

        {activeSimulations.length > 0 && (
          <button
            onClick={handleClearSimulations}
            className="w-full p-2 rounded-lg border bg-gray-500/10 border-gray-500/50 text-gray-400 hover:bg-gray-500/20 transition-all duration-300 text-sm"
          >
            🧹 Clear All Simulations
          </button>
        )}
      </div>

      <div className="mt-4 p-3 bg-void/30 rounded-lg border border-cyborg-teal/20">
        <h4 className="text-sm font-semibold text-cyborg-teal mb-2">Judge Demo Tips</h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Spawn threats to show AI adaptation</li>
          <li>• Weather changes affect visibility</li>
          <li>• Blackouts test emergency protocols</li>
          <li>• Map updates in real-time</li>
        </ul>
      </div>
    </div>
  );
}
