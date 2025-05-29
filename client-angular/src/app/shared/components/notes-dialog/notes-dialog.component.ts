import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

/**
 *
 */
@Component({
  selector: 'app-notes-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `<div>Notes Dialog Placeholder</div>`,
})
export class NotesDialogComponent implements OnInit {
  notes = '';
  data: any = {};

  /**
   *
   */
  ngOnInit(): void {
    this.notes = this.data?.notes || '';
  }

  /**
   *
   */
  onCancel(): void {
    console.log('Dialog cancelled');
  }

  /**
   *
   */
  onSave(): void {
    console.log('Notes saved:', this.notes);
  }
}
