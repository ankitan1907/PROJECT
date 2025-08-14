import { Navigation } from "@/components/Navigation";
import { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { Heart, Thermometer, Activity, Droplet, MapPin, Zap, Shield, User, Users } from "lucide-react";
import { showMissionModal } from "@/components/ModalNotification";
import * as THREE from "three";

// Complete soldier database
const soldierDatabase = [
  {
    id: "TAC-1058",
    name: "Marcus Reynolds",
    rank: "Sergeant",
    unit: "Alpha Squad",
    status: "ACTIVE",
    avatar: "👨‍✈️",
    vitals: {
      heartRate: 88,
      temperature: 98.9,
      bloodPressure: "120/80",
      oxygenSat: 98,
      stress: 45,
      fatigue: 25,
      hydration: 85
    },
    gear: {
      helmet: { status: "OPERATIONAL", battery: 89 },
      vest: { status: "OPERATIONAL", integrity: 100 },
      weapon: { status: "OPERATIONAL", ammo: 78 },
      comms: { status: "OPERATIONAL", signal: 92 },
      medkit: { status: "OPERATIONAL", supplies: 85 },
      power: { status: "OPERATIONAL", battery: 67 }
    },
    location: {
      latitude: 34.0522,
      longitude: -118.2437,
      sector: "7-Alpha",
      elevation: 245,
      lastUpdate: "15 seconds ago"
    },
    injuries: [
      { type: "Minor Cut", location: "Left Arm", severity: "LOW", treated: true }
    ],
    mood: {
      emotion: "ALERT",
      confidence: 0.87,
      sentiment: "Focused and ready for mission continuation"
    }
  },
  {
    id: "TAC-2041",
    name: "Sarah Chen",
    rank: "Corporal",
    unit: "Bravo Squad",
    status: "ACTIVE",
    avatar: "👩‍✈️",
    vitals: {
      heartRate: 115,
      temperature: 99.4,
      bloodPressure: "130/85",
      oxygenSat: 96,
      stress: 75,
      fatigue: 60,
      hydration: 70
    },
    gear: {
      helmet: { status: "OPERATIONAL", battery: 67 },
      vest: { status: "DEGRADED", integrity: 78 },
      weapon: { status: "OPERATIONAL", ammo: 92 },
      comms: { status: "OPERATIONAL", signal: 88 },
      medkit: { status: "OPERATIONAL", supplies: 45 },
      power: { status: "OPERATIONAL", battery: 45 }
    },
    location: {
      latitude: 34.0545,
      longitude: -118.2401,
      sector: "8-Bravo",
      elevation: 267,
      lastUpdate: "8 seconds ago"
    },
    injuries: [
      { type: "Bruise", location: "Right Shoulder", severity: "MEDIUM", treated: false },
      { type: "Strain", location: "Left Knee", severity: "LOW", treated: true }
    ],
    mood: {
      emotion: "STRESSED",
      confidence: 0.65,
      sentiment: "Under pressure but maintaining operational effectiveness"
    }
  },
  {
    id: "TAC-3092",
    name: "James Wilson",
    rank: "Private",
    unit: "Charlie Squad",
    status: "INJURED",
    avatar: "👨‍⚕️",
    vitals: {
      heartRate: 165,
      temperature: 101.2,
      bloodPressure: "140/95",
      oxygenSat: 92,
      stress: 95,
      fatigue: 85,
      hydration: 45
    },
    gear: {
      helmet: { status: "DEGRADED", battery: 23 },
      vest: { status: "DAMAGED", integrity: 45 },
      weapon: { status: "OPERATIONAL", ammo: 34 },
      comms: { status: "FAILED", signal: 12 },
      medkit: { status: "OPERATIONAL", supplies: 78 },
      power: { status: "LOW", battery: 15 }
    },
    location: {
      latitude: 34.0567,
      longitude: -118.2365,
      sector: "9-Charlie",
      elevation: 189,
      lastUpdate: "45 seconds ago"
    },
    injuries: [
      { type: "Shrapnel Wound", location: "Left Leg", severity: "HIGH", treated: false },
      { type: "Concussion", location: "Head", severity: "MEDIUM", treated: true },
      { type: "Burns", location: "Right Hand", severity: "MEDIUM", treated: false }
    ],
    mood: {
      emotion: "CRITICAL",
      confidence: 0.32,
      sentiment: "Requires immediate medical attention and extraction"
    }
  },
  {
    id: "TAC-4015",
    name: "Alex Torres",
    rank: "Staff Sergeant",
    unit: "Delta Squad",
    status: "ACTIVE",
    avatar: "👨‍💼",
    vitals: {
      heartRate: 78,
      temperature: 98.6,
      bloodPressure: "115/75",
      oxygenSat: 99,
      stress: 35,
      fatigue: 20,
      hydration: 90
    },
    gear: {
      helmet: { status: "OPERATIONAL", battery: 95 },
      vest: { status: "OPERATIONAL", integrity: 100 },
      weapon: { status: "OPERATIONAL", ammo: 100 },
      comms: { status: "OPERATIONAL", signal: 98 },
      medkit: { status: "OPERATIONAL", supplies: 100 },
      power: { status: "OPERATIONAL", battery: 89 }
    },
    location: {
      latitude: 34.0489,
      longitude: -118.2501,
      sector: "6-Delta",
      elevation: 298,
      lastUpdate: "5 seconds ago"
    },
    injuries: [],
    mood: {
      emotion: "CALM",
      confidence: 0.95,
      sentiment: "Highly focused and mission-ready, leading by example"
    }
  },
  {
    id: "TAC-5023",
    name: "Emma Rodriguez",
    rank: "Lieutenant",
    unit: "Command",
    status: "ACTIVE",
    avatar: "👩‍💼",
    vitals: {
      heartRate: 102,
      temperature: 99.1,
      bloodPressure: "125/82",
      oxygenSat: 97,
      stress: 55,
      fatigue: 45,
      hydration: 75
    },
    gear: {
      helmet: { status: "OPERATIONAL", battery: 78 },
      vest: { status: "OPERATIONAL", integrity: 95 },
      weapon: { status: "OPERATIONAL", ammo: 85 },
      comms: { status: "OPERATIONAL", signal: 95 },
      medkit: { status: "OPERATIONAL", supplies: 67 },
      power: { status: "OPERATIONAL", battery: 72 }
    },
    location: {
      latitude: 34.0534,
      longitude: -118.2378,
      sector: "Command Post",
      elevation: 245,
      lastUpdate: "12 seconds ago"
    },
    injuries: [],
    mood: {
      emotion: "FOCUSED",
      confidence: 0.88,
      sentiment: "Coordinating multiple teams with tactical precision"
    }
  },
  {
    id: "TAC-6017",
    name: "Medical Officer",
    rank: "Corpsman",
    unit: "Medical",
    status: "ACTIVE",
    avatar: "👨‍⚕️",
    vitals: {
      heartRate: 82,
      temperature: 98.7,
      bloodPressure: "118/78",
      oxygenSat: 98,
      stress: 40,
      fatigue: 30,
      hydration: 80
    },
    gear: {
      helmet: { status: "OPERATIONAL", battery: 82 },
      vest: { status: "OPERATIONAL", integrity: 88 },
      weapon: { status: "OPERATIONAL", ammo: 56 },
      comms: { status: "OPERATIONAL", signal: 90 },
      medkit: { status: "OPERATIONAL", supplies: 95 },
      power: { status: "OPERATIONAL", battery: 85 }
    },
    location: {
      latitude: 34.0556,
      longitude: -118.2423,
      sector: "Medical Station",
      elevation: 234,
      lastUpdate: "20 seconds ago"
    },
    injuries: [],
    mood: {
      emotion: "ALERT",
      confidence: 0.92,
      sentiment: "Ready to provide immediate medical support to all units"
    }
  }
];

function SoldierModel({ injuries, soldierStatus }: { injuries: any[], soldierStatus: string }) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  const getBodyColor = () => {
    switch (soldierStatus) {
      case "INJURED": return "#FF6B6B";
      case "ACTIVE": return "#2A4D2A";
      default: return "#2A4D2A";
    }
  };

  return (
    <group ref={meshRef} position={[0, -1, 0]}>
      {/* Head */}
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#D4AF6A" />
      </mesh>
      
      {/* Body */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.4, 0.35, 0.8]} />
        <meshStandardMaterial color={getBodyColor()} />
      </mesh>
      
      {/* Arms */}
      <mesh position={[-0.6, 1.0, 0]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.1, 0.08, 0.7]} />
        <meshStandardMaterial color={injuries.find(i => i.location.includes("Left Arm") || i.location.includes("Left")) ? "#FF6B6B" : "#D4AF6A"} />
      </mesh>
      <mesh position={[0.6, 1.0, 0]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.1, 0.08, 0.7]} />
        <meshStandardMaterial color={injuries.find(i => i.location.includes("Right")) ? "#FF6B6B" : "#D4AF6A"} />
      </mesh>
      
      {/* Legs */}
      <mesh position={[-0.2, -0.2, 0]}>
        <cylinderGeometry args={[0.12, 0.1, 0.8]} />
        <meshStandardMaterial color={injuries.find(i => i.location.includes("Left Leg") || i.location.includes("Left Knee")) ? "#FF6B6B" : getBodyColor()} />
      </mesh>
      <mesh position={[0.2, -0.2, 0]}>
        <cylinderGeometry args={[0.12, 0.1, 0.8]} />
        <meshStandardMaterial color={injuries.find(i => i.location.includes("Right Leg")) ? "#FF6B6B" : getBodyColor()} />
      </mesh>
      
      {/* Gear indicators */}
      {/* Helmet */}
      <mesh position={[0, 1.8, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#4A4A4A" transparent opacity={0.8} />
      </mesh>
      
      {/* Vest */}
      <mesh position={[0, 0.9, 0.1]}>
        <boxGeometry args={[0.6, 0.6, 0.1]} />
        <meshStandardMaterial color="#1A3A1A" />
      </mesh>

      {/* Status indicator above head */}
      <mesh position={[0, 2.2, 0]}>
        <sphereGeometry args={[0.08]} />
        <meshStandardMaterial 
          color={soldierStatus === "INJURED" ? "#FF2E4D" : soldierStatus === "ACTIVE" ? "#00F0FF" : "#FFA500"} 
          emissive={soldierStatus === "INJURED" ? "#FF2E4D" : soldierStatus === "ACTIVE" ? "#00F0FF" : "#FFA500"}
          emissiveIntensity={0.8}
        />
      </mesh>
    </group>
  );
}

