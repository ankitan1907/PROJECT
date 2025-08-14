import { useState } from "react";
import { 
  Zap, 
  Satellite, 
  Radio, 
  Package, 
  Crosshair, 
  CloudRain, 
  Wifi, 
  Shield,
  AlertTriangle,
  Play
} from "lucide-react";
import { showMissionModal } from "./ModalNotification";

interface JudgeTriggerPanelProps {
  onTriggerEvent: (event: TriggerEvent) => void;
}

interface TriggerEvent {
  type: 'blackout' | 'drone_deploy' | 'comm_breakdown' | 'supply_drop' | 'weather_change' | 'threat_spawn' | 'emergency';
  data: any;
  severity: 'low' | 'medium' | 'high';
}

export function JudgeTriggerPanel({ onTriggerEvent }: JudgeTriggerPanelProps) {
  const [cooldowns, setCooldowns] = useState<{ [key: string]: number }>({});
  const [lastTriggered, setLastTriggered] = useState<{ [key: string]: number }>({});

  const triggerEvent = (type: TriggerEvent['type'], data: any, severity: TriggerEvent['severity'] = 'medium') => {
    const now = Date.now();
    const cooldownTime = 5000; // 5 second cooldown

    if (lastTriggered[type] && (now - lastTriggered[type]) < cooldownTime) {
      showMissionModal(
        "⏱️ COOLDOWN ACTIVE",
        `Please wait ${Math.ceil((cooldownTime - (now - lastTriggered[type])) / 1000)} seconds before triggering ${type} again.`
      );
      return;
    }

    const event: TriggerEvent = { type, data, severity };
    onTriggerEvent(event);
    
    setLastTriggered(prev => ({ ...prev, [type]: now }));
    setCooldowns(prev => ({ ...prev, [type]: cooldownTime }));

    // Clear cooldown
    setTimeout(() => {
      setCooldowns(prev => ({ ...prev, [type]: 0 }));
    }, cooldownTime);
  };

  const triggerBlackoutMode = () => {
    triggerEvent('blackout', { duration: 30 }, 'high');
    showMissionModal(
      "🔒 BLACKOUT MODE TRIGGERED",
      "Emergency blackout protocol activated by judge override.\n\n• All non-essential systems offline\n• Emergency communications only\n• Duration: 30 seconds",
      [{ label: "Acknowledge", action: () => {}, variant: "danger" }]
    );
  };

  const triggerDroneDeployment = () => {
    triggerEvent('drone_deploy', { 
      type: 'emergency_recon', 
      target: 'sector_7_alpha',
      mission: 'threat_assessment'
    }, 'medium');
    showMissionModal(
      "🛸 EMERGENCY DRONE DEPLOYMENT",
      "Judge-triggered drone deployment initiated.\n\n• Drone type: Emergency Recon\n• Target: Sector 7-Alpha\n• Mission: Threat Assessment\n• ETA: 2 minutes",
      [{ label: "Track Drone", action: () => {}, variant: "primary" }]
    );
  };

  const triggerCommBreakdown = () => {
    triggerEvent('comm_breakdown', { 
      affected_units: ['Alpha', 'Bravo'],
      duration: 45,
      cause: 'EW_jamming'
    }, 'high');
    showMissionModal(
      "📡 COMMUNICATION BREAKDOWN",
      "Judge-triggered communication failure.\n\n• Affected: Alpha & Bravo teams\n• Cause: Electronic warfare jamming\n• Duration: 45 seconds\n• Backup channels: Activated",
      [
        { label: "Switch to Backup", action: () => {}, variant: "primary" },
        { label: "Send Runner", action: () => {}, variant: "secondary" }
      ]
    );
  };

  const triggerSupplyDrop = () => {
    triggerEvent('supply_drop', {
      type: 'emergency_medical',
      location: 'LZ_Charlie',
      contents: ['medical_supplies', 'ammunition', 'rations']
    }, 'low');
    showMissionModal(
      "📦 EMERGENCY SUPPLY DROP",
      "Judge-authorized supply drop incoming.\n\n• Type: Emergency Medical\n• Location: LZ Charlie\n• Contents: Medical supplies, ammunition, rations\n• ETA: 3 minutes",
      [{ label: "Confirm Receipt", action: () => {}, variant: "primary" }]
    );
  };

  const triggerWeatherChange = () => {
    const weatherEvents = [
      { event: 'sandstorm', severity: 'high', duration: 60 },
      { event: 'heavy_rain', severity: 'medium', duration: 90 },
      { event: 'dense_fog', severity: 'medium', duration: 120 },
      { event: 'high_winds', severity: 'low', duration: 30 }
    ];
    
    const weather = weatherEvents[Math.floor(Math.random() * weatherEvents.length)];
    
    triggerEvent('weather_change', weather, weather.severity as any);
    showMissionModal(
      "🌩️ WEATHER EVENT TRIGGERED",
      `Judge-triggered weather change detected.\n\n• Event: ${weather.event.replace('_', ' ').toUpperCase()}\n• Severity: ${weather.severity.toUpperCase()}\n• Duration: ${weather.duration} seconds\n• Impact: Visibility and movement affected`,
      [
        { label: "Adjust Operations", action: () => {}, variant: "primary" },
        { label: "Take Shelter", action: () => {}, variant: "secondary" }
      ]
    );
  };

  const triggerThreatSpawn = () => {
    const threats = [
      { type: 'hostile_patrol', count: 4, sector: '8B' },
      { type: 'sniper_nest', count: 1, sector: '5A' },
      { type: 'vehicle_convoy', count: 2, sector: '3C' },
      { type: 'mortar_team', count: 1, sector: '7D' }
    ];
    
    const threat = threats[Math.floor(Math.random() * threats.length)];
    
    triggerEvent('threat_spawn', threat, 'high');
    showMissionModal(
      "⚠️ NEW THREAT DETECTED",
      `Judge-triggered threat spawn.\n\n• Type: ${threat.type.replace('_', ' ').toUpperCase()}\n• Count: ${threat.count} units\n• Location: Sector ${threat.sector}\n• Threat Level: HIGH`,
      [
        { label: "Engage Target", action: () => {}, variant: "danger" },
        { label: "Avoid & Monitor", action: () => {}, variant: "secondary" }
      ]
    );
  };

  const triggerEmergencyScenario = () => {
    const scenarios = [
      {
        title: "SOLDIER WOUNDED",
        description: "Alpha-2 has sustained injuries and requires immediate medical attention.",
        actions: ["Call Medic", "Request Evacuation"]
      },
      {
        title: "EQUIPMENT FAILURE",
        description: "Primary communication array has malfunctioned during critical phase.",
        actions: ["Switch to Backup", "Manual Repair"]
      },
      {
        title: "INTEL BREACH",
        description: "Enemy forces may have intercepted mission communications.",
        actions: ["Change Frequency", "Abort Mission"]
      }
    ];
    
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    
    triggerEvent('emergency', scenario, 'high');
    showMissionModal(
      `🚨 ${scenario.title}`,
      `Judge-triggered emergency scenario.\n\n${scenario.description}`,
      scenario.actions.map(action => ({
        label: action,
        action: () => {},
        variant: action.includes('Abort') ? 'danger' : 'primary' as any
      }))
    );
  };

  const getCooldownProgress = (type: string) => {
    if (!cooldowns[type] || !lastTriggered[type]) return 0;
    const elapsed = Date.now() - lastTriggered[type];
    return Math.max(0, (cooldowns[type] - elapsed) / cooldowns[type]) * 100;
  };

  const isOnCooldown = (type: string) => {
    return getCooldownProgress(type) > 0;
  };

  return (
    <div className="glass-panel rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-alert-red flex items-center">
          <Play className="mr-2" size={20} />
          Judge Trigger Panel
        </h3>
        <div className="text-xs text-gray-400">Live Battle Control</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Blackout Mode */}
        <button
          onClick={triggerBlackoutMode}
          disabled={isOnCooldown('blackout')}
          className={`relative p-3 rounded-lg border transition-all duration-300 ${
            isOnCooldown('blackout')
              ? 'bg-gray-600/20 border-gray-600 text-gray-500 cursor-not-allowed'
              : 'bg-alert-red/20 border-alert-red text-alert-red hover:bg-alert-red/30'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Shield size={16} />
            <span className="text-sm font-semibold">Blackout</span>
          </div>
          {isOnCooldown('blackout') && (
            <div 
              className="absolute bottom-0 left-0 h-1 bg-alert-red transition-all duration-100"
              style={{ width: `${getCooldownProgress('blackout')}%` }}
            />
          )}
        </button>

        {/* Drone Deploy */}
        <button
          onClick={triggerDroneDeployment}
          disabled={isOnCooldown('drone_deploy')}
          className={`relative p-3 rounded-lg border transition-all duration-300 ${
            isOnCooldown('drone_deploy')
              ? 'bg-gray-600/20 border-gray-600 text-gray-500 cursor-not-allowed'
              : 'bg-cyborg-teal/20 border-cyborg-teal text-cyborg-teal hover:bg-cyborg-teal/30'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Satellite size={16} />
            <span className="text-sm font-semibold">Deploy Drone</span>
          </div>
          {isOnCooldown('drone_deploy') && (
            <div 
              className="absolute bottom-0 left-0 h-1 bg-cyborg-teal transition-all duration-100"
              style={{ width: `${getCooldownProgress('drone_deploy')}%` }}
            />
          )}
        </button>

        {/* Comm Breakdown */}
        <button
          onClick={triggerCommBreakdown}
          disabled={isOnCooldown('comm_breakdown')}
          className={`relative p-3 rounded-lg border transition-all duration-300 ${
            isOnCooldown('comm_breakdown')
              ? 'bg-gray-600/20 border-gray-600 text-gray-500 cursor-not-allowed'
              : 'bg-neon-amber/20 border-neon-amber text-neon-amber hover:bg-neon-amber/30'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Wifi size={16} />
            <span className="text-sm font-semibold">Comm Failure</span>
          </div>
          {isOnCooldown('comm_breakdown') && (
            <div 
              className="absolute bottom-0 left-0 h-1 bg-neon-amber transition-all duration-100"
              style={{ width: `${getCooldownProgress('comm_breakdown')}%` }}
            />
          )}
        </button>

        {/* Supply Drop */}
        <button
          onClick={triggerSupplyDrop}
          disabled={isOnCooldown('supply_drop')}
          className={`relative p-3 rounded-lg border transition-all duration-300 ${
            isOnCooldown('supply_drop')
              ? 'bg-gray-600/20 border-gray-600 text-gray-500 cursor-not-allowed'
              : 'bg-green-500/20 border-green-500 text-green-500 hover:bg-green-500/30'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Package size={16} />
            <span className="text-sm font-semibold">Supply Drop</span>
          </div>
          {isOnCooldown('supply_drop') && (
            <div 
              className="absolute bottom-0 left-0 h-1 bg-green-500 transition-all duration-100"
              style={{ width: `${getCooldownProgress('supply_drop')}%` }}
            />
          )}
        </button>

        {/* Weather Event */}
        <button
          onClick={triggerWeatherChange}
          disabled={isOnCooldown('weather_change')}
          className={`relative p-3 rounded-lg border transition-all duration-300 ${
            isOnCooldown('weather_change')
              ? 'bg-gray-600/20 border-gray-600 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500/20 border-blue-500 text-blue-500 hover:bg-blue-500/30'
          }`}
        >
          <div className="flex items-center space-x-2">
            <CloudRain size={16} />
            <span className="text-sm font-semibold">Weather</span>
          </div>
          {isOnCooldown('weather_change') && (
            <div 
              className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-100"
              style={{ width: `${getCooldownProgress('weather_change')}%` }}
            />
          )}
        </button>

        {/* Threat Spawn */}
        <button
          onClick={triggerThreatSpawn}
          disabled={isOnCooldown('threat_spawn')}
          className={`relative p-3 rounded-lg border transition-all duration-300 ${
            isOnCooldown('threat_spawn')
              ? 'bg-gray-600/20 border-gray-600 text-gray-500 cursor-not-allowed'
              : 'bg-purple-500/20 border-purple-500 text-purple-500 hover:bg-purple-500/30'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Crosshair size={16} />
            <span className="text-sm font-semibold">Spawn Threat</span>
          </div>
          {isOnCooldown('threat_spawn') && (
            <div 
              className="absolute bottom-0 left-0 h-1 bg-purple-500 transition-all duration-100"
              style={{ width: `${getCooldownProgress('threat_spawn')}%` }}
            />
          )}
        </button>
      </div>

      {/* Emergency Scenario Button */}
      <button
        onClick={triggerEmergencyScenario}
        disabled={isOnCooldown('emergency')}
        className={`relative w-full p-4 rounded-lg border transition-all duration-300 ${
          isOnCooldown('emergency')
            ? 'bg-gray-600/20 border-gray-600 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-alert-red/20 to-neon-amber/20 border-alert-red text-white hover:from-alert-red/30 hover:to-neon-amber/30 animate-pulse'
        }`}
      >
        <div className="flex items-center justify-center space-x-2">
          <AlertTriangle size={20} />
          <span className="font-bold">TRIGGER EMERGENCY SCENARIO</span>
        </div>
        {isOnCooldown('emergency') && (
          <div 
            className="absolute bottom-0 left-0 h-1 bg-alert-red transition-all duration-100"
            style={{ width: `${getCooldownProgress('emergency')}%` }}
          />
        )}
      </button>

      <div className="text-xs text-center text-gray-400 pt-2 border-t border-gray-600">
        Judge control panel - All actions have 5-second cooldowns
      </div>
    </div>
  );
}
