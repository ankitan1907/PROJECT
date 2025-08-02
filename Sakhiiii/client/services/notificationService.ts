// Real Notification Service for Safety Alerts
import { sampleDataService } from './sampleData';

interface SafetyNotification {
  id: string;
  type: 'safety_alert' | 'incident_report' | 'zone_warning' | 'system_update' | 'info' | 'warning' | 'success' | 'danger';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  location?: string;
  persistent?: boolean;
  autoClose?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

class NotificationService {
  private notifications: SafetyNotification[] = [];
  private listeners: ((notifications: SafetyNotification[]) => void)[] = [];

  constructor() {
    this.loadNotifications();
    this.generateSampleNotifications();
  }

  /**
   * Generate sample safety notifications
   */
  private generateSampleNotifications(): void {
    const riskZones = sampleDataService.getRiskZones();
    const recentIncidents = sampleDataService.getRecentIncidents();
    
    // Create notifications based on real data
    const sampleNotifications: SafetyNotification[] = [
      {
        id: 'notif_1',
        type: 'safety_alert',
        title: '🚨 High Risk Zone Alert',
        message: `Avoid ${riskZones[0]?.label || 'certain areas'} - multiple incidents reported today`,
        priority: 'high',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        isRead: false,
        location: riskZones[0]?.address
      },
      {
        id: 'notif_2',
        type: 'incident_report',
        title: '📍 New Incident Report',
        message: `${recentIncidents[0]?.type || 'Incident'} reported in your area - stay alert`,
        priority: 'medium',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isRead: false,
        location: recentIncidents[0]?.location.address
      },
      {
        id: 'notif_3',
        type: 'system_update',
        title: '✅ Safety Data Updated',
        message: `${sampleDataService.getSafetyStats().recentIncidents} new community reports added to your area`,
        priority: 'low',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        isRead: true
      },
      {
        id: 'notif_4',
        type: 'zone_warning',
        title: '⚠️ Evening Safety Alert',
        message: 'Increased caution recommended after 8 PM in your current area',
        priority: 'medium',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        isRead: false
      },
      {
        id: 'notif_5',
        type: 'safety_alert',
        title: '🛡️ Safe Zone Nearby',
        message: 'You are approaching a verified safe zone with police presence',
        priority: 'low',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        isRead: true
      }
    ];

    // Only add if we don't have notifications already
    if (this.notifications.length === 0) {
      this.notifications = sampleNotifications;
      this.saveNotifications();
    }
  }

  /**
   * Get all notifications
   */
  getNotifications(): SafetyNotification[] {
    return this.notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get unread notifications count
   */
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      this.saveNotifications();
      this.notifyListeners();
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.notifications.forEach(n => n.isRead = true);
    this.saveNotifications();
    this.notifyListeners();
  }



  /**
   * Remove notification
   */
  removeNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
    this.notifyListeners();
  }

  /**
   * Delete notification
   */
  deleteNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
    this.notifyListeners();
  }

  /**
   * Add new notification
   */
  addNotification(notification: Omit<SafetyNotification, 'id' | 'timestamp' | 'isRead'>): void {
    const newNotification: SafetyNotification = {
      ...notification,
      id: `notif_${Date.now()}`,
      timestamp: new Date(),
      isRead: false
    };

    this.notifications.unshift(newNotification);
    
    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    this.saveNotifications();
    this.notifyListeners();

    // Show browser notification if permission granted
    this.showBrowserNotification(newNotification);
  }

  /**
   * Show browser notification
   */
  private showBrowserNotification(notification: SafetyNotification): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent'
      });
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  /**
   * Subscribe to notification updates
   */
  subscribe(listener: (notifications: SafetyNotification[]) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Unsubscribe from notification updates
   */
  unsubscribe(listener: (notifications: SafetyNotification[]) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getNotifications()));
  }

  /**
   * Load notifications from localStorage
   */
  private loadNotifications(): void {
    try {
      const saved = localStorage.getItem('sakhi-notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert timestamp strings back to Date objects
        this.notifications = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      this.notifications = [];
    }
  }

  /**
   * Save notifications to localStorage
   */
  private saveNotifications(): void {
    try {
      localStorage.setItem('sakhi-notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  /**
   * Get notifications by priority
   */
  getNotificationsByPriority(priority: 'low' | 'medium' | 'high' | 'urgent'): SafetyNotification[] {
    return this.notifications.filter(n => n.priority === priority);
  }

  /**
   * Get priority emoji
   */
  getPriorityEmoji(priority: string): string {
    switch (priority) {
      case 'urgent': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '📍';
      case 'low': return 'ℹ️';
      default: return '🔔';
    }
  }

  /**
   * Get priority color
   */
  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notifications = [];
    this.saveNotifications();
    this.notifyListeners();
  }
}

export const notificationService = new NotificationService();
export default notificationService;
