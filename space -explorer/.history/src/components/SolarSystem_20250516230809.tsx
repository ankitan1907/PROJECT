import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree, useLoader } from '@react-three/fiber';
import { TextureLoader, Vector3 } from 'three';
import { useStore } from '../store';
import Planet from './Planet';
import { planetData } from '../data/planetData';

const DEFAULT_CAMERA_POS = new Vector3(0, 10, 30); // default camera start
const ZOOM_OFFSET = new Vector3(5, 2, 5); // offset from planet when zoomed in

const SolarSystem: React.FC = () => {
  const sunRef = useRef<THREE.Mesh>(null);
  const setSelectedPlanet = useStore((state) => state.setSelectedPlanet);
  const selectedPlanetName = useStore((state) => state.selectedPlanet);
  const sunTexture = useLoader(TextureLoader, '/textures/sun.jpg');

  const { camera } = useThree();
  const currentCamPos = useRef(camera.position.clone());

  const [showRobotAssistant, setShowRobotAssistant] = useState(false);

  // Get selected planet data
  const selectedPlanet = planetData.find(p => p.name === selectedPlanetName);

  // On mount, set camera to default position
  useEffect(() => {
    camera.position.copy(DEFAULT_CAMERA_POS);
    camera.lookAt(0, 0, 0);
    currentCamPos.current.copy(DEFAULT_CAMERA_POS);
  }, [camera]);

  useFrame(() => {
    if (selectedPlanet) {
      // Target = planet position + offset (so camera looks at planet nicely)
      const planetPos = new Vector3(selectedPlanet.distance, 0, 0);
      const targetPos = planetPos.clone().add(ZOOM_OFFSET);

      // Lerp camera position
      currentCamPos.current.lerp(targetPos, 0.05);
      camera.position.copy(currentCamPos.current);

      // Camera looks at planet
      camera.lookAt(planetPos);

      // Show robot assistant when close enough
      if (currentCamPos.current.distanceTo(targetPos) < 0.1) {
        setShowRobotAssistant(true);
      }
    } else {
      // No planet selected => lerp back to default position
      currentCamPos.current.lerp(DEFAULT_CAMERA_POS, 0.05);
      camera.position.copy(currentCamPos.current);
      camera.lookAt(0, 0, 0);

      // Hide robot assistant
      setShowRobotAssistant(false);
    }
  });

  // Reset view handler
  const handleResetView = () => {
    setSelectedPlanet('');
  };

  return (
    <>
      <group>
        {/* Ambient light */}
        <ambientLight intensity={0.3} />

        {/* Directional light */}
        <directionalLight position={[10, 10, 5]} intensity={0.5} />

        {/* Sun */}
        <mesh ref={sunRef} position={[0, 0, 0]}>
          <sphereGeometry args={[2, 64, 64]} />
          <meshStandardMaterial
            map={sunTexture}
            emissive="#FDB813"
            emissiveIntensity={0.3}
            roughness={0.4}
            metalness={0}
          />
          <pointLight intensity={0.8} distance={100} decay={2} />
        </mesh>

        {/* Planets */}
        {planetData.map((planet) => (
          <Planet
            key={planet.name}
            {...planet}
            onClick={() => setSelectedPlanet(planet.name)}
          />
        ))}
      </group>

      {/* Reset view button */}
      {selectedPlanetName && (
        <button
          onClick={handleResetView}
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            padding: '10px 15px',
            background: '#333',
            color: '#fff',
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          Reset View
        </button>
      )}

      {/* Robot Assistant */}
      {showRobotAssistant && (
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 0 10px rgba(0,0,0,0.3)',
            zIndex: 10,
            maxWidth: '250px',
            fontFamily: 'sans-serif',
          }}
        >
          <h4>Robot Assistant</h4>
          <p>Welcome! Here's some info about {selectedPlanet?.name}.</p>
        </div>
      )}
    </>
  );
};

export default SolarSystem;
