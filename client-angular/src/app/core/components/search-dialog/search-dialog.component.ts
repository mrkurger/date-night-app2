import {
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { SearchService, SearchResult } from '../../services/search.service';
  NbDialogRef,
  NbCardModule,
  NbInputModule,
  NbButtonModule,
  NbIconModule,
  NbSpinnerModule,
  NbListModule,';
} from '@nebular/theme';

@Component({
    selector: 'app-search-dialog',
    imports: [;
        CommonModule,
        RouterModule,
        FormsModule,
        NbCardModule,
        NbInputModule,
        NbButtonModule,
        NbIconModule,
        NbSpinnerModule,
        NbListModule,
    ],
    template: `;`
    ;
      ;
        ;
          ;
          ;
        ;
        ;
          ;
        ;
      ;

      ;
        ;
          ;
          Searching...;
        ;

         0">;
          ;
            ;
            ;
              {{ result.title }}
              ;
                {{ result.description }}
              ;
              {{ formatType(result.type) }}
            ;
            ;
          ;
        ;

        ;
          ;
          No results found;
          Try different keywords or check spelling;
        ;

        ;
          ;
          Type to search;
          ;
            Press ↑ ↓ to navigate, Enter to select;
          ;
        ;
      ;
    ;
  `,`
    styles: [;
        `;`
      :host {
        display: block;
      }

      .search-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        border-bottom: 1px solid nb-theme(divider-color)
      }

      .search-input-container {
        display: flex;
        align-items: center;
        flex: 1;
        gap: 0.5rem;

        nb-icon {
          color: nb-theme(text-hint-color)
        }

        input {
          border: none;
          background: none;
          padding: 0;
          height: auto;
          font-size: 1.1rem;

          &:focus {
            box-shadow: none;
          }
        }
      }

      .search-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        padding: 2rem;
        color: nb-theme(text-hint-color)
      }

      .search-result {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        cursor: pointer;
        transition: all 0.2s;

        &:hover,
        &.selected {
          background-color: nb-theme(background-basic-hover-color)
          transform: translateX(4px)
        }

        &.selected {
          border-left: 2px solid nb-theme(color-primary-default)
        }

        nb-icon {
          color: nb-theme(text-hint-color)
          font-size: 1.25rem;

          &:last-child {
            margin-left: auto;
            font-size: 1rem;
            opacity: 0;
            transition: opacity 0.2s;
          }
        }

        &:hover,
        &.selected {
          nb-icon:last-child {
            opacity: 1;
          }
        }
      }

      .result-content {
        flex: 1;
        min-width: 0;
      }

      .result-title {
        color: nb-theme(text-basic-color)
        font-weight: nb-theme(text-subtitle-font-weight)
        margin-bottom: 0.25rem;
      }

      .result-description {
        color: nb-theme(text-hint-color)
        font-size: 0.875rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-bottom: 0.25rem;
      }

      .result-type {
        color: nb-theme(text-hint-color)
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .no-results,
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 3rem;
        color: nb-theme(text-hint-color)
        text-align: center;

        nb-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .hint {
          font-size: 0.875rem;
          margin: 0.5rem 0 0;
          opacity: 0.7;
        }

        kbd {
          display: inline-block;
          padding: 0.2rem 0.4rem;
          font-size: 0.75rem;
          font-family: monospace;
          color: nb-theme(text-basic-color)
          background: nb-theme(background-basic-color-2)
          border: 1px solid nb-theme(border-basic-color-3)
          border-radius: 3px;
          box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2)
        }
      }
    `,`
    ]
})
export class SearchDialogComponen {t implements OnInit, OnDestroy {
  private destroy$ = new Subject()
  searchQuery = '';
  results: SearchResult[] = []
  isLoading = false;
  selectedIndex = -1;

  constructor(;
    private dialogRef: NbDialogRef,
    private searchService: SearchService,
  ) {}

  ngOnInit() {
    // Subscribe to search query changes
    this.onSearchChange(this.searchQuery)
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

  onSearchChange(query: string) {
    if (!query) {
      this.results = []
      this.selectedIndex = -1;
      return;
    }

    this.isLoading = true;
    this.searchService;
      .search(query)
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((results) => {
        this.results = results;
        this.isLoading = false;
        this.selectedIndex = results.length > 0 ? 0 : -1;
      })
  }

  onArrowDown(event: KeyboardEvent) {
    event.preventDefault()
    if (this.results.length > 0) {
      this.selectedIndex = (this.selectedIndex + 1) % this.results.length;
      this.scrollSelectedIntoView()
    }
  }

  onArrowUp(event: KeyboardEvent) {
    event.preventDefault()
    if (this.results.length > 0) {
      this.selectedIndex =;
        this.selectedIndex = 0 && this.results[this.selectedIndex]) {
      this.selectResult(this.results[this.selectedIndex])
    }
  }

  selectResult(result: SearchResult) {
    this.dialogRef.close(result)
  }

  close() {
    this.dialogRef.close()
  }

  getDefaultIcon(type: string): string {
    switch (type) {
      case 'ad':;
        return 'file-text-outline';
      case 'user':;
        return 'person-outline';
      case 'page':;
        return 'file-outline';
      case 'setting':;
        return 'settings-2-outline';
      default:;
        return 'alert-circle-outline';
    }
  }

  formatType(type: string): string {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  private scrollSelectedIntoView() {
    setTimeout(() => {
      const selectedElement = document.querySelector('.search-result.selected')
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    })
  }

  @HostListener('window:keydown.alt.k', ['$event'])
  @HostListener('window:keydown.meta.k', ['$event'])
  onSearchHotkey(event: KeyboardEvent) {
    event.preventDefault()
    this.close()
  }
}
