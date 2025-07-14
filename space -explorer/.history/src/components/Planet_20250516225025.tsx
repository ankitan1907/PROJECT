import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useStore } from '../store';
import { PlanetData } from '../types';
import * as THREE from 'three';
import { TextureLoader } from 'three';

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
  const orbitRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const selectedPlanet = useStore((state) => state.selectedPlanet);
  const isSelected = selectedPlanet === name;

  const texturePath = `/textures/${name.toLowerCase()}.jpg`;
  const texture = useLoader(TextureLoader, texturePath);

  // Generate orbit geometry only once
  const orbitGeometry = useMemo(() => {
    const points = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(Math.cos(theta) * distance, 0, Math.sin(theta) * distance);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    return geometry;
  }, [distance]);

  // Animate rotation and orbit
  useFrame((state, delta) => {
  if (orbitRef.current && planetRef.current && !isSelected) {
    orbitRef.current.rotation.y = state.clock.getElapsedTime() * orbitalSpeed;
    planetRef.current.rotation.y += rotationSpeed * delta;
  }
});


  return (
    <group>
      {/* Orbit Path */}
      <line>
        <primitive object={orbitGeometry} attach="geometry" />
        <lineBasicMaterial attach="material" color="#ffffff" opacity={0.2} transparent />
      </line>

      {/* Planet */}
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
            map={texture}
            color={texture ? undefined : color}
            roughness={0.7}
            metalness={0.3}
          />
        </mesh>
      </group>
    </group>
  );
};

export default Planet;
