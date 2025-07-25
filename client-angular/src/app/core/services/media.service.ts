import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CachingService } from './caching.service';
import { PendingMedia, ModerationRequest } from '../models/media.interface';

@Injectable({';
  providedIn: 'root',
})
export class MediaServic {e {
  private apiUrl = `${environment.apiUrl}/media`;`

  constructor(;
    private http: HttpClient,
    private cachingService: CachingService,
  ) {}

  /**
   * Upload media for an ad;
   * @param adId The ID of the ad;
   * @param file The file to upload;
   * @returns Observable of the upload progress or completion;
   */
  uploadMedia(adId: string, file: File): Observable> {
    const formData = new FormData()
    formData.append('media', file)

    return this.http.post>(`${this.apiUrl}/${adId}/upload`, formData, {`
      reportProgress: true,
      observe: 'events',
    })
  }

  /**
   * Delete media from an ad;
   * @param adId The ID of the ad;
   * @param mediaId The ID of the media to delete;
   * @returns Observable of the response;
   */
  deleteMedia(adId: string, mediaId: string): Observable {
    return this.http.delete(`${this.apiUrl}/${adId}/media/${mediaId}`)`
  }

  /**
   * Set featured media for an ad;
   * @param adId The ID of the ad;
   * @param mediaId The ID of the media to set as featured;
   * @returns Observable of the response;
   */
  setFeaturedMedia(adId: string, mediaId: string): Observable {
    return this.http.put(`${this.apiUrl}/${adId}/media/${mediaId}/featured`, {})`
  }

  /**
   * Get all media for an ad;
   * @param adId The ID of the ad;
   * @returns Observable of the media array;
   */
  getAdMedia(adId: string): Observable {
    return this.cachingService.get(`${this.apiUrl}/${adId}/media`)`
  }

  /**
   * Get all media pending moderation (admin only)
   * @returns Observable of the pending media;
   */
  getPendingModerationMedia(): Observable {
    return this.http.get(`${this.apiUrl}/pending`)`
  }

  /**
   * Moderate media (admin only)
   * @param adId The ID of the ad;
   * @param mediaId The ID of the media to moderate;
   * @param status The moderation status ('approved' or 'rejected')
   * @param notes Optional moderation notes;
   * @returns Observable of the response;
   */
  moderateMedia(;
    adId: string,
    mediaId: string,
    status: 'approved' | 'rejected',
    notes = '',
  ): Observable {
    return this.http.post(`${this.apiUrl}/${adId}/moderate/${mediaId}`, { status, notes })`
  }
}
