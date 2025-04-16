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
}
