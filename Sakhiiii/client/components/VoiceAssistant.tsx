import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  MessageCircle,
  Send,
  Settings,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { voiceCommands } from '@shared/mockData';
import { voiceService } from '@/services/voiceService';
import { smsService } from '@/services/smsService';
import VoiceDebug from '@/components/VoiceDebug';

interface VoiceMessage {
  id: string;
  type: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  command?: string;
}

const mockVoiceResponses = {
  en: {
    greeting: "Hello! I'm your safety assistant. You can say commands like 'SOS', 'find safe route', or 'report incident'.",
    sos: "Emergency SOS activated! Sending alerts to your emergency contacts and nearby authorities.",
    safeRoute: "Finding the safest route to your destination. Please specify where you'd like to go.",
    report: "Starting incident report. Please describe what happened.",
    helpline: "Connecting you to emergency helplines. Say 'police' for 100, 'medical' for 108, or 'women helpline' for 1091.",
    unknown: "I didn't understand that. Try saying 'help' to see available commands.",
    help: "Available commands: 'SOS', 'safe route', 'report incident', 'call helpline', 'wellness tips'."
  },
  hi: {
    greeting: "नमस्ते! मैं आपकी सुरक्षा सहायक हूं। आप 'SOS', 'सुरक्षित रास्ता', या 'शिकायत दर्ज करें' जैसे आदेश कह सकते हैं।",
    sos: "आप��तकालीन SOS सक्रिय! आपके आपातकालीन संपर्कों और आसपास के अधिकारियों को अलर्ट भेजा जा रहा है।",
    safeRoute: "आपके गंतव्य के लिए सबसे सुरक्षित रास्ता खोजा जा रहा है। कृपया बताएं कि आप कहां जाना चाहते हैं।",
    report: "घटना रिपोर्ट शुरू की जा रही है। कृपया बताएं कि क्या हुआ था।",
    helpline: "आपको आपातकालीन हेल्पलाइन से जोड़ा जा रहा है। 'पुलिस' के लिए 100, 'मेडिकल' के लिए 108 कहें।",
    unknown: "मुझे समझ नहीं आया। उपलब्ध कमांड देखने के लिए 'मदद' कहें।",
    help: "उपलब्ध कमांड: 'SOS', 'सुरक्षित रास्ता', 'शिकायत', 'हेल्पलाइन', 'स्वास्थ्य टिप्स'।"
  },
  kn: {
    greeting: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಸುರಕ್ಷತಾ ಸಹಾಯಕ. ನೀವು 'SOS', 'ಸುರಕ್ಷಿತ ಮಾರ್ಗ', ಅಥವಾ 'ಘಟನೆ ವರದಿ' ಎಂದು ಹೇಳಬಹುದು.",
    sos: "ತುರ್ತು SOS ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ! ನಿಮ್ಮ ತುರ್ತು ಸಂಪರ್ಕಗಳಿಗೆ ಮತ್ತು ಸಮೀಪದ ಅಧಿಕಾರಿಗಳಿಗೆ ಎಚ್ಚರಿಕೆಯನ್ನು ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ.",
    safeRoute: "ನಿಮ್ಮ ಗಮ್ಯಸ್ಥಾನಕ್ಕೆ ಸುರಕ್ಷಿತ ಮಾರ್ಗವನ್ನು ಹುಡುಕುತ್ತಿದೆ. ನೀವು ಎಲ್ಲಿಗೆ ಹೋಗಲು ಬಯಸುತ್ತೀರಿ ಎಂದು ತಿಳಿಸಿ.",
    report: "ಘಟನೆ ವರದಿ ಪ್ರಾರಂಭಿಸಲಾಗುತ್ತಿದೆ. ಏನಾಯಿತು ಎಂದು ವಿವರಿಸಿ.",
    helpline: "ತುರ್ತು ಹೆಲ್ಪ್‌ಲೈನ್‌ಗೆ ಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿದೆ. 'ಪೊಲೀಸ್' ಗಾಗಿ 100, 'ವೈದ್ಯಕೀಯ' ಗಾಗಿ 108 ಹೇಳಿ.",
    unknown: "ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ. ಲಭ್ಯವಿರುವ ಆಜ್ಞೆಗಳನ್ನು ನ���ಡಲು 'ಸಹಾಯ' ಹೇಳಿ.",
    help: "ಲಭ್ಯವಿರುವ ಆಜ್ಞೆಗಳು: 'SOS', 'ಸುರಕ್ಷಿತ ಮಾರ್ಗ', 'ವರದಿ', 'ಹೆಲ್ಪ್‌ಲೈನ್', 'ಆರೋಗ್ಯ ಸಲಹೆಗಳು'."
  }
};

const VoiceVisualizer = ({ isListening, volume }: { isListening: boolean, volume: number }) => (
  <div className="flex items-center justify-center space-x-1 h-16">
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        className="w-1 bg-primary rounded-full"
        animate={{
          height: isListening ? [8, 24, 8, 32, 8] : 8,
          opacity: isListening ? [0.3, 1, 0.5, 1, 0.3] : 0.3,
        }}
        transition={{
          duration: 1.5,
          repeat: isListening ? Infinity : 0,
          delay: i * 0.1,
          ease: "easeInOut"
        }}
      />
    ))}
  </div>
);

