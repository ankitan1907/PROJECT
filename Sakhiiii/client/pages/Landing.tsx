import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Chrome,
  UserCheck,
  Heart,
  ArrowRight,
  Star,
  Users,
  MapPin,
  Bell,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import BeautySalonLogo from '@/components/BeautySalonLogo';

export default function Landing() {
  const { signInWithGoogle, signInAsGuest } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestAccess = async () => {
    setGuestLoading(true);
    try {
      await signInAsGuest();
    } catch (error) {
      console.error('Guest access error:', error);
    } finally {
      setGuestLoading(false);
    }
  };

  const features = [
    {
      icon: Zap,
      title: 'SOS Emergency Alerts',
      description: 'Instant help with one button press'
    },
    {
      icon: MapPin,
      title: 'Live Location Sharing',
      description: 'Share your location with trusted contacts'
    },
    {
      icon: Users,
      title: 'Community Safety',
      description: 'Connect with other women for support'
    },
    {
      icon: Bell,
      title: 'Voice Assistant',
      description: 'Spoken guidance and notifications'
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Beautiful Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-pastel-pink/30 to-pearl-white -z-10" />
      <div className="fixed inset-0 bg-gradient-to-tr from-transparent via-pastel-coral/10 to-pastel-lavender/20 -z-10" />
      
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6"
        >
          <div className="flex items-center justify-end max-w-6xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-accent fill-current" />
                <span className="text-sm font-medium">4.9</span>
              </div>
              <span className="text-xs text-muted-foreground">Trusted by 10k+ women</span>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <div className="mb-8">
                <BeautySalonLogo size="lg" className="mx-auto mb-6" />
                <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 leading-tight">
                  Your Personal
                  <span className="brand-text block text-primary">
                    Safety Companion
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Empowering women with instant emergency alerts, community support, and intelligent safety features.
                </p>
                
                <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-8">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-safe" />
                    <span>24/7 Protection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" />
                    <span>Privacy First</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-accent fill-current" />
                    <span>Made with Love</span>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-4 max-w-md mx-auto">
                <Button
                  onClick={() => window.location.href = '/signup'}
                  className="w-full h-14 text-lg gradient-primary rounded-2xl text-white font-semibold hover-lift shadow-beautiful"
                >
                  <UserCheck className="w-5 h-5 mr-3" />
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-3" />
                </Button>

                <Button
                  onClick={() => window.location.href = '/signin'}
                  variant="outline"
                  className="w-full h-14 text-lg rounded-2xl border-2 border-primary/20 hover:border-primary hover-lift"
                >
                  <Chrome className="w-5 h-5 mr-3" />
                  Sign In
                </Button>

                <Button
                  onClick={handleGuestAccess}
                  disabled={guestLoading}
                  variant="outline"
                  className="w-full h-12 text-sm rounded-2xl border-2 border-accent/20 hover:border-accent hover-lift"
                >
                  {guestLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Setting up...
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Try as Guest
                      <span className="ml-2 text-xs opacity-75">(Explore features)</span>
                    </>
                  )}
                </Button>
              </div>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="glass rounded-2xl p-6 hover-lift border border-primary/10"
                  >
                    <Icon className="w-10 h-10 text-primary mb-4 mx-auto" />
                    <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-8 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-safe" />
                <span>End-to-end encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-accent fill-current" />
                <span>4.9/5 rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span>10,000+ active users</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="p-6 text-center text-xs text-muted-foreground"
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center gap-1 mb-2">
              <span>Made with</span>
              <Heart className="w-3 h-3 text-primary fill-current" />
              <span>for women's safety by Team Sakhi</span>
            </div>
            <p>🔒 Your privacy and safety are our highest priority</p>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
