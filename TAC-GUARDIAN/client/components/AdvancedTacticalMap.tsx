import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import { Layers, Satellite, Thermometer, Radio, Target, Zap, CloudSnow, Eye } from "lucide-react";
import { showMissionModal, showSuccessModal, showWarningModal } from "./ModalNotification";

// Extended soldier data with threat zones
const soldiers = [
  { id: "TAC-1058", name: "SGT Alpha", status: "normal", position: [2, 0, 1], hr: 85, encryption: "AES-256" },
  { id: "TAC-2041", name: "CPL Bravo", status: "elevated", position: [-1, 0, 2], hr: 115, encryption: "AES-192" },
  { id: "TAC-3092", name: "PVT Charlie", status: "critical", position: [0, 0, -2], hr: 165, encryption: "AES-128" },
  { id: "TAC-4015", name: "SGT Delta", status: "normal", position: [3, 0, -1], hr: 78, encryption: "AES-256" },
  { id: "TAC-5023", name: "LT Echo", status: "elevated", position: [-2, 0, 0], hr: 108, encryption: "AES-256" },
  { id: "TAC-6017", name: "MED Foxtrot", status: "normal", position: [1, 0, 3], hr: 82, encryption: "AES-256" },
];

const dynamicThreats = [
  { id: 1, type: "SAM", position: [-3, 0, -1], radius: 2.0, intensity: 0.9, active: true },
  { id: 2, type: "JAMMING", position: [2, 0, 3], radius: 1.5, intensity: 0.7, active: true },
  { id: 3, type: "HOSTILE", position: [-1, 0, -3], radius: 1.0, intensity: 0.6, active: false },
];

function SoldierAvatar({ soldier, onClick, blackoutMode, viewLayer }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.01;
    }
    if (pulseRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.3 + 0.7;
      pulseRef.current.scale.setScalar(pulse);
      pulseRef.current.material.opacity = pulse * 0.5;
    }
  });

  const getColor = () => {
    if (viewLayer === "thermal") {
      return soldier.status === "critical" ? "#FF0000" : "#00FFFF";
    }
    if (blackoutMode && soldier.status !== "critical") return "#333333";
    switch (soldier.status) {
      case "critical": return "#FF2E4D";
      case "elevated": return "#FFA500";
      default: return "#00F0FF";
    }
  };

  const getEncryptionGlow = () => {
    switch (soldier.encryption) {
      case "AES-256": return 0.5;
      case "AES-192": return 0.3;
      default: return 0.1;
    }
  };

  return (
    <group position={soldier.position} onClick={() => onClick(soldier)}>
      {/* Base platform */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <circleGeometry args={[0.8, 16]} />
        <meshStandardMaterial
          color={getColor()}
          transparent
          opacity={0.1}
          emissive={getColor()}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Pulsing status ring */}
      <mesh ref={pulseRef} position={[0, 0.05, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <ringGeometry args={[0.4, 0.5, 16]} />
        <meshStandardMaterial
          color={getColor()}
          transparent
          opacity={0.8}
          emissive={getColor()}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Rotating status indicator */}
      <mesh ref={ringRef} position={[0, 0.1, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <ringGeometry args={[0.6, 0.65, 16]} />
        <meshStandardMaterial
          color={getColor()}
          transparent
          opacity={getEncryptionGlow()}
        />
      </mesh>

      {/* Military marker (diamond shape) */}
      <mesh ref={meshRef} castShadow>
        <octahedronGeometry args={[0.15]} />
        <meshStandardMaterial
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={viewLayer === "thermal" ? 0.8 : 0.4}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      {/* Status beam */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.6]} />
        <meshStandardMaterial
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={0.6}
          transparent
          opacity={0.7}
        />
      </mesh>
      
      {/* Name/ID tag */}
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
    </group>
  );
}

function DynamicThreatZone({ threat, blackoutMode }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const warningRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && threat.active) {
      const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.3 + 0.7;
      meshRef.current.scale.setScalar(pulse);
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.02;
    }
    if (warningRef.current) {
      const warning = Math.sin(state.clock.elapsedTime * 6) * 0.5 + 0.5;
      warningRef.current.material.opacity = warning;
    }
  });

  if (blackoutMode && threat.type !== "HOSTILE") return null;

  const getThreatColor = () => {
    switch (threat.type) {
      case "SAM": return "#FF2E4D";
      case "JAMMING": return "#FFA500";
      case "HOSTILE": return "#FF6B6B";
      default: return "#FF2E4D";
    }
  };

  return (
    <group position={threat.position}>
      {/* Threat zone base */}
      <mesh ref={meshRef} receiveShadow rotation={[-Math.PI/2, 0, 0]}>
        <circleGeometry args={[threat.radius, 32]} />
        <meshStandardMaterial
          color={getThreatColor()}
          transparent
          opacity={threat.intensity * 0.2}
          emissive={getThreatColor()}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Warning perimeter */}
      <mesh ref={ringRef} position={[0, 0.05, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <ringGeometry args={[threat.radius * 0.8, threat.radius, 16]} />
        <meshStandardMaterial
          color={getThreatColor()}
          transparent
          opacity={0.6}
          emissive={getThreatColor()}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Central threat marker */}
      <mesh position={[0, 0.3, 0]}>
        <coneGeometry args={[0.15, 0.4, 6]} />
        <meshStandardMaterial
          color={getThreatColor()}
          emissive={getThreatColor()}
          emissiveIntensity={0.8}
          metalness={0.2}
          roughness={0.8}
        />
      </mesh>

      {/* Warning beacon */}
      <mesh ref={warningRef} position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.08]} />
        <meshStandardMaterial
          color={getThreatColor()}
          emissive={getThreatColor()}
          emissiveIntensity={1.0}
          transparent
        />
      </mesh>
    </group>
  );
}

