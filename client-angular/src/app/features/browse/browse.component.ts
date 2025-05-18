import { OnDestroy, OnInit, Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (browse.component)
//
// COMMON CUSTOMIZATIONS:
// - DEFAULT_VIEW: Default view type (default: 'netflix')
//   Related to: user-preferences.service.ts:defaultViewType
// ===================================================
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { NetflixViewComponent } from '../netflix-view/netflix-view.component';
import { TinderComponent } from '../tinder/tinder.component';
import { ListViewComponent } from '../list-view/list-view.component';
import { UserPreferencesService } from '../../core/services/user-preferences.service';
import { Subscription } from 'rxjs';
import { NebularModule } from '../../../app/shared/nebular.module';
import {
  NbCardModule,
  NbTabsetModule,
  NbIconModule,
  NbButtonModule,
  NbLayoutModule,
} from '@nebular/theme';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [NebularModule, CommonModule,
    RouterModule,
    NbCardModule,
    NbTabsetModule,
    NbIconModule,
    NbButtonModule,
    NbLayoutModule,
    NetflixViewComponent,
    TinderComponent,
    ListViewComponent,
  ],
})
export class BrowseComponent implements OnInit, OnDestroy {
  activeView: 'netflix' | 'tinder' | 'list' = 'netflix';
  private subscriptions: Subscription[] = [];

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
          const view = params['view'];
          if (['netflix', 'tinder', 'list'].includes(view)) {
            this.activeView = view;

            // Save the view preference
            this.userPreferencesService.setDefaultViewType(view);
          }
        } else {
          // If no view is specified in the URL, use the user's preference
          const preferences = this.userPreferencesService.getPreferences();
          this.activeView = preferences.defaultViewType;

          // Update the URL to reflect the user's preference
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { view: this.activeView },
            queryParamsHandling: 'merge',
          });
        }
      }),
    );
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  /**
   * Change the active view and update user preferences
   * @param view The view to change to
   */
  changeView(view: string): void {
    // Map the tab title to the view type
    let viewType: 'netflix' | 'tinder' | 'list';

    switch (view.toLowerCase()) {
      case 'discover':
        viewType = 'netflix';
        break;
      case 'swipe':
        viewType = 'tinder';
        break;
      case 'list':
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
    });

    // Save the view preference
    this.userPreferencesService.setDefaultViewType(viewType);
  }
}
