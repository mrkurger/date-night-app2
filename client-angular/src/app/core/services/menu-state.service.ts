import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface MenuState {
  sidebarState: 'expanded' | 'collapsed' | 'compacted';
  expandedItems: string[];
  selectedItem?: string;
  theme: 'default' | 'dark' | 'cosmic' | 'corporate';
}

const MENU_STATE_KEY = 'app_menu_state';

@Injectable({
  providedIn: 'root',
})
export class MenuStateService {
  private defaultState: MenuState = {
    sidebarState: 'expanded',
    expandedItems: [],
    theme: 'default',
  };

  private stateSubject = new BehaviorSubject<MenuState>(this.loadState());
  public state$ = this.stateSubject.asObservable();

  constructor() {
    // Initialize with saved state or default
    this.stateSubject.next(this.loadState());
  }

  /**
   * Load saved state from localStorage
   */
  private loadState(): MenuState {
    try {
      const savedState = localStorage.getItem(MENU_STATE_KEY);
      return savedState ? { ...this.defaultState, ...JSON.parse(savedState) } : this.defaultState;
    } catch (error) {
      console.error('Error loading menu state:', error);
      return this.defaultState;
    }
  }

  /**
   * Save current state to localStorage
   */
  private saveState(state: MenuState): void {
    try {
      localStorage.setItem(MENU_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving menu state:', error);
    }
  }

  /**
   * Update sidebar state
   */
  updateSidebarState(state: 'expanded' | 'collapsed' | 'compacted'): void {
    const currentState = this.stateSubject.value;
    const newState = { ...currentState, sidebarState: state };
    this.stateSubject.next(newState);
    this.saveState(newState);
  }

  /**
   * Toggle menu item expansion
   */
  toggleMenuItem(itemId: string): void {
    const currentState = this.stateSubject.value;
    const expandedItems = currentState.expandedItems.includes(itemId)
      ? currentState.expandedItems.filter((id) => id !== itemId)
      : [...currentState.expandedItems, itemId];

    const newState = { ...currentState, expandedItems };
    this.stateSubject.next(newState);
    this.saveState(newState);
  }

  /**
   * Update selected menu item
   */
  setSelectedItem(itemId: string): void {
    const currentState = this.stateSubject.value;
    const newState = { ...currentState, selectedItem: itemId };
    this.stateSubject.next(newState);
    this.saveState(newState);
  }

  /**
   * Update theme
   */
  updateTheme(theme: 'default' | 'dark' | 'cosmic' | 'corporate'): void {
    const currentState = this.stateSubject.value;
    const newState = { ...currentState, theme };
    this.stateSubject.next(newState);
    this.saveState(newState);
  }

  /**
   * Get current menu state
   */
  getCurrentState(): MenuState {
    return this.stateSubject.value;
  }

  /**
   * Reset state to default
   */
  resetState(): void {
    this.stateSubject.next(this.defaultState);
    this.saveState(this.defaultState);
  }
}
