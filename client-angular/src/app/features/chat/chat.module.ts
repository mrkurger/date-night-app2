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
import { SharedModule } from '../../shared/shared.module';
import { ChatRoutingModule } from './chat-routing.module';
import { ChatComponent } from './chat.component';
import { ChatListComponent } from './chat-list/chat-list.component';
import { ChatRoomComponent } from './chat-room/chat-room.component';
import { ChatMessageComponent } from '../../shared/components/chat-message/chat-message.component';
import { ChatSettingsComponent } from '../../shared/components/chat-settings/chat-settings.component';
import { LinkifyPipe } from '../../shared/pipes/linkify.pipe';

@NgModule({
  declarations: [
    ChatComponent,
    ChatListComponent,
    ChatRoomComponent,
    ChatMessageComponent,
    ChatSettingsComponent,
  ],
  imports: [SharedModule, ChatRoutingModule],
  providers: [LinkifyPipe],
})
export class ChatModule {}
