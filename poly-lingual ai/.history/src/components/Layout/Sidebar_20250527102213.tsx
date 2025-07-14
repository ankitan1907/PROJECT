import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircleMore } from 'lucide-react';
import { Room, User } from '../../types';
import Avatar from '../UI/Avatar';
import LanguageSelector from '../UI/LanguageSelector';
import Badge from '../UI/Badge';
import { getIconComponent, LANGUAGES } from '../../data/mockData';

interface SidebarProps {
  rooms: Room[];
  currentRoom: Room;
  onRoomChange: (room: Room) => void;
  currentUser: User;
  onLanguageChange: (language: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  rooms,
  currentRoom,
  onRoomChange,
  currentUser,
  onLanguageChange,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <motion.div
      className="bg-gray-900 border-r border-gray-800 flex flex-col h-full relative"
      animate={{
        width: isCollapsed ? '72px' : '240px',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="p-4 border-b border-gray-800 flex items-center">
        <motion.div
          className="flex items-center"
          animate={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
        >
          <MessageCircleMore className="h-6 w-6 text-blue-400" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.h1
                className="ml-2 font-bold text-white text-lg"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
              >
                Polyglot Pal
              </motion.h1>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.h2
                className="text-sm font-semibold text-gray-400 mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Rooms
              </motion.h2>
            )}
          </AnimatePresence>

          <div className="space-y-1">
            {rooms.map((room) => {
              const IconComponent = getIconComponent(room.icon || 'Globe');
              return (
                <div key={room.id} title={isCollapsed ? room.name : ''}>
                  <motion.button
                    onClick={() => onRoomChange(room)}
                    className={`flex items-center rounded-lg w-full text-left p-2 ${
                      currentRoom.id === room.id
                        ? 'bg-blue-900/50 text-blue-100'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    animate={{
                      justifyContent: isCollapsed ? 'center' : 'flex-start',
                    }}
                  >
                    <div
                      className={`flex items-center justify-center ${
                        currentRoom.id === room.id
                          ? 'text-blue-300'
                          : 'text-gray-400'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.div
                          className="ml-3 flex-1 overflow-hidden"
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium truncate">
                              {room.name}
                            </span>
                            <Badge
                              text={`${room.participants.length}`}
                              color={
                                currentRoom.id === room.id ? 'blue' : 'purple'
                              }
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.h2
                className="text-sm font-semibold text-gray-400 mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Online
              </motion.h2>
            )}
          </AnimatePresence>

          <div className="space-y-1">
            {currentRoom.participants.map((user) => (
              <motion.div
                key={user.id}
                className="flex items-center p-2 rounded-lg"
                animate={{
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                }}
              >
                <Avatar
                  src={user.avatar}
                  alt={user.name}
                  size="sm"
                  isActive={true}
                />

                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      className="ml-3 overflow-hidden"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                    >
                      <div className="flex flex-col">
                        <span className="text-gray-200 font-medium text-sm">
                          {user.name}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {
                            LANGUAGES.find(
                              (l) => l.code === user.language
                            )?.name
                          }
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <motion.div
            className="flex items-center"
            animate={{ width: isCollapsed ? 'auto' : '100%' }}
          >
            <Avatar
              src={currentUser.avatar}
              alt={currentUser.name}
              isActive={true}
            />

            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  className="ml-3 overflow-hidden"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                >
                  <div className="flex flex-col">
                    <span className="text-gray-200 font-medium">
                      {currentUser.name}
                    </span>
                    <span className="text-gray-400 text-xs">Online</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                className="flex space-x-1"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
              >
                <LanguageSelector
                  selectedLanguage={currentUser.language}
                  onLanguageChange={onLanguageChange}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
