import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useStore } from '../store';
import { PlanetData } from '../types';
import * as THREE from 'three';
import { TextureLoader } from 'three';

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
  onClick
}) => {
  const orbitRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const selectedPlanet = useStore((state) => state.selectedPlanet);
  const isSelected = selectedPlanet === name;

  const texturePath = `/textures/${name.toLowerCase()}.jpg`;
  const texture = useLoader(TextureLoader, texturePath);

  const ringTexture = name.toLowerCase() === 'saturn' 
    ? useLoader(TextureLoader, '/textures/ring.png') 
    : null;

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

  const ringGeometry = useMemo(() => {
    if (name.toLowerCase() !== 'saturn') return null;
    return new THREE.RingGeometry(size * 1.2, size * 2, 64);
  }, [name, size]);

  useFrame((state, delta) => {
    if (orbitRef.current && planetRef.current && !isSelected) {
      orbitRef.current.rotation.y = state.clock.getElapsedTime() * orbitalSpeed;
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
          position={[distance, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            const worldPos = new THREE.Vector3();
            planetRef.current?.getWorldPosition(worldPos);
            onClick(name, worldPos);
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

        {name.toLowerCase() === 'saturn' && ringGeometry && ringTexture && (
          <mesh
            ref={ringRef}
            position={[distance, 0, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <primitive attach="geometry" object={ringGeometry} />
            <meshStandardMaterial
              map={ringTexture}
              transparent={true}
              side={THREE.DoubleSide}
              opacity={2}
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
