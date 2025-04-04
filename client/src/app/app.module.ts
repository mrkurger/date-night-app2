import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { AdManagementComponent } from './features/ad-management/ad-management.component';
// ... import other feature components as they are migrated ...

@NgModule({
  declarations: [
    // ...existing root components...
    AdManagementComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CoreModule,
    SharedModule,
    // ...other feature modules can also be imported if created as NgModules...
  ],
  providers: [],
  bootstrap: [/* root component, e.g., AppComponent */]
})
export class AppModule { }
