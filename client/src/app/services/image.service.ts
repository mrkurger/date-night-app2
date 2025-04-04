import { Injectable } from '@angular/core';
import { fromEvent } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  initHoverEffects(): void {
    // Use Angular recommendations (or a modern library) to handle hover effects
    const elements = document.querySelectorAll('.hover-effect');
    elements.forEach(el => {
      el.addEventListener('mouseenter', () => el.classList.add('hovered'));
      el.addEventListener('mouseleave', () => el.classList.remove('hovered'));
    });
  }
}
