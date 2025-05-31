'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagicCard } from '@/components/magicui/magic-card';
import { Confetti } from '@/components/magicui/confetti';
import { ScratchToReveal } from '@/components/magicui/scratch-to-reveal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Star,
  Send,
  Camera,
  Gift,
  Sparkles,
  Coins,
  Award,
  Zap,
  Heart,
  Smile,
  MessageCircle,
  Gamepad2,
} from 'lucide-react';
import {
  Review,
  User,
  CategoryRating,
  DEFAULT_REVIEW_CATEGORIES,
  ReviewReward,
} from '@/types/review-ranking';
import { reviewRankingService } from '@/lib/review-ranking-service';
import { cn } from '@/lib/utils';

interface ReviewCreationFormProps {
  reviewee: User;
  reviewer: User;
  interactionType: 'date' | 'chat' | 'video_call' | 'casino_game' | 'tip_exchange';
  onSubmit: (
    review: Omit<
      Review,
      'id' | 'createdAt' | 'updatedAt' | 'helpfulVotes' | 'reportCount' | 'moderationStatus'
    >,
  ) => void;
  onCancel: () => void;
  className?: string;
}

export function ReviewCreationForm({
  reviewee,
  reviewer,
  interactionType,
  onSubmit,
  onCancel,
  className,
}: ReviewCreationFormProps) {
  const [categoryRatings, setCategoryRatings] = useState<CategoryRating[]>(
    DEFAULT_REVIEW_CATEGORIES.map(category => ({
      categoryId: category.id,
      rating: 5,
      confidence: 3,
    })),
  );

  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [reward, setReward] = useState<ReviewReward | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  const availableTags = [
    'funny',
    'sweet',
    'professional',
    'charming',
    'intelligent',
    'attractive',
    'kind',
    'entertaining',
    'creative',
    'adventurous',
    'romantic',
    'witty',
    'generous',
    'passionate',
    'mysterious',
  ];

  const updateCategoryRating = (categoryId: string, rating: number) => {
    setCategoryRatings(prev =>
      prev.map(cr => (cr.categoryId === categoryId ? { ...cr, rating } : cr)),
    );
  };

  const updateConfidence = (categoryId: string, confidence: number) => {
    setCategoryRatings(prev =>
      prev.map(cr => (cr.categoryId === categoryId ? { ...cr, confidence } : cr)),
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
  };

  const calculateOverallRating = () => {
    return categoryRatings.reduce((sum, cr, index) => {
      const category = DEFAULT_REVIEW_CATEGORIES[index];
      return sum + cr.rating * category.weight;
    }, 0);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const overallRating = calculateOverallRating();

    const reviewData: Omit<
      Review,
      'id' | 'createdAt' | 'updatedAt' | 'helpfulVotes' | 'reportCount' | 'moderationStatus'
    > = {
      reviewerId: reviewer.id,
      revieweeId: reviewee.id,
      overallRating,
      categoryRatings,
      comment,
      isAnonymous,
      isVerified: reviewer.isVerified,
      tags: selectedTags,
      interactionType,
    };

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate reward
    const generatedReward = reviewRankingService.generateReviewReward({
      ...reviewData,
      id: 'temp',
      createdAt: new Date(),
      updatedAt: new Date(),
      helpfulVotes: 0,
      reportCount: 0,
      moderationStatus: 'approved',
    });

    if (generatedReward) {
      setReward(generatedReward);
      setShowReward(true);
      setShowConfetti(true);

      // Hide confetti after 3 seconds
      setTimeout(() => setShowConfetti(false), 3000);
    }

    onSubmit(reviewData);
    setIsSubmitting(false);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-500';
    if (rating >= 6) return 'text-yellow-500';
    if (rating >= 4) return 'text-orange-500';
    return 'text-red-500';
  };

  const getInteractionIcon = () => {
    switch (interactionType) {
      case 'date':
        return Heart;
      case 'chat':
        return MessageCircle;
      case 'video_call':
        return Camera;
      case 'casino_game':
        return Gamepad2;
      case 'tip_exchange':
        return Gift;
      default:
        return Smile;
    }
  };

  const InteractionIcon = getInteractionIcon();

  return (
    <div className={cn('relative', className)}>
      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-50">
            <Confetti />
          </div>
        )}
      </AnimatePresence>

      <MagicCard
        className="p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700"
        gradientColor="#3b82f6"
        ref={formRef}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 ring-2 ring-blue-500">
              <AvatarImage src={reviewee.avatar} alt={reviewee.displayName} />
              <AvatarFallback>{reviewee.displayName.charAt(0)}</AvatarFallback>
            </Avatar>

            <div>
              <h3 className="text-xl font-bold text-white">Rate {reviewee.displayName}</h3>
              <div className="flex items-center space-x-2 text-gray-400">
                <InteractionIcon className="h-4 w-4" />
                <span className="capitalize">{interactionType.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold text-blue-400">
              {calculateOverallRating().toFixed(1)}
            </div>
            <div className="text-sm text-gray-400">Overall Rating</div>
          </div>
        </div>

        {/* Category Ratings */}
        <div className="space-y-4 mb-6">
          <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span>Category Ratings</span>
          </h4>

          {DEFAULT_REVIEW_CATEGORIES.map(category => {
            const categoryRating = categoryRatings.find(cr => cr.categoryId === category.id)!;

            return (
              <motion.div
                key={category.id}
                className="p-4 bg-gray-800/50 rounded-lg"
                whileHover={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h5 className="font-medium text-white">{category.name}</h5>
                      <p className="text-sm text-gray-400">{category.description}</p>
                    </div>
                  </div>

                  <div className={cn('text-2xl font-bold', getRatingColor(categoryRating.rating))}>
                    {categoryRating.rating.toFixed(1)}
                  </div>
                </div>

                {/* Rating Slider */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-300">Rating (1-10)</Label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.1"
                    value={categoryRating.rating}
                    onChange={e => updateCategoryRating(category.id, parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />

                  {/* Star Display */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: 10 }, (_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'h-4 w-4 cursor-pointer transition-colors',
                          i < categoryRating.rating
                            ? getRatingColor(categoryRating.rating)
                            : 'text-gray-600',
                        )}
                        fill={i < categoryRating.rating ? 'currentColor' : 'none'}
                        onClick={() => updateCategoryRating(category.id, i + 1)}
                      />
                    ))}
                  </div>
                </div>

                {/* Confidence Slider */}
                <div className="mt-3">
                  <Label className="text-sm text-gray-400">Confidence Level</Label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={categoryRating.confidence}
                    onChange={e => updateConfidence(category.id, parseInt(e.target.value))}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Not Sure</span>
                    <span>Very Confident</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Comment */}
        <div className="space-y-2 mb-6">
          <Label className="text-white">Your Review</Label>
          <Textarea
            placeholder="Share your experience..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="min-h-[100px] bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
          />
          <div className="text-sm text-gray-400">{comment.length}/500 characters</div>
        </div>

        {/* Tags */}
        <div className="space-y-3 mb-6">
          <Label className="text-white">Tags (optional)</Label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <motion.button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={cn(
                  'px-3 py-1 rounded-full text-sm transition-colors',
                  selectedTags.includes(tag)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                #{tag}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center justify-between mb-6 p-4 bg-gray-800/30 rounded-lg">
          <div className="flex items-center space-x-3">
            <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
            <Label className="text-white">Post anonymously</Label>
          </div>

          <Badge variant="outline" className="text-blue-400 border-blue-400">
            {reviewer.isVerified ? 'Verified Review' : 'Standard Review'}
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || comment.trim().length === 0}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {isSubmitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="h-4 w-4 mr-2" />
              </motion.div>
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      </MagicCard>

      {/* Reward Modal */}
      <AnimatePresence>
        {showReward && reward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowReward(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-900 p-8 rounded-2xl border border-gray-700 max-w-md mx-4"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              {reward.type === 'scratch_card' ? (
                <ScratchToReveal
                  width={300}
                  height={200}
                  className="mx-auto mb-4"
                  onComplete={() => {
                    setTimeout(() => setShowReward(false), 2000);
                  }}
                >
                  <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                    <Award className="h-12 w-12 mb-2" />
                    <div className="text-2xl font-bold">JACKPOT!</div>
                    <div className="text-lg">
                      +{reward.value} {reward.type}
                    </div>
                  </div>
                </ScratchToReveal>
              ) : (
                <div className="text-center">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{ duration: 1, repeat: 2 }}
                    className="mb-4"
                  >
                    {reward.type === 'coins' && (
                      <Coins className="h-16 w-16 text-yellow-500 mx-auto" />
                    )}
                    {reward.type === 'casino_chips' && (
                      <Zap className="h-16 w-16 text-purple-500 mx-auto" />
                    )}
                    {reward.type === 'vip_time' && (
                      <Award className="h-16 w-16 text-blue-500 mx-auto" />
                    )}
                  </motion.div>

                  <h3 className="text-2xl font-bold text-white mb-2">Reward Earned!</h3>
                  <p className="text-gray-300 mb-4">{reward.description}</p>
                  <div className="text-3xl font-bold text-yellow-500">
                    +{reward.value} {reward.type.replace('_', ' ')}
                  </div>

                  <Button
                    onClick={() => setShowReward(false)}
                    className="mt-6 bg-gradient-to-r from-yellow-500 to-orange-500"
                  >
                    Awesome!
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
