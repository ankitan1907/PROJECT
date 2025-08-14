import { useEffect, useState } from "react";
import { Shield, Lock, Zap, Wifi } from "lucide-react";

export function SecurityLayer({ blackoutMode, quantumKeyRotation }: { 
  blackoutMode: boolean; 
  quantumKeyRotation: number; 
}) {
  const [encryptionLevel, setEncryptionLevel] = useState("AES-256");
  const [keyRotationActive, setKeyRotationActive] = useState(false);

  useEffect(() => {
    if (quantumKeyRotation % 4 === 0) {
      setKeyRotationActive(true);
      setTimeout(() => setKeyRotationActive(false), 1000);
    }
  }, [quantumKeyRotation]);

  if (!blackoutMode) return null;

  return (
    <div className="fixed inset-0 z-30 pointer-events-none">
      {/* Blackout Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]">
        {/* Security Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(255, 46, 77, 0.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 46, 77, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }} />
        </div>

        {/* Simplified Blackout Status */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
          <div className="bg-black/80 border border-alert-red/60 rounded-lg px-4 py-2 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className={`transition-all duration-1000 ${keyRotationActive ? 'animate-spin' : ''}`}>
                <Lock className="w-4 h-4 text-alert-red" />
              </div>
              <div className="text-center">
                <div className="text-alert-red font-bold text-sm">🔒 BLACKOUT MODE ACTIVE</div>
                <div className="text-alert-red/70 text-xs">Emergency protocols engaged</div>
              </div>
              <Wifi className="w-4 h-4 text-alert-red animate-pulse" />
            </div>
          </div>
        </div>

        {/* Subtle Scanning Effect */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div
            className="absolute w-full h-px bg-gradient-to-r from-transparent via-alert-red to-transparent"
            style={{
              top: '40%',
              animation: 'scan 6s ease-in-out infinite'
            }}
          />
        </div>

        {/* Corner Security Indicators */}
        <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-alert-red/40 opacity-60" />
        <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-alert-red/40 opacity-60" />
        <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-alert-red/40 opacity-60" />
        <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-alert-red/40 opacity-60" />
      </div>

      <style jsx>{`
        @keyframes scan {
          0%, 100% { transform: translateY(-20px); opacity: 0; }
          50% { transform: translateY(20px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
