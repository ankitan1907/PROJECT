import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';

const CameraZoom: React.FC = () => {
  const selectedPlanet = useStore((state) => state.selectedPlanet);
  const planetPosition = useStore((state) => state.planetPosition);
  const { camera } = useThree();

  const targetRef = useRef<THREE.Vector3 | null>(null);
  const animatingRef = useRef(false);

  useEffect(() => {
    if (selectedPlanet && planetPosition) {
      // Set target a bit offset on z-axis so camera zooms in front of planet
      targetRef.current = planetPosition.clone().add(new THREE.Vector3(0, 0, 5));
      animatingRef.current = true;
    } else {
      // Reset camera to default position
      targetRef.current = new THREE.Vector3(0, 20, 35);
      animatingRef.current = true;
    }
  }, [selectedPlanet, planetPosition]);

  useFrame(() => {
    if (targetRef.current && animatingRef.current) {
      const distance = camera.position.distanceTo(targetRef.current);
      if (distance > 0.1) {
        camera.position.lerp(targetRef.current, 0.05);
        if (selectedPlanet && planetPosition) {
          camera.lookAt(planetPosition);
        } else {
          camera.lookAt(0, 0, 0);
        }
      } else {
        animatingRef.current = false;
      }
    }
  });

  return null;
};

const SpaceScene: React.FC = () => {
  const controlsRef = useRef<any>(null);
  const selectedPlanet = useStore((state) => state.selectedPlanet);

  return (
    <Canvas camera={{ position: [0, 20, 35], fov: 60 }} style={{ background: '#000000' }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 0]} intensity={2} color="#ffffff" />

      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      <SolarSystem />
      <CameraZoom />

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={true}               // Always allow zoom
        enableRotate={!selectedPlanet}  // Disable rotate if a planet is selected
        minDistance={10}
        maxDistance={100}
      />
    </Canvas>
  );
};

export default SpaceScene;
