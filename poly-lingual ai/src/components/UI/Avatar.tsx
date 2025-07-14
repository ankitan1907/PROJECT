import React from 'react';
import { motion } from 'framer-motion';
import { MessageEmotion } from '../../types';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  emotion?: MessageEmotion;
  isActive?: boolean;
}

const emotionVariants = {
  neutral: {},
  happy: {
    scale: [1, 1.05, 1],
    transition: { repeat: 0, duration: 0.5 }
  },
  sad: {
    rotate: [-1, 1, -1],
    transition: { repeat: 0, duration: 1 }
  },
  excited: {
    scale: [1, 1.1, 1],
    transition: { repeat: 1, duration: 0.3 }
  },
  angry: {
    rotate: [-2, 2, -2, 2, 0],
    transition: { repeat: 0, duration: 0.5 }
  },
  curious: {
    y: [0, -3, 0],
    transition: { repeat: 0, duration: 0.5 }
  },
  sarcastic: {
    rotate: [0, 5, 0],
    transition: { repeat: 0, duration: 0.5 }
  }
};

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt, 
  size = 'md', 
  emotion = 'neutral',
  isActive = false
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const borderClasses = isActive 
    ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900' 
    : '';

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        ...emotionVariants[emotion]
      }}
      whileHover={{ scale: 1.05 }}
    >
      <img 
        src={src} 
        alt={alt} 
        className={`${sizeClasses[size]} rounded-full object-cover ${borderClasses}`}
      />
      {isActive && (
        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-gray-900"></span>
      )}
    </motion.div>
  );
};

export default Avatar;