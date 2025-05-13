import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbUserModule } from '@nebular/theme';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule, NbUserModule],
  template: `
    <nb-user
      [name]="name"
      [title]="title"
      [picture]="imageUrl"
      [size]="size"
      [showTitle]="showTitle"
      [showName]="showName"
      [badgeText]="badgeText"
      [badgeStatus]="badgeStatus"
      [badgePosition]="badgePosition"
    >
    </nb-user>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }
    `,
  ],
})
export class AvatarComponent {
  @Input() name?: string;
  @Input() title?: string;
  @Input() imageUrl?: string;
  @Input() size: 'tiny' | 'small' | 'medium' | 'large' | 'giant' = 'medium';
  @Input() showTitle = true;
  @Input() showName = true;
  @Input() badgeText?: string;
  @Input() badgeStatus?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  @Input() badgePosition?: 'top right' | 'bottom right' | 'top left' | 'bottom left' =
    'bottom right';
}
