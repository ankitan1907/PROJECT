import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  FileText,
  Users,
  User,
  AlertTriangle,
  Phone,
  Mic,
  Navigation,
  Bell,
  Settings,
  Heart,
  LogOut,
  Brain
} from 'lucide-react';
import BeautySalonLogo from '@/components/BeautySalonLogo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import CommunityFeed from '@/components/CommunityFeed';
import HelplineDirectory from '@/components/HelplineDirectory';
import EnhancedRouteFinder from '@/components/EnhancedRouteFinder';
import IncidentReporting from '@/components/IncidentReporting';
import ProfilePage from '@/components/ProfilePage';
import WellnessTips from '@/components/WellnessTips';
import VoiceAssistant from '@/components/VoiceAssistant';
import OnboardingTour from '@/components/OnboardingTour';
import UserOnboarding from '@/components/UserOnboarding';
import MyWellness from '@/components/MyWellness';
import DailyQuote from '@/components/DailyQuote';
import SafetyStatusBar from '@/components/SafetyStatusBar';
import DarkModeToggle from '@/components/DarkModeToggle';
import SettingsModal from '@/components/SettingsModal';
import AdvancedSafetyDashboard from '@/components/AdvancedSafetyDashboard';
import DataLoadNotification from '@/components/DataLoadNotification';
import VoiceStatusIndicator from '@/components/VoiceStatusIndicator';
import SecurityNotification from '@/components/SecurityNotification';
import { voiceService } from '@/services/voiceService';
import { voiceAssistantService } from '@/services/voiceAssistantService';
import { notificationService } from '@/services/notificationService';
import { smsService } from '@/services/smsService';
import { twilioSMSService } from '@/services/twilioSMS';
import { geocodingService } from '@/services/geocodingService';
import { sampleDataService } from '@/services/sampleData';

interface TabItem {
  id: string;
  icon: any;
  label: string;
  badge?: number;
}

const SOSButton = ({ user, currentLanguage }: { user: any, currentLanguage: any }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const handleSOSPress = () => {
    setIsPressed(true);
    setCountdown(5);
    
    // Simulate vibration (would use navigator.vibrate in real app)
    console.log('SOS: Vibrating device');
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Trigger SOS alert
          handleSOSAlert();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const handleSOSAlert = async () => {
    console.log('🚨 SOS ALERT TRIGGERED!');
    setIsPressed(false);

    // Voice assistant emergency announcements
    voiceAssistantService.announceSOSActivation();

    // Legacy voice service
    voiceService.setLanguage(currentLanguage);
    voiceService.speakEmergency('sosActivated', currentLanguage);
    voiceService.vibrateEmergency();

    try {
      const userName = user?.name || 'User';

      // Get current location with address
      let location;
      try {
        const locationData = await geocodingService.getCurrentLocationWithAddress();
        location = {
          lat: locationData.coordinates.lat,
          lng: locationData.coordinates.lng,
          address: locationData.address.formattedAddress
        };
      } catch (locationError) {
        console.warn('Location not available, using default location');
        location = {
          lat: 12.9716,
          lng: 77.5946,
          address: 'Location not available - Emergency Alert from Sakhi App'
        };
      }

      // Send real SMS alerts via Twilio
      const sosAlert = await twilioSMSService.sendSOSAlert(userName, location);

      // Also open WhatsApp for sharing
      setTimeout(() => {
        twilioSMSService.shareSOSViaWhatsApp(userName, location);
      }, 2000);

      // Voice assistant confirmations
      setTimeout(() => {
        voiceAssistantService.announceLocationSent();
      }, 3000);

      setTimeout(() => {
        voiceAssistantService.announceStayCalm();
      }, 5000);

      setTimeout(() => {
        voiceAssistantService.announceSMSDelivery(2, true); // Assuming 2 contacts
      }, 6000);

      console.log('✅ SOS alert sent successfully:', sosAlert);

    } catch (error) {
      console.error('❌ Error sending SOS alert:', error);

      // Voice announcements for error
      voiceAssistantService.announceSMSDelivery(0, false);

      // Determine error type and provide appropriate message
      let errorMessage = 'SOS alert failed. ';
      let fallbackAction = 'Please call emergency services directly.';

      if (error.message?.includes('No emergency contacts found')) {
        errorMessage = 'No emergency contacts found. ';
        fallbackAction = 'Please add emergency contacts in Profile settings, then try SOS again.';

        // Show browser notification to guide user
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('⚠️ SOS Setup Required', {
            body: 'Please add emergency contacts in your Profile before using SOS alerts.',
            icon: '/favicon.ico',
            requireInteraction: true,
            tag: 'setup-contacts-notification'
          });
        }

        // Automatically navigate to profile after 3 seconds
        setTimeout(() => {
          setActiveTab('profile');
        }, 3000);

      } else if (error.message?.includes('showDemoModeNotification') ||
          error.message?.includes('not a function')) {
        errorMessage = 'SOS demo mode activated. ';
        fallbackAction = 'Emergency contacts would be notified in production.';
        console.log('📱 SOS Demo Mode: Emergency contacts would receive real SMS in production');
      } else if (error.message?.includes('security') ||
                 error.message?.includes('kaspersky') ||
                 error.message?.includes('blocked')) {
        errorMessage = 'SOS working in demo mode due to security software. ';
        fallbackAction = 'Check browser notifications and call emergency if needed.';
      }

      const fullMessage = errorMessage + fallbackAction;
      voiceService.speakNotification(fullMessage, currentLanguage);

      // Show browser notification as backup
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🚨 SOS Alert Status', {
          body: fullMessage,
          icon: '/favicon.ico',
          requireInteraction: true,
          tag: 'sos-error-notification'
        });
      }

      // Fallback: Open dialer with emergency number only for real errors
      if (!error.message?.includes('demo') &&
          !error.message?.includes('showDemoModeNotification') &&
          navigator.userAgent.match(/(iPhone|Android)/)) {
        setTimeout(() => {
          window.location.href = 'tel:100'; // Indian police emergency number
        }, 3000);
      }
    }
  };
  
  const cancelSOS = () => {
    setIsPressed(false);
    setCountdown(0);
  };
  
  if (isPressed) {
    return (
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-sos text-white rounded-full w-32 h-32 flex flex-col items-center justify-center shadow-2xl"
      >
        <div className="text-2xl font-bold">{countdown}</div>
        <div className="text-xs">Cancel SOS</div>
        <Button 
          onClick={cancelSOS}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 mt-1"
        >
          Cancel
        </Button>
      </motion.div>
    );
  }
  
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleSOSPress}
      className="gradient-sos text-white rounded-full w-36 h-36 flex flex-col items-center justify-center shadow-beautiful hover:shadow-glow transition-all duration-300 sos-button animate-gradient hover-lift"
    >
      <AlertTriangle className="w-14 h-14 mb-2 drop-shadow-lg" />
      <span className="text-xl font-bold tracking-wide">SOS</span>
      <span className="text-sm opacity-90 font-medium">Press for help</span>
    </motion.button>
  );
};

