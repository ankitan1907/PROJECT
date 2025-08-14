import { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Text, Line } from "@react-three/drei";
import { Shield, AlertTriangle, Lock, Unlock, Zap } from "lucide-react";
import { showMissionModal } from "./ModalNotification";
import * as THREE from "three";

interface SecurityVisualizationProps {
  blackoutMode: boolean;
  quantumKeyRotation: number;
  onSecurityBreach?: (breach: SecurityBreach) => void;
}

interface SecurityBreach {
  id: string;
  type: 'intrusion' | 'jamming' | 'key_compromise';
  severity: 'low' | 'medium' | 'high';
  location: string;
  timestamp: number;
}

// 3D Holographic Globe Component
function HolographicGlobe({ nodes, breaches }: { nodes: SecurityNode[], breaches: SecurityBreach[] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [rotation, setRotation] = useState(0);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      setRotation(meshRef.current.rotation.y);
    }
  });

  return (
    <group>
      {/* Globe wireframe */}
      <Sphere ref={meshRef} args={[2, 16, 16]}>
        <meshBasicMaterial wireframe color="#00F0FF" opacity={0.3} transparent />
      </Sphere>
      
      {/* Security nodes */}
      {nodes.map((node, index) => {
        const phi = Math.acos(-1 + (2 * index) / nodes.length);
        const theta = Math.sqrt(nodes.length * Math.PI) * phi;
        
        const x = 2.1 * Math.cos(theta) * Math.sin(phi);
        const y = 2.1 * Math.cos(phi);
        const z = 2.1 * Math.sin(theta) * Math.sin(phi);
        
        const isCompromised = breaches.some(b => b.location === node.id);
        
        return (
          <group key={node.id} position={[x, y, z]}>
            <Sphere args={[0.05]}>
              <meshBasicMaterial 
                color={isCompromised ? "#FF2E4D" : node.status === 'secure' ? "#00F0FF" : "#FFA500"} 
              />
            </Sphere>
            {node.status === 'secure' && (
              <Line
                points={[[0, 0, 0], [x * 0.1, y * 0.1, z * 0.1]]}
                color="#00F0FF"
                lineWidth={1}
              />
            )}
          </group>
        );
      })}
    </group>
  );
}

// 3D Key Rotation Visualization
function QuantumKeyVisual({ rotation }: { rotation: number }) {
  const keyRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (keyRef.current) {
      keyRef.current.rotation.z = rotation * 0.5;
      keyRef.current.rotation.y = rotation * 0.3;
    }
  });

  return (
    <group ref={keyRef} position={[0, -3, 0]}>
      {/* Key body */}
      <Box args={[0.3, 1.2, 0.1]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#00F0FF" />
      </Box>
      
      {/* Key teeth */}
      {[0, 1, 2].map(i => (
        <Box key={i} args={[0.1, 0.2, 0.1]} position={[0.2, -0.3 + i * 0.2, 0]}>
          <meshBasicMaterial color="#00F0FF" />
        </Box>
      ))}
      
      {/* Rotating particles */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2 + rotation;
        const radius = 1.5;
        return (
          <Sphere 
            key={i} 
            args={[0.02]} 
            position={[
              Math.cos(angle) * radius,
              Math.sin(angle) * radius * 0.5,
              Math.sin(angle) * 0.3
            ]}
          >
            <meshBasicMaterial color="#FFA500" />
          </Sphere>
        );
      })}
    </group>
  );
}

// Simple Box component (since @react-three/drei Box might not be available)
function Box({ args, position, children }: { args: [number, number, number], position: [number, number, number], children: React.ReactNode }) {
  return (
    <mesh position={position}>
      <boxGeometry args={args} />
      {children}
    </mesh>
  );
}

interface SecurityNode {
  id: string;
  location: string;
  status: 'secure' | 'warning' | 'compromised';
  encryption_level: string;
}

