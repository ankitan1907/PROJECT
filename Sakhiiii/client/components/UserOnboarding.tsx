import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  PhoneCall,
  MapPin,
  Users,
  Star,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  X,
  Heart,
  UserPlus,
  Bell,
  Navigation
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BeautySalonLogo from '@/components/BeautySalonLogo';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  content: React.ReactNode;
  actionText?: string;
}

interface UserOnboardingProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
  isGuest?: boolean;
}

export default function UserOnboarding({
  isOpen,
  onComplete,
  onSkip,
  isGuest = false
}: UserOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: isGuest ? 'Welcome to Sakhi (Guest Mode)' : 'Welcome to Sakhi',
      description: 'Your personal safety companion',
      icon: BeautySalonLogo,
      content: (
        <div className="text-center space-y-4">
          <div className="mb-6">
            <BeautySalonLogo size="lg" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Welcome to Sakhi! 💖
          </h2>
          <p className="text-muted-foreground mb-4">
            {isGuest 
              ? "You're using Sakhi as a guest. Let's quickly show you the essential safety features."
              : "Let's get you started with your personal safety companion. We'll show you how to stay safe and connected."
            }
          </p>
          <div className="bg-primary/10 rounded-2xl p-4">
            <p className="text-sm text-primary font-medium">
              🛡️ Your safety is our priority
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              All features are designed to protect and empower you
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'emergency-contacts',
      title: 'Set Up Emergency Contacts',
      description: 'Add trusted people who will receive your SOS alerts',
      icon: PhoneCall,
      content: (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <PhoneCall className="w-16 h-16 mx-auto text-sos mb-3" />
            <h3 className="text-xl font-bold text-foreground">Emergency Contacts</h3>
          </div>
          <div className="bg-sos/10 rounded-2xl p-4 border border-sos/20">
            <h4 className="font-semibold text-sos mb-2">🚨 Critical for SOS Alerts</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Add at least 2 trusted contacts who will receive your emergency alerts instantly.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-safe" />
                <span>Family members</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-safe" />
                <span>Close friends</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-safe" />
                <span>Trusted colleagues</span>
              </div>
            </div>
          </div>
          <div className="bg-muted/10 rounded-xl p-3">
            <p className="text-xs text-muted-foreground">
              💡 Go to Profile → Emergency Contacts to add them after this guide
            </p>
          </div>
        </div>
      ),
      actionText: 'Set Up Later'
    },
    {
      id: 'sos-button',
      title: 'SOS Emergency Button',
      description: 'Your instant help button',
      icon: Shield,
      content: (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-sos to-destructive rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-foreground">SOS Button</h3>
          </div>
          <div className="bg-sos/10 rounded-2xl p-4 border border-sos/20">
            <h4 className="font-semibold text-sos mb-2">How it works:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="bg-sos text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">1</span>
                <span>Press the SOS button on your home screen</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-sos text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">2</span>
                <span>5-second countdown begins (can be cancelled)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-sos text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">3</span>
                <span>Sends location + emergency message to your contacts</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-sos text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">4</span>
                <span>Voice assistant guides you</span>
              </div>
            </div>
          </div>
          <div className="bg-warning/10 rounded-xl p-3 border border-warning/20">
            <p className="text-xs text-warning font-medium">
              ⚠️ Only use in real emergencies - contacts will be notified immediately
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'voice-assistant',
      title: 'Voice Assistant',
      description: 'Your speaking safety companion',
      icon: Bell,
      content: (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <Bell className="w-16 h-16 mx-auto text-primary mb-3" />
            <h3 className="text-xl font-bold text-foreground">Voice Assistant</h3>
          </div>
          <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20">
            <h4 className="font-semibold text-primary mb-2">🎙️ What it does:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-safe" />
                <span>Announces SOS alerts and confirmations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-safe" />
                <span>Reads safety notifications aloud</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-safe" />
                <span>Provides location and status updates</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-safe" />
                <span>Supports multiple languages</span>
              </div>
            </div>
          </div>
          <div className="bg-muted/10 rounded-xl p-3">
            <p className="text-xs text-muted-foreground">
              💡 Look for the voice indicator in the bottom-right corner to toggle it
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'features',
      title: 'Key Features',
      description: 'Explore what Sakhi can do for you',
      icon: Star,
      content: (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <Star className="w-16 h-16 mx-auto text-accent mb-3" />
            <h3 className="text-xl font-bold text-foreground">Explore Features</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-safe/10 rounded-xl p-3 border border-safe/20">
              <Navigation className="w-6 h-6 text-safe mb-2" />
              <h4 className="text-sm font-semibold">Safe Routes</h4>
              <p className="text-xs text-muted-foreground">Find safer paths to your destination</p>
            </div>
            <div className="bg-warning/10 rounded-xl p-3 border border-warning/20">
              <MapPin className="w-6 h-6 text-warning mb-2" />
              <h4 className="text-sm font-semibold">Report Incidents</h4>
              <p className="text-xs text-muted-foreground">Help the community stay informed</p>
            </div>
            <div className="bg-primary/10 rounded-xl p-3 border border-primary/20">
              <Users className="w-6 h-6 text-primary mb-2" />
              <h4 className="text-sm font-semibold">Community</h4>
              <p className="text-xs text-muted-foreground">Connect with other women</p>
            </div>
            <div className="bg-accent/10 rounded-xl p-3 border border-accent/20">
              <PhoneCall className="w-6 h-6 text-accent mb-2" />
              <h4 className="text-sm font-semibold">Helplines</h4>
              <p className="text-xs text-muted-foreground">Quick access to emergency services</p>
            </div>
          </div>
          <div className="bg-muted/10 rounded-xl p-3">
            <p className="text-xs text-muted-foreground text-center">
              💡 Use the bottom navigation to explore all features
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'ready',
      title: "You're All Set!",
      description: 'Start using Sakhi with confidence',
      icon: Heart,
      content: (
        <div className="text-center space-y-4">
          <div className="mb-6">
            <Heart className="w-16 h-16 mx-auto text-primary mb-3 fill-current" />
            <h3 className="text-2xl font-bold text-foreground">Ready to Go!</h3>
          </div>
          <div className="bg-primary/10 rounded-2xl p-4">
            <h4 className="font-semibold text-primary mb-2">🎉 What's next:</h4>
            <div className="space-y-2 text-sm text-left">
              {!isGuest && (
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-primary" />
                  <span>Add your emergency contacts in Profile</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-safe" />
                <span>Explore the safety features</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-accent" />
                <span>Join the community</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                <span>Stay safe and empowered</span>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-4">
            <p className="text-sm font-medium text-foreground">
              💖 Remember: You are strong, you are safe, you are supported
            </p>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  const handleSkip = () => {
    onSkip();
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md glass rounded-3xl shadow-beautiful overflow-hidden"
        >
          {/* Header */}
          <div className="gradient-primary text-white p-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-white/20 text-white text-xs">
                  Step {currentStep + 1} of {steps.length}
                </Badge>
                {isGuest && (
                  <Badge className="bg-accent/20 text-white text-xs">
                    Guest Mode
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-white/20 rounded-full h-2 mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-full h-2"
              />
            </div>

            <h2 className="text-xl font-bold mb-1">{currentStepData.title}</h2>
            <p className="text-white/90 text-sm">{currentStepData.description}</p>
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStepData.content}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-6 pt-0">
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="rounded-2xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <div className="flex gap-2">
                {currentStep < steps.length - 1 && (
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    className="rounded-2xl text-muted-foreground"
                  >
                    Skip Tour
                  </Button>
                )}

                <Button
                  onClick={handleNext}
                  className="gradient-primary rounded-2xl text-white"
                >
                  {currentStep === steps.length - 1 ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Get Started
                    </>
                  ) : (
                    <>
                      {currentStepData.actionText || 'Next'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
