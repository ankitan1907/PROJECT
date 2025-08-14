import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { showMissionModal } from "./ModalNotification";

interface CinematicDemoProps {
  onStorylineEvent: (event: StorylineEvent) => void;
  isActive: boolean;
  onToggle: (active: boolean) => void;
}

interface StorylineEvent {
  type: 'soldier_status' | 'threat_spawn' | 'map_animation' | 'ai_narration' | 'sound_effect';
  data: any;
  timestamp: number;
}

const demoStoryline = [
  {
    time: 0,
    title: "MISSION INITIATION",
    events: [
      { type: 'ai_narration', data: "Operation Guardian Shield is now active. Alpha team moving to designated insertion point." },
      { type: 'sound_effect', data: 'radio_static' }
    ]
  },
  {
    time: 5,
    title: "TEAM DEPLOYMENT",
    events: [
      { type: 'soldier_status', data: { soldier: 'TAC-1058', status: 'moving', location: 'insertion_point' } },
      { type: 'map_animation', data: { type: 'zoom_to', coordinates: [35.2, 45.8] } },
      { type: 'ai_narration', data: "Alpha team has reached the insertion point. Beginning tactical advance." }
    ]
  },
  {
    time: 12,
    title: "HOSTILE ZONE ENTRY",
    events: [
      { type: 'threat_spawn', data: { type: 'hostile_patrol', sector: '7A', threat_level: 'medium' } },
      { type: 'soldier_status', data: { soldier: 'TAC-1058', hr: 95, status: 'alert' } },
      { type: 'ai_narration', data: "Movement detected in sector 7-Alpha. Recommend stealth approach." },
      { type: 'sound_effect', data: 'footsteps_hostile' }
    ]
  },
  {
    time: 20,
    title: "DRONE RECONNAISSANCE",
    events: [
      { type: 'map_animation', data: { type: 'drone_deploy', path: [[35.2, 45.8], [35.3, 45.9]] } },
      { type: 'ai_narration', data: "Deploying reconnaissance drone for tactical assessment." },
      { type: 'sound_effect', data: 'drone_whir' }
    ]
  },
  {
    time: 28,
    title: "CONTACT - SOLDIER DOWN",
    events: [
      { type: 'soldier_status', data: { soldier: 'TAC-1062', status: 'wounded', hr: 120 } },
      { type: 'threat_spawn', data: { type: 'sniper_position', sector: '8B', threat_level: 'high' } },
      { type: 'ai_narration', data: "Soldier down! Sniper contact in sector 8-Bravo. Immediate medical assistance required." },
      { type: 'sound_effect', data: 'gunfire' }
    ]
  },
  {
    time: 35,
    title: "RESCUE INITIATED",
    events: [
      { type: 'map_animation', data: { type: 'rescue_route', path: [[35.1, 45.7], [35.2, 45.8]] } },
      { type: 'soldier_status', data: { soldier: 'TAC-1059', status: 'rescue_mode' } },
      { type: 'ai_narration', data: "Rescue operation initiated. Medical team Charlie en route to wounded soldier's position." },
      { type: 'sound_effect', data: 'helicopter_distant' }
    ]
  },
  {
    time: 42,
    title: "EXTRACTION SUCCESS",
    events: [
      { type: 'soldier_status', data: { soldier: 'TAC-1062', status: 'evacuated' } },
      { type: 'map_animation', data: { type: 'extraction_complete' } },
      { type: 'ai_narration', data: "Wounded soldier successfully extracted. Mission objectives updated." },
      { type: 'sound_effect', data: 'all_clear' }
    ]
  }
];

