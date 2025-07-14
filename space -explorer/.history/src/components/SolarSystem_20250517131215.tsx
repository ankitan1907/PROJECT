import React, { useRef, useEffect } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { TextureLoader } from 'three';
import { OrbitControls } from '@react-three/drei';

import { useStore } from '../store';  // your Zustand store
import Planet from './Planet';
import { planetData } from '../data/planetData';

const SolarSystem: React.FC = () => {
  const sunRef = useRef<THREE.Mesh>(null);
  const { camera, gl } = useThree();

  const setSelectedPlanet = useStore((state) => state.setSelectedPlanet);
  const setPlanetPosition = useStore((state) => state.setPlanetPosition);
  const selectedPlanet = useStore((state) => state.selectedPlanet);
  const planetPosition = useStore((state) => state.planetPosition);

  // OrbitControls ref
  const controls = useRef<OrbitControls>();

  // Setup OrbitControls once
  useEffect(() => {
    controls.current = new OrbitControls(camera, gl.domElement);
    controls.current.enableDamping = true;
    controls.current.dampingFactor = 0.1;
    controls.current.enableZoom = true;
    controls.current.minDistance = 5;
    controls.current.maxDistance = 150;
    controls.current.target.set(0, 0, 0);
    controls.current.update();

    return () => {
      controls.current?.dispose();
    };
  }, [camera, gl]);

  // Sun texture
  const sunTexture = useLoader(TextureLoader, '/textures/sun.jpg');

  // Rotate sun continuously
  useFrame(({ clock }) => {
    if (sunRef.current) {
      sunRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
  });

  // Smooth camera movement & update controls target every frame
  useFrame(() => {
    if (!controls.current) return;

    if (selectedPlanet && planetPosition) {
      // Zoom close to selected planet + offset so camera is not inside it
      const desiredPosition = planetPosition.clone().add(new THREE.Vector3(0, 2, 6));
      camera.position.lerp(desiredPosition, 0.05);

      // Smoothly update controls target to planet position
      controls.current.target.lerp(planetPosition, 0.05);
    } else {
      // Zoom out to view full solar system
      const defaultCamPos = new THREE.Vector3(0, 30, 70);
      camera.position.lerp(defaultCamPos, 0.05);
      controls.current.target.lerp(new THREE.Vector3(0, 0, 0), 0.05);
    }

    controls.current.update();
  });

  return (
    <group>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />

      <mesh
        ref={sunRef}
        position={[0, 0, 0]}
        onClick={() => {
          setSelectedPlanet('Sun');
          setPlanetPosition(new THREE.Vector3(0, 0, 0));
        }}
      >
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          map={sunTexture}
          emissive="#FDB813"
          emissiveIntensity={0.3}
          roughness={0.4}
          metalness={0}
        />
        <pointLight intensity={0.8} distance={100} decay={2} />
      </mesh>

      {planetData.map((planet, idx) => (
        <Planet
          key={planet.name}
          {...planet}
          initialAngle={(idx / planetData.length) * Math.PI * 2}
          onClick={(name, pos) => {
            setSelectedPlanet(name);
            setPlanetPosition(pos);
          }}
        />
      ))}
    </group>
  );
};

export default SolarSystem;
