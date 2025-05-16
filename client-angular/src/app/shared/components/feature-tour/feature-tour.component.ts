
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
} from '@angular/core';
import { NebularModule } from '../../nebular.module';

import { CommonModule } from '@angular/common';

/**
 * Feature Tour Component
 *
 * A customizable component for displaying feature tours and walkthroughs.
 * Configure settings below to customize the behavior.
 * @see other_file.ts:OTHER_SETTING for related functionality
 */

// Style interfaces
interface TooltipStyles {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  transform?: string;
}

interface SpotlightStyles {
  top: string;
  left: string;
  width: string;
  height: string;
  transform?: string;
}

export interface TourStep {
  id: string;
  element: string; // CSS selector for the element to highlight
  title: string;
  description: string;
  position: 'top' | 'right' | 'bottom' | 'left' | 'center';
  spotlightRadius?: number; // Optional custom spotlight radius
  action?: () => void; // Optional action to perform when clicking "Next"
}

@Component({
  selector: 'app-feature-tour',
  templateUrl: './feature-tour.component.html',
  styleUrls: ['./feature-tour.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NbButtonModule,
    NbIconModule
  ],
})
export class FeatureTourComponent implements OnInit, OnDestroy {
  @Input() steps: TourStep[] = [];
  @Input() showSkip = true;
  @Input() storageKey = 'feature-tour-completed';

  @Output() complete = new EventEmitter<void>();
  @Output() skip = new EventEmitter<void>();
  @Output() stepChange = new EventEmitter<number>();

  currentStepIndex = 0;
  isVisible = false;

  private targetElement: HTMLElement | null = null;
  private targetRect: DOMRect | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private scrollListener: (() => void) | null = null;

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
  ) {}

  get currentStep(): TourStep {
    return this.steps[this.currentStepIndex];
  }

  get progress(): number {
    return ((this.currentStepIndex + 1) / this.steps.length) * 100;
  }

  ngOnInit(): void {
    // Initialize resize observer to update spotlight position when window resizes
    this.resizeObserver = new ResizeObserver(() => {
      if (this.isVisible) {
        this.updateTargetPosition();
      }
    });
    this.resizeObserver.observe(document.body);

    // Add scroll listener to update spotlight position when page scrolls
    this.scrollListener = () => {
      if (this.isVisible) {
        this.updateTargetPosition();
      }
    };
    window.addEventListener('scroll', this.scrollListener, true);
  }

  ngOnDestroy(): void {
    // Clean up observers and listeners
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener, true);
    }
  }

  show(): void {
    this.isVisible = true;
    this.currentStepIndex = 0;
    this.goToStep(0);
  }

  hide(): void {
    this.isVisible = false;
    this.targetElement = null;
  }

  nextStep(): void {
    if (this.currentStep.action) {
      this.currentStep.action();
    }

    if (this.currentStepIndex < this.steps.length - 1) {
      this.goToStep(this.currentStepIndex + 1);
    } else {
      this.completeTour();
    }
  }

  previousStep(): void {
    if (this.currentStepIndex > 0) {
      this.goToStep(this.currentStepIndex - 1);
    }
  }

  goToStep(index: number): void {
    if (index >= 0 && index < this.steps.length) {
      this.currentStepIndex = index;
      this.stepChange.emit(this.currentStepIndex);
      this.updateTargetElement();
    }
  }

  completeTour(): void {
    localStorage.setItem(this.storageKey, 'true');
    this.hide();
    this.complete.emit();
  }

  skipTour(): void {
    localStorage.setItem(this.storageKey, 'true');
    this.hide();
    this.skip.emit();
  }

  private updateTargetElement(): void {
    // Find the target element for the current step
    const selector = this.currentStep.element;
    this.targetElement = document.querySelector(selector);

    if (this.targetElement) {
      // Scroll element into view if needed
      this.targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      // Update position after a short delay to ensure scrolling is complete
      setTimeout(() => {
        this.updateTargetPosition();
      }, 300);
    } else {
      console.warn(`Element not found for selector: ${selector}`);
      // If element not found, position tooltip in the center
      this.targetRect = null;
    }
  }

  private updateTargetPosition(): void {
    if (this.targetElement) {
      this.targetRect = this.targetElement.getBoundingClientRect();
    }
  }

  // Calculate tooltip position based on target element and specified position
  getTooltipStyle(): TooltipStyles {
    if (!this.targetRect && this.currentStep.position !== 'center') {
      // Default to center position if no target element
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    if (this.currentStep.position === 'center') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const rect = this.targetRect!;
    const margin = 20; // Margin between target and tooltip

    switch (this.currentStep.position) {
      case 'top':
        return {
          bottom: `${window.innerHeight - rect.top + margin}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translateX(-50%)',
        };
      case 'right':
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.right + margin}px`,
          transform: 'translateY(-50%)',
        };
      case 'bottom':
        return {
          top: `${rect.bottom + margin}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translateX(-50%)',
        };
      case 'left':
        return {
          top: `${rect.top + rect.height / 2}px`,
          right: `${window.innerWidth - rect.left + margin}px`,
          transform: 'translateY(-50%)',
        };
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  }

  // Calculate spotlight position and size
  getSpotlightStyle(): SpotlightStyles {
    if (!this.targetRect) {
      return {
        top: '50%',
        left: '50%',
        width: '100px',
        height: '100px',
        transform: 'translate(-50%, -50%)',
      };
    }

    const rect = this.targetRect;
    const radius = this.currentStep.spotlightRadius || 0;

    return {
      top: `${rect.top - radius}px`,
      left: `${rect.left - radius}px`,
      width: `${rect.width + radius * 2}px`,
      height: `${rect.height + radius * 2}px`,
    };
  }
}
