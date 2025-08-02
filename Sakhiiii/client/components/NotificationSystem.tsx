import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, AlertTriangle, Info, CheckCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  title: string;
  message: string;
  timestamp: Date;
  location?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Safety Alert',
    message: 'Incident reported near your location',
    timestamp: new Date(Date.now() - 5 * 60000),
    location: 'Koramangala, Bangalore',
  },
  {
    id: '2',
    type: 'info',
    title: 'Community Update',
    message: 'New safety tips added to your wellness section',
    timestamp: new Date(Date.now() - 30 * 60000),
  },
  {
    id: '3',
    type: 'success',
    title: 'Safe Route Complete',
    message: 'You have safely reached your destination',
    timestamp: new Date(Date.now() - 2 * 60 * 60000),
  },
];

const NotificationCard = ({ notification, onDismiss }: {
  notification: Notification;
  onDismiss: () => void;
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'danger': return <Shield className="w-5 h-5 text-sos" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-safe" />;
      default: return <Info className="w-5 h-5 text-primary" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'warning': return 'border-warning/30';
      case 'danger': return 'border-sos/30';
      case 'success': return 'border-safe/30';
      default: return 'border-primary/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className={`bg-card/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg border ${getBorderColor()} mb-3 max-w-sm`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground text-sm">{notification.title}</h4>
          <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
          {notification.location && (
            <p className="text-xs text-muted-foreground mt-1">📍 {notification.location}</p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {notification.timestamp.toLocaleTimeString()}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="flex-shrink-0 h-6 w-6 p-0"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </motion.div>
  );
};

export const NotificationSystem = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Only show notifications if user is authenticated and has completed profile
    if (!user || !user.profileComplete) {
      setNotifications([]);
      return;
    }

    // Simulate incoming notifications
    const addNotification = (notification: Notification) => {
      setNotifications(prev => [notification, ...prev].slice(0, 3));

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
    };

    // Add initial notifications with delays (only for authenticated users)
    const timeouts: NodeJS.Timeout[] = [];
    timeouts.push(setTimeout(() => addNotification(mockNotifications[0]), 2000));
    timeouts.push(setTimeout(() => addNotification(mockNotifications[1]), 8000));
    timeouts.push(setTimeout(() => addNotification(mockNotifications[2]), 15000));

    return () => {
      setNotifications([]);
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [user]);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onDismiss={() => dismissNotification(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationSystem;
