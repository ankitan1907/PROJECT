import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../store';
import Planet from './Planet';
import { planetData } from '../data/planetData';

const SolarSystem: React.FC = () => {
  const sunRef = useRef<THREE.Mesh>(null);
  const setSelectedPlanet = useStore((state) => state.setSelectedPlanet);

  useFrame(({ clock }) => {
    if (sunRef.current) {
      sunRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <group>
      {/* Ambient light for general scene brightness */}
      <ambientLight intensity={0.3} />

      {/* Directional light for sharper shadows/highlights */}
      <directionalLight position={[10, 10, 5]} intensity={0.5} />

      {/* Sun with emissive glow */}
      <mesh ref={sunRef} position={[0, 0, 0]}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial 
          color="#FDB813" 
          emissive="#FDB813" 
          emissiveIntensity={1} 
          roughness={0.4} 
          metalness={0} 
        />
        <pointLight intensity={2} distance={100} decay={2} />
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
  );
};

export default SolarSystem;
