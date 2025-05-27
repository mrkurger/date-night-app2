import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

/**
 *
 */
@Component({
  selector: 'app-tinder-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tinder-card" [style]="cardStyle">
      <div class="card-content">
        <h3>{{ title }}</h3>
        <p>{{ description }}</p>
      </div>
      <div class="card-actions">
        <button (click)="onDislike()" class="dislike-btn">👎</button>
        <button (click)="onLike()" class="like-btn">👍</button>
      </div>
    </div>
  `,
  styles: [
    `
      .tinder-card {
        width: 300px;
        height: 400px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        padding: 20px;
        position: relative;
      }
      .card-content {
        height: calc(100% - 60px);
      }
      .card-actions {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 20px;
      }
      button {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        border: none;
        font-size: 20px;
        cursor: pointer;
      }
      .like-btn {
        background: #4caf50;
        color: white;
      }
      .dislike-btn {
        background: #f44336;
        color: white;
      }
    `,
  ],
})
export class TinderCardComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Output() like = new EventEmitter<void>();
  @Output() dislike = new EventEmitter<void>();

  cardStyle: any = {};

  /**
   *
   */
  onLike(): void {
    this.like.emit();
  }

  /**
   *
   */
  onDislike(): void {
    this.dislike.emit();
  }
}
