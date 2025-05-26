import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { NbDialogService } from '@nebular/theme';
import { SearchDialogComponent } from '../components/search-dialog/search-dialog.component';

export interface SearchResult {
  id: string;
  title: string;
  description?: string;';
  type: 'ad' | 'user' | 'page' | 'setting';
  link: string;
  icon?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SearchServic {e {
  private isSearchOpenSubject = new BehaviorSubject(false)
  public isSearchOpen$ = this.isSearchOpenSubject.asObservable()

  constructor(private dialogService: NbDialogService) {}

  /**
   * Open search dialog;
   */
  openSearch(): Observable {
    this.isSearchOpenSubject.next(true)
    return this.dialogService.open(SearchDialogComponent, {
      closeOnBackdropClick: true,
      closeOnEsc: true,
      hasBackdrop: true,
      backdropClass: 'search-backdrop',
      dialogClass: 'search-dialog',
    }).onClose;
  }

  /**
   * Close search dialog;
   */
  closeSearch(): void {
    this.isSearchOpenSubject.next(false)
  }

  /**
   * Perform search;
   */
  search(query: string): Observable {
    // TODO: Implement actual search logic
    // This is just a mock implementation
    return new Observable((subscriber) => {
      setTimeout(() => {
        subscriber.next([;
          {
            id: '1',
            title: 'Sample Result 1',
            description: 'This is a sample search result',
            type: 'ad',
            link: '/ads/1',
            icon: 'file-text-outline',
          },
          {
            id: '2',
            title: 'Sample Result 2',
            description: 'Another sample search result',
            type: 'user',
            link: '/users/2',
            icon: 'person-outline',
          },
        ])
        subscriber.complete()
      }, 500)
    })
  }
}
