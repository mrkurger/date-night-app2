import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { of, throwError } from 'rxjs';

import { ContentModerationComponent } from './content-moderation.component';
import { MediaService } from '../../../core/services/media.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ContentSanitizerService } from '../../../core/services/content-sanitizer.service';
import { ModerationModalComponent } from './moderation-modal/moderation-modal.component';
import { PendingMedia } from '../../../core/models/media.interface';

describe('ContentModerationComponent', () => {
  let component: ContentModerationComponent;
  let fixture: ComponentFixture<ContentModerationComponent>;
  let mediaServiceSpy: jasmine.SpyObj<MediaService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let contentSanitizerServiceSpy: jasmine.SpyObj<ContentSanitizerService>;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;

  const mockPendingMedia: PendingMedia[] = [
    {
      _id: '1',
      adId: 'ad1',
      adTitle: 'Test Ad 1',
      type: 'image',
      url: 'https://example.com/image1.jpg',
      createdAt: new Date('2023-01-01')
    },
    {
      _id: '2',
      adId: 'ad2',
      adTitle: 'Test Ad 2',
      type: 'video',
      url: 'https://example.com/video1.mp4',
      createdAt: new Date('2023-01-02')
    }
  ];

  beforeEach(async () => {
    // Create spies for all dependencies
    mediaServiceSpy = jasmine.createSpyObj('MediaService', ['getPendingModerationMedia', 'moderateMedia']);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['success', 'error']);
    contentSanitizerServiceSpy = jasmine.createSpyObj('ContentSanitizerService', ['sanitizeUrl', 'isValidUrl']);
    modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open', 'dismissAll']);

    // Configure default spy behavior
    mediaServiceSpy.getPendingModerationMedia.and.returnValue(of(mockPendingMedia));
    mediaServiceSpy.moderateMedia.and.returnValue(of(void 0));
    contentSanitizerServiceSpy.sanitizeUrl.and.returnValue('safe-url');
    contentSanitizerServiceSpy.isValidUrl.and.returnValue(true);

    await TestBed.configureTestingModule({
      declarations: [
        ContentModerationComponent,
        ModerationModalComponent
      ],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        NgbModalModule
      ],
      providers: [
        { provide: MediaService, useValue: mediaServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: ContentSanitizerService, useValue: contentSanitizerServiceSpy },
        { provide: NgbModal, useValue: modalServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ContentModerationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load pending media on init', () => {
    expect(mediaServiceSpy.getPendingModerationMedia).toHaveBeenCalled();
    expect(component.pendingMedia.length).toBe(2);
    expect(component.filteredMedia.length).toBe(2);
  });

  it('should handle error when loading pending media', fakeAsync(() => {
    mediaServiceSpy.getPendingModerationMedia.and.returnValue(throwError(() => new Error('Test error')));
    
    component.loadPendingMedia();
    tick();
    
    expect(component.error).toBeTruthy();
    expect(notificationServiceSpy.error).toHaveBeenCalled();
  }));

  it('should filter media by type', () => {
    component.mediaTypeFilter = 'image';
    component.applyFilters();
    
    expect(component.filteredMedia.length).toBe(1);
    expect(component.filteredMedia[0].type).toBe('image');
  });

  it('should filter media by search term', () => {
    component.searchTerm = 'Test Ad 1';
    component.applyFilters();
    
    expect(component.filteredMedia.length).toBe(1);
    expect(component.filteredMedia[0].adTitle).toBe('Test Ad 1');
  });

  it('should sort media by newest first', () => {
    component.sortOrder = 'newest';
    component.applyFilters();
    
    expect(component.filteredMedia[0]._id).toBe('2'); // The newer item
  });

  it('should sort media by oldest first', () => {
    component.sortOrder = 'oldest';
    component.applyFilters();
    
    expect(component.filteredMedia[0]._id).toBe('1'); // The older item
  });

  it('should reset filters', () => {
    component.searchTerm = 'test';
    component.mediaTypeFilter = 'image';
    component.sortOrder = 'title';
    
    component.resetFilters();
    
    expect(component.searchTerm).toBe('');
    expect(component.mediaTypeFilter).toBe('all');
    expect(component.sortOrder).toBe('newest');
  });

  it('should open moderation modal', () => {
    const mockModalRef = { componentInstance: {} };
    modalServiceSpy.open.and.returnValue(mockModalRef as any);
    
    component.openModerationModal({}, mockPendingMedia[0]);
    
    expect(modalServiceSpy.open).toHaveBeenCalled();
    expect(component.selectedMedia).toBe(mockPendingMedia[0]);
  });

  it('should submit moderation successfully', fakeAsync(() => {
    component.selectedMedia = mockPendingMedia[0];
    component.moderationForm.setValue({
      status: 'approved',
      notes: 'Test notes'
    });
    
    component.submitModeration();
    tick();
    
    expect(mediaServiceSpy.moderateMedia).toHaveBeenCalledWith(
      mockPendingMedia[0].adId,
      mockPendingMedia[0]._id,
      'approved',
      'Test notes'
    );
    expect(notificationServiceSpy.success).toHaveBeenCalled();
    expect(modalServiceSpy.dismissAll).toHaveBeenCalled();
  }));

  it('should handle error when submitting moderation', fakeAsync(() => {
    mediaServiceSpy.moderateMedia.and.returnValue(throwError(() => new Error('Test error')));
    
    component.selectedMedia = mockPendingMedia[0];
    component.moderationForm.setValue({
      status: 'approved',
      notes: 'Test notes'
    });
    
    component.submitModeration();
    tick();
    
    expect(notificationServiceSpy.error).toHaveBeenCalled();
  }));

  it('should return correct icon for media type', () => {
    expect(component.getMediaTypeIcon('video')).toBe('fa-video-camera');
    expect(component.getMediaTypeIcon('image')).toBe('fa-image');
  });

  it('should sanitize URLs', () => {
    component.getSafeUrl('test-url');
    expect(contentSanitizerServiceSpy.sanitizeUrl).toHaveBeenCalledWith('test-url');
  });

  it('should handle media load errors', () => {
    const media = { ...mockPendingMedia[0] };
    component.onMediaLoadError(media);
    expect((media as any).hasLoadError).toBeTrue();
  });

  it('should paginate media correctly', () => {
    // Create more mock data for pagination testing
    const manyMedia = Array(30).fill(null).map((_, i) => ({
      _id: `id${i}`,
      adId: `ad${i}`,
      adTitle: `Test Ad ${i}`,
      type: i % 2 === 0 ? 'image' : 'video',
      url: `https://example.com/media${i}.jpg`,
      createdAt: new Date(2023, 0, i + 1)
    }));
    
    component.pendingMedia = manyMedia as PendingMedia[];
    component.itemsPerPage = 10;
    component.applyFilters();
    
    expect(component.totalPages).toBe(3);
    expect(component.paginatedMedia.length).toBe(10);
    
    // Change page
    component.changePage(2);
    expect(component.currentPage).toBe(2);
    expect(component.paginatedMedia.length).toBe(10);
    
    // Change items per page
    component.itemsPerPage = 15;
    component.onItemsPerPageChange();
    expect(component.totalPages).toBe(2);
    expect(component.currentPage).toBe(1);
  });
});