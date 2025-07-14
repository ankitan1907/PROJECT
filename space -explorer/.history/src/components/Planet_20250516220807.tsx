import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../store';
import { PlanetData } from '../types';
import * as THREE from 'three';

interface PlanetProps extends PlanetData {
  onClick: () => void;
}

const Planet: React.FC<PlanetProps> = ({
  name,
  color,
  distance,
  size,
  rotationSpeed,
  orbitalSpeed,
  onClick
}) => {
  const orbitRef = useRef(null);
  const planetRef = useRef(null);
  const selectedPlanet = useStore((state) => state.selectedPlanet);
  const isSelected = selectedPlanet === name;

  // Create orbit path
  const orbitGeometry = new THREE.BufferGeometry();
  const orbitPoints = [];
  const segments = 128;
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    orbitPoints.push(
      Math.cos(theta) * distance,
      0,
      Math.sin(theta) * distance
    );
  }
  orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitPoints, 3));

  useFrame(({ clock }) => {
    if (orbitRef.current && planetRef.current && !isSelected) {
      // Orbital rotation based on real astronomical data (scaled)
      orbitRef.current.rotation.y = clock.getElapsedTime() * orbitalSpeed;
      // Axial rotation based on real astronomical data (scaled)
      planetRef.current.rotation.y += rotationSpeed;
    }
  });

  return (
    <group>
      {/* Orbit line */}
      <line>
        <bufferGeometry attach="geometry" {...orbitGeometry} />
        <lineBasicMaterial attach="material" color="#ffffff" opacity={0.2} transparent />
      </line>
      
      {/* Planet group */}
      <group ref={orbitRef}>
        <mesh
          ref={planetRef}
          position={[distance, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <sphereGeometry args={[size, 32, 32]} />
          <meshStandardMaterial
            color={color}
            roughness={0.7}
            metalness={0.3}
          />
        </mesh>
      </group>
    </group>
  );
};

export default Planet;