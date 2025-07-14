import React from 'react';
import { motion } from 'framer-motion';

interface BadgeProps {
  text: string;
  color?: 'blue' | 'green' | 'purple' | 'pink' | 'yellow';
}

const Badge: React.FC<BadgeProps> = ({ text, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-900/40 text-blue-300 border-blue-500/50',
    green: 'bg-green-900/40 text-green-300 border-green-500/50',
    purple: 'bg-purple-900/40 text-purple-300 border-purple-500/50',
    pink: 'bg-pink-900/40 text-pink-300 border-pink-500/50',
    yellow: 'bg-yellow-900/40 text-yellow-300 border-yellow-500/50',
  };

  return (
    <motion.span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses[color]}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
    >
      {text}
    </motion.span>
  );
};

export default Badge;