export function SecurityVisualization({ blackoutMode, quantumKeyRotation, onSecurityBreach }: SecurityVisualizationProps) {
  const [securityNodes] = useState<SecurityNode[]>([
    { id: 'NODE-1', location: 'Base Alpha', status: 'secure', encryption_level: 'AES-256' },
    { id: 'NODE-2', location: 'Outpost Bravo', status: 'secure', encryption_level: 'AES-256' },
    { id: 'NODE-3', location: 'Forward Charlie', status: 'warning', encryption_level: 'AES-192' },
    { id: 'NODE-4', location: 'Recon Delta', status: 'secure', encryption_level: 'AES-256' },
    { id: 'NODE-5', location: 'Support Echo', status: 'secure', encryption_level: 'AES-256' },
    { id: 'NODE-6', location: 'Command Fox', status: 'secure', encryption_level: 'AES-256' },
    { id: 'NODE-7', location: 'Satellite Link', status: 'secure', encryption_level: 'RSA-4096' },
    { id: 'NODE-8', location: 'Mobile Unit', status: 'warning', encryption_level: 'AES-128' }
  ]);

  const [activeBreaches, setActiveBreaches] = useState<SecurityBreach[]>([]);
  const [intrusionAlerts, setIntrusionAlerts] = useState<number>(0);
  const [keyRotationActive, setKeyRotationActive] = useState(false);

  // Simulate security events
  useEffect(() => {
    const securityInterval = setInterval(() => {
      // Random intrusion attempts
      if (Math.random() < 0.1) { // 10% chance every interval
        const breach: SecurityBreach = {
          id: `BREACH-${Date.now()}`,
          type: Math.random() < 0.5 ? 'intrusion' : 'jamming',
          severity: Math.random() < 0.3 ? 'high' : 'medium',
          location: securityNodes[Math.floor(Math.random() * securityNodes.length)].id,
          timestamp: Date.now()
        };

        setActiveBreaches(prev => [...prev, breach]);
        setIntrusionAlerts(prev => prev + 1);
        
        onSecurityBreach?.(breach);

        showMissionModal(
          `🚨 SECURITY ALERT`,
          `${breach.type.toUpperCase()} DETECTED\n\n• Location: ${breach.location}\n• Severity: ${breach.severity.toUpperCase()}\n• Timestamp: ${new Date().toLocaleTimeString()}\n\nCountermeasures required.`,
          [
            { 
              label: "Activate Countermeasures", 
              action: () => {
                setActiveBreaches(prev => prev.filter(b => b.id !== breach.id));
                showMissionModal("✅ THREAT NEUTRALIZED", `Security breach in ${breach.location} has been contained.\n\nAll systems nominal.`);
              }, 
              variant: "danger" 
            },
            { 
              label: "Monitor", 
              action: () => {}, 
              variant: "secondary" 
            }
          ]
        );

        // Auto-resolve after 30 seconds
        setTimeout(() => {
          setActiveBreaches(prev => prev.filter(b => b.id !== breach.id));
        }, 30000);
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(securityInterval);
  }, [securityNodes, onSecurityBreach]);

  // Key rotation effect
  useEffect(() => {
    if (quantumKeyRotation % 8 === 0 && quantumKeyRotation > 0) {
      setKeyRotationActive(true);
      setTimeout(() => setKeyRotationActive(false), 2000);
    }
  }, [quantumKeyRotation]);

  const secureNodes = securityNodes.filter(n => n.status === 'secure').length;
  const warningNodes = securityNodes.filter(n => n.status === 'warning').length;
  const compromisedNodes = activeBreaches.length;

  return (
    <div className="space-y-4">
      {/* Security Status Header */}
      <div className="glass-panel rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-cyborg-teal flex items-center">
            <Shield className="mr-2" size={20} />
            Security Operations Center
          </h3>
          {intrusionAlerts > 0 && (
            <div className="flex items-center space-x-2 animate-pulse">
              <AlertTriangle className="text-alert-red" size={16} />
              <span className="text-alert-red text-sm font-bold">{intrusionAlerts} Alerts</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-cyborg-teal">{secureNodes}</div>
            <div className="text-gray-400">Secure Nodes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-neon-amber">{warningNodes}</div>
            <div className="text-gray-400">Warning</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-alert-red">{compromisedNodes}</div>
            <div className="text-gray-400">Breached</div>
          </div>
        </div>
      </div>

      {/* 3D Security Visualization */}
      <div className="glass-panel rounded-lg p-4 h-64">
        <div className="h-full">
          <Canvas camera={{ position: [0, 0, 6] }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <HolographicGlobe nodes={securityNodes} breaches={activeBreaches} />
            <QuantumKeyVisual rotation={quantumKeyRotation} />
          </Canvas>
        </div>
      </div>

      {/* Quantum Key Rotation Status */}
      <div className="glass-panel rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {keyRotationActive ? (
              <Unlock className="text-neon-amber animate-spin" size={20} />
            ) : (
              <Lock className="text-cyborg-teal" size={20} />
            )}
            <span className="text-sm font-semibold">
              {keyRotationActive ? 'Key Rotation Active' : 'Encryption Locked'}
            </span>
          </div>
          <div className="text-xs text-gray-400">
            Next rotation: {8 - (quantumKeyRotation % 8)}s
          </div>
        </div>
        
        {keyRotationActive && (
          <div className="mt-2 text-xs text-neon-amber">
            ⚡ Quantum keys rotating... All communications secured with new encryption
          </div>
        )}
      </div>

      {/* Security Controls */}
      <div className="glass-panel rounded-lg p-4">
        <h4 className="text-sm font-semibold text-cyborg-teal mb-3">Emergency Protocols</h4>
        <div className="space-y-2">
          <button
            onClick={() => {
              setActiveBreaches([]);
              setIntrusionAlerts(0);
              showMissionModal("🔐 LOCKDOWN INITIATED", "All security breaches contained.\nSystems returning to nominal status.");
            }}
            className="w-full px-3 py-2 bg-cyborg-teal/20 border border-cyborg-teal text-cyborg-teal rounded-lg hover:bg-cyborg-teal/30 transition-all duration-300 text-sm"
          >
            🔐 Emergency Lockdown
          </button>
          
          <button
            onClick={() => {
              setKeyRotationActive(true);
              setTimeout(() => setKeyRotationActive(false), 3000);
              showMissionModal("🔄 FORCE KEY ROTATION", "Manual quantum key rotation initiated.\nAll encryption protocols updated.");
            }}
            className="w-full px-3 py-2 bg-neon-amber/20 border border-neon-amber text-neon-amber rounded-lg hover:bg-neon-amber/30 transition-all duration-300 text-sm"
          >
            🔄 Force Key Rotation
          </button>
        </div>
      </div>
    </div>
  );
}
