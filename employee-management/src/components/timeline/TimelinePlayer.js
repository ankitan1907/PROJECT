import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaPause, FaStepForward, FaStepBackward } from 'react-icons/fa';

const TimelinePlayer = ({ 
  data, 
  onTimeChange, 
  interval = 1000, 
  initialIndex = 0,
  showControls = true,
  autoPlay = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const timerRef = useRef(null);
  
  // Effect to handle autoplay
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentIndex(prevIndex => {
          const nextIndex = prevIndex + 1;
          if (nextIndex >= data.length) {
            setIsPlaying(false);
            return prevIndex;
          }
          return nextIndex;
        });
      }, interval / playbackSpeed);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, interval, data.length, playbackSpeed]);
  
  // Effect to notify parent of time changes
  useEffect(() => {
    if (onTimeChange && data[currentIndex]) {
      onTimeChange(data[currentIndex], currentIndex);
    }
  }, [currentIndex, data, onTimeChange]);
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  const handleNext = () => {
    if (currentIndex < data.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const clickX = e.clientX - rect.left;
    
    // Calculate percentage
    const percentage = clickX / width;
    const index = Math.min(Math.floor(percentage * data.length), data.length - 1);
    
    setCurrentIndex(index);
  };
  
  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
  };
  
  // Format date (assuming the data has a date property)
  const formatDate = (item) => {
    if (!item) return '';
    
    // Try different date properties
    const date = item.date || item.timestamp || item.time || '';
    
    if (!date) return '';
    
    // Format date
    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return date.toString();
    }
  };
  
  return (
    <div className="w-full">
      {/* Date display */}
      <div className="h-12 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-xl font-semibold text-ocean-dark"
          >
            {formatDate(data[currentIndex])}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Timeline track */}
      <div className="mt-4 mb-6 relative">
        <div 
          className="timeline-track cursor-pointer"
          onClick={handleSeek}
        >
          <div 
            className="timeline-progress"
            style={{ width: `${(currentIndex / (data.length - 1)) * 100}%` }}
          ></div>
        </div>
        
        {/* Thumb */}
        <div 
          className="timeline-thumb"
          style={{ left: `${(currentIndex / (data.length - 1)) * 100}%` }}
        ></div>
      </div>
      
      {/* Controls */}
      {showControls && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`p-2 rounded-full ${
                currentIndex === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-ocean-dark hover:bg-ocean-lightest'
              }`}
              aria-label="Previous"
            >
              <FaStepBackward className="w-3.5 h-3.5" />
            </button>
            
            <button
              onClick={handlePlayPause}
              className="p-2 bg-ocean text-white rounded-full hover:bg-ocean-dark transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <FaPause className="w-4 h-4" /> : <FaPlay className="w-4 h-4" />}
            </button>
            
            <button
              onClick={handleNext}
              disabled={currentIndex === data.length - 1}
              className={`p-2 rounded-full ${
                currentIndex === data.length - 1 ? 'text-gray-400 cursor-not-allowed' : 'text-ocean-dark hover:bg-ocean-lightest'
              }`}
              aria-label="Next"
            >
              <FaStepForward className="w-3.5 h-3.5" />
            </button>
          </div>
          
          {/* Playback speed */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Speed:</span>
            {[0.5, 1, 2, 5].map(speed => (
              <button
                key={speed}
                onClick={() => handleSpeedChange(speed)}
                className={`text-xs px-2 py-1 rounded ${
                  playbackSpeed === speed
                    ? 'bg-ocean text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelinePlayer;