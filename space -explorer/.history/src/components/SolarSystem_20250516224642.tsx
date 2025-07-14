import React, { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { useStore } from '../store';
import Planet from './Planet';
import { planetData } from '../data/planetData';

const SolarSystem: React.FC = () => {
  const sunRef = useRef<THREE.Mesh>(null);
  const setSelectedPlanet = useStore((state) => state.setSelectedPlanet);

  // Load sun texture
  const sunTexture = useLoader(TextureLoader, '/textures/sun.jpg');

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

      {/* Sun with texture and emissive */}
      <mesh ref={sunRef} position={[0, 0, 0]}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          map={sunTexture}
          emissive="#FDB813"
          emissiveIntensity={0.8}
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
