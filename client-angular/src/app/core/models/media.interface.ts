/**
 *
 */
export interface IMedia {
  /**
   *
   */
  id: string;
  /**
   *
   */
  url: string;
  /**
   *
   */
  type: 'image' | 'video';
  /**
   *
   */
  thumbnailUrl?: string;
  /**
   *
   */
  title?: string;
  /**
   *
   */
  description?: string;
  /**
   *
   */
  uploadedBy: string;
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
  metadata?: {
    /**
     *
     */
    width: number;
    /**
     *
     */
    height: number;
    /**
     *
     */
    duration?: number;
    /**
     *
     */
    size: number;
    /**
     *
     */
    format: string;
  };
}

/**
 *
 */
export interface IPendingMedia {
  /**
   *
   */
  file: File;
  /**
   *
   */
  progress: number;
  /**
   *
   */
  url?: string;
  /**
   *
   */
  error?: string;
}

/**
 *
 */
export interface IModerationRequest {
  /**
   *
   */
  mediaId: string;
  /**
   *
   */
  reason: string;
  /**
   *
   */
  status: 'pending' | 'approved' | 'rejected';
  /**
   *
   */
  reviewedBy?: string;
  /**
   *
   */
  reviewedAt?: Date;
}
