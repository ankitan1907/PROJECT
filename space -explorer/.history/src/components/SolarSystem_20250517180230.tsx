// src/components/SolarSystem.js
import React, { useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import Planet from './Planet';

const planetData = [
  {
    name: 'Mercury',
    textureMap: '/textures/mercury.jpg',
    size: 0.5,
    distance: 5,
    speed: 1.2,
    position: [5, 0, 0],
  },
  {
    name: 'Venus',
    textureMap: '/textures/venus.jpg',
    size: 0.9,
    distance: 7,
    speed: 1.0,
    position: [7, 0, 0],
  },
  {
    name: 'Earth',
    textureMap: '/textures/earth.jpg',
    size: 1,
    distance: 10,
    speed: 0.8,
    position: [10, 0, 0],
  },
  {
    name: 'Mars',
    textureMap: '/textures/mars.jpg',
    size: 0.8,
    distance: 13,
    speed: 0.6,
    position: [13, 0, 0],
  },
  // Add more planets here if needed
];

const CameraRig = ({ target }) => {
  const { camera } = useThree();
  useFrame(() => {
    if (target) {
      const desiredPosition = new THREE.Vector3(
        target.x * 2,
        target.y * 2,
        target.z * 2 + 5
      );
      camera.position.lerp(desiredPosition, 0.05);
      camera.lookAt(target);
    }
  });
  return null;
};

const SolarSystem = () => {
  const [selectedPlanet, setSelectedPlanet] = useState(null);

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <Canvas shadows camera={{ position: [0, 20, 30], fov: 50 }}>
        <CameraRig target={selectedPlanet?.position} />
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 0, 0]} intensity={2} castShadow />
        <Stars />
        <OrbitControls />

        {/* Render Planets */}
        {planetData.map((planet, index) => (
          <Planet
            key={index}
            {...planet}
            onClick={(data) => setSelectedPlanet(data)}
          />
        ))}
      </Canvas>

      {/* Planet Info Panel */}
      {selectedPlanet && (
        <div style={{
          position: 'absolute',
          top: 20,
          left: 20,
          padding: '12px 16px',
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          color: '#fff',
          borderRadius: '10px',
          maxWidth: '300px',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h2 style={{ margin: 0 }}>{selectedPlanet.name}</h2>
          <p style={{ marginTop: 8 }}>
            Position: {selectedPlanet.position.toArray().map(n => n.toFixed(2)).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
};

export default SolarSystem;
