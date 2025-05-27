import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

/**
 *
 */
@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-container">
      <div class="map-placeholder">
        <p>Map Component Placeholder</p>
        <p>Latitude: {{ latitude }}</p>
        <p>Longitude: {{ longitude }}</p>
      </div>
    </div>
  `,
  styles: [
    `
      .map-container {
        width: 100%;
        height: 400px;
        border: 1px solid #ccc;
        border-radius: 8px;
      }
      .map-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        background-color: #f5f5f5;
      }
    `,
  ],
})
export class MapComponent {
  @Input() latitude: number = 0;
  @Input() longitude: number = 0;
  @Input() zoom: number = 10;
  @Output() locationSelected = new EventEmitter<any>();

  map: any;

  /**
   *
   */
  ngOnInit(): void {
    console.log('Map component initialized');
  }

  /**
   *
   */
  refreshMap(): void {
    console.log('Map refreshed');
  }
}
