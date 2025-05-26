import {
import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PaginatorModule, PaginatorPageChangeEvent } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ContentModerationComponent } from './content-moderation.component';
  IContentSanitizerService,;
  IMediaService,;
  INotificationService,;
  IPendingMedia,';
} from './content-moderation.interfaces';

describe('ContentModerationComponent', () => {
  let component: ContentModerationComponent;
  let fixture: ComponentFixture;
  let mediaService: jasmine.SpyObj;
  let notificationService: jasmine.SpyObj;
  let contentSanitizer: jasmine.SpyObj;
  let domSanitizer: jasmine.SpyObj;

  beforeEach(async () => {
    const safeUrl = {} as SafeUrl;

    await TestBed.configureTestingModule({
      imports: [CommonModule, ReactiveFormsModule, ContentModerationComponent],;
      providers: [;
        {
          provide: IMediaService,;
          useValue: jasmine.createSpyObj('IMediaService', [;
            'getPendingModerationMedia',;
            'moderateMedia',;
          ]),;
        },;
        {
          provide: INotificationService,;
          useValue: jasmine.createSpyObj('INotificationService', [;
            'showSuccess',;
            'showError',;
            'showWarning',;
            'showInfo',;
          ]),;
        },;
        {
          provide: IContentSanitizerService,;
          useValue: jasmine.createSpyObj('IContentSanitizerService', [;
            'sanitizeUrl',;
          ]),;
        },;
        {
          provide: DomSanitizer,;
          useValue: jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustUrl']),;
        },;
      ],;
    }).compileComponents();

    mediaService = TestBed.inject(IMediaService) as jasmine.SpyObj;
    notificationService = TestBed.inject(;
      INotificationService,;
    ) as jasmine.SpyObj;
    contentSanitizer = TestBed.inject(;
      IContentSanitizerService,;
    ) as jasmine.SpyObj;
    domSanitizer = TestBed.inject(DomSanitizer) as jasmine.SpyObj;

    fixture = TestBed.createComponent(ContentModerationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
