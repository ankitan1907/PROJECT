import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SecurityNotificationProps {
  type?: 'demo' | 'security-block' | 'network-error';
  onDismiss?: () => void;
}

export default function SecurityNotification({ 
  type = 'demo', 
  onDismiss 
}: SecurityNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false);

  useEffect(() => {
    // Check if this notification has been dismissed recently
    const dismissedKey = `sakhi-notification-dismissed-${type}`;
    const lastDismissed = localStorage.getItem(dismissedKey);

    if (lastDismissed) {
      const dismissedTime = new Date(lastDismissed);
      const now = new Date();
      const hoursSinceDismissal = (now.getTime() - dismissedTime.getTime()) / (1000 * 60 * 60);

      // Show again after 24 hours
      if (hoursSinceDismissal < 24) {
        setIsVisible(false);
        setHasBeenDismissed(true);
      }
    }

    // Auto-dismiss after 10 seconds for demo mode to reduce clutter
    if (type === 'demo' && isVisible) {
      const autoCloseTimer = setTimeout(() => {
        handleDismiss();
      }, 10000);

      return () => clearTimeout(autoCloseTimer);
    }

    // Listen for custom demo mode events
    const handleDemoNotification = (event: CustomEvent) => {
      if (event.detail.type === 'info' && event.detail.title === 'Demo Mode Active') {
        setIsVisible(true);
      }
    };

    window.addEventListener('sakhi-demo-notification', handleDemoNotification as EventListener);
    
    return () => {
      window.removeEventListener('sakhi-demo-notification', handleDemoNotification as EventListener);
    };
  }, [type]);

  const handleDismiss = () => {
    setIsVisible(false);
    setHasBeenDismissed(true);
    
    // Remember dismissal for 24 hours
    const dismissedKey = `sakhi-notification-dismissed-${type}`;
    localStorage.setItem(dismissedKey, new Date().toISOString());
    
    onDismiss?.();
  };

  const getNotificationContent = () => {
    switch (type) {
      case 'security-block':
        return {
          icon: Shield,
          title: 'Security Software Detected',
          message: 'Your security software (like Kaspersky) is blocking some network requests. The app is using safe demo mode for SMS and location services.',
          bgClass: 'bg-yellow-50 border-yellow-200',
          iconClass: 'text-yellow-600',
          actionText: 'This is normal and safe!'
        };
      
      case 'network-error':
        return {
          icon: AlertTriangle,
          title: 'Network Requests Blocked',
          message: 'Some features are running in demo mode due to network restrictions. All core safety features remain fully functional.',
          bgClass: 'bg-orange-50 border-orange-200',
          iconClass: 'text-orange-600',
          actionText: 'App works normally'
        };
      
      default: // demo
        return {
          icon: Info,
          title: 'Demo Mode Active',
          message: 'SMS alerts and some location services are simulated for demonstration. In production, real SMS would be sent via Twilio.',
          bgClass: 'bg-blue-50 border-blue-200',
          iconClass: 'text-blue-600',
          actionText: 'Check browser notifications'
        };
    }
  };

  if (!isVisible || hasBeenDismissed) {
    return null;
  }

  const content = getNotificationContent();
  const Icon = content.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="fixed top-24 right-6 z-40 w-80 max-w-sm"
      >
        <Alert className={`${content.bgClass} shadow-beautiful border-2`}>
          <div className="flex items-start gap-3">
            <Icon className={`w-5 h-5 mt-0.5 ${content.iconClass} flex-shrink-0`} />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground mb-1">
                {content.title}
              </h4>
              <AlertDescription className="text-sm text-muted-foreground leading-relaxed">
                {content.message}
              </AlertDescription>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs font-medium text-primary">
                  ✓ {content.actionText}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0 hover:bg-white/50 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook to show security notification programmatically
export const useSecurityNotification = () => {
  const [notification, setNotification] = useState<{
    type: 'demo' | 'security-block' | 'network-error';
    visible: boolean;
  } | null>(null);

  const showNotification = (type: 'demo' | 'security-block' | 'network-error') => {
    setNotification({ type, visible: true });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  return {
    notification,
    showNotification,
    hideNotification
  };
};
