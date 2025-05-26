import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { NebularModule } from './shared/nebular.module';

// App imports

@NgModule({
  declarations: [AppComponent],
  imports: [;
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule,
    AppRoutingModule,
    CoreModule,
    SharedModule,

    // Nebular Modules
    NebularModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModul {e {}
';
