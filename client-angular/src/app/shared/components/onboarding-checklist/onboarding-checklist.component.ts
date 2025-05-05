// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (onboarding-checklist.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  route?: string; // Optional route to navigate to
  action?: () => void; // Optional action to perform
  icon?: string; // Optional icon
  reward?: {
    type: 'badge' | 'points' | 'feature';
    value: string | number;
    description: string;
  };
}

@Component({
  selector: 'app-onboarding-checklist',
  templateUrl: './onboarding-checklist.component.html',
  styleUrls: ['./onboarding-checklist.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatCheckboxModule,
    RouterModule,
  ],
})
export class OnboardingChecklistComponent implements OnInit {
  @Input() items: ChecklistItem[] = [];
  @Input() title = 'Getting Started';
  @Input() subtitle = 'Complete these tasks to set up your account';
  @Input() storageKey = 'onboarding-checklist';
  @Input() showProgress = true;
  @Input() collapsible = true;
  @Input() initiallyCollapsed = false;
  @Input() showRewards = true;

  @Output() itemCompleted = new EventEmitter<ChecklistItem>();
  @Output() allCompleted = new EventEmitter<void>();

  isCollapsed = false;

  get completedCount(): number {
    return this.items.filter((item) => item.completed).length;
  }

  get progress(): number {
    return this.items.length > 0 ? (this.completedCount / this.items.length) * 100 : 0;
  }

  get isAllCompleted(): boolean {
    return this.completedCount === this.items.length && this.items.length > 0;
  }

  ngOnInit(): void {
    this.isCollapsed = this.initiallyCollapsed;
    this.loadSavedState();
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  markItemCompleted(item: ChecklistItem): void {
    item.completed = true;
    this.saveState();
    this.itemCompleted.emit(item);

    if (this.isAllCompleted) {
      this.allCompleted.emit();
    }
  }

  handleItemClick(item: ChecklistItem): void {
    if (item.action) {
      item.action();
    }

    if (!item.completed) {
      this.markItemCompleted(item);
    }
  }

  resetChecklist(): void {
    this.items.forEach((item) => {
      item.completed = false;
    });
    this.saveState();
  }

  private loadSavedState(): void {
    const savedState = localStorage.getItem(this.storageKey);
    if (savedState) {
      const completedItems = JSON.parse(savedState) as string[];

      this.items.forEach((item) => {
        item.completed = completedItems.includes(item.id);
      });
    }
  }

  private saveState(): void {
    const completedItems = this.items.filter((item) => item.completed).map((item) => item.id);

    localStorage.setItem(this.storageKey, JSON.stringify(completedItems));
  }
}
