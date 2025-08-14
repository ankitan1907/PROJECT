import { useState, useEffect } from "react";
import { Clock, Thermometer, AlertTriangle, Satellite } from "lucide-react";

export function MissionStatus() {
  const [missionTime, setMissionTime] = useState(0);
  const [threatLevel, setThreatLevel] = useState(35);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setMissionTime(prev => prev + 1);
      // Simulate threat level fluctuation
      if (Math.random() > 0.8) {
        setThreatLevel(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 20)));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getThreatColor = () => {
    if (threatLevel < 30) return "text-cyborg-teal";
    if (threatLevel < 70) return "text-neon-amber";
    return "text-alert-red";
  };

  return (
    <div className="glass-panel rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-cyborg-teal">Mission Status</h3>
      
      <div className="space-y-4">
        {/* Mission Timer */}
        <div className="flex items-center justify-between p-3 bg-ghost-gray/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-cyborg-teal" />
            <span className="text-sm text-gray-300">Mission Time</span>
          </div>
          <span className="font-mono text-lg text-cyborg-teal neon-glow">{formatTime(missionTime)}</span>
        </div>

        {/* Weather */}
        <div className="flex items-center justify-between p-3 bg-ghost-gray/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <Thermometer className="w-5 h-5 text-neon-amber" />
            <span className="text-sm text-gray-300">Temperature</span>
          </div>
          <span className="text-neon-amber">24°C</span>
        </div>

        {/* Threat Level */}
        <div className="p-3 bg-ghost-gray/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <AlertTriangle className={`w-5 h-5 ${getThreatColor()}`} />
              <span className="text-sm text-gray-300">Threat Level</span>
            </div>
            <span className={`font-bold ${getThreatColor()}`}>{Math.round(threatLevel)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                threatLevel < 30 ? 'bg-cyborg-teal' :
                threatLevel < 70 ? 'bg-neon-amber' : 'bg-alert-red'
              }`}
              style={{ width: `${threatLevel}%` }}
            ></div>
          </div>
        </div>

        {/* Satellite Coverage */}
        <div className="flex items-center justify-between p-3 bg-ghost-gray/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <Satellite className="w-5 h-5 text-cyborg-teal" />
            <span className="text-sm text-gray-300">Sat Coverage</span>
          </div>
          <div className="flex space-x-1">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i}
                className={`w-2 h-4 rounded ${
                  i <= 3 ? 'bg-cyborg-teal' : 'bg-gray-600'
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* Operation Code */}
        <div className="p-3 bg-alert-red/10 border border-alert-red/30 rounded-lg">
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">OPERATION</div>
            <div className="text-lg font-mono text-alert-red font-bold">GUARDIAN-7</div>
            <div className="text-xs text-gray-400 mt-1">CLASSIFIED</div>
          </div>
        </div>
      </div>
    </div>
  );
}
