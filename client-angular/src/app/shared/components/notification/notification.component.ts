import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { NbIconModule, NbButtonModule } from '@nebular/theme';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, NbIconModule, NbButtonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  animations: [
    trigger('notificationAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateY(100%)', opacity: 0 })),
      ]),
    ]),
  ],
})
export class NotificationComponent implements OnInit, OnDestroy {
  @Input() message: string = '';
  @Input() type: 'success' | 'error' | 'warning' | 'info' = 'info';
  @Input() duration: number = 3000;
  @Output() closed = new EventEmitter<void>();

  private timer: any;

  ngOnInit(): void {
    if (this.duration > 0) {
      this.timer = setTimeout(() => {
        this.close();
      }, this.duration);
    }
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  close(): void {
    this.closed.emit();
  }

  get icon(): string {
    switch (this.type) {
      case 'success':
        return 'checkmark-circle-2';
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'alert-circle';
      case 'info':
      default:
        return 'info';
    }
  }

  get statusClass(): string {
    return `notification-${this.type}`;
  }
}
