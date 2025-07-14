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

const App: React.FC = () => {
  const selectedPlanet = useStore((state) => state.selectedPlanet);

  return (
    <AppContainer>
      <SpaceScene />
      {selectedPlanet && <ChatInterface />}
    </AppContainer>
  );
};

export default App;