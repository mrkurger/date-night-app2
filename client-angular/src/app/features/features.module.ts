import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { AdBrowserComponent } from './ad-browser/ad-browser.component';
import { AdDetailsComponent } from './ad-details/ad-details.component';
import { AdManagementComponent } from './ad-management/ad-management.component';
import { ChatComponent } from './chat/chat.component';
import { ProfileComponent } from './profile/profile.component';
import { GalleryComponent } from './gallery/gallery.component';
import { TinderComponent } from './tinder/tinder.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    SharedModule
  ],
  declarations: [
    AdBrowserComponent,
    AdDetailsComponent,
    AdManagementComponent,
    ChatComponent,
    ProfileComponent,
    GalleryComponent,
    TinderComponent
  ]
})
export class FeaturesModule { }
