import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ContentModerationComponent } from './content-moderation.component';
import { ModerationModalComponent } from './moderation-modal/moderation-modal.component';

@NgModule({
  declarations: [
    ContentModerationComponent,
    ModerationModalComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbModule
  ],
  exports: [ContentModerationComponent]
})
export class ContentModerationModule { }
