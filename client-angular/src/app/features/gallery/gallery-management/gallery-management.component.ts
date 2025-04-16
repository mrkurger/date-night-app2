// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (gallery-management.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { MediaService } from '../../../core/services/media.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-gallery-management',
  templateUrl: './gallery-management.component.html',
  styleUrls: ['./gallery-management.component.scss'],
})
export class GalleryManagementComponent implements OnInit {
  @Input() adId: string;
  @Output() mediaUpdated = new EventEmitter<void>();

  media: any[] = [];
  selectedFiles: File[] = [];
  previewUrls: SafeUrl[] = [];
  progress = 0;
  uploading = false;
  loading = false;
  error = '';
  featuredMediaId: string | null = null;

  constructor(
    private mediaService: MediaService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    if (this.adId) {
      this.loadMedia();
    }
  }

  loadMedia(): void {
    this.loading = true;
    this.mediaService.getAdMedia(this.adId).subscribe({
      next: media => {
        this.media = media;
        // Find featured media
        const ad = media.find((m: any) => m.featuredMedia);
        if (ad) {
          this.featuredMediaId = ad.featuredMedia;
        }
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to load media';
        this.loading = false;
        this.notificationService.error('Failed to load media');
        console.error(err);
      },
    });
  }

  onFileSelected(event: any): void {
    this.selectedFiles = Array.from(event.target.files);
    this.previewUrls = [];

    // Create previews for selected files
    this.selectedFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewUrls.push(this.sanitizer.bypassSecurityTrustUrl(e.target.result));
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        // For videos, use a generic video icon or thumbnail
        this.previewUrls.push('/assets/images/video-thumbnail.png');
      }
    });
  }

  uploadFiles(): void {
    if (!this.selectedFiles.length) {
      this.notificationService.warning('Please select files to upload');
      return;
    }

    this.uploading = true;
    this.progress = 0;

    // Upload each file
    const uploadObservables = this.selectedFiles.map(file =>
      this.mediaService.uploadMedia(this.adId, file)
    );

    forkJoin(uploadObservables).subscribe({
      next: results => {
        this.uploading = false;
        this.progress = 100;
        this.selectedFiles = [];
        this.previewUrls = [];
        this.notificationService.success(`${results.length} files uploaded successfully`);
        this.loadMedia();
        this.mediaUpdated.emit();
      },
      error: err => {
        this.uploading = false;
        this.notificationService.error('Failed to upload one or more files');
        console.error(err);
      },
    });
  }

  deleteMedia(mediaId: string): void {
    if (confirm('Are you sure you want to delete this media?')) {
      this.mediaService.deleteMedia(this.adId, mediaId).subscribe({
        next: () => {
          this.notificationService.success('Media deleted successfully');
          this.loadMedia();
          this.mediaUpdated.emit();
        },
        error: err => {
          this.notificationService.error('Failed to delete media');
          console.error(err);
        },
      });
    }
  }

  setFeaturedMedia(mediaId: string): void {
    this.mediaService.setFeaturedMedia(this.adId, mediaId).subscribe({
      next: () => {
        this.featuredMediaId = mediaId;
        this.notificationService.success('Featured media updated');
        this.mediaUpdated.emit();
      },
      error: err => {
        this.notificationService.error('Failed to update featured media');
        console.error(err);
      },
    });
  }

  getMediaStatusClass(status: string): string {
    switch (status) {
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  }

  cancelUpload(): void {
    this.selectedFiles = [];
    this.previewUrls = [];
    this.progress = 0;
  }
}
