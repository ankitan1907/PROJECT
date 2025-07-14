import React from 'react';
import styled from 'styled-components';
import SpaceScene from './components/SpaceScene';
import ChatInterface from './components/ChatInterface';
import { useStore } from './store';

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #000;
`;

const ResetButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 100;
  padding: 10px 15px;
  background: #222;
  color: #fff;
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

const App: React.FC = () => {
  const selectedPlanet = useStore((state) => state.selectedPlanet);
  const setSelectedPlanet = useStore((state) => state.setSelectedPlanet);

  const handleResetView = () => {
    setSelectedPlanet('');
  };

  return (
    <AppContainer>
      <SpaceScene />
      
      {selectedPlanet && (
        <>
          <ResetButton onClick={handleResetView}>Reset View</ResetButton>
          <ChatInterface />
        </>
      )}
    </AppContainer>
  );
};

export default App;
