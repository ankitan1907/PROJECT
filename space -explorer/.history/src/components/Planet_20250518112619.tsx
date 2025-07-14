import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { PlanetData } from '../types';
import { useStore } from '../store';

interface PlanetProps extends PlanetData {
  eccentricity?: number; // 0 - circle, >0 ellipse
  inclination?: number;  // radians, orbit tilt
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
  onClick,
}) => {
  const planetRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const selectedPlanet = useStore((state) => state.selectedPlanet);
  const isSelected = selectedPlanet === name;

  const planetTexture = useLoader(TextureLoader, texture);
  const ringTex = ringTexture ? useLoader(TextureLoader, ringTexture) : null;

  // Calculate semi-major and semi-minor axes for ellipse
  const a = distance; // semi-major axis (distance from focus to farthest point)
  const e = eccentricity;
  const b = a * Math.sqrt(1 - e * e); // semi-minor axis

  // Inclination rotation matrix (tilt orbit)
  const inclinationMatrix = useMemo(() => {
    return new THREE.Matrix4().makeRotationX(inclination);
  }, [inclination]);

  // Elliptical orbit geometry
  const orbitGeometry = useMemo(() => {
    const points: number[] = [];
    const segments = 128;

    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const x = a * Math.cos(theta);
      const z = b * Math.sin(theta);

      const point = new THREE.Vector3(x, 0, z);
      point.applyMatrix4(inclinationMatrix);

      points.push(point.x, point.y, point.z);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    return geometry;
  }, [a, b, inclinationMatrix]);

  // Ring geometry if ring texture exists
  const ringGeometry = useMemo(() => {
    if (!ringTexture) return null;
    return new THREE.RingGeometry(size * 1.2, size * 2, 64);
  }, [ringTexture, size]);

  useFrame((state, delta) => {
    if (planetRef.current && !isSelected) {
      const elapsed = state.clock.getElapsedTime();
      // Orbital angle moves with time + initial offset
      const angle = (elapsed * orbitalSpeed + initialAngle) % (2 * Math.PI);

      // Calculate position on ellipse before tilt
      const x = a * Math.cos(angle);
      const z = b * Math.sin(angle);

      const pos = new THREE.Vector3(x, 0, z);
      pos.applyMatrix4(inclinationMatrix);

      // Update planet position & rotation
      planetRef.current.position.set(pos.x, pos.y, pos.z);
      planetRef.current.rotation.y += rotationSpeed * delta;

      // Update ring position & rotation
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

      {/* Rings */}
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
