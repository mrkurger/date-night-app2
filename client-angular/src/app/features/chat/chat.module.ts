// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for chat.module settings
//
// COMMON CUSTOMIZATIONS:
// - ENABLE_REAL_TIME_FEATURES: Enable real-time chat features (default: true)
// - ENABLE_MEDIA_SHARING: Enable media sharing in chat (default: true)
// - ENABLE_EMOJI_PICKER: Enable emoji picker in chat (default: true)
// - ENABLE_END_TO_END_ENCRYPTION: Enable end-to-end encryption (default: true)
// ===================================================
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../shared/material.module';

// Chat Components
import { ChatListComponent } from './chat-list/chat-list.component';
import { ChatRoomComponent } from './chat-room/chat-room.component';
import { ChatMessageComponent } from '../../shared/components/chat-message/chat-message.component';
import { ChatSettingsComponent } from '../../shared/components/chat-settings/chat-settings.component';

// Material Modules
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';

// Pipes
import { LinkifyPipe } from '../../shared/pipes/linkify.pipe';

// Routes
import { CHAT_ROUTES } from './chat.routes';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    RouterModule.forChild(CHAT_ROUTES),

    // Material Modules
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatTooltipModule,
    MatTabsModule,

    // Components
    ChatListComponent,
    ChatRoomComponent,
    ChatMessageComponent,
    ChatSettingsComponent,

    // Pipes
    LinkifyPipe,
  ],
})
export class ChatModule {}
