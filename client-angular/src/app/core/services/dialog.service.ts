import { NbCardModule } from '@nebular/theme';
import { Injectable, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NbDialogService,
  NbDialogConfig,
  NbDialogRef,
  NbCardModule,
  NbButtonModule,
} from '@nebular/theme';
import { Observable } from 'rxjs';
import {
  ReviewDialogComponent,
  ReviewDialogData,
} from '../../shared/components/review-dialog/review-dialog.component';
import {
  ReportDialogComponent,
  ReportDialogData,
} from '../../shared/components/report-dialog/report-dialog.component';
import {
  ResponseDialogComponent,
  ResponseDialogData,
} from '../../shared/components/response-dialog/response-dialog.component';
import {
  FavoriteDialogComponent,
  FavoriteDialogData,
  FavoriteDialogResult,
} from '../../shared/components/favorite-dialog/favorite-dialog.component';
import {
  NotesDialogComponent,
  NotesDialogData,
} from '../../shared/components/notes-dialog/notes-dialog.component';
import {
  TagsDialogComponent,
  TagsDialogData,
} from '../../shared/components/tags-dialog/tags-dialog.component';

/**
 * Service for managing dialog interactions throughout the application
 */
@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private dialogService: NbDialogService) {}

  /**
   * Opens a dialog for writing or editing a review
   */
  openReviewDialog(data: ReviewDialogData): Observable<unknown> {
    return this.dialogService.open(ReviewDialogComponent, {
      context: { data },
      closeOnBackdropClick: false,
      hasBackdrop: true,
      backdropClass: 'dialog-backdrop',
    }).onClose;
  }

  /**
   * Opens a dialog for reporting content
   */
  reportReview(reviewId: string): Observable<string | undefined> {
    const dialogData: ReportDialogData = { title: 'Report Review', contentType: 'review' };

    return this.dialogService.open(ReportDialogComponent, {
      context: { data: dialogData },
      closeOnBackdropClick: true,
      hasBackdrop: true,
      backdropClass: 'dialog-backdrop',
    }).onClose;
  }

  /**
   * Opens a dialog for responding to a review
   * @param data Response dialog configuration data
   * @returns Observable that resolves with the response text or undefined if canceled
   */
  openResponseDialog(data: ResponseDialogData): Observable<string | undefined> {
    return this.dialogService.open(ResponseDialogComponent, {
      context: { data },
      closeOnBackdropClick: true,
      hasBackdrop: true,
      backdropClass: 'dialog-backdrop',
    }).onClose;
  }

  /**
   * Opens a dialog for adding or editing a favorite
   */
  openFavoriteDialog(data: FavoriteDialogData): Observable<FavoriteDialogResult | undefined> {
    return this.dialogService.open(FavoriteDialogComponent, {
      context: { data },
      closeOnBackdropClick: true,
      hasBackdrop: true,
      backdropClass: 'dialog-backdrop',
    }).onClose;
  }

  /**
   * Opens a dialog for editing notes
   */
  openNotesDialog(data: NotesDialogData): Observable<string | undefined> {
    return this.dialogService.open(NotesDialogComponent, {
      context: { data },
      closeOnBackdropClick: true,
      hasBackdrop: true,
      backdropClass: 'dialog-backdrop',
    }).onClose;
  }

  /**
   * Opens a dialog for managing tags
   */
  openTagsDialog(data: TagsDialogData): Observable<string[] | undefined> {
    const context = {
      data: {
        title: data.title,
        tags: data.tags || [],
        suggestedTags: data.suggestedTags || [],
        maxTags: data.maxTags || 20,
      },
    };

    return this.dialogService.open(TagsDialogComponent, {
      context,
      closeOnBackdropClick: true,
      hasBackdrop: true,
      backdropClass: 'dialog-backdrop',
    }).onClose;
  }

  /**
   * Helper method to respond to a review
   */
  respondToReview(
    reviewId: string,
    reviewTitle: string,
    reviewContent: string,
  ): Observable<string | undefined> {
    return this.openResponseDialog({
      title: 'Respond to Review',
      reviewTitle,
      reviewContent,
    });
  }

  /**
   * Helper method to add an ad to favorites
   */
  addToFavorites(adId: string, adTitle: string): Observable<FavoriteDialogResult | undefined> {
    return this.openFavoriteDialog({
      adId,
      adTitle,
    });
  }

  /**
   * Helper method to edit a favorite
   */
  editFavorite(
    adId: string,
    adTitle: string,
    notes?: string,
    tags?: string[],
    priority?: 'low' | 'normal' | 'high',
    notificationsEnabled?: boolean,
  ): Observable<FavoriteDialogResult | undefined> {
    return this.openFavoriteDialog({
      adId,
      adTitle,
      existingNotes: notes,
      existingTags: tags,
      existingPriority: priority,
      existingNotificationsEnabled: notificationsEnabled,
    });
  }

  open<T, D = any>(component: any, config?: Partial<NbDialogConfig<D>>): Observable<T> {
    return this.dialogService.open(component, config).onClose;
  }

  confirm(
    title: string,
    message: string,
    confirmText: string = 'Yes',
    cancelText: string = 'No',
  ): Observable<boolean> {
    return this.dialogService.open(ConfirmDialogComponent, {
      context: {
        title,
        message,
        confirmText,
        cancelText,
      },
    }).onClose;
  }
}

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <nb-card>
      <nb-card-header>{{ title }}</nb-card-header>
      <nb-card-body>
        <p>{{ message }}</p>
      </nb-card-body>
      <nb-card-footer class="dialog-footer">
        <button nbButton status="basic" (click)="cancel()">{{ cancelText }}</button>
        <button nbButton status="primary" (click)="confirm()">{{ confirmText }}</button>
      </nb-card-footer>
    </nb-card>
  `,
  styles: [
    `
      .dialog-footer {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule, NbCardModule, NbButtonModule],
})
export class ConfirmDialogComponent {
  constructor(private dialogRef: NbDialogRef<ConfirmDialogComponent>) {}

  title: string = '';
  message: string = '';
  confirmText: string = 'Yes';
  cancelText: string = 'No';

  confirm(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
