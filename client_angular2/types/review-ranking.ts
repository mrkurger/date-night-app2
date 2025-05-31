// Enhanced Review and Ranking System Types

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  age: number;
  location: string;
  isVip: boolean;
  isVerified: boolean;
  joinDate: Date;
  lastActive: Date;
  profileViews: number;
  totalTips: number;
}

export interface ReviewCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  weight: number; // For overall rating calculation
}

export interface CategoryRating {
  categoryId: string;
  rating: number; // 1-10 scale
  confidence: number; // How confident the rater is (1-5)
}

export interface Review {
  id: string;
  reviewerId: string;
  revieweeId: string;
  overallRating: number; // 1-10 scale
  categoryRatings: CategoryRating[];
  comment: string;
  photos?: string[]; // Optional photo reviews
  isAnonymous: boolean;
  isVerified: boolean;
  helpfulVotes: number;
  reportCount: number;
  createdAt: Date;
  updatedAt: Date;
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'flagged';
  tags: string[]; // e.g., ['funny', 'sweet', 'professional']
  interactionType: 'date' | 'chat' | 'video_call' | 'casino_game' | 'tip_exchange';
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  categoryAverages: { [categoryId: string]: number };
  ratingDistribution: { [rating: number]: number };
  recentTrend: 'up' | 'down' | 'stable';
  verifiedReviewsCount: number;
  helpfulReviewsCount: number;
}

export interface RankingCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  type: 'overall' | 'category' | 'special';
  criteria: string[];
}

export interface UserRanking {
  userId: string;
  categoryId: string;
  rank: number;
  score: number;
  previousRank?: number;
  trend: 'up' | 'down' | 'stable' | 'new';
  badge?: string;
  achievements: string[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'rating' | 'review' | 'streak' | 'special';
  criteria: {
    threshold?: number;
    timeframe?: string;
    category?: string;
    special?: string;
  };
  reward: {
    type: 'badge' | 'coins' | 'vip_time' | 'special_effect';
    value: string | number;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  unlockedAt: Date;
  progress?: number;
  isDisplayed: boolean;
}

export interface ReviewStreak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastReviewDate: Date;
  streakType: 'giving' | 'receiving' | 'helpful';
  multiplier: number;
}

export interface LeaderboardEntry {
  user: User;
  ranking: UserRanking;
  stats: ReviewStats;
  achievements: Achievement[];
  streak?: ReviewStreak;
}

export interface LeaderboardFilters {
  category: string;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all_time';
  location?: string;
  ageRange?: [number, number];
  userType?: 'all' | 'vip' | 'verified' | 'new';
  minReviews?: number;
}

export interface ReviewReward {
  id: string;
  type: 'coins' | 'vip_time' | 'special_badge' | 'casino_chips' | 'scratch_card';
  value: number;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  animation: string;
  conditions: {
    minRating?: number;
    reviewLength?: number;
    isVerified?: boolean;
    streakBonus?: boolean;
  };
}

export interface CasinoIntegration {
  userId: string;
  reviewCoins: number;
  ratingChips: number;
  jackpotEntries: number;
  vipPoints: number;
  specialRewards: string[];
  lastJackpotWin?: Date;
  totalWinnings: number;
}

export interface ReviewModerationAction {
  id: string;
  reviewId: string;
  moderatorId: string;
  action: 'approve' | 'reject' | 'flag' | 'edit' | 'delete';
  reason: string;
  timestamp: Date;
  autoModerated: boolean;
  appealStatus?: 'none' | 'pending' | 'approved' | 'rejected';
}

export interface ReviewAnalytics {
  totalReviews: number;
  averageRating: number;
  reviewsToday: number;
  reviewsThisWeek: number;
  topReviewers: User[];
  topRated: User[];
  categoryTrends: { [categoryId: string]: number };
  sentimentAnalysis: {
    positive: number;
    neutral: number;
    negative: number;
  };
  moderationStats: {
    pending: number;
    approved: number;
    rejected: number;
    flagged: number;
  };
}

export interface NotificationSettings {
  userId: string;
  newReview: boolean;
  ratingMilestone: boolean;
  rankingChange: boolean;
  achievementUnlocked: boolean;
  reviewHelpful: boolean;
  moderationUpdate: boolean;
  weeklyDigest: boolean;
}

// Default review categories
export const DEFAULT_REVIEW_CATEGORIES: ReviewCategory[] = [
  {
    id: 'looks',
    name: 'Looks',
    icon: '👁️',
    description: 'Physical attractiveness and style',
    weight: 0.25
  },
  {
    id: 'personality',
    name: 'Personality',
    icon: '😊',
    description: 'Character, humor, and charm',
    weight: 0.30
  },
  {
    id: 'communication',
    name: 'Communication',
    icon: '💬',
    description: 'Conversation skills and responsiveness',
    weight: 0.25
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: '🎭',
    description: 'Fun factor and engagement',
    weight: 0.20
  }
];

// Default ranking categories
export const DEFAULT_RANKING_CATEGORIES: RankingCategory[] = [
  {
    id: 'overall',
    name: 'Overall Rating',
    icon: '⭐',
    description: 'Combined rating across all categories',
    type: 'overall',
    criteria: ['average_rating', 'review_count', 'verification_status']
  },
  {
    id: 'looks',
    name: 'Most Attractive',
    icon: '💎',
    description: 'Highest rated for physical attractiveness',
    type: 'category',
    criteria: ['looks_rating', 'photo_quality', 'style_rating']
  },
  {
    id: 'personality',
    name: 'Best Personality',
    icon: '🌟',
    description: 'Most charming and engaging personalities',
    type: 'category',
    criteria: ['personality_rating', 'humor_rating', 'kindness_rating']
  },
  {
    id: 'popular',
    name: 'Most Popular',
    icon: '🔥',
    description: 'Trending and most viewed profiles',
    type: 'special',
    criteria: ['profile_views', 'recent_activity', 'tip_amount']
  },
  {
    id: 'casino_champion',
    name: 'Casino Champion',
    icon: '🎰',
    description: 'Top performers in casino games',
    type: 'special',
    criteria: ['casino_wins', 'jackpot_hits', 'game_participation']
  }
];

// Default achievements
export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_review',
    name: 'First Impression',
    description: 'Received your first review',
    icon: '🌟',
    type: 'review',
    criteria: { threshold: 1 },
    reward: { type: 'coins', value: 100 },
    rarity: 'common'
  },
  {
    id: 'five_star_streak',
    name: 'Perfect Streak',
    description: 'Received 5 consecutive 5-star reviews',
    icon: '⭐',
    type: 'streak',
    criteria: { threshold: 5, category: 'overall' },
    reward: { type: 'special_effect', value: 'golden_aura' },
    rarity: 'rare'
  },
  {
    id: 'review_master',
    name: 'Review Master',
    description: 'Given 100 helpful reviews',
    icon: '📝',
    type: 'review',
    criteria: { threshold: 100 },
    reward: { type: 'badge', value: 'master_reviewer' },
    rarity: 'epic'
  },
  {
    id: 'casino_royale',
    name: 'Casino Royale',
    description: 'Won 10 casino jackpots',
    icon: '🎰',
    type: 'special',
    criteria: { threshold: 10, special: 'jackpot_wins' },
    reward: { type: 'vip_time', value: 30 },
    rarity: 'legendary'
  }
];
