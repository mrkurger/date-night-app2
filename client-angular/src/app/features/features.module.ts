// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for features.module settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/material.module';
import { AdDetailsComponent } from './ad-details/ad-details.component';
// Standalone components are imported but not declared in the module
import { ChatComponent } from './chat/chat.component';
import { ProfileComponent } from './profile/profile.component';
import { GalleryComponent } from './gallery/gallery.component';
import { TinderComponent } from './tinder/tinder.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    // Include standalone components in imports if they're used in routes
    ChatComponent,
    ProfileComponent,
    GalleryComponent,
    TinderComponent,
  ],
  declarations: [AdDetailsComponent],
})
export class FeaturesModule {}
