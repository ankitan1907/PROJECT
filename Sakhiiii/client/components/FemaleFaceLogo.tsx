import { motion } from 'framer-motion';

interface FemaleFaceLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function FemaleFaceLogo({ size = 'md', className = '' }: FemaleFaceLogoProps) {
  const sizeMap = {
    sm: { width: 24, height: 24, strokeWidth: 1.5 },
    md: { width: 32, height: 32, strokeWidth: 1.5 },
    lg: { width: 48, height: 48, strokeWidth: 1.2 }
  };

  const { width, height, strokeWidth } = sizeMap[size];

  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 100 100"
        className="drop-shadow-sm"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="skinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffd4b3" />
            <stop offset="50%" stopColor="#ffb386" />
            <stop offset="100%" stopColor="#ff9d6b" />
          </linearGradient>
          
          <linearGradient id="hairGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4a2c2a" />
            <stop offset="50%" stopColor="#6b4423" />
            <stop offset="100%" stopColor="#8b5a2b" />
          </linearGradient>
          
          <linearGradient id="lipGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e91e63" />
            <stop offset="100%" stopColor="#c2185b" />
          </linearGradient>

          <radialGradient id="eyeGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4fc3f7" />
            <stop offset="70%" stopColor="#29b6f6" />
            <stop offset="100%" stopColor="#0288d1" />
          </radialGradient>
        </defs>

        {/* Face Border/Frame */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="url(#skinGradient)"
          strokeWidth={strokeWidth + 1}
          className="drop-shadow-lg"
        />
        
        {/* Face Base */}
        <ellipse
          cx="50"
          cy="52"
          rx="35"
          ry="40"
          fill="url(#skinGradient)"
          className="opacity-90"
        />

        {/* Hair */}
        <path
          d="M15 35 Q25 15, 50 18 Q75 15, 85 35 Q80 25, 50 22 Q20 25, 15 35 Z"
          fill="url(#hairGradient)"
        />
        
        {/* Hair strands */}
        <path
          d="M20 32 Q30 28, 35 35"
          stroke="url(#hairGradient)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <path
          d="M65 35 Q70 28, 80 32"
          stroke="url(#hairGradient)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Eyes */}
        <ellipse cx="42" cy="45" rx="6" ry="4" fill="white" />
        <ellipse cx="58" cy="45" rx="6" ry="4" fill="white" />
        
        {/* Pupils */}
        <circle cx="42" cy="45" r="3" fill="url(#eyeGradient)" />
        <circle cx="58" cy="45" r="3" fill="url(#eyeGradient)" />
        
        {/* Eye shine */}
        <circle cx="43" cy="43" r="1" fill="white" opacity="0.8" />
        <circle cx="59" cy="43" r="1" fill="white" opacity="0.8" />

        {/* Eyebrows */}
        <path
          d="M36 40 Q42 38, 48 40"
          stroke="#4a2c2a"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M52 40 Q58 38, 64 40"
          stroke="#4a2c2a"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />

        {/* Nose */}
        <path
          d="M48 52 Q50 55, 52 52"
          stroke="#ffb386"
          strokeWidth={strokeWidth * 0.8}
          fill="none"
          strokeLinecap="round"
        />

        {/* Lips */}
        <ellipse
          cx="50"
          cy="62"
          rx="8"
          ry="3"
          fill="url(#lipGradient)"
          className="opacity-80"
        />
        
        {/* Lip highlight */}
        <ellipse
          cx="50"
          cy="61"
          rx="6"
          ry="1.5"
          fill="white"
          className="opacity-30"
        />

        {/* Cheek blush */}
        <circle cx="35" cy="55" r="4" fill="#ff8a80" opacity="0.3" />
        <circle cx="65" cy="55" r="4" fill="#ff8a80" opacity="0.3" />

        {/* Beauty mark */}
        <circle cx="60" cy="58" r="0.8" fill="#4a2c2a" opacity="0.6" />

        {/* Earrings */}
        <circle cx="18" cy="50" r="2" fill="#ffd700" opacity="0.8" />
        <circle cx="82" cy="50" r="2" fill="#ffd700" opacity="0.8" />
        
        {/* Earring shine */}
        <circle cx="18.5" cy="49.5" r="0.5" fill="white" opacity="0.9" />
        <circle cx="82.5" cy="49.5" r="0.5" fill="white" opacity="0.9" />

        {/* Protection aura/glow */}
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="#e91e63"
          strokeWidth="0.5"
          opacity="0.4"
          className="animate-pulse"
        />
      </svg>
    </motion.div>
  );
}
