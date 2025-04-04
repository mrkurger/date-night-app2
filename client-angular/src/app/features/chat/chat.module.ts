import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/material.module';
import { ChatComponent } from './chat.component';

const routes: Routes = [
  { path: '', component: ChatComponent },
  { path: ':userId', component: ChatComponent }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild(routes),
    ChatComponent // Import the standalone component instead of declaring it
  ]
})
export class ChatModule { }
