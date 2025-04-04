import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageGalleryComponent } from './components/image-gallery/image-gallery.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from './components/error-message/error-message.component';

@NgModule({
  declarations: [
    ImageGalleryComponent,
    LoadingSpinnerComponent,
    ErrorMessageComponent
  ],
  imports: [CommonModule],
  exports: [
    ImageGalleryComponent,
    LoadingSpinnerComponent,
    ErrorMessageComponent
  ]
})
export class SharedModule { }
