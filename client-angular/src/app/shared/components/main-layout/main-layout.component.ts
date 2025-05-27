import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

/**
 *
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="main-layout">
      <header>Header</header>
      <main>
        <ng-content></ng-content>
      </main>
      <footer>Footer</footer>
    </div>
  `,
  styles: [
    `
      .main-layout {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }
      header {
        background: #f0f0f0;
        padding: 1rem;
      }
      main {
        flex: 1;
        padding: 1rem;
      }
      footer {
        background: #f0f0f0;
        padding: 1rem;
      }
    `,
  ],
})
export class MainLayoutComponent {
  /**
   *
   */
  onThemeChange(value: boolean): void {
    console.log('Theme changed:', value ? 'dark' : 'light');
  }
}
