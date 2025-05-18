import {
  NbDialogService,
  NbDialogRef,
  NbDialogConfig,
  NbCardModule,
  NbButtonModule,
} from '@nebular/theme';
import { _NebularModule } from '../../shared/nebular.module';

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
import { ConfirmDialogComponent } from '../../shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import { AlertDialogComponent } from '../../shared/components/dialogs/alert-dialog/alert-dialog.component';
import { PromptDialogComponent } from '../../shared/components/dialogs/prompt-dialog/prompt-dialog.component';

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

interface ConfirmDialogContext {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  status: 'primary' | 'success' | 'warning' | 'danger';
}

interface AlertDialogContext {
  title: string;
  message: string;
  buttonText: string;
}

interface PromptDialogContext {
  title: string;
  message: string;
  defaultValue: string;
  confirmText: string;
  cancelText: string;
  placeholder?: string;
  required?: boolean;
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
    return this.nbDialogService.open(ReviewDialogComponent, {
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

    return this.nbDialogService.open(ReportDialogComponent, {
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
    return this.nbDialogService.open(ResponseDialogComponent, {
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
    return this.nbDialogService.open(FavoriteDialogComponent, {
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
    return this.nbDialogService.open(NotesDialogComponent, {
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

    return this.nbDialogService.open(TagsDialogComponent, {
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

  /**
   * Open a custom dialog component
   * @param component Component to render in the dialog
   * @param config Dialog configuration
   * @returns Dialog reference
   */
  open<T, D = any>(component: Type<T>, config?: DialogConfig<D>): NbDialogRef<T> {
    const dialogConfig: Partial<NbDialogConfig<D>> = {
      ...this.defaultConfig,
      ...config,
      context: config?.data || config?.context,
    };

    return this.nbDialogService.open<T>(component, dialogConfig);
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
    const context: ConfirmDialogContext = {
      title,
      message,
      confirmText,
      cancelText,
      status,
    };

    const dialogConfig: Partial<NbDialogConfig<ConfirmDialogContext>> = {
      ...this.defaultConfig,
      context,
    };

    return this.nbDialogService.open<ConfirmDialogComponent>(ConfirmDialogComponent, dialogConfig)
      .onClose;
  }

  /**
   * Show an alert dialog
   * @param title Dialog title
   * @param message Dialog message
   * @param buttonText Custom button text (default: 'OK')
   * @returns Observable that resolves when the dialog is closed
   */
  alert(title: string, message: string, buttonText: string = 'OK'): Observable<void> {
    const context: AlertDialogContext = {
      title,
      message,
      buttonText,
    };

    const dialogConfig: Partial<NbDialogConfig<AlertDialogContext>> = {
      ...this.defaultConfig,
      context,
    };

    return this.nbDialogService.open<AlertDialogComponent>(AlertDialogComponent, dialogConfig)
      .onClose;
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
    const context: PromptDialogContext = {
      title,
      message,
      defaultValue,
      confirmText: config?.confirmText || 'OK',
      cancelText: config?.cancelText || 'Cancel',
      placeholder: config?.data?.placeholder,
      required: config?.data?.required,
    };

    const dialogConfig: Partial<NbDialogConfig<PromptDialogContext>> = {
      ...this.defaultConfig,
      ...config,
      context,
    };

    return this.nbDialogService.open<PromptDialogComponent>(PromptDialogComponent, dialogConfig)
      .onClose;
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
