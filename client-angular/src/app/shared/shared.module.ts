import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NebularModule } from './nebular.module';

// Import shared components
import { ChatMessageComponent } from './components/chat-message/chat-message.component';
import { FavoriteButtonComponent } from './components/favorite-button/favorite-button.component';
import { AlertNotificationsComponent } from './components/alert-notifications/alert-notifications.component';
import { ResponseDialogComponent } from './components/response-dialog/response-dialog.component';

// Import shared pipes
import { TimeAgoPipe } from './pipes/time-ago.pipe';
import { FileSizePipe } from './pipes/file-size.pipe';
import { LinkifyPipe } from './pipes/linkify.pipe';

const SHARED_COMPONENTS = [
  ChatMessageComponent,
  FavoriteButtonComponent,
  AlertNotificationsComponent,
  ResponseDialogComponent,
];

const SHARED_PIPES = [TimeAgoPipe, FileSizePipe, LinkifyPipe];

/**
 * Shared Module
 *
 * This module exports common Angular modules and our NebularModule
 * for use throughout the application.
 */
@NgModule({
  declarations: [...SHARED_COMPONENTS, ...SHARED_PIPES],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, NebularModule],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NebularModule,
    ...SHARED_COMPONENTS,
    ...SHARED_PIPES,
  ],
})
export class SharedModule {}
