export interface Review {
  _id: string;
  reviewer: {
    _id: string;
    username: string;
    profileImage?: string;
  };
  advertiser: {
    _id: string;
    username: string;
    profileImage?: string;
  };
  ad?: string;
  rating: number;
  title: string;
  content: string;
  categories?: {
    communication?: number;
    appearance?: number;
    location?: number;
    value?: number;
  };
  status: 'pending' | 'approved' | 'rejected';
  moderationNotes?: string;
  isVerifiedMeeting?: boolean;
  meetingDate?: Date;
  advertiserResponse?: {
    content: string;
    date: Date;
  };
  helpfulVotes: number;
  reportCount: number;
  reports?: Array<{
    userId: string;
    reason: string;
    date: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewCreateData {
  advertiserId: string;
  adId?: string;
  rating: number;
  title: string;
  content: string;
  categories?: {
    communication?: number;
    appearance?: number;
    location?: number;
    value?: number;
  };
  meetingDate?: Date;
}

export interface ReviewUpdateData {
  rating?: number;
  title?: string;
  content?: string;
  categories?: {
    communication?: number;
    appearance?: number;
    location?: number;
    value?: number;
  };
}

export interface ReviewResponse {
  content: string;
}

export interface ReviewReport {
  reason: string;
}

export interface AdvertiserRatings {
  averageRating: number;
  communicationAvg: number;
  appearanceAvg: number;
  locationAvg: number;
  valueAvg: number;
  totalReviews: number;
}

export interface TopRatedAdvertiser {
  _id: string;
  advertiser: {
    _id: string;
    username: string;
    profileImage?: string;
  };
  averageRating: number;
  reviewCount: number;
}