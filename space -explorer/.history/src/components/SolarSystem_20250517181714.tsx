// src/components/SolarSystem.tsx
import React, { useRef } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { TextureLoader } from 'three';
import { OrbitControls } from '@react-three/drei';

import { useStore } from '../store';
import Planet from './Planet';
import { planetData } from '../data/planetData';

const SolarSystem: React.FC = () => {
  const sunRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  const setSelectedPlanet = useStore((state) => state.setSelectedPlanet);
  const setPlanetPosition = useStore((state) => state.setPlanetPosition);
  const selectedPlanet = useStore((state) => state.selectedPlanet);
  const planetPosition = useStore((state) => state.planetPosition);

  const controlsRef = useRef<any>(null);

  const sunTexture = useLoader(TextureLoader, '/textures/sun.jpg');

  // Rotate the sun continuously
  useFrame(({ clock }) => {
    if (sunRef.current) {
      sunRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
  });

  // Smoothly update OrbitControls target to selected planet or origin
  useFrame(() => {
    if (controlsRef.current) {
      const target = selectedPlanet && planetPosition ? planetPosition : new THREE.Vector3(0, 0, 0);
      controlsRef.current.target.lerp(target, 0.1);
      controlsRef.current.update();
    }
  });

  return (
    <group>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />

      {/* Sun */}
      <mesh
        ref={sunRef}
        position={[0, 0, 0]}
        onClick={() => {
          setSelectedPlanet('Sun');
          setPlanetPosition(new THREE.Vector3(0, 0, 0));
        }}
      >
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
      {planetData.map((planet, idx) => (
        <Planet
          key={planet.name}
          {...planet}
          initialAngle={(idx / planetData.length) * Math.PI * 2}
          onClick={(name, pos) => {
            setSelectedPlanet(name);
            setPlanetPosition(pos);
          }}
        />
      ))}

      {/* Camera controls */}
      <OrbitControls
        ref={controlsRef}
        enableDamping={true}
        dampingFactor={0.1}
        enableZoom={true}
        enableRotate={!selectedPlanet} // Disable rotate when a planet is selected
        minDistance={5}
        maxDistance={150}
        enablePan={false}
      />
    </group>
  );
};

export default SolarSystem;
