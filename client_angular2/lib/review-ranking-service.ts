import {
  User,
  Review,
  ReviewStats,
  UserRanking,
  Achievement,
  UserAchievement,
  ReviewStreak,
  LeaderboardEntry,
  LeaderboardFilters,
  ReviewReward,
  CasinoIntegration,
  ReviewAnalytics,
  DEFAULT_REVIEW_CATEGORIES,
  DEFAULT_RANKING_CATEGORIES,
  DEFAULT_ACHIEVEMENTS,
  CategoryRating
} from '@/types/review-ranking';

class ReviewRankingService {
  private reviews: Review[] = [];
  private users: User[] = [];
  private rankings: UserRanking[] = [];
  private achievements: Achievement[] = DEFAULT_ACHIEVEMENTS;
  private userAchievements: UserAchievement[] = [];
  private streaks: ReviewStreak[] = [];
  private casinoData: CasinoIntegration[] = [];
  private subscribers: ((data: any) => void)[] = [];

  constructor() {
    this.initializeMockData();
    this.startRealTimeUpdates();
  }

  // Subscribe to updates
  subscribe(callback: (data: any) => void): () => void {
    this.subscribers.push(callback);
    callback({ reviews: this.reviews, rankings: this.rankings });
    
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  // Get user reviews
  getUserReviews(userId: string): Review[] {
    return this.reviews.filter(r => r.revieweeId === userId && r.moderationStatus === 'approved');
  }

  // Get reviews by user
  getReviewsByUser(userId: string): Review[] {
    return this.reviews.filter(r => r.reviewerId === userId);
  }

  // Get user stats
  getUserStats(userId: string): ReviewStats {
    const userReviews = this.getUserReviews(userId);
    
    if (userReviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        categoryAverages: {},
        ratingDistribution: {},
        recentTrend: 'stable',
        verifiedReviewsCount: 0,
        helpfulReviewsCount: 0
      };
    }

    const totalRating = userReviews.reduce((sum, r) => sum + r.overallRating, 0);
    const averageRating = totalRating / userReviews.length;

    // Calculate category averages
    const categoryAverages: { [categoryId: string]: number } = {};
    DEFAULT_REVIEW_CATEGORIES.forEach(category => {
      const categoryRatings = userReviews.flatMap(r => 
        r.categoryRatings.filter(cr => cr.categoryId === category.id)
      );
      if (categoryRatings.length > 0) {
        categoryAverages[category.id] = categoryRatings.reduce((sum, cr) => sum + cr.rating, 0) / categoryRatings.length;
      }
    });

    // Calculate rating distribution
    const ratingDistribution: { [rating: number]: number } = {};
    for (let i = 1; i <= 10; i++) {
      ratingDistribution[i] = userReviews.filter(r => Math.floor(r.overallRating) === i).length;
    }

    // Calculate trend (simplified)
    const recentReviews = userReviews.slice(-5);
    const olderReviews = userReviews.slice(-10, -5);
    const recentAvg = recentReviews.reduce((sum, r) => sum + r.overallRating, 0) / recentReviews.length;
    const olderAvg = olderReviews.length > 0 ? olderReviews.reduce((sum, r) => sum + r.overallRating, 0) / olderReviews.length : recentAvg;
    
    let recentTrend: 'up' | 'down' | 'stable' = 'stable';
    if (recentAvg > olderAvg + 0.2) recentTrend = 'up';
    else if (recentAvg < olderAvg - 0.2) recentTrend = 'down';

    return {
      totalReviews: userReviews.length,
      averageRating,
      categoryAverages,
      ratingDistribution,
      recentTrend,
      verifiedReviewsCount: userReviews.filter(r => r.isVerified).length,
      helpfulReviewsCount: userReviews.filter(r => r.helpfulVotes > 5).length
    };
  }

  // Add new review
  addReview(review: Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'helpfulVotes' | 'reportCount' | 'moderationStatus'>): Review {
    const newReview: Review = {
      ...review,
      id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      helpfulVotes: 0,
      reportCount: 0,
      moderationStatus: 'approved' // Auto-approve for demo
    };

    this.reviews.unshift(newReview);
    this.updateRankings();
    this.checkAchievements(review.revieweeId);
    this.updateStreaks(review.reviewerId);
    this.notifySubscribers();

    return newReview;
  }

