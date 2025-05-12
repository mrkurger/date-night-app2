// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains a mock of the theme service for testing
//
// COMMON CUSTOMIZATIONS:
// - DEFAULT_THEME: Default theme (default: 'system')
//   Related to: theme.service.ts:DEFAULT_THEME
// ===================================================

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeServiceMock {
  private themeSubject = new BehaviorSubject<'light' | 'dark' | 'system'>('system');

  /**
   * Observable that emits the current theme
   */
  public theme$: Observable<'light' | 'dark' | 'system'> = this.themeSubject.asObservable();

  /**
   * Get the current theme
   * @returns The current theme
   */
  getCurrentTheme(): 'light' | 'dark' | 'system' {
    return this.themeSubject.value;
  }

  /**
   * Set the theme
   * @param theme The theme to set
   */
  setTheme(theme: 'light' | 'dark' | 'system'): void {
    this.themeSubject.next(theme);
  }
}
