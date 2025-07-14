import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic, Camera, Paperclip, Smile } from 'lucide-react';
import { User } from '../../types';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isListening?: boolean;
  onStartVoiceInput: () => void;
  currentUser: User;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  isListening = false,
  onStartVoiceInput,
  currentUser
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <motion.div 
      className="bg-gray-900/80 backdrop-blur-sm border-t border-gray-800 p-4"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <div className="flex-grow relative">
          <motion.input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Type in ${currentUser.language === 'en' ? 'English' : LANGUAGES.find(l => l.code === currentUser.language)?.name}`}
            className="w-full bg-gray-800 text-white rounded-full py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            whileFocus={{ boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.3)' }}
          />
          <motion.button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400"
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
          >
            <Smile className="w-5 h-5" />
          </motion.button>
        </div>
        
        <div className="flex space-x-2">
          <motion.button
            type="button"
            className={`p-2 rounded-full ${isListening ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-blue-400 hover:bg-gray-700'}`}
            onClick={onStartVoiceInput}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Mic className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            type="button"
            className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-blue-400 hover:bg-gray-700"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Paperclip className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            type="submit"
            className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={!message.trim()}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default MessageInput;