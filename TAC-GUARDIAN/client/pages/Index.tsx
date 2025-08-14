import { Navigation } from "@/components/Navigation";
import { AdvancedTacticalMap } from "@/components/AdvancedTacticalMap";
import { MultiSoldierRoster } from "@/components/MultiSoldierRoster";
import { ThreatSimulationConsole } from "@/components/ThreatSimulationConsole";
import { AICopilotPanel } from "@/components/AICopilotPanel";
import { SecurityLayer } from "@/components/SecurityLayer";
import { MissionPlayback } from "@/components/MissionPlayback";
import { ImpactButtons } from "@/components/ImpactButtons";
import { ModalNotificationContainer, showMissionModal } from "@/components/ModalNotification";
import { CinematicDemo } from "@/components/CinematicDemo";
import { SecurityVisualization } from "@/components/SecurityVisualization";
import { JudgeTriggerPanel } from "@/components/JudgeTriggerPanel";
import { Soundscape } from "@/components/Soundscape";
import { useState, useEffect } from "react";
import io from "socket.io-client";

export default function Index() {
  const [blackoutMode, setBlackoutMode] = useState(false);
  const [selectedSoldier, setSelectedSoldier] = useState<any>(null);
  const [showSoldierProfile, setShowSoldierProfile] = useState(false);
  const [mapViewLayer, setMapViewLayer] = useState("satellite");
  const [threatZones, setThreatZones] = useState<any[]>([]);
  const [missionTime, setMissionTime] = useState(0);
  const [droneActive, setDroneActive] = useState(false);
  const [quantumKeyRotation, setQuantumKeyRotation] = useState(0);
  const [cinematicActive, setCinematicActive] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  // Initialize WebSocket connection
  useEffect(() => {
    const socket = io();
    
    socket.on('connect', () => {
      setSocketConnected(true);
      console.log('Connected to storyline engine');
    });
    
    socket.on('disconnect', () => {
      setSocketConnected(false);
    });
    
    socket.on('storyline_event', (event) => {
      console.log('Received storyline event:', event);
      // Handle different event types
      switch (event.type) {
        case 'threat_spawn':
          setThreatZones(prev => [...prev, event.data]);
          break;
        case 'soldier_vitals':
          // Update soldier data
          break;
      }
    });
    
    return () => socket.close();
  }, []);

  // Simulate mission time progression
  useEffect(() => {
    const interval = setInterval(() => {
      setMissionTime(prev => prev + 1);
      setQuantumKeyRotation(prev => (prev + 1) % 8);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSoldierSelect = (soldier: any) => {
    setSelectedSoldier(soldier);
    setShowSoldierProfile(true);
  };

  const handleExecuteRescue = () => {
    showMissionModal(
      "🚁 EXECUTE RESCUE MISSION",
      "Helicopter extraction protocol initiated\n\n• Medical team Charlie en route\n• ETA to LZ: 4 minutes\n• Weather conditions: Favorable\n• Extraction clearance: GRANTED",
      [
        { label: "Launch Rescue", action: () => {
          showMissionModal("✅ RESCUE IN PROGRESS", "• Helicopter airborne\n• Medical team ready\n• Soldier being extracted\n• Expected safe arrival: 8 minutes");
        }, variant: "danger" },
        { label: "Abort", action: () => {}, variant: "secondary" }
      ]
    );
  };

  const handleLaunchDroneRecon = () => {
    setDroneActive(true);
    showMissionModal(
      "🛸 LAUNCH DRONE RECON",
      "Advanced reconnaissance drone deployment\n\n• Stealth mode: ACTIVE\n• AI scanning: ENABLED\n• Real-time intel: STREAMING\n• Threat detection: ENHANCED",
      [
        { label: "Monitor Feed", action: () => {
          showMissionModal("📡 DRONE ACTIVE", "• Scanning sector 7-Alpha\n• Thermal signatures detected\n• Adding intel markers to map\n• No immediate threats");
        }, variant: "primary" }
      ]
    );
  };

  const toggleBlackoutMode = () => {
    setBlackoutMode(!blackoutMode);
    if (!blackoutMode) {
      showMissionModal(
        "🔒 BLACKOUT MODE ACTIVATED",
        "OPSEC Protocol Engaged\n\n• All non-essential data hidden\n• Communications encrypted\n• Emergency channels only\n• Critical personnel tracking active"
      );
    }
  };

  const formatMissionTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      blackoutMode 
        ? 'bg-black text-alert-red' 
        : 'bg-void text-cyborg-teal'
    }`}>
      <Navigation />
      
      {/* Security Layer Overlay */}
      <SecurityLayer 
        blackoutMode={blackoutMode}
        quantumKeyRotation={quantumKeyRotation}
      />
      
      {/* Mission Header */}
      <div className={`border-b backdrop-blur-sm transition-all duration-500 relative ${
        blackoutMode
          ? 'border-alert-red/20 bg-black/90'
          : 'border-cyborg-teal/20 bg-void/80'
      }`}>
        {/* Animated border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyborg-teal/10 to-transparent animate-pulse" />
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6 relative z-10">
              <h1 className={`text-2xl font-bold neon-glow transition-all duration-500 ${
                blackoutMode ? 'text-alert-red' : 'text-cyborg-teal'
              }`}>
                <span className="inline-block hover:scale-105 transition-transform duration-300">
                  OPERATION GUARDIAN SHIELD
                </span>
              </h1>
              <div className="text-sm text-gray-400">
                Mission Time: <span className={`font-mono transition-all duration-500 ${
                  blackoutMode ? 'text-alert-red' : 'text-cyborg-teal'
                }`}>{formatMissionTime(missionTime)}</span>
              </div>
              {cinematicActive && (
                <div className="text-sm text-neon-amber animate-pulse">
                  🎬 CINEMATIC DEMO ACTIVE
                </div>
              )}
              {blackoutMode && (
                <div className="text-sm text-alert-red animate-pulse font-bold">
                  🔒 BLACKOUT ACTIVE
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="transform transition-all duration-300 hover:scale-105">
                <ImpactButtons
                  onExecuteRescue={handleExecuteRescue}
                  onLaunchDrone={handleLaunchDroneRecon}
                  droneActive={droneActive}
                />
              </div>
              
              <button
                onClick={toggleBlackoutMode}
                className={`px-4 py-2 border rounded-lg transition-all duration-300 font-semibold ${
                  blackoutMode
                    ? 'bg-alert-red/30 border-alert-red text-alert-red hover:bg-alert-red/40 animate-pulse'
                    : 'bg-neon-amber/20 border-neon-amber text-neon-amber hover:bg-neon-amber/30'
                }`}
              >
                {blackoutMode ? '🔓 EXIT BLACKOUT' : '🔒 BLACKOUT MODE'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Dashboard Layout */}
      <div className="container mx-auto px-3 py-4 relative">
        {/* Ambient grid background */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              animation: 'grid-pulse 4s ease-in-out infinite'
            }}
          />
        </div>

        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-180px)] relative z-10">
          
          {/* Left Panel - Multi-Soldier Roster & Controls */}
          <div className="col-span-3 space-y-3 animate-fade-in-left">
            <div className="max-h-64 overflow-y-auto">
              <MultiSoldierRoster 
                onSoldierSelect={handleSoldierSelect}
                blackoutMode={blackoutMode}
              />
            </div>
            
            {!blackoutMode && (
              <>
                <div className="max-h-48 overflow-y-auto">
                  <ThreatSimulationConsole 
                    onThreatSpawn={(threat) => setThreatZones(prev => [...prev, threat])}
                  />
                </div>
                
                <CinematicDemo 
                  onStorylineEvent={(event) => {
                    console.log('Cinematic event:', event);
                    if (event.type === 'threat_spawn') {
                      setThreatZones(prev => [...prev, event.data]);
                    }
                  }}
                  isActive={cinematicActive}
                  onToggle={setCinematicActive}
                />
              </>
            )}
          </div>
          
          {/* Center Panel - Advanced Tactical Map */}
          <div className="col-span-5 space-y-3 animate-fade-in-up">
            <div className="h-80">
              <AdvancedTacticalMap 
                onSoldierSelect={handleSoldierSelect}
                blackoutMode={blackoutMode}
                viewLayer={mapViewLayer}
                onViewLayerChange={setMapViewLayer}
                threatZones={threatZones}
                droneActive={droneActive}
              />
            </div>
            
            <MissionPlayback 
              missionTime={missionTime}
              onTimeChange={setMissionTime}
            />
            
            {!blackoutMode && (
              <div className="h-52">
                <SecurityVisualization 
                  blackoutMode={blackoutMode}
                  quantumKeyRotation={quantumKeyRotation}
                  onSecurityBreach={(breach) => {
                    console.log('Security breach:', breach);
                  }}
                />
              </div>
            )}
          </div>
          
          {/* Right Panel - AI Copilot & Controls */}
          <div className="col-span-4 space-y-3 animate-fade-in-right">
            <div className="max-h-64 overflow-y-auto">
              <AICopilotPanel 
                missionTime={missionTime}
                selectedSoldier={selectedSoldier}
                threatZones={threatZones}
              />
            </div>
            
            {!blackoutMode && (
              <JudgeTriggerPanel 
                onTriggerEvent={(event) => {
                  console.log('Judge trigger:', event);
                  // Handle judge triggers
                  if (event.type === 'blackout') {
                    setBlackoutMode(true);
                    setTimeout(() => setBlackoutMode(false), event.data.duration * 1000);
                  }
                }}
              />
            )}
            
            {/* Mission Controls */}
            <div className="glass-panel rounded-lg p-3">
              <h3 className={`text-sm font-semibold mb-3 ${
                blackoutMode ? 'text-alert-red' : 'text-cyborg-teal'
              }`}>
                Mission Controls
              </h3>
              <div className="space-y-2">
                <button 
                  onClick={() => showMissionModal("🎯 MISSION BRIEFING", "Operation Guardian Shield\n\n• Objective: Secure and extract HVT\n• Timeline: 6 hours\n• Risk Level: HIGH\n• Support Assets: Available")}
                  className="w-full px-3 py-2 bg-cyborg-teal/20 border border-cyborg-teal text-cyborg-teal rounded-lg hover:bg-cyborg-teal/30 transition-all duration-300 text-xs"
                >
                  📋 Mission Brief
                </button>
                
                <button 
                  onClick={() => showMissionModal("📊 SITREP", "Current Situation Report\n\n• All units operational\n• No casualties reported\n• Objectives 67% complete\n• Weather: Clear")}
                  className="w-full px-3 py-2 bg-neon-amber/20 border border-neon-amber text-neon-amber rounded-lg hover:bg-neon-amber/30 transition-all duration-300 text-xs"
                >
                  📊 SITREP
                </button>
                
                <button 
                  onClick={() => showMissionModal("🚨 EMERGENCY PROTOCOLS", "Emergency Response Options\n\n• Immediate extraction available\n• Medical teams on standby\n• Air support ready\n• Abort procedures prepared", [
                    { label: "Request Support", action: () => {}, variant: "danger" },
                    { label: "Continue Mission", action: () => {}, variant: "primary" }
                  ])}
                  className="w-full px-3 py-2 bg-alert-red/20 border border-alert-red text-alert-red rounded-lg hover:bg-alert-red/30 transition-all duration-300 animate-pulse text-xs"
                >
                  🚨 Emergency
                </button>
              </div>
              
              {socketConnected && (
                <div className="mt-3 text-xs text-green-400 flex items-center justify-center">
                  🟢 Backend Connected
                </div>
              )}
            </div>

            {/* Soundscape Controls */}
            {!blackoutMode && (
              <Soundscape
                cinematicActive={cinematicActive}
                blackoutMode={blackoutMode}
                threatLevel={threatZones.length > 3 ? 'high' : threatZones.length > 1 ? 'medium' : 'low'}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Modal Container */}
      <ModalNotificationContainer />

      <style jsx>{`
        @keyframes grid-pulse {
          0%, 100% { opacity: 0.05; }
          50% { opacity: 0.15; }
        }

        @keyframes fade-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-left {
          animation: fade-in-left 0.8s ease-out forwards;
        }

        .animate-fade-in-right {
          animation: fade-in-right 0.8s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
