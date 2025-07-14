import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { PlanetData } from '../types';
import { useStore } from '../store';

interface PlanetProps extends PlanetData {
  distanceA: number; // Semi-major axis (ellipse x-radius)
  distanceB: number; // Semi-minor axis (ellipse z-radius)
  onClick: (name: string, position: THREE.Vector3) => void;
  initialAngle?: number;
}

const Planet: React.FC<PlanetProps> = ({
  name,
  color,
  distanceA,
  distanceB,
  size,
  rotationSpeed,
  orbitalSpeed,
  texture,
  ringTexture,
  initialAngle = 0,
  onClick
}) => {
  const planetRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const selectedPlanet = useStore((state) => state.selectedPlanet);
  const isSelected = selectedPlanet === name;

  const planetTexture = useLoader(TextureLoader, texture);
  const ringTex = ringTexture ? useLoader(TextureLoader, ringTexture) : null;

  // Elliptical orbit geometry
  const orbitGeometry = useMemo(() => {
    const points: number[] = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      // x = cos(theta)*a, z = sin(theta)*b for ellipse
      points.push(Math.cos(theta) * distanceA, 0, Math.sin(theta) * distanceB);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    return geometry;
  }, [distanceA, distanceB]);

  const ringGeometry = useMemo(() => {
    if (!ringTexture) return null;
    return new THREE.RingGeometry(size * 1.2, size * 2, 64);
  }, [ringTexture, size]);

  useFrame((state, delta) => {
    if (planetRef.current && !isSelected) {
      const elapsed = state.clock.getElapsedTime();
      const angle = (elapsed * orbitalSpeed + initialAngle) % (2 * Math.PI);

      // Update planet position on elliptical orbit
      const x = distanceA * Math.cos(angle);
      const z = distanceB * Math.sin(angle);
      planetRef.current.position.set(x, 0, z);

      // Rotate planet on its axis
      planetRef.current.rotation.y += rotationSpeed * delta;

      // Update ring position and rotation if exists
      if (ringRef.current) {
        ringRef.current.position.set(x, 0, z);
        ringRef.current.rotation.z += rotationSpeed * delta;
      }
    }
  });

  return (
    <group>
      {/* Draw elliptical orbit */}
      <line>
        <primitive object={orbitGeometry} attach="geometry" />
        <lineBasicMaterial attach="material" color="#ffffff" opacity={0.2} transparent />
      </line>

      {/* Planet mesh */}
      <mesh
        ref={planetRef}
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

      {/* Ring mesh if applicable */}
      {ringTexture && ringGeometry && ringTex && (
        <mesh
          ref={ringRef}
          rotation={[-Math.PI / 2, 0, 0]} // Flat ring lying in XZ plane
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
  );
};

export default Planet;
