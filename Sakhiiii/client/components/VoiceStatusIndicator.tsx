import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { voiceAssistantService } from '@/services/voiceAssistantService';
import { useLanguage } from '@/contexts/LanguageContext';

export default function VoiceStatusIndicator() {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    setIsSupported(voiceAssistantService.isSupported());
    setIsVoiceEnabled(voiceAssistantService.isVoiceEnabled());
  }, []);

  const toggleVoice = () => {
    try {
      if (isVoiceEnabled) {
        voiceAssistantService.disable();
        setIsVoiceEnabled(false);
      } else {
        voiceAssistantService.enable();
        setIsVoiceEnabled(true);

        // Announce activation with delay to ensure initialization
        setTimeout(() => {
          const message = currentLanguage === 'en' ?
            'Voice assistant activated. Sakhi is now speaking.' :
            currentLanguage === 'hi' ?
            'आवाज सहायक सक्रिय। सखी अब बोल रही है।' :
            'Voice assistant activated.';

          voiceAssistantService.speakCustomMessage(message, 'low');
        }, 1000); // Increased delay for better initialization
      }
    } catch (error) {
      console.warn('Error toggling voice assistant:', error);
      // Reset state on error
      setIsVoiceEnabled(voiceAssistantService.isVoiceEnabled());
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-24 right-4 z-40"
    >
      <Button
        onClick={toggleVoice}
        variant={isVoiceEnabled ? "default" : "outline"}
        size="sm"
        className={`rounded-full shadow-beautiful transition-all duration-300 hover-lift ${
          isVoiceEnabled
            ? 'gradient-primary text-white hover:shadow-glow'
            : 'glass hover:glass-dark text-foreground'
        }`}
        title={isVoiceEnabled ? 'Voice Assistant: ON' : 'Voice Assistant: OFF'}
      >
        <div className="flex items-center gap-2">
          {isVoiceEnabled ? (
            <>
              <Volume2 className="w-4 h-4" />
              <span className="text-xs font-medium">Voice ON</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4" />
              <span className="text-xs font-medium">Voice OFF</span>
            </>
          )}
        </div>
      </Button>
      
      {isVoiceEnabled && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full mb-2 right-0 glass-dark text-white text-xs px-3 py-2 rounded-xl whitespace-nowrap shadow-beautiful"
        >
          <span className="font-medium">🎙️ Voice Assistant Active</span>
        </motion.div>
      )}
    </motion.div>
  );
}
