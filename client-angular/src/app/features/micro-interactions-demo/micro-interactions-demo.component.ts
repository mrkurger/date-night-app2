import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BemUtil } from '../../core/utils/bem.util';
import { ThemeService } from '../../core/services/theme.service';

/**
 * Micro-interactions Demo Component
 *
 * This component demonstrates micro-interactions used throughout the DateNight.io application.
 * It showcases hover effects, loading states, transitions, and feedback animations.
 */
@Component({
  selector: 'app-micro-interactions-demo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './micro-interactions-demo.component.html',
  styleUrls: ['./micro-interactions-demo.component.scss'],
})
export class MicroInteractionsDemoComponent {
  bem = new BemUtil('micro-demo');
  isDarkMode$;

  constructor(private themeService: ThemeService) {
    this.isDarkMode$ = this.themeService.isDarkMode$;
  }

  // Demo state
  isLoading = false;
  isSuccess = false;
  isError = false;

  // Hover effects
  hoverEffects = [
    {
      name: 'Scale',
      description: 'Slightly enlarges the element on hover',
      class: 'hover-scale',
      code: '@include mixins.hover-scale;',
    },
    {
      name: 'Lift',
      description: 'Adds a subtle lift effect with shadow',
      class: 'hover-lift',
      code: '@include mixins.hover-lift;',
    },
    {
      name: 'Color Shift',
      description: 'Smoothly transitions between colors',
      class: 'hover-color',
      code: '@include mixins.hover-color-shift(color, $color-dark-gray-2, $color-primary);',
    },
    {
      name: 'Border Highlight',
      description: 'Adds a colored border on hover',
      class: 'hover-border',
      code: '@include mixins.hover-border($color-primary);',
    },
  ];

  // Loading states
  loadingStates = [
    {
      name: 'Button Loading',
      description: 'Shows a spinner inside a button during loading',
      class: 'button-loading',
    },
    {
      name: 'Skeleton Loader',
      description: 'Placeholder for content while loading',
      class: 'skeleton-loader',
    },
    {
      name: 'Progress Bar',
      description: 'Shows progress for longer operations',
      class: 'progress-bar',
    },
    {
      name: 'Pulse Loading',
      description: 'Subtle pulsing effect for loading states',
      class: 'pulse-loading',
    },
  ];

  // Transition effects
  transitionEffects = [
    {
      name: 'Fade In',
      description: 'Smoothly fades in content',
      class: 'fade-in',
      code: '@include mixins.fade-in;',
    },
    {
      name: 'Slide In Top',
      description: 'Slides in from the top',
      class: 'slide-in-top',
      code: '@include mixins.slide-in-top;',
    },
    {
      name: 'Slide In Bottom',
      description: 'Slides in from the bottom',
      class: 'slide-in-bottom',
      code: '@include mixins.slide-in-bottom;',
    },
    {
      name: 'Scale In',
      description: 'Scales in from the center',
      class: 'scale-in',
      code: '@include mixins.scale-in;',
    },
  ];

  // Feedback animations
  feedbackAnimations = [
    {
      name: 'Success Animation',
      description: 'Indicates successful completion',
      class: 'success-animation',
    },
    {
      name: 'Error Animation',
      description: 'Indicates an error or failure',
      class: 'error-animation',
    },
    {
      name: 'Click Ripple',
      description: 'Ripple effect on click',
      class: 'click-ripple',
      code: '@include mixins.click-ripple;',
    },
    {
      name: 'Shake Animation',
      description: 'Shakes to indicate invalid input',
      class: 'shake-animation',
    },
  ];

  constructor(private themeService: ThemeService) {}

  /**
   * Toggles the theme between light and dark mode
   */
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  /**
   * Simulates a loading state followed by success
   */
  simulateLoading(): void {
    this.isLoading = true;
    this.isSuccess = false;
    this.isError = false;

    setTimeout(() => {
      this.isLoading = false;
      this.isSuccess = true;

      setTimeout(() => {
        this.isSuccess = false;
      }, 2000);
    }, 2000);
  }

  /**
   * Simulates a loading state followed by error
   */
  simulateError(): void {
    this.isLoading = true;
    this.isSuccess = false;
    this.isError = false;

    setTimeout(() => {
      this.isLoading = false;
      this.isError = true;

      setTimeout(() => {
        this.isError = false;
      }, 2000);
    }, 2000);
  }

  /**
   * Simulates a shake animation for invalid input
   * @param element The element to shake
   */
  simulateShake(element: HTMLElement): void {
    element.classList.add('shake-active');

    setTimeout(() => {
      element.classList.remove('shake-active');
    }, 500);
  }
}
