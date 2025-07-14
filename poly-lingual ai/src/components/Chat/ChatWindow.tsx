import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Message, User } from '../../types';
import ChatMessage from './ChatMessage';

interface ChatWindowProps {
  messages: Message[];
  currentUser: User;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, currentUser }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <motion.div 
      className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-4">
        {messages.map((message) => (
          <ChatMessage 
            key={message.id} 
            message={message} 
            isCurrentUser={message.sender.id === currentUser.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </motion.div>
  );
};

export default ChatWindow;