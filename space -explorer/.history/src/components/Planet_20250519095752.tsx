import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { PlanetData } from '../types';

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
  eccentricity = 0,
  onClick,
}) => {
  const planetRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const planetTexture = useLoader(TextureLoader, texture);
  const ringTex = ringTexture ? useLoader(TextureLoader, ringTexture) : null;

  // Elliptical orbit parameters
  const a = distance; // semi-major axis
  const e = eccentricity;
  const b = a * Math.sqrt(1 - e * e); // semi-minor axis
  const c = a * e; // focus offset (shift ellipse center so sun is at focus)

  // Generate points along the ellipse orbit in XZ plane (Y=0)
  const orbitPoints = useMemo(() => {
    const points = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const x = a * Math.cos(theta) - c; // minus c to place sun at focus at origin
      const z = b * Math.sin(theta);
      points.push(new THREE.Vector3(x, 0, z));
    }
    return points;
  }, [a, b, c]);

  useFrame((state, delta) => {
    if (!planetRef.current) return;
    const elapsed = state.clock.getElapsedTime();
    const angle = (elapsed * orbitalSpeed + initialAngle) % (2 * Math.PI);
    const x = a * Math.cos(angle) - c; // minus c to place sun at focus at origin
    const z = b * Math.sin(angle);
    planetRef.current.position.set(x, 0, z);
    planetRef.current.rotation.y += rotationSpeed * delta;

    if (ringRef.current) {
      ringRef.current.position.set(x, 0, z);
      ringRef.current.rotation.z += rotationSpeed * delta;
    }
  });

  const ringGeometry = useMemo(() => {
    if (!ringTexture) return null;
    return new THREE.RingGeometry(size * 1.2, size * 2, 64);
  }, [ringTexture, size]);

  return (
    <group>
      <lineLoop>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={orbitPoints.length}
            array={new Float32Array(orbitPoints.flatMap(p => [p.x, p.y, p.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="white" opacity={0.2} transparent />
      </lineLoop>

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
