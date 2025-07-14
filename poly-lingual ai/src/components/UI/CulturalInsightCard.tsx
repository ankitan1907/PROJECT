import React from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

interface CulturalInsightCardProps {
  insight: string;
}

const CulturalInsightCard: React.FC<CulturalInsightCardProps> = ({ insight }) => {
  return (
    <motion.div 
      className="bg-indigo-900/50 backdrop-blur-sm border border-indigo-500/30 rounded-lg p-3 mt-2 text-sm text-indigo-100 shadow-lg"
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="flex items-start space-x-2">
        <div className="mt-0.5">
          <Info className="w-4 h-4 text-indigo-300" />
        </div>
        <div>
          <h4 className="font-semibold text-indigo-200 mb-1">Cultural Insight</h4>
          <p>{insight}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default CulturalInsightCard;