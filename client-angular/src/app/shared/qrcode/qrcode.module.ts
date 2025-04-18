// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for qrcode.module settings
//
// COMMON CUSTOMIZATIONS:
// - None currently
// ===================================================
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QRCodeModule as AngularxQRCodeModule } from 'angularx-qrcode';

/**
 * QR Code Module
 *
 * This module provides the QR code component from angularx-qrcode.
 * It centralizes the import to avoid multiple direct imports across the application.
 */
@NgModule({
  declarations: [],
  imports: [CommonModule, AngularxQRCodeModule],
  exports: [AngularxQRCodeModule],
})
export class QRCodeModule {}
