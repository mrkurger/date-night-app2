'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagicCard } from '@/components/magicui/magic-card';
import { Meteors } from '@/components/magicui/meteors';
import { BorderBeam } from '@/components/magicui/border-beam';
import { NumberTicker } from '@/components/magicui/number-ticker';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  Flame,
  Zap,
  Diamond,
  Heart,
  Eye,
  MessageCircle,
  Gift,
  Gamepad2,
  Filter,
  RefreshCw,
} from 'lucide-react';
import {
  LeaderboardEntry,
  LeaderboardFilters,
  DEFAULT_RANKING_CATEGORIES,
} from '@/types/review-ranking';
import { reviewRankingService } from '@/lib/review-ranking-service';
import { cn } from '@/lib/utils';

interface EnhancedLeaderboardProps {
  className?: string;
}

export function EnhancedLeaderboard({ className }: EnhancedLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<LeaderboardFilters>({
    category: 'overall',
    timeframe: 'monthly',
    userType: 'all',
    minReviews: 5,
  });
  const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const data = reviewRankingService.getLeaderboard(filters);
    setLeaderboard(data);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/20' };
      case 2:
        return { icon: Medal, color: 'text-gray-400', bg: 'bg-gray-400/20' };
      case 3:
        return { icon: Award, color: 'text-amber-600', bg: 'bg-amber-600/20' };
      default:
        return { icon: Star, color: 'text-blue-500', bg: 'bg-blue-500/20' };
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return { icon: TrendingUp, color: 'text-green-500' };
      case 'down':
        return { icon: TrendingDown, color: 'text-red-500' };
      case 'new':
        return { icon: Zap, color: 'text-purple-500' };
      default:
        return { icon: Minus, color: 'text-gray-500' };
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = DEFAULT_RANKING_CATEGORIES.find(c => c.id === categoryId);
    switch (categoryId) {
      case 'overall':
        return Star;
      case 'looks':
        return Diamond;
      case 'personality':
        return Heart;
      case 'popular':
        return Flame;
      case 'casino_champion':
        return Gamepad2;
      default:
        return Star;
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 60) return 'text-yellow-500';
    if (percentage >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <Meteors number={20} />
      </div>

      <MagicCard
        className="relative z-10 p-6 bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700"
        gradientColor="#1f2937"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
              <p className="text-gray-400">Top performers this {filters.timeframe}</p>
            </div>
          </div>

          <Button onClick={loadLeaderboard} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-800/50 rounded-lg">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Category</label>
            <Select
              value={filters.category}
              onValueChange={value => setFilters(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEFAULT_RANKING_CATEGORIES.map(category => {
                  const Icon = getCategoryIcon(category.id);
                  return (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Timeframe</label>
            <Select
              value={filters.timeframe}
              onValueChange={(value: any) => setFilters(prev => ({ ...prev, timeframe: value }))}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="all_time">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">User Type</label>
            <Select
              value={filters.userType}
              onValueChange={(value: any) => setFilters(prev => ({ ...prev, userType: value }))}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="vip">VIP Only</SelectItem>
                <SelectItem value="verified">Verified Only</SelectItem>
                <SelectItem value="new">New Users</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Min Reviews</label>
            <Select
              value={filters.minReviews?.toString()}
              onValueChange={value =>
                setFilters(prev => ({ ...prev, minReviews: parseInt(value) }))
              }
            >
              <SelectTrigger className="bg-gray-700 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="5">5+</SelectItem>
                <SelectItem value="10">10+</SelectItem>
                <SelectItem value="25">25+</SelectItem>
                <SelectItem value="50">50+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="space-y-3">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-12"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  </motion.div>
                  <p className="text-gray-400">Loading leaderboard...</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {leaderboard.map((entry, index) => {
                  const rankInfo = getRankIcon(entry.ranking.rank);
                  const trendInfo = getTrendIcon(entry.ranking.trend);
                  const RankIcon = rankInfo.icon;
                  const TrendIcon = trendInfo.icon;
                  const maxScore = Math.max(...leaderboard.map(e => e.ranking.score));

                  return (
                    <motion.div
                      key={entry.user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative"
                    >
                      <MagicCard
                        className={cn(
                          'p-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 border-gray-600 cursor-pointer transition-all duration-300',
                          entry.ranking.rank <= 3 && 'border-yellow-500/30',
                          selectedEntry?.user.id === entry.user.id && 'ring-2 ring-blue-500',
                        )}
                        gradientColor={entry.ranking.rank <= 3 ? '#fbbf24' : '#374151'}
                        onClick={() => setSelectedEntry(entry)}
                      >
                        {/* Border beam for top 3 */}
                        {entry.ranking.rank <= 3 && <BorderBeam size={250} duration={12} />}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {/* Rank */}
                            <div
                              className={cn(
                                'flex items-center justify-center w-12 h-12 rounded-full',
                                rankInfo.bg,
                              )}
                            >
                              <RankIcon className={cn('h-6 w-6', rankInfo.color)} />
                            </div>

                            {/* User Info */}
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-12 w-12 ring-2 ring-gray-600">
                                <AvatarImage src={entry.user.avatar} alt={entry.user.displayName} />
                                <AvatarFallback>{entry.user.displayName.charAt(0)}</AvatarFallback>
                              </Avatar>

                              <div>
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-semibold text-white">
                                    {entry.user.displayName}
                                  </h4>
                                  {entry.user.isVerified && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs bg-blue-500/20 text-blue-400"
                                    >
                                      Verified
                                    </Badge>
                                  )}
                                  {entry.user.isVip && (
                                    <Crown className="h-4 w-4 text-yellow-500" />
                                  )}
                                </div>

                                <div className="flex items-center space-x-4 text-sm text-gray-400">
                                  <span className="flex items-center space-x-1">
                                    <Star className="h-3 w-3" />
                                    <span>{entry.stats.averageRating.toFixed(1)}</span>
                                  </span>
                                  <span className="flex items-center space-x-1">
                                    <MessageCircle className="h-3 w-3" />
                                    <span>{entry.stats.totalReviews}</span>
                                  </span>
                                  <span className="flex items-center space-x-1">
                                    <Eye className="h-3 w-3" />
                                    <span>{entry.user.profileViews}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Score and Trend */}
                          <div className="text-right">
                            <div className="flex items-center space-x-2 mb-1">
                              <NumberTicker
                                value={entry.ranking.score}
                                className={cn(
                                  'text-2xl font-bold',
                                  getScoreColor(entry.ranking.score, maxScore),
                                )}
                              />
                              <TrendIcon className={cn('h-4 w-4', trendInfo.color)} />
                            </div>

                            <div className="text-sm text-gray-400">
                              Rank #{entry.ranking.rank}
                              {entry.ranking.previousRank && (
                                <span className="ml-1">(was #{entry.ranking.previousRank})</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Achievements */}
                        {entry.achievements.length > 0 && (
                          <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-600">
                            <Award className="h-4 w-4 text-yellow-500" />
                            <div className="flex space-x-1">
                              {entry.achievements.slice(0, 3).map(achievement => (
                                <Badge
                                  key={achievement.id}
                                  variant="outline"
                                  className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                >
                                  {achievement.icon} {achievement.name}
                                </Badge>
                              ))}
                              {entry.achievements.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{entry.achievements.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Streak Info */}
                        {entry.streak && entry.streak.currentStreak > 0 && (
                          <div className="flex items-center space-x-2 mt-2">
                            <Flame className="h-4 w-4 text-orange-500" />
                            <span className="text-sm text-orange-400">
                              {entry.streak.currentStreak} day streak
                            </span>
                            <span className="text-xs text-gray-500">
                              ({entry.streak.streakType})
                            </span>
                          </div>
                        )}
                      </MagicCard>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {!loading && leaderboard.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Rankings Found</h3>
            <p className="text-gray-500">Try adjusting your filters to see more results.</p>
          </motion.div>
        )}
      </MagicCard>

      {/* Selected User Details Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedEntry(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-900 p-6 rounded-2xl border border-gray-700 max-w-md w-full"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <Avatar className="h-20 w-20 mx-auto mb-4 ring-4 ring-blue-500">
                  <AvatarImage
                    src={selectedEntry.user.avatar}
                    alt={selectedEntry.user.displayName}
                  />
                  <AvatarFallback>{selectedEntry.user.displayName.charAt(0)}</AvatarFallback>
                </Avatar>

                <h3 className="text-2xl font-bold text-white mb-2">
                  {selectedEntry.user.displayName}
                </h3>
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Badge className="bg-yellow-500/20 text-yellow-400">
                    Rank #{selectedEntry.ranking.rank}
                  </Badge>
                  {selectedEntry.user.isVip && (
                    <Badge className="bg-purple-500/20 text-purple-400">VIP</Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-500">
                    {selectedEntry.stats.averageRating.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-400">Avg Rating</div>
                </div>

                <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-500">
                    {selectedEntry.stats.totalReviews}
                  </div>
                  <div className="text-sm text-gray-400">Reviews</div>
                </div>

                <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-500">
                    {selectedEntry.user.profileViews}
                  </div>
                  <div className="text-sm text-gray-400">Views</div>
                </div>

                <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-500">
                    {selectedEntry.achievements.length}
                  </div>
                  <div className="text-sm text-gray-400">Achievements</div>
                </div>
              </div>

              <Button
                onClick={() => setSelectedEntry(null)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
