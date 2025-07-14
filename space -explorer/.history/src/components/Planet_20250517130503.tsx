import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PlanetProps {
  name: string;
  distance: number;
  size: number;
  rotationSpeed: number;
  orbitalSpeed: number;
  texture: string;
  onClick: (name: string, position: THREE.Vector3) => void;
  selectedPlanet?: string | null;
}

const Planet: React.FC<PlanetProps> = ({
  name,
  distance,
  size,
  rotationSpeed,
  orbitalSpeed,
  texture,
  onClick,
  selectedPlanet,
}) => {
  const planetRef = useRef<THREE.Mesh>(null);
  const orbitRef = useRef<THREE.Group>(null);

  const isSelected = selectedPlanet === name;

  useFrame((state, delta) => {
    if (orbitRef.current && planetRef.current && !isSelected) {
      const elapsed = state.clock.getElapsedTime();
      orbitRef.current.rotation.y = elapsed * orbitalSpeed;
      planetRef.current.rotation.y += rotationSpeed * delta;
    }
  });

  // When clicked, pass planet name and world position to parent
  const handleClick = () => {
    if (planetRef.current) {
      const worldPos = new THREE.Vector3();
      planetRef.current.getWorldPosition(worldPos);
      onClick(name, worldPos);
    }
  };

  return (
    <group ref={orbitRef}>
      <mesh ref={planetRef} position={[distance, 0, 0]} onClick={handleClick}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial map={texture} />
      </mesh>
    </group>
  );
};

export default Planet;
