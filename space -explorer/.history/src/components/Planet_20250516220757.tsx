import React, { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { TextureLoader } from 'three';
import { PlanetData } from '../types';

interface PlanetProps {
  data: PlanetData;
}

const Planet: React.FC<PlanetProps> = ({ data }) => {
  const meshRef = useRef<THREE.Mesh>(null!);

  // Load texture if provided
  const texture = data.texture ? useLoader(TextureLoader, data.texture) : null;

  // Rotation animation
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += data.rotationSpeed * 0.01;
    }
  });

  return (
    <mesh ref={meshRef} position={[data.distance, 0, 0]}>
      <sphereGeometry args={[data.size, 32, 32]} />
      <meshStandardMaterial
        map={texture || undefined}
        color={texture ? undefined : data.color}
      />
    </mesh>
  );
};

export default Planet;
