import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import { AlertTriangle, Zap, CloudSnow, Radio, Eye } from "lucide-react";
import { showMissionModal, showSuccessModal, showWarningModal } from "./ModalNotification";
import { useNotifications, createMissionNotification, createWarningNotification, createSuccessNotification } from "./NotificationSystem";

// Extended mock soldier data with more soldiers
const soldiers = [
  { id: "TAC-1058", name: "SGT Alpha", rank: "Sergeant", status: "normal", position: [2, 0, 1], hr: 85, photo: "👤" },
  { id: "TAC-2041", name: "CPL Bravo", rank: "Corporal", status: "elevated", position: [-1, 0, 2], hr: 115, photo: "👤" },
  { id: "TAC-3092", name: "PVT Charlie", rank: "Private", status: "critical", position: [0, 0, -2], hr: 165, photo: "👤" },
  { id: "TAC-4015", name: "SGT Delta", rank: "Sergeant", status: "normal", position: [3, 0, -1], hr: 78, photo: "👤" },
  { id: "TAC-5023", name: "CPL Echo", rank: "Corporal", status: "elevated", position: [-2, 0, 0], hr: 108, photo: "👤" },
  { id: "TAC-6017", name: "PVT Foxtrot", rank: "Private", status: "normal", position: [1, 0, 3], hr: 82, photo: "👤" },
];

const threatZones = [
  { id: 1, position: [-2, 0, 0], radius: 1.5, intensity: 0.8, type: "explosion" },
  { id: 2, position: [1, 0, 3], radius: 1.0, intensity: 0.5, type: "sniper" },
];

const environmentalEvents = [
  { id: 1, position: [0, 2, 0], type: "weather", active: true },
  { id: 2, position: [2, 1, 2], type: "comms_loss", active: false },
];

function SoldierAvatar({ soldier, onClick, blackoutMode }: { soldier: any; onClick: (soldier: any) => void; blackoutMode: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.02;
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.2 + 1;
      ringRef.current.scale.setScalar(pulse);
    }
  });

  const getColor = () => {
    if (blackoutMode && soldier.status !== "critical") return "#333333";
    switch (soldier.status) {
      case "critical": return "#FF2E4D";
      case "elevated": return "#FFA500";
      default: return "#00F0FF";
    }
  };

  return (
    <group position={soldier.position} onClick={() => onClick(soldier)}>
      {/* Pulsing health ring */}
      <mesh ref={ringRef} position={[0, 0.1, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <ringGeometry args={[0.4, 0.6, 16]} />
        <meshStandardMaterial color={getColor()} transparent opacity={0.6} />
      </mesh>
      
      {/* Soldier body */}
      <mesh ref={meshRef} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.6]} />
        <meshStandardMaterial color={getColor()} emissive={getColor()} emissiveIntensity={0.3} />
      </mesh>
      
      {/* Name tag */}
      {!blackoutMode && (
        <Text
          position={[0, 1, 0]}
          fontSize={0.15}
          color={getColor()}
          anchorX="center"
          anchorY="middle"
        >
          {soldier.name}
        </Text>
      )}
      
      {/* ID for blackout mode */}
      {blackoutMode && (
        <Text
          position={[0, 1, 0]}
          fontSize={0.12}
          color={soldier.status === "critical" ? "#FF2E4D" : "#666666"}
          anchorX="center"
          anchorY="middle"
        >
          {soldier.id}
        </Text>
      )}
    </group>
  );
}

function ThreatZone({ zone, blackoutMode }: { zone: any; blackoutMode: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.3 + 0.7;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  if (blackoutMode) return null;

  return (
    <mesh ref={meshRef} position={zone.position} receiveShadow>
      <cylinderGeometry args={[zone.radius, zone.radius, 0.1]} />
      <meshStandardMaterial 
        color="#FF2E4D" 
        transparent 
        opacity={zone.intensity * 0.3}
        emissive="#FF2E4D"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

function EnvironmentalEvent({ event, blackoutMode }: { event: any; blackoutMode: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && event.active) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.2 + event.position[1];
    }
  });

  if (blackoutMode) return null;

  const getColor = () => {
    switch (event.type) {
      case "weather": return "#87CEEB";
      case "comms_loss": return "#FF6B6B";
      default: return "#FFA500";
    }
  };

  return (
    <group position={event.position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.1]} />
        <meshStandardMaterial 
          color={getColor()} 
          emissive={getColor()} 
          emissiveIntensity={event.active ? 0.5 : 0.1} 
        />
      </mesh>
    </group>
  );
}

