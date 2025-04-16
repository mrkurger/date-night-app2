import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TelemetryService } from './telemetry.service';
import { MockTelemetryService } from './mock-telemetry.service';
import { environment } from '../../../environments/environment';

/**
 * Module for providing the mock telemetry service in development mode
 */
@NgModule({
  imports: [CommonModule],
  providers: [
    {
      provide: TelemetryService,
      useClass: environment.useMockServices ? MockTelemetryService : TelemetryService,
    },
  ],
})
export class MockTelemetryModule {}
