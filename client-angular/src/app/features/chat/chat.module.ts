// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for chat.module settings
//
// COMMON CUSTOMIZATIONS:
// - ENABLE_REAL_TIME_FEATURES: Enable real-time chat features (default: true)
// - ENABLE_MEDIA_SHARING: Enable media sharing in chat (default: true)
// - ENABLE_EMOJI_PICKER: Enable emoji picker in chat (default: true)
// ===================================================
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../shared/material.module';
import { ChatComponent } from './chat.component';

// Material Modules
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';

// Emerald Components
import { AvatarComponent } from '../../shared/emerald/components/avatar/avatar.component';
import { SkeletonLoaderComponent } from '../../shared/emerald/components/skeleton-loader/skeleton-loader.component';

const routes: Routes = [
  { path: '', component: ChatComponent },
  { path: ':userId', component: ChatComponent },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    RouterModule.forChild(routes),

    // Material Modules
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatTooltipModule,
    MatTabsModule,

    // Emerald Components
    AvatarComponent,
    SkeletonLoaderComponent,

    // Standalone Component
    ChatComponent,
  ],
})
export class ChatModule {}
