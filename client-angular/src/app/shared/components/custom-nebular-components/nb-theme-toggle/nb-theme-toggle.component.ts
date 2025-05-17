import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ThemeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'nb-theme-toggle',
  template: `
    <div class="theme-toggle">
      <button
        nbButton
        ghost
        size="small"
        [nbTooltip]="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
        (click)="toggleTheme()"
      >
        <nb-icon
          [icon]="isDarkMode ? 'sun-outline' : 'moon-outline'"
          [class.rotate]="isAnimating"
          (animationend)="onAnimationEnd()"
        ></nb-icon>
      </button>
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

        &:hover {
          background-color: nb-theme(background-basic-hover-color);
        }
      }

      nb-icon {
        font-size: 1.25rem;
        color: nb-theme(text-basic-color);
        transition: transform 0.3s ease-in-out;

        &.rotate {
          transform: rotate(360deg);
        }
      }

      :host-context(.dark-theme) {
        nb-icon {
          color: nb-theme(text-basic-color);
        }
      }
    `,
  ],
})
export class NbThemeToggleComponent implements OnInit, OnDestroy {
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
