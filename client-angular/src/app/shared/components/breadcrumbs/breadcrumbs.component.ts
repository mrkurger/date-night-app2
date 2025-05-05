// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (breadcrumbs.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, ActivatedRoute, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { filter } from 'rxjs/operators';

export interface Breadcrumb {
  label: string;
  url: string;
  icon?: string;
}

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
})
export class BreadcrumbsComponent implements OnInit {
  @Input() homeLabel = 'Home';
  @Input() homeIcon = 'home';
  @Input() homeUrl = '/';
  @Input() separator = 'chevron_right';
  @Input() maxItems = 4; // Maximum number of items to show before truncating

  breadcrumbs: Breadcrumb[] = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    // Add home breadcrumb
    this.breadcrumbs = [
      {
        label: this.homeLabel,
        url: this.homeUrl,
        icon: this.homeIcon,
      },
    ];

    // Subscribe to route changes to update breadcrumbs
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.breadcrumbs = this.createBreadcrumbs(this.activatedRoute.root);
      });
  }

  private createBreadcrumbs(
    route: ActivatedRoute,
    url = '',
    breadcrumbs: Breadcrumb[] = [],
  ): Breadcrumb[] {
    // Start with home breadcrumb
    if (breadcrumbs.length === 0) {
      breadcrumbs = [
        {
          label: this.homeLabel,
          url: this.homeUrl,
          icon: this.homeIcon,
        },
      ];
    }

    // Get the route data
    const routeData = route.snapshot.data;
    const routeUrl = route.snapshot.url.map((segment) => segment.path).join('/');

    // Add URL segment
    if (routeUrl) {
      url += `/${routeUrl}`;
    }

    // Add breadcrumb if this route has a breadcrumb label
    if (routeData['breadcrumb']) {
      breadcrumbs.push({
        label: routeData['breadcrumb'],
        url: url,
        icon: routeData['breadcrumbIcon'],
      });
    }

    // Continue with child routes
    if (route.firstChild) {
      return this.createBreadcrumbs(route.firstChild, url, breadcrumbs);
    }

    return breadcrumbs;
  }

  // Truncate breadcrumbs if there are too many
  get visibleBreadcrumbs(): Breadcrumb[] {
    if (this.breadcrumbs.length <= this.maxItems) {
      return this.breadcrumbs;
    }

    // Show first, ellipsis, and last few items
    const firstItem = this.breadcrumbs[0];
    const lastItems = this.breadcrumbs.slice(-1 * (this.maxItems - 2));

    return [
      firstItem,
      { label: '...', url: '' }, // Ellipsis item
      ...lastItems,
    ];
  }
}
