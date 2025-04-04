import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { FeaturesModule } from './features/features.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { AdBrowserComponent } from './features/ad-browser/ad-browser.component';
import { AdDetailsComponent } from './features/ad-details/ad-details.component';

const socketConfig: SocketIoConfig = { url: environment.apiUrl, options: {} };

@NgModule({
  declarations: [
    AppComponent,
    AdBrowserComponent,
    AdDetailsComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    CoreModule,
    SharedModule,
    FeaturesModule,
    AppRoutingModule,
    SocketIoModule.forRoot(socketConfig)
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
