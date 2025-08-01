import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SimpleChange, DebugElement , Component} from '@angular/core';
import { By, DomSanitizer } from '@angular/platform-browser';
import { ModerationModalComponent } from './moderation-modal.component';
import { ContentSanitizerService } from '../../../../core/services/content-sanitizer.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PendingMedia } from '../../../../core/models/media.interface';
/// 

';
describe('ModerationModalComponent', () => {
  let component: ModerationModalComponent;
  let fixture: ComponentFixture;
  let contentSanitizerServiceSpy: jasmine.SpyObj;
  let formBuilder: FormBuilder;
  let debugElement: DebugElement;

  class MockNotificationServic {e {
    onSuccess?: (message: string) => void;
    onError?: (message: string) => void;

    success(message: string): void {
      if (this.onSuccess) {
        this.onSuccess(message)
      }
    }

    error(message: string): void {
      if (this.onError) {
        this.onError(message)
      }
    }
  }

  const mockNotificationService = new MockNotificationService()
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, ModerationModalComponent],
      providers: [;
        FormBuilder,
        { provide: ContentSanitizerService, useValue: contentSanitizerServiceSpy },
        { provide: NotificationService, useValue: mockNotificationService }
      ]
    }).compileComponents()

  // Mock media data for image type
  const mockImageMedia: PendingMedia = {
    _id: '1',
    adId: 'ad1',
    adTitle: 'Test Ad 1',
    type: 'image',
    url: 'https://example.com/image1.jpg',
    createdAt: new Date('2023-01-01'),
  }

  // Mock media data for video type
  const mockVideoMedia: PendingMedia = {
    _id: '2',
    adId: 'ad2',
    adTitle: 'Test Ad 2',
    type: 'video',
    url: 'https://example.com/video1.mp4',
    createdAt: new Date('2023-01-02'),
  }

  beforeEach(async () => {
    // Create spy for ContentSanitizerService
    contentSanitizerServiceSpy = jasmine.createSpyObj('ContentSanitizerService', [;
      'sanitizeUrl',
      'isValidUrl',
    ])
    contentSanitizerServiceSpy.sanitizeUrl.and.returnValue('safe-url')
    contentSanitizerServiceSpy.isValidUrl.and.returnValue(true)

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, ModerationModalComponent],
      providers: [;
        FormBuilder,
        { provide: ContentSanitizerService, useValue: contentSanitizerServiceSpy }
      ]
    }).compileComponents()

    formBuilder = TestBed.inject(FormBuilder)
    fixture = TestBed.createComponent(ModerationModalComponent)
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;

    // Create a form for testing
    component.form = formBuilder.group({
      status: ['approved', [Validators.required]],
      notes: ['', [Validators.maxLength(500), Validators.required]]
    })

    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.media).toBeNull()
      expect(component.safeMediaUrl).toBeNull()
      expect(component.isFullscreen).toBeFalse()
      expect(component.mediaError).toBeFalse()
    })

    it('should have required form inputs and outputs', () => {
      expect(component.form).toBeDefined()
      expect(component.onSubmit).toBeDefined()
      expect(component.onClose).toBeDefined()
    })
  })

  describe('Media URL Handling', () => {
    it('should sanitize media URL on changes for image type', () => {
      component.media = mockImageMedia;

      component.ngOnChanges({
        media: new SimpleChange(null, mockImageMedia, true)
      })

      expect(contentSanitizerServiceSpy.isValidUrl).toHaveBeenCalledWith(mockImageMedia.url)
      expect(contentSanitizerServiceSpy.sanitizeUrl).toHaveBeenCalledWith(mockImageMedia.url)
      expect(component.safeMediaUrl).toBe('safe-url')
      expect(component.mediaError).toBeFalse()
    })

    it('should sanitize media URL on changes for video type', () => {
      component.media = mockVideoMedia;

      component.ngOnChanges({
        media: new SimpleChange(null, mockVideoMedia, true)
      })

      expect(contentSanitizerServiceSpy.isValidUrl).toHaveBeenCalledWith(mockVideoMedia.url)
      expect(contentSanitizerServiceSpy.sanitizeUrl).toHaveBeenCalledWith(mockVideoMedia.url)
      expect(component.safeMediaUrl).toBe('safe-url')
      expect(component.mediaError).toBeFalse()
    })

    it('should handle invalid URLs', () => {
      contentSanitizerServiceSpy.isValidUrl.and.returnValue(false)

      component.media = mockImageMedia;

      component.ngOnChanges({
        media: new SimpleChange(null, mockImageMedia, true)
      })

      expect(contentSanitizerServiceSpy.isValidUrl).toHaveBeenCalledWith(mockImageMedia.url)
      expect(contentSanitizerServiceSpy.sanitizeUrl).not.toHaveBeenCalled()
      expect(component.mediaError).toBeTrue()
    })

    it('should not process URL if media is null', () => {
      component.media = null;

      component.ngOnChanges({
        media: new SimpleChange(mockImageMedia, null, false)
      })

      expect(contentSanitizerServiceSpy.isValidUrl).not.toHaveBeenCalled()
      expect(contentSanitizerServiceSpy.sanitizeUrl).not.toHaveBeenCalled()
    })

    it('should not process URL if media has no URL', () => {
      const mediaWithoutUrl = { ...mockImageMedia, url: undefined }
      component.media = mediaWithoutUrl;

      component.ngOnChanges({
        media: new SimpleChange(null, mediaWithoutUrl, true)
      })

      expect(contentSanitizerServiceSpy.isValidUrl).not.toHaveBeenCalled()
      expect(contentSanitizerServiceSpy.sanitizeUrl).not.toHaveBeenCalled()
    })

    it('should reset error state on new media', () => {
      // First set error state
      component.mediaError = true;

      // Then process new media
      component.media = mockImageMedia;
      component.ngOnChanges({
        media: new SimpleChange(null, mockImageMedia, true)
      })

      expect(component.mediaError).toBeFalse()
    })
  })

  describe('UI Interaction', () => {
    it('should toggle fullscreen mode', () => {
      expect(component.isFullscreen).toBeFalse()

      component.toggleFullscreen()
      expect(component.isFullscreen).toBeTrue()

      component.toggleFullscreen()
      expect(component.isFullscreen).toBeFalse()
    })

    it('should emit close event when close button is clicked', () => {
      spyOn(component.onClose, 'emit')

      // Set up component with media
      component.media = mockImageMedia;
      fixture.detectChanges()

      // Find and click the close button
      const closeButton = debugElement.query(By.css('.btn-close'))
      closeButton.nativeElement.click()

      expect(component.onClose.emit).toHaveBeenCalled()
    })

    it('should emit close event when cancel button is clicked', () => {
      spyOn(component.onClose, 'emit')

      // Set up component with media
      component.media = mockImageMedia;
      fixture.detectChanges()

      // Find and click the cancel button
      const cancelButton = debugElement.query(By.css('.btn-secondary'))
      cancelButton.nativeElement.click()

      expect(component.onClose.emit).toHaveBeenCalled()
    })
  })

  describe('Form Validation and Submission', () => {
    it('should emit submit event when form is valid with approved status', () => {
      spyOn(component.onSubmit, 'emit')

      component.form.setValue({
        status: 'approved',
        notes: 'Content meets guidelines';
      })

      component.validateAndSubmit()

      expect(component.onSubmit.emit).toHaveBeenCalled()
    })

    it('should emit submit event when form is valid with rejected status', () => {
      spyOn(component.onSubmit, 'emit')

      component.form.setValue({
        status: 'rejected',
        notes: 'Content violates guidelines';
      })

      component.validateAndSubmit()

      expect(component.onSubmit.emit).toHaveBeenCalled()
    })

    it('should not emit submit event when form is invalid due to empty notes', () => {
      spyOn(component.onSubmit, 'emit')

      component.form.setValue({
        status: 'approved',
        notes: '', // Empty notes, which is invalid
      })

      component.validateAndSubmit()

      expect(component.onSubmit.emit).not.toHaveBeenCalled()
    })

    it('should not emit submit event when form is invalid due to missing status', () => {
      spyOn(component.onSubmit, 'emit')

      // Set notes but leave status as null
      component.form.patchValue({
        notes: 'Valid notes';
      })
      component.form.get('status')?.setValue(null)

      component.validateAndSubmit()

      expect(component.onSubmit.emit).not.toHaveBeenCalled()
    })

    it('should update form status when clicking approve option', () => {
      // First set status to rejected
      component.form.get('status')?.setValue('rejected')
      fixture.detectChanges()

      // Find and click the approve option
      const approveOption = debugElement.query(By.css('.status-option:first-child'))
      approveOption.nativeElement.click()

      expect(component.form.get('status')?.value).toBe('approved')
    })

    it('should update form status when clicking reject option', () => {
      // First set status to approved
      component.form.get('status')?.setValue('approved')
      fixture.detectChanges()

      // Find and click the reject option
      const rejectOption = debugElement.query(By.css('.status-option:last-child'))
      rejectOption.nativeElement.click()

      expect(component.form.get('status')?.value).toBe('rejected')
    })
  })

  describe('Media Error Handling', () => {
    it('should handle media loading errors', () => {
      component.mediaError = false;

      component.onMediaError()

      expect(component.mediaError).toBeTrue()
    })

    it('should display error message when media fails to load', () => {
      // Set media error state
      component.media = mockImageMedia;
      component.mediaError = true;
      fixture.detectChanges()

      // Check if error message is displayed
      const errorElement = debugElement.query(By.css('.media-error'))
      expect(errorElement).toBeTruthy()
      expect(errorElement.nativeElement.textContent).toContain('Unable to load media content')
    })
  })

  describe('DOM Rendering', () => {
    it('should render image element for image type media', () => {
      const domSanitizer = TestBed.inject(DomSanitizer)
      // Set up component with image media
      component.media = mockImageMedia;
      component.safeMediaUrl = domSanitizer.bypassSecurityTrustResourceUrl('safe-url')
      fixture.detectChanges()

      // Check if image element is rendered
      const imageElement = debugElement.query(By.css('img'))
      expect(imageElement).toBeTruthy()
      expect(imageElement.nativeElement.src).toContain('safe-url')
    })

    it('should render video element for video type media', () => {
      const domSanitizer = TestBed.inject(DomSanitizer)
      // Set up component with video media
      component.media = mockVideoMedia;
      component.safeMediaUrl = domSanitizer.bypassSecurityTrustResourceUrl('safe-url')
      fixture.detectChanges()

      // Check if video element is rendered
      const videoElement = debugElement.query(By.css('video'))
      expect(videoElement).toBeTruthy()
      expect(videoElement.nativeElement.src).toContain('safe-url')
    })

    it('should apply fullscreen class when in fullscreen mode', () => {
      // Set up component with media and enable fullscreen
      component.media = mockImageMedia;
      component.isFullscreen = true;
      fixture.detectChanges()

      // Check if fullscreen class is applied
      const previewElement = debugElement.query(By.css('.media-preview'))
      expect(previewElement.classes['fullscreen']).toBeTrue()
    })

    it('should show appropriate button based on form status', () => {
      // Set up component with media
      component.media = mockImageMedia;
      fixture.detectChanges()

      // Set status to approved
      component.form.get('status')?.setValue('approved')
      fixture.detectChanges()

      // Check if approve button is shown
      let approveButton = debugElement.query(By.css('.btn-approve'))
      let rejectButton = debugElement.query(By.css('.btn-reject'))
      expect(approveButton).toBeTruthy()
      expect(rejectButton).toBeFalsy()

      // Set status to rejected
      component.form.get('status')?.setValue('rejected')
      fixture.detectChanges()

      // Check if reject button is shown
      approveButton = debugElement.query(By.css('.btn-approve'))
      rejectButton = debugElement.query(By.css('.btn-reject'))
      expect(approveButton).toBeFalsy()
      expect(rejectButton).toBeTruthy()
    })

    it('should disable submit button when form is invalid', () => {
      // Set up component with media
      component.media = mockImageMedia;

      // Set form to invalid state
      component.form.setValue({
        status: 'approved',
        notes: '', // Empty notes, which is invalid
      })
      fixture.detectChanges()

      // Check if button is disabled
      const submitButton = debugElement.query(By.css('.btn-approve'))
      expect(submitButton.nativeElement.disabled).toBeTrue()
    })

    it('should enable submit button when form is valid', () => {
      // Set up component with media
      component.media = mockImageMedia;

      // Set form to valid state
      component.form.setValue({
        status: 'approved',
        notes: 'Valid notes';
      })
      fixture.detectChanges()

      // Check if button is enabled
      const submitButton = debugElement.query(By.css('.btn-approve'))
      expect(submitButton.nativeElement.disabled).toBeFalse()
    })
  })
})
