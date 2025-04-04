import { Component, OnInit } from '@angular/core';
import { MediaService } from '../../../core/services/media.service';
import { NotificationService } from '../../../core/services/notification.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-content-moderation',
  templateUrl: './content-moderation.component.html',
  styleUrls: ['./content-moderation.component.scss']
})
export class ContentModerationComponent implements OnInit {
  pendingMedia: any[] = [];
  loading = false;
  error = '';
  moderationForm: FormGroup;
  selectedMedia: any = null;
  
  constructor(
    private mediaService: MediaService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {
    this.moderationForm = this.fb.group({
      status: ['approved', Validators.required],
      notes: ['', Validators.maxLength(500)]
    });
  }

  ngOnInit(): void {
    this.loadPendingMedia();
  }
  
  loadPendingMedia(): void {
    this.loading = true;
    this.mediaService.getPendingModerationMedia().subscribe({
      next: (data) => {
        this.pendingMedia = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load pending media';
        this.loading = false;
        this.notificationService.error('Failed to load pending media for moderation');
        console.error(err);
      }
    });
  }
  
  openModerationModal(ad: any, media: any): void {
    this.selectedMedia = { ...media, adId: ad._id, adTitle: ad.title };
    
    // Reset form
    this.moderationForm.reset({
      status: 'approved',
      notes: ''
    });
    
    // Show modal (using Bootstrap's modal)
    const modalElement = document.getElementById('moderationModal');
    if (modalElement) {
      // @ts-ignore: Using Bootstrap's modal method
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
  
  submitModeration(): void {
    if (this.moderationForm.invalid) {
      return;
    }
    
    const { status, notes } = this.moderationForm.value;
    
    this.mediaService.moderateMedia(
      this.selectedMedia.adId,
      this.selectedMedia._id,
      status,
      notes
    ).subscribe({
      next: () => {
        this.notificationService.success('Media moderated successfully');
        this.loadPendingMedia();
        
        // Close modal
        const modalElement = document.getElementById('moderationModal');
        if (modalElement) {
          // @ts-ignore: Using Bootstrap's modal method
          const modal = bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
          }
        }
      },
      error: (err) => {
        this.notificationService.error('Failed to moderate media');
        console.error(err);
      }
    });
  }
  
  getMediaTypeIcon(type: string): string {
    return type === 'video' ? 'fa-video-camera' : 'fa-image';
  }
}