'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EnhancedReviewCard } from '@/components/review/enhanced-review-card';
import { ReviewCreationForm } from '@/components/review/review-creation-form';
import { EnhancedLeaderboard } from '@/components/ranking/enhanced-leaderboard';
import { AchievementShowcase } from '@/components/achievement/achievement-showcase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star, 
  Trophy, 
  Award, 
  MessageCircle,
  Plus,
  Sparkles,
  Crown,
  Zap,
  Heart,
  TrendingUp,
  Users,
  BarChart3
} from 'lucide-react';
import { 
  Review, 
  User, 
  DEFAULT_REVIEW_CATEGORIES 
} from '@/types/review-ranking';
import { reviewRankingService } from '@/lib/review-ranking-service';

export default function ReviewRankingShowcase() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('reviews');

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = () => {
    // Mock current user
    const mockCurrentUser: User = {
      id: 'current_user',
      username: 'current_user',
      displayName: 'You',
      avatar: '/placeholder-user-1.jpg',
      age: 28,
      location: 'New York',
      isVip: true,
      isVerified: true,
      joinDate: new Date('2023-01-15'),
      lastActive: new Date(),
      profileViews: 1250,
      totalTips: 850
    };

    // Mock users for demo
    const mockUsers: User[] = [
      {
        id: 'user_1',
        username: 'sophia_star',
        displayName: 'Sophia ⭐',
        avatar: '/placeholder-user-2.jpg',
        age: 25,
        location: 'Los Angeles',
        isVip: true,
        isVerified: true,
        joinDate: new Date('2023-03-20'),
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
        profileViews: 3200,
        totalTips: 1500
      },
      {
        id: 'user_2',
        username: 'alex_charm',
        displayName: 'Alex 💎',
        avatar: '/placeholder-user-3.jpg',
        age: 30,
        location: 'Miami',
        isVip: false,
        isVerified: true,
        joinDate: new Date('2023-02-10'),
        lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000),
        profileViews: 2100,
        totalTips: 750
      },
      {
        id: 'user_3',
        username: 'emma_elite',
        displayName: 'Emma 👑',
        avatar: '/placeholder-user-4.jpg',
        age: 27,
        location: 'Las Vegas',
        isVip: true,
        isVerified: true,
        joinDate: new Date('2023-01-05'),
        lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000),
        profileViews: 4500,
        totalTips: 2200
      }
    ];

    setCurrentUser(mockCurrentUser);
    setUsers(mockUsers);
    setSelectedUser(mockUsers[0] || null);

    // Load some sample reviews
    const sampleReviews = [
      reviewRankingService.getUserReviews('user_1').slice(0, 3),
      reviewRankingService.getUserReviews('user_2').slice(0, 2),
      reviewRankingService.getUserReviews('user_3').slice(0, 2)
    ].flat();

    setReviews(sampleReviews);
  };

  const handleCreateReview = (reviewData: any) => {
    const newReview = reviewRankingService.addReview(reviewData);
    setReviews(prev => [newReview, ...prev]);
    setShowCreateForm(false);
  };

  const handleHelpful = (reviewId: string) => {
    console.log('Marked review as helpful:', reviewId);
  };

  const handleReport = (reviewId: string) => {
    console.log('Reported review:', reviewId);
  };

  const handleReply = (reviewId: string) => {
    console.log('Reply to review:', reviewId);
  };

  const getReviewerUser = (reviewerId: string): User => {
    return users.find(u => u.id === reviewerId) || currentUser!;
  };

  const getRevieweeUser = (revieweeId: string): User => {
    return users.find(u => u.id === revieweeId) || currentUser!;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">
              Enhanced Review & Ranking System
            </h1>
          </div>
          
          <p className="text-xl text-gray-300 mb-6">
            Casino-style gamified reviews with multi-category ratings, achievements, and rewards
          </p>

          <div className="flex items-center justify-center space-x-4">
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              <Star className="h-4 w-4 mr-1" />
              Multi-Category Ratings
            </Badge>
            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
              <Trophy className="h-4 w-4 mr-1" />
              Dynamic Leaderboards
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              <Award className="h-4 w-4 mr-1" />
              Achievement System
            </Badge>
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              <Zap className="h-4 w-4 mr-1" />
              Casino Rewards
            </Badge>
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 border border-gray-700">
            <TabsTrigger value="reviews" className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4" />
              <span>Reviews</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center space-x-2">
              <Trophy className="h-4 w-4" />
              <span>Leaderboard</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center space-x-2">
              <Award className="h-4 w-4" />
              <span>Achievements</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                <MessageCircle className="h-6 w-6" />
                <span>Recent Reviews</span>
              </h2>
              
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Write Review
              </Button>
            </div>

            {/* Review Creation Form */}
            {showCreateForm && selectedUser && currentUser && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6"
              >
                <ReviewCreationForm
                  reviewee={selectedUser}
                  reviewer={currentUser}
                  interactionType="date"
                  onSubmit={handleCreateReview}
                  onCancel={() => setShowCreateForm(false)}
                />
              </motion.div>
            )}

            {/* User Selection */}
            <div className="flex items-center space-x-4 p-4 bg-gray-800/30 rounded-lg">
              <span className="text-white font-medium">Select user to review:</span>
              <div className="flex space-x-2">
                {users.map((user) => (
                  <Button
                    key={user.id}
                    variant={selectedUser?.id === user.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedUser(user)}
                    className="flex items-center space-x-2"
                  >
                    <span>{user.displayName}</span>
                    {user.isVip && <Crown className="h-3 w-3 text-yellow-500" />}
                  </Button>
                ))}
              </div>
            </div>

            {/* Reviews List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <EnhancedReviewCard
                    review={review}
                    reviewer={getReviewerUser(review.reviewerId)}
                    reviewee={getRevieweeUser(review.revieweeId)}
                    isHighlighted={review.overallRating >= 9}
                    showReward={Math.random() > 0.7}
                    onHelpful={handleHelpful}
                    onReport={handleReport}
                    onReply={handleReply}
                  />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <EnhancedLeaderboard />
            </motion.div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {currentUser && (
                <AchievementShowcase user={currentUser} />
              )}
            </motion.div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {/* Analytics Cards */}
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-6 rounded-lg border border-blue-500/30">
                <div className="flex items-center space-x-3 mb-4">
                  <MessageCircle className="h-8 w-8 text-blue-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Total Reviews</h3>
                    <p className="text-3xl font-bold text-blue-400">1,247</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span>+12% this week</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 p-6 rounded-lg border border-green-500/30">
                <div className="flex items-center space-x-3 mb-4">
                  <Star className="h-8 w-8 text-green-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Avg Rating</h3>
                    <p className="text-3xl font-bold text-green-400">8.4</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span>+0.3 this month</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-6 rounded-lg border border-purple-500/30">
                <div className="flex items-center space-x-3 mb-4">
                  <Users className="h-8 w-8 text-purple-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Active Users</h3>
                    <p className="text-3xl font-bold text-purple-400">892</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span>+8% this week</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 p-6 rounded-lg border border-yellow-500/30">
                <div className="flex items-center space-x-3 mb-4">
                  <Award className="h-8 w-8 text-yellow-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Achievements</h3>
                    <p className="text-3xl font-bold text-yellow-400">156</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span>+23 this week</span>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Features Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg border border-gray-600"
        >
          <h3 className="text-xl font-bold text-white mb-4">🎯 Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-300">
            <div className="flex items-start space-x-2">
              <Star className="h-4 w-4 text-yellow-500 mt-0.5" />
              <div>
                <strong>Multi-Category Ratings:</strong> Rate users on looks, personality, communication, and entertainment
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Sparkles className="h-4 w-4 text-purple-500 mt-0.5" />
              <div>
                <strong>MagicUI Effects:</strong> Animated beams, confetti, meteors, and border effects
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Trophy className="h-4 w-4 text-blue-500 mt-0.5" />
              <div>
                <strong>Dynamic Leaderboards:</strong> Real-time rankings with trend indicators
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Award className="h-4 w-4 text-green-500 mt-0.5" />
              <div>
                <strong>Achievement System:</strong> Unlock badges and rewards for milestones
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Zap className="h-4 w-4 text-orange-500 mt-0.5" />
              <div>
                <strong>Casino Integration:</strong> Scratch cards, coins, and gambling rewards
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Heart className="h-4 w-4 text-red-500 mt-0.5" />
              <div>
                <strong>Gamification:</strong> Streaks, confidence levels, and social features
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
