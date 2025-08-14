import { useState } from "react";
import { Play, Pause, RotateCcw, FastForward, SkipBack, SkipForward } from "lucide-react";
import { showMissionModal } from "./ModalNotification";

export function MissionPlayback({ 
  missionTime, 
  onTimeChange 
}: { 
  missionTime: number;
  onTimeChange: (time: number) => void;
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    showMissionModal(
      isPlaying ? "⏸️ MISSION PLAYBACK PAUSED" : "▶️ MISSION PLAYBACK RESUMED",
      `Timeline control ${isPlaying ? 'paused' : 'resumed'}\n\n• Current time: ${formatTime(missionTime)}\n• Playback speed: ${playbackSpeed}x\n• All systems: ${isPlaying ? 'FROZEN' : 'ACTIVE'}\n• Data recording: CONTINUOUS`
    );
  };

  const handleRewind = () => {
    const newTime = Math.max(0, missionTime - 300); // Rewind 5 minutes
    onTimeChange(newTime);
    showMissionModal(
      "⏪ MISSION REWIND",
      `Timeline rewound by 5 minutes\n\n• Previous time: ${formatTime(missionTime)}\n• Current time: ${formatTime(newTime)}\n• Map state: RESTORED\n• All data: SYNCHRONIZED`
    );
  };

  const handleFastForward = () => {
    const newTime = missionTime + 300; // Fast forward 5 minutes
    onTimeChange(newTime);
    showMissionModal(
      "⏩ MISSION FAST FORWARD",
      `Timeline advanced by 5 minutes\n\n• Previous time: ${formatTime(missionTime)}\n• Current time: ${formatTime(newTime)}\n• Predictions: CALCULATED\n• Systems: UPDATED`
    );
  };

  const handleSpeedChange = () => {
    const speeds = [0.5, 1, 2, 4];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const newSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(newSpeed);
    showMissionModal(
      "⚡ PLAYBACK SPEED CHANGED",
      `Timeline speed adjusted\n\n• Previous speed: ${playbackSpeed}x\n• New speed: ${newSpeed}x\n• Real-time sync: ${newSpeed === 1 ? 'ACTIVE' : 'DISABLED'}\n• Simulation mode: ${newSpeed !== 1 ? 'ENABLED' : 'DISABLED'}`
    );
  };

  const handleResetTimeline = () => {
    onTimeChange(0);
    setIsPlaying(false);
    showMissionModal(
      "🔄 TIMELINE RESET",
      "Mission timeline reset to beginning\n\n• Time: 00:00:00\n• All events: CLEARED\n• Map state: INITIAL\n• Ready for replay\n• Historical data: PRESERVED",
      [
        { label: "Start Replay", action: () => setIsPlaying(true), variant: "primary" }
      ]
    );
  };

  const missionEvents = [
    { time: 0, event: "Mission Start", type: "milestone" },
    { time: 900, event: "First Checkpoint", type: "checkpoint" },
    { time: 1800, event: "Threat Detected", type: "threat" },
    { time: 2700, event: "Drone Deployed", type: "action" },
    { time: 3600, event: "Objective Complete", type: "milestone" },
  ];

  const getCurrentEvent = () => {
    const currentEvents = missionEvents.filter(event => Math.abs(event.time - missionTime) < 60);
    return currentEvents.length > 0 ? currentEvents[0] : null;
  };

  const currentEvent = getCurrentEvent();

  return (
    <div className="glass-panel rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-cyborg-teal">Mission Timeline</h3>
        <div className="text-sm text-gray-400">
          Speed: {playbackSpeed}x
        </div>
      </div>

      {/* Timeline Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>00:00:00</span>
          <span className="text-cyborg-teal font-mono font-bold">{formatTime(missionTime)}</span>
          <span>06:00:00</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 relative">
          <div 
            className="h-2 bg-gradient-to-r from-cyborg-teal to-neon-amber rounded-full transition-all duration-300"
            style={{ width: `${Math.min((missionTime / 21600) * 100, 100)}%` }}
          />
          
          {/* Event markers */}
          {missionEvents.map((event, index) => (
            <div
              key={index}
              className={`absolute top-0 w-2 h-2 rounded-full transform -translate-x-1/2 ${
                event.type === 'threat' ? 'bg-alert-red' :
                event.type === 'milestone' ? 'bg-cyborg-teal' :
                event.type === 'action' ? 'bg-neon-amber' : 'bg-blue-400'
              }`}
              style={{ left: `${(event.time / 21600) * 100}%` }}
              title={event.event}
            />
          ))}
        </div>
      </div>

      {/* Current Event */}
      {currentEvent && (
        <div className="mb-4 p-2 bg-cyborg-teal/10 border border-cyborg-teal/30 rounded">
          <div className="text-sm font-semibold text-cyborg-teal">Current Event</div>
          <div className="text-xs text-gray-300">{currentEvent.event}</div>
        </div>
      )}

      {/* Playback Controls */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={handleResetTimeline}
          className="p-2 rounded-lg bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 transition-all duration-300"
          title="Reset to start"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={handleRewind}
          className="p-2 rounded-lg bg-blue-400/20 text-blue-400 hover:bg-blue-400/30 transition-all duration-300"
          title="Rewind 5 minutes"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={handlePlayPause}
          className={`p-3 rounded-lg transition-all duration-300 ${
            isPlaying
              ? 'bg-neon-amber/20 text-neon-amber hover:bg-neon-amber/30'
              : 'bg-cyborg-teal/20 text-cyborg-teal hover:bg-cyborg-teal/30'
          }`}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>

        <button
          onClick={handleFastForward}
          className="p-2 rounded-lg bg-blue-400/20 text-blue-400 hover:bg-blue-400/30 transition-all duration-300"
          title="Fast forward 5 minutes"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        <button
          onClick={handleSpeedChange}
          className="p-2 rounded-lg bg-purple-400/20 text-purple-400 hover:bg-purple-400/30 transition-all duration-300"
          title="Change speed"
        >
          <FastForward className="w-4 h-4" />
        </button>
      </div>

      {/* Timeline scrubber */}
      <div className="mt-4">
        <input
          type="range"
          min="0"
          max="21600"
          value={missionTime}
          onChange={(e) => onTimeChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #00F0FF;
          border: 2px solid #0D0F14;
          cursor: pointer;
          box-shadow: 0 0 10px #00F0FF;
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #00F0FF;
          border: 2px solid #0D0F14;
          cursor: pointer;
          box-shadow: 0 0 10px #00F0FF;
        }
      `}</style>
    </div>
  );
}
