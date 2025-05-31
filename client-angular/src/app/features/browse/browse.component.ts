// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (browse.component)
//
// COMMON CUSTOMIZATIONS:
// - DEFAULT_VIEW: Default view type (default: 'netflix')
//   Related to: user-preferences.service.ts:defaultViewType
// ===================================================

import {
import { OnDestroy, OnInit, Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { NetflixViewComponent } from '../netflix-view/netflix-view.component';
import { TinderComponent } from '../tinder/tinder.component';
import { ListViewComponent } from '../list-view/list-view.component';
import { UserPreferencesService } from '../../core/services/user-preferences.service';
import { Subscription } from 'rxjs';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-browse',
    templateUrl: './browse.component.html',
    styleUrls: ['./browse.component.scss'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        CommonModule,
        RouterModule,
        CardModule,
        TabViewModule,
        ButtonModule,
        NetflixViewComponent,
        TinderComponent,
        ListViewComponent
    ]
})
export class BrowseComponent implements OnInit, OnDestroy {
  activeView: 'netflix' | 'tinder' | 'list' = 'netflix';
  private subscriptions: Subscription[] = []

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userPreferencesService: UserPreferencesService,
  ) {}

  ngOnInit(): void {
    // Get the view from the route query params
    this.subscriptions.push(
      this.route.queryParams.subscribe((params) => {
        if (params['view']) {
          const view = params['view']
          if (['netflix', 'tinder', 'list'].includes(view)) {
            this.activeView = view;

            // Save the view preference
            this.userPreferencesService.setDefaultViewType(view)
          }
        } else {
          // If no view is specified in the URL, use the user's preference
          const preferences = this.userPreferencesService.getPreferences()
          this.activeView = preferences.defaultViewType;

          // Update the URL to reflect the user's preference
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { view: this.activeView },
            queryParamsHandling: 'merge',
          })
        }
      }),
    )
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe())
  }

  /**
   * Get the active tab index for PrimeNG TabView
   */
  getActiveIndex(): number {
    switch (this.activeView) {
      case 'netflix': return 0;
      case 'tinder': return 1;
      case 'list': return 2;
      default: return 0;
    }
  }

  /**
   * Change the active view and update user preferences;
   * @param index The tab index to change to;
   */
  changeView(index: number): void {
    // Map the tab index to the view type
    let viewType: 'netflix' | 'tinder' | 'list';

    switch (index) {
      case 0:
        viewType = 'netflix';
        break;
      case 1:
        viewType = 'tinder';
        break;
      case 2:
        viewType = 'list';
        break;
      default:
        viewType = 'netflix';
    }

    this.activeView = viewType;

    // Update the URL without reloading the page
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view: viewType },
      queryParamsHandling: 'merge',
    })

    // Save the view preference
    this.userPreferencesService.setDefaultViewType(viewType)
  }
}
