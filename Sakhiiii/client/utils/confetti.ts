import confetti from 'canvas-confetti';

export const celebrateReportSubmission = () => {
  // Pink and purple confetti for successful report submission
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#ec4899', '#8b5cf6', '#f97316', '#10b981', '#3b82f6']
  });

  // Additional burst after a delay
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#ec4899', '#8b5cf6', '#f97316']
    });
  }, 250);

  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#ec4899', '#8b5cf6', '#f97316']
    });
  }, 400);
};

export const celebrateWellnessGoal = () => {
  // Gentle wellness celebration
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.7 },
    colors: ['#fbbf24', '#f472b6', '#c084fc', '#60a5fa'],
    shapes: ['circle']
  });
};

export const celebrateProfileComplete = () => {
  // Profile completion celebration
  confetti({
    particleCount: 150,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b']
  });
};

export const celebratePeriodTracked = () => {
  // Period tracking celebration
  confetti({
    particleCount: 60,
    spread: 50,
    origin: { y: 0.6 },
    colors: ['#f472b6', '#c084fc', '#fbbf24'],
    shapes: ['circle']
  });
};
