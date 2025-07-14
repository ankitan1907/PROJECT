import React, { useState } from 'react';
import MainLayout from './components/Layout/MainLayout';
import ParticleBackground from './components/UI/ParticleBackground';
import VoiceInput from './components/Chat/VoiceInput';
import useChat from './hooks/useChat';
import useVoiceInput from './hooks/useVoiceInput';
import { LANGUAGES } from './data/mockData';

function App() {
  const {
    messages,
    rooms,
    currentRoom,
    currentUser,
    sendMessage,
    changeRoom,
    changeLanguage
  } = useChat();
  
  const [detectedLang, setDetectedLang] = useState<string | undefined>(undefined);
  
  const {
    isListening,
    toggleListening,
    transcript
  } = useVoiceInput({
    onResult: (text) => {
      if (text) {
        sendMessage(text);
      }
    },
    onLanguageDetect: (language) => {
      setDetectedLang(language);
    }
  });

  return (
    <div className="min-h-screen bg-gray-950 overflow-hidden relative">
      {/* Particle Background */}
      <ParticleBackground />
      
      {/* Main Chat Interface */}
      <MainLayout
        currentRoom={currentRoom}
        rooms={rooms}
        messages={messages}
        currentUser={currentUser}
        onRoomChange={changeRoom}
        onSendMessage={sendMessage}
        onLanguageChange={changeLanguage}
        isListening={isListening}
        onToggleVoiceInput={toggleListening}
      />
      
      {/* Voice Input Overlay (shows when active) */}
      {isListening && (
        <VoiceInput
          isListening={isListening}
          onToggleListening={toggleListening}
          detectedLanguage={detectedLang}
        />
      )}
    </div>
  );
}

export default App;