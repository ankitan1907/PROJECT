import React from 'react';
import { motion } from 'framer-motion';

interface TranslationConfidenceProps {
  confidence: number;
}

const TranslationConfidence: React.FC<TranslationConfidenceProps> = ({ confidence }) => {
  // Determine color based on confidence level
  const getColor = () => {
    if (confidence >= 0.95) return 'bg-green-500';
    if (confidence >= 0.8) return 'bg-blue-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  const color = getColor();
  
  return (
    <div className="w-full mt-1 flex items-center space-x-2">
      <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
        <motion.div 
          className={`h-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${confidence * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <span className="text-xs text-gray-400">{Math.round(confidence * 100)}%</span>
    </div>
  );
};

export default TranslationConfidence;