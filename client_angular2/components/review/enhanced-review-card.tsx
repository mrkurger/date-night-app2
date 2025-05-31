'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagicCard } from '@/components/magicui/magic-card';
import { Confetti } from '@/components/magicui/confetti';
import { AnimatedBeam } from '@/components/magicui/animated-beam';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Star, 
  Heart, 
  MessageCircle, 
  ThumbsUp, 
  Flag, 
  Award,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Crown,
  Verified,
  Eye,
  Gift
} from 'lucide-react';
import { Review, User, DEFAULT_REVIEW_CATEGORIES } from '@/types/review-ranking';
import { cn } from '@/lib/utils';

interface EnhancedReviewCardProps {
  review: Review;
  reviewer: User;
  reviewee: User;
  isHighlighted?: boolean;
  showReward?: boolean;
  onHelpful?: (reviewId: string) => void;
  onReport?: (reviewId: string) => void;
  onReply?: (reviewId: string) => void;
  className?: string;
}

export function EnhancedReviewCard({
  review,
  reviewer,
  reviewee,
  isHighlighted = false,
  showReward = false,
  onHelpful,
  onReport,
  onReply,
  className
}: EnhancedReviewCardProps) {
  const [isHelpfulClicked, setIsHelpfulClicked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const ratingRef = useRef<HTMLDivElement>(null);

  const handleHelpful = () => {
    if (!isHelpfulClicked) {
      setIsHelpfulClicked(true);
      setShowConfetti(true);
      onHelpful?.(review.id);
      
      // Hide confetti after 3 seconds
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-500';
    if (rating >= 6) return 'text-yellow-500';
    if (rating >= 4) return 'text-orange-500';
    return 'text-red-500';
  };

  const getRatingTrend = () => {
    // Mock trend calculation - in real app this would come from service
    const trend = Math.random();
    if (trend > 0.6) return { icon: TrendingUp, color: 'text-green-500', label: 'Trending Up' };
    if (trend < 0.4) return { icon: TrendingDown, color: 'text-red-500', label: 'Trending Down' };
    return { icon: Minus, color: 'text-gray-500', label: 'Stable' };
  };

  const trend = getRatingTrend();
  const TrendIcon = trend.icon;

  return (
    <div className={cn("relative", className)}>
      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-50">
            <Confetti />
          </div>
        )}
      </AnimatePresence>

      <MagicCard
        className={cn(
          "p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700",
          isHighlighted && "border-yellow-500/50 shadow-yellow-500/20 shadow-lg",
          review.isVerified && "border-blue-500/30"
        )}
        gradientColor={isHighlighted ? "#fbbf24" : "#374151"}
        ref={cardRef}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div ref={avatarRef}>
              <Avatar className="h-12 w-12 ring-2 ring-gray-600">
                <AvatarImage src={reviewer.avatar} alt={reviewer.displayName} />
                <AvatarFallback>{reviewer.displayName.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-white">{reviewer.displayName}</h4>
                {reviewer.isVerified && (
                  <Verified className="h-4 w-4 text-blue-500" />
                )}
                {reviewer.isVip && (
                  <Crown className="h-4 w-4 text-yellow-500" />
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                <Badge variant="outline" className="text-xs">
                  {review.interactionType.replace('_', ' ')}
                </Badge>
                {review.isVerified && (
                  <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-400">
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Overall Rating */}
          <div className="flex items-center space-x-2" ref={ratingRef}>
            <div className={cn("text-2xl font-bold", getRatingColor(review.overallRating))}>
              {review.overallRating.toFixed(1)}
            </div>
            <div className="flex flex-col items-center">
              <Star className={cn("h-5 w-5", getRatingColor(review.overallRating))} fill="currentColor" />
              <TrendIcon className={cn("h-3 w-3 mt-1", trend.color)} />
            </div>
          </div>
        </div>

        {/* Animated Beam connecting avatar to rating */}
        <AnimatedBeam
          containerRef={cardRef}
          fromRef={avatarRef}
          toRef={ratingRef}
          curvature={-20}
          duration={2}
          gradientStartColor="#3b82f6"
          gradientStopColor="#8b5cf6"
          pathOpacity={0.1}
        />

        {/* Category Ratings */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {review.categoryRatings.map((categoryRating) => {
            const category = DEFAULT_REVIEW_CATEGORIES.find(c => c.id === categoryRating.categoryId);
            if (!category) return null;

            return (
              <motion.div
                key={category.id}
                className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{category.icon}</span>
                  <span className="text-sm text-gray-300">{category.name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className={cn("font-semibold", getRatingColor(categoryRating.rating))}>
                    {categoryRating.rating.toFixed(1)}
                  </span>
                  <div className="flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3 w-3",
                          i < Math.floor(categoryRating.rating / 2) 
                            ? getRatingColor(categoryRating.rating)
                            : "text-gray-600"
                        )}
                        fill={i < Math.floor(categoryRating.rating / 2) ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Review Content */}
        <div className="mb-4">
          <motion.p 
            className="text-gray-300 leading-relaxed"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {isExpanded ? review.comment : `${review.comment.slice(0, 150)}${review.comment.length > 150 ? '...' : ''}`}
          </motion.p>
          
          {review.comment.length > 150 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-blue-400 hover:text-blue-300"
            >
              {isExpanded ? 'Show Less' : 'Read More'}
            </Button>
          )}
        </div>

        {/* Tags */}
        {review.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {review.tags.map((tag) => (
              <motion.div
                key={tag}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge 
                  variant="outline" 
                  className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30"
                >
                  #{tag}
                </Badge>
              </motion.div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={handleHelpful}
              className={cn(
                "flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors",
                isHelpfulClicked 
                  ? "bg-green-500/20 text-green-400" 
                  : "hover:bg-gray-700 text-gray-400"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isHelpfulClicked}
            >
              <ThumbsUp className={cn("h-4 w-4", isHelpfulClicked && "fill-current")} />
              <span className="text-sm">
                {review.helpfulVotes + (isHelpfulClicked ? 1 : 0)}
              </span>
            </motion.button>

            <motion.button
              onClick={() => onReply?.(review.id)}
              className="flex items-center space-x-2 px-3 py-1 rounded-lg hover:bg-gray-700 text-gray-400 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">Reply</span>
            </motion.button>

            {showReward && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-yellow-500/20 text-yellow-400"
              >
                <Gift className="h-4 w-4" />
                <span className="text-sm">+50 coins</span>
              </motion.div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {isHighlighted && (
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-5 w-5 text-yellow-500" />
              </motion.div>
            )}
            
            <motion.button
              onClick={() => onReport?.(review.id)}
              className="p-2 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Flag className="h-4 w-4" />
            </motion.button>
          </div>
        </div>

        {/* Achievement Badge for High Ratings */}
        {review.overallRating >= 9 && (
          <motion.div
            className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <Award className="h-4 w-4 text-white" />
          </motion.div>
        )}
      </MagicCard>
    </div>
  );
}
