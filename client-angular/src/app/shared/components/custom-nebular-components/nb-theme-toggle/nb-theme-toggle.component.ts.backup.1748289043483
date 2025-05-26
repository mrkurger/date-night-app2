import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ThemeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-primeng-theme-toggle',
  template: `
    <div class="theme-toggle">
      <button
        pButton
        icon="pi pi-{{ isDarkMode ? 'sun' : 'moon' }}"
        class="p-button-rounded p-button-text"
        [title]="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
        (click)="toggleTheme()"
        [ngClass]="{ rotate: isAnimating }"
        (animationend)="onAnimationEnd()"
      ></button>
    </div>
  `,
  styles: [
    `
      .theme-toggle {
        display: flex;
        align-items: center;
      }

      button {
        padding: 0.5rem;
        border-radius: 50%;
        transition: background-color 0.2s;
      }

      button.rotate {
        animation: rotate 0.3s linear;
      }

      @keyframes rotate {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
  standalone: true,
})
export class PrimeNGThemeToggleComponent implements OnInit, OnDestroy {
  isDarkMode = false;
  isAnimating = false;
  private destroy$ = new Subject<void>();

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.themeService
      .getDarkMode()
      .pipe(takeUntil(this.destroy$))
      .subscribe((isDark) => {
        this.isDarkMode = isDark;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleTheme() {
    this.isAnimating = true;
    this.themeService.toggleDarkMode();
  }

  onAnimationEnd() {
    this.isAnimating = false;
  }
}
