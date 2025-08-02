import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, ThumbsUp, AlertTriangle, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockCommunityPosts } from '@shared/mockData';
import { CommunityPost } from '@shared/types';
import { sampleDataService } from '@/services/sampleData';

const getIncidentColor = (type: string) => {
  switch (type) {
    case 'Eve-teasing':
      return 'bg-warning/20 text-warning border-warning/30';
    case 'Harassment':
      return 'bg-destructive/20 text-destructive border-destructive/30';
    case 'Stalking':
      return 'bg-sos/20 text-sos border-sos/30';
    default:
      return 'bg-muted/20 text-muted-foreground border-muted/30';
  }
};

const PostCard = ({ post }: { post: CommunityPost }) => {
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [upvotes, setUpvotes] = useState(post.upvotes);

  const handleUpvote = () => {
    if (isUpvoted) {
      setUpvotes(prev => prev - 1);
    } else {
      setUpvotes(prev => prev + 1);
    }
    setIsUpvoted(!isUpvoted);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-pastel-pink/30 space-y-3"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-foreground">
              {post.isAnonymous ? 'Anonymous User' : post.authorName}
            </h3>
            {post.isAnonymous && (
              <Badge variant="secondary" className="text-xs">
                Anonymous
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{post.timeAgo}</span>
          </div>
        </div>
        <Badge className={`text-xs border ${getIncidentColor(post.incidentType)}`}>
          {post.incidentType}
        </Badge>
      </div>

      {/* Location */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <MapPin className="w-4 h-4" />
        <span>{post.location}</span>
      </div>

      {/* Description */}
      {post.description && (
        <p className="text-foreground text-sm leading-relaxed">
          {post.description}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUpvote}
            className={`flex items-center space-x-1 ${
              isUpvoted ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${isUpvoted ? 'fill-current' : ''}`} />
            <span className="text-xs">{upvotes}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-1 text-muted-foreground"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs">{post.comments}</span>
          </Button>
        </div>
        
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
          Report
        </Button>
      </div>
    </motion.div>
  );
};

export default function CommunityFeed() {
  const [posts, setPosts] = useState<CommunityPost[]>(mockCommunityPosts);

  // Load sample incident data on mount
  useEffect(() => {
    const incidentReports = sampleDataService.getIncidentReports();

    // Convert incidents to community posts format
    const communityPosts: CommunityPost[] = incidentReports.map(incident => ({
      id: incident.id,
      type: incident.type,
      description: incident.description,
      location: incident.location.address,
      timeAgo: incident.timeAgo,
      author: incident.reportedBy,
      likes: incident.likes,
      comments: incident.comments,
      isVerified: incident.reportedBy !== 'Anonymous',
      isAnonymous: incident.reportedBy === 'Anonymous'
    }));

    // Mix with existing mock data and set posts
    setPosts([...communityPosts, ...mockCommunityPosts.slice(0, 2)]); // Keep only 2 mock posts

    console.log('✅ Community feed loaded with', communityPosts.length, 'real incidents');
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Community Feed 👥
        </h1>
        <p className="text-muted-foreground">
          Stay informed about safety incidents in your area
        </p>
      </motion.div>

      {/* Safety Alert */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-warning/20 to-orange-100 rounded-2xl p-4 border border-warning/30"
      >
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-6 h-6 text-warning" />
          <div>
            <h3 className="font-semibold text-foreground">Safety Alert</h3>
            <p className="text-sm text-muted-foreground">
              3 new incidents reported in your area today
            </p>
          </div>
        </div>
      </motion.div>

      {/* Post List */}
      <div className="space-y-4">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <PostCard post={post} />
          </motion.div>
        ))}
      </div>

      {/* Load More */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center pt-4"
      >
        <Button variant="outline" className="rounded-2xl">
          Load More Posts
        </Button>
      </motion.div>
    </div>
  );
}
