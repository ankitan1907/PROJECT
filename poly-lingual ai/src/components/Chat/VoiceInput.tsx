import React from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';

interface VoiceInputProps {
  isListening: boolean;
  onToggleListening: () => void;
  detectedLanguage?: string;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ 
  isListening, 
  onToggleListening,
  detectedLanguage
}) => {
  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-10">
      <motion.div 
        className="bg-gray-900/80 backdrop-blur-md rounded-full p-4 flex flex-col items-center shadow-xl border border-gray-800"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
      >
        <motion.button
          className={`p-6 rounded-full ${
            isListening 
              ? 'bg-red-600 text-white' 
              : 'bg-blue-600 text-white'
          }`}
          onClick={onToggleListening}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={isListening ? {
            scale: [1, 1.1, 1],
            transition: { repeat: Infinity, duration: 1.5 }
          } : {}}
        >
          {isListening ? (
            <Mic className="w-8 h-8" />
          ) : (
            <MicOff className="w-8 h-8" />
          )}
        </motion.button>
        
        {isListening && (
          <motion.div 
            className="mt-2 text-sm text-blue-300 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Listening...
            {detectedLanguage && (
              <span className="ml-1 text-green-300">
                ({detectedLanguage})
              </span>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default VoiceInput;