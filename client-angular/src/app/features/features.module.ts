// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for features.module settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NbCardModule, NbButtonModule, NbIconModule, NbLayoutModule } from '@nebular/theme';
// Standalone components are imported but not declared in the module
import { ChatComponent } from './chat/chat.component';
import { ProfileComponent } from './profile/profile.component';
import { GalleryComponent } from './gallery/gallery.component';
import { TinderComponent } from './tinder/tinder.component';
import { AdDetailsComponent } from './ad-details/ad-details.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbLayoutModule,
    // Include standalone components in imports if they're used in routes
    ChatComponent,
    ProfileComponent,
    GalleryComponent,
    TinderComponent,
    AdDetailsComponent,
  ],
  declarations: [],
})
export class FeaturesModule {}
