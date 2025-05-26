/////////////////////////
// New test file:
/////////////////////////

import { CommonModule } from '@angular/common';
import { InjectionToken } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PaginatorModule, PaginatorPageChangeEvent } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { ContentModerationComponent } from './content-moderation.component';
import {
  IContentSanitizerService,
  IMediaService,
  INotificationService,
  IPendingMedia,
} from './content-moderation.interfaces';

// Injection tokens for our interfaces
const MEDIA_SERVICE_TOKEN = new InjectionToken<IMediaService>('MEDIA_SERVICE');
const NOTIFICATION_SERVICE_TOKEN = new InjectionToken<INotificationService>('NOTIFICATION_SERVICE');
const CONTENT_SANITIZER_TOKEN = new InjectionToken<IContentSanitizerService>('CONTENT_SANITIZER');

describe('ContentModerationComponent', () => {
  let component: ContentModerationComponent;
  let fixture: ComponentFixture<ContentModerationComponent>;
  let mediaService: jasmine.SpyObj<IMediaService>;
  let notificationService: jasmine.SpyObj<INotificationService>;
  let contentSanitizer: jasmine.SpyObj<IContentSanitizerService>;
  let domSanitizer: jasmine.SpyObj<DomSanitizer>;

  const mockMediaItems: IPendingMedia[] = [
    {
      _id: '1',
      adId: 'ad1',
      adTitle: 'Test Ad 1',
      type: 'image',
      url: 'http://example.com/image1.jpg',
      createdAt: new Date('2023-01-01'),
    },
    {
      _id: '2',
      adId: 'ad2',
      adTitle: 'Test Video',
      type: 'video',
      url: 'http://example.com/video1.mp4',
      createdAt: new Date('2023-01-02'),
    },
  ];

  beforeEach(async () => {
    const safeUrl: SafeUrl = {} as SafeUrl;

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        DialogModule,
        DropdownModule,
        InputTextModule,
        MessageModule,
        PaginatorModule,
        ProgressSpinnerModule,
        ContentModerationComponent,
      ],
      providers: [
        FormBuilder,
        {
          provide: MEDIA_SERVICE_TOKEN,
          useValue: jasmine.createSpyObj<IMediaService>('IMediaService', {
            getPendingModerationMedia: Promise.resolve(mockMediaItems),
            moderateMedia: Promise.resolve(void 0),
          }),
        },
        {
          provide: NOTIFICATION_SERVICE_TOKEN,
          useValue: jasmine.createSpyObj<INotificationService>('INotificationService', [
            'showSuccess',
            'showError',
            'showWarning',
            'showInfo',
          ]),
        },
        {
          provide: CONTENT_SANITIZER_TOKEN,
          useValue: jasmine.createSpyObj<IContentSanitizerService>('IContentSanitizerService', {
            sanitizeUrl: safeUrl,
          }),
        },
        {
          provide: DomSanitizer,
          useValue: jasmine.createSpyObj<DomSanitizer>('DomSanitizer', {
            bypassSecurityTrustUrl: safeUrl,
          }),
        },
      ],
    }).compileComponents();

    mediaService = TestBed.inject(MEDIA_SERVICE_TOKEN) as jasmine.SpyObj<IMediaService>;
    notificationService = TestBed.inject(
      NOTIFICATION_SERVICE_TOKEN,
    ) as jasmine.SpyObj<INotificationService>;
    contentSanitizer = TestBed.inject(
      CONTENT_SANITIZER_TOKEN,
    ) as jasmine.SpyObj<IContentSanitizerService>;
    domSanitizer = TestBed.inject(DomSanitizer) as jasmine.SpyObj<DomSanitizer>;

    fixture = TestBed.createComponent(ContentModerationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.loading).toBeFalse();
    expect(component.error).toBe('');
    expect(component.showModerationDialog).toBeFalse();
    expect(component.pendingMedia).toEqual([]);
    expect(component.searchTerm).toBe('');
    expect(component.mediaTypeFilter).toBe('all');
    expect(component.sortOrder).toBe('newest');
    expect(component.currentPage).toBe(1);
    expect(component.itemsPerPage).toBe(12);
  });

  it('should load pending media on init', fakeAsync(() => {
    mediaService.getPendingModerationMedia.and.returnValue(Promise.resolve(mockMediaItems));

    component.ngOnInit();
    tick();

    expect(mediaService.getPendingModerationMedia).toHaveBeenCalled();
    expect(component.pendingMedia).toEqual(mockMediaItems);
    expect(component.filteredMedia.length).toBe(2);
    expect(component.loading).toBeFalse();
  }));

  describe('Filtering and Sorting', () => {
    beforeEach(fakeAsync(() => {
      mediaService.getPendingModerationMedia.and.returnValue(Promise.resolve(mockMediaItems));
      component.ngOnInit();
      tick();
    }));

    it('should filter by media type', () => {
      component.mediaTypeFilter = 'video';
      component.applyFilters();

      expect(component.filteredMedia.length).toBe(1);
      expect(component.filteredMedia[0].type).toBe('video');
    });

    it('should filter by search term', () => {
      component.searchTerm = 'video';
      component.applyFilters();

      expect(component.filteredMedia.length).toBe(1);
      expect(component.filteredMedia[0].adTitle).toContain('Video');
    });

    it('should sort by newest first', () => {
      component.sortOrder = 'newest';
      component.applyFilters();

      expect(component.filteredMedia[0]._id).toBe('2');
      expect(component.filteredMedia[1]._id).toBe('1');
    });

    it('should sort by oldest first', () => {
      component.sortOrder = 'oldest';
      component.applyFilters();

      expect(component.filteredMedia[0]._id).toBe('1');
      expect(component.filteredMedia[1]._id).toBe('2');
    });

    it('should reset filters', () => {
      component.searchTerm = 'test';
      component.mediaTypeFilter = 'video';
      component.sortOrder = 'oldest';
      component.currentPage = 2;

      component.resetFilters();

      expect(component.searchTerm).toBe('');
      expect(component.mediaTypeFilter).toBe('all');
      expect(component.sortOrder).toBe('newest');
      expect(component.currentPage).toBe(1);
    });
  });

  describe('Pagination', () => {
    beforeEach(fakeAsync(() => {
      const extraItems = Array.from(
        { length: 15 },
        (_, i) =>
          ({
            _id: `${i + 3}`,
            adId: `ad${i + 3}`,
            adTitle: `Test Item ${i + 3}`,
            type: i % 2 === 0 ? 'image' : 'video',
            url: `http://example.com/media${i + 3}`,
            createdAt: new Date(`2023-01-${(i + 3).toString().padStart(2, '0')}`),
          }) as IPendingMedia,
      );

      mediaService.getPendingModerationMedia.and.returnValue(
        Promise.resolve([...mockMediaItems, ...extraItems]),
      );
      component.ngOnInit();
      tick();
    }));

    it('should handle page changes', () => {
      const pageEvent: PaginatorPageChangeEvent = {
        page: 1,
        first: 12,
        rows: 12,
        pageCount: 2,
      };
      component.onPageChange(pageEvent);

      expect(component.currentPage).toBe(2);
      expect(component.paginatedMedia.length).toBeLessThanOrEqual(component.itemsPerPage);
    });

    it('should calculate total pages correctly', () => {
      const expectedPages = Math.ceil(component.pendingMedia.length / component.itemsPerPage);
      expect(component.totalPages).toBe(expectedPages);
    });
  });

  describe('Moderation Form', () => {
    beforeEach(() => {
      component.selectedMedia = mockMediaItems[0];
      component.showModerationDialog = true;
    });

    it('should initialize form with default values', () => {
      expect(component.moderationForm.get('status')?.value).toBe('approved');
      expect(component.moderationForm.get('notes')?.value).toBe('');
    });

    it('should validate required fields', () => {
      const form = component.moderationForm;
      form.controls['status'].setValue('');
      form.controls['notes'].setValue('');

      expect(form.valid).toBeFalse();
      expect(form.controls['status'].errors?.['required']).toBeTrue();
      expect(form.controls['notes'].errors?.['required']).toBeTrue();
    });

    it('should validate notes max length', () => {
      const form = component.moderationForm;
      form.controls['notes'].setValue('a'.repeat(501));

      expect(form.valid).toBeFalse();
      expect(form.controls['notes'].errors?.['maxlength']).toBeTrue();
    });

    it('should submit moderation request', fakeAsync(() => {
      const form = component.moderationForm;
      form.controls['status'].setValue('approved');
      form.controls['notes'].setValue('Looks good');

      mediaService.moderateMedia.and.returnValue(Promise.resolve());

      component.submitModeration();
      tick();

      expect(mediaService.moderateMedia).toHaveBeenCalledWith(
        mockMediaItems[0].adId,
        mockMediaItems[0]._id,
        'approved',
        'Looks good',
      );
      expect(notificationService.showSuccess).toHaveBeenCalled();
      expect(component.showModerationDialog).toBeFalse();
    }));

    it('should handle moderation request errors', fakeAsync(() => {
      mediaService.moderateMedia.and.returnValue(Promise.reject(new Error('Moderation failed')));

      component.submitModeration();
      tick();

      expect(notificationService.showError).toHaveBeenCalled();
      expect(component.showModerationDialog).toBeTrue();
    }));
  });
});
