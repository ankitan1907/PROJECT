import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';
import Planet from './Planet';
import { planetData } from '../data/planetData';

const SolarSystem: React.FC = () => {
  const sunRef = useRef<THREE.Mesh>(null!); // ✅ Typed ref
  const setSelectedPlanet = useStore((state) => state.setSelectedPlanet);

  useFrame(({ clock }) => {
    if (sunRef.current) {
      sunRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <group>
      <mesh ref={sunRef} position={[0, 0, 0]}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial color="#FDB813" />
        <pointLight intensity={2} distance={100} decay={2} />
      </mesh>

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
