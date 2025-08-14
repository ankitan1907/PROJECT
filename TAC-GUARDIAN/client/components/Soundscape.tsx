import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Radio, Wind, Zap } from "lucide-react";

interface SoundscapeProps {
  cinematicActive: boolean;
  blackoutMode: boolean;
  threatLevel: 'low' | 'medium' | 'high';
}

interface AudioTrack {
  id: string;
  name: string;
  type: 'ambient' | 'radio' | 'effect';
  volume: number;
  playing: boolean;
  loop: boolean;
}

export function Soundscape({ cinematicActive, blackoutMode, threatLevel }: SoundscapeProps) {
  const [enabled, setEnabled] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.3);
  const [tracks, setTracks] = useState<AudioTrack[]>([
    { id: 'ambient_base', name: 'Base Ambience', type: 'ambient', volume: 0.2, playing: false, loop: true },
    { id: 'radio_chatter', name: 'Radio Chatter', type: 'radio', volume: 0.4, playing: false, loop: true },
    { id: 'battlefield_distant', name: 'Distant Operations', type: 'ambient', volume: 0.15, playing: false, loop: true },
    { id: 'helicopter_patrol', name: 'Helicopter Patrol', type: 'effect', volume: 0.25, playing: false, loop: true },
    { id: 'wind_ambience', name: 'Wind', type: 'ambient', volume: 0.1, playing: false, loop: true }
  ]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<{ [key: string]: OscillatorNode }>({});
  const gainNodesRef = useRef<{ [key: string]: GainNode }>({});

  // Radio chatter phrases for simulation
  const radioChatter = [
    "Alpha team, report status - over",
    "Base to all units, maintain radio silence",
    "Charlie-6, we have eyes on target",
    "All stations, weather update - winds picking up",
    "Bravo team requesting supply drop coordinates",
    "Base to Alpha, you are clear to proceed",
    "Medical team standing by at LZ Charlie",
    "Overwatch reporting all clear on sector 7",
    "Delta team, acknowledge last transmission",
    "All units, threat level elevated - stay alert"
  ];

  const [currentChatter, setCurrentChatter] = useState("");
  const chatterTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize Web Audio API
  useEffect(() => {
    if (enabled && !audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log('Audio context initialized');
      } catch (error) {
        console.warn('Web Audio API not supported:', error);
      }
    }
  }, [enabled]);

  // Generate synthetic audio for different sound types
  const createSyntheticAudio = (trackId: string, track: AudioTrack) => {
    if (!audioContextRef.current || oscillatorsRef.current[trackId]) return;

    const audioContext = audioContextRef.current;
    const gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
    gainNode.gain.setValueAtTime(track.volume * masterVolume, audioContext.currentTime);
    gainNodesRef.current[trackId] = gainNode;

    switch (track.type) {
      case 'ambient':
        // Create ambient noise using white noise
        createWhiteNoise(trackId, gainNode, audioContext);
        break;
      case 'radio':
        // Create radio static simulation
        createRadioStatic(trackId, gainNode, audioContext);
        break;
      case 'effect':
        // Create helicopter-like sound
        createHelicopterSound(trackId, gainNode, audioContext);
        break;
    }
  };

  const createWhiteNoise = (trackId: string, gainNode: GainNode, audioContext: AudioContext) => {
    const bufferSize = 4096;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 0.1 - 0.05; // Low volume white noise
    }

    const whiteNoise = audioContext.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, audioContext.currentTime);
    
    whiteNoise.connect(filter);
    filter.connect(gainNode);
    whiteNoise.start();
    
    oscillatorsRef.current[trackId] = whiteNoise as any;
  };

  const createRadioStatic = (trackId: string, gainNode: GainNode, audioContext: AudioContext) => {
    const oscillator = audioContext.createOscillator();
    const filter = audioContext.createBiquadFilter();
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(100 + Math.random() * 50, audioContext.currentTime);
    
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, audioContext.currentTime);
    filter.Q.setValueAtTime(5, audioContext.currentTime);
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    oscillator.start();
    
    oscillatorsRef.current[trackId] = oscillator;
    
    // Modulate frequency for static effect
    setInterval(() => {
      if (oscillator.frequency) {
        oscillator.frequency.setValueAtTime(100 + Math.random() * 200, audioContext.currentTime);
      }
    }, 200);
  };

  const createHelicopterSound = (trackId: string, gainNode: GainNode, audioContext: AudioContext) => {
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    
    oscillator1.type = 'sawtooth';
    oscillator1.frequency.setValueAtTime(80, audioContext.currentTime);
    
    oscillator2.type = 'sine';
    oscillator2.frequency.setValueAtTime(25, audioContext.currentTime);
    
    const merger = audioContext.createChannelMerger();
    oscillator1.connect(merger);
    oscillator2.connect(merger);
    merger.connect(gainNode);
    
    oscillator1.start();
    oscillator2.start();
    
    oscillatorsRef.current[trackId] = oscillator1;
  };

  const stopAudio = (trackId: string) => {
    if (oscillatorsRef.current[trackId]) {
      try {
        oscillatorsRef.current[trackId].stop();
        delete oscillatorsRef.current[trackId];
      } catch (error) {
        console.warn('Error stopping audio:', error);
      }
    }
    if (gainNodesRef.current[trackId]) {
      gainNodesRef.current[trackId].disconnect();
      delete gainNodesRef.current[trackId];
    }
  };

  // Handle track state changes
  useEffect(() => {
    tracks.forEach(track => {
      if (enabled && track.playing) {
        createSyntheticAudio(track.id, track);
      } else {
        stopAudio(track.id);
      }
    });

    return () => {
      // Cleanup on unmount
      Object.keys(oscillatorsRef.current).forEach(stopAudio);
    };
  }, [tracks, enabled, masterVolume]);

  // Auto-enable ambient sounds based on state
  useEffect(() => {
    if (enabled) {
      setTracks(prev => prev.map(track => {
        if (cinematicActive) {
          // Enable most sounds during cinematic mode
          return { ...track, playing: track.type !== 'effect' || track.id === 'helicopter_patrol' };
        } else if (blackoutMode) {
          // Only radio and minimal ambient during blackout
          return { ...track, playing: track.type === 'radio' || track.id === 'ambient_base' };
        } else {
          // Normal operation - ambient and radio only
          return { ...track, playing: track.type === 'ambient' || track.type === 'radio' };
        }
      }));
    }
  }, [cinematicActive, blackoutMode, enabled]);

  // Adjust volume based on threat level
  useEffect(() => {
    if (enabled) {
      const volumeMultiplier = threatLevel === 'high' ? 1.3 : threatLevel === 'medium' ? 1.1 : 1.0;
      
      Object.values(gainNodesRef.current).forEach((gainNode, index) => {
        const track = tracks[index];
        if (track && gainNode.gain) {
          gainNode.gain.setValueAtTime(
            track.volume * masterVolume * volumeMultiplier,
            audioContextRef.current?.currentTime || 0
          );
        }
      });
    }
  }, [threatLevel, masterVolume, enabled]);

  // Radio chatter simulation
  useEffect(() => {
    if (enabled && tracks.find(t => t.id === 'radio_chatter')?.playing) {
      const playChatter = () => {
        const phrase = radioChatter[Math.floor(Math.random() * radioChatter.length)];
        setCurrentChatter(phrase);
        
        // Clear chatter after 3 seconds
        setTimeout(() => setCurrentChatter(""), 3000);
        
        // Schedule next chatter in 8-15 seconds
        chatterTimeoutRef.current = setTimeout(playChatter, 8000 + Math.random() * 7000);
      };

      // Start chatter after 2 seconds
      chatterTimeoutRef.current = setTimeout(playChatter, 2000);
    }

    return () => {
      if (chatterTimeoutRef.current) {
        clearTimeout(chatterTimeoutRef.current);
      }
    };
  }, [enabled, tracks]);

  const toggleTrack = (trackId: string) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, playing: !track.playing } : track
    ));
  };

  const getVolumeIcon = () => {
    if (!enabled) return VolumeX;
    if (masterVolume > 0.5) return Volume2;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon();

  return (
    <div className="glass-panel rounded-lg p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-cyborg-teal flex items-center">
          <Radio className="mr-2" size={16} />
          Soundscape
        </h3>
        <button
          onClick={() => setEnabled(!enabled)}
          className={`p-2 rounded-lg transition-all duration-300 ${
            enabled 
              ? 'bg-cyborg-teal/20 text-cyborg-teal' 
              : 'bg-gray-600/20 text-gray-400'
          }`}
        >
          <VolumeIcon size={16} />
        </button>
      </div>

      {enabled && (
        <>
          {/* Master Volume */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Master Volume</span>
              <span className="text-cyborg-teal">{Math.round(masterVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={masterVolume}
              onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
              className="w-full accent-cyborg-teal"
            />
          </div>

          {/* Audio Tracks */}
          <div className="space-y-2">
            {tracks.map(track => {
              const Icon = track.type === 'radio' ? Radio : track.type === 'effect' ? Zap : Wind;
              return (
                <div key={track.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon size={12} className={track.playing ? 'text-cyborg-teal' : 'text-gray-500'} />
                    <span className="text-xs text-gray-300">{track.name}</span>
                  </div>
                  <button
                    onClick={() => toggleTrack(track.id)}
                    className={`px-2 py-1 rounded text-xs transition-all duration-300 ${
                      track.playing
                        ? 'bg-cyborg-teal/20 text-cyborg-teal'
                        : 'bg-gray-600/20 text-gray-400'
                    }`}
                  >
                    {track.playing ? 'ON' : 'OFF'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Radio Chatter Display */}
          {currentChatter && (
            <div className="p-2 bg-cyborg-teal/10 border border-cyborg-teal/30 rounded text-xs text-cyborg-teal">
              <div className="flex items-center space-x-2">
                <Radio size={12} className="animate-pulse" />
                <span>{currentChatter}</span>
              </div>
            </div>
          )}

          {/* Status Indicators */}
          <div className="text-xs text-gray-400 space-y-1">
            {cinematicActive && <div className="text-neon-amber">🎬 Cinematic audio active</div>}
            {blackoutMode && <div className="text-alert-red">🔒 Emergency channels only</div>}
            <div className="text-gray-500">
              Threat Level: <span className={`${
                threatLevel === 'high' ? 'text-alert-red' : 
                threatLevel === 'medium' ? 'text-neon-amber' : 'text-cyborg-teal'
              }`}>
                {threatLevel.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="text-xs text-center text-gray-500 pt-1 border-t border-gray-600">
            Synthetic audio simulation
          </div>
        </>
      )}
    </div>
  );
}
