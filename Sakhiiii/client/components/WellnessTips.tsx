import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Brain, 
  Shield, 
  Sun, 
  Moon,
  Clock,
  Star,
  BookOpen,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface WellnessTip {
  id: string;
  category: 'safety' | 'mental-health' | 'physical-health' | 'self-care';
  title: string;
  content: string;
  duration?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  audioGuide?: boolean;
}

const wellnessTips: WellnessTip[] = [
  {
    id: '1',
    category: 'safety',
    title: 'Trust Your Instincts',
    content: 'Your intuition is a powerful safety tool. If something feels wrong, trust that feeling and remove yourself from the situation. Your gut instincts have evolved to protect you.',
    duration: '2 min read',
    difficulty: 'easy',
    tags: ['intuition', 'awareness', 'safety'],
    audioGuide: true,
  },
  {
    id: '2',
    category: 'mental-health',
    title: 'Breathing Exercise for Anxiety',
    content: '4-7-8 Breathing: Inhale for 4 counts, hold for 7, exhale for 8. This technique activates your parasympathetic nervous system and helps calm anxiety in stressful situations.',
    duration: '5 min practice',
    difficulty: 'easy',
    tags: ['breathing', 'anxiety', 'calm'],
    audioGuide: true,
  },
  {
    id: '3',
    category: 'physical-health',
    title: 'Walking Safely at Night',
    content: 'Stay alert and confident. Walk in well-lit areas, avoid headphones, keep your phone charged, and let someone know your route. Carry yourself with confidence - attackers often target those who appear vulnerable.',
    duration: '3 min read',
    difficulty: 'easy',
    tags: ['walking', 'night safety', 'confidence'],
  },
  {
    id: '4',
    category: 'self-care',
    title: 'Daily Affirmations for Strength',
    content: 'Start your day with: "I am strong, I am capable, I trust myself, I deserve respect and safety." Positive self-talk builds confidence and resilience.',
    duration: '5 min practice',
    difficulty: 'easy',
    tags: ['affirmations', 'confidence', 'self-worth'],
    audioGuide: true,
  },
  {
    id: '5',
    category: 'safety',
    title: 'Digital Safety Basics',
    content: 'Protect your online presence: Use strong passwords, enable two-factor authentication, be cautious about sharing location data, and regularly review your privacy settings on social media.',
    duration: '4 min read',
    difficulty: 'medium',
    tags: ['digital safety', 'privacy', 'social media'],
  },
  {
    id: '6',
    category: 'mental-health',
    title: 'Progressive Muscle Relaxation',
    content: 'Tense and release each muscle group for 5 seconds, starting from your toes and working up to your head. This technique helps reduce physical tension and anxiety.',
    duration: '10 min practice',
    difficulty: 'medium',
    tags: ['relaxation', 'stress relief', 'body awareness'],
    audioGuide: true,
  },
  {
    id: '7',
    category: 'physical-health',
    title: 'Basic Self-Defense Awareness',
    content: 'Remember: Your voice is your first weapon. Shout "FIRE!" instead of "HELP!" to get more attention. Aim for vulnerable spots: eyes, nose, throat, groin, knees. Run to safety immediately after.',
    duration: '6 min read',
    difficulty: 'medium',
    tags: ['self-defense', 'awareness', 'emergency'],
  },
  {
    id: '8',
    category: 'self-care',
    title: 'Creating a Support Network',
    content: 'Build relationships with trusted friends, family, neighbors, and colleagues. Share your regular routines with someone you trust. Having a support network is crucial for both everyday life and emergencies.',
    duration: '4 min read',
    difficulty: 'easy',
    tags: ['support', 'relationships', 'community'],
  },
];

const categories = [
  { value: 'all', label: 'All Tips', icon: BookOpen, color: 'bg-primary/20 text-primary' },
  { value: 'safety', label: 'Safety', icon: Shield, color: 'bg-safe/20 text-safe' },
  { value: 'mental-health', label: 'Mental Health', icon: Brain, color: 'bg-accent/20 text-accent' },
  { value: 'physical-health', label: 'Physical Health', icon: Heart, color: 'bg-sos/20 text-sos' },
  { value: 'self-care', label: 'Self Care', icon: Sun, color: 'bg-warning/20 text-warning' },
];

