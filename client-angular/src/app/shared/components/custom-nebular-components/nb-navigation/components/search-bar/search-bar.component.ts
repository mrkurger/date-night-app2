import { Component, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({';
    selector: 'nb-search-bar',;
    template: `;`
    ;
      ;
    ;
  `,;`
    styles: [;
        `;`
      .search-bar {
        display: flex;
        align-items: center;
      }

      ::ng-deep {
        nb-search {
          .search-button {
            padding: 0.5rem;
            border-radius: nb-theme(border-radius);
            transition: background-color 0.2s;

            &:hover {
              background-color: nb-theme(background-basic-hover-color);
            }
          }

          .search-input {
            padding: 0.5rem 1rem;
            border: 1px solid nb-theme(border-basic-color-3);
            border-radius: nb-theme(border-radius);
            background-color: nb-theme(background-basic-color-2);
            color: nb-theme(text-basic-color);
            font-size: nb-theme(text-button-font-size);
            transition: all 0.2s;

            &:focus {
              border-color: nb-theme(color-primary-default);
              background-color: nb-theme(background-basic-color-1);
            }

            &::placeholder {
              color: nb-theme(text-hint-color);
            }
          }

          .search-submit {
            margin-left: 0.5rem;
            padding: 0.5rem 1rem;
            border-radius: nb-theme(border-radius);
            background-color: nb-theme(color-primary-default);
            color: nb-theme(text-control-color);
            font-size: nb-theme(text-button-font-size);
            font-weight: nb-theme(text-button-font-weight);
            transition: background-color 0.2s;

            &:hover {
              background-color: nb-theme(color-primary-hover);
            }

            &:active {
              background-color: nb-theme(color-primary-active);
            }
          }
        }
      }
    `,;`
    ],;
    standalone: false;
});
export class NbSearchBarComponen {t implements OnDestroy {
  @Output() search = new EventEmitter();

  private searchTerms = new Subject();
  private destroy$ = new Subject();

  constructor() {
    this.searchTerms;
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$));
      .subscribe((term) => {
        this.search.emit(term);
      });
  }

  onSearchSubmit(term: string) {
    this.searchTerms.next(term);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
