import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ThemeName = 'lara-light-blue' | 'lara-dark-blue' | 'system';

/**
 * Service for managing application theme with PrimeNG
 * Handles theme switching, persistence, and system preference detection
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly currentTheme = new BehaviorSubject<ThemeName>('lara-light-blue');
  private readonly darkMode = new BehaviorSubject<boolean>(false);

  /**
   * Observable that emits the current theme
   */
  public theme$: Observable<ThemeName> = this.currentTheme.asObservable();

  /**
   * Observable that emits whether dark mode is currently active
   */
  public isDarkMode$: Observable<boolean> = this.darkMode.asObservable();

  /**
   *
   */
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
   * Set the application theme using PrimeNG theme switching
   * @param themeName The theme to set
   */
  public setTheme(themeName: ThemeName): void {
    this.switchPrimeNGTheme(themeName);
    this.currentTheme.next(themeName);
    localStorage.setItem('theme', themeName);
  }

  /**
   * Toggle between light and dark themes
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
    this.setTheme(isDark ? 'lara-dark-blue' : 'lara-light-blue');
  }

  /**
   * Switch PrimeNG theme by updating the theme CSS link
   * @param themeName The PrimeNG theme to switch to
   */
  private switchPrimeNGTheme(themeName: ThemeName): void {
    const themeLink = document.getElementById('theme-css') as HTMLLinkElement;
    if (themeLink) {
      themeLink.href = `node_modules/primeng/resources/themes/${themeName}/theme.css`;
    } else {
      // Create theme link if it doesn't exist
      const link = document.createElement('link');
      link.id = 'theme-css';
      link.rel = 'stylesheet';
      link.href = `node_modules/primeng/resources/themes/${themeName}/theme.css`;
      document.head.appendChild(link);
    }
  }

  /**
   * Apply custom CSS variables for additional theming
   */
  public applyCustomTheme(): void {
    const isDark = this.darkMode.value;
    const root = document.documentElement;

    if (isDark) {
      root.style.setProperty('--surface-ground', '#1e1e1e');
      root.style.setProperty('--surface-section', '#2d2d30');
      root.style.setProperty('--surface-card', '#2d2d30');
      root.style.setProperty('--text-color', '#ffffff');
      root.style.setProperty('--text-color-secondary', '#a1a1aa');
    } else {
      root.style.setProperty('--surface-ground', '#ffffff');
      root.style.setProperty('--surface-section', '#f8f9fa');
      root.style.setProperty('--surface-card', '#ffffff');
      root.style.setProperty('--text-color', '#212529');
      root.style.setProperty('--text-color-secondary', '#6c757d');
    }
  }
}
