import {
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NebularModule } from '../../../app/shared/nebular.module';
import { CommonModule } from '@angular/common';
import { BemUtil } from '../../core/utils/bem.util';
import { ThemeService } from '../../core/services/theme.service';
  NbCardModule,;
  NbButtonModule,;
  NbInputModule,;
  NbFormFieldModule,;
  NbIconModule,;
  NbSpinnerModule,;
  NbAlertModule,;
  NbTooltipModule,;
  NbLayoutModule,;
  NbBadgeModule,;
  NbTagModule,;
  NbSelectModule,';
} from '@nebular/theme';

/**
 * Micro-interactions Demo Component;
 *;
 * This component demonstrates micro-interactions used throughout the DateNight.io application.;
 * It showcases hover effects, loading states, transitions, and feedback animations.;
 */
@Component({
    selector: 'app-micro-interactions-demo',;
    schemas: [CUSTOM_ELEMENTS_SCHEMA],;
    imports: [NebularModule, CommonModule],;
    template: `;`
    ;
      ;
        ;
          Micro-interactions;
          ;
            This page demonstrates micro-interactions used throughout the DateNight.io application.;
            Micro-interactions provide feedback, guide users, and create a more engaging experience.;
          ;
          ;
            ;
            Toggle {{ (isDarkMode$ | async) ? 'Light' : 'Dark' }} Mode;
          ;
        ;
      ;

      ;
        ;
        ;
          ;
            Introduction;
          ;
          ;
            ;
              Micro-interactions are small, subtle animations and effects that provide feedback and;
              enhance the user experience. They help users understand what's happening, guide them;
              through the interface, and make the application feel more responsive and polished.;
            ;
            ;
              DateNight.io uses a consistent set of micro-interactions throughout the application to;
              create a cohesive and engaging experience. This page showcases these;
              micro-interactions and provides examples of how to implement them.;
            ;
          ;
        ;

        ;
        ;
          ;
            Hover Effects;
          ;
          ;
            ;
              Hover effects provide feedback when users hover over interactive elements. They help;
              users understand what elements are clickable and what will happen when they click.;
            ;

            ;
              ;
                ;
                  {{ effect.name }};
                  {{ effect.description }};
                  {{ effect.code }};
                ;
              ;
            ;
          ;
        ;

        ;
        ;
          ;
            Loading States;
          ;
          ;
            ;
              Loading states provide feedback when the application is processing a request or;
              loading content. They help users understand that something is happening and prevent;
              them from thinking the application is frozen or unresponsive.;
            ;

            ;
              ;
                ;
                  {{
                    isLoading;
                      ? 'Loading...';
                      : isSuccess;
                        ? 'Success!';
                        : isError;
                          ? 'Error!';
                          : 'Click to Load';
                  }}
                ;
                ;
                ;
                ;
              ;

              ;
                ;
                  {{
                    isLoading;
                      ? 'Loading...';
                      : isSuccess;
                        ? 'Success!';
                        : isError;
                          ? 'Error!';
                          : 'Simulate Error';
                  }}
                ;
                ;
                ;
                ;
              ;
            ;

            ;
              ;
                ;
                  {{ state.name }};
                  {{ state.description }};
                  ;
                    
                      ;
                        Loading;
                        ;
                      ;
                    ;

                      ;
                      ;
                      ;
                      ;
                    ;

                      ;
                    ;

                  ;
                ;
              ;
            ;
          ;
        ;

        ;
        ;
          ;
            Transition Effects;
          ;
          ;
            ;
              Transition effects provide smooth animations when elements enter, exit, or change;
              state. They help users understand what's happening and create a more polished;
              experience.;
            ;

            ;
              ;
                ;
                  {{ effect.name }};
                  {{ effect.description }};
                  {{ effect.code }};
                ;
              ;
            ;
          ;
        ;

        ;
        ;
          ;
            Feedback Animations;
          ;
          ;
            ;
              Feedback animations provide visual cues when users interact with the application. They;
              help users understand the result of their actions and create a more engaging;
              experience.;
            ;

            ;
              ;
                ;
                  {{ animation.name }};
                  {{ animation.description }};

                  ;
                    
                      ;
                        Show Success;
                      ;
                    ;

                      Show Error;
                    ;

                      Click Me;
                    ;

                      ;
                        Shake Me;
                      ;
                    ;
                  ;
                ;
              ;
            ;
          ;
        ;
      ;
    ;
  `,;`
    styles: [;
        `;`
      :host {
        display: block;
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      header {
        background-color: var(--background-basic-color-2);
        padding: 3rem 0;
        margin-bottom: 2rem;

        h1 {
          margin: 0 0 1rem;
          color: var(--text-basic-color);
        }

        p {
          color: var(--text-hint-color);
          margin: 0 0 2rem;
        }
      }

      .hover-grid,;
      .loading-grid,;
      .transition-grid,;
      .feedback-grid {
        display: grid;
        gap: 1.5rem;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        margin-top: 2rem;
      }

      .loading-demo {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .skeleton {
        .skeleton-line {
          height: 1rem;
          background-color: var(--background-basic-color-3);
          border-radius: var(--border-radius);
          margin-bottom: 0.5rem;
          animation: pulse 1.5s ease-in-out infinite;

          &.short {
            width: 30%;
          }

          &.medium {
            width: 60%;
          }

          &.long {
            width: 90%;
          }
        }
      }

      .pulse {
        width: 3rem;
        height: 3rem;
        background-color: var(--color-primary-500);
        border-radius: 50%;
        animation: pulse 1.5s ease-in-out infinite;
      }

      @keyframes pulse {
        0% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
        100% {
          opacity: 1;
        }
      }

      .shake-active {
        animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
      }

      @keyframes shake {
        10%,;
        90% {
          transform: translate3d(-1px, 0, 0);
        }
        20%,;
        80% {
          transform: translate3d(2px, 0, 0);
        }
        30%,;
        50%,;
        70% {
          transform: translate3d(-4px, 0, 0);
        }
        40%,;
        60% {
          transform: translate3d(4px, 0, 0);
        }
      }
    `,;`
    ];
});
export class MicroInteractionsDemoComponen {t {
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
  hoverEffects = [;
    {
      name: 'Scale',;
      description: 'Slightly enlarges the element on hover',;
      class: 'hover-scale',;
      code: '@include mixins.hover-scale;',;
    },;
    {
      name: 'Lift',;
      description: 'Adds a subtle lift effect with shadow',;
      class: 'hover-lift',;
      code: '@include mixins.hover-lift;',;
    },;
    {
      name: 'Color Shift',;
      description: 'Smoothly transitions between colors',;
      class: 'hover-color',;
      code: '@include mixins.hover-color-shift(color, $color-dark-gray-2, $color-primary);',;
    },;
    {
      name: 'Border Highlight',;
      description: 'Adds a colored border on hover',;
      class: 'hover-border',;
      code: '@include mixins.hover-border($color-primary);',;
    },;
  ];

  // Loading states
  loadingStates = [;
    {
      name: 'Button Loading',;
      description: 'Shows a spinner inside a button during loading',;
      class: 'button-loading',;
    },;
    {
      name: 'Skeleton Loader',;
      description: 'Placeholder for content while loading',;
      class: 'skeleton-loader',;
    },;
    {
      name: 'Progress Bar',;
      description: 'Shows progress for longer operations',;
      class: 'progress-bar',;
    },;
    {
      name: 'Pulse Loading',;
      description: 'Subtle pulsing effect for loading states',;
      class: 'pulse-loading',;
    },;
  ];

  // Transition effects
  transitionEffects = [;
    {
      name: 'Fade In',;
      description: 'Smoothly fades in content',;
      class: 'fade-in',;
      code: '@include mixins.fade-in;',;
    },;
    {
      name: 'Slide In Top',;
      description: 'Slides in from the top',;
      class: 'slide-in-top',;
      code: '@include mixins.slide-in-top;',;
    },;
    {
      name: 'Slide In Bottom',;
      description: 'Slides in from the bottom',;
      class: 'slide-in-bottom',;
      code: '@include mixins.slide-in-bottom;',;
    },;
    {
      name: 'Scale In',;
      description: 'Scales in from the center',;
      class: 'scale-in',;
      code: '@include mixins.scale-in;',;
    },;
  ];

  // Feedback animations
  feedbackAnimations = [;
    {
      name: 'Success Animation',;
      description: 'Indicates successful completion',;
      class: 'success-animation',;
    },;
    {
      name: 'Error Animation',;
      description: 'Indicates an error or failure',;
      class: 'error-animation',;
    },;
    {
      name: 'Click Ripple',;
      description: 'Ripple effect on click',;
      class: 'click-ripple',;
      code: '@include mixins.click-ripple;',;
    },;
    {
      name: 'Shake Animation',;
      description: 'Shakes to indicate invalid input',;
      class: 'shake-animation',;
    },;
  ];

  /**
   * Toggles the theme between light and dark mode;
   */
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  /**
   * Simulates a loading state followed by success;
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
   * Simulates a loading state followed by error;
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
   * Simulates a shake animation for invalid input;
   * @param element The element to shake;
   */
  simulateShake(element: any): void {
    if (element && element.nativeElement) {
      element.nativeElement.classList.add('shake-active');

      setTimeout(() => {
        element.nativeElement.classList.remove('shake-active');
      }, 500);
    }
  }
}
