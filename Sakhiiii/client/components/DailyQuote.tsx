import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Quote, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuoteData {
  text: string;
  author?: string;
  category: 'strength' | 'wellness' | 'safety' | 'motivation' | 'self-care';
}

const inspirationalQuotes: QuoteData[] = [
  {
    text: "You are braver than you believe, stronger than you seem, and smarter than you think.",
    author: "A.A. Milne",
    category: "strength"
  },
  {
    text: "Your wellness journey is unique to you. Embrace every step forward.",
    category: "wellness"
  },
  {
    text: "Self-care is not selfish. You cannot serve from an empty vessel.",
    author: "Eleanor Brown",
    category: "self-care"
  },
  {
    text: "Trust your instincts. They're usually right, especially about your safety.",
    category: "safety"
  },
  {
    text: "You have been assigned this mountain to show others it can be moved.",
    author: "Mel Robbins",
    category: "motivation"
  },
  {
    text: "Your period is not a limitation, it's a reminder of your incredible strength.",
    category: "wellness"
  },
  {
    text: "Small daily improvements lead to stunning results over time.",
    category: "motivation"
  },
  {
    text: "You are your own safe space. Trust yourself.",
    category: "safety"
  },
  {
    text: "Taking care of yourself makes you stronger for everyone in your life.",
    category: "self-care"
  },
  {
    text: "Every woman's journey is sacred. Honor yours today.",
    category: "strength"
  },
  {
    text: "Your intuition is your superpower. Listen to it.",
    category: "safety"
  },
  {
    text: "Progress, not perfection. You're doing amazingly well.",
    category: "motivation"
  },
  {
    text: "Your body tells your story. Listen with compassion.",
    category: "wellness"
  },
  {
    text: "You belong in every space you enter. Own it.",
    category: "strength"
  },
  {
    text: "Rest is not a reward for completed work. It's a requirement for sustainable success.",
    category: "self-care"
  }
];

export default function DailyQuote() {
  const [currentQuote, setCurrentQuote] = useState<QuoteData>(inspirationalQuotes[0]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Get quote based on current date to ensure same quote per day
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    const quoteIndex = dayOfYear % inspirationalQuotes.length;
    setCurrentQuote(inspirationalQuotes[quoteIndex]);
  }, []);

  const refreshQuote = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * inspirationalQuotes.length);
      setCurrentQuote(inspirationalQuotes[randomIndex]);
      setIsRefreshing(false);
    }, 500);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'strength': return 'text-red-500';
      case 'wellness': return 'text-pink-500';
      case 'safety': return 'text-blue-500';
      case 'motivation': return 'text-purple-500';
      case 'self-care': return 'text-green-500';
      default: return 'text-primary';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'strength': return '💪';
      case 'wellness': return '🌸';
      case 'safety': return '🛡️';
      case 'motivation': return '⭐';
      case 'self-care': return '💝';
      default: return '✨';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 bg-gradient-to-r from-pink-50/50 to-purple-50/50 dark:from-pink-900/20 dark:to-purple-900/20 border border-primary/20"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Quote className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-foreground">Daily Inspiration</span>
          <span className="text-lg">{getCategoryIcon(currentQuote.category)}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshQuote}
          disabled={isRefreshing}
          className="rounded-xl p-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <motion.div
        key={currentQuote.text}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <blockquote className="text-foreground font-medium text-lg leading-relaxed mb-3">
          "{currentQuote.text}"
        </blockquote>
        
        {currentQuote.author && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">— {currentQuote.author}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between mt-3">
          <span className={`text-xs font-medium px-2 py-1 rounded-full bg-background/50 ${getCategoryColor(currentQuote.category)}`}>
            {currentQuote.category.replace('-', ' ')}
          </span>
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-yellow-500" />
            <span className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
