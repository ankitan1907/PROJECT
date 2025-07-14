import React from 'react';
import { motion } from 'framer-motion';
import { MessageEmotion } from '../../types';

interface EmotionSuggestionsProps {
  emotion: MessageEmotion;
  onSelect: (emoji: string) => void;
}

const emotionToEmojis: Record<MessageEmotion, string[]> = {
  neutral: ['👍', '👋', '🙂'],
  happy: ['😊', '😄', '🎉', '❤️'],
  sad: ['😢', '🫂', '💔', '😔'],
  excited: ['🤩', '🔥', '⚡', '💯'],
  angry: ['😤', '👀', '🙄', '🤔'],
  curious: ['🤔', '❓', '👀', '🧐'],
  sarcastic: ['😏', '🙃', '😅', '🤣']
};

const EmotionSuggestions: React.FC<EmotionSuggestionsProps> = ({ emotion, onSelect }) => {
  const emojis = emotionToEmojis[emotion] || emotionToEmojis.neutral;

  return (
    <motion.div 
      className="flex space-x-1 mt-1"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
    >
      {emojis.map((emoji, index) => (
        <motion.button
          key={index}
          className="text-lg hover:bg-gray-700/50 rounded-full p-1"
          onClick={() => onSelect(emoji)}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: index * 0.05 }}
        >
          {emoji}
        </motion.button>
      ))}
    </motion.div>
  );
};

export default EmotionSuggestions;