export function CinematicDemo({ onStorylineEvent, isActive, onToggle }: CinematicDemoProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPaused, setPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentScene, setCurrentScene] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          
          // Check for storyline events at this time
          const currentStorylineItem = demoStoryline.find(item => item.time === newTime);
          if (currentStorylineItem) {
            setCurrentScene(demoStoryline.indexOf(currentStorylineItem));
            
            showMissionModal(
              `🎬 ${currentStorylineItem.title}`,
              `Cinematic Demo - Scene ${demoStoryline.indexOf(currentStorylineItem) + 1}/${demoStoryline.length}`,
              [{ label: "Continue", action: () => {}, variant: "primary" }]
            );

            // Trigger each event
            currentStorylineItem.events.forEach(event => {
              onStorylineEvent({
                type: event.type as any,
                data: event.data,
                timestamp: newTime
              });
            });

            // Play sound effects if enabled
            if (soundEnabled && event.type === 'sound_effect') {
              playSound(event.data);
            }
          }

          // End demo after last scene
          if (newTime >= 50) {
            onToggle(false);
            setCurrentTime(0);
            setCurrentScene(0);
            showMissionModal(
              "🎬 DEMO COMPLETE",
              "Cinematic demonstration finished.\n\nAll interactive features remain available for live operation.",
              [{ label: "Continue Mission", action: () => {}, variant: "primary" }]
            );
            return 0;
          }

          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused, onStorylineEvent, onToggle, soundEnabled]);

  const playSound = (soundType: string) => {
    if (!soundEnabled) return;
    
    // Simulate sound effects with console logs for now
    // In a real implementation, you'd play actual audio files
    console.log(`🔊 Playing sound: ${soundType}`);
  };

  const handleStart = () => {
    setCurrentTime(0);
    setCurrentScene(0);
    setPaused(false);
    onToggle(true);
    
    showMissionModal(
      "🎬 CINEMATIC DEMO STARTED",
      "Prepare for automated mission storyline demonstration.\n\nSit back and watch the tactical scenario unfold automatically.",
      [{ label: "Begin Demo", action: () => {}, variant: "primary" }]
    );
  };

  const handlePause = () => {
    setPaused(!isPaused);
  };

  const handleReset = () => {
    setCurrentTime(0);
    setCurrentScene(0);
    setPaused(false);
    onToggle(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-panel rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-cyborg-teal flex items-center">
          🎬 Cinematic Demo Mode
        </h3>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded-lg transition-all duration-300 ${
            soundEnabled 
              ? 'bg-cyborg-teal/20 text-cyborg-teal' 
              : 'bg-gray-600/20 text-gray-400'
          }`}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>

      {isActive && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Scene {currentScene + 1}/{demoStoryline.length}</span>
            <span className="text-cyborg-teal font-mono">{formatTime(currentTime)}/0:50</span>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-cyborg-teal to-neon-amber h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(currentTime / 50) * 100}%` }}
            />
          </div>

          {currentScene < demoStoryline.length && (
            <div className="text-sm text-gray-300 p-3 bg-void/50 rounded-lg border border-cyborg-teal/20">
              <span className="text-cyborg-teal font-semibold">Current: </span>
              {demoStoryline[currentScene]?.title || "Preparing..."}
            </div>
          )}
        </div>
      )}

      <div className="flex space-x-2">
        {!isActive ? (
          <button
            onClick={handleStart}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-cyborg-teal to-neon-amber text-black font-semibold rounded-lg hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <Play size={16} />
            <span>Start Simulation</span>
          </button>
        ) : (
          <>
            <button
              onClick={handlePause}
              className={`flex-1 px-4 py-2 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                isPaused 
                  ? 'bg-neon-amber/20 border border-neon-amber text-neon-amber' 
                  : 'bg-cyborg-teal/20 border border-cyborg-teal text-cyborg-teal'
              }`}
            >
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>
            
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-alert-red/20 border border-alert-red text-alert-red rounded-lg hover:bg-alert-red/30 transition-all duration-300 flex items-center space-x-2"
            >
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
          </>
        )}
      </div>

      <div className="text-xs text-gray-400 text-center">
        Auto-plays mission storyline with map animations, soldier updates, and AI narrations
      </div>
    </div>
  );
}
