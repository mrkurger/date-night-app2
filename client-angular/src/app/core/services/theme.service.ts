import { Injectable } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { BehaviorSubject, Observable } from 'rxjs';

export type ThemeName = 'default' | 'dark' | 'cosmic' | 'corporate';

/**
 * Service for managing application theme
 * Handles theme switching, persistence, and system preference detection
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private currentTheme = new BehaviorSubject<ThemeName>('default');
  private darkMode = new BehaviorSubject<boolean>(false);

  /**
   * Observable that emits the current theme
   */
  public theme$: Observable<ThemeName> = this.currentTheme.asObservable();

  /**
   * Observable that emits whether dark mode is currently active
   */
  public isDarkMode$: Observable<boolean> = this.darkMode.asObservable();

  constructor(private nbThemeService: NbThemeService) {
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
  public getCurrentTheme(): Observable<ThemeName> {
    return this.currentTheme.asObservable();
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
    this.nbThemeService.changeTheme(themeName);
    this.currentTheme.next(themeName);
    localStorage.setItem('theme', themeName);
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
    this.setTheme(isDark ? 'dark' : 'default');
  }

  // Custom theme configuration
  private customThemeVariables = {
    default: {
      'color-primary-100': '#F2F6FF',
      'color-primary-200': '#D9E4FF',
      'color-primary-300': '#A6C1FF',
      'color-primary-400': '#598BFF',
      'color-primary-500': '#3366FF',
      'color-primary-600': '#274BDB',
      'color-primary-700': '#1A34B8',
      'color-primary-800': '#102694',
      'color-primary-900': '#091C7A',
    },
    dark: {
      'color-primary-100': '#1A1F33',
      'color-primary-200': '#2A3154',
      'color-primary-300': '#3B4475',
      'color-primary-400': '#4C5696',
      'color-primary-500': '#5D69B7',
      'color-primary-600': '#6E7CD8',
      'color-primary-700': '#7F8FF9',
      'color-primary-800': '#90A2FF',
      'color-primary-900': '#A1B5FF',
    },
  };

  /**
   * Apply custom theme
   */
  public applyCustomTheme(): void {
    const variables = this.darkMode.value
      ? this.customThemeVariables.dark
      : this.customThemeVariables.default;

    Object.entries(variables).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
  }
}
