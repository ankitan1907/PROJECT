  import React from 'react';
import { motion } from 'framer-motion';
import { Room, User } from '../../types';
import Sidebar from './Sidebar';
import RightPanel from './RightPanel';
import ChatWindow from '../Chat/ChatWindow';
import MessageInput from '../Chat/MessageInput';
import { Message } from '../../types';
import { LANGUAGES } from '../../data/mockData';

interface MainLayoutProps {
  currentRoom: Room;
  rooms: Room[];
  messages: Message[];
  currentUser: User;
  onRoomChange: (room: Room) => void;
  onSendMessage: (message: string) => void;
  onLanguageChange: (language: string) => void;
  isListening: boolean;
  onToggleVoiceInput: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  currentRoom,
  rooms,
  messages,
  currentUser,
  onRoomChange,
  onSendMessage,
  onLanguageChange,
  isListening,
  onToggleVoiceInput
}) => {
  return (
    <motion.div 
      className="flex h-screen w-screen bg-gray-950 text-white overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Sidebar 
        rooms={rooms}
        currentRoom={currentRoom}
        onRoomChange={onRoomChange}
        currentUser={currentUser}
        onLanguageChange={onLanguageChange}
      />
      
      <motion.div 
        className="flex-1 flex flex-col overflow-hidden relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div 
          className="p-4 border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-bold text-lg text-white">{currentRoom.name}</h1>
              <p className="text-gray-400 text-sm">{currentRoom.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                {currentRoom.participants.slice(0, 3).map((user) => (
                  <img 
                    key={user.id}
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border-2 border-gray-900"
                  />
                ))}
                {currentRoom.participants.length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-medium border-2 border-gray-900">
                    +{currentRoom.participants.length - 3}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
        
        <ChatWindow 
          messages={messages}
          currentUser={currentUser}
        />
        
        <MessageInput 
          onSendMessage={onSendMessage}
          isListening={isListening}
          onStartVoiceInput={onToggleVoiceInput}
          currentUser={currentUser}
        />
      </motion.div>
      
      <RightPanel 
        currentRoom={currentRoom}
        currentUser={currentUser}
      />
    </motion.div>
  );
};

export default MainLayout;