  // Get leaderboard
  getLeaderboard(filters: LeaderboardFilters): LeaderboardEntry[] {
    let filteredUsers = [...this.users];

    // Apply filters
    if (filters.location) {
      filteredUsers = filteredUsers.filter(u => u.location.includes(filters.location!));
    }

    if (filters.ageRange) {
      filteredUsers = filteredUsers.filter(u => 
        u.age >= filters.ageRange![0] && u.age <= filters.ageRange![1]
      );
    }

    if (filters.userType && filters.userType !== 'all') {
      switch (filters.userType) {
        case 'vip':
          filteredUsers = filteredUsers.filter(u => u.isVip);
          break;
        case 'verified':
          filteredUsers = filteredUsers.filter(u => u.isVerified);
          break;
        case 'new':
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          filteredUsers = filteredUsers.filter(u => u.joinDate > thirtyDaysAgo);
          break;
      }
    }

    // Get rankings for filtered users
    const leaderboard: LeaderboardEntry[] = filteredUsers.map(user => {
      const ranking = this.rankings.find(r => r.userId === user.id && r.categoryId === filters.category);
      const stats = this.getUserStats(user.id);
      const userAchievements = this.userAchievements
        .filter(ua => ua.userId === user.id)
        .map(ua => this.achievements.find(a => a.id === ua.achievementId)!)
        .filter(Boolean);
      const streak = this.streaks.find(s => s.userId === user.id);

      return {
        user,
        ranking: ranking || {
          userId: user.id,
          categoryId: filters.category,
          rank: 999,
          score: 0,
          trend: 'stable',
          achievements: []
        },
        stats,
        achievements: userAchievements,
        streak
      };
    });

    // Filter by minimum reviews
    if (filters.minReviews) {
      return leaderboard.filter(entry => entry.stats.totalReviews >= filters.minReviews!);
    }

    // Sort by ranking
    return leaderboard
      .filter(entry => entry.ranking.rank < 999)
      .sort((a, b) => a.ranking.rank - b.ranking.rank)
      .slice(0, 100); // Top 100
  }

  // Get user achievements
  getUserAchievements(userId: string): Achievement[] {
    return this.userAchievements
      .filter(ua => ua.userId === userId)
      .map(ua => this.achievements.find(a => a.id === ua.achievementId)!)
      .filter(Boolean);
  }

  // Generate review reward
  generateReviewReward(review: Review): ReviewReward | null {
    const rewards: ReviewReward[] = [
      {
        id: 'basic_coins',
        type: 'coins',
        value: 50,
        description: 'Basic review reward',
        rarity: 'common',
        animation: 'coin_shower',
        conditions: { minRating: 1 }
      },
      {
        id: 'quality_bonus',
        type: 'coins',
        value: 100,
        description: 'Quality review bonus',
        rarity: 'rare',
        animation: 'golden_coins',
        conditions: { minRating: 8, reviewLength: 100 }
      },
      {
        id: 'verified_bonus',
        type: 'casino_chips',
        value: 25,
        description: 'Verified reviewer bonus',
        rarity: 'epic',
        animation: 'chip_stack',
        conditions: { isVerified: true, minRating: 7 }
      },
      {
        id: 'streak_jackpot',
        type: 'scratch_card',
        value: 1,
        description: 'Streak jackpot scratch card',
        rarity: 'legendary',
        animation: 'jackpot_lights',
        conditions: { streakBonus: true, minRating: 9 }
      }
    ];

    // Check which rewards apply
    const applicableRewards = rewards.filter(reward => {
      const conditions = reward.conditions;
      
      if (conditions.minRating && review.overallRating < conditions.minRating) return false;
      if (conditions.reviewLength && review.comment.length < conditions.reviewLength) return false;
      if (conditions.isVerified && !review.isVerified) return false;
      if (conditions.streakBonus) {
        const streak = this.streaks.find(s => s.userId === review.reviewerId);
        if (!streak || streak.currentStreak < 5) return false;
      }
      
      return true;
    });

    // Return highest rarity reward
    if (applicableRewards.length === 0) return null;
    
    const rarityOrder = ['common', 'rare', 'epic', 'legendary'];
    applicableRewards.sort((a, b) => 
      rarityOrder.indexOf(b.rarity) - rarityOrder.indexOf(a.rarity)
    );

    return applicableRewards[0];
  }

