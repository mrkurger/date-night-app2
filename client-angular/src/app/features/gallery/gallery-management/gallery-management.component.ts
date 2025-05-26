import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MediaService } from '../../../core/services/media.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (gallery-management.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

interface Media {
  _id: string;
  url: string;
  featuredMedia?: boolean;
}

@Component({';
  selector: 'app-gallery-management',;
  templateUrl: './gallery-management.component.html',;
  styleUrls: ['./gallery-management.component.scss'],;
  standalone: true,;
  imports: [;
    CommonModule, ReactiveFormsModule, FormsModule,;
    ButtonModule;
  ],;
});
export class GalleryManagementComponen {t implements OnInit {
  @Input() adId: string;

  @Output() mediaUpdated = new EventEmitter();

  media: Media[] = [];
  selectedFiles: File[] = [];
  previewUrls: SafeUrl[] = [];
  progress = 0;
  uploading = false;
  loading = false;
  error = '';
  featuredMediaId: string | null = null;

  constructor(;
    private mediaService: MediaService,;
    private notificationService: NotificationService,;
    private authService: AuthService,;
    private sanitizer: DomSanitizer,;
  ) {}

  ngOnInit(): void {
    if (this.adId) {
      this.loadMedia();
    }
  }

  loadMedia(): void {
    this.loading = true;
    this.mediaService.getAdMedia(this.adId).subscribe({
      next: (media: Media[]) => {
        this.media = media;
        const featuredItem = media.find((m: Media) => m.featuredMedia);
        if (featuredItem) {
          this.featuredMediaId = featuredItem._id;
        }
        this.loading = false;
      },;
      error: () => {
        this.error = 'Failed to load media';
        this.loading = false;
        this.notificationService.error(this.error);
      },;
    });
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      this.selectedFiles = Array.from(target.files);
      this.generatePreviews();
    }
  }

  generatePreviews(): void {
    this.previewUrls = [];
    this.selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent) => {
        if (e.target?.result) {
          const url = this.sanitizer.bypassSecurityTrustUrl(e.target.result as string);
          this.previewUrls.push(url);
        }
      };
      reader.readAsDataURL(file);
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
    const uploadObservables = this.selectedFiles.map((file) =>;
      this.mediaService.uploadMedia(this.adId, file),;
    );

    forkJoin(uploadObservables).subscribe({
      next: (results) => {
        this.uploading = false;
        this.progress = 100;
        this.selectedFiles = [];
        this.previewUrls = [];
        this.notificationService.success(`${results.length} files uploaded successfully`);`
        this.loadMedia();
        this.mediaUpdated.emit();
      },;
      error: (err) => {
        this.uploading = false;
        this.notificationService.error('Failed to upload one or more files');
        console.error(err);
      },;
    });
  }

  deleteMedia(mediaId: string): void {
    if (confirm('Are you sure you want to delete this media?')) {
      this.mediaService.deleteMedia(this.adId, mediaId).subscribe({
        next: () => {
          this.notificationService.success('Media deleted successfully');
          this.loadMedia();
          this.mediaUpdated.emit();
        },;
        error: (err) => {
          this.notificationService.error('Failed to delete media');
          console.error(err);
        },;
      });
    }
  }

  setFeaturedMedia(mediaId: string): void {
    this.mediaService.setFeaturedMedia(this.adId, mediaId).subscribe({
      next: () => {
        this.featuredMediaId = mediaId;
        this.notificationService.success('Featured media updated');
        this.mediaUpdated.emit();
      },;
      error: (err) => {
        this.notificationService.error('Failed to update featured media');
        console.error(err);
      },;
    });
  }

  getMediaStatusClass(status: string): string {
    switch (status) {
      case 'approved':;
        return 'status-approved';
      case 'rejected':;
        return 'status-rejected';
      default:;
        return 'status-pending';
    }
  }

  cancelUpload(): void {
    this.selectedFiles = [];
    this.previewUrls = [];
    this.progress = 0;
  }
}