export default function SoldierTwin() {
  const [selectedSoldier, setSelectedSoldier] = useState(soldierDatabase[0]);
  const [selectedGear, setSelectedGear] = useState<string | null>(null);
  const [currentVitals, setCurrentVitals] = useState(selectedSoldier.vitals);

  // Update vitals when soldier changes
  useEffect(() => {
    setCurrentVitals(selectedSoldier.vitals);
  }, [selectedSoldier]);

  // Simulate real-time vitals updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVitals(prev => ({
        ...prev,
        heartRate: Math.max(60, Math.min(180, prev.heartRate + (Math.random() - 0.5) * 8)),
        stress: Math.max(0, Math.min(100, prev.stress + (Math.random() - 0.5) * 10)),
        hydration: Math.max(0, Math.min(100, prev.hydration - 0.1))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPERATIONAL": return "text-cyborg-teal";
      case "DEGRADED": return "text-neon-amber";
      case "DAMAGED": 
      case "FAILED": 
      case "LOW": return "text-alert-red";
      default: return "text-gray-400";
    }
  };

  const getMoodEmoji = (emotion: string) => {
    switch (emotion) {
      case "ALERT": return "🎯";
      case "STRESSED": return "😰";
      case "CALM": return "😌";
      case "FOCUSED": return "🔍";
      case "CRITICAL": return "🚨";
      default: return "😐";
    }
  };

  const getSoldierStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-cyborg-teal/20 text-cyborg-teal border-cyborg-teal";
      case "INJURED": return "bg-alert-red/20 text-alert-red border-alert-red animate-pulse";
      case "OFFLINE": return "bg-gray-600/20 text-gray-400 border-gray-600";
      default: return "bg-neon-amber/20 text-neon-amber border-neon-amber";
    }
  };

  const handleQuickAction = (action: string) => {
    const actions = {
      "comms": `📞 DIRECT COMMS - ${selectedSoldier.name}`,
      "track": `🎯 TRACKING - ${selectedSoldier.name}`,
      "medical": `🚑 MEDICAL ALERT - ${selectedSoldier.name}`
    };

    showMissionModal(
      actions[action as keyof typeof actions],
      `Initiating ${action} protocol for ${selectedSoldier.name} (${selectedSoldier.id})\n\nStatus: ${selectedSoldier.status}\nLocation: ${selectedSoldier.location.sector}\nLast Update: ${selectedSoldier.location.lastUpdate}`,
      [{ label: "Confirm", action: () => {}, variant: "primary" }]
    );
  };

  return (
    <div className="min-h-screen bg-void text-cyborg-teal">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-cyborg-teal neon-glow">Soldier Digital Twin</h1>
            <p className="text-gray-400 mt-2">{selectedSoldier.name} - {selectedSoldier.id}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded border text-sm font-semibold ${getSoldierStatusColor(selectedSoldier.status)}`}>
              {selectedSoldier.status}
            </div>
            <div className="text-sm text-gray-400 font-mono">
              Live Feed: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Soldier Selection Panel */}
        <div className="glass-panel rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-cyborg-teal mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Select Personnel
          </h3>
          <div className="grid grid-cols-6 gap-3">
            {soldierDatabase.map((soldier) => (
              <button
                key={soldier.id}
                onClick={() => setSelectedSoldier(soldier)}
                className={`p-3 rounded-lg border transition-all duration-300 ${
                  selectedSoldier.id === soldier.id
                    ? 'bg-cyborg-teal/20 border-cyborg-teal scale-105'
                    : 'bg-gray-800/30 border-gray-600 hover:border-cyborg-teal/50'
                }`}
              >
                <div className="text-2xl mb-2">{soldier.avatar}</div>
                <div className="text-xs font-semibold text-white">{soldier.name.split(' ')[0]}</div>
                <div className="text-xs text-gray-400">{soldier.rank}</div>
                <div className={`text-xs mt-1 ${
                  soldier.status === 'ACTIVE' ? 'text-cyborg-teal' :
                  soldier.status === 'INJURED' ? 'text-alert-red' : 'text-gray-400'
                }`}>
                  {soldier.status}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel - Live Vitals */}
          <div className="col-span-3 space-y-4">
            <div className="glass-panel rounded-lg p-4">
              <h3 className="text-lg font-semibold text-cyborg-teal mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Live Vitals
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-ghost-gray/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-alert-red" />
                    <span className="text-sm">Heart Rate</span>
                  </div>
                  <span className="text-alert-red font-bold">{Math.round(currentVitals.heartRate)} BPM</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-ghost-gray/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Thermometer className="w-4 h-4 text-neon-amber" />
                    <span className="text-sm">Temperature</span>
                  </div>
                  <span className="text-neon-amber font-bold">{currentVitals.temperature}°F</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-ghost-gray/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-cyborg-teal" />
                    <span className="text-sm">Stress Index</span>
                  </div>
                  <span className="text-cyborg-teal font-bold">{Math.round(currentVitals.stress)}%</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-ghost-gray/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Droplet className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">Hydration</span>
                  </div>
                  <span className="text-blue-400 font-bold">{Math.round(currentVitals.hydration)}%</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-ghost-gray/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <span className="text-sm">Blood Pressure</span>
                  </div>
                  <span className="text-purple-400 font-bold">{currentVitals.bloodPressure}</span>
                </div>
              </div>
            </div>

            {/* Mood AI Widget */}
            <div className="glass-panel rounded-lg p-4">
              <h3 className="text-lg font-semibold text-cyborg-teal mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Mood AI
              </h3>
              <div className="text-center">
                <div className="text-4xl mb-2">{getMoodEmoji(selectedSoldier.mood.emotion)}</div>
                <div className="text-lg font-semibold text-white">{selectedSoldier.mood.emotion}</div>
                <div className="text-sm text-gray-400 mb-3">
                  Confidence: {Math.round(selectedSoldier.mood.confidence * 100)}%
                </div>
                <p className="text-xs text-gray-300 italic">
                  "{selectedSoldier.mood.sentiment}"
                </p>
              </div>
            </div>
          </div>

          {/* Center Panel - 3D Soldier Model */}
          <div className="col-span-6">
            <div className="glass-panel rounded-lg p-4 h-[600px]">
              <h3 className="text-lg font-semibold text-cyborg-teal mb-4">3D Health Monitor - {selectedSoldier.name}</h3>
              
              <div className="h-[500px] rounded-lg overflow-hidden border border-cyborg-teal/30 relative">
                {/* Status indicators */}
                <div className="absolute top-4 left-4 z-10 space-y-2">
                  <div className="bg-black/70 px-3 py-1 rounded text-xs">
                    <span className="text-gray-400">Unit:</span> <span className="text-cyborg-teal">{selectedSoldier.unit}</span>
                  </div>
                  <div className="bg-black/70 px-3 py-1 rounded text-xs">
                    <span className="text-gray-400">Injuries:</span> <span className="text-alert-red">{selectedSoldier.injuries.length}</span>
                  </div>
                </div>

                <Canvas camera={{ position: [3, 2, 3], fov: 60 }} shadows>
                  <ambientLight intensity={0.4} />
                  <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
                  <pointLight position={[0, 3, 0]} intensity={0.5} color="#00F0FF" />
                  
                  <SoldierModel injuries={selectedSoldier.injuries} soldierStatus={selectedSoldier.status} />
                  
                  {/* Floating injury indicators */}
                  {selectedSoldier.injuries.map((injury, index) => (
                    <group key={index} position={
                      injury.location.includes("Head") ? [0, 1.8, 0] :
                      injury.location.includes("Left Arm") ? [-0.6, 1.0, 0] :
                      injury.location.includes("Right") ? [0.6, 1.0, 0] :
                      injury.location.includes("Left Leg") || injury.location.includes("Left Knee") ? [-0.2, -0.2, 0] :
                      [0, 0.8, 0]
                    }>
                      <mesh>
                        <sphereGeometry args={[0.05]} />
                        <meshStandardMaterial 
                          color={injury.severity === "HIGH" ? "#FF2E4D" : injury.severity === "MEDIUM" ? "#FFA500" : "#FFD700"} 
                          emissive={injury.severity === "HIGH" ? "#FF2E4D" : injury.severity === "MEDIUM" ? "#FFA500" : "#FFD700"} 
                          emissiveIntensity={0.5} 
                        />
                      </mesh>
                      <Text
                        position={[0, 0.2, 0]}
                        fontSize={0.08}
                        color={injury.severity === "HIGH" ? "#FF2E4D" : injury.severity === "MEDIUM" ? "#FFA500" : "#FFD700"}
                        anchorX="center"
                      >
                        {injury.type}
                      </Text>
                    </group>
                  ))}
                  
                  <OrbitControls enableZoom={true} />
                </Canvas>
              </div>

              {/* Gear Status Overlay */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                {Object.entries(selectedSoldier.gear).map(([item, data]) => (
                  <button
                    key={item}
                    onClick={() => setSelectedGear(selectedGear === item ? null : item)}
                    className={`p-2 rounded-lg text-xs transition-all duration-300 ${
                      selectedGear === item 
                        ? 'bg-cyborg-teal/30 border border-cyborg-teal' 
                        : 'bg-ghost-gray/30 hover:bg-ghost-gray/50'
                    }`}
                  >
                    <div className={`font-semibold ${getStatusColor(data.status)}`}>
                      {item.toUpperCase()}
                    </div>
                    <div className="text-gray-400">
                      {data.battery ? `${data.battery}%` : 
                       data.integrity ? `${data.integrity}%` :
                       data.ammo ? `${data.ammo}%` :
                       data.signal ? `${data.signal}%` :
                       data.supplies ? `${data.supplies}%` : 'OK'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Location & Details */}
          <div className="col-span-3 space-y-4">
            <div className="glass-panel rounded-lg p-4">
              <h3 className="text-lg font-semibold text-cyborg-teal mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Location
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400 text-sm">Sector:</span>
                  <span className="text-white font-semibold ml-2">{selectedSoldier.location.sector}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Coordinates:</span>
                  <div className="font-mono text-xs text-cyborg-teal mt-1">
                    {selectedSoldier.location.latitude}, {selectedSoldier.location.longitude}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Elevation:</span>
                  <span className="text-white ml-2">{selectedSoldier.location.elevation}m</span>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Last Update:</span>
                  <span className="text-cyborg-teal ml-2">{selectedSoldier.location.lastUpdate}</span>
                </div>
              </div>
            </div>

            {/* Injury Report */}
            <div className="glass-panel rounded-lg p-4">
              <h3 className="text-lg font-semibold text-cyborg-teal mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Injury Report
              </h3>
              <div className="space-y-3">
                {selectedSoldier.injuries.length === 0 ? (
                  <div className="text-center text-gray-400 py-4">
                    <div className="text-2xl mb-2">✅</div>
                    <div>No injuries reported</div>
                  </div>
                ) : (
                  selectedSoldier.injuries.map((injury, index) => (
                    <div key={index} className="p-3 bg-ghost-gray/30 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-white font-semibold">{injury.type}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          injury.severity === 'LOW' ? 'bg-cyborg-teal/20 text-cyborg-teal' :
                          injury.severity === 'MEDIUM' ? 'bg-neon-amber/20 text-neon-amber' :
                          'bg-alert-red/20 text-alert-red'
                        }`}>
                          {injury.severity}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400 mb-2">Location: {injury.location}</div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400">Treatment:</span>
                        <span className={`text-xs ${injury.treated ? 'text-cyborg-teal' : 'text-alert-red'}`}>
                          {injury.treated ? '✓ Treated' : '✗ Pending'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-panel rounded-lg p-4">
              <h3 className="text-lg font-semibold text-cyborg-teal mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => handleQuickAction('comms')}
                  className="w-full px-3 py-2 bg-cyborg-teal/20 border border-cyborg-teal text-cyborg-teal rounded-lg hover:bg-cyborg-teal/30 transition-all duration-300 text-sm"
                >
                  📞 Direct Comms
                </button>
                <button 
                  onClick={() => handleQuickAction('track')}
                  className="w-full px-3 py-2 bg-neon-amber/20 border border-neon-amber text-neon-amber rounded-lg hover:bg-neon-amber/30 transition-all duration-300 text-sm"
                >
                  🎯 Track Location
                </button>
                <button 
                  onClick={() => handleQuickAction('medical')}
                  className="w-full px-3 py-2 bg-alert-red/20 border border-alert-red text-alert-red rounded-lg hover:bg-alert-red/30 transition-all duration-300 text-sm"
                >
                  🚑 Medical Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
