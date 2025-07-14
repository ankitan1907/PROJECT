import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { PlanetData } from '../types';
import { useStore } from '../store';

interface PlanetProps extends PlanetData {
  onClick: (name: string, position: THREE.Vector3) => void;
}

const Planet: React.FC<PlanetProps> = ({
  name,
  color,
  distance,
  size,
  rotationSpeed,
  orbitalSpeed,
  texture,
  ringTexture,
  initialAngle = 0,
  onClick
}) => {
  const orbitRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const selectedPlanet = useStore((state) => state.selectedPlanet);
  const isSelected = selectedPlanet === name;

  const planetTexture = useLoader(TextureLoader, texture);
  const ringTex = ringTexture ? useLoader(TextureLoader, ringTexture) : null;

  const orbitGeometry = useMemo(() => {
    const points = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const a = distance;        // semi-major axis
const b = distance * 0.6;  // semi-minor axis (adjust 0.6 as needed for elongation)
points.push(Math.cos(theta) * a, 0, Math.sin(theta) * b);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    return geometry;
  }, [distance]);

  const ringGeometry = useMemo(() => {
    if (!ringTexture) return null;
    return new THREE.RingGeometry(size * 1.2, size * 2, 64);
  }, [ringTexture, size]);

  useFrame((state, delta) => {
    if (orbitRef.current && planetRef.current && !isSelected) {
      const elapsed = state.clock.getElapsedTime();
      const angle = (elapsed * orbitalSpeed + initialAngle) % (2 * Math.PI);
      orbitRef.current.rotation.y = angle;
      planetRef.current.rotation.y += rotationSpeed * delta;
      if (ringRef.current) {
        ringRef.current.rotation.z += rotationSpeed * delta;
      }
    }
  });

  return (
    <group>
      <line>
        <primitive object={orbitGeometry} attach="geometry" />
        <lineBasicMaterial attach="material" color="#ffffff" opacity={0.2} transparent />
      </line>

      <group ref={orbitRef}>
        <mesh
          ref={planetRef}
          position={[distance, 0, distance * 0.6]}
          onClick={(e) => {
            e.stopPropagation();
            const worldPos = new THREE.Vector3();
            planetRef.current?.getWorldPosition(worldPos);
            onClick(name, worldPos);
          }}
        >
          <sphereGeometry args={[size, 32, 32]} />
          <meshStandardMaterial
            map={planetTexture}
            color={planetTexture ? undefined : color}
            roughness={0.7}
            metalness={0.3}
          />
        </mesh>

        {ringTexture && ringGeometry && ringTex && (
          <mesh
            ref={ringRef}
            position={[distance, 0, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <primitive attach="geometry" object={ringGeometry} />
            <meshStandardMaterial
              map={ringTex}
              transparent
              side={THREE.DoubleSide}
              opacity={0.7}
              depthWrite={false}
              color={new THREE.Color(0xffffff)}
              emissive={new THREE.Color(0x222222)}
              emissiveIntensity={0.5}
            />
          </mesh>
        )}
      </group>
    </group>
  );
};

export default Planet;
