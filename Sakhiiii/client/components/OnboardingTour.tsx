import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Shield, 
  AlertTriangle, 
  Navigation,
  Users,
  Mic,
  Phone,
  FileText,
  Heart,
  Star,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  target?: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: () => void;
}

interface OnboardingTourProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ isOpen, onComplete, onSkip }) => {
  const { t, currentLanguage } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Sakhi! 🙏',
      description: 'Your personal safety companion that keeps you protected 24/7. Let\'s take a quick tour to get you started.',
      icon: Shield,
      position: 'center',
    },
    {
      id: 'sos',
      title: 'Emergency SOS Button 🚨',
      description: 'In case of emergency, tap and hold this button. It will send your location to emergency contacts and nearby authorities.',
      icon: AlertTriangle,
      position: 'top',
      target: '.sos-button',
    },
    {
      id: 'voice',
      title: 'Voice Assistant 🗣️',
      description: `Your multilingual voice assistant speaks ${currentLanguage === 'en' ? 'English' : currentLanguage === 'hi' ? 'Hindi' : currentLanguage === 'kn' ? 'Kannada' : currentLanguage === 'ta' ? 'Tamil' : 'Telugu'}! Say "Help" or "SOS" for emergency assistance.`,
      icon: Mic,
      position: 'top',
      target: '.voice-action',
    },
    {
      id: 'routes',
      title: 'Safe Route Finder 🗺️',
      description: 'Find the safest routes to your destination with real-time safety updates from the community.',
      icon: Navigation,
      position: 'top',
      target: '.route-action',
    },
    {
      id: 'community',
      title: 'Community Support 👥',
      description: 'Connect with other women, share safety tips, and stay informed about your area.',
      icon: Users,
      position: 'bottom',
      target: '.community-tab',
    },
    {
      id: 'reporting',
      title: 'Incident Reporting 📋',
      description: 'Report safety incidents anonymously to help keep your community safe.',
      icon: FileText,
      position: 'top',
      target: '.report-action',
    },
    {
      id: 'helplines',
      title: 'Emergency Helplines ☎️',
      description: 'Quick access to all important emergency numbers including police, medical, and women helplines.',
      icon: Phone,
      position: 'top',
      target: '.helpline-action',
    },
    {
      id: 'complete',
      title: 'You\'re All Set! ✨',
      description: 'Sakhi is now ready to keep you safe. Remember, your safety is our priority. Stay safe, stay connected!',
      icon: Heart,
      position: 'center',
    },
  ];

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Add voice welcome message in user's language
      if ('speechSynthesis' in window) {
        const welcomeText = currentLanguage === 'en' ? 'Welcome to Sakhi, your safety companion' :
                           currentLanguage === 'hi' ? 'सखी में आपका स्वागत है, आपकी सुरक्षा साथी' :
                           currentLanguage === 'kn' ? 'ಸಖಿಗೆ ಸ್ವಾಗತ, ನಿಮ್ಮ ಸುರಕ್ಷತಾ ಸಹಚರ' :
                           currentLanguage === 'ta' ? 'சகியில் உங்களை வரவேற்கிறோம், உங்கள் பாதுகாப்பு தோழர்' :
                           'సఖిలోకి మిమ్మల్ని స్వాగతం, మీ భద్రతా సహచరుడు';
        
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(welcomeText);
          utterance.lang = currentLanguage === 'en' ? 'en-US' : 
                          currentLanguage === 'hi' ? 'hi-IN' :
                          currentLanguage === 'kn' ? 'kn-IN' :
                          currentLanguage === 'ta' ? 'ta-IN' : 'te-IN';
          utterance.rate = 0.8;
          utterance.pitch = 1.1;
          window.speechSynthesis.speak(utterance);
        }, 500);
      }
    }
  }, [isOpen, currentLanguage]);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      
      // Add voice guidance for each step
      if ('speechSynthesis' in window) {
        const step = tourSteps[currentStep + 1];
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(step.description);
          utterance.lang = currentLanguage === 'en' ? 'en-US' : 
                          currentLanguage === 'hi' ? 'hi-IN' :
                          currentLanguage === 'kn' ? 'kn-IN' :
                          currentLanguage === 'ta' ? 'ta-IN' : 'te-IN';
          utterance.rate = 0.9;
          utterance.pitch = 1.1;
          window.speechSynthesis.speak(utterance);
        }, 300);
      }
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    // Stop any ongoing speech
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    onSkip();
  };

  const handleComplete = () => {
    // Stop any ongoing speech
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    onComplete();
  };

  if (!isOpen || !isVisible) return null;

  const currentTourStep = tourSteps[currentStep];
  const StepIcon = currentTourStep.icon;

  const getTooltipPosition = (position: string) => {
    switch (position) {
      case 'top':
        return 'bottom-full mb-2';
      case 'bottom':
        return 'top-full mt-2';
      case 'left':
        return 'right-full mr-2';
      case 'right':
        return 'left-full ml-2';
      default:
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50"
          />

          {/* Tour Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed z-50 ${
              currentTourStep.position === 'center' 
                ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
                : getTooltipPosition(currentTourStep.position)
            }`}
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm mx-4 p-6 border-2 border-primary/20">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-primary to-accent rounded-full p-2">
                    <StepIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{currentTourStep.title}</h3>
                    <p className="text-sm text-gray-500">{currentStep + 1} of {tourSteps.length}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="bg-gray-200 rounded-full h-1 mb-4">
                <motion.div
                  className="bg-gradient-to-r from-primary to-accent h-1 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">{currentTourStep.description}</p>
              </div>

              {/* Special content for certain steps */}
              {currentStep === 0 && (
                <div className="bg-gradient-to-r from-pastel-pink to-soft-lavender rounded-2xl p-4 mb-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <Star className="w-4 h-4 text-primary" />
                    <span className="font-medium">Sakhi means "female friend" in Sanskrit</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm mt-1">
                    <MapPin className="w-4 h-4 text-accent" />
                    <span>Built specifically for Indian women's safety</span>
                  </div>
                </div>
              )}

              {currentStep === tourSteps.length - 1 && (
                <div className="bg-gradient-to-r from-safe/20 to-primary/20 rounded-2xl p-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🌟</div>
                    <p className="font-medium text-gray-800">Ready to stay safe with Sakhi!</p>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="rounded-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {currentStep === tourSteps.length - 1 ? (
                  <Button
                    onClick={handleComplete}
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 rounded-full"
                  >
                    Get Started
                    <Heart className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={nextStep}
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 rounded-full"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>

              {/* Skip option */}
              <div className="text-center mt-4">
                <button
                  onClick={handleSkip}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Skip tour
                </button>
              </div>
            </div>
          </motion.div>

          {/* Highlight target element */}
          {currentTourStep.target && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 pointer-events-none z-40"
            >
              <div className="absolute inset-0">
                <div 
                  className="absolute border-4 border-primary rounded-2xl animate-pulse"
                  style={{
                    boxShadow: '0 0 0 4px rgba(147, 51, 234, 0.3), 0 0 0 8px rgba(147, 51, 234, 0.1)'
                  }}
                />
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
};

export default OnboardingTour;
