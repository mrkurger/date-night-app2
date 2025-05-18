import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NebularModule } from '../../../../../app/shared/nebular.module';
import { NbChatModule, NbIconModule } from '@nebular/theme'; // Example imports, chat module will be complex

@Component({
  selector: 'app-alt-chat-widget',
  standalone: true,
  imports: [NebularModule, CommonModule, NbChatModule, NbIconModule],
  templateUrl: './alt-chat-widget.component.html',
  styleUrls: ['./alt-chat-widget.component.scss'],
})
export class AltChatWidgetComponent {
  // TODO: Implement chat widget logic
  isOpen = false;

  toggleChat() {
    this.isOpen = !this.isOpen;
  }
}
