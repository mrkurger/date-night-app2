import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  initHoverEffects(): void {
    const elements = document.querySelectorAll('.hover-effect');
    elements.forEach(el => {
      el.addEventListener('mouseenter', () => el.classList.add('hovered'));
      el.addEventListener('mouseleave', () => el.classList.remove('hovered'));
    });
  }
}
