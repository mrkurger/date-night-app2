import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

/**
 *
 */
@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button (click)="toggleTheme()" class="theme-toggle">
      {{ isDarkTheme ? '☀️' : '🌙' }}
    </button>
  `,
  styles: [
    `
      .theme-toggle {
        background: none;
        border: 1px solid #ccc;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        cursor: pointer;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .theme-toggle:hover {
        background-color: #f0f0f0;
      }
    `,
  ],
})
export class ThemeToggleComponent {
  isDarkTheme = false;

  /**
   *
   */
  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    // TODO: Implement actual theme switching logic
    document.body.classList.toggle('dark-theme', this.isDarkTheme);
  }
}
