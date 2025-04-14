
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the content moderation component
// 
// COMMON CUSTOMIZATIONS:
// - MOCK_MEDIA: Mock media data for testing
//   Related to: client-angular/src/app/core/models/media.interface.ts
// ===================================================
import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContentModerationComponent } from './content-moderation.component';
import { MediaService } from '../../../core/services/media.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ContentSanitizerService } from '../../../core/services/content-sanitizer.service';
import { ModerationModalComponent } from './moderation-modal/moderation-modal.component';
import { PendingMedia } from '../../../core/models/media.interface';

describe('ContentModerationComponent', () => {
  let component: ContentModerationComponent;
  let fixture: ComponentFixture<ContentModerationComponent>;
  let debugElement: DebugElement;
  let mediaServiceSpy: jasmine.SpyObj<MediaService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let contentSanitizerServiceSpy: jasmine.SpyObj<ContentSanitizerService>;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;

  // Mock data for testing
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
    },
    {
      _id: '3',
      adId: 'ad3',
      adTitle: 'Another Test Ad',
      type: 'image',
      url: 'https://example.com/image2.jpg',
      createdAt: new Date('2023-01-03')
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
      imports: [
        ReactiveFormsModule,
        FormsModule,
        NgbModalModule,
        CommonModule,
        ContentModerationComponent,
        ModerationModalComponent
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
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.loading).toBeFalse();
      expect(component.error).toBe('');
      expect(component.searchTerm).toBe('');
      expect(component.mediaTypeFilter).toBe('all');
      expect(component.sortOrder).toBe('newest');
      expect(component.currentPage).toBe(1);
      expect(component.itemsPerPage).toBe(12);
      expect(component.moderationForm).toBeDefined();
    });

    it('should load pending media on init', () => {
      expect(mediaServiceSpy.getPendingModerationMedia).toHaveBeenCalled();
      expect(component.pendingMedia.length).toBe(3);
      expect(component.filteredMedia.length).toBe(3);
    });

    it('should convert string dates to Date objects', () => {
      // Setup mock data with string dates that will be converted
      const mediaWithStringDates = [
        {
          _id: '4',
          adId: 'ad4',
          adTitle: 'Test Ad 4',
          type: 'image' as 'image' | 'video',
          url: 'https://example.com/image4.jpg',
          createdAt: new Date('2023-01-04T00:00:00.000Z')
        }
      ];
      
      // Mock the API response with our test data
      mediaServiceSpy.getPendingModerationMedia.and.returnValue(of(mediaWithStringDates as PendingMedia[]));
      
      // Before loading, replace the date with a string to test conversion
      const originalCreatedAt = mediaWithStringDates[0].createdAt;
      (mediaWithStringDates[0] as any).createdAt = originalCreatedAt.toISOString();
      
      component.loadPendingMedia();
      fixture.detectChanges();
      
      // Verify the string date was converted back to a Date object
      expect(component.pendingMedia[0].createdAt instanceof Date).toBeTrue();
    });
  });

  describe('Error Handling', () => {
    it('should handle error when loading pending media', fakeAsync(() => {
      mediaServiceSpy.getPendingModerationMedia.and.returnValue(throwError(() => new Error('Test error')));
      
      component.loadPendingMedia();
      tick();
      fixture.detectChanges();
      
      expect(component.error).toBeTruthy();
      expect(notificationServiceSpy.error).toHaveBeenCalled();
      
      // Check if error alert is displayed
      const errorAlert = debugElement.query(By.css('.alert-danger'));
      expect(errorAlert).toBeTruthy();
    }));

    it('should handle 403 forbidden error with specific message', fakeAsync(() => {
      const forbiddenError = { status: 403, message: 'Forbidden' };
      mediaServiceSpy.getPendingModerationMedia.and.returnValue(throwError(() => forbiddenError));
      
      component.loadPendingMedia();
      tick();
      
      expect(component.error).toContain('permission');
      expect(notificationServiceSpy.error).toHaveBeenCalledWith(jasmine.stringMatching(/permission/));
    }));

    it('should retry failed requests', fakeAsync(() => {
      // First call fails, second succeeds
      mediaServiceSpy.getPendingModerationMedia.and.returnValues(
        throwError(() => new Error('Network error')),
        of(mockPendingMedia)
      );
      
      component.loadPendingMedia();
      tick();
      
      expect(mediaServiceSpy.getPendingModerationMedia).toHaveBeenCalledTimes(2);
      expect(component.pendingMedia.length).toBe(3);
    }));
  });

  describe('Filtering and Sorting', () => {
    it('should filter media by type', () => {
      component.mediaTypeFilter = 'image';
      component.applyFilters();
      fixture.detectChanges();
      
      expect(component.filteredMedia.length).toBe(2);
      expect(component.filteredMedia.every(media => media.type === 'image')).toBeTrue();
    });

    it('should filter media by search term', () => {
      component.searchTerm = 'Test Ad 1';
      component.applyFilters();
      fixture.detectChanges();
      
      expect(component.filteredMedia.length).toBe(1);
      expect(component.filteredMedia[0].adTitle).toBe('Test Ad 1');
    });

    it('should handle case-insensitive search', () => {
      component.searchTerm = 'test ad';
      component.applyFilters();
      
      expect(component.filteredMedia.length).toBe(3);
      
      component.searchTerm = 'TEST AD 1';
      component.applyFilters();
      
      expect(component.filteredMedia.length).toBe(1);
      expect(component.filteredMedia[0].adTitle).toBe('Test Ad 1');
    });

    it('should sort media by newest first', () => {
      component.sortOrder = 'newest';
      component.applyFilters();
      
      expect(component.filteredMedia[0]._id).toBe('3'); // The newest item
      expect(component.filteredMedia[2]._id).toBe('1'); // The oldest item
    });

    it('should sort media by oldest first', () => {
      component.sortOrder = 'oldest';
      component.applyFilters();
      
      expect(component.filteredMedia[0]._id).toBe('1'); // The oldest item
      expect(component.filteredMedia[2]._id).toBe('3'); // The newest item
    });

    it('should sort media by title', () => {
      component.sortOrder = 'title';
      component.applyFilters();
      
      expect(component.filteredMedia[0].adTitle).toBe('Another Test Ad');
      expect(component.filteredMedia[1].adTitle).toBe('Test Ad 1');
      expect(component.filteredMedia[2].adTitle).toBe('Test Ad 2');
    });

    it('should reset filters', () => {
      // Set filters to non-default values
      component.searchTerm = 'test';
      component.mediaTypeFilter = 'image';
      component.sortOrder = 'title';
      component.currentPage = 2;
      
      component.resetFilters();
      fixture.detectChanges();
      
      expect(component.searchTerm).toBe('');
      expect(component.mediaTypeFilter).toBe('all');
      expect(component.sortOrder).toBe('newest');
      expect(component.currentPage).toBe(1);
    });

    it('should handle filter changes', () => {
      // Directly set filter values
      component.mediaTypeFilter = 'image';
      component.applyFilters();
      expect(component.filteredMedia.every(media => media.type === 'image')).toBeTrue();
      
      component.sortOrder = 'title';
      component.applyFilters();
      expect(component.filteredMedia[0].adTitle).toBe('Another Test Ad');
      
      component.searchTerm = 'Test Ad 1';
      component.applyFilters();
      expect(component.filteredMedia.length).toBe(1);
      expect(component.filteredMedia[0].adTitle).toBe('Test Ad 1');
    });
  });

  describe('Pagination', () => {
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
      fixture.detectChanges();
      
      expect(component.totalPages).toBe(3);
      expect(component.paginatedMedia.length).toBe(10);
    });

    it('should change page correctly', () => {
      // Setup pagination scenario
      const manyMedia = Array(30).fill(null).map((_, i) => ({
        _id: `id${i}`,
        adId: `ad${i}`,
        adTitle: `Test Ad ${i}`,
        type: 'image',
        url: `https://example.com/media${i}.jpg`,
        createdAt: new Date(2023, 0, i + 1)
      }));
      
      component.pendingMedia = manyMedia as PendingMedia[];
      component.itemsPerPage = 10;
      component.applyFilters();
      fixture.detectChanges();
      
      // Change to page 2
      component.changePage(2);
      fixture.detectChanges();
      
      expect(component.currentPage).toBe(2);
      expect(component.paginatedMedia[0]._id).toBe('id10'); // First item on page 2
      
      // Try to navigate to an invalid page
      component.changePage(0);
      expect(component.currentPage).toBe(2); // Should not change
      
      component.changePage(4);
      expect(component.currentPage).toBe(2); // Should not change
    });

    it('should update pagination when items per page changes', () => {
      // Setup pagination scenario
      const manyMedia = Array(30).fill(null).map((_, i) => ({
        _id: `id${i}`,
        adId: `ad${i}`,
        adTitle: `Test Ad ${i}`,
        type: 'image',
        url: `https://example.com/media${i}.jpg`,
        createdAt: new Date(2023, 0, i + 1)
      }));
      
      component.pendingMedia = manyMedia as PendingMedia[];
      component.itemsPerPage = 10;
      component.applyFilters();
      
      // Change to page 2
      component.changePage(2);
      
      // Change items per page
      component.itemsPerPage = 15;
      component.onItemsPerPageChange();
      
      expect(component.totalPages).toBe(2);
      expect(component.currentPage).toBe(1); // Should reset to page 1
      expect(component.paginatedMedia.length).toBe(15);
    });

    it('should generate correct page numbers array', () => {
      // Setup pagination scenario with many pages
      const manyMedia = Array(100).fill(null).map((_, i) => ({
        _id: `id${i}`,
        adId: `ad${i}`,
        adTitle: `Test Ad ${i}`,
        type: 'image',
        url: `https://example.com/media${i}.jpg`,
        createdAt: new Date(2023, 0, i + 1)
      }));
      
      component.pendingMedia = manyMedia as PendingMedia[];
      component.itemsPerPage = 10;
      component.applyFilters();
      
      // Test page numbers when on first page
      component.currentPage = 1;
      let pageNumbers = component.getPageNumbers();
      expect(pageNumbers.length).toBeLessThanOrEqual(5);
      expect(pageNumbers[0]).toBe(1);
      
      // Test page numbers when in middle
      component.currentPage = 5;
      pageNumbers = component.getPageNumbers();
      expect(pageNumbers.length).toBeLessThanOrEqual(5);
      expect(pageNumbers).toContain(5);
      
      // Test page numbers when on last page
      component.currentPage = 10;
      pageNumbers = component.getPageNumbers();
      expect(pageNumbers.length).toBeLessThanOrEqual(5);
      expect(pageNumbers[pageNumbers.length - 1]).toBe(10);
    });
  });

  describe('Modal Interaction', () => {
    it('should open moderation modal', () => {
      const mockModalRef = { componentInstance: {} };
      modalServiceSpy.open.and.returnValue(mockModalRef as any);
      
      component.openModerationModal({}, mockPendingMedia[0]);
      
      expect(modalServiceSpy.open).toHaveBeenCalled();
      expect(component.selectedMedia).toBe(mockPendingMedia[0]);
      expect(component.moderationForm.value.status).toBe('approved');
      expect(component.moderationForm.value.notes).toBe('');
    });

    it('should handle missing media when opening modal', () => {
      component.openModerationModal({}, null as any);
      
      expect(modalServiceSpy.open).not.toHaveBeenCalled();
      expect(notificationServiceSpy.error).toHaveBeenCalledWith(jasmine.stringMatching(/missing/i));
    });

    it('should submit moderation successfully with approved status', fakeAsync(() => {
      component.selectedMedia = mockPendingMedia[0];
      component.moderationForm.setValue({
        status: 'approved',
        notes: 'Content meets guidelines'
      });
      
      component.submitModeration();
      tick();
      
      expect(mediaServiceSpy.moderateMedia).toHaveBeenCalledWith(
        mockPendingMedia[0].adId,
        mockPendingMedia[0]._id,
        'approved',
        'Content meets guidelines'
      );
      expect(notificationServiceSpy.success).toHaveBeenCalledWith(jasmine.stringMatching(/approved/i));
      expect(modalServiceSpy.dismissAll).toHaveBeenCalled();
    }));

    it('should submit moderation successfully with rejected status', fakeAsync(() => {
      component.selectedMedia = mockPendingMedia[0];
      component.moderationForm.setValue({
        status: 'rejected',
        notes: 'Content violates guidelines'
      });
      
      component.submitModeration();
      tick();
      
      expect(mediaServiceSpy.moderateMedia).toHaveBeenCalledWith(
        mockPendingMedia[0].adId,
        mockPendingMedia[0]._id,
        'rejected',
        'Content violates guidelines'
      );
      expect(notificationServiceSpy.success).toHaveBeenCalledWith(jasmine.stringMatching(/rejected/i));
      expect(modalServiceSpy.dismissAll).toHaveBeenCalled();
    }));

    it('should not submit when form is invalid', () => {
      component.selectedMedia = mockPendingMedia[0];
      component.moderationForm.setValue({
        status: 'approved',
        notes: '' // Empty notes, which is invalid
      });
      
      component.submitModeration();
      
      expect(mediaServiceSpy.moderateMedia).not.toHaveBeenCalled();
      expect(notificationServiceSpy.error).toHaveBeenCalledWith(jasmine.stringMatching(/required/i));
    });

    it('should not submit when no media is selected', () => {
      component.selectedMedia = null;
      component.moderationForm.setValue({
        status: 'approved',
        notes: 'Valid notes'
      });
      
      component.submitModeration();
      
      expect(mediaServiceSpy.moderateMedia).not.toHaveBeenCalled();
      expect(notificationServiceSpy.error).toHaveBeenCalledWith(jasmine.stringMatching(/no media/i));
    });

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
      expect(component.error).toBeTruthy();
    }));

    it('should handle 403 error when submitting moderation', fakeAsync(() => {
      const forbiddenError = { status: 403, message: 'Forbidden' };
      mediaServiceSpy.moderateMedia.and.returnValue(throwError(() => forbiddenError));
      
      component.selectedMedia = mockPendingMedia[0];
      component.moderationForm.setValue({
        status: 'approved',
        notes: 'Test notes'
      });
      
      component.submitModeration();
      tick();
      
      expect(notificationServiceSpy.error).toHaveBeenCalledWith(jasmine.stringMatching(/permission/i));
    }));
  });

  describe('Utility Functions', () => {
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
  });

  describe('UI Rendering and State Management', () => {
    it('should manage loading state correctly', () => {
      // Test loading state
      expect(component.loading).toBeFalse();
      
      // Simulate loading
      component.loading = true;
      expect(component.loading).toBeTrue();
      
      // Simulate loading complete
      component.loading = false;
      expect(component.loading).toBeFalse();
    });

    it('should handle empty media state', () => {
      // Set empty media state
      component.pendingMedia = [];
      component.filteredMedia = [];
      component.applyFilters();
      
      expect(component.paginatedMedia.length).toBe(0);
      expect(component.totalPages).toBe(1);
    });

    it('should update paginated media when source data changes', () => {
      // Initial state
      expect(component.paginatedMedia.length).toBe(3);
      
      // Add more items
      const newMedia = {
        _id: '4',
        adId: 'ad4',
        adTitle: 'New Test Ad',
        type: 'image',
        url: 'https://example.com/new.jpg',
        createdAt: new Date('2023-01-04')
      };
      
      component.pendingMedia = [...mockPendingMedia, newMedia as PendingMedia];
      component.applyFilters();
      
      expect(component.filteredMedia.length).toBe(4);
      expect(component.paginatedMedia.length).toBe(4);
    });

    it('should handle media type identification correctly', () => {
      // Test image type
      expect(component.getMediaTypeIcon('image')).toBe('fa-image');
      
      // Test video type
      expect(component.getMediaTypeIcon('video')).toBe('fa-video-camera');
    });

    it('should handle pagination state changes', () => {
      // Create more mock data for pagination testing
      const manyMedia = Array(30).fill(null).map((_, i) => ({
        _id: `id${i}`,
        adId: `ad${i}`,
        adTitle: `Test Ad ${i}`,
        type: i % 2 === 0 ? 'image' : 'video',
        url: `https://example.com/media${i}.jpg`,
        createdAt: new Date(2023, 0, i + 1)
      })) as PendingMedia[];
      
      component.pendingMedia = manyMedia;
      component.itemsPerPage = 10;
      component.applyFilters();
      
      expect(component.totalPages).toBe(3);
      
      // Test page navigation
      component.changePage(2);
      expect(component.currentPage).toBe(2);
      expect(component.paginatedMedia[0]._id).toBe('id10');
      
      // Test items per page change
      component.itemsPerPage = 15;
      component.onItemsPerPageChange();
      expect(component.totalPages).toBe(2);
      expect(component.paginatedMedia.length).toBe(15);
    });
  });

  describe('Component Lifecycle', () => {
    it('should clean up subscriptions on destroy', () => {
      // Create a spy on the Subject's next and complete methods
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');
      
      // Trigger ngOnDestroy
      component.ngOnDestroy();
      
      // Verify cleanup
      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });
});