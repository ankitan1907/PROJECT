import { useState } from "react";
import { Users, TrendingUp, AlertTriangle, Activity } from "lucide-react";

const healthData = {
  normal: 3,
  elevated: 2,
  critical: 1,
  total: 6
};

const recentEvents = [
  { time: "14:35", event: "PVT Charlie moved to critical status", type: "critical" },
  { time: "14:32", event: "CPL Echo stress levels elevated", type: "elevated" },
  { time: "14:28", event: "Team average heart rate increased", type: "warning" },
  { time: "14:25", event: "All units reported in", type: "normal" }
];

export function TeamHealthSummary() {
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const normalPercentage = (healthData.normal / healthData.total) * 100;
  const elevatedPercentage = (healthData.elevated / healthData.total) * 100;
  const criticalPercentage = (healthData.critical / healthData.total) * 100;

  const handleSegmentClick = (segment: string) => {
    setSelectedSegment(selectedSegment === segment ? null : segment);
  };

  const handleHealthAnalysis = () => {
    setShowDetails(!showDetails);
    if (!showDetails) {
      alert(`📊 TEAM HEALTH ANALYSIS\n\nOverall Status: ${healthData.critical > 0 ? 'CAUTION' : healthData.elevated > 0 ? 'MONITORING' : 'OPTIMAL'}\n\n• Normal: ${healthData.normal} personnel (${normalPercentage.toFixed(1)}%)\n• Elevated: ${healthData.elevated} personnel (${elevatedPercentage.toFixed(1)}%)\n• Critical: ${healthData.critical} personnel (${criticalPercentage.toFixed(1)}%)\n\nRecommendation: ${healthData.critical > 0 ? 'Immediate medical attention required' : 'Continue monitoring elevated personnel'}`);
    }
  };

  const handleMedicalDispatch = () => {
    alert("🚑 MEDICAL TEAM DISPATCH\n\nDispatching field medic to critical personnel\nETA: 3 minutes\nMedical supplies: Fully stocked\nEvac helicopter on standby");
  };

  const handleStressManagement = () => {
    alert("🧘 STRESS MANAGEMENT PROTOCOL\n\nInitiating stress reduction measures:\n• Rotation schedule activated\n• Rest periods extended\n• Hydration reminders sent\n• Breathing exercise audio deployed");
  };

  const handleTeamRotation = () => {
    alert("🔄 TEAM ROTATION\n\nImplementing personnel rotation:\n• Fresh units moving to high-stress positions\n• Fatigued personnel to support roles\n• New rotation schedule: 2-hour intervals\n• All units briefed on changes");
  };

  return (
    <div className="glass-panel rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-cyborg-teal flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Team Health Summary
        </h3>
        <button
          onClick={handleHealthAnalysis}
          className={`px-2 py-1 text-xs rounded transition-all duration-300 ${
            showDetails
              ? 'bg-cyborg-teal/30 text-cyborg-teal border border-cyborg-teal'
              : 'bg-cyborg-teal/20 text-cyborg-teal hover:bg-cyborg-teal/30'
          }`}
        >
          <TrendingUp className="w-3 h-3 inline mr-1" />
          Analysis
        </button>
      </div>

      {/* Pie Chart Visualization */}
      <div className="flex justify-center mb-4">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90">
            {/* Critical segment */}
            <circle
              cx="64"
              cy="64"
              r="50"
              fill="none"
              stroke="#FF2E4D"
              strokeWidth="12"
              strokeDasharray={`${criticalPercentage * 3.14} 314`}
              strokeDashoffset="0"
              className={`cursor-pointer transition-all duration-300 ${
                selectedSegment === 'critical' ? 'drop-shadow-lg' : ''
              }`}
              onClick={() => handleSegmentClick('critical')}
            />
            {/* Elevated segment */}
            <circle
              cx="64"
              cy="64"
              r="50"
              fill="none"
              stroke="#FFA500"
              strokeWidth="12"
              strokeDasharray={`${elevatedPercentage * 3.14} 314`}
              strokeDashoffset={`-${criticalPercentage * 3.14}`}
              className={`cursor-pointer transition-all duration-300 ${
                selectedSegment === 'elevated' ? 'drop-shadow-lg' : ''
              }`}
              onClick={() => handleSegmentClick('elevated')}
            />
            {/* Normal segment */}
            <circle
              cx="64"
              cy="64"
              r="50"
              fill="none"
              stroke="#00F0FF"
              strokeWidth="12"
              strokeDasharray={`${normalPercentage * 3.14} 314`}
              strokeDashoffset={`-${(criticalPercentage + elevatedPercentage) * 3.14}`}
              className={`cursor-pointer transition-all duration-300 ${
                selectedSegment === 'normal' ? 'drop-shadow-lg' : ''
              }`}
              onClick={() => handleSegmentClick('normal')}
            />
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{healthData.total}</span>
            <span className="text-xs text-gray-400">Personnel</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-2 text-xs mb-4">
        <div className={`flex items-center space-x-1 p-2 rounded transition-all duration-300 ${
          selectedSegment === 'normal' ? 'bg-cyborg-teal/20' : 'hover:bg-cyborg-teal/10'
        }`}>
          <div className="w-3 h-3 bg-cyborg-teal rounded-full"></div>
          <div>
            <div className="text-cyborg-teal font-semibold">{healthData.normal}</div>
            <div className="text-gray-400">Normal</div>
          </div>
        </div>
        
        <div className={`flex items-center space-x-1 p-2 rounded transition-all duration-300 ${
          selectedSegment === 'elevated' ? 'bg-neon-amber/20' : 'hover:bg-neon-amber/10'
        }`}>
          <div className="w-3 h-3 bg-neon-amber rounded-full"></div>
          <div>
            <div className="text-neon-amber font-semibold">{healthData.elevated}</div>
            <div className="text-gray-400">Elevated</div>
          </div>
        </div>
        
        <div className={`flex items-center space-x-1 p-2 rounded transition-all duration-300 ${
          selectedSegment === 'critical' ? 'bg-alert-red/20' : 'hover:bg-alert-red/10'
        }`}>
          <div className="w-3 h-3 bg-alert-red rounded-full animate-pulse"></div>
          <div>
            <div className="text-alert-red font-semibold">{healthData.critical}</div>
            <div className="text-gray-400">Critical</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <button
          onClick={handleMedicalDispatch}
          className="w-full px-3 py-2 bg-alert-red/20 border border-alert-red text-alert-red rounded-lg hover:bg-alert-red/30 transition-all duration-300 text-sm animate-pulse"
          disabled={healthData.critical === 0}
        >
          🚑 Dispatch Medical Team
        </button>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleStressManagement}
            className="px-2 py-1 bg-neon-amber/20 border border-neon-amber text-neon-amber rounded-lg hover:bg-neon-amber/30 transition-all duration-300 text-xs"
          >
            🧘 Stress Protocol
          </button>
          
          <button
            onClick={handleTeamRotation}
            className="px-2 py-1 bg-cyborg-teal/20 border border-cyborg-teal text-cyborg-teal rounded-lg hover:bg-cyborg-teal/30 transition-all duration-300 text-xs"
          >
            🔄 Team Rotation
          </button>
        </div>
      </div>

      {/* Recent Events */}
      {showDetails && (
        <div className="mt-4 pt-3 border-t border-gray-600">
          <h4 className="text-sm font-semibold text-cyborg-teal mb-2 flex items-center">
            <Activity className="w-4 h-4 mr-1" />
            Recent Health Events
          </h4>
          <div className="space-y-2 max-h-24 overflow-y-auto">
            {recentEvents.map((event, index) => (
              <div key={index} className="text-xs p-2 bg-ghost-gray/30 rounded">
                <div className="flex justify-between items-start">
                  <span className="text-gray-400 font-mono">{event.time}</span>
                  <span className={`text-xs px-1 rounded ${
                    event.type === 'critical' ? 'text-alert-red bg-alert-red/20' :
                    event.type === 'elevated' ? 'text-neon-amber bg-neon-amber/20' :
                    event.type === 'warning' ? 'text-orange-400 bg-orange-400/20' :
                    'text-cyborg-teal bg-cyborg-teal/20'
                  }`}>
                    {event.type.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-300 mt-1">{event.event}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
