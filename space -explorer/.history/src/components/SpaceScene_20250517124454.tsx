import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import SolarSystem from './SolarSystem';
import { useStore } from '../store';
import * as THREE from 'three';

const CameraZoom: React.FC = () => {
  const selectedPlanet = useStore((state) => state.selectedPlanet);
  const planetPosition = useStore((state) => state.planetPosition);
  const { camera } = useThree();
  const targetRef = useRef<THREE.Vector3 | null>(null);

  useEffect(() => {
    if (selectedPlanet && planetPosition) {
      targetRef.current = planetPosition.clone().add(new THREE.Vector3(0, 0, 5));
    } else {
      targetRef.current = new THREE.Vector3(0, 20, 35);
    }
  }, [selectedPlanet, planetPosition]);

  useFrame(() => {
    if (targetRef.current) {
      camera.position.lerp(targetRef.current, 0.05);
      if (selectedPlanet && planetPosition) {
        camera.lookAt(planetPosition);
      } else {
        camera.lookAt(0, 0, 0);
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
        enableZoom={true}
        minDistance={10}
        maxDistance={100}
        enabled={!selectedPlanet}
      />
    </Canvas>
  );
};

export default SpaceScene;
import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import SolarSystem from './SolarSystem';
import { useStore } from '../store';
import * as THREE from 'three';

const CameraZoom: React.FC = () => {
  const selectedPlanet = useStore((state) => state.selectedPlanet);
  const planetPosition = useStore((state) => state.planetPosition);
  const { camera } = useThree();
  const targetRef = useRef<THREE.Vector3 | null>(null);

  useEffect(() => {
    if (selectedPlanet && planetPosition) {
      targetRef.current = planetPosition.clone().add(new THREE.Vector3(0, 0, 5));
    } else {
      targetRef.current = new THREE.Vector3(0, 20, 35);
    }
  }, [selectedPlanet, planetPosition]);

  useFrame(() => {
    if (targetRef.current) {
      camera.position.lerp(targetRef.current, 0.05);
      if (selectedPlanet && planetPosition) {
        camera.lookAt(planetPosition);
      } else {
        camera.lookAt(0, 0, 0);
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
        enableZoom={true}
        minDistance={10}
        maxDistance={100}
        enabled={!selectedPlanet}
      />
    </Canvas>
  );
};

export default SpaceScene;
