import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark' | 'system';

/**
 * Service for managing application theme
 * Handles theme switching, persistence, and system preference detection
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private renderer: Renderer2;
  private themeSubject = new BehaviorSubject<Theme>(this.getInitialTheme());
  private darkModeMediaQuery: MediaQueryList;

  /**
   * Observable that emits the current theme
   */
  public theme$: Observable<Theme> = this.themeSubject.asObservable();

  /**
   * Observable that emits whether dark mode is currently active
   */
  private isDarkModeSubject = new BehaviorSubject<boolean>(false);
  public isDarkMode$: Observable<boolean> = this.isDarkModeSubject.asObservable();

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Initialize theme
    this.applyTheme(this.themeSubject.value);

    // Listen for system preference changes
    this.darkModeMediaQuery.addEventListener('change', e => {
      if (this.themeSubject.value === 'system') {
        this.updateThemeClasses(e.matches ? 'dark' : 'light');
        this.isDarkModeSubject.next(e.matches);
      }
    });
  }

  /**
   * Set the application theme
   * @param theme The theme to set ('light', 'dark', or 'system')
   */
  public setTheme(theme: Theme): void {
    this.themeSubject.next(theme);
    localStorage.setItem('theme', theme);
    this.applyTheme(theme);
  }

  /**
   * Toggle between light and dark themes
   * If current theme is 'system', it will switch to either 'light' or 'dark'
   * based on the current system preference
   */
  public toggleTheme(): void {
    const currentTheme = this.themeSubject.value;
    const isDarkMode = this.isDarkModeSubject.value;

    if (currentTheme === 'system') {
      // If system preference is dark, switch to light, otherwise switch to dark
      this.setTheme(isDarkMode ? 'light' : 'dark');
    } else {
      // Toggle between light and dark
      this.setTheme(currentTheme === 'light' ? 'dark' : 'light');
    }
  }

  /**
   * Get the current theme
   * @returns The current theme
   */
  public getCurrentTheme(): Theme {
    return this.themeSubject.value;
  }

  /**
   * Check if dark mode is currently active
   * @returns True if dark mode is active, false otherwise
   */
  public isDarkMode(): boolean {
    return this.isDarkModeSubject.value;
  }

  /**
   * Apply the specified theme
   * @param theme The theme to apply
   */
  private applyTheme(theme: Theme): void {
    if (theme === 'system') {
      // Use system preference
      const prefersDark = this.darkModeMediaQuery.matches;
      this.updateThemeClasses(prefersDark ? 'dark' : 'light');
      this.isDarkModeSubject.next(prefersDark);
    } else {
      // Use explicit theme
      this.updateThemeClasses(theme);
      this.isDarkModeSubject.next(theme === 'dark');
    }
  }

  /**
   * Update the theme classes on the document body
   * @param theme The theme to apply ('light' or 'dark')
   */
  private updateThemeClasses(theme: 'light' | 'dark'): void {
    if (theme === 'dark') {
      this.renderer.addClass(document.body, 'dark-theme');
      this.renderer.removeClass(document.body, 'light-theme');
    } else {
      this.renderer.addClass(document.body, 'light-theme');
      this.renderer.removeClass(document.body, 'dark-theme');
    }
  }

  /**
   * Get the initial theme from localStorage or system preference
   * @returns The initial theme
   */
  private getInitialTheme(): Theme {
    const savedTheme = localStorage.getItem('theme') as Theme | null;

    // If a valid theme is saved, use it
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      return savedTheme;
    }

    // Otherwise, default to 'system'
    return 'system';
  }
}
