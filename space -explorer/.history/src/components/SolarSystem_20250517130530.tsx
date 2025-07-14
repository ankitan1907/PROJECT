import React, { useRef } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import Planet from './Planet';
import { planetData } from '../data/planetData';
import { useStore } from '../store';

const SolarSystem: React.FC = () => {
  const sunRef = useRef<THREE.Mesh>(null);
  const setSelectedPlanet = useStore((state) => state.setSelectedPlanet);
  const setPlanetPosition = useStore((state) => state.setPlanetPosition);
  const selectedPlanet = useStore((state) => state.selectedPlanet);
  const planetPosition = useStore((state) => state.planetPosition);

  const sunTexture = useLoader(TextureLoader, '/textures/sun.jpg');
  const { camera } = useThree();

  useFrame(({ clock }) => {
    if (sunRef.current) {
      sunRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    }

    // Smooth camera movement
    if (planetPosition) {
      const targetPos = planetPosition.clone().add(new THREE.Vector3(0, 2, 5));
      camera.position.lerp(targetPos, 0.1);
      camera.lookAt(planetPosition);
    } else {
      const defaultPos = new THREE.Vector3(0, 30, 50);
      camera.position.lerp(defaultPos, 0.1);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
    }
  });

  return (
    <group>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />

      <mesh ref={sunRef} position={[0, 0, 0]} onClick={() => {
        // Sun click: set selected planet as Sun and position (0,0,0)
        setSelectedPlanet('Sun');
        setPlanetPosition(new THREE.Vector3(0, 0, 0));
      }}>
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
          selectedPlanet={selectedPlanet}
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
