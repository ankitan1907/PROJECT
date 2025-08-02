import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Clock, Globe, Shield, Heart, AlertTriangle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockHelplines } from '@shared/mockData';
import { Helpline } from '@shared/types';

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'police':
      return Shield;
    case 'women-helpline':
      return Heart;
    case 'emergency':
      return AlertTriangle;
    case 'domestic-violence':
      return Home;
    case 'mental-health':
      return Heart;
    default:
      return Phone;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'police':
      return 'bg-primary/20 text-primary border-primary/30';
    case 'women-helpline':
      return 'bg-accent/20 text-accent border-accent/30';
    case 'emergency':
      return 'bg-sos/20 text-sos border-sos/30';
    case 'domestic-violence':
      return 'bg-warning/20 text-warning border-warning/30';
    case 'mental-health':
      return 'bg-pastel-purple/40 text-purple-700 border-purple-300';
    default:
      return 'bg-muted/20 text-muted-foreground border-muted/30';
  }
};

const HelplineCard = ({ helpline }: { helpline: Helpline }) => {
  const [isCallInProgress, setIsCallInProgress] = useState(false);
  const Icon = getCategoryIcon(helpline.category);

  const handleCall = () => {
    setIsCallInProgress(true);
    
    // In a real app, this would actually make a call
    console.log(`Calling ${helpline.name} at ${helpline.number}`);
    
    // Simulate call feedback
    setTimeout(() => {
      setIsCallInProgress(false);
    }, 2000);
    
    // For demo purposes, we'll just show an alert
    alert(`Calling ${helpline.name}\nNumber: ${helpline.number}\n\nIn a real app, this would dial the number.`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-pastel-pink/30"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl ${getCategoryColor(helpline.category)}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{helpline.name}</h3>
            <p className="text-lg font-mono text-primary">{helpline.number}</p>
          </div>
        </div>
        
        {helpline.available247 && (
          <Badge className="bg-safe/20 text-safe border-safe/30">
            24/7
          </Badge>
        )}
      </div>

      {/* Availability */}
      <div className="flex items-center space-x-2 mb-3 text-sm text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span>
          {helpline.available247 ? 'Available 24/7' : 'Business hours only'}
        </span>
      </div>

      {/* Languages */}
      <div className="flex items-center space-x-2 mb-4 text-sm text-muted-foreground">
        <Globe className="w-4 h-4" />
        <span>
          Languages: {helpline.languages.join(', ').toUpperCase()}
        </span>
      </div>

      {/* Call Button */}
      <Button
        onClick={handleCall}
        disabled={isCallInProgress}
        className="w-full bg-gradient-to-r from-safe to-green-500 hover:from-safe/90 hover:to-green-500/90 text-white rounded-2xl py-6 text-base font-medium transition-all duration-300"
      >
        {isCallInProgress ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Calling...
          </>
        ) : (
          <>
            <Phone className="w-5 h-5 mr-2" />
            Call Now
          </>
        )}
      </Button>
    </motion.div>
  );
};

export default function HelplineDirectory() {
  const [helplines] = useState<Helpline[]>(mockHelplines);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'women-helpline', label: 'Women Support' },
    { value: 'police', label: 'Police' },
    { value: 'domestic-violence', label: 'Domestic Violence' },
    { value: 'mental-health', label: 'Mental Health' },
  ];

  const filteredHelplines = selectedCategory === 'all' 
    ? helplines 
    : helplines.filter(h => h.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Emergency Helplines 📞
        </h1>
        <p className="text-muted-foreground">
          Quick access to emergency and support numbers
        </p>
      </motion.div>

      {/* Emergency Warning */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-sos/20 to-red-100 rounded-2xl p-4 border border-sos/30"
      >
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-6 h-6 text-sos" />
          <div>
            <h3 className="font-semibold text-foreground">Emergency Alert</h3>
            <p className="text-sm text-muted-foreground">
              In immediate danger? Call 100 (Police) or 108 (Medical Emergency)
            </p>
          </div>
        </div>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap gap-2"
      >
        {categories.map((category) => (
          <Button
            key={category.value}
            variant={selectedCategory === category.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.value)}
            className="rounded-2xl"
          >
            {category.label}
          </Button>
        ))}
      </motion.div>

      {/* Helplines List */}
      <div className="grid gap-4">
        {filteredHelplines.map((helpline, index) => (
          <motion.div
            key={helpline.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            <HelplineCard helpline={helpline} />
          </motion.div>
        ))}
      </div>

      {/* Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center text-xs text-muted-foreground bg-muted/20 rounded-2xl p-4"
      >
        <p>
          📋 Keep these numbers saved in your phone for quick access
        </p>
        <p className="mt-1">
          🔒 All calls are confidential and free of charge
        </p>
      </motion.div>
    </div>
  );
}
