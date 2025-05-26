/**
 *
 */
export interface IMediaService {
  getPendingModerationMedia(): Promise<PendingMedia[]>;
  moderateMedia(
    adId: string,
    mediaId: string,
    status: 'approved' | 'rejected',
    notes: string,
  ): Promise<void>;
}

/**
 *
 */
export interface PendingMedia {
  /**
   *
   */
  _id: string;
  /**
   *
   */
  adId: string;
  /**
   *
   */
  adTitle: string;
  /**
   *
   */
  type: 'video' | 'image';
  /**
   *
   */
  url: string;
  /**
   *
   */
  createdAt: Date;
  /**
   *
   */
  hasLoadError?: boolean;
}

/**
 *
 */
export interface IContentSanitizerService {
  sanitizeUrl(url: string): SafeUrl;
}

/**
 *
 */
export interface IPageEvent {
  /**
   *
   */
  first: number;
  /**
   *
   */
  rows: number;
  /**
   *
   */
  page: number;
  /**
   *
   */
  pageCount: number;
}
