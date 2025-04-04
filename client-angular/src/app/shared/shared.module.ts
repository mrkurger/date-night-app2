import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ImageGalleryComponent } from './components/image-gallery/image-gallery.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from './components/error-message/error-message.component';
import { NotificationComponent } from './components/notification/notification.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    ImageGalleryComponent,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    NotificationComponent
  ],
  exports: [
    ImageGalleryComponent,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    NotificationComponent
  ]
})
export class SharedModule { }
