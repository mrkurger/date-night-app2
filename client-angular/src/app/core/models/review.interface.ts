/**
 *
 */
export interface IReview {
  /**
   *
   */
  id: string;
  /**
   *
   */
  advertiserId: string;
  /**
   *
   */
  userId: string;
  /**
   *
   */
  rating: number;
  /**
   *
   */
  comment: string;
  /**
   *
   */
  experienceDate: Date;
  /**
   *
   */
  createdAt: Date;
  /**
   *
   */
  updatedAt: Date;
  /**
   *
   */
  attachments?: {
    /**
     *
     */
    images: string[];
    /**
     *
     */
    videos: string[];
  };
  /**
   *
   */
  verified: boolean;
  /**
   *
   */
  helpful: {
    /**
     *
     */
    count: number;
    /**
     *
     */
    voters: string[];
  };
  /**
   *
   */
  response?: {
    /**
     *
     */
    text: string;
    /**
     *
     */
    createdAt: Date;
    /**
     *
     */
    updatedAt: Date;
  };
  /**
   *
   */
  flags?: {
    /**
     *
     */
    inappropriate: boolean;
    /**
     *
     */
    spam: boolean;
    /**
     *
     */
    other: boolean;
  };
}

/**
 *
 */
export interface IReviewCreateData {
  /**
   *
   */
  advertiserId: string;
  /**
   *
   */
  rating: number;
  /**
   *
   */
  comment: string;
  /**
   *
   */
  experienceDate: Date;
  /**
   *
   */
  attachments?: {
    /**
     *
     */
    images: File[];
    /**
     *
     */
    videos: File[];
  };
}

/**
 *
 */
export interface IReviewUpdateData {
  /**
   *
   */
  rating?: number;
  /**
   *
   */
  comment?: string;
  /**
   *
   */
  experienceDate?: Date;
  /**
   *
   */
  attachments?: {
    /**
     *
     */
    images?: string[];
    /**
     *
     */
    videos?: string[];
  };
}

/**
 *
 */
export interface IReviewResponse {
  /**
   *
   */
  success: boolean;
  /**
   *
   */
  reviewId?: string;
  /**
   *
   */
  error?: string;
}

/**
 *
 */
export interface IReviewReport {
  /**
   *
   */
  reviewId: string;
  /**
   *
   */
  reason: string;
  /**
   *
   */
  description?: string;
}

/**
 *
 */
export interface IAdvertiserRatings {
  /**
   *
   */
  averageRating: number;
  /**
   *
   */
  totalReviews: number;
  /**
   *
   */
  distribution: {
    /**
     *
     */
    5: number;
    /**
     *
     */
    4: number;
    /**
     *
     */
    3: number;
    /**
     *
     */
    2: number;
    /**
     *
     */
    1: number;
  };
}

/**
 *
 */
export interface ITopRatedAdvertiser {
  /**
   *
   */
  id: string;
  /**
   *
   */
  name: string;
  /**
   *
   */
  rating: number;
  /**
   *
   */
  reviewCount: number;
  /**
   *
   */
  recentReviews: IReview[];
}
