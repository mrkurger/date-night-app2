'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagicCard } from '@/components/magicui/magic-card';
import { Confetti } from '@/components/magicui/confetti';
import { BorderBeam } from '@/components/magicui/border-beam';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Award,
  Star,
  Crown,
  Trophy,
  Medal,
  Zap,
  Heart,
  MessageCircle,
  Flame,
  Diamond,
  Gift,
  Lock,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import { Achievement, UserAchievement, User, DEFAULT_ACHIEVEMENTS } from '@/types/review-ranking';
import { reviewRankingService } from '@/lib/review-ranking-service';
import { cn } from '@/lib/utils';

interface AchievementShowcaseProps {
  user: User;
  className?: string;
}

export function AchievementShowcase({ user, className }: AchievementShowcaseProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);

  const loadAchievements = useCallback(() => {
    setAchievements(DEFAULT_ACHIEVEMENTS);
    const userAchievs = reviewRankingService.getUserAchievements(user.id);
    setUserAchievements(userAchievs);
  }, [user.id]);

  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'border-gray-500 bg-gray-500/10 text-gray-300';
      case 'rare':
        return 'border-blue-500 bg-blue-500/10 text-blue-300';
      case 'epic':
        return 'border-purple-500 bg-purple-500/10 text-purple-300';
      case 'legendary':
        return 'border-yellow-500 bg-yellow-500/10 text-yellow-300';
      default:
        return 'border-gray-500 bg-gray-500/10 text-gray-300';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'shadow-gray-500/20';
      case 'rare':
        return 'shadow-blue-500/30';
      case 'epic':
        return 'shadow-purple-500/40';
      case 'legendary':
        return 'shadow-yellow-500/50';
      default:
        return 'shadow-gray-500/20';
    }
  };

  const getAchievementIcon = (achievement: Achievement) => {
    switch (achievement.type) {
      case 'rating':
        return Star;
      case 'review':
        return MessageCircle;
      case 'streak':
        return Flame;
      case 'special':
        return Crown;
      default:
        return Award;
    }
  };

  const isUnlocked = (achievement: Achievement) => {
    return userAchievements.some(ua => ua.id === achievement.id);
  };

  const getProgress = (achievement: Achievement) => {
    // Mock progress calculation - in real app this would come from service
    if (isUnlocked(achievement)) return 100;

    const mockProgress = Math.random() * 100;
    return Math.min(mockProgress, 95); // Never show 100% unless unlocked
  };

  const handleAchievementClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);

    if (isUnlocked(achievement) && !newlyUnlocked.includes(achievement)) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const simulateUnlock = (achievement: Achievement) => {
    if (!isUnlocked(achievement)) {
      setUserAchievements(prev => [...prev, achievement]);
      setNewlyUnlocked(prev => [...prev, achievement]);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

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
        gradientColor="#374151"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Achievements</h2>
              <p className="text-gray-400">
                {userAchievements.length} of {achievements.length} unlocked
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-yellow-500">
              {Math.round((userAchievements.length / achievements.length) * 100)}%
            </div>
            <div className="text-sm text-gray-400">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <Progress
            value={(userAchievements.length / achievements.length) * 100}
            className="h-3 bg-gray-700"
          />
        </div>

        {/* Achievement Categories */}
        <div className="space-y-6">
          {['rating', 'review', 'streak', 'special'].map(type => {
            const categoryAchievements = achievements.filter(a => a.type === type);
            const unlockedCount = categoryAchievements.filter(a => isUnlocked(a)).length;

            return (
              <div key={type} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white capitalize">
                    {type} Achievements
                  </h3>
                  <Badge variant="outline" className="text-gray-400">
                    {unlockedCount}/{categoryAchievements.length}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryAchievements.map(achievement => {
                    const Icon = getAchievementIcon(achievement);
                    const unlocked = isUnlocked(achievement);
                    const progress = getProgress(achievement);
                    const isNew = newlyUnlocked.includes(achievement);

                    return (
                      <motion.div
                        key={achievement.id}
                        className="relative"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <MagicCard
                          className={cn(
                            'p-4 cursor-pointer transition-all duration-300',
                            unlocked
                              ? cn(
                                  getRarityColor(achievement.rarity),
                                  getRarityGlow(achievement.rarity),
                                )
                              : 'bg-gray-800/30 border-gray-600 opacity-60',
                            isNew && 'animate-pulse',
                          )}
                          gradientColor={unlocked ? '#fbbf24' : '#374151'}
                          onClick={() => handleAchievementClick(achievement)}
                        >
                          {/* Border beam for legendary achievements */}
                          {unlocked && achievement.rarity === 'legendary' && (
                            <BorderBeam size={200} duration={8} />
                          )}

                          <div className="flex items-start space-x-3">
                            <div
                              className={cn(
                                'p-2 rounded-full',
                                unlocked ? 'bg-yellow-500/20' : 'bg-gray-700',
                              )}
                            >
                              {unlocked ? (
                                <motion.div
                                  animate={
                                    isNew
                                      ? {
                                          scale: [1, 1.2, 1],
                                          rotate: [0, 10, -10, 0],
                                        }
                                      : {}
                                  }
                                  transition={{ duration: 1, repeat: isNew ? 3 : 0 }}
                                >
                                  <Icon
                                    className={cn(
                                      'h-6 w-6',
                                      unlocked ? 'text-yellow-500' : 'text-gray-500',
                                    )}
                                  />
                                </motion.div>
                              ) : (
                                <Lock className="h-6 w-6 text-gray-500" />
                              )}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4
                                  className={cn(
                                    'font-semibold',
                                    unlocked ? 'text-white' : 'text-gray-500',
                                  )}
                                >
                                  {achievement.name}
                                </h4>

                                {isNew && (
                                  <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 0.5, repeat: Infinity }}
                                  >
                                    <Sparkles className="h-4 w-4 text-yellow-500" />
                                  </motion.div>
                                )}
                              </div>

                              <p
                                className={cn(
                                  'text-sm mb-2',
                                  unlocked ? 'text-gray-300' : 'text-gray-500',
                                )}
                              >
                                {achievement.description}
                              </p>

                              <div className="flex items-center justify-between">
                                <Badge
                                  variant="outline"
                                  className={cn('text-xs', getRarityColor(achievement.rarity))}
                                >
                                  {achievement.rarity}
                                </Badge>

                                {achievement.reward && (
                                  <div className="flex items-center space-x-1 text-xs text-gray-400">
                                    <Gift className="h-3 w-3" />
                                    <span>
                                      {achievement.reward.value}{' '}
                                      {achievement.reward.type.replace('_', ' ')}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Progress Bar for Locked Achievements */}
                              {!unlocked && (
                                <div className="mt-3">
                                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                    <span>Progress</span>
                                    <span>{Math.round(progress)}%</span>
                                  </div>
                                  <Progress value={progress} className="h-1 bg-gray-700" />
                                </div>
                              )}
                            </div>
                          </div>
                        </MagicCard>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Demo Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => {
              const lockedAchievements = achievements.filter(a => !isUnlocked(a));
              if (lockedAchievements.length > 0) {
                const randomAchievement =
                  lockedAchievements[Math.floor(Math.random() * lockedAchievements.length)];
                simulateUnlock(randomAchievement);
              }
            }}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
          >
            <Zap className="h-4 w-4 mr-2" />
            Unlock Random Achievement (Demo)
          </Button>
        </div>
      </MagicCard>

      {/* Achievement Details Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedAchievement(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-900 p-6 rounded-2xl border border-gray-700 max-w-md w-full"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="text-center">
                <div
                  className={cn(
                    'w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center',
                    isUnlocked(selectedAchievement)
                      ? 'bg-yellow-500/20 border-2 border-yellow-500'
                      : 'bg-gray-700 border-2 border-gray-600',
                  )}
                >
                  {React.createElement(getAchievementIcon(selectedAchievement), {
                    className: cn(
                      'h-10 w-10',
                      isUnlocked(selectedAchievement) ? 'text-yellow-500' : 'text-gray-500',
                    ),
                  })}
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">{selectedAchievement.name}</h3>

                <p className="text-gray-300 mb-4">{selectedAchievement.description}</p>

                <div className="flex items-center justify-center space-x-4 mb-6">
                  <Badge className={cn('text-sm', getRarityColor(selectedAchievement.rarity))}>
                    {selectedAchievement.rarity}
                  </Badge>

                  {selectedAchievement.reward && (
                    <div className="flex items-center space-x-2 text-yellow-400">
                      <Gift className="h-4 w-4" />
                      <span>
                        {selectedAchievement.reward.value}{' '}
                        {selectedAchievement.reward.type.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Criteria */}
                <div className="bg-gray-800/50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-white mb-2">Requirements</h4>
                  <div className="text-sm text-gray-300">
                    {selectedAchievement.criteria.threshold && (
                      <div>Threshold: {selectedAchievement.criteria.threshold}</div>
                    )}
                    {selectedAchievement.criteria.timeframe && (
                      <div>Timeframe: {selectedAchievement.criteria.timeframe}</div>
                    )}
                    {selectedAchievement.criteria.category && (
                      <div>Category: {selectedAchievement.criteria.category}</div>
                    )}
                    {selectedAchievement.criteria.special && (
                      <div>Special: {selectedAchievement.criteria.special}</div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => setSelectedAchievement(null)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
