export interface Media {
  _id: string;
  type: 'video' | 'image';
  url: string;
  status?: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt: Date;
}

export interface PendingMedia extends Media {
  adId: string;
  adTitle: string;
}

export interface ModerationRequest {
  status: 'approved' | 'rejected';
  notes: string;
}
