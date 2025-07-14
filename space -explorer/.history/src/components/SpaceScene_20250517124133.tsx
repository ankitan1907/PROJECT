import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import SolarSystem from './SolarSystem';
import { useStore } from '../store';
import { planetData } from '../data/planetData';
import * as THREE from 'three';

const CameraZoom: React.FC = () => {
  const selectedPlanet = useStore((state) => state.selectedPlanet);
  const { camera } = useThree();
  const targetRef = useRef<THREE.Vector3 | null>(null);

  useEffect(() => {
    const planet = planetData.find(p => p.name === selectedPlanet);
    if (planet) {
      targetRef.current = new THREE.Vector3(planet.distance, 0, 5); // Camera target position near the planet
    } else {
      targetRef.current = new THREE.Vector3(0, 20, 35); // Reset position if no planet selected
    }
  }, [selectedPlanet]);

  useFrame(() => {
    if (targetRef.current) {
      camera.position.lerp(targetRef.current, 0.05); // Smooth movement
      const lookAt = selectedPlanet
        ? new THREE.Vector3(planetData.find(p => p.name === selectedPlanet)!.distance, 0, 0)
        : new THREE.Vector3(0, 0, 0);
      camera.lookAt(lookAt);
    }
  });

  return null;
};

const SpaceScene: React.FC = () => {
  const controlsRef = useRef<any>(null);
  const selectedPlanet = useStore((state) => state.selectedPlanet);

  return (
    <Canvas
      camera={{ position: [0, 20, 35], fov: 60 }}
      style={{ background: '#000000' }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 0]} intensity={2} color="#ffffff" />

      <Stars 
        radius={100} 
        depth={50} 
        count={5000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={1} 
      />

      <SolarSystem />
      <CameraZoom />

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={true}
        minDistance={10}
        maxDistance={100}
        enabled={!selectedPlanet} // Disable control when zoomed in
      />
    </Canvas>
  );
};

export default SpaceScene;
