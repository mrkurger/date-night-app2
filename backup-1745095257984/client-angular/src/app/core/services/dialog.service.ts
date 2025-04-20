import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
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
 * Provides methods to open various dialog types with consistent configuration
 */
@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private dialog: MatDialog) {}

  /**
   * Opens a dialog for writing or editing a review
   * @param data Review dialog configuration data
   * @returns Observable that resolves with the submitted review or undefined if canceled
   */
  openReviewDialog(data: ReviewDialogData): Observable<any> {
    const dialogRef = this.dialog.open(ReviewDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: true,
      data,
    });

    return dialogRef.afterClosed();
  }

  /**
   * Opens a dialog for reporting content
   * @param data Report dialog configuration data
   * @returns Observable that resolves with the report reason or undefined if canceled
   */
  openReportDialog(data: ReportDialogData): Observable<string | undefined> {
    const dialogRef = this.dialog.open(ReportDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      disableClose: false,
      data,
    });

    return dialogRef.afterClosed();
  }

  /**
   * Opens a dialog for responding to a review
   * @param data Response dialog configuration data
   * @returns Observable that resolves with the response text or undefined if canceled
   */
  openResponseDialog(data: ResponseDialogData): Observable<string | undefined> {
    const dialogRef = this.dialog.open(ResponseDialogComponent, {
      width: '700px',
      maxWidth: '95vw',
      disableClose: true,
      data,
    });

    return dialogRef.afterClosed();
  }

  /**
   * Opens a dialog for adding or editing a favorite
   * @param data Favorite dialog configuration data
   * @returns Observable that resolves with the favorite details or undefined if canceled
   */
  openFavoriteDialog(data: FavoriteDialogData): Observable<FavoriteDialogResult | undefined> {
    const dialogRef = this.dialog.open(FavoriteDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      disableClose: false,
      data,
    });

    return dialogRef.afterClosed();
  }

  /**
   * Opens a dialog for editing notes
   * @param data Notes dialog configuration data
   * @returns Observable that resolves with the notes text or undefined if canceled
   */
  openNotesDialog(data: NotesDialogData): Observable<string | undefined> {
    const dialogRef = this.dialog.open(NotesDialogComponent, {
      width: '500px',
      maxWidth: '95vw',
      disableClose: false,
      data,
    });

    return dialogRef.afterClosed();
  }

  /**
   * Opens a dialog for managing tags
   * @param data Tags dialog configuration data
   * @returns Observable that resolves with the tags array or undefined if canceled
   */
  openTagsDialog(data: TagsDialogData): Observable<string[] | undefined> {
    const dialogRef = this.dialog.open(TagsDialogComponent, {
      width: '500px',
      maxWidth: '95vw',
      disableClose: false,
      data: {
        title: data.title,
        tags: data.tags || [],
        suggestedTags: data.suggestedTags || [],
        maxTags: data.maxTags || 20,
      },
    });

    return dialogRef.afterClosed();
  }

  /**
   * Opens a dialog for responding to a review with the review details
   * @param reviewId ID of the review to respond to
   * @param reviewTitle Title of the review
   * @param reviewContent Content of the review
   * @returns Observable that resolves with the response text or undefined if canceled
   */
  respondToReview(
    reviewId: string,
    reviewTitle: string,
    reviewContent: string
  ): Observable<string | undefined> {
    return this.openResponseDialog({
      title: 'Respond to Review',
      reviewTitle,
      reviewContent,
    });
  }

  /**
   * Opens a dialog for reporting a review
   * @param reviewId ID of the review to report
   * @returns Observable that resolves with the report reason or undefined if canceled
   */
  reportReview(reviewId: string): Observable<string | undefined> {
    return this.openReportDialog({
      title: 'Report Review',
      contentType: 'review',
    });
  }

  /**
   * Opens a dialog for adding an ad to favorites
   * @param adId ID of the ad to favorite
   * @param adTitle Title of the ad
   * @returns Observable that resolves with the favorite details or undefined if canceled
   */
  addToFavorites(adId: string, adTitle: string): Observable<FavoriteDialogResult | undefined> {
    return this.openFavoriteDialog({
      adId,
      adTitle,
    });
  }

  /**
   * Opens a dialog for editing a favorite
   * @param adId ID of the ad
   * @param adTitle Title of the ad
   * @param notes Existing notes
   * @param tags Existing tags
   * @param priority Existing priority
   * @param notificationsEnabled Whether notifications are enabled
   * @returns Observable that resolves with the updated favorite details or undefined if canceled
   */
  editFavorite(
    adId: string,
    adTitle: string,
    notes?: string,
    tags?: string[],
    priority?: 'low' | 'normal' | 'high',
    notificationsEnabled?: boolean
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
}
