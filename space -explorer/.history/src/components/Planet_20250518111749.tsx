import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { PlanetData } from '../types';
import { useStore } from '../store';

interface PlanetProps extends PlanetData {
  eccentricity?: number;
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
  eccentricity = 0,
  onClick,
}) => {
  const planetRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const selectedPlanet = useStore((state) => state.selectedPlanet);
  const isSelected = selectedPlanet === name;

  // Load textures
  const planetTexture = useLoader(TextureLoader, texture);
  const ringTex = ringTexture ? useLoader(TextureLoader, ringTexture) : null;

  // Calculate ellipse parameters for orbit
  const a = distance;
  const b = distance * Math.sqrt(1 - eccentricity ** 2);

  // Create orbit geometry (ellipse)
  const orbitGeometry = useMemo(() => {
    const points: number[] = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(Math.cos(theta) * a, 0, Math.sin(theta) * b);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    return geometry;
  }, [a, b]);

  // Create ring geometry if ringTexture exists
  const ringGeometry = useMemo(() => {
    if (!ringTexture) return null;
    return new THREE.RingGeometry(size * 1.2, size * 2, 64);
  }, [ringTexture, size]);

  useFrame((state, delta) => {
    if (planetRef.current) {
      if (!isSelected) {
        // Animate orbit around ellipse
        const elapsed = state.clock.getElapsedTime();
        const angle = (elapsed * orbitalSpeed + initialAngle) % (2 * Math.PI);

        const x = Math.cos(angle) * a;
        const z = Math.sin(angle) * b;

        planetRef.current.position.set(x, 0, z);
      }

      // Rotate the planet on its own axis
      planetRef.current.rotation.y += rotationSpeed * delta;

      if (ringRef.current) {
        ringRef.current.position.copy(planetRef.current.position);
        ringRef.current.rotation.z += rotationSpeed * delta;
      }
    }
  });

  return (
    <group>
      {/* Orbit path */}
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

      {/* Rings */}
      {ringTexture && ringGeometry && ringTex && (
        <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
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
