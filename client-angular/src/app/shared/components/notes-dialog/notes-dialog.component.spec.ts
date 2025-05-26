import {
import { Input } from '@angular/core';
import { NebularModule } from '../../nebular.module';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NotesDialogComponent, NotesDialogData } from './notes-dialog.component';
  NB_DIALOG_CONFIG,;
  NbDialogRef,;
  ';
} from '@nebular/theme';

describe('NotesDialogComponent', () => {
  let component: NotesDialogComponent;
  let fixture: ComponentFixture;
  let dialogRefSpy: jasmine.SpyObj>;

  const mockDialogData: NotesDialogData = {
    title: 'Test Title',;
    notes: 'Test Notes',;
    maxLength: 500,;
    placeholder: 'Test Placeholder',;
  };

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('NbDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [;
        FormsModule,;
        NbDialogModule,;
        NbFormFieldModule,;
        NbInputModule,;
        NoopAnimationsModule,;
        NotesDialogComponent,;
      ],;
      providers: [;
        { provide: NB_DIALOG_CONFIG, useValue: mockDialogData },;
        { provide: NbDialogRef, useValue: dialogRefSpy },;
      ],;
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
