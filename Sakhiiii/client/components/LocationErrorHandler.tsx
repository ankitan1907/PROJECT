import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { MapPin, RefreshCw, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LocationError {
  message: string;
  canRetry: boolean;
  type?: 'permission' | 'timeout' | 'unavailable' | 'general';
}

export function LocationErrorHandler() {
  const [error, setError] = useState<LocationError | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const handleLocationError = (event: CustomEvent<LocationError>) => {
      setError(event.detail);
    };

    window.addEventListener('locationError', handleLocationError as EventListener);

    return () => {
      window.removeEventListener('locationError', handleLocationError as EventListener);
    };
  }, []);

  const handleRetry = async () => {
    if (!error?.canRetry) return;
    
    setIsRetrying(true);
    try {
      // Try to get location again
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          () => {
            setError(null); // Clear error on success
          },
          (geoError) => {
            console.error('Retry failed:', geoError.message);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        );
      }
    } catch (err) {
      console.error('Retry attempt failed:', err);
    } finally {
      setTimeout(() => setIsRetrying(false), 2000);
    }
  };

  const handleOpenSettings = () => {
    // Provide instructions for enabling location
    alert('To enable location access:\n\n1. Click the location icon in your browser\'s address bar\n2. Select "Allow" for location access\n3. Refresh the page\n\nLocation access helps provide safety features and emergency assistance.');
  };

  const dismissError = () => {
    setError(null);
  };

  if (!error) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-md"
      >
        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <MapPin className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <div className="flex flex-col gap-2">
              <strong>Location Error</strong>
              <p className="text-sm">{error.message}</p>
              
              <div className="flex gap-2 mt-2">
                {error.canRetry && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    <RefreshCw className={`w-3 h-3 mr-1 ${isRetrying ? 'animate-spin' : ''}`} />
                    {isRetrying ? 'Retrying...' : 'Retry'}
                  </Button>
                )}
                
                {error.type === 'permission' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleOpenSettings}
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    Help
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={dismissError}
                  className="text-red-600 hover:bg-red-100"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
}
