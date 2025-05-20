import {
  NbDialogService,
  NbDialogRef,
  NbDialogConfig,
  NbCardModule,
  NbButtonModule,
} from '@nebular/theme';

import { Injectable, Component, Type } from '@angular/core';
import { CommonModule } from '@angular/common';

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
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import {
  AlertDialogComponent,
  AlertDialogData,
} from '../../shared/components/dialogs/alert-dialog/alert-dialog.component';
import {
  PromptDialogComponent,
  PromptDialogData,
} from '../../shared/components/dialogs/prompt-dialog/prompt-dialog.component';

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl';

export interface DialogConfig<T = any> extends Omit<NbDialogConfig<T>, 'context'> {
  data?: T;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  size?: DialogSize;
  context?: T;
}

interface DialogContext<T> {
  data: T;
}

/**
 * Service for managing dialog interactions throughout the application
 */
@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private defaultConfig: Partial<NbDialogConfig> = {
    closeOnBackdropClick: true,
    closeOnEsc: true,
    hasBackdrop: true,
    hasScroll: false,
    autoFocus: true,
    backdropClass: 'dialog-backdrop',
    dialogClass: 'dialog-container',
  };

  constructor(private nbDialogService: NbDialogService) {}

  /**
   * Opens a dialog for writing or editing a review
   */
  openReviewDialog(data: ReviewDialogData): Observable<unknown> {
    return this.nbDialogService.open<ReviewDialogComponent>(ReviewDialogComponent, {
      ...this.defaultConfig,
      context: data,
      providers: [{ provide: 'REVIEW_DIALOG_DATA', useValue: data }],
    }).onClose;
  }

  /**
   * Opens a dialog for reporting content
   */
  reportReview(reviewId: string): Observable<string | undefined> {
    const dialogData: ReportDialogData = { title: 'Report Review', contentType: 'review' };

    return this.nbDialogService.open<ReportDialogComponent>(ReportDialogComponent, {
      ...this.defaultConfig,
      context: dialogData,
      providers: [{ provide: 'REPORT_DIALOG_DATA', useValue: dialogData }],
    }).onClose;
  }

  /**
   * Opens a dialog for responding to a review
   * @param data Response dialog configuration data
   * @returns Observable that resolves with the response text or undefined if canceled
   */
  openResponseDialog(data: ResponseDialogData): Observable<string | undefined> {
    return this.nbDialogService.open<ResponseDialogComponent>(ResponseDialogComponent, {
      ...this.defaultConfig,
      context: data,
      providers: [{ provide: 'RESPONSE_DIALOG_DATA', useValue: data }],
    }).onClose;
  }

  /**
   * Opens a dialog for adding or editing a favorite
   */
  openFavoriteDialog(data: FavoriteDialogData): Observable<FavoriteDialogResult | undefined> {
    return this.nbDialogService.open<FavoriteDialogComponent>(FavoriteDialogComponent, {
      ...this.defaultConfig,
      context: data,
      providers: [{ provide: 'FAVORITE_DIALOG_DATA', useValue: data }],
    }).onClose;
  }

  /**
   * Opens a dialog for editing notes
   */
  openNotesDialog(data: NotesDialogData): Observable<string | undefined> {
    return this.nbDialogService.open<NotesDialogComponent>(NotesDialogComponent, {
      ...this.defaultConfig,
      context: data,
      providers: [{ provide: 'NOTES_DIALOG_DATA', useValue: data }],
    }).onClose;
  }

  /**
   * Opens a dialog for managing tags
   */
  openTagsDialog(data: TagsDialogData): Observable<string[] | undefined> {
    return this.nbDialogService.open<TagsDialogComponent>(TagsDialogComponent, {
      ...this.defaultConfig,
      context: data,
      providers: [{ provide: 'TAGS_DIALOG_DATA', useValue: data }],
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

  /**
   * Open a custom dialog component
   * @param component Component to render in the dialog
   * @param config Dialog configuration
   * @returns Dialog reference
   */
  open<T, D = any>(component: Type<T>, config?: DialogConfig<D>): NbDialogRef<T> {
    return this.nbDialogService.open<T>(component, {
      ...this.defaultConfig,
      ...config,
      context: config?.data || config?.context,
      providers: [{ provide: 'DIALOG_DATA', useValue: config?.data || config?.context }],
    });
  }

  /**
   * Show a confirmation dialog
   * @param title Dialog title
   * @param message Dialog message
   * @param confirmText Custom confirm button text
   * @param cancelText Custom cancel button text
   * @param status Dialog status
   * @returns Observable that resolves to true if confirmed, false if cancelled
   */
  confirm(
    title: string,
    message: string,
    confirmText: string = 'Confirm',
    cancelText: string = 'Cancel',
    status: 'primary' | 'success' | 'warning' | 'danger' = 'primary',
  ): Observable<boolean> {
    const data: ConfirmDialogData = {
      title,
      message,
      confirmText,
      cancelText,
      status,
    };

    return this.nbDialogService.open<ConfirmDialogComponent>(ConfirmDialogComponent, {
      ...this.defaultConfig,
      context: data,
      providers: [{ provide: 'CONFIRM_DIALOG_DATA', useValue: data }],
    }).onClose;
  }

  /**
   * Show an alert dialog
   * @param title Dialog title
   * @param message Dialog message
   * @param buttonText Custom button text (default: 'OK')
   * @returns Observable that resolves when the dialog is closed
   */
  alert(title: string, message: string, buttonText: string = 'OK'): Observable<void> {
    const data: AlertDialogData = {
      title,
      message,
      buttonText,
    };

    return this.nbDialogService.open<AlertDialogComponent>(AlertDialogComponent, {
      ...this.defaultConfig,
      context: data,
      providers: [{ provide: 'ALERT_DIALOG_DATA', useValue: data }],
    }).onClose;
  }

  /**
   * Show a prompt dialog
   * @param title Dialog title
   * @param message Dialog message
   * @param defaultValue Default input value
   * @param config Additional configuration
   * @returns Observable that resolves to the input value or null if cancelled
   */
  prompt(
    title: string,
    message: string,
    defaultValue: string = '',
    config?: DialogConfig,
  ): Observable<string | null> {
    const data: PromptDialogData = {
      title,
      message,
      defaultValue,
      confirmText: config?.confirmText || 'OK',
      cancelText: config?.cancelText || 'Cancel',
      placeholder: config?.data?.placeholder,
      required: config?.data?.required,
    };

    return this.nbDialogService.open<PromptDialogComponent>(PromptDialogComponent, {
      ...this.defaultConfig,
      ...config,
      context: data,
      providers: [{ provide: 'PROMPT_DIALOG_DATA', useValue: data }],
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
    imports: [CommonModule, NbCardModule, NbButtonModule]
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