function DroneModel({ active, position }: any) {
  const droneRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (droneRef.current && active) {
      droneRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.5) * 3;
      droneRef.current.position.z = Math.cos(state.clock.elapsedTime * 0.5) * 3;
      droneRef.current.position.y = 2 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  if (!active) return null;

  return (
    <group ref={droneRef} position={position}>
      <mesh>
        <boxGeometry args={[0.3, 0.1, 0.3]} />
        <meshStandardMaterial color="#00F0FF" emissive="#00F0FF" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Scanning beam */}
      <mesh position={[0, -1, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <coneGeometry args={[2, 2, 8]} />
        <meshStandardMaterial 
          color="#00F0FF" 
          transparent 
          opacity={0.1} 
          emissive="#00F0FF"
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
}

function Terrain({ viewLayer }: any) {
  const getTerrainColor = () => {
    switch (viewLayer) {
      case "thermal": return "#330066";
      case "signal": return "#001122";
      case "hostileHeatmap": return "#220000";
      default: return "#1A1D23";
    }
  };

  return (
    <group>
      <mesh receiveShadow position={[0, -0.1, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color={getTerrainColor()} opacity={0.8} transparent />
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

export function AdvancedTacticalMap({ 
  onSoldierSelect, 
  blackoutMode, 
  viewLayer, 
  onViewLayerChange, 
  threatZones = [], 
  droneActive 
}: any) {
  const [selectedSoldier, setSelectedSoldier] = useState<any>(null);
  const [aiRoutes, setAiRoutes] = useState<any[]>([]);

  const handleSoldierClick = (soldier: any) => {
    setSelectedSoldier(soldier);
    onSoldierSelect(soldier);
  };

  const handleThreatAnalysis = () => {
    showMissionModal(
      "🎯 THREAT ANALYSIS",
      "Advanced AI threat assessment initiated\n\n• Scanning 360° perimeter\n• Analyzing threat patterns\n• Calculating risk vectors\n• Updating tactical recommendations",
      [{ label: "View Results", action: () => {
        setTimeout(() => {
          showWarningModal("🎯 THREAT ANALYSIS COMPLETE", "• 3 Active threat zones identified\n• SAM site detected at grid 7-Alpha\n• Electronic jamming in sector 5\n• Recommended action: Implement alternate routes\n• Threat assessment: ELEVATED");
        }, 2000);
      }, variant: "primary" }]
    );
  };

  const handleAIRouteCalculation = () => {
    showMissionModal(
      "🤖 AI ROUTE OPTIMIZATION",
      "Advanced pathfinding algorithm engaged\n\n• Analyzing terrain data\n• Factoring threat zones\n• Calculating fuel efficiency\n• Optimizing for mission objectives",
      [{ label: "Apply Routes", action: () => {
        setAiRoutes([
          { start: [2, 0, 1], end: [3, 0, -1], safe: true },
          { start: [-1, 0, 2], end: [1, 0, 3], safe: false }
        ]);
        showSuccessModal("✅ ROUTES UPDATED", "AI-optimized routes applied\n\n• 2 new safe corridors identified\n• Threat avoidance: 94% effective\n• ETA improved by 12 minutes\n• All units notified");
      }, variant: "primary" }]
    );
  };

  const viewLayers = [
    { id: "satellite", label: "Satellite", icon: Satellite },
    { id: "thermal", label: "Thermal", icon: Thermometer },
    { id: "signal", label: "Signal", icon: Radio },
    { id: "hostileHeatmap", label: "Threats", icon: Target }
  ];

  return (
    <div className="glass-panel rounded-lg p-3 h-full">
      <div className="flex justify-between items-center mb-3">
        <h2 className={`text-lg font-bold neon-glow ${blackoutMode ? 'text-alert-red' : 'text-cyborg-teal'}`}>
          Tactical Map
        </h2>

        {/* Simplified View Layer Controls */}
        <div className="flex space-x-1">
          {viewLayers.map((layer) => {
            const Icon = layer.icon;
            return (
              <button
                key={layer.id}
                onClick={() => onViewLayerChange(layer.id)}
                className={`p-2 rounded transition-all duration-300 ${
                  viewLayer === layer.id
                    ? 'bg-cyborg-teal/30 text-cyborg-teal border border-cyborg-teal'
                    : 'bg-gray-600/20 text-gray-400 hover:text-cyborg-teal'
                }`}
                title={layer.label}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Simplified Controls - Only Essential Ones */}
      <div className="flex space-x-2 mb-3">
        <button
          onClick={handleThreatAnalysis}
          className="px-3 py-1 text-xs rounded bg-alert-red/20 text-alert-red hover:bg-alert-red/30 transition-all duration-300 flex items-center space-x-1"
        >
          <Target className="w-3 h-3" />
          <span>Threats</span>
        </button>

        <button
          onClick={handleAIRouteCalculation}
          className="px-3 py-1 text-xs rounded bg-cyborg-teal/20 text-cyborg-teal hover:bg-cyborg-teal/30 transition-all duration-300 flex items-center space-x-1"
        >
          <span>🤖</span>
          <span>AI Routes</span>
        </button>

        <button
          onClick={() => showMissionModal("👁️ OVERWATCH", "Enhanced surveillance activated\n\n• Satellite tracking: ONLINE\n• AI monitoring: ACTIVE\n• Threat detection: ENHANCED\n• Real-time updates: STREAMING")}
          className="px-3 py-1 text-xs rounded bg-cyborg-teal/20 text-cyborg-teal hover:bg-cyborg-teal/30 transition-all duration-300 flex items-center space-x-1"
        >
          <Eye className="w-3 h-3" />
          <span>Overwatch</span>
        </button>
      </div>

      <div className="h-full rounded-lg overflow-hidden border border-cyborg-teal/30 bg-void/50 relative">
        {/* Radar sweep overlay */}
        <div className="absolute top-2 right-2 w-8 h-8 border border-cyborg-teal/50 rounded-full animate-ping" />
        <div className="absolute top-3 right-3 w-6 h-6 bg-cyborg-teal/20 rounded-full animate-pulse" />
        <Canvas camera={{ position: [5, 5, 5], fov: 60 }} shadows>
          <ambientLight intensity={blackoutMode ? 0.1 : 0.3} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={blackoutMode ? 0.3 : 1}
            castShadow
          />
          <pointLight
            position={[0, 5, 0]}
            intensity={0.5}
            color={viewLayer === "thermal" ? "#FF0000" : "#00F0FF"}
          />

          <Terrain viewLayer={viewLayer} />

          {soldiers.map((soldier) => (
            <SoldierAvatar
              key={soldier.id}
              soldier={soldier}
              onClick={handleSoldierClick}
              blackoutMode={blackoutMode}
              viewLayer={viewLayer}
            />
          ))}

          {dynamicThreats.map((threat) => (
            <DynamicThreatZone
              key={threat.id}
              threat={threat}
              blackoutMode={blackoutMode}
            />
          ))}

          {threatZones.map((zone: any, index: number) => (
            <DynamicThreatZone
              key={`custom-${index}`}
              threat={zone}
              blackoutMode={blackoutMode}
            />
          ))}

          <DroneModel active={droneActive} position={[0, 2, 0]} />

          <OrbitControls enableZoom={true} />
        </Canvas>
      </div>
      
      {selectedSoldier && (
        <div className="absolute bottom-3 left-3 right-3 p-2 bg-void/90 border border-cyborg-teal/30 rounded backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-semibold text-cyborg-teal text-sm">{selectedSoldier.name}</h4>
              <div className="text-xs text-gray-300">
                <span className={`font-semibold ${
                  selectedSoldier.status === 'critical' ? 'text-alert-red' :
                  selectedSoldier.status === 'elevated' ? 'text-neon-amber' : 'text-cyborg-teal'
                }`}>{selectedSoldier.status.toUpperCase()}</span> • {selectedSoldier.hr} BPM
              </div>
            </div>
            <button
              onClick={() => setSelectedSoldier(null)}
              className="text-gray-400 hover:text-white text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
