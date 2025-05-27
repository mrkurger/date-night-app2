import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

/**
 *
 */
@Component({
  selector: 'app-response-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `<div>Response Dialog Placeholder</div>`,
})
export class ResponseDialogComponent {
  /**
   *
   */
  cancel(): void {
    console.log('Dialog cancelled');
  }
}