  // Get analytics
  getAnalytics(): ReviewAnalytics {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const reviewsToday = this.reviews.filter(r => r.createdAt >= today).length;
    const reviewsThisWeek = this.reviews.filter(r => r.createdAt >= weekAgo).length;

    // Get top reviewers (most reviews given)
    const reviewerCounts = this.reviews.reduce((acc, review) => {
      acc[review.reviewerId] = (acc[review.reviewerId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topReviewers = Object.entries(reviewerCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([userId]) => this.users.find(u => u.id === userId)!)
      .filter(Boolean);

    // Get top rated users
    const topRated = this.users
      .map(user => ({ user, stats: this.getUserStats(user.id) }))
      .filter(({ stats }) => stats.totalReviews >= 5)
      .sort((a, b) => b.stats.averageRating - a.stats.averageRating)
      .slice(0, 10)
      .map(({ user }) => user);

    // Category trends (simplified)
    const categoryTrends: { [categoryId: string]: number } = {};
    DEFAULT_REVIEW_CATEGORIES.forEach(category => {
      const recentRatings = this.reviews
        .filter(r => r.createdAt >= weekAgo)
        .flatMap(r => r.categoryRatings.filter(cr => cr.categoryId === category.id));
      
      if (recentRatings.length > 0) {
        categoryTrends[category.id] = recentRatings.reduce((sum, cr) => sum + cr.rating, 0) / recentRatings.length;
      }
    });

    // Sentiment analysis (simplified)
    const positiveWords = ['great', 'amazing', 'wonderful', 'fantastic', 'excellent', 'love', 'perfect'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'worst', 'disappointing'];

    let positive = 0, negative = 0, neutral = 0;
    this.reviews.forEach(review => {
      const comment = review.comment.toLowerCase();
      const hasPositive = positiveWords.some(word => comment.includes(word));
      const hasNegative = negativeWords.some(word => comment.includes(word));
      
      if (hasPositive && !hasNegative) positive++;
      else if (hasNegative && !hasPositive) negative++;
      else neutral++;
    });

    return {
      totalReviews: this.reviews.length,
      averageRating: this.reviews.reduce((sum, r) => sum + r.overallRating, 0) / this.reviews.length,
      reviewsToday,
      reviewsThisWeek,
      topReviewers,
      topRated,
      categoryTrends,
      sentimentAnalysis: { positive, neutral, negative },
      moderationStats: {
        pending: this.reviews.filter(r => r.moderationStatus === 'pending').length,
        approved: this.reviews.filter(r => r.moderationStatus === 'approved').length,
        rejected: this.reviews.filter(r => r.moderationStatus === 'rejected').length,
        flagged: this.reviews.filter(r => r.moderationStatus === 'flagged').length
      }
    };
  }

  // Private methods
  private initializeMockData(): void {
    // Create mock users
    this.users = Array.from({ length: 50 }, (_, i) => ({
      id: `user_${i + 1}`,
      username: `user${i + 1}`,
      displayName: `User ${i + 1}`,
      avatar: `/placeholder-user-${(i % 10) + 1}.jpg`,
      age: 20 + Math.floor(Math.random() * 30),
      location: ['New York', 'Los Angeles', 'Chicago', 'Miami', 'Las Vegas'][Math.floor(Math.random() * 5)],
      isVip: Math.random() > 0.8,
      isVerified: Math.random() > 0.6,
      joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      profileViews: Math.floor(Math.random() * 10000),
      totalTips: Math.floor(Math.random() * 5000)
    }));

    // Create mock reviews
    this.generateMockReviews();
    this.updateRankings();
    this.generateMockAchievements();
    this.generateMockStreaks();
  }

  private generateMockReviews(): void {
    for (let i = 0; i < 200; i++) {
      const reviewerId = this.users[Math.floor(Math.random() * this.users.length)].id;
      const revieweeId = this.users[Math.floor(Math.random() * this.users.length)].id;
      
      if (reviewerId === revieweeId) continue;

      const categoryRatings: CategoryRating[] = DEFAULT_REVIEW_CATEGORIES.map(category => ({
        categoryId: category.id,
        rating: 1 + Math.random() * 9,
        confidence: 1 + Math.random() * 4
      }));

      const overallRating = categoryRatings.reduce((sum, cr, index) => 
        sum + cr.rating * DEFAULT_REVIEW_CATEGORIES[index].weight, 0
      );

      this.reviews.push({
        id: `review_${i + 1}`,
        reviewerId,
        revieweeId,
        overallRating,
        categoryRatings,
        comment: this.generateMockComment(overallRating),
        isAnonymous: Math.random() > 0.7,
        isVerified: Math.random() > 0.5,
        helpfulVotes: Math.floor(Math.random() * 20),
        reportCount: Math.floor(Math.random() * 3),
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        moderationStatus: 'approved',
        tags: this.generateMockTags(),
        interactionType: ['date', 'chat', 'video_call', 'casino_game', 'tip_exchange'][Math.floor(Math.random() * 5)] as any
      });
    }
  }

  private generateMockComment(rating: number): string {
    const comments = {
      high: [
        "Amazing experience! Highly recommended.",
        "Absolutely wonderful person, great conversation.",
        "Perfect date, couldn't ask for better!",
        "Fantastic personality and very attractive.",
        "Best interaction I've had on this platform!"
      ],
      medium: [
        "Good experience overall, would recommend.",
        "Nice person, enjoyable conversation.",
        "Pleasant interaction, nothing special.",
        "Decent experience, met expectations.",
        "Good time, would chat again."
      ],
      low: [
        "Not what I expected, disappointing.",
        "Below average experience.",
        "Could be better, not impressed.",
        "Mediocre interaction, wouldn't repeat.",
        "Not recommended, poor experience."
      ]
    };

    if (rating >= 7) return comments.high[Math.floor(Math.random() * comments.high.length)];
    if (rating >= 4) return comments.medium[Math.floor(Math.random() * comments.medium.length)];
    return comments.low[Math.floor(Math.random() * comments.low.length)];
  }

  private generateMockTags(): string[] {
    const allTags = ['funny', 'sweet', 'professional', 'charming', 'intelligent', 'attractive', 'kind', 'entertaining'];
    const numTags = Math.floor(Math.random() * 4) + 1;
    return allTags.sort(() => 0.5 - Math.random()).slice(0, numTags);
  }

  private updateRankings(): void {
    DEFAULT_RANKING_CATEGORIES.forEach(category => {
      const userScores = this.users.map(user => {
        const stats = this.getUserStats(user.id);
        let score = 0;

        switch (category.id) {
          case 'overall':
            score = stats.averageRating * Math.log(stats.totalReviews + 1);
            break;
          case 'looks':
            score = stats.categoryAverages['looks'] || 0;
            break;
          case 'personality':
            score = stats.categoryAverages['personality'] || 0;
            break;
          case 'popular':
            score = user.profileViews * 0.001 + user.totalTips * 0.01;
            break;
          case 'casino_champion':
            score = Math.random() * 1000; // Mock casino score
            break;
        }

        return { userId: user.id, score };
      });

      userScores.sort((a, b) => b.score - a.score);

      userScores.forEach((userScore, index) => {
        const existingRanking = this.rankings.find(r => r.userId === userScore.userId && r.categoryId === category.id);
        const newRank = index + 1;

        if (existingRanking) {
          existingRanking.previousRank = existingRanking.rank;
          existingRanking.rank = newRank;
          existingRanking.score = userScore.score;
          existingRanking.trend = newRank < existingRanking.previousRank! ? 'up' : 
                                 newRank > existingRanking.previousRank! ? 'down' : 'stable';
        } else {
          this.rankings.push({
            userId: userScore.userId,
            categoryId: category.id,
            rank: newRank,
            score: userScore.score,
            trend: 'new',
            achievements: []
          });
        }
      });
    });
  }

  private generateMockAchievements(): void {
    this.users.forEach(user => {
      const stats = this.getUserStats(user.id);
      
      // Check for achievements
      if (stats.totalReviews >= 1) {
        this.userAchievements.push({
          userId: user.id,
          achievementId: 'first_review',
          unlockedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          isDisplayed: true
        });
      }

      if (stats.averageRating >= 9 && stats.totalReviews >= 5) {
        this.userAchievements.push({
          userId: user.id,
          achievementId: 'five_star_streak',
          unlockedAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000),
          isDisplayed: true
        });
      }
    });
  }

  private generateMockStreaks(): void {
    this.users.forEach(user => {
      if (Math.random() > 0.7) {
        this.streaks.push({
          userId: user.id,
          currentStreak: Math.floor(Math.random() * 20) + 1,
          longestStreak: Math.floor(Math.random() * 50) + 1,
          lastReviewDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          streakType: ['giving', 'receiving', 'helpful'][Math.floor(Math.random() * 3)] as any,
          multiplier: 1 + Math.random() * 2
        });
      }
    });
  }

  private checkAchievements(userId: string): void {
    // Implementation for checking and awarding achievements
    // This would be called after each review
  }

  private updateStreaks(userId: string): void {
    // Implementation for updating user streaks
    // This would be called after each review given
  }

  private startRealTimeUpdates(): void {
    // Simulate real-time updates
    setInterval(() => {
      if (Math.random() > 0.95) {
        this.notifySubscribers();
      }
    }, 30000);
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => 
      callback({ reviews: this.reviews, rankings: this.rankings })
    );
  }
}

// Export singleton instance
export const reviewRankingService = new ReviewRankingService();
