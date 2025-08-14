import { useState } from "react";
import { Target, Clock, MapPin, CheckCircle2, AlertCircle, Circle } from "lucide-react";

const missionData = {
  name: "Operation Guardian Shield",
  progress: 67,
  currentMilestone: "Secure Checkpoint Charlie",
  nextMilestone: "Establish Overwatch Position",
  startTime: "12:00:00",
  estimatedCompletion: "16:30:00",
  actualTime: "14:40:15"
};

const milestones = [
  { id: 1, name: "Deploy to LZ Alpha", status: "completed", time: "12:15", description: "Initial deployment successful" },
  { id: 2, name: "Establish Perimeter", status: "completed", time: "12:45", description: "360° security established" },
  { id: 3, name: "Recon Sector 7", status: "completed", time: "13:20", description: "Area cleared, no hostiles" },
  { id: 4, name: "Secure Checkpoint Bravo", status: "completed", time: "13:55", description: "Checkpoint secured" },
  { id: 5, name: "Secure Checkpoint Charlie", status: "current", time: "14:40", description: "In progress - 85% complete" },
  { id: 6, name: "Establish Overwatch", status: "pending", time: "15:15", description: "Next objective" },
  { id: 7, name: "Package Retrieval", status: "pending", time: "15:45", description: "Primary objective" },
  { id: 8, name: "Extraction", status: "pending", time: "16:30", description: "Mission completion" }
];

