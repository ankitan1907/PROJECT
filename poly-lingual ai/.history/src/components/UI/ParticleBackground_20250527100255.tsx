import React, { useRef, useEffect } from 'react';
import { useWindowSize } from 'react-use';
import { useMousePosition } from '../hppks/useMousePosition'; // ✅ Correct custom hook import

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
}

const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { width, height } = useWindowSize();
  const mousePosition = useMousePosition(); // ✅ Using custom hook
  const particlesRef = useRef<Particle[]>([]);

  const colors = [
    'rgba(59, 130, 246, 0.5)',  // blue
    'rgba(139, 92, 246, 0.5)',  // purple
    'rgba(236, 72, 153, 0.5)',  // pink
    'rgba(99, 102, 241, 0.5)',  // indigo
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create particles if they don't exist
    if (particlesRef.current.length === 0) {
      const particleCount = Math.min(Math.floor(width * height / 15000), 100);
      
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2 + 1,
          speedX: Math.random() * 0.5 - 0.25,
          speedY: Math.random() * 0.5 - 0.25,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      particlesRef.current.forEach(particle => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Bounce off edges
        if (particle.x < 0 || particle.x > width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > height) particle.speedY *= -1;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        
        // Mouse interaction (subtle attraction)
        if (mousePosition.x && mousePosition.y) {
          const dx = mousePosition.x - particle.x;
          const dy = mousePosition.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            const angle = Math.atan2(dy, dx);
            particle.speedX += Math.cos(angle) * 0.01;
            particle.speedY += Math.sin(angle) * 0.01;
          }
        }
      });
      
      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationId);
  }, [width, height, mousePosition]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10"
    />
  );
};

export default ParticleBackground;
