import { _Component } from '@angular/core';
import { Routes } from '@angular/router';
import { ChatListComponent } from './chat-list/chat-list.component';
import { ChatRoomComponent } from './chat-room/chat-room.component';
import { AuthGuard } from '../../core/guards/auth.guard';

export const CHAT_ROUTES: Routes = [
  {
    path: '',
    component: ChatListComponent,
    canActivate: [AuthGuard],
    title: 'Messages',
  },
  {
    path: ':id',
    component: ChatRoomComponent,
    canActivate: [AuthGuard],
    title: 'Chat',
  },
];
