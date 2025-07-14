import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, User, Settings, Lightbulb } from 'lucide-react';
import { Room, User as UserType } from '../../types';
import Avatar from '../UI/Avatar';

interface RightPanelProps {
  currentRoom: Room;
  currentUser: UserType;
}

const RightPanel: React.FC<RightPanelProps> = ({ currentRoom, currentUser }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const togglePanel = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <motion.div 
      className="bg-gray-900 border-l border-gray-800 flex flex-col h-full relative"
      animate={{ 
        width: isCollapsed ? '72px' : '280px',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <motion.button
        className="absolute -left-3 top-16 bg-gray-800 rounded-full p-1 border border-gray-700 text-gray-400 z-10"
        onClick={togglePanel}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isCollapsed ? (
          <ChevronLeft className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </motion.button>
      
      <div className="p-4 border-b border-gray-800 flex items-center">
        <motion.div 
          className="flex items-center"
          animate={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
        >
          <User className="h-5 w-5 text-blue-400" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.h2 
                className="ml-2 font-semibold text-white"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
              >
                Room Details
              </motion.h2>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div 
              className="p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">About</h3>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <h4 className="font-semibold text-blue-300">{currentRoom.name}</h4>
                  <p className="text-sm text-gray-300 mt-1">{currentRoom.description}</p>
                  <div className="mt-2 flex items-center text-sm text-gray-400">
                    <User className="w-4 h-4 mr-1" />
                    <span>{currentRoom.participants.length} participants</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Participants</h3>
                <div className="space-y-2">
                  {currentRoom.participants.map(user => (
                    <div 
                      key={user.id} 
                      className="flex items-center p-2 rounded-lg hover:bg-gray-800"
                    >
                      <Avatar src={user.avatar} alt={user.name} size="sm" isActive={true} />
                      <div className="ml-3">
                        <div className="text-gray-200 font-medium">
                          {user.name}
                          {user.id === currentUser.id && (
                            <span className="text-xs ml-2 text-blue-400">(you)</span>
                          )}
                        </div>
                        <div className="text-gray-400 text-xs flex items-center">
                          <span className="mr-1">{LANGUAGES.find(l => l.code === user.language)?.flag}</span>
                          <span>{LANGUAGES.find(l => l.code === user.language)?.name}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Language Tips</h3>
                <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 rounded-lg p-3">
                  <div className="flex items-start">
                    <Lightbulb className="w-5 h-5 text-yellow-300 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-purple-300">Cultural Context</h4>
                      <p className="text-sm text-gray-300 mt-1">
                        When chatting in this room, you'll notice different greeting styles based on cultural norms. Pay attention to translation insights for helpful context!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Settings</h3>
                <motion.button 
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-800/50 text-gray-300 hover:bg-gray-800"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    <span>Chat Settings</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {isCollapsed && (
            <motion.div 
              className="flex flex-col items-center py-4 space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-gray-800"
              >
                <User className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-gray-800"
              >
                <Settings className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default RightPanel;