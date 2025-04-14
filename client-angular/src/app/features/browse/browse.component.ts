
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (browse.component)
// 
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { NetflixViewComponent } from '../netflix-view/netflix-view.component';
import { TinderComponent } from '../tinder/tinder.component';
import { ListViewComponent } from '../list-view/list-view.component';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    NetflixViewComponent, 
    TinderComponent, 
    ListViewComponent
  ]
})
export class BrowseComponent implements OnInit {
  activeView: 'netflix' | 'tinder' | 'list' = 'netflix';
  
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get the view from the route query params
    this.route.queryParams.subscribe(params => {
      if (params['view']) {
        const view = params['view'];
        if (['netflix', 'tinder', 'list'].includes(view)) {
          this.activeView = view as any;
        }
      }
    });
  }
  
  changeView(view: 'netflix' | 'tinder' | 'list'): void {
    this.activeView = view;
    
    // Update the URL without reloading the page
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view },
      queryParamsHandling: 'merge'
    });
  }
}