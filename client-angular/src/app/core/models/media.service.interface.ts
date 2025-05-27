/**
 * Media service interface
 */
export interface IMediaService {
  getPendingModerationMedia(): Promise<IPendingMedia[]>;
  moderateMedia(
    adId: string,
    mediaId: string,
    status: 'approved' | 'rejected',
    notes: string
  ): Promise<void>;
}

/**
 * Pending media interface
 */
export interface IPendingMedia {
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
  sanitizeUrl(url: string): unknown; // Should be SafeUrl from @angular/platform-browser
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
