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
// Import QRCodeComponent directly for Angular v19+
import { QRCodeComponent } from 'angularx-qrcode';

/**
 * QR Code Module
 *
 * This module provides the QR code component from angularx-qrcode.
 * It centralizes the import to avoid multiple direct imports across the application.
 *
 * NOTE: In Angular 19+, QRCodeComponent is a standalone component and should be
 * imported directly in components that need it, rather than through this module.
 * This module is kept for backward compatibility.
 */
@NgModule({
  declarations: [],
  imports: [CommonModule, QRCodeComponent],
  // No exports needed for standalone components - they are imported directly where needed
})
export class QRCodeModule {}
