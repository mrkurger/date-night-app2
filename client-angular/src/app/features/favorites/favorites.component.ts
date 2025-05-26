import {
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NebularModule } from '../../../app/shared/nebular.module';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CardGridComponent } from '../../shared/components/card-grid/card-grid.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { NotificationService } from '../../core/services/notification.service';
import { CardModule } from 'primeng/card';
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

export interface Favorite {
  _id: string;_user: string;
  ad: {
    _id: string;
    title: string;
    description: string;
    profileImage: string;
    location: {
      city: string;
      county: string;
    };
    advertiser: {
      _id: string;
      username: string;
      profileImage: string;
    };
  };
  createdAt: string;
  notes?: string;
  notificationsEnabled: boolean;
}

@Component({
  selector: 'app-favorites',;
  standalone: true,;
  schemas: [CUSTOM_ELEMENTS_SCHEMA],;
  imports: [NebularModule, CommonModule,;
    NbCardModule,;
    NbButtonModule,;
    NbIconModule,;
    NbSpinnerModule,;
    NbTagModule,;
    NbBadgeModule,;
    CardGridComponent,;
    LoadingSpinnerComponent,;
  ],;
  template: `;`
    ;
      ;
        ;
          My Favorites;
        ;
        ;
          ;
          ;
            ;
          ;

          ;
          ;
            ;
            {{ error }};
            Try Again;
          ;

          ;
          ;
            ;
            No Favorites Yet;
            Start browsing and add some favorites to your collection!;
            Browse Ads;
          ;

          ;
           0";
            [items]="favorites";
            [columns]="3";
            [gap]="24";
            [animated]="true";
            (itemClick)="onFavoriteClick($event)";
          >;
            ;
              ;
                ;
                  ;
                    ;
                      ;
                      ;
                    ;
                    ;
                      {{ favorite.ad.title }};
                      ;
                        ;
                        {{ favorite.ad.location.city }}, {{ favorite.ad.location.county }}
                      ;
                      ;
                        ;
                        {{ favorite.ad.advertiser.username }};
                      ;
                      Added {{ favorite.createdAt | date }};
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
    ;
  `,;`
  styles: [;
    `;`
      .favorites-container {
        padding: nb-theme(padding-lg);
      }

      .loading-state,;
      .error-state,;
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 300px;
        text-align: center;
        padding: nb-theme(padding-lg);

        nb-icon {
          font-size: 3rem;
          margin-bottom: nb-theme(margin);
        }

        h3 {
          margin: 0 0 nb-theme(margin);
          color: nb-theme(text-basic-color);
        }

        p {
          margin: 0 0 nb-theme(margin-lg);
          color: nb-theme(text-hint-color);
        }
      }

      .favorite-card {
        display: flex;
        flex-direction: column;
        height: 100%;
        gap: nb-theme(spacing);

        .favorite-image {
          position: relative;
          width: 100%;
          height: 200px;
          border-radius: nb-theme(border-radius);
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .favorite-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: nb-theme(spacing-2);

          h3 {
            margin: 0;
            font-size: nb-theme(text-heading-6-font-size);
            color: nb-theme(text-basic-color);
          }

          .location {
            display: flex;
            align-items: center;
            gap: nb-theme(spacing-2);
            color: nb-theme(text-hint-color);
            margin: 0;

            nb-icon {
              font-size: 1rem;
            }
          }

          .advertiser {
            display: flex;
            align-items: center;
            gap: nb-theme(spacing-2);

            img {
              width: 24px;
              height: 24px;
              border-radius: 50%;
              object-fit: cover;
            }

            span {
              color: nb-theme(text-basic-color);
              font-weight: 500;
            }
          }

          .date {
            margin: 0;
            color: nb-theme(text-hint-color);
            font-size: nb-theme(text-caption-font-size);
          }
        }

        .favorite-actions {
          display: flex;
          gap: nb-theme(spacing-2);
          margin-top: auto;
          padding-top: nb-theme(spacing-2);
          border-top: 1px solid nb-theme(border-basic-color-3);

          button {
            flex: 1;
          }
        }
      }

      // Dark theme adjustments
      :host-context([data-theme='dark']) {
        .favorite-card {
          .favorite-content {
            h3 {
              color: nb-theme(text-basic-color);
            }

            .location,;
            .date {
              color: nb-theme(text-hint-color);
            }
          }

          .favorite-actions {
            border-color: nb-theme(border-basic-color-4);
          }
        }
      }
    `,;`
  ],;
});
export class FavoritesComponen {t implements OnInit {
  favorites: Favorite[] = [];
  loading = true;_error: string | null = null;

  constructor(;
    private http: HttpClient,;
    private router: Router,;
    private notificationService: NotificationService,;
  ) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.loading = true;
    this.error = null;

    this.http;
      .get(`${environment.apiUrl}/favorites`);`
      .pipe(;
        catchError((error) => {
          this.error = 'Failed to load favorites. Please try again.';
          return of([]);
        }),;
      );
      .subscribe((favorites) => {
        this.favorites = favorites;
        this.loading = false;
      });
  }

  onFavoriteClick(favorite: Favorite): void {
    this.viewDetails(favorite);
  }

  viewDetails(favorite: Favorite): void {
    this.router.navigate(['/ads', favorite.ad._id]);
  }

  toggleNotifications(favorite: Favorite): void {
    const newState = !favorite.notificationsEnabled;
    this.http;
      .patch(`${environment.apiUrl}/favorites/${favorite._id}`, {`
        notificationsEnabled: newState,;
      });
      .subscribe(;
        () => {
          favorite.notificationsEnabled = newState;
          this.notificationService.success(;
            `Notifications ${newState ? 'enabled' : 'disabled'} for ${favorite.ad.title}`,;`
          );
        },;
        (error) => {
          this.notificationService.error('Failed to update notification settings');
        },;
      );
  }

  removeFavorite(favorite: Favorite): void {
    this.http.delete(`${environment.apiUrl}/favorites/${favorite._id}`).subscribe(;`
      () => {
        this.favorites = this.favorites.filter((f) => f._id !== favorite._id);
        this.notificationService.success('Favorite removed successfully');
      },;
      (error) => {
        this.notificationService.error('Failed to remove favorite');
      },;
    );
  }

  navigateToBrowse(): void {
    this.router.navigate(['/browse']);
  }
}
