import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

/**
 *
 */
@Component({
  selector: 'app-chat-settings',
  standalone: true,
  imports: [CommonModule],
  template: `<div>Chat Settings Placeholder</div>`,
})
export class ChatSettingsComponent {
  @Input() roomId: string = '';
  @Output() settingsChanged = new EventEmitter<any>();

  isSaving = false;
  saveSuccess = false;
  saveError = false;

  /**
   *
   */
  saveSettings(): void {
    this.isSaving = true;
    // Simulate save
    setTimeout(() => {
      this.isSaving = false;
      this.saveSuccess = true;
      this.settingsChanged.emit({});
    }, 1000);
  }
}
