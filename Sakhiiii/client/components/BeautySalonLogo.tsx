import { motion } from 'framer-motion';

interface BeautySalonLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function BeautySalonLogo({ size = 'md', className = '' }: BeautySalonLogoProps) {
  const sizeMap = {
    sm: { width: 32, height: 32 },
    md: { width: 48, height: 48 },
    lg: { width: 64, height: 64 }
  };

  const { width, height } = sizeMap[size];

  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <div 
        className="rounded-full bg-gradient-to-br from-pastel-pink via-pink-100 to-pastel-coral shadow-lg overflow-hidden"
        style={{ width, height }}
      >
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKHXVj9x_j5oUXoDlHdbg4mrBJ22IlbUL7xoMWefM-Sy0tNcrNdstE84RFP0sV6qoQLrg&usqp=CAU"
          alt="Sakhi - Beauty & Safety"
          className="w-full h-full object-cover object-center"
          style={{
            filter: 'brightness(1.1) contrast(1.1) saturate(1.2)',
          }}
          onError={(e) => {
            // Fallback to previous logo if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) {
              fallback.style.display = 'block';
            }
          }}
        />
        
        {/* Fallback SVG logo (hidden by default) */}
        <svg
          width={width}
          height={height}
          viewBox="0 0 100 100"
          className="absolute inset-0 drop-shadow-sm"
          style={{ display: 'none' }}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
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

          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="url(#skinGradient)"
            strokeWidth="2"
            className="drop-shadow-lg"
          />
          
          <ellipse
            cx="50"
            cy="52"
            rx="35"
            ry="40"
            fill="url(#skinGradient)"
            className="opacity-90"
          />

          <path
            d="M15 35 Q25 15, 50 18 Q75 15, 85 35 Q80 25, 50 22 Q20 25, 15 35 Z"
            fill="url(#hairGradient)"
          />
          
          <ellipse cx="42" cy="45" rx="6" ry="4" fill="white" />
          <ellipse cx="58" cy="45" rx="6" ry="4" fill="white" />
          
          <circle cx="42" cy="45" r="3" fill="url(#eyeGradient)" />
          <circle cx="58" cy="45" r="3" fill="url(#eyeGradient)" />
          
          <circle cx="43" cy="43" r="1" fill="white" opacity="0.8" />
          <circle cx="59" cy="43" r="1" fill="white" opacity="0.8" />

          <ellipse
            cx="50"
            cy="62"
            rx="8"
            ry="3"
            fill="url(#lipGradient)"
            className="opacity-80"
          />
          
          <circle cx="35" cy="55" r="4" fill="#ff8a80" opacity="0.3" />
          <circle cx="65" cy="55" r="4" fill="#ff8a80" opacity="0.3" />

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
      </div>
      
      {/* Safety indicator overlay */}
      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full border-2 border-white shadow-sm">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-green-300 to-green-500 animate-pulse"></div>
      </div>
    </motion.div>
  );
}