const QuickAction = ({ icon: Icon, label, color, onClick }: {
  icon: any,
  label: string,
  color: string,
  onClick: () => void
}) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`${color} rounded-2xl p-6 flex flex-col items-center space-y-3 shadow-beautiful hover:shadow-glow transition-all duration-300 hover-lift group`}
  >
    <Icon className="w-8 h-8 text-white drop-shadow-sm group-hover:scale-110 transition-transform" />
    <span className="text-white text-sm font-semibold text-center leading-tight">{label}</span>
  </motion.button>
);

const StatCard = ({ icon: Icon, title, value, color }: {
  icon: any,
  title: string,
  value: string | number,
  color: string
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass rounded-2xl p-5 shadow-beautiful border border-primary/20 hover-lift group"
  >
    <div className="flex items-center space-x-4">
      <div className={`${color} rounded-xl p-3 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-white drop-shadow-sm" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  </motion.div>
);

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { t, currentLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState('home');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserOnboarding, setShowUserOnboarding] = useState(false);
  
  // Initialize notification state
  useEffect(() => {
    const updateNotifications = (notifs: any[]) => {
      setNotifications(notifs);
      setUnreadCount(notificationService.getUnreadCount());
    };

    // Subscribe to notification updates
    notificationService.subscribe(updateNotifications);

    // Initial load
    updateNotifications(notificationService.getNotifications());

    return () => {
      notificationService.unsubscribe(updateNotifications);
    };
  }, []);

  // Check for first visit and initialize services
  useEffect(() => {
    const hasVisited = localStorage.getItem('sakhi-visited');
    const hasCompletedOnboarding = localStorage.getItem('sakhi-onboarding-completed');

    if (!hasVisited) {
      setIsFirstVisit(true);
      localStorage.setItem('sakhi-visited', 'true');
    }

    // Show new user onboarding for first-time users or those who haven't completed it
    if (!hasCompletedOnboarding && user) {
      setShowUserOnboarding(true);
    }

    // Initialize voice assistant service with error handling
    try {
      voiceAssistantService.setLanguage(currentLanguage);

      // Only auto-enable if user hasn't explicitly disabled it
      const voiceDisabledByUser = localStorage.getItem('sakhi-voice-disabled-by-user');
      if (!voiceDisabledByUser && !voiceAssistantService.isVoiceEnabled()) {
        // Delay enabling to ensure proper initialization
        setTimeout(() => {
          voiceAssistantService.enable();
        }, 1000);
      }
    } catch (error) {
      console.warn('Error initializing voice assistant:', error);
    }

    // Initialize voice service with user's language
    voiceService.setLanguage(currentLanguage);

    // Initialize SMS service and request notification permission
    smsService.requestNotificationPermission();

    // Initialize battery monitoring if user exists
    if (user?.name) {
      smsService.initializeBatteryMonitoring(user.name, currentLanguage);
    }

    // Emergency contacts are now managed by user in Profile page
    // No auto-initialization of demo contacts

    // Auto-activate voice assistant on app open
    if (!showOnboarding && user) {
      const welcomeMessage = currentLanguage === 'en' ?
        `Welcome back ${user.name?.split(' ')[0]}! Sakhi is ready to keep you safe.` :
        currentLanguage === 'hi' ?
        `वापसी पर स्वागत ${user.name?.split(' ')[0]}! सखी आपको सुरक्षित रखने के लिए त���यार है।` :
        currentLanguage === 'kn' ?
        `ಸ್ವಾಗತ ${user.name?.split(' ')[0]}! ಸಖಿ ನಿಮ್ಮನ್ನು ಸುರಕ್��ಿತವಾಗಿ ಇರಿಸಲು ಸಿದ್ಧ.` :
        currentLanguage === 'ta' ?
        `���ரவேற்பு ${user.name?.split(' ')[0]}! சகி உங்களை பாதুகாப்பாக வைக்க தயார்.` :
        `స్వాగతం ${user.name?.split(' ')[0]}! సఖి మిమ్మల్ని సురక్షితంగా ఉంచడా���ికి సిద్ధం.`;

      // Delay voice activation to allow for proper initialization
      setTimeout(() => {
        try {
          if (voiceAssistantService.isVoiceEnabled() && voiceAssistantService.isSupported()) {
            voiceAssistantService.speakCustomMessage(welcomeMessage, 'low');
          }
          // Keep legacy voice service as backup
          voiceService.speakGuidance(welcomeMessage, currentLanguage);
        } catch (error) {
          console.warn('Error auto-activating voice:', error);
        }
      }, 3000); // Increased delay for better reliability
    }
  }, [currentLanguage, user, showOnboarding]);

  // Auto voice greeting when dashboard loads (for existing users)
  useEffect(() => {
    const hasAutoGreeted = sessionStorage.getItem('sakhi-auto-greeted');
    if (!showOnboarding && user && !hasAutoGreeted) {
      sessionStorage.setItem('sakhi-auto-greeted', 'true');

      setTimeout(() => {
        const firstName = user.name?.split(' ')[0] || 'User';
        const message = currentLanguage === 'en' ?
          `Hello ${firstName}! Sakhi voice assistant is active and ready to help.` :
          currentLanguage === 'hi' ?
          `नमस्ते ${firstName}! सखी आवाज सहायक सक्रिय ह�� और मदद के लिए तैयार है।` :
          `Hello ${firstName}! Sakhi is ready.`;

        if (voiceService.isSupported()) {
          voiceService.speakGuidance(message, currentLanguage);
        }
      }, 2500);
    }
  }, [user, showOnboarding, currentLanguage]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    voiceService.speakNotification(
      currentLanguage === 'en' ? 'Welcome to Sakhi! Your safety companion is ready.' :
      currentLanguage === 'hi' ? 'सखी में आपका स्वागत है! आपका सुरक्षा स��थी तैयार है।' :
      currentLanguage === 'kn' ? 'ಸಖ���ಗೆ ಸ್ವಾಗತ! ನಿಮ್ಮ ಸುರಕ್ಷತಾ ಸಹಚರ ಸ���ದ್ಧ.' :
      currentLanguage === 'ta' ? 'சகிக்கு வரவேற்கிறோம்! உங்கள் பாதுகாப்பு தோழர் தயார்.' :
      'సఖిలోకి స్వాగతం! మీ భద్రతా సహచరుడు సిద్ధం.',
      currentLanguage
    );
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
  };

  const handleUserOnboardingComplete = () => {
    setShowUserOnboarding(false);
    localStorage.setItem('sakhi-onboarding-completed', 'true');

    // Voice welcome after onboarding
    const welcomeMessage = currentLanguage === 'en' ?
      'Onboarding complete! Welcome to Sakhi. Your safety companion is ready.' :
      currentLanguage === 'hi' ?
      'परिचय पूरा! सखी में आ��का स्वागत है। आपका सुरक्षा साथी तैयार है।' :
      'Onboarding complete! Welcome to Sakhi.';

    setTimeout(() => {
      voiceAssistantService.speakCustomMessage(welcomeMessage, 'low');
    }, 1000);
  };

  const handleUserOnboardingSkip = () => {
    setShowUserOnboarding(false);
    localStorage.setItem('sakhi-onboarding-completed', 'true');

    const skipMessage = currentLanguage === 'en' ?
      'Onboarding skipped. You can view the guide anytime in settings.' :
      currentLanguage === 'hi' ?
      'परिचय छोड़ा गया। आप सेटिंग्स में कभी भी गाइड देख सकते हैं।' :
      'Onboarding skipped.';

    voiceAssistantService.speakCustomMessage(skipMessage, 'low');
  };

  const handleLogout = async () => {
    try {
      const goodbyeMessage = currentLanguage === 'en' ? 'Goodbye! Stay safe.' :
        currentLanguage === 'hi' ? 'अलविदा! सुरक्षित रहें।' :
        currentLanguage === 'kn' ? 'ವಿದಾಯ! ಸುರಕ್ಷಿತವಾಗಿರಿ.' :
        currentLanguage === 'ta' ? 'விடைபெறுகிறேன்! பாதுகாப்பாக இருங்கள்.' :
        'వీడ్కోలు! సురక్షితంగా ఉండండి.';

      voiceAssistantService.speakCustomMessage(goodbyeMessage, 'low');

      setTimeout(async () => {
        await signOut();
        voiceService.stop();
        voiceAssistantService.stop();
      }, 2000);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleSettings = () => {
    setShowSettings(true);
  };

  const handleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      // Mark notifications as read when opened
      setTimeout(() => {
        notificationService.markAllAsRead();
      }, 1000);

      // Voice announcement
      const message = currentLanguage === 'en' ?
        `You have ${unreadCount} unread safety notifications.` :
        currentLanguage === 'hi' ?
        `आपके पास ${unreadCount} अपठित सुरक्षा सूचनाएं हैं।` :
        `You have ${unreadCount} notifications.`;

      if (unreadCount > 0) {
        voiceAssistantService.speakCustomMessage(message, 'low');
      }
    }
  };

  const tabs: TabItem[] = [
    { id: 'home', icon: () => <BeautySalonLogo size="sm" />, label: t('nav.home') },
    { id: 'wellness', icon: Heart, label: 'My Wellness' },
    { id: 'routes', icon: Navigation, label: t('nav.routes') },
    { id: 'reports', icon: FileText, label: t('nav.reports'), badge: 2 },
    { id: 'community', icon: Users, label: t('nav.community') },
    { id: 'profile', icon: User, label: t('nav.profile') },
  ];
  
  const quickActions = [
    {
      icon: Phone,
      label: 'Emergency Helplines',
      color: 'gradient-sos',
      onClick: () => setActiveTab('helplines'),
    },
    {
      icon: Navigation,
      label: 'Safe Routes',
      color: 'gradient-safe',
      onClick: () => setActiveTab('routes'),
    },
    {
      icon: FileText,
      label: 'Report Incident',
      color: 'gradient-warning',
      onClick: () => setActiveTab('reports'),
    },
    {
      icon: Mic,
      label: 'Voice Assistant',
      color: 'gradient-secondary',
      onClick: () => setActiveTab('voice'),
    },
  ];
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-6">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6 px-4"
            >
              <h1 className="text-responsive-xl font-bold text-foreground mb-3 leading-tight">
                Welcome back, <span className="text-primary">{user?.name?.split(' ')[0]}</span>!
                <span className="ml-2">💖</span>
              </h1>
              <p className="text-responsive-base text-muted-foreground font-medium">
                You're safe and protected today ✨
              </p>
            </motion.div>

            {/* Safety Status Bar */}
            <SafetyStatusBar />

            {/* Daily Quote */}
            <DailyQuote />

            {/* SOS Button */}
            <div className="flex justify-center mb-8">
              <SOSButton user={user} currentLanguage={currentLanguage} />
            </div>
            
            {/* Quick Actions */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <QuickAction
                    key={index}
                    icon={action.icon}
                    label={action.label}
                    color={action.color}
                    onClick={action.onClick}
                  />
                ))}
              </div>
            </div>
            
            {/* Safety Stats */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Live Safety Data</h2>
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  icon={() => <BeautySalonLogo size="sm" />}
                  title="Safe Zones"
                  value={sampleDataService.getSafetyStats().safeZones.toString()}
                  color="gradient-safe"
                />
                <StatCard
                  icon={AlertTriangle}
                  title="Risk Areas"
                  value={sampleDataService.getSafetyStats().riskZones.toString()}
                  color="gradient-sos"
                />
                <StatCard
                  icon={Bell}
                  title="Recent Reports"
                  value={sampleDataService.getSafetyStats().recentIncidents.toString()}
                  color="gradient-warning"
                />
                <StatCard
                  icon={MapPin}
                  title="Safety Score"
                  value={`${sampleDataService.getSafetyStats().safetyScore}%`}
                  color="gradient-primary"
                />
              </div>
              <div className="mt-3 text-center">
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Real-time community data</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'community':
        return <CommunityFeed />;

      case 'ai':
        return <AdvancedSafetyDashboard />;

      case 'routes':
        return <EnhancedRouteFinder />;

      case 'reports':
        return <IncidentReporting />;

      case 'helplines':
        return <HelplineDirectory />;

      case 'wellness':
        return <MyWellness />;

      case 'voice':
        return <VoiceAssistant />;

      case 'profile':
        return <ProfilePage />;

      default:
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {tabs.find(tab => tab.id === activeTab)?.label}
              </h2>
              <p className="text-muted-foreground">
                This feature is coming soon!
              </p>
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Beautiful Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-pastel-pink/30 to-pearl-white -z-10" />
      <div className="fixed inset-0 bg-gradient-to-tr from-transparent via-pastel-coral/10 to-pastel-lavender/20 -z-10" />
      {/* User Onboarding Guide */}
      <UserOnboarding
        isOpen={showUserOnboarding}
        onComplete={handleUserOnboardingComplete}
        onSkip={handleUserOnboardingSkip}
        isGuest={user?.isGuest}
      />

      {/* Legacy Onboarding Tour (backup) */}
      <OnboardingTour
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass border-b border-primary/20 px-6 py-4 shadow-beautiful"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BeautySalonLogo size="lg" />
            <span className="brand-text text-responsive-lg">
              {t('app.name')}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <DarkModeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNotifications}
              className="relative"
              title="Safety Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 text-xs h-5 w-5 p-0 flex items-center justify-center animate-pulse"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSettings}
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </motion.header>
      
      {/* Main Content */}
      <main className="pb-20 pt-6 px-6">
        {renderTabContent()}
      </main>
      
      {/* Bottom Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="fixed bottom-0 left-0 right-0 glass border-t border-primary/20 shadow-beautiful"
      >
        <div className="flex items-center justify-between px-2 py-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center space-y-1 p-2 min-w-[60px] rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              } ${tab.id === 'community' ? 'community-tab' : ''}`}
              >
                <div className="relative">
                  <Icon className="w-4 h-4" />
                  {tab.badge && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 text-xs h-3 w-3 p-0 flex items-center justify-center"
                    >
                      {tab.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-[10px] font-medium truncate max-w-[50px]">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.nav>

      {/* Notifications Panel */}
      {showNotifications && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 right-6 w-80 max-h-96 glass rounded-2xl shadow-beautiful border border-primary/20 z-50 overflow-hidden"
        >
          <div className="gradient-primary text-white px-4 py-3 flex items-center justify-between">
            <h3 className="font-semibold text-lg">Safety Notifications ✨</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(false)}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              ✕
            </Button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => notificationService.markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      notificationService.getPriorityColor(notification.priority)
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">
                          {notificationService.getPriorityEmoji(notification.priority)}
                        </span>
                        <h4 className="font-medium text-sm text-gray-900 truncate">
                          {notification.title}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {notifications.length > 0 && (
            <div className="p-3 bg-gray-50 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  notificationService.markAllAsRead();
                  voiceAssistantService.speakCustomMessage('All notifications marked as read.', 'low');
                }}
                className="w-full"
              >
                Mark All as Read
              </Button>
            </div>
          )}
        </motion.div>
      )}

      {/* Security Notification for Blocked Requests */}
      <SecurityNotification type="demo" />

      {/* Voice Status Indicator */}
      <VoiceStatusIndicator />

      {/* Data Load Notification */}
      <DataLoadNotification />
    </div>
  );
}
