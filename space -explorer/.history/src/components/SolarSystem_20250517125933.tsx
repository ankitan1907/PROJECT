import React, { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { useStore } from '../store';
import Planet from './Planet';
import { planetData } from '../data/planetData';

const SolarSystem: React.FC = () => {
  const sunRef = useRef<THREE.Mesh>(null);
  const setSelectedPlanet = useStore((state) => state.setSelectedPlanet);
  const setPlanetPosition = useStore((state) => state.setPlanetPosition);

  const sunTexture = useLoader(TextureLoader, '/textures/sun.jpg');

  useFrame(({ clock }) => {
    if (sunRef.current) {
      sunRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <group>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />

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

      {planetData.map((planet) => (
        <Planet
          key={planet.name}
          {...planet}
          onClick={(name, position) => {
            setSelectedPlanet(name);
            setPlanetPosition(position);
          }}
        />
      ))}
    </group>
  );
};

export default SolarSystem;
