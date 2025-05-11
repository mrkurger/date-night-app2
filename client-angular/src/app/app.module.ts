// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for app.module settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/material.module';
import { AppRoutingModule } from './app-routing.module';
import { environment } from '../environments/environment';
import { GlobalErrorHandler } from './core/error-handling/global-error-handler';
import { PerformanceModule } from './core/performance/performance.module';
import { NbThemeModule, NbLayoutModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';

/**
 * @deprecated This module is being phased out in favor of the standalone component approach.
 * See app.config.ts and main.ts for the new bootstrapping method.
 *
 * This module is kept for backward compatibility during the transition period.
 * New features should use the standalone component pattern.
 */
const socketConfig: SocketIoConfig = { url: environment.socketUrl, options: {} };

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    CoreModule,
    SharedModule,
    AppRoutingModule,
    SocketIoModule.forRoot(socketConfig),
    PerformanceModule.forRoot({
      enableMonitoring: true,
      enableApiCache: true,
      monitorLongTasks: true,
      monitorMemoryUsage: true,
      monitorWebVitals: true,
    }),
    NbThemeModule.forRoot({ name: 'default' }),
    NbLayoutModule,
    NbEvaIconsModule,
  ],
  providers: [
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    // AuthInterceptor is already provided in CoreModule
  ],
  // AppComponent is now bootstrapped via bootstrapApplication in main.ts
})
export class AppModule {}
