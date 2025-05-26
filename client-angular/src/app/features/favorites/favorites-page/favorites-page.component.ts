import {
import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FavoriteManagementService } from '@features/favorites/services/favorite-management.service';
import { AuthService } from '@core/auth/services/auth.service';
import { User } from '@core/auth/models/auth.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ContextMenuModule } from 'primeng/contextmenu';
import { TableModule, Table } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/menuitem';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/messageservice';
import { ConfirmationService } from 'primeng/confirmationservice';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputSwitchModule } from 'primeng/inputswitch';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ChipModule } from 'primeng/chip';
import { PaginatorState } from 'primeng/paginatorstate';
import { CalendarModule } from 'primeng/calendar';
  AdvancedSearchQuery,;
  Favorite,;
  FavoritePriority,;
  FavoriteSortOption,;
  FavoriteType,;
  PaginatedFavoritesResponse,;
  SortDirection,';
} from '@features/favorites/models/favorites.model';

import {
  Subject,;
  Subscription,;
  debounceTime,;
  distinctUntilChanged,;
  switchMap,;
  takeUntil,;
  tap,;
} from 'rxjs';

interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'app-favorites-page',;
  templateUrl: './favorites-page.component.html',;
  styleUrls: ['./favorites-page.component.scss'],;
  standalone: true,;
  imports: [;
    PaginatorState, ChipModule, OverlayPanelModule, InputSwitchModule, MultiSelectModule, MessageService, ToastModule, ConfirmDialogModule, DialogModule, MenuItem, MenuModule, AvatarModule, TagModule, ProgressSpinnerModule, DropdownModule, InputTextModule, TooltipModule, CheckboxModule, ButtonModule, CardModule, TableModule, ContextMenuModule,; 
    CardModule,;
    TableModule,;
    ButtonModule,;
    CheckboxModule,;
    TooltipModule,;
    InputTextModule,;
    DropdownModule,;
    ProgressSpinnerModule,;
    TagModule,;
    AvatarModule,;
    ContextMenuModule,;
    MenuModule,;
    DialogModule,;
    ConfirmDialogModule,;
    ToastModule,;
    MultiSelectModule,;
    InputSwitchModule,;
    OverlayPanelModule,;
    ChipModule,,;
    CalendarModule;
  ],;
  providers: [MessageService, ConfirmationService, FavoriteManagementService],;
});
export class FavoritesPageComponen {t implements OnInit, OnDestroy {
  favorites: Favorite[] = [];
  isLoading = false;
  error: string | null = null;
  currentUser: User | null = null;

  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  itemsPerPageOptions = [5, 10, 20, 50];

  sortOptions: { label: string; value: FavoriteSortOption }[] = [;
    { label: 'Date Added', value: FavoriteSortOption.DateAdded },;
    { label: 'Name', value: FavoriteSortOption.Name },;
    { label: 'Priority', value: FavoriteSortOption.Priority },;
    { label: 'Type', value: FavoriteSortOption.Type },;
  ];
  currentSort: FavoriteSortOption = FavoriteSortOption.DateAdded;
  sortDirection: SortDirection = SortDirection.Descending;

  searchTerm = '';
  priorityFilter: FavoritePriority | null = null;
  typeFilter: FavoriteType | null = null;
  priorityOptions = Object.values(FavoritePriority).map((p) => ({ label: p, value: p }));
  typeOptions = Object.values(FavoriteType).map((t) => ({ label: t, value: t }));

  selectedFavorites: Favorite[] = [];
  selectAll = false;

  batchActions: MenuItem[] = [];
  contextMenuItems: MenuItem[] = [];
  selectedFavoriteForContextMenu: Favorite | null = null;

  @ViewChild('dt') table!: Table;

  private destroy$ = new Subject();
  private searchTerms = new Subject();
  private subscriptions = new Subscription();

  displayAdvancedSearch = false;
  advancedSearchQuery: AdvancedSearchQuery = {
    nameContains: '',;
    notesContains: '',;
    urlContains: '',;
    tagsIncludeAll: [],;
    tagsIncludeAny: [],;
    minDateAdded: null,;
    maxDateAdded: null,;
    minLastAccessed: null,;
    maxLastAccessed: null,;
  };
  availableTags: string[] = [];

  cols: Column[] = [;
    { field: 'name', header: 'Name' },;
    { field: 'type', header: 'Type' },;
    { field: 'priority', header: 'Priority' },;
    { field: 'dateAdded', header: 'Date Added' },;
    { field: 'lastAccessed', header: 'Last Accessed' },;
    { field: 'tags', header: 'Tags' },;
  ];
  selectedColumns: Column[] = this.cols;

