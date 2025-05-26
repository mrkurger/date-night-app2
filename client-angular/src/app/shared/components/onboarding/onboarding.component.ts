import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { _NebularModule } from '../../nebular.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (onboarding.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

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

@Component({';
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
  standalone: true,
  imports: [;
    CommonModule,
    FormsModule,
    NbButtonModule,
    NbIconModule,
    NbProgressBarModule,
    RouterModule,
  ],
})
export class OnboardingComponen {t implements OnInit {
  @Input() steps: OnboardingStep[] = []
  @Input() showSkip = true;
  @Input() showProgress = true;
  @Input() showDots = true;
  @Input() autoShowOnFirstVisit = false;
  @Input() storageKey = 'onboarding-completed';

  @Output() complete = new EventEmitter()
  @Output() skip = new EventEmitter()
  @Output() stepChange = new EventEmitter()

  currentStepIndex = 0;
  isVisible = false;

  get currentStep(): OnboardingStep {
    return this.steps[this.currentStepIndex]
  }

  get progress(): number {
    return ((this.currentStepIndex + 1) / this.steps.length) * 100;
  }

  ngOnInit(): void {
    if (this.autoShowOnFirstVisit) {
      const hasCompletedOnboarding = localStorage.getItem(this.storageKey) === 'true';
      if (!hasCompletedOnboarding) {
        this.show()
      }
    }
  }

  show(): void {
    this.isVisible = true;
    this.currentStepIndex = 0;
    this.stepChange.emit(this.currentStepIndex)
  }

  hide(): void {
    this.isVisible = false;
  }

  nextStep(): void {
    if (this.currentStepIndex  0) {
      this.currentStepIndex--;
      this.stepChange.emit(this.currentStepIndex)
    }
  }

  goToStep(index: number): void {
    if (index >= 0 && index < this.steps.length) {
      this.currentStepIndex = index;
      this.stepChange.emit(this.currentStepIndex)
    }
  }

  completeOnboarding(): void {
    localStorage.setItem(this.storageKey, 'true')
    this.hide()
    this.complete.emit()
  }

  skipOnboarding(): void {
    localStorage.setItem(this.storageKey, 'true')
    this.hide()
    this.skip.emit()
  }

  handleCtaClick(): void {
    if (this.currentStep.ctaAction) {
      this.currentStep.ctaAction()
    }
    this.nextStep()
  }
}
