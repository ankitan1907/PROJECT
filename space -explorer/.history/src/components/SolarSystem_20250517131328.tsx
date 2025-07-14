import React, { useRef } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { TextureLoader } from 'three';
import { OrbitControls } from '@react-three/drei';

import { useStore } from '../store';  // Zustand store
import Planet from './Planet';
import { planetData } from '../data/planetData';

const SolarSystem: React.FC = () => {
  const sunRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  const setSelectedPlanet = useStore((state) => state.setSelectedPlanet);
  const setPlanetPosition = useStore((state) => state.setPlanetPosition);
  const selectedPlanet = useStore((state) => state.selectedPlanet);
  const planetPosition = useStore((state) => state.planetPosition);

  // Load sun texture
  const sunTexture = useLoader(TextureLoader, '/textures/sun.jpg');

  // Rotate sun continuously
  useFrame(({ clock }) => {
    if (sunRef.current) {
      sunRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
  });

  // Smooth camera movement toward selected planet or default position
  useFrame(() => {
    if (selectedPlanet && planetPosition) {
      const desiredPosition = planetPosition.clone().add(new THREE.Vector3(0, 2, 6));
      camera.position.lerp(desiredPosition, 0.05);
    } else {
      const defaultCamPos = new THREE.Vector3(0, 30, 70);
      camera.position.lerp(defaultCamPos, 0.05);
    }
  });

  return (
    <group>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />

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

      {/* Simply add OrbitControls component here */}
      <OrbitControls
        enableDamping={true}
        dampingFactor={0.1}
        enableZoom={true}
        minDistance={5}
        maxDistance={150}
        target={planetPosition ?? new THREE.Vector3(0, 0, 0)}
      />
    </group>
  );
};

export default SolarSystem;
