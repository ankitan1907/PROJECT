import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";

// Mock soldier data
const soldiers = [
  { id: "TAC-1058", name: "SGT Alpha", status: "normal", position: [2, 0, 1], hr: 85 },
  { id: "TAC-2041", name: "CPL Bravo", status: "elevated", position: [-1, 0, 2], hr: 115 },
  { id: "TAC-3092", name: "PVT Charlie", status: "critical", position: [0, 0, -2], hr: 165 },
  { id: "TAC-4015", name: "SGT Delta", status: "normal", position: [3, 0, -1], hr: 78 },
];

const threatZones = [
  { position: [-2, 0, 0], radius: 1.5, intensity: 0.8 },
  { position: [1, 0, 3], radius: 1.0, intensity: 0.5 },
];

function SoldierAvatar({ soldier, onClick }: { soldier: any; onClick: (soldier: any) => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  const getColor = () => {
    switch (soldier.status) {
      case "critical": return "#FF2E4D";
      case "elevated": return "#FFA500";
      default: return "#00F0FF";
    }
  };

  return (
    <group position={soldier.position} onClick={() => onClick(soldier)}>
      <mesh ref={meshRef} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.6]} />
        <meshStandardMaterial color={getColor()} emissive={getColor()} emissiveIntensity={0.3} />
      </mesh>
      <Text
        position={[0, 1, 0]}
        fontSize={0.2}
        color={getColor()}
        anchorX="center"
        anchorY="middle"
      >
        {soldier.id}
      </Text>
    </group>
  );
}

function ThreatZone({ zone }: { zone: any }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.3 + 0.7;
      meshRef.current.scale.setScalar(pulse);
    }
  });

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

function Terrain() {
  return (
    <mesh receiveShadow position={[0, -0.1, 0]}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#1A1D23" opacity={0.8} transparent />
    </mesh>
  );
}

export function TacticalMap() {
  const [selectedSoldier, setSelectedSoldier] = useState<any>(null);

  return (
    <div className="glass-panel rounded-lg p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-cyborg-teal neon-glow">Live Battle Map</h2>
        <div className="flex space-x-2 text-sm">
          <span className="text-cyborg-teal">⚪ Normal</span>
          <span className="text-neon-amber">🟡 Elevated</span>
          <span className="text-alert-red">🔴 Critical</span>
        </div>
      </div>
      
      <div className="h-[500px] rounded-lg overflow-hidden border border-cyborg-teal/30">
        <Canvas camera={{ position: [5, 5, 5], fov: 60 }} shadows>
          <ambientLight intensity={0.3} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1} 
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <pointLight position={[0, 5, 0]} intensity={0.5} color="#00F0FF" />
          
          <Terrain />
          
          {soldiers.map((soldier) => (
            <SoldierAvatar 
              key={soldier.id} 
              soldier={soldier} 
              onClick={setSelectedSoldier}
            />
          ))}
          
          {threatZones.map((zone, index) => (
            <ThreatZone key={index} zone={zone} />
          ))}
          
          <OrbitControls enableZoom={true} />
        </Canvas>
      </div>
      
      {selectedSoldier && (
        <div className="mt-4 p-3 bg-cyborg-teal/10 border border-cyborg-teal/30 rounded-lg">
          <h4 className="font-semibold text-cyborg-teal">{selectedSoldier.name}</h4>
          <div className="text-sm text-gray-300 mt-1">
            <p>ID: {selectedSoldier.id}</p>
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
