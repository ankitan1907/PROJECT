import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { PlanetData } from '../types';
import { useStore } from '../store';

interface PlanetProps extends PlanetData {
  eccentricity?: number;
  inclination?: number; // tilt of orbit in radians, optional
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
  inclination = 0,
  onClick
}) => {
  const planetRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const selectedPlanet = useStore((state) => state.selectedPlanet);
  const isSelected = selectedPlanet === name;

  const planetTexture = useLoader(TextureLoader, texture);
  const ringTex = ringTexture ? useLoader(TextureLoader, ringTexture) : null;

  // Semi-major and semi-minor axes
  const a = distance;
  const b = a * Math.sqrt(1 - eccentricity * eccentricity);

  // Generate elliptical orbit geometry with inclination tilt applied
  const orbitGeometry = useMemo(() => {
    const points = [];
    const segments = 128;

    // Rotation matrix around X axis by inclination angle
    const rotMatrix = new THREE.Matrix4().makeRotationX(inclination);

    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const x = Math.cos(theta) * a;
      const z = Math.sin(theta) * b;
      const point = new THREE.Vector3(x, 0, z);
      point.applyMatrix4(rotMatrix);
      points.push(point.x, point.y, point.z);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    return geometry;
  }, [a, b, inclination]);

  // Ring geometry, if any
  const ringGeometry = useMemo(() => {
    if (!ringTexture) return null;
    return new THREE.RingGeometry(size * 1.2, size * 2, 64);
  }, [ringTexture, size]);

  useFrame((state, delta) => {
    if (planetRef.current && !isSelected) {
      const elapsed = state.clock.getElapsedTime();
      const angle = (elapsed * orbitalSpeed + initialAngle) % (2 * Math.PI);

      // Calculate position on ellipse before tilt
      const x = Math.cos(angle) * a;
      const z = Math.sin(angle) * b;

      // Apply inclination rotation (tilt) around X axis
      const pos = new THREE.Vector3(x, 0, z);
      const rotMatrix = new THREE.Matrix4().makeRotationX(inclination);
      pos.applyMatrix4(rotMatrix);

      // Set planet position
      planetRef.current.position.set(pos.x, pos.y, pos.z);
      planetRef.current.rotation.y += rotationSpeed * delta;

      // Set ring position & rotation if any
      if (ringRef.current) {
        ringRef.current.position.set(pos.x, pos.y, pos.z);
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

      {/* Rings if present */}
      {ringTexture && ringGeometry && ringTex && (
        <mesh
          ref={ringRef}
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
  );
};

export default Planet;
