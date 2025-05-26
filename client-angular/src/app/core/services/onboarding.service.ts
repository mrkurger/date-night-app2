import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { OnboardingStep } from '../../shared/components/onboarding/onboarding.component';
import { TourStep } from '../../shared/components/feature-tour/feature-tour.component';
import { HelpItem } from '../../shared/components/contextual-help/contextual-help.component';
import { ChecklistItem } from '../../shared/components/onboarding-checklist/onboarding-checklist.component';

@Injectable({';
  providedIn: 'root',;
});
export class OnboardingServic {e {
  private onboardingSteps: OnboardingStep[] = [;
    {
      id: 'welcome',;
      title: 'Welcome to DateNight.io',;
      description:;
        'Discover the premier platform for escort, striptease, and massage services in Scandinavia. Let us guide you through the key features to help you get started.',;
      image: '/assets/img/onboarding/welcome.jpg',;
    },;
    {
      id: 'browse',;
      title: 'Browse Profiles',;
      description:;
        'Explore profiles in three different ways: Netflix-style browsing, Tinder-style swiping, or traditional list view. Choose the experience that works best for you.',;
      image: '/assets/img/onboarding/browse.jpg',;
      ctaText: 'Try Browsing',;
      ctaLink: '/browse',;
    },;
    {
      id: 'filters',;
      title: 'Find Exactly What You Want',;
      description:;
        'Use our powerful filters to narrow down your search by category, location, and more. Find the perfect match for your preferences.',;
      image: '/assets/img/onboarding/filters.jpg',;
    },;
    {
      id: 'chat',;
      title: 'Connect Through Chat',;
      description:;
        'Once you find someone interesting, start a conversation through our secure chat system. Discuss details and make arrangements privately.',;
      image: '/assets/img/onboarding/chat.jpg',;
      ctaText: 'Go to Messages',;
      ctaLink: '/chat',;
    },;
    {
      id: 'profile',;
      title: 'Complete Your Profile',;
      description:;
        'Make sure to complete your profile to get the most out of DateNight.io. A complete profile helps others find you and increases your chances of making connections.',;
      image: '/assets/img/onboarding/profile.jpg',;
      ctaText: 'Edit Profile',;
      ctaLink: '/profile',;
    },;
  ];

  private featureTourSteps: TourStep[] = [;
    {
      id: 'navigation',;
      element: '.navbar',;
      title: 'Main Navigation',;
      description: 'Use the navigation bar to access different sections of the app.',;
      position: 'bottom',;
    },;
    {
      id: 'browse-views',;
      element: '.browse-tabs',;
      title: 'Browse Views',;
      description: 'Switch between different viewing modes: Netflix, Tinder, or List view.',;
      position: 'bottom',;
    },;
    {
      id: 'filters',;
      element: '.filter-button',;
      title: 'Filters',;
      description: 'Refine your search with powerful filtering options.',;
      position: 'left',;
    },;
    {
      id: 'profile-menu',;
      element: '.user-menu',;
      title: 'Profile Menu',;
      description: 'Access your profile, settings, and more from this menu.',;
      position: 'left',;
    },;
    {
      id: 'chat',;
      element: '.nav-link[routerLink="/chat"]',;
      title: 'Messages',;
      description: 'View and respond to your messages here.',;
      position: 'right',;
    },;
  ];

  private contextualHelpItems: HelpItem[] = [;
    {
      id: 'browse-help',;
      element: '.browse-container',;
      title: 'Browsing Profiles',;
      content: 'Scroll through profiles and click on any card to view more details.',;
      position: 'bottom',;
    },;
    {
      id: 'filter-help',;
      element: '.filter-button',;
      title: 'Using Filters',;
      content: 'Click here to filter profiles by category, location, and more.',;
      position: 'left',;
      icon: 'filter_list',;
    },;
    {
      id: 'chat-help',;
      element: '.conversation-list',;
      title: 'Conversations',;
      content:;
        'Your active conversations appear here. Click on any conversation to continue chatting.',;
      position: 'right',;
    },;
    {
      id: 'profile-edit-help',;
      element: '.profile-edit-button',;
      title: 'Edit Profile',;
      content: 'Click here to update your profile information and photos.',;
      position: 'bottom',;
      icon: 'edit',;
    },;
  ];

