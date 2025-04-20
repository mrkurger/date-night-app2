import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NotesDialogComponent, NotesDialogData } from './notes-dialog.component';

describe('NotesDialogComponent', () => {
  let component: NotesDialogComponent;
  let fixture: ComponentFixture<NotesDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<NotesDialogComponent>>;

  const mockDialogData: NotesDialogData = {
    title: 'Test Title',
    notes: 'Test Notes',
    maxLength: 500,
    placeholder: 'Test Placeholder',
  };

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        NoopAnimationsModule,
        NotesDialogComponent,
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: MatDialogRef, useValue: dialogRefSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with the provided notes', () => {
    expect(component.notes).toBe('Test Notes');
  });

  it('should close the dialog with no result when cancel is clicked', () => {
    component.onCancel();
    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });

  it('should close the dialog with the notes when save is clicked', () => {
    component.notes = 'Updated Notes';
    component.onSave();
    expect(dialogRefSpy.close).toHaveBeenCalledWith('Updated Notes');
  });

  it('should display the dialog title', () => {
    const titleElement = fixture.nativeElement.querySelector('h2');
    expect(titleElement.textContent).toBe('Test Title');
  });
});
