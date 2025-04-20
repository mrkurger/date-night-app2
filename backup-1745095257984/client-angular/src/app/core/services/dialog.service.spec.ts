// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for service configuration (dialog.service.spec)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { DialogService } from './dialog.service';
import { ReviewDialogComponent } from '../../shared/components/review-dialog/review-dialog.component';
import { ReportDialogComponent } from '../../shared/components/report-dialog/report-dialog.component';
import { ResponseDialogComponent } from '../../shared/components/response-dialog/response-dialog.component';

describe('DialogService', () => {
  let service: DialogService;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      providers: [DialogService, { provide: MatDialog, useValue: spy }],
    });

    service = TestBed.inject(DialogService);
    dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('openReviewDialog', () => {
    it('should open the review dialog with correct configuration', () => {
      const mockDialogRef = {
        afterClosed: () => of('result'),
      };
      dialogSpy.open.and.returnValue(mockDialogRef as any);

      const data = {
        advertiserId: '123',
        advertiserName: 'Test Advertiser',
      };

      service.openReviewDialog(data).subscribe(result => {
        expect(result).toBe('result');
      });

      expect(dialogSpy.open).toHaveBeenCalledWith(ReviewDialogComponent, {
        width: '800px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        disableClose: true,
        data,
      });
    });
  });

  describe('openReportDialog', () => {
    it('should open the report dialog with correct configuration', () => {
      const mockDialogRef = {
        afterClosed: () => of('report reason'),
      };
      dialogSpy.open.and.returnValue(mockDialogRef as any);

      const data = {
        title: 'Report Review',
        contentType: 'review' as const,
      };

      service.openReportDialog(data).subscribe(result => {
        expect(result).toBe('report reason');
      });

      expect(dialogSpy.open).toHaveBeenCalledWith(ReportDialogComponent, {
        width: '600px',
        maxWidth: '95vw',
        disableClose: false,
        data,
      });
    });
  });

  describe('openResponseDialog', () => {
    it('should open the response dialog with correct configuration', () => {
      const mockDialogRef = {
        afterClosed: () => of('response text'),
      };
      dialogSpy.open.and.returnValue(mockDialogRef as any);

      const data = {
        title: 'Respond to Review',
        reviewTitle: 'Great experience',
        reviewContent: 'Had a wonderful time',
      };

      service.openResponseDialog(data).subscribe(result => {
        expect(result).toBe('response text');
      });

      expect(dialogSpy.open).toHaveBeenCalledWith(ResponseDialogComponent, {
        width: '700px',
        maxWidth: '95vw',
        disableClose: true,
        data,
      });
    });
  });

  describe('respondToReview', () => {
    it('should call openResponseDialog with correct parameters', () => {
      spyOn(service, 'openResponseDialog').and.returnValue(of('response'));

      service.respondToReview('123', 'Review Title', 'Review Content').subscribe(result => {
        expect(result).toBe('response');
      });

      expect(service.openResponseDialog).toHaveBeenCalledWith({
        title: 'Respond to Review',
        reviewTitle: 'Review Title',
        reviewContent: 'Review Content',
      });
    });
  });

  describe('reportReview', () => {
    it('should call openReportDialog with correct parameters', () => {
      spyOn(service, 'openReportDialog').and.returnValue(of('report reason'));

      service.reportReview('123').subscribe(result => {
        expect(result).toBe('report reason');
      });

      expect(service.openReportDialog).toHaveBeenCalledWith({
        title: 'Report Review',
        contentType: 'review',
      });
    });
  });
});
