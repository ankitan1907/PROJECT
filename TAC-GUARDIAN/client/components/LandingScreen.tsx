import { useState, useEffect } from 'react';
import { Shield, Zap, Radar } from 'lucide-react';

interface LandingScreenProps {
  onEnter: () => void;
}

export function LandingScreen({ onEnter }: LandingScreenProps) {
  const [bootSequence, setBootSequence] = useState(0);
  const [typewriterText, setTypewriterText] = useState('');
  const [showButton, setShowButton] = useState(false);

  const bootMessages = [
    'Verifying Clearance...',
    'Establishing Secure Connection...',
    'Loading Tactical Systems...',
    'Initializing Defense Protocols...',
    'Access Granted'
  ];

  const tagline = 'Initializing Tactical Command Systems...';

  useEffect(() => {
    // Typewriter effect for tagline
    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < tagline.length) {
        setTypewriterText(tagline.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typeInterval);
        // Start boot sequence after tagline
        setTimeout(() => {
          startBootSequence();
        }, 1000);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, []);

  const startBootSequence = () => {
    let messageIndex = 0;
    const bootInterval = setInterval(() => {
      if (messageIndex < bootMessages.length) {
        setBootSequence(messageIndex + 1);
        messageIndex++;
      } else {
        clearInterval(bootInterval);
        setTimeout(() => setShowButton(true), 500);
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="w-full h-full animate-pulse"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            animation: 'grid-scan 4s ease-in-out infinite'
          }}
        />
      </div>

      {/* Radar Sweep Animation */}
      <div className="absolute top-10 right-10 w-32 h-32 opacity-30">
        <div className="relative w-full h-full border-2 border-cyborg-teal rounded-full">
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0deg, rgba(0, 240, 255, 0.5) 45deg, transparent 90deg)',
              animation: 'radar-sweep 3s linear infinite'
            }}
          />
          <div className="absolute inset-2 border border-cyborg-teal/50 rounded-full" />
          <div className="absolute inset-4 border border-cyborg-teal/30 rounded-full" />
          <Radar className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-cyborg-teal" />
        </div>
      </div>

      {/* CLASSIFIED Badge */}
      <div className="absolute top-6 right-6 px-4 py-2 border-2 border-alert-red bg-alert-red/10 text-alert-red font-bold text-sm animate-pulse">
        [CLASSIFIED ACCESS]
      </div>

      {/* STATUS Indicator */}
      <div className="absolute bottom-6 left-6 flex items-center space-x-3">
        <div className="w-3 h-3 bg-cyborg-teal rounded-full animate-pulse" />
        <span className="text-cyborg-teal font-mono text-sm animate-pulse">
          STATUS: ONLINE
        </span>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen text-center relative z-10 py-8">

        {/* Logo */}
        <div className="mb-6 relative">
          <div className="relative inline-block">
            {/* Glowing background */}
            <div className="absolute inset-0 bg-cyborg-teal/20 blur-xl rounded-full scale-150 animate-pulse" />
            
            {/* Logo container */}
            <div className="relative flex items-center justify-center w-32 h-32 border-4 border-cyborg-teal rounded-full bg-black/50 backdrop-blur-sm">
              <Shield className="w-16 h-16 text-cyborg-teal animate-pulse" />
              <Zap className="absolute top-2 right-2 w-6 h-6 text-neon-amber animate-ping" />
            </div>

            {/* Rotating rings */}
            <div className="absolute inset-0 border border-cyborg-teal/50 rounded-full animate-spin" style={{ animationDuration: '8s' }} />
            <div className="absolute inset-2 border border-cyborg-teal/30 rounded-full animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-cyborg-teal via-white to-cyborg-teal bg-clip-text text-transparent">
          TAC-GUARDIAN
        </h1>

        <div className="text-base text-gray-400 mb-2">
          Military Command & Simulation Dashboard
        </div>

        {/* Typewriter tagline */}
        <div className="h-6 mb-8">
          <p className="text-lg text-cyborg-teal font-mono">
            {typewriterText}
            <span className="animate-pulse">|</span>
          </p>
        </div>

        {/* Boot Sequence */}
        <div className="space-y-2 min-h-[120px] flex flex-col justify-start">
          {bootMessages.slice(0, bootSequence).map((message, index) => (
            <div
              key={index}
              className={`flex items-center space-x-3 transition-all duration-500 ${
                index === bootSequence - 1 ? 'opacity-100' : 'opacity-70'
              }`}
            >
              <div className="w-2 h-2 bg-cyborg-teal rounded-full animate-pulse" />
              <span className="text-cyborg-teal font-mono text-sm">
                {message}
              </span>
              {index === bootMessages.length - 1 && index < bootSequence && (
                <span className="text-green-400 font-bold animate-pulse ml-4">✓</span>
              )}
            </div>
          ))}
        </div>

        {/* Enter Button */}
        {showButton && (
          <button
            onClick={onEnter}
            className="mt-6 px-8 py-3 bg-gradient-to-r from-cyborg-teal to-neon-amber text-black font-bold text-lg rounded-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyborg-teal/50 animate-fade-in"
          >
            ENTER COMMAND CENTER
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes grid-scan {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.3; }
        }
        
        @keyframes radar-sweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes fade-in {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
