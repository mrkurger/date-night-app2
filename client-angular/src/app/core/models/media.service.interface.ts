/**
 *;
 */
export interface IMediaService {
  getPendingModerationMedia(): Promise;
  moderateMedia(;
    adId: string,
    mediaId: string,
    status: 'approved' | 'rejected',
    notes: string,
  ): Promise;
}

/**
 *;
 */
export interface PendingMedia {
  /**
   *;
   */
  _id: string;
  /**
   *;
   */
  adId: string;
  /**
   *;
   */
  adTitle: string;
  /**
   *;
   */
  type: 'video' | 'image';
  /**
   *;
   */
  url: string;
  /**
   *;
   */
  createdAt: Date;
  /**
   *;
   */
  hasLoadError?: boolean;
}

/**
 *;
 */
export interface IContentSanitizerService {
  sanitizeUrl(url: string): SafeUrl;
}

/**
 *;
 */
export interface IPageEvent {
  /**
   *;
   */
  first: number;
  /**
   *;
   */
  rows: number;
  /**
   *;
   */
  page: number;
  /**
   *;
   */
  pageCount: number;
}
