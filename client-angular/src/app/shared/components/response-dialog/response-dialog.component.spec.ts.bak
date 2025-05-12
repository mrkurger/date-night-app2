/// <reference types="jasmine" />

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import {
  NbDialogRef,
  NbCardModule,
  NbButtonModule,
  NbIconModule,
  NbFormFieldModule,
  NbInputModule,
  NB_DIALOG_CONFIG,
} from '@nebular/theme';
import { ResponseDialogComponent, ResponseDialogData } from './response-dialog.component';

describe('ResponseDialogComponent', () => {
  let component: ResponseDialogComponent;
  let fixture: ComponentFixture<ResponseDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<NbDialogRef<ResponseDialogComponent>>;
  const mockData: ResponseDialogData = {
    title: 'Test Title',
    reviewTitle: 'Test Review',
    reviewContent: 'Test Content',
  };

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('NbDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        NbCardModule,
        NbButtonModule,
        NbIconModule,
        NbFormFieldModule,
        NbInputModule,
      ],
      providers: [
        { provide: NbDialogRef, useValue: dialogRefSpy },
        { provide: NB_DIALOG_CONFIG, useValue: { data: mockData } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResponseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should initialize form with empty response', () => {
    expect(component.responseForm.get('response')?.value).toEqual('');
  });

  it('should display dialog data', () => {
    const titleElement = fixture.nativeElement.querySelector('h2');
    const reviewTitleElement = fixture.nativeElement.querySelector('.review-preview h3');
    const reviewContentElement = fixture.nativeElement.querySelector('.review-preview p');

    expect(titleElement.textContent).toMatch(mockData.title);
    expect(reviewTitleElement.textContent).toMatch(mockData.reviewTitle!);
    expect(reviewContentElement.textContent).toMatch(mockData.reviewContent!);
  });

  it('should validate form input', () => {
    const responseControl = component.responseForm.get('response');
    expect(responseControl?.valid).toEqual(false);
    expect(responseControl?.errors?.['required']).toBeDefined();

    responseControl?.setValue('short');
    expect(responseControl?.errors?.['minlength']).toBeDefined();

    responseControl?.setValue('a'.repeat(1001));
    expect(responseControl?.errors?.['maxlength']).toBeDefined();

    responseControl?.setValue('valid response text');
    expect(responseControl?.valid).toEqual(true);
  });

  it('should close dialog on cancel', () => {
    component.onClose();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should submit response and close dialog', fakeAsync(() => {
    const response = 'test response';
    component.responseForm.get('response')?.setValue(response);
    component.onSubmit();

    expect(component.submitting).toEqual(true);
    tick(500);
    expect(dialogRefSpy.close).toHaveBeenCalledWith(response);
    expect(component.submitting).toEqual(false);
  }));

  it('should not submit invalid form', () => {
    component.onSubmit();
    expect(dialogRefSpy.close).not.toHaveBeenCalled();
  });
});
