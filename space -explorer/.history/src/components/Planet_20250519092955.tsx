import React, { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { TextureLoader } from 'three';
import { Line } from '@react-three/drei';

interface PlanetProps {
  name: string;
  size: number;
  distance: number;
  texture: string;
  speed: number;
  initialAngle: number;
  eccentricity?: number; // optional: how elliptical (0 = circle, closer to 1 = more stretched)
  onClick: (name: string, position: THREE.Vector3) => void;
}

const Planet: React.FC<PlanetProps> = ({
  name,
  size,
  distance,
  texture,
  speed,
  initialAngle,
  eccentricity = 0.3, // default to a slightly elliptical orbit
  onClick,
}) => {
  const planetRef = useRef<THREE.Mesh>(null);
  const angleRef = useRef(initialAngle);

  const planetTexture = useLoader(TextureLoader, texture);

  // Calculate semi-major (a) and semi-minor (b) axes
  const a = distance;
  const b = distance * Math.sqrt(1 - eccentricity * eccentricity);

  useFrame(({ clock }) => {
    angleRef.current += speed;

    const x = a * Math.cos(angleRef.current);
    const z = b * Math.sin(angleRef.current);
    const y = 0;

    if (planetRef.current) {
      planetRef.current.position.set(x, y, z);
      planetRef.current.rotation.y += 0.01;
    }
  });

  // Generate elliptical orbit points for visualization
  const ellipsePoints = Array.from({ length: 128 }, (_, i) => {
    const theta = (i / 128) * Math.PI * 2;
    const x = a * Math.cos(theta);
    const z = b * Math.sin(theta);
    return new THREE.Vector3(x, 0, z);
  });

  return (
    <group>
      <mesh
        ref={planetRef}
        onClick={(e) => {
          e.stopPropagation();
          if (planetRef.current) {
            onClick(name, planetRef.current.position.clone());
          }
        }}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial map={planetTexture} />
      </mesh>

      {/* Draw elliptical orbit */}
      <Line points={ellipsePoints} color="white" lineWidth={0.5} dashed={true} dashSize={0.3} gapSize={0.2} />
    </group>
  );
};

export default Planet;
