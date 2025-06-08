import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ThemeName = 'light' | 'dark' | 'system';

/**
 * Service for managing application theme
 * Handles theme switching, persistence, and system preference detection
 * Updated to work with PrimeNG themes instead of Nebular
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private currentTheme = new BehaviorSubject<ThemeName>('light');
  private darkMode = new BehaviorSubject<boolean>(false);

  /**
   * Observable that emits the current theme
   */
  public theme$: Observable<ThemeName> = this.currentTheme.asObservable();

  /**
   * Observable that emits whether dark mode is currently active
   */
  public isDarkMode$: Observable<boolean> = this.darkMode.asObservable();

  constructor() {
    // Initialize theme from local storage
    const savedTheme = localStorage.getItem('theme') as ThemeName;
    if (savedTheme) {
      this.setTheme(savedTheme);
    }

    // Initialize dark mode from local storage and system preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      this.setDarkMode(savedDarkMode === 'true');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setDarkMode(prefersDark);
    }

    // Listen for system dark mode changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (localStorage.getItem('darkMode') === null) {
        this.setDarkMode(e.matches);
      }
    });
  }

  /**
   * Get the current theme
   * @returns The current theme
   */
  public getCurrentTheme(): ThemeName {
    return this.currentTheme.getValue();
  }

  /**
   * Check if dark mode is currently active
   * @returns True if dark mode is active, false otherwise
   */
  public getDarkMode(): Observable<boolean> {
    return this.darkMode.asObservable();
  }

  /**
   * Set the application theme
   * @param theme The theme to set ('light', 'dark', or 'system')
   */
  public setTheme(themeName: ThemeName): void {
    this.currentTheme.next(themeName);
    localStorage.setItem('theme', themeName);
    this.applyPrimeNGTheme(themeName);
  }

  /**
   * Toggle between light and dark themes
   * If current theme is 'system', it will switch to either 'light' or 'dark'
   * based on the current system preference
   */
  public toggleDarkMode(): void {
    this.setDarkMode(!this.darkMode.value);
  }

  /**
   * Set dark mode
   * @param isDark True if dark mode should be active, false otherwise
   */
  public setDarkMode(isDark: boolean): void {
    this.darkMode.next(isDark);
    localStorage.setItem('darkMode', isDark.toString());
    this.setTheme(isDark ? 'dark' : 'light');
  }

  /**
   * Apply PrimeNG theme based on theme name
   * @param themeName The theme to apply
   */
  private applyPrimeNGTheme(themeName: ThemeName): void {
    // Remove existing theme links
    const existingThemeLinks = document.querySelectorAll('link[data-theme]');
    existingThemeLinks.forEach(link => link.remove());

    // Create new theme link
    const themeLink = document.createElement('link');
    themeLink.rel = 'stylesheet';
    themeLink.setAttribute('data-theme', themeName);
    
    // Set the theme CSS URL based on theme name
    switch (themeName) {
      case 'dark':
        themeLink.href = 'https://unpkg.com/primeng/resources/themes/aura-dark-blue/theme.css';
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
        break;
      case 'light':
      default:
        themeLink.href = 'https://unpkg.com/primeng/resources/themes/aura-light-blue/theme.css';
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
        break;
    }

    // Append the new theme link
    document.head.appendChild(themeLink);
    this.applyCustomTheme();
  }

  // Custom theme configuration for CSS variables
  private customThemeVariables = {
    light: {
      'app-primary-color': '#3B82F6',
      'app-surface-color': '#ffffff',
      'app-text-color': '#1f2937',
      'app-border-color': '#e5e7eb',
      'app-hover-color': '#f3f4f6',
    },
    dark: {
      'app-primary-color': '#60A5FA',
      'app-surface-color': '#1f2937',
      'app-text-color': '#f9fafb',
      'app-border-color': '#374151',
      'app-hover-color': '#374151',
    },
  };

  /**
   * Apply custom theme variables
   */
  public applyCustomTheme(): void {
    const variables = this.darkMode.value
      ? this.customThemeVariables.dark
      : this.customThemeVariables.light;

    Object.entries(variables).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
  }
}
