// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (theme-toggle.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';
import { Subscription } from 'rxjs';

/**
 * Theme toggle component
 * Provides a toggle button for switching between light and dark themes
 * Can be used in different modes: icon-only, with-label, or as a toggle switch
 */
@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class ThemeToggleComponent implements OnInit, OnDestroy {
  /**
   * Display mode for the toggle
   * - 'icon-only': Just shows a sun/moon icon
   * - 'with-label': Shows icon with a text label
   * - 'toggle': Shows a toggle switch with label
   */
  @Input() mode: 'icon-only' | 'with-label' | 'toggle' = 'icon-only';

  /**
   * Label to display when mode is 'with-label' or 'toggle'
   */
  @Input() label = 'Dark Mode';

  /**
   * Position of the label relative to the toggle
   */
  @Input() labelPosition: 'left' | 'right' = 'left';

  /**
   * ARIA label for accessibility
   */
  @Input() ariaLabel = 'Toggle dark mode';

  /**
   * Whether dark mode is currently active
   */
  isDarkMode = false;

  private subscription: Subscription | null = null;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    // Subscribe to theme changes
    this.subscription = this.themeService.isDarkMode$.subscribe((isDarkMode) => {
      this.isDarkMode = isDarkMode;
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /**
   * Toggle the theme
   */
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  /**
   * Get the appropriate icon based on the current theme
   */
  get themeIcon(): string {
    return this.isDarkMode ? 'fa-sun' : 'fa-moon';
  }

  /**
   * Get the appropriate ARIA label based on the current theme
   */
  get themeAriaLabel(): string {
    return this.isDarkMode ? 'Switch to light mode' : 'Switch to dark mode';
  }
}
