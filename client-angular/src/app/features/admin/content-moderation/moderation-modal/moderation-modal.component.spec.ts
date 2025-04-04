import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SimpleChange } from '@angular/core';

import { ModerationModalComponent } from './moderation-modal.component';
import { ContentSanitizerService } from '../../../../core/services/content-sanitizer.service';
import { PendingMedia } from '../../../../core/models/media.interface';

describe('ModerationModalComponent', () => {
  let component: ModerationModalComponent;
  let fixture: ComponentFixture<ModerationModalComponent>;
  let contentSanitizerServiceSpy: jasmine.SpyObj<ContentSanitizerService>;
  let formBuilder: FormBuilder;

  const mockMedia: PendingMedia = {
    _id: '1',
    adId: 'ad1',
    adTitle: 'Test Ad 1',
    type: 'image',
    url: 'https://example.com/image1.jpg',
    createdAt: new Date('2023-01-01')
  };

  beforeEach(async () => {
    contentSanitizerServiceSpy = jasmine.createSpyObj('ContentSanitizerService', ['sanitizeUrl', 'isValidUrl']);
    contentSanitizerServiceSpy.sanitizeUrl.and.returnValue('safe-url');
    contentSanitizerServiceSpy.isValidUrl.and.returnValue(true);

    await TestBed.configureTestingModule({
      declarations: [ModerationModalComponent],
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: ContentSanitizerService, useValue: contentSanitizerServiceSpy }
      ]
    }).compileComponents();

    formBuilder = TestBed.inject(FormBuilder);
    fixture = TestBed.createComponent(ModerationModalComponent);
    component = fixture.componentInstance;
    
    // Create a form for testing
    component.form = formBuilder.group({
      status: ['approved', [Validators.required]],
      notes: ['', [Validators.maxLength(500), Validators.required]]
    });
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should sanitize media URL on changes', () => {
    component.media = mockMedia;
    
    component.ngOnChanges({
      media: new SimpleChange(null, mockMedia, true)
    });
    
    expect(contentSanitizerServiceSpy.isValidUrl).toHaveBeenCalledWith(mockMedia.url);
    expect(contentSanitizerServiceSpy.sanitizeUrl).toHaveBeenCalledWith(mockMedia.url);
    expect(component.safeMediaUrl).toBe('safe-url');
    expect(component.mediaError).toBeFalse();
  });

  it('should handle invalid URLs', () => {
    contentSanitizerServiceSpy.isValidUrl.and.returnValue(false);
    
    component.media = mockMedia;
    
    component.ngOnChanges({
      media: new SimpleChange(null, mockMedia, true)
    });
    
    expect(contentSanitizerServiceSpy.isValidUrl).toHaveBeenCalledWith(mockMedia.url);
    expect(contentSanitizerServiceSpy.sanitizeUrl).not.toHaveBeenCalled();
    expect(component.mediaError).toBeTrue();
  });

  it('should toggle fullscreen mode', () => {
    expect(component.isFullscreen).toBeFalse();
    
    component.toggleFullscreen();
    expect(component.isFullscreen).toBeTrue();
    
    component.toggleFullscreen();
    expect(component.isFullscreen).toBeFalse();
  });

  it('should emit submit event when form is valid', () => {
    spyOn(component.onSubmit, 'emit');
    
    component.form.setValue({
      status: 'approved',
      notes: 'Test notes'
    });
    
    component.validateAndSubmit();
    
    expect(component.onSubmit.emit).toHaveBeenCalled();
  });

  it('should not emit submit event when form is invalid', () => {
    spyOn(component.onSubmit, 'emit');
    
    component.form.setValue({
      status: 'approved',
      notes: '' // Empty notes, which is invalid
    });
    
    component.validateAndSubmit();
    
    expect(component.onSubmit.emit).not.toHaveBeenCalled();
  });

  it('should handle media loading errors', () => {
    component.mediaError = false;
    
    component.onMediaError();
    
    expect(component.mediaError).toBeTrue();
  });
});