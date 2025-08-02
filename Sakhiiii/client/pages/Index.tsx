import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { MapPin, Users, AlertTriangle, ChevronDown, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@shared/types';
import BeautySalonLogo from '@/components/BeautySalonLogo';
import Landing from './Landing';
import Dashboard from './Dashboard';

const AnimatedLogo = () => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      scale: [1, 1.1, 1],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    });
  }, [controls]);

  return (
    <motion.div
      animate={controls}
      className="relative"
    >
      <div className="w-24 h-24">
        <BeautySalonLogo size="lg" />
      </div>
      <motion.div
        className="absolute inset-0 w-24 h-24 bg-primary/20 rounded-full blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
};

const FeatureCard = ({ icon: Icon, title, delay }: { icon: any, title: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6, ease: "easeOut" }}
    className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pastel-pink/30 hover:shadow-xl transition-all duration-300 hover:scale-105"
  >
    <Icon className="w-8 h-8 text-primary mb-3" />
    <h3 className="font-semibold text-foreground">{title}</h3>
  </motion.div>
);

const FloatingElement = ({ children, delay }: { children: React.ReactNode, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ 
      opacity: 1, 
      scale: 1,
      y: [0, -10, 0],
    }}
    transition={{ 
      delay,
      duration: 0.8,
      y: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }}
    className="absolute"
  >
    {children}
  </motion.div>
);

export default function Index() {
  const { user, isLoading } = useAuth();
  const { currentLanguage, setLanguage, availableLanguages, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGetStarted = () => {
    navigate('/signin');
  };

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-purple-50 to-purple-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <BeautySalonLogo size="sm" />
        </motion.div>
      </div>
    );
  }

  // If user is authenticated, show Dashboard
  if (user) {
    return <Dashboard />;
  }

  // If not authenticated, show Landing page
  return <Landing />;
}
