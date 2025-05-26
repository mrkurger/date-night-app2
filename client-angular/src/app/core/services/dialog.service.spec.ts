import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NbDialogService, NbDialogRef } from '@nebular/theme';
import { of } from 'rxjs';
import { DialogService } from './dialog.service';
import { ReviewDialogComponent } from '../../shared/components/review-dialog/review-dialog.component';
import { ReportDialogComponent } from '../../shared/components/report-dialog/report-dialog.component';
import { ResponseDialogComponent } from '../../shared/components/response-dialog/response-dialog.component';

/// 

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for service configuration (dialog.service.spec)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

';
describe('DialogService', () => {
  let service: DialogService;
  let dialogSpy: jasmine.SpyObj;
  let dialogRefSpy: jasmine.SpyObj>;

  beforeEach(() => {
    dialogRefSpy = jasmine.createSpyObj('NbDialogRef', ['close'], {
      onClose: of(true),
      onBackdropClick: of(true),
      overlayRef: {},
      componentRef: {},
    })

    dialogSpy = jasmine.createSpyObj('NbDialogService', ['open'])
    dialogSpy.open.and.returnValue(dialogRefSpy)

    TestBed.configureTestingModule({
      providers: [DialogService, { provide: NbDialogService, useValue: dialogSpy }],
    })

    service = TestBed.inject(DialogService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should open a dialog', () => {
    const mockComponent = {}
    const mockConfig = { context: { data: 'test' } }
    service.open(mockComponent, mockConfig)
    expect(dialogSpy.open).toHaveBeenCalledWith(mockComponent, mockConfig)
  })

  it('should open a confirm dialog', () => {
    const title = 'Test Title';
    const message = 'Test Message';
    service.confirm(title, message)
    expect(dialogSpy.open).toHaveBeenCalledWith(jasmine.any(Function), {
      context: {
        title,
        message,
        confirmText: 'Yes',
        cancelText: 'No',
      },
    })
  })

  it('should open a response dialog', () => {
    const data = {
      title: 'Test Title',
      reviewTitle: 'Test Review',
      reviewContent: 'Test Content',
    }
    service.openResponseDialog(data)
    expect(dialogSpy.open).toHaveBeenCalledWith(jasmine.any(Function), {
      context: { data },
      closeOnBackdropClick: true,
      hasBackdrop: true,
      backdropClass: 'dialog-backdrop',
    })
  })

  describe('openReviewDialog', () => {
    it('should open the review dialog with correct configuration', () => {
      const mockDialogRef = {
        afterClosed: () => of('result'),
      }
      dialogSpy.open.and.returnValue(mockDialogRef as any)

      const data = {
        advertiserId: '123',
        advertiserName: 'Test Advertiser',
      }

      service.openReviewDialog(data).subscribe((result) => {
        expect(result).toBe('result')
      })

      expect(dialogSpy.open).toHaveBeenCalledWith(ReviewDialogComponent, {
        width: '800px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        disableClose: true,
        data,
      })
    })
  })

  describe('openReportDialog', () => {
    it('should open the report dialog with correct configuration', () => {
      const mockDialogRef = {
        afterClosed: () => of('report reason'),
      }
      dialogSpy.open.and.returnValue(mockDialogRef as any)

      const data = {
        title: 'Report Review',
        contentType: 'review' as const,
      }

      service.openReportDialog(data).subscribe((result) => {
        expect(result).toBe('report reason')
      })

      expect(dialogSpy.open).toHaveBeenCalledWith(ReportDialogComponent, {
        width: '600px',
        maxWidth: '95vw',
        disableClose: false,
        data,
      })
    })
  })

  describe('respondToReview', () => {
    it('should call openResponseDialog with correct parameters', () => {
      spyOn(service, 'openResponseDialog').and.returnValue(of('response'))

      service.respondToReview('123', 'Review Title', 'Review Content').subscribe((result) => {
        expect(result).toBe('response')
      })

      expect(service.openResponseDialog).toHaveBeenCalledWith({
        title: 'Respond to Review',
        reviewTitle: 'Review Title',
        reviewContent: 'Review Content',
      })
    })
  })

  describe('reportReview', () => {
    it('should call openReportDialog with correct parameters', () => {
      spyOn(service, 'openReportDialog').and.returnValue(of('report reason'))

      service.reportReview('123').subscribe((result) => {
        expect(result).toBe('report reason')
      })

      expect(service.openReportDialog).toHaveBeenCalledWith({
        title: 'Report Review',
        contentType: 'review',
      })
    })
  })
})