const MessageBubble = ({ message }: { message: VoiceMessage }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
  >
    <div
      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
        message.type === 'user'
          ? 'bg-primary text-primary-foreground'
          : 'bg-card border border-border'
      }`}
    >
      <p className="text-sm">{message.text}</p>
      <p className="text-xs opacity-70 mt-1">
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  </motion.div>
);

export default function VoiceAssistant() {
  const { currentLanguage, t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize voice service with error handling
    try {
      setIsVoiceSupported(voiceService.isSupported());
      voiceService.setLanguage(currentLanguage);
    } catch (error) {
      console.warn('Error initializing voice service:', error);
      setIsVoiceSupported(false);
    }

    // Initialize speech recognition with error handling
    try {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = currentLanguage === 'en' ? 'en-US' :
                                     currentLanguage === 'hi' ? 'hi-IN' :
                                     currentLanguage === 'kn' ? 'kn-IN' :
                                     currentLanguage === 'ta' ? 'ta-IN' : 'te-IN';

        recognitionRef.current.onresult = (event: any) => {
          try {
            const transcript = event.results[0][0].transcript;
            processVoiceCommand(transcript);
          } catch (error) {
            console.error('Error processing speech result:', error);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
          setVolume(0);

          // Show user-friendly error message
          if (event.error === 'not-allowed') {
            const errorMessage: VoiceMessage = {
              id: Date.now().toString(),
              type: 'assistant',
              text: 'Microphone access denied. Please enable microphone permissions to use voice features.',
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          setVolume(0);
        };
      }
    } catch (error) {
      console.warn('Error initializing speech recognition:', error);
    }

    if (isFirstTime) {
      const welcomeMessage: VoiceMessage = {
        id: '1',
        type: 'assistant',
        text: mockVoiceResponses[currentLanguage]?.greeting || mockVoiceResponses.en.greeting,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      setIsFirstTime(false);

      // Auto-play welcome message using voice service with error handling
      if (isVoiceSupported) {
        try {
          voiceService.speakGuidance(welcomeMessage.text, currentLanguage);
          setIsPlaying(true);
          setTimeout(() => setIsPlaying(false), 4000);
        } catch (error) {
          console.warn('Error playing welcome message:', error);
          setIsPlaying(false);
        }
      }
    }
  }, [currentLanguage, isFirstTime, isVoiceSupported]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startListening = () => {
    if (!recognitionRef.current) {
      // Fallback to simulated recognition for unsupported browsers
      setIsListening(true);

      const interval = setInterval(() => {
        setVolume(Math.random() * 100);
      }, 100);

      setTimeout(() => {
        setIsListening(false);
        clearInterval(interval);
        setVolume(0);

        const commands = voiceCommands[currentLanguage] || voiceCommands.en;
        const allCommands = Object.values(commands).flat();
        const randomCommand = allCommands[Math.floor(Math.random() * allCommands.length)];
        processVoiceCommand(randomCommand);
      }, 3000);
      return;
    }

    setIsListening(true);
    setVolume(0);

    // Update language for recognition
    recognitionRef.current.lang = currentLanguage === 'en' ? 'en-US' :
                                 currentLanguage === 'hi' ? 'hi-IN' :
                                 currentLanguage === 'kn' ? 'kn-IN' :
                                 currentLanguage === 'ta' ? 'ta-IN' : 'te-IN';

    try {
      recognitionRef.current.start();

      // Simulate volume visualization
      const interval = setInterval(() => {
        if (isListening) {
          setVolume(Math.random() * 100);
        } else {
          clearInterval(interval);
        }
      }, 100);
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
    }
  };

  const processVoiceCommand = (input: string) => {
    const userMessage: VoiceMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: input,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Analyze command and respond
    const commands = voiceCommands[currentLanguage] || voiceCommands.en;
    const responses = mockVoiceResponses[currentLanguage] || mockVoiceResponses.en;
    
    let responseText = responses.unknown;
    let commandType = '';
    
    if (commands.sos.some(cmd => input.toLowerCase().includes(cmd))) {
      responseText = responses.sos;
      commandType = 'sos';
      // Trigger actual SOS functionality
      setTimeout(async () => {
        try {
          voiceService.vibrateEmergency();
          await smsService.sendSOSAlert('Current User', currentLanguage);
          if (isVoiceSupported) {
            voiceService.speakEmergency('locationSent', currentLanguage);
          }
        } catch (error) {
          console.error('SOS command error:', error);
          // Add error message to chat
          const errorMessage: VoiceMessage = {
            id: (Date.now() + 2).toString(),
            type: 'assistant',
            text: 'Sorry, there was an error processing your SOS request. Please call emergency services directly.',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      }, 1000);
    } else if (commands.safeRoute.some(cmd => input.toLowerCase().includes(cmd))) {
      responseText = responses.safeRoute;
      commandType = 'route';
    } else if (commands.report.some(cmd => input.toLowerCase().includes(cmd))) {
      responseText = responses.report;
      commandType = 'report';
    } else if (commands.helpline.some(cmd => input.toLowerCase().includes(cmd))) {
      responseText = responses.helpline;
      commandType = 'helpline';
    } else if (input.toLowerCase().includes('help') || input.toLowerCase().includes('मदद')) {
      responseText = responses.help;
      commandType = 'help';
    }
    
    setTimeout(() => {
      const assistantMessage: VoiceMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        text: responseText,
        timestamp: new Date(),
        command: commandType,
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      // Auto-play response using voice service with error handling
      if (isVoiceSupported) {
        try {
          voiceService.speakGuidance(responseText, currentLanguage);
          setIsPlaying(true);
          setTimeout(() => setIsPlaying(false), 3000);
        } catch (error) {
          console.warn('Error playing voice response:', error);
          setIsPlaying(false);
        }
      }
    }, 1000);
  };

  const sendTextMessage = () => {
    if (currentInput.trim()) {
      processVoiceCommand(currentInput);
      setCurrentInput('');
    }
  };

  const clearConversation = () => {
    try {
      // Stop any ongoing speech
      voiceService.stop();
      setMessages([]);
      setIsFirstTime(true);
      setIsPlaying(false);
    } catch (error) {
      console.warn('Error clearing conversation:', error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        voiceService.stop();
        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }
      } catch (error) {
        console.warn('Error during cleanup:', error);
      }
    };
  }, []);

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Voice Assistant 🗣️
        </h1>
        <p className="text-muted-foreground">
          Your multilingual safety companion
        </p>
      </motion.div>

      {/* Voice Visualizer */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-card/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-pastel-pink/30"
      >
        <div className="text-center">
          <VoiceVisualizer isListening={isListening} volume={volume} />
          
          <div className="mt-4 space-y-3">
            <div className="flex justify-center space-x-4">
              <Button
                onClick={startListening}
                disabled={isListening}
                size="lg"
                className={`rounded-full w-16 h-16 ${
                  isListening 
                    ? 'bg-sos text-white animate-pulse' 
                    : 'bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90'
                }`}
              >
                {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </Button>
              
              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                variant="outline"
                size="lg"
                className="rounded-full w-16 h-16"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </Button>
            </div>
            
            <div className="flex items-center justify-center space-x-2">
              <Badge className="bg-safe/20 text-safe border-safe/30">
                {currentLanguage.toUpperCase()}
              </Badge>
              <Badge className={`${isListening ? 'bg-sos/20 text-sos border-sos/30' : 'bg-muted/20 text-muted-foreground border-muted/30'}`}>
                {isListening ? 'Listening...' : 'Ready'}
              </Badge>
            </div>
            
            {isListening && (
              <Progress value={volume} className="h-2" />
            )}
          </div>
        </div>
      </motion.div>

      {/* Chat Messages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-pastel-pink/30 max-h-64 overflow-y-auto"
      >
        <div className="space-y-3">
          <AnimatePresence>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </motion.div>

      {/* Text Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex space-x-2"
      >
        <input
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
          placeholder="Type a message or use voice..."
          className="flex-1 px-4 py-3 bg-card border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Button
          onClick={sendTextMessage}
          disabled={!currentInput.trim()}
          className="rounded-2xl px-6"
        >
          <Send className="w-4 h-4" />
        </Button>
      </motion.div>

      {/* Quick Commands */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-3"
      >
        <h3 className="text-sm font-semibold text-foreground">Quick Commands</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { text: 'SOS Help', command: 'sos' },
            { text: 'Safe Route', command: 'safe route' },
            { text: 'Report Incident', command: 'report incident' },
            { text: 'Call Helpline', command: 'call helpline' },
          ].map((item) => (
            <Button
              key={item.command}
              variant="outline"
              size="sm"
              onClick={() => processVoiceCommand(item.command)}
              className="rounded-2xl"
            >
              {item.text}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex justify-between"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={clearConversation}
          className="rounded-2xl"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Clear Chat
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDebug(!showDebug)}
          className="rounded-2xl"
        >
          <Settings className="w-4 h-4 mr-2" />
          {showDebug ? 'Hide Debug' : 'Debug'}
        </Button>
      </motion.div>

      {/* Debug Panel */}
      {showDebug && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ delay: 0.1 }}
        >
          <VoiceDebug />
        </motion.div>
      )}

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-center text-xs text-muted-foreground bg-muted/10 rounded-2xl p-4"
      >
        <p className="mb-1">🎤 Voice assistant supports 5 Indian languages</p>
        <p className="mb-1">
          {isVoiceSupported
            ? '✅ Voice synthesis supported'
            : '❌ Voice synthesis not available'
          }
          {recognitionRef.current
            ? ' • ✅ Speech recognition enabled'
            : ' • ❌ Speech recognition not available'
          }
        </p>
        <p>Your privacy is protected - voice data is processed locally</p>
      </motion.div>
    </div>
  );
}
