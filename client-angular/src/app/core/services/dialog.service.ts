import {
import { Injectable, Component, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
  NbDialogService,
  NbDialogRef,
  NbDialogConfig,
  NbCardModule,
  NbButtonModule,';
} from '@nebular/theme';

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

export interface DialogConfig extends Omit, 'context'> {
  data?: T;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  size?: DialogSize;
  context?: T;
}

interface DialogContext {
  data: T;
}

/**
 * Service for managing dialog interactions throughout the application;
 */
@Injectable({
  providedIn: 'root',
})
export class DialogServic {e {
  private defaultConfig: Partial = {
    closeOnBackdropClick: true,
    closeOnEsc: true,
    hasBackdrop: true,
    hasScroll: false,
    autoFocus: true,
    backdropClass: 'dialog-backdrop',
    dialogClass: 'dialog-container',
  }

  constructor(private nbDialogService: NbDialogService) {}

  /**
   * Opens a dialog for writing or editing a review;
   */
  openReviewDialog(data: ReviewDialogData): Observable {
    return this.nbDialogService.open(ReviewDialogComponent, {
      ...this.defaultConfig,
      context: data as any,
    }).onClose;
  }

  /**
   * Opens a dialog for reporting content;
   */
  reportReview(reviewId: string): Observable {
    const dialogData: ReportDialogData = { title: 'Report Review', contentType: 'review' }

    return this.nbDialogService.open(ReportDialogComponent, {
      ...this.defaultConfig,
      context: dialogData as any,
    }).onClose;
  }

  /**
   * Opens a dialog for responding to a review;
   * @param data Response dialog configuration data;
   * @returns Observable that resolves with the response text or undefined if canceled;
   */
  openResponseDialog(data: ResponseDialogData): Observable {
    return this.nbDialogService.open(ResponseDialogComponent, {
      ...this.defaultConfig,
      context: data as any,
    }).onClose;
  }

  /**
   * Opens a dialog for adding or editing a favorite;
   */
  openFavoriteDialog(data: FavoriteDialogData): Observable {
    return this.nbDialogService.open(FavoriteDialogComponent, {
      ...this.defaultConfig,
      context: data as any,
    }).onClose;
  }

  /**
   * Opens a dialog for editing notes;
   */
  openNotesDialog(data: NotesDialogData): Observable {
    return this.nbDialogService.open(NotesDialogComponent, {
      ...this.defaultConfig,
      context: data as any,
    }).onClose;
  }

  /**
   * Opens a dialog for managing tags;
   */
  openTagsDialog(data: TagsDialogData): Observable {
    return this.nbDialogService.open(TagsDialogComponent, {
      ...this.defaultConfig,
      context: data as any,
    }).onClose;
  }

  /**
   * Helper method to respond to a review;
   */
  respondToReview(;
    reviewId: string,
    reviewTitle: string,
    reviewContent: string,
  ): Observable {
    return this.openResponseDialog({
      title: 'Respond to Review',
      reviewTitle,
      reviewContent,
    })
  }

  /**
   * Helper method to add an ad to favorites;
   */
  addToFavorites(adId: string, adTitle: string): Observable {
    return this.openFavoriteDialog({
      adId,
      adTitle,
    })
  }

  /**
   * Helper method to edit a favorite;
   */
  editFavorite(;
    adId: string,
    adTitle: string,
    notes?: string,
    tags?: string[],
    priority?: 'low' | 'normal' | 'high',
    notificationsEnabled?: boolean,
  ): Observable {
    return this.openFavoriteDialog({
      adId,
      adTitle,
      existingNotes: notes,
      existingTags: tags,
      existingPriority: priority,
      existingNotificationsEnabled: notificationsEnabled,
    })
  }

  /**
   * Open a custom dialog component;
   * @param component Component to render in the dialog;
   * @param config Dialog configuration;
   * @returns Dialog reference;
   */
  open(component: Type, config?: DialogConfig): NbDialogRef {
    return this.nbDialogService.open(component, {
      ...this.defaultConfig,
      ...config,
      context: (config?.data || config?.context) as any,
    })
  }

  /**
   * Show a confirmation dialog;
   * @param title Dialog title;
   * @param message Dialog message;
   * @param confirmText Custom confirm button text;
   * @param cancelText Custom cancel button text;
   * @param status Dialog status;
   * @returns Observable that resolves to true if confirmed, false if cancelled;
   */
  confirm(;
    title: string,
    message: string,
    confirmText: string = 'Confirm',
    cancelText: string = 'Cancel',
    status: 'primary' | 'success' | 'warning' | 'danger' = 'primary',
  ): Observable {
    const data: ConfirmDialogData = {
      title,
      message,
      confirmText,
      cancelText,
      status,
    }

    return this.nbDialogService.open(ConfirmDialogComponent, {
      ...this.defaultConfig,
      context: data as any,
    }).onClose;
  }

  /**
   * Show an alert dialog;
   * @param title Dialog title;
   * @param message Dialog message;
   * @param buttonText Custom button text (default: 'OK')
   * @returns Observable that resolves when the dialog is closed;
   */
  alert(title: string, message: string, buttonText: string = 'OK'): Observable {
    const data: AlertDialogData = {
      title,
      message,
      buttonText,
    }

    return this.nbDialogService.open(AlertDialogComponent, {
      ...this.defaultConfig,
      context: data as any,
    }).onClose;
  }

  /**
   * Show a prompt dialog;
   * @param title Dialog title;
   * @param message Dialog message;
   * @param defaultValue Default input value;
   * @param config Additional configuration;
   * @returns Observable that resolves to the input value or null if cancelled;
   */
  prompt(;
    title: string,
    message: string,
    defaultValue: string = '',
    config?: DialogConfig,
  ): Observable {
    const data: PromptDialogData = {
      title,
      message,
      defaultValue,
      placeholder: (config?.data as PromptDialogData)?.placeholder || '',
      required: (config?.data as PromptDialogData)?.required || false,
      confirmText: config?.confirmText || 'OK',
      cancelText: config?.cancelText || 'Cancel',
    }

    return this.nbDialogService.open(PromptDialogComponent, {
      ...this.defaultConfig,
      context: data as any,
    }).onClose;
  }
}