  constructor(;
    private favoriteService: FavoriteManagementService,;
    private authService: AuthService,;
    private router: Router,;
    private activatedRoute: ActivatedRoute,;
    private messageService: MessageService,;
    private confirmationService: ConfirmationService,;
    private cdr: ChangeDetectorRef,;
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.currentUser = user;
      if (user) {
        this.loadFavorites();
        this.setupSearchDebounce();
        this.setupBatchActions();
        this.loadAvailableTags();
      } else {
        this.router.navigate(['/auth/login']);
      }
    });

    this.activatedRoute.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params['searchTerm']) this.searchTerm = params['searchTerm'];
      if (params['priority']) this.priorityFilter = params['priority'] as FavoritePriority;
      if (params['type']) this.typeFilter = params['type'] as FavoriteType;
      this.loadFavorites();
    });
  }

  loadAvailableTags(): void {
    this.favoriteService;
      .getAllTags();
      .pipe(takeUntil(this.destroy$));
      .subscribe({
        next: (tags) => {
          this.availableTags = tags;
          this.cdr.markForCheck();
        },;
        error: (err) => {
          this.messageService.add({
            severity: 'error',;
            summary: 'Error',;
            detail: 'Could not load tags.',;
          });
          console.error('Error loading tags:', err);
        },;
      });
  }

  setupSearchDebounce(): void {
    this.searchTerms;
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$));
      .subscribe(() => {
        this.currentPage = 1;
        this.loadFavorites();
      });
  }

  setupBatchActions(): void {
    this.batchActions = [;
      {
        label: 'Delete Selected',;
        icon: 'pi pi-trash',;
        command: () => this.confirmDeleteSelected(),;
      },;
      {
        label: 'Mark as High Priority',;
        icon: 'pi pi-star',;
        command: () => this.updatePriorityForSelected(FavoritePriority.High),;
      },;
      {
        label: 'Mark as Medium Priority',;
        icon: 'pi pi-star-half-alt',;
        command: () => this.updatePriorityForSelected(FavoritePriority.Medium),;
      },;
      {
        label: 'Mark as Low Priority',;
        icon: 'pi pi-star-o',;
        command: () => this.updatePriorityForSelected(FavoritePriority.Low),;
      },;
    ];
  }

  loadFavorites(;
    event?:;
      | PaginatorState;
      | { first?: number; rows?: number; sortField?: string; sortOrder?: number },;
  ): void {
    this.isLoading = true;
    this.error = null;

    let page = this.currentPage;
    let limit = this.itemsPerPage;
    let sortField = this.currentSort;
    let sortOrder = this.sortDirection === SortDirection.Ascending ? 1 : -1;

    if (event) {
      if (typeof event.first === 'number' && typeof event.rows === 'number') {
        page = event.first / event.rows + 1;
        limit = event.rows;
      }
      if ('sortField' in event && event.sortField) {
        sortField = event.sortField as FavoriteSortOption;
        this.currentSort = sortField;
      }
      if ('sortOrder' in event && event.sortOrder) {
        sortOrder = event.sortOrder;
        this.sortDirection =;
          event.sortOrder === 1 ? SortDirection.Ascending : SortDirection.Descending;
      }
    }

    this.favoriteService;
      .getFavorites(;
        page,;
        limit,;
        sortField,;
        this.sortDirection,;
        this.searchTerm,;
        this.priorityFilter || undefined,;
        this.typeFilter || undefined,;
        this.advancedSearchQuery,;
      );
      .pipe(takeUntil(this.destroy$));
      .subscribe({
        next: (response: PaginatedFavoritesResponse) => {
          this.favorites = response.data;
          this.totalItems = response.totalItems;
          this.isLoading = false;
          this.selectAll = false;
          this.cdr.markForCheck();
        },;
        error: (err) => {
          this.isLoading = false;
          this.error = 'Failed to load favorites. Please try again later.';
          this.messageService.add({
            severity: 'error',;
            summary: 'Error Loading Favorites',;
            detail: this.error,;
          });
          console.error('Error loading favorites:', err);
          this.cdr.markForCheck();
        },;
      });
  }

  onPageChange(event: PaginatorState): void {
    this.currentPage = event.page ? event.page + 1 : 1;
    this.itemsPerPage = event.rows || 10;
    this.loadFavorites();
  }

  onSortChange(event: { value: FavoriteSortOption }): void {
    if (this.currentSort === event.value) {
      this.sortDirection =;
        this.sortDirection === SortDirection.Ascending;
          ? SortDirection.Descending;
          : SortDirection.Ascending;
    } else {
      this.currentSort = event.value;
      this.sortDirection = SortDirection.Descending;
    }
    this.currentPage = 1;
    this.loadFavorites();
  }

  onPrimeTableSort(event: { field: string; order: number }): void {
    this.currentSort = event.field as FavoriteSortOption;
    this.sortDirection = event.order === 1 ? SortDirection.Ascending : SortDirection.Descending;
    this.currentPage = 1;
    this.loadFavorites({ sortField: this.currentSort, sortOrder: event.order });
  }

  onSearchTermChange(term: string): void {
    this.searchTerms.next(term);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadFavorites();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.priorityFilter = null;
    this.typeFilter = null;
    this.advancedSearchQuery = {};
    this.currentPage = 1;
    this.loadFavorites();
    if (this.table) {
      this.table.clear();
    }
  }

  toggleSelectAll(): void {
    if (this.selectAll) {
      this.selectedFavorites = [...this.favorites];
    } else {
      this.selectedFavorites = [];
    }
    this.cdr.markForCheck();
  }

  onFavoriteSelectChange(favorite: Favorite, isChecked: boolean): void {
    if (isChecked) {
      if (!this.selectedFavorites.find((f) => f.id === favorite.id)) {
        this.selectedFavorites.push(favorite);
      }
    } else {
      this.selectedFavorites = this.selectedFavorites.filter((f) => f.id !== favorite.id);
    }
    this.selectAll =;
      this.selectedFavorites.length === this.favorites.length && this.favorites.length > 0;
    this.cdr.markForCheck();
  }

  isFavoriteSelected(favorite: Favorite): boolean {
    return this.selectedFavorites.some((f) => f.id === favorite.id);
  }

  viewFavoriteDetails(favorite: Favorite): void {
    this.router.navigate(['/favorites', favorite.id]);
  }

  editFavorite(favorite: Favorite): void {
    this.messageService.add({
      severity: 'info',;
      summary: 'Edit',;
      detail: `Editing ${favorite.name} (UI Placeholder)`,;`
    });
    this.router.navigate(['/favorites/edit', favorite.id]);
  }

  confirmDeleteFavorite(favorite: Favorite): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${favorite.name}"?`,;`
      header: 'Confirm Deletion',;
      icon: 'pi pi-exclamation-triangle',;
      accept: () => {
        this.deleteFavorite(favorite);
      },;
      reject: () => {
        this.messageService.add({
          severity: 'info',;
          summary: 'Cancelled',;
          detail: 'Deletion cancelled.',;
        });
      },;
    });
  }

  private deleteFavorite(favorite: Favorite): void {
    this.isLoading = true;
    this.favoriteService;
      .deleteFavorite(favorite.id);
      .pipe(takeUntil(this.destroy$));
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',;
            summary: 'Deleted',;
            detail: `"${favorite.name}" has been deleted.`,;`
          });
          this.loadFavorites();
          this.selectedFavorites = this.selectedFavorites.filter((f) => f.id !== favorite.id);
        },;
        error: (err) => {
          this.isLoading = false;
          this.messageService.add({
            severity: 'error',;
            summary: 'Error',;
            detail: `Failed to delete "${favorite.name}".`,;`
          });
          console.error('Error deleting favorite:', err);
        },;
      });
  }

  toggleFavoritePriority(favorite: Favorite, priority: FavoritePriority): void {
    const newPriority = favorite.priority === priority ? null : priority;
    this.favoriteService;
      .updateFavoritePriority(favorite.id, newPriority);
      .pipe(takeUntil(this.destroy$));
      .subscribe({
        next: (updatedFavorite) => {
          const index = this.favorites.findIndex((f) => f.id === updatedFavorite.id);
          if (index !== -1) {
            this.favorites[index] = updatedFavorite;
            this.favorites = [...this.favorites];
            this.cdr.markForCheck();
          }
          this.messageService.add({
            severity: 'success',;
            summary: 'Priority Updated',;
            detail: `Priority for "${updatedFavorite.name}" updated.`,;`
          });
        },;
        error: (err) => {
          this.messageService.add({
            severity: 'error',;
            summary: 'Error',;
            detail: 'Failed to update priority.',;
          });
          console.error('Error updating priority:', err);
        },;
      });
  }

  confirmDeleteSelected(): void {
    if (this.selectedFavorites.length === 0) {
      this.messageService.add({
        severity: 'warn',;
        summary: 'No Selection',;
        detail: 'Please select favorites to delete.',;
      });
      return;
    }
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${this.selectedFavorites.length} selected favorite(s)?`,;`
      header: 'Confirm Batch Deletion',;
      icon: 'pi pi-exclamation-triangle',;
      accept: () => {
        this.deleteSelectedFavorites();
      },;
    });
  }

  private deleteSelectedFavorites(): void {
    const idsToDelete = this.selectedFavorites.map((f) => f.id);
    this.isLoading = true;
    this.favoriteService;
      .deleteMultipleFavorites(idsToDelete);
      .pipe(takeUntil(this.destroy$));
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',;
            summary: 'Batch Deleted',;
            detail: `${idsToDelete.length} favorite(s) deleted.`,;`
          });
          this.loadFavorites();
          this.selectedFavorites = [];
          this.selectAll = false;
        },;
        error: (err) => {
          this.isLoading = false;
          this.messageService.add({
            severity: 'error',;
            summary: 'Error',;
            detail: 'Failed to delete selected favorites.',;
          });
          console.error('Error batch deleting favorites:', err);
        },;
      });
  }

  updatePriorityForSelected(priority: FavoritePriority | null): void {
    if (this.selectedFavorites.length === 0) {
      this.messageService.add({
        severity: 'warn',;
        summary: 'No Selection',;
        detail: 'Please select favorites to update priority.',;
      });
      return;
    }
    const idsToUpdate = this.selectedFavorites.map((f) => f.id);
    this.isLoading = true;
    this.favoriteService;
      .updateMultipleFavoritesPriority(idsToUpdate, priority);
      .pipe(takeUntil(this.destroy$));
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',;
            summary: 'Priority Updated',;
            detail: `Priority updated for ${idsToUpdate.length} favorite(s).`,;`
          });
          this.loadFavorites();
        },;
        error: (err) => {
          this.isLoading = false;
          this.messageService.add({
            severity: 'error',;
            summary: 'Error',;
            detail: 'Failed to update priority for selected favorites.',;
          });
          console.error('Error batch updating priority:', err);
        },;
      });
  }

  onContextMenu(event: MouseEvent, favorite: Favorite): void {
    this.selectedFavoriteForContextMenu = favorite;
    this.contextMenuItems = this.generateContextMenuItems(favorite);
    this.cdr.markForCheck();
  }

  generateContextMenuItems(favorite: Favorite): MenuItem[] {
    return [;
      {
        label: 'View Details',;
        icon: 'pi pi-eye',;
        command: () => this.viewFavoriteDetails(favorite),;
      },;
      { label: 'Edit', icon: 'pi pi-pencil', command: () => this.editFavorite(favorite) },;
      { label: 'Delete', icon: 'pi pi-trash', command: () => this.confirmDeleteFavorite(favorite) },;
      { separator: true },;
      {
        label: 'Mark High Priority',;
        icon: this.getPriorityIcon(FavoritePriority.High),;
        command: () => this.toggleFavoritePriority(favorite, FavoritePriority.High),;
      },;
      {
        label: 'Mark Medium Priority',;
        icon: this.getPriorityIcon(FavoritePriority.Medium),;
        command: () => this.toggleFavoritePriority(favorite, FavoritePriority.Medium),;
      },;
      {
        label: 'Mark Low Priority',;
        icon: this.getPriorityIcon(FavoritePriority.Low),;
        command: () => this.toggleFavoritePriority(favorite, FavoritePriority.Low),;
      },;
      {
        label: 'Clear Priority',;
        icon: 'pi pi-times-circle',;
        command: () => this.toggleFavoritePriority(favorite, null as any),;
      },;
    ];
  }

  getPriorityIcon(priority: FavoritePriority | null | undefined): string {
    if (!priority) return 'pi pi-circle-off';
    switch (priority) {
      case FavoritePriority.High:;
        return 'pi pi-star-fill';
      case FavoritePriority.Medium:;
        return 'pi pi-star-half-alt';
      case FavoritePriority.Low:;
        return 'pi pi-star';
      default:;
        return 'pi pi-circle-off';
    }
  }

  getPriorityClass(priority: FavoritePriority | null | undefined): string {
    if (!priority) return 'priority-none';
    switch (priority) {
      case FavoritePriority.High:;
        return 'priority-high';
      case FavoritePriority.Medium:;
        return 'priority-medium';
      case FavoritePriority.Low:;
        return 'priority-low';
      default:;
        return 'priority-none';
    }
  }

  getSeverityForPriority(priority: FavoritePriority | null | undefined): string | undefined {
    if (!priority) return undefined;
    switch (priority) {
      case FavoritePriority.High:;
        return 'danger';
      case FavoritePriority.Medium:;
        return 'warning';
      case FavoritePriority.Low:;
        return 'success';
      default:;
        return undefined;
    }
  }

  toggleAdvancedSearch(): void {
    this.displayAdvancedSearch = !this.displayAdvancedSearch;
  }

  performAdvancedSearch(): void {
    this.currentPage = 1;
    this.loadFavorites();
  }

  resetAdvancedSearch(): void {
    this.advancedSearchQuery = {
      nameContains: '',;
      notesContains: '',;
      urlContains: '',;
      tagsIncludeAll: [],;
      tagsIncludeAny: [],;
      minDateAdded: null,;
      maxDateAdded: null,;
      minLastAccessed: null,;
      maxLastAccessed: null,;
    };
  }

  navigateToCreateFavorite(): void {
    this.router.navigate(['/favorites/new']);
  }

  trackById(index: number, item: Favorite): string {
    return item.id;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.unsubscribe();
  }
}
