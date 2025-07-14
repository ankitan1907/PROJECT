import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Message } from '../../types';
import Avatar from '../UI/Avatar';
import TranslationConfidence from '../UI/TranslationConfidence';
import CulturalInsightCard from '../UI/CulturalInsightCard';
import EmotionSuggestions from '../UI/EmotionSuggestions';

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isCurrentUser }) => {
  const [showTranslation, setShowTranslation] = useState(true);
  const [reactions, setReactions] = useState<string[]>([]);

  const toggleTranslation = () => {
    setShowTranslation(!showTranslation);
  };

  const addReaction = (emoji: string) => {
    if (!reactions.includes(emoji)) {
      setReactions([...reactions, emoji]);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 24,
        staggerChildren: 0.1 
      }
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, x: isCurrentUser ? 20 : -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const translationVariants = {
    hidden: { opacity: 0, y: -5, height: 0 },
    visible: { 
      opacity: 1, 
      y: 0,
      height: 'auto',
      transition: { delay: 0.1 }
    }
  };

  const messageTime = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div 
      className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} max-w-3xl`}>
        <div className={`flex-shrink-0 ${isCurrentUser ? 'ml-3' : 'mr-3'}`}>
          <Avatar 
            src={message.sender.avatar} 
            alt={message.sender.name}
            emotion={message.emotion}
            isActive={true}
          />
        </div>
        
        <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
          <div className="flex items-center mb-1">
            <span className={`text-xs text-gray-400 ${isCurrentUser ? 'mr-2' : 'ml-2 order-last'}`}>
              {messageTime}
            </span>
            <span className={`font-semibold text-sm ${isCurrentUser ? 'text-blue-300' : 'text-indigo-300'}`}>
              {message.sender.name}
            </span>
          </div>
          
          <motion.div 
            className={`rounded-2xl px-4 py-2 max-w-md ${
              isCurrentUser 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-gray-800 text-gray-100 rounded-tl-none'
            }`}
            variants={messageVariants}
          >
            <p>{message.content}</p>
            
            {message.translation && message.translation !== '' && message.content !== message.translation && (
              <motion.div
                className="mt-1 pt-1 border-t border-gray-700/30 text-sm text-gray-200"
                variants={translationVariants}
                initial={showTranslation ? "visible" : "hidden"}
                animate={showTranslation ? "visible" : "hidden"}
              >
                <div 
                  className="cursor-pointer text-xs text-gray-300 hover:text-white mb-1"
                  onClick={toggleTranslation}
                >
                  {showTranslation ? '− Hide translation' : '+ Show translation'}
                </div>
                {showTranslation && (
                  <>
                    <p>{message.translation}</p>
                    {message.translationConfidence !== undefined && message.translationConfidence < 1 && (
                      <TranslationConfidence confidence={message.translationConfidence} />
                    )}
                  </>
                )}
              </motion.div>
            )}
          </motion.div>
          
          {message.culturalInsight && (
            <CulturalInsightCard insight={message.culturalInsight} />
          )}
          
          {message.emotion && message.emotion !== 'neutral' && !isCurrentUser && (
            <EmotionSuggestions emotion={message.emotion} onSelect={addReaction} />
          )}
          
          {reactions.length > 0 && (
            <motion.div 
              className="flex mt-1 space-x-1"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {reactions.map((emoji, index) => (
                <motion.span 
                  key={index}
                  className="text-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {emoji}
                </motion.span>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;