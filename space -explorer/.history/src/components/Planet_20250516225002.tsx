import React, { useRef } from 'react';
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
  texture,
  ringTexture,  // new prop
  onClick
}) => {
  const orbitRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const selectedPlanet = useStore((state) => state.selectedPlanet);
  const isSelected = selectedPlanet === name;

  // Load planet texture
  const planetMap = useLoader(TextureLoader, texture);

  // Load ring texture if available
  const ringMap = ringTexture ? useLoader(TextureLoader, ringTexture) : null;

  // Orbit path geometry
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
      orbitRef.current.rotation.y = clock.getElapsedTime() * orbitalSpeed;
      planetRef.current.rotation.y += rotationSpeed;
      if (ringRef.current) {
        ringRef.current.rotation.z = Math.PI / 2;  // tilt ring horizontally
        ringRef.current.rotation.y += rotationSpeed;  // optional: rotate ring same as planet
      }
    }
  });

  return (
    <group>
      {/* Orbit line */}
      <line>
        <bufferGeometry attach="geometry" {...orbitGeometry} />
        <lineBasicMaterial attach="material" color="#ffffff" opacity={0.2} transparent />
      </line>

      {/* Planet with orbit */}
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
            map={planetMap}
            roughness={0.7}
            metalness={0.3}
            color={color}
          />
        </mesh>

        {/* Ring if present */}
        {ringMap && (
          <mesh
            ref={ringRef}
            position={[distance, 0, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[size * 1.2, size * 2, 64]} />
            <meshBasicMaterial
              map={ringMap}
              side={THREE.DoubleSide}
              transparent={true}
              opacity={0.8}
              depthWrite={false}
            />
          </mesh>
        )}
      </group>
    </group>
  );
};

export default Planet;
