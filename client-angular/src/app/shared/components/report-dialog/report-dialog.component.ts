import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

/**
 *
 */
@Component({
  selector: 'app-report-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `<div>Report Dialog Placeholder</div>`,
})
export class ReportDialogComponent {
  /**
   *
   */
  onClose(): void {
    console.log('Dialog closed');
  }
}
