import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ChatRoutingModule } from './chat-routing.module';
import { LinkifyPipe } from '../../shared/pipes/linkify.pipe';

@NgModule({
  // Only non-standalone components should be declared here.
  // Standalone components are imported directly where used.
  declarations: [
    // ChatComponent, // standalone
    // ChatListComponent, // standalone
    // ChatRoomComponent, // standalone
    // ChatMessageComponent, // standalone
    // ChatSettingsComponent, // standalone
  ],
  imports: [SharedModule, ChatRoutingModule],
  providers: [LinkifyPipe],
})
export class ChatModule {}
