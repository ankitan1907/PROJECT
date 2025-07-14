import { useState, useCallback, useEffect } from 'react';

interface UseVoiceInputOptions {
  onResult?: (text: string) => void;
  onLanguageDetect?: (language: string) => void;
}

// Mock function to simulate language detection
const detectLanguage = (text: string): string => {
  // This would be replaced with a real language detection API
  if (text.match(/[¿¡áéíóúüñ]/i)) return 'Spanish';
  if (text.match(/[àâçéèêëîïôùûüÿœæ]/i)) return 'French';
  if (text.match(/[äöüß]/i)) return 'German';
  if (text.match(/[あいうえおかきくけこ]/i)) return 'Japanese';
  return 'English';
};

export const useVoiceInput = ({ onResult, onLanguageDetect }: UseVoiceInputOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState<string | undefined>(undefined);

  // Simulated voice recognition for demo purposes
  const startListening = useCallback(() => {
    setIsListening(true);
    
    // In a real app, this would use the Web Speech API
    // Here we'll simulate with a timeout and mock data
    const timer = setTimeout(() => {
      const mockTranscripts = [
        "Hello, how are you today?",
        "¿Cómo estás? Me gustaría hablar contigo.",
        "Bonjour! Comment ça va aujourd'hui?",
        "こんにちは、元気ですか？"
      ];
      
      const randomText = mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
      setTranscript(randomText);
      
      const language = detectLanguage(randomText);
      setDetectedLanguage(language);
      
      if (onResult) onResult(randomText);
      if (onLanguageDetect) onLanguageDetect(language);
      
      setIsListening(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onResult, onLanguageDetect]);
  
  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);
  
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    transcript,
    detectedLanguage,
    startListening,
    stopListening,
    toggleListening
  };
};

export default useVoiceInput;