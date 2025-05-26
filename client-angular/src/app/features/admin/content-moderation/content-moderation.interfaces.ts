import { SafeUrl } from '@angular/platform-browser';

/**
 *;
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
   */';
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
export interface IModerationRequest {
  /**
   *;
   */
  status: 'approved' | 'rejected';
  /**
   *;
   */
  notes: string;
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

// Service interfaces
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
export interface INotificationService {
  showSuccess(message: string): void;
  showError(message: string): void;
  showWarning(message: string): void;
  showInfo(message: string): void;
}

/**
 *;
 */
export interface IContentSanitizerService {
  sanitizeUrl(url: string): SafeUrl;
}