const TipCard = ({ tip, isExpanded, onToggle }: {
  tip: WellnessTip;
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'safety': return Shield;
      case 'mental-health': return Brain;
      case 'physical-health': return Heart;
      case 'self-care': return Sun;
      default: return BookOpen;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'safety': return 'bg-safe/20 text-safe border-safe/30';
      case 'mental-health': return 'bg-accent/20 text-accent border-accent/30';
      case 'physical-health': return 'bg-sos/20 text-sos border-sos/30';
      case 'self-care': return 'bg-warning/20 text-warning border-warning/30';
      default: return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-safe/20 text-safe border-safe/30';
      case 'medium': return 'bg-warning/20 text-warning border-warning/30';
      case 'hard': return 'bg-sos/20 text-sos border-sos/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const toggleAudio = () => {
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
      setAudioProgress(0);
    } else {
      setIsPlayingAudio(true);
      // Simulate audio progress
      const interval = setInterval(() => {
        setAudioProgress(prev => {
          if (prev >= 100) {
            setIsPlayingAudio(false);
            clearInterval(interval);
            return 0;
          }
          return prev + 2;
        });
      }, 100);
    }
  };

  const Icon = getCategoryIcon(tip.category);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-lg border border-pastel-pink/30 overflow-hidden"
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl ${getCategoryColor(tip.category)}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{tip.title}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={`text-xs border ${getCategoryColor(tip.category)}`}>
                  {tip.category.replace('-', ' ')}
                </Badge>
                <Badge className={`text-xs border ${getDifficultyColor(tip.difficulty)}`}>
                  {tip.difficulty}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {tip.audioGuide && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAudio}
                className="rounded-xl"
              >
                {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
            )}
            <div className="text-xs text-muted-foreground">
              <Clock className="w-3 h-3 inline mr-1" />
              {tip.duration}
            </div>
          </div>
        </div>

        {/* Audio Progress */}
        {tip.audioGuide && isPlayingAudio && (
          <div className="mb-3">
            <Progress value={audioProgress} className="h-1" />
            <p className="text-xs text-muted-foreground mt-1">Audio guide playing...</p>
          </div>
        )}

        {/* Preview */}
        <p className="text-sm text-muted-foreground mb-3">
          {isExpanded ? tip.content : `${tip.content.substring(0, 100)}...`}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {tip.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-muted/20 text-xs text-muted-foreground rounded-lg"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-full rounded-xl"
        >
          {isExpanded ? 'Show Less' : 'Read More'}
        </Button>
      </div>
    </motion.div>
  );
};

export default function WellnessTips() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedTip, setExpandedTip] = useState<string | null>(null);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('grid');

  const filteredTips = selectedCategory === 'all'
    ? wellnessTips
    : wellnessTips.filter(tip => tip.category === selectedCategory);

  const toggleTipExpansion = (tipId: string) => {
    setExpandedTip(expandedTip === tipId ? null : tipId);
  };

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % filteredTips.length);
  };

  const prevTip = () => {
    setCurrentTipIndex((prev) => (prev - 1 + filteredTips.length) % filteredTips.length);
  };

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Wellness & Safety Tips ❤️
        </h1>
        <p className="text-muted-foreground">
          Daily tips for your physical and mental well-being
        </p>
      </motion.div>

      {/* Daily Tip Highlight */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-accent/20 to-primary/20 rounded-3xl p-6 border border-primary/30"
      >
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Star className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Tip of the Day</h2>
            <Star className="w-6 h-6 text-primary" />
          </div>
          
          <h3 className="text-xl font-bold text-foreground mb-2">
            {wellnessTips[0].title}
          </h3>
          <p className="text-foreground/90 mb-4">
            {wellnessTips[0].content}
          </p>
          
          <Badge className="bg-safe/20 text-safe border-safe/30">
            ✨ Start your day with confidence
          </Badge>
        </div>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-foreground">Browse Tips</h3>
          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-xl"
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'carousel' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('carousel')}
              className="rounded-xl"
            >
              Cards
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
                className="rounded-2xl"
              >
                <Icon className="w-4 h-4 mr-2" />
                {category.label}
              </Button>
            );
          })}
        </div>
      </motion.div>

      {/* Tips Display */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-4"
          >
            {filteredTips.map((tip, index) => (
              <motion.div
                key={tip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TipCard
                  tip={tip}
                  isExpanded={expandedTip === tip.id}
                  onToggle={() => toggleTipExpansion(tip.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="carousel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Carousel Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevTip}
                className="rounded-xl"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {currentTipIndex + 1} of {filteredTips.length}
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={nextTip}
                className="rounded-xl"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Current Tip */}
            {filteredTips[currentTipIndex] && (
              <TipCard
                tip={filteredTips[currentTipIndex]}
                isExpanded={true}
                onToggle={() => {}}
              />
            )}

            {/* Progress Indicators */}
            <div className="flex justify-center space-x-2">
              {filteredTips.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTipIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentTipIndex ? 'bg-primary w-6' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center text-xs text-muted-foreground bg-muted/10 rounded-2xl p-4"
      >
        <p className="mb-1">💡 New tips added daily</p>
        <p>Remember: Small steps lead to big changes in your wellness journey</p>
      </motion.div>
    </div>
  );
}
