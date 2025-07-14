import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import SolarSystem from './SolarSystem';
import { useStore } from '../store';

const SpaceScene: React.FC = () => {
  const controlsRef = useRef(null);
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