import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Database, MapPin } from 'lucide-react';
import { sampleDataService } from '@/services/sampleData';

const DataLoadNotification: React.FC = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Show notification when component mounts
    const timer = setTimeout(() => {
      const safetyStats = sampleDataService.getSafetyStats();
      const incidentCount = sampleDataService.getIncidentReports().length;
      
      setStats({
        ...safetyStats,
        totalIncidents: incidentCount
      });
      
      setShowNotification(true);
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 5000);
    }, 2000); // Wait 2 seconds after page load

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {showNotification && stats && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-4 right-4 bg-white rounded-xl shadow-2xl border border-purple-200 p-4 max-w-sm z-50"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
            
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-sm mb-1">
                Real Safety Data Loaded! 🎉
              </h4>
              <p className="text-xs text-gray-600 mb-2">
                Your app now displays live community safety data from across India
              </p>
              
              {/* Stats Summary */}
              <div className="bg-gray-50 rounded-lg p-2 space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="h-3 w-3 text-green-500" />
                  <span className="text-gray-700">
                    {stats.safeZones} Safe Zones, {stats.riskZones} Risk Areas
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Database className="h-3 w-3 text-blue-500" />
                  <span className="text-gray-700">
                    {stats.totalIncidents} Community Reports Loaded
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-purple-600 font-medium">
                  Safety Score: {stats.safetyScore}%
                </span>
                <button
                  onClick={() => setShowNotification(false)}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DataLoadNotification;
