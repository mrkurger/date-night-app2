import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  image?: string;
  videoUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  ctaAction?: () => void;
}

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    RouterModule,
  ],
})
export class OnboardingComponent implements OnInit {
  @Input() steps: OnboardingStep[] = [];
  @Input() showSkip = true;
  @Input() showProgress = true;
  @Input() showDots = true;
  @Input() autoShowOnFirstVisit = false;
  @Input() storageKey = 'onboarding-completed';

  @Output() complete = new EventEmitter<void>();
  @Output() skip = new EventEmitter<void>();
  @Output() stepChange = new EventEmitter<number>();

  currentStepIndex = 0;
  isVisible = false;

  get currentStep(): OnboardingStep {
    return this.steps[this.currentStepIndex];
  }

  get progress(): number {
    return ((this.currentStepIndex + 1) / this.steps.length) * 100;
  }

  ngOnInit(): void {
    if (this.autoShowOnFirstVisit) {
      const hasCompletedOnboarding = localStorage.getItem(this.storageKey) === 'true';
      if (!hasCompletedOnboarding) {
        this.show();
      }
    }
  }

  show(): void {
    this.isVisible = true;
    this.currentStepIndex = 0;
    this.stepChange.emit(this.currentStepIndex);
  }

  hide(): void {
    this.isVisible = false;
  }

  nextStep(): void {
    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
      this.stepChange.emit(this.currentStepIndex);
    } else {
      this.completeOnboarding();
    }
  }

  previousStep(): void {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.stepChange.emit(this.currentStepIndex);
    }
  }

  goToStep(index: number): void {
    if (index >= 0 && index < this.steps.length) {
      this.currentStepIndex = index;
      this.stepChange.emit(this.currentStepIndex);
    }
  }

  completeOnboarding(): void {
    localStorage.setItem(this.storageKey, 'true');
    this.hide();
    this.complete.emit();
  }

  skipOnboarding(): void {
    localStorage.setItem(this.storageKey, 'true');
    this.hide();
    this.skip.emit();
  }

  handleCtaClick(): void {
    if (this.currentStep.ctaAction) {
      this.currentStep.ctaAction();
    }
    this.nextStep();
  }
}
