// App.tsx
import React from 'react';
import styled from 'styled-components';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import SolarSystem from './components/SolarSystem';
import { useStore } from './store';

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: black;
  position: relative;
`;

const ResetButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  padding: 10px 15px;
  background: #222;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  opacity: 0.85;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }
`;

// Component to update camera aspect on resize
function CameraUpdater() {
  const { camera, size } = useThree();
  React.useEffect(() => {
    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix();
  }, [size, camera]);
  return null;
}

const App: React.FC = () => {
  const selectedPlanet = useStore((state) => state.selectedPlanet);
  const setSelectedPlanet = useStore((state) => state.setSelectedPlanet);

  const handleResetView = () => {
    setSelectedPlanet('');
  };

  return (
    <AppContainer>
      <Canvas
        style={{ display: 'block' }}
        camera={{ position: [0, 10, 30], fov: 60 }}
      >
        <CameraUpdater />
        <SolarSystem />
      </Canvas>

      {selectedPlanet && (
        <ResetButton onClick={handleResetView}>Reset View</ResetButton>
      )}
    </AppContainer>
  );
};

export default App;