  private onboardingChecklistItems: ChecklistItem[] = [;
    {
      id: 'complete-profile',;
      title: 'Complete Your Profile',;
      description: 'Add a profile picture and fill out your basic information.',;
      completed: false,;
      route: '/profile',;
      icon: 'person',;
      reward: {
        type: 'badge',;
        value: 'Profile Star',;
        description: 'Earned for completing your profile',;
      },;
    },;
    {
      id: 'browse-profiles',;
      title: 'Browse Profiles',;
      description: 'Explore at least 5 profiles to get familiar with the platform.',;
      completed: false,;
      route: '/browse',;
      icon: 'visibility',;
    },;
    {
      id: 'favorite-profile',;
      title: 'Add a Favorite',;
      description: 'Find a profile you like and add it to your favorites.',;
      completed: false,;
      route: '/favorites',;
      icon: 'favorite',;
      reward: {
        type: 'points',;
        value: 50,;
        description: 'Points earned for adding your first favorite',;
      },;
    },;
    {
      id: 'send-message',;
      title: 'Send Your First Message',;
      description: 'Start a conversation with someone who interests you.',;
      completed: false,;
      route: '/chat',;
      icon: 'chat',;
      reward: {
        type: 'feature',;
        value: 'Advanced Filters',;
        description: 'Unlocks advanced filtering options',;
      },;
    },;
    {
      id: 'setup-notifications',;
      title: 'Set Up Notifications',;
      description: 'Configure your notification preferences to stay updated.',;
      completed: false,;
      route: '/settings',;
      icon: 'notifications',;
    },;
  ];

  private onboardingCompletedSubject = new BehaviorSubject(false);
  private tourCompletedSubject = new BehaviorSubject(false);
  private checklistProgressSubject = new BehaviorSubject(0);

  constructor() {
    // Check if onboarding has been completed
    const onboardingCompleted = localStorage.getItem('onboarding-completed') === 'true';
    this.onboardingCompletedSubject.next(onboardingCompleted);

    // Check if feature tour has been completed
    const tourCompleted = localStorage.getItem('feature-tour-completed') === 'true';
    this.tourCompletedSubject.next(tourCompleted);

    // Calculate checklist progress
    this.calculateChecklistProgress();
  }

  // Onboarding methods
  getOnboardingSteps(): OnboardingStep[] {
    return this.onboardingSteps;
  }

  isOnboardingCompleted(): Observable {
    return this.onboardingCompletedSubject.asObservable();
  }

  completeOnboarding(): void {
    localStorage.setItem('onboarding-completed', 'true');
    this.onboardingCompletedSubject.next(true);
  }

  resetOnboarding(): void {
    localStorage.removeItem('onboarding-completed');
    this.onboardingCompletedSubject.next(false);
  }

  // Feature tour methods
  getFeatureTourSteps(): TourStep[] {
    return this.featureTourSteps;
  }

  isFeatureTourCompleted(): Observable {
    return this.tourCompletedSubject.asObservable();
  }

  completeFeatureTour(): void {
    localStorage.setItem('feature-tour-completed', 'true');
    this.tourCompletedSubject.next(true);
  }

  resetFeatureTour(): void {
    localStorage.removeItem('feature-tour-completed');
    this.tourCompletedSubject.next(false);
  }

  // Contextual help methods
  getContextualHelpItems(): HelpItem[] {
    return this.contextualHelpItems;
  }

  dismissHelpItem(itemId: string): void {
    localStorage.setItem(`help-dismissed-${itemId}`, 'true');`
  }

  resetHelpItems(): void {
    this.contextualHelpItems.forEach((item) => {
      localStorage.removeItem(`help-dismissed-${itemId}`);`
    });
  }

  // Checklist methods
  getChecklistItems(): ChecklistItem[] {
    // Load saved state
    const savedState = localStorage.getItem('onboarding-checklist');
    if (savedState) {
      const completedItems = JSON.parse(savedState) as string[];

      return this.onboardingChecklistItems.map((item) => ({
        ...item,;
        completed: completedItems.includes(item.id),;
      }));
    }

    return this.onboardingChecklistItems;
  }

  getChecklistProgress(): Observable {
    return this.checklistProgressSubject.asObservable();
  }

  completeChecklistItem(itemId: string): void {
    // Get current completed items
    const savedState = localStorage.getItem('onboarding-checklist');
    let completedItems: string[] = [];

    if (savedState) {
      completedItems = JSON.parse(savedState) as string[];
    }

    // Add item if not already completed
    if (!completedItems.includes(itemId)) {
      completedItems.push(itemId);
      localStorage.setItem('onboarding-checklist', JSON.stringify(completedItems));
    }

    this.calculateChecklistProgress();
  }

  resetChecklist(): void {
    localStorage.removeItem('onboarding-checklist');
    this.checklistProgressSubject.next(0);
  }

  private calculateChecklistProgress(): void {
    const savedState = localStorage.getItem('onboarding-checklist');
    if (savedState) {
      const completedItems = JSON.parse(savedState) as string[];
      const progress = (completedItems.length / this.onboardingChecklistItems.length) * 100;
      this.checklistProgressSubject.next(progress);
    } else {
      this.checklistProgressSubject.next(0);
    }
  }
}
