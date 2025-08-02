import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuthErrorNotificationProps {
  error?: string | null;
  onDismiss?: () => void;
}

const AuthErrorNotification: React.FC<AuthErrorNotificationProps> = ({ 
  error, 
  onDismiss 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      
      // Check if it's a Google Auth related error
      const isGoogleError = error.toLowerCase().includes('google') || 
                           error.toLowerCase().includes('fedcm') ||
                           error.toLowerCase().includes('identity-credentials');
      setIsDemoMode(isGoogleError);
      
      // Auto dismiss after 10 seconds for non-critical errors
      if (isGoogleError) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, 10000);
        
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [error]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss?.();
    }, 300);
  };

  const getErrorMessage = () => {
    if (!error) return '';
    
    // Friendly error messages for common issues
    if (error.includes('FedCM') || error.includes('identity-credentials-get')) {
      return {
        title: 'Demo Mode Active',
        message: 'Google Sign-in requires production API keys. Using demo authentication for now.',
        type: 'info' as const
      };
    }
    
    if (error.includes('Google') || error.includes('google')) {
      return {
        title: 'Authentication Notice',
        message: 'Real Google Sign-in will be available with proper API configuration. Using demo mode.',
        type: 'info' as const
      };
    }
    
    return {
      title: 'Authentication Error',
      message: error,
      type: 'error' as const
    };
  };

  if (!isVisible || !error) return null;

  const errorInfo = getErrorMessage();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto"
      >
        <div className={`rounded-2xl p-4 shadow-lg border-2 ${
          errorInfo.type === 'info' 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start space-x-3">
            <div className={`p-1 rounded-full ${
              errorInfo.type === 'info' ? 'bg-blue-100' : 'bg-red-100'
            }`}>
              {errorInfo.type === 'info' ? (
                <Info className="w-5 h-5 text-blue-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold ${
                errorInfo.type === 'info' ? 'text-blue-900' : 'text-red-900'
              }`}>
                {errorInfo.title}
              </h3>
              <p className={`text-sm mt-1 ${
                errorInfo.type === 'info' ? 'text-blue-700' : 'text-red-700'
              }`}>
                {errorInfo.message}
              </p>
              
              {isDemoMode && (
                <div className="mt-3 p-2 bg-white/50 rounded-lg">
                  <p className="text-xs text-blue-600">
                    <strong>For developers:</strong> Add VITE_GOOGLE_CLIENT_ID to enable real authentication.
                  </p>
                </div>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className={`p-1 ${
                errorInfo.type === 'info' 
                  ? 'hover:bg-blue-100 text-blue-600' 
                  : 'hover:bg-red-100 text-red-600'
              }`}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {isDemoMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 pt-3 border-t border-blue-200"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Demo features available:</span>
                <div className="flex space-x-2">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    Mock Auth ✓
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    Voice Assistant ✓
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    Maps ✓
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthErrorNotification;