function Terrain() {
  return (
    <group>
      {/* Main terrain */}
      <mesh receiveShadow position={[0, -0.1, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1A1D23" opacity={0.8} transparent />
      </mesh>
      
      {/* Terrain features */}
      <mesh position={[3, 0, 2]}>
        <boxGeometry args={[1, 0.2, 1]} />
        <meshStandardMaterial color="#2A2D33" />
      </mesh>
      
      <mesh position={[-2, 0, -3]}>
        <boxGeometry args={[1.5, 0.3, 0.8]} />
        <meshStandardMaterial color="#2A2D33" />
      </mesh>
    </group>
  );
}

export function EnhancedTacticalMap({ onSoldierSelect, blackoutMode }: { onSoldierSelect: (soldier: any) => void; blackoutMode: boolean }) {
  const [selectedSoldier, setSelectedSoldier] = useState<any>(null);
  const [showThreatAnalysis, setShowThreatAnalysis] = useState(false);
  const [droneDeployed, setDroneDeployed] = useState(false);
  const [weatherOverlay, setWeatherOverlay] = useState(false);
  const { addNotification } = useNotifications();

  const handleSoldierClick = (soldier: any) => {
    setSelectedSoldier(soldier);
    onSoldierSelect(soldier);
  };

  const handleThreatAnalysis = () => {
    setShowThreatAnalysis(!showThreatAnalysis);
    if (!showThreatAnalysis) {
      addNotification(createMissionNotification(
        "🎯 THREAT ANALYSIS",
        "Analyzing threat zones...",
        [{ label: "View Results", action: () => {}, variant: "primary" }]
      ));

      setTimeout(() => {
        addNotification(createWarningNotification(
          "🎯 THREAT ANALYSIS COMPLETE",
          "• 2 Active threat zones detected\n• Recommended action: Reroute units Alpha & Bravo\n• Estimated threat duration: 45 minutes\n• Threat level: MEDIUM"
        ));
      }, 2000);
    }
  };

  const handleDeployDrone = () => {
    setDroneDeployed(true);
    addNotification(createMissionNotification(
      "🚁 DRONE DEPLOYED",
      "Recon drone launched from base\n\n• ETA to AO: 3 minutes\n• Live feed will be available shortly\n• Scanning for hostiles and optimal routes",
      [{ label: "Track Drone", action: () => {}, variant: "primary" }]
    ));

    setTimeout(() => {
      addNotification(createSuccessNotification(
        "📡 DRONE ON STATION",
        "��� Visual confirmation of threat zones\n• No additional hostiles detected\n• All clear for advance\n• Live feed operational"
      ));
    }, 5000);
  };

  const handleWeatherUpdate = () => {
    setWeatherOverlay(!weatherOverlay);
    if (!weatherOverlay) {
      addNotification(createWarningNotification(
        "🌧️ WEATHER UPDATE",
        "Storm front approaching from northwest\n\n• Visibility will drop to 200m in 30 minutes\n• Wind speeds: 25-30 mph\n• Recommend accelerated timeline\n• Air support may be affected"
      ));
    }
  };

  const handleEmergencyEvac = () => {
    addNotification(createMissionNotification(
      "🚨 EMERGENCY EVACUATION",
      "All units proceed to nearest LZ\n\n• Medical teams standing by\n• ETA to extraction: 8 minutes\n• Helicopter en route\n• Maintain radio contact",
      [
        { label: "Confirm Evac", action: () => {}, variant: "danger" },
        { label: "Cancel", action: () => {}, variant: "secondary" }
      ]
    ));
  };

  const handleCommsCheck = () => {
    addNotification(createSuccessNotification(
      "📻 COMMUNICATIONS CHECK",
      "• All units responding\n• Signal strength: 87%\n• Backup channels online\n• Encryption functional"
    ));
  };

  const handleOverwatch = () => {
    addNotification(createMissionNotification(
      "👁️ OVERWATCH ACTIVATED",
      "Satellite surveillance online\n\n• All personnel positions tracked\n• Real-time threat monitoring active\n• AI pattern recognition enabled\n• Command has full situational awareness"
    ));
  };

  return (
    <div className="glass-panel rounded-lg p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-xl font-bold neon-glow ${blackoutMode ? 'text-alert-red' : 'text-cyborg-teal'}`}>
          {blackoutMode ? 'Emergency Tactical Map' : 'Live Battle Map'}
        </h2>
        <div className="flex space-x-2 text-sm">
          {!blackoutMode && (
            <>
              <span className="text-cyborg-teal">⚪ Normal</span>
              <span className="text-neon-amber">🟡 Elevated</span>
            </>
          )}
          <span className="text-alert-red">🔴 Critical</span>
        </div>
      </div>
      
      {/* Interactive Control Panel */}
      <div className="grid grid-cols-6 gap-2 mb-4">
        <button
          onClick={handleThreatAnalysis}
          className={`px-2 py-1 text-xs rounded transition-all duration-300 ${
            showThreatAnalysis
              ? 'bg-alert-red/30 text-alert-red border border-alert-red'
              : 'bg-alert-red/20 text-alert-red hover:bg-alert-red/30'
          }`}
        >
          <AlertTriangle className="w-3 h-3 inline mr-1" />
          Threats
        </button>
        
        {!blackoutMode && (
          <>
            <button
              onClick={handleDeployDrone}
              className={`px-2 py-1 text-xs rounded transition-all duration-300 ${
                droneDeployed
                  ? 'bg-cyborg-teal/30 text-cyborg-teal border border-cyborg-teal'
                  : 'bg-cyborg-teal/20 text-cyborg-teal hover:bg-cyborg-teal/30'
              }`}
            >
              🚁 Drone
            </button>
            
            <button
              onClick={handleWeatherUpdate}
              className={`px-2 py-1 text-xs rounded transition-all duration-300 ${
                weatherOverlay
                  ? 'bg-blue-400/30 text-blue-400 border border-blue-400'
                  : 'bg-blue-400/20 text-blue-400 hover:bg-blue-400/30'
              }`}
            >
              <CloudSnow className="w-3 h-3 inline mr-1" />
              Weather
            </button>
          </>
        )}
        
        <button
          onClick={handleEmergencyEvac}
          className="px-2 py-1 text-xs rounded bg-alert-red/20 text-alert-red hover:bg-alert-red/30 transition-all duration-300 animate-pulse"
        >
          🚨 Evac
        </button>
        
        <button
          onClick={handleCommsCheck}
          className="px-2 py-1 text-xs rounded bg-neon-amber/20 text-neon-amber hover:bg-neon-amber/30 transition-all duration-300"
        >
          <Radio className="w-3 h-3 inline mr-1" />
          Comms
        </button>
        
        <button
          onClick={handleOverwatch}
          className="px-2 py-1 text-xs rounded bg-cyborg-teal/20 text-cyborg-teal hover:bg-cyborg-teal/30 transition-all duration-300"
        >
          <Eye className="w-3 h-3 inline mr-1" />
          Overwatch
        </button>
      </div>
      
      <div className="h-[500px] rounded-lg overflow-hidden border border-cyborg-teal/30">
        <Canvas camera={{ position: [5, 5, 5], fov: 60 }} shadows>
          <ambientLight intensity={blackoutMode ? 0.1 : 0.3} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={blackoutMode ? 0.3 : 1} 
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <pointLight position={[0, 5, 0]} intensity={0.5} color={blackoutMode ? "#FF2E4D" : "#00F0FF"} />
          
          <Terrain />
          
          {soldiers.map((soldier) => (
            <SoldierAvatar 
              key={soldier.id} 
              soldier={soldier} 
              onClick={handleSoldierClick}
              blackoutMode={blackoutMode}
            />
          ))}
          
          {threatZones.map((zone) => (
            <ThreatZone key={zone.id} zone={zone} blackoutMode={blackoutMode} />
          ))}
          
          {environmentalEvents.map((event) => (
            <EnvironmentalEvent key={event.id} event={event} blackoutMode={blackoutMode} />
          ))}
          
          <OrbitControls enableZoom={true} />
        </Canvas>
      </div>
      
      {selectedSoldier && (
        <div className="mt-4 p-3 bg-cyborg-teal/10 border border-cyborg-teal/30 rounded-lg">
          <h4 className="font-semibold text-cyborg-teal">{selectedSoldier.name}</h4>
          <div className="text-sm text-gray-300 mt-1">
            <p>ID: {selectedSoldier.id} | Rank: {selectedSoldier.rank}</p>
            <p>Heart Rate: {selectedSoldier.hr} BPM</p>
            <p>Status: <span className={`font-semibold ${
              selectedSoldier.status === 'critical' ? 'text-alert-red' :
              selectedSoldier.status === 'elevated' ? 'text-neon-amber' : 'text-cyborg-teal'
            }`}>{selectedSoldier.status.toUpperCase()}</span></p>
          </div>
        </div>
      )}
    </div>
  );
}
