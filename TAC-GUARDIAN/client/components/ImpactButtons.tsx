import { Plane, Zap } from "lucide-react";

export function ImpactButtons({ 
  onExecuteRescue, 
  onLaunchDrone, 
  droneActive 
}: { 
  onExecuteRescue: () => void;
  onLaunchDrone: () => void;
  droneActive: boolean;
}) {
  return (
    <div className="flex space-x-3">
      {/* Execute Rescue Button */}
      <button
        onClick={onExecuteRescue}
        className="group relative px-6 py-3 bg-gradient-to-r from-alert-red/20 to-alert-red/30 border-2 border-alert-red rounded-lg hover:from-alert-red/30 hover:to-alert-red/40 transition-all duration-300 transform hover:scale-105"
      >
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-alert-red group-hover:animate-bounce" />
          <span className="text-alert-red font-bold">EXECUTE RESCUE</span>
        </div>
        
        {/* Pulsing glow effect */}
        <div className="absolute inset-0 rounded-lg bg-alert-red/20 opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300" />
        
        {/* Corner accents */}
        <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-alert-red" />
        <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-alert-red" />
        <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-alert-red" />
        <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-alert-red" />
      </button>

      {/* Launch Drone Button */}
      <button
        onClick={onLaunchDrone}
        disabled={droneActive}
        className={`group relative px-6 py-3 border-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
          droneActive
            ? 'bg-cyborg-teal/30 border-cyborg-teal text-cyborg-teal cursor-not-allowed'
            : 'bg-gradient-to-r from-cyborg-teal/20 to-cyborg-teal/30 border-cyborg-teal hover:from-cyborg-teal/30 hover:to-cyborg-teal/40'
        }`}
      >
        <div className="flex items-center space-x-2">
          <Plane className={`w-5 h-5 text-cyborg-teal ${droneActive ? 'animate-pulse' : 'group-hover:animate-bounce'}`} />
          <span className="text-cyborg-teal font-bold">
            {droneActive ? 'DRONE ACTIVE' : 'LAUNCH DRONE'}
          </span>
        </div>
        
        {/* Pulsing glow effect */}
        {!droneActive && (
          <div className="absolute inset-0 rounded-lg bg-cyborg-teal/20 opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300" />
        )}
        
        {/* Active indicator */}
        {droneActive && (
          <div className="absolute inset-0 rounded-lg bg-cyborg-teal/10 animate-pulse" />
        )}
        
        {/* Corner accents */}
        <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-cyborg-teal" />
        <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-cyborg-teal" />
        <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-cyborg-teal" />
        <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-cyborg-teal" />
      </button>
    </div>
  );
}
