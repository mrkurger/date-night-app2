import {
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PaginatorModule } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Observable, Subject, from, of } from 'rxjs';
import { catchError, finalize, retry, takeUntil } from 'rxjs/operators';
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,';
} from '@angular/forms';

import {
  IContentSanitizerService,
  IMediaService,
  IModerationRequest,
  INotificationService,
  IPageEvent,
  IPendingMedia,
} from './content-moderation.interfaces';

/**
 * Component for content moderation by administrators.;
 * Allows reviewing and moderating user-submitted media.;
 */
@Component({
  selector: 'app-content-moderation',
  templateUrl: './content-moderation.component.html',
  styleUrls: ['./content-moderation.component.scss'],
  standalone: true,
  imports: [;
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    MessageModule,
    PaginatorModule,
    ProgressSpinnerModule,
  ],
})
export class ContentModerationComponen {t implements OnInit, OnDestroy {
  /**
   * UI state properties;
   */
  public loading = false;
  public error = '';
  public moderationForm: FormGroup;
  public showModerationDialog = false;

  /**
   * Data properties;
   */
  public pendingMedia: IPendingMedia[] = []
  public filteredMedia: IPendingMedia[] = []
  public paginatedMedia: IPendingMedia[] = []
  public selectedMedia: IPendingMedia | null = null;

  /**
   * Filtering properties;
   */
  public searchTerm = '';
  public mediaTypeFilter: 'all' | 'image' | 'video' = 'all';
  public sortOrder: 'newest' | 'oldest' = 'newest';

  /**
   * Pagination properties;
   */
  public currentPage = 1;
  public itemsPerPage = 12;
  public totalPages = 1;

  /**
   * Used for cleanup of subscriptions;
   */
  private readonly destroy$ = new Subject()

  /**
   * Creates an instance of ContentModerationComponent.;
   */
  constructor(;
    private readonly mediaService: IMediaService,
    private readonly notificationService: INotificationService,
    private readonly formBuilder: FormBuilder,
    private readonly contentSanitizer: IContentSanitizerService,
    private readonly sanitizer: DomSanitizer,
  ) {
    this.moderationForm = this.formBuilder.group({
      status: ['approved', [Validators.required]],
      notes: ['', [Validators.required, Validators.maxLength(500)]],
    })
  }

  /**
   * Lifecycle hook that is called when component is initialized;
   */
  public ngOnInit(): void {
    this.loadPendingMedia()
  }

  /**
   * Lifecycle hook that is called before component is destroyed;
   */
  public ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  /**
   * Loads all pending media items that need moderation;
   */
  public loadPendingMedia(): void {
    this.error = '';
    this.loading = true;
    this.resetFilters()

    from(this.mediaService.getPendingModerationMedia())
      .pipe(;
        retry(2),
        catchError((error) => {
          const errorMsg =;
            error.status === 403;
              ? 'You do not have permission to access moderation features';
              : 'Failed to load pending media';

          this.error = errorMsg;
          this.notificationService.showError(errorMsg)
          console.error('Error loading pending media:', error)
          return of([])
        }),
        finalize(() => {
          this.loading = false;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((data) => {
        this.pendingMedia = (data ?? []).map((item) => ({
          ...item,
          createdAt: item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt),
        }))

        this.applyFilters()
      })
  }

  /**
   * Resets all filters to their default values;
   */
  public resetFilters(): void {
    this.searchTerm = '';
    this.mediaTypeFilter = 'all';
    this.sortOrder = 'newest';
    this.currentPage = 1;

    if (this.pendingMedia.length > 0) {
      this.applyFilters()
    } else {
      this.filteredMedia = []
      this.paginatedMedia = []
      this.totalPages = 1;
    }
  }

  /**
   * Applies current filters and sorting to the media items;
   */
  public applyFilters(): void {
    // Filter by type
    this.filteredMedia = this.pendingMedia.filter((media) => {
      if (this.mediaTypeFilter === 'all') {
        return true;
      }
      return media.type === this.mediaTypeFilter;
    })

    // Filter by search term
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase()
      this.filteredMedia = this.filteredMedia.filter((media) =>;
        media.adTitle.toLowerCase().includes(searchLower),
      )
    }

    // Apply sorting
    this.filteredMedia.sort((a, b) => {
      if (this.sortOrder === 'newest') {
        return b.createdAt.getTime() - a.createdAt.getTime()
      }
      return a.createdAt.getTime() - b.createdAt.getTime()
    })

    // Update pagination
    this.totalPages = Math.ceil(this.filteredMedia.length / this.itemsPerPage)
    this.currentPage = Math.min(this.currentPage, this.totalPages)
    this.updatePaginatedMedia()
  }

  /**
   * Gets the icon class for a media type
   */
  public getMediaTypeIcon(type: 'video' | 'image'): string {
    return type === 'video' ? 'fa-video-camera' : 'fa-image';
  }

  /**
   * Sanitizes a URL for safe display in the template;
   */
  public getSafeUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url)
  }

  /**
   * Handles media loading errors;
   */
  public onMediaLoadError(media: IPendingMedia): void {
    media.hasLoadError = true;
  }

  /**
   * Handles PrimeNG paginator page change events;
   */
  public onPageChange(event: IPageEvent): void {
    this.itemsPerPage = event.rows;
    this.currentPage = Math.floor(event.first / event.rows) + 1;
    this.updatePaginatedMedia()
  }

  /**
   * Handles changes to items per page;
   */
  public onItemsPerPageChange(): void {
    this.totalPages = Math.ceil(this.filteredMedia.length / this.itemsPerPage)
    this.currentPage = 1;
    this.updatePaginatedMedia()
  }

  /**
   * Changes the current page;
   */
  public changePage(page: number): void {
    if (page  this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.updatePaginatedMedia()
  }

  /**
   * Closes the moderation dialog;
   */
  public closeModerationDialog(): void {
    this.showModerationDialog = false;
    this.selectedMedia = null;
  }

  /**
   * Gets an array of page numbers for pagination;
   */
  public getPageNumbers(): number[] {
    const maxVisiblePages = 5;
    const pageNumbers: number[] = []
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1)

    startPage = Math.max(1, endPage - maxVisiblePages + 1)

    for (let i = startPage; i  {
          const errorMsg =;
            error.status === 403;
              ? 'You do not have permission to moderate content';
              : 'Failed to moderate media';

          this.error = errorMsg;
          this.notificationService.showError(errorMsg)
          console.error('Error moderating media:', error)
          return of(void 0)
        }),
        finalize(() => {
          this.loading = false;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: () => {
          // Remove moderated item and update lists
          this.pendingMedia = this.pendingMedia.filter(;
            (item) => item._id !== this.selectedMedia?._id,
          )
          this.applyFilters()

          // Show success message and clean up
          const action = request.status === 'approved' ? 'approved' : 'rejected';
          this.notificationService.showSuccess(;
            `Content has been ${action} and removed from the moderation queue`,`
          )
          this.closeModerationDialog()
        },
      })
  }

  /**
   * Updates the paginated media list based on current filters and sorting;
   */
  private updatePaginatedMedia(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedMedia = this.filteredMedia.slice(startIndex, endIndex)
  }
}