export function MissionProgress({ blackoutMode }: { blackoutMode: boolean }) {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<number | null>(null);

  const completedMilestones = milestones.filter(m => m.status === "completed").length;
  const totalMilestones = milestones.length;
  const progressPercentage = (completedMilestones / totalMilestones) * 100;

  const handleMilestoneClick = (milestone: any) => {
    setSelectedMilestone(selectedMilestone === milestone.id ? null : milestone.id);
    
    if (milestone.status === "current") {
      alert(`🎯 CURRENT OBJECTIVE\n\n${milestone.name}\nStatus: ${milestone.description}\nEstimated completion: ${milestone.time}\nUnits involved: Alpha, Bravo squads`);
    } else if (milestone.status === "completed") {
      alert(`✅ COMPLETED OBJECTIVE\n\n${milestone.name}\nCompleted at: ${milestone.time}\nResult: ${milestone.description}\nAll units accounted for`);
    } else {
      alert(`⏳ UPCOMING OBJECTIVE\n\n${milestone.name}\nScheduled: ${milestone.time}\nPreparation: ${milestone.description}\nAssigned units: TBD`);
    }
  };

  const handleUpdateProgress = () => {
    alert("📊 PROGRESS UPDATE\n\nManual progress update initiated\nSyncing with field reports...\nCurrent objective status refreshed\nNext milestone ETA recalculated");
  };

  const handleAccelerateTimeline = () => {
    alert("⚡ TIMELINE ACCELERATION\n\nAccelerating mission timeline\nReallocating resources for faster completion\nNew ETA: 15:45:00\nAll units notified of updated schedule");
  };

  const handleDelayMission = () => {
    alert("⏸️ MISSION DELAY\n\nDelaying mission timeline\nReason: Threat assessment requires additional time\nNew ETA: 17:15:00\nSafety protocols prioritized");
  };

  const handleAbortMission = () => {
    const confirm = window.confirm("🚨 ABORT MISSION?\n\nThis will initiate immediate extraction of all personnel.\nAre you sure you want to abort the mission?");
    if (confirm) {
      alert("🚨 MISSION ABORT\n\nEmergency extraction initiated\nAll units RTB immediately\nEvacuation coordinates transmitted\nDebrief scheduled for 1800 hours");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-4 h-4 text-cyborg-teal" />;
      case "current": return <AlertCircle className="w-4 h-4 text-neon-amber animate-pulse" />;
      default: return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className={`glass-panel rounded-lg p-4 mb-6 ${blackoutMode ? 'border-alert-red/30' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className={`text-xl font-bold ${blackoutMode ? 'text-alert-red' : 'text-cyborg-teal'}`}>
            {blackoutMode ? 'Emergency Mission Status' : missionData.name}
          </h2>
          <p className="text-gray-400 text-sm">
            {blackoutMode ? 'Critical objectives only' : `${completedMilestones}/${totalMilestones} objectives completed`}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-400">Mission Time</div>
            <div className={`font-mono font-bold ${blackoutMode ? 'text-alert-red' : 'text-cyborg-teal'}`}>
              {missionData.actualTime}
            </div>
          </div>
          
          {!blackoutMode && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className={`px-3 py-1 text-xs rounded transition-all duration-300 ${
                showDetails
                  ? 'bg-cyborg-teal/30 text-cyborg-teal border border-cyborg-teal'
                  : 'bg-cyborg-teal/20 text-cyborg-teal hover:bg-cyborg-teal/30'
              }`}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Overall Progress</span>
          <span className={`text-sm font-bold ${blackoutMode ? 'text-alert-red' : 'text-cyborg-teal'}`}>
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-3 rounded-full transition-all duration-1000 ${
              blackoutMode ? 'bg-alert-red' : 'bg-gradient-to-r from-cyborg-teal to-neon-amber'
            }`}
            style={{ width: `${progressPercentage}%` }}
          >
            <div className="h-full bg-white/20 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Current Milestone */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="glass-panel p-3 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Target className={`w-4 h-4 ${blackoutMode ? 'text-alert-red' : 'text-cyborg-teal'}`} />
            <span className="text-sm font-semibold text-white">Current</span>
          </div>
          <p className="text-xs text-gray-300">{missionData.currentMilestone}</p>
        </div>
        
        <div className="glass-panel p-3 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="w-4 h-4 text-neon-amber" />
            <span className="text-sm font-semibold text-white">Next</span>
          </div>
          <p className="text-xs text-gray-300">{missionData.nextMilestone}</p>
        </div>
        
        <div className="glass-panel p-3 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-white">ETA</span>
          </div>
          <p className="text-xs text-gray-300">{missionData.estimatedCompletion}</p>
        </div>
      </div>

      {/* Mission Control Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <button
          onClick={handleUpdateProgress}
          className="px-3 py-2 bg-cyborg-teal/20 border border-cyborg-teal text-cyborg-teal rounded-lg hover:bg-cyborg-teal/30 transition-all duration-300 text-xs"
        >
          📊 Update Progress
        </button>
        
        {!blackoutMode && (
          <>
            <button
              onClick={handleAccelerateTimeline}
              className="px-3 py-2 bg-neon-amber/20 border border-neon-amber text-neon-amber rounded-lg hover:bg-neon-amber/30 transition-all duration-300 text-xs"
            >
              ⚡ Accelerate
            </button>
            
            <button
              onClick={handleDelayMission}
              className="px-3 py-2 bg-blue-400/20 border border-blue-400 text-blue-400 rounded-lg hover:bg-blue-400/30 transition-all duration-300 text-xs"
            >
              ⏸️ Delay
            </button>
          </>
        )}
        
        <button
          onClick={handleAbortMission}
          className="px-3 py-2 bg-alert-red/20 border border-alert-red text-alert-red rounded-lg hover:bg-alert-red/30 transition-all duration-300 text-xs"
        >
          🚨 Abort Mission
        </button>
      </div>

      {/* Detailed Milestone List */}
      {showDetails && !blackoutMode && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-cyborg-teal mb-2">Mission Milestones</h4>
          {milestones.map((milestone) => (
            <div 
              key={milestone.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all duration-300 hover:bg-ghost-gray/20 ${
                selectedMilestone === milestone.id ? 'bg-cyborg-teal/10 border-cyborg-teal' : 'bg-ghost-gray/30 border-gray-600'
              }`}
              onClick={() => handleMilestoneClick(milestone)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(milestone.status)}
                  <div>
                    <div className="font-semibold text-white text-sm">{milestone.name}</div>
                    <div className="text-xs text-gray-400">{milestone.description}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-400 font-mono">{milestone.time}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
