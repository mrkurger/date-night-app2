import { NbIconModule } from '@nebular/theme';
import { NbFormFieldModule } from '@nebular/theme';
import { NbTagModule } from '@nebular/theme';
import { NbAlertModule } from '@nebular/theme';
import { NbCardModule } from '@nebular/theme';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  NbCardModule,
  NbButtonModule,
  NbIconModule,
  NbAlertModule,
  NbBadgeModule,
  NbFormFieldModule,
  NbInputModule,
  NbUserModule,
  NbTagModule,
} from '@nebular/theme';
import { StarRatingComponent } from '../star-rating/star-rating.component';

/**
 * Example component demonstrating the use of Nebular components
 * with the DateNight.io design system.
 */
@Component({
  selector: 'app-nebular-example',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbAlertModule,
    NbBadgeModule,
    NbFormFieldModule,
    NbInputModule,
    NbUserModule,
    NbTagModule,
    StarRatingComponent,
  ],
  template: `
    <div class="nebular-example">
      <nb-card>
        <nb-card-header>
          <h2>Nebular UI Example</h2>
        </nb-card-header>
        <nb-card-body>
          <p>
            This component demonstrates the use of Nebular components with the DateNight.io design
            system.
          </p>

          <!-- Buttons Example -->
          <section class="example-section">
            <h3>Buttons</h3>
            <div class="button-examples">
              <button nbButton status="primary">Primary</button>
              <button nbButton status="basic">Basic</button>
              <button nbButton status="success">Success</button>
              <button nbButton status="danger">Danger</button>
              <button nbButton status="warning">Warning</button>
              <button nbButton status="info">Info</button>
              <button nbButton status="control">Control</button>
            </div>

            <div class="button-examples mt-3">
              <button nbButton outline status="primary">Outline Primary</button>
              <button nbButton outline status="info">Outline Info</button>
            </div>

            <div class="button-examples mt-3">
              <button nbButton size="tiny" status="primary">Tiny</button>
              <button nbButton size="small" status="primary">Small</button>
              <button nbButton size="medium" status="primary">Medium</button>
              <button nbButton size="large" status="primary">Large</button>
              <button nbButton size="giant" status="primary">Giant</button>
            </div>
          </section>

          <!-- Alerts Example -->
          <section class="example-section">
            <h3>Alerts</h3>
            <div class="alert-examples">
              <nb-alert status="primary">This is a primary alert</nb-alert>
              <nb-alert status="success">
                <nb-icon icon="checkmark-circle-2-outline"></nb-icon>
                This is a success alert with an icon
              </nb-alert>
              <nb-alert status="warning">
                <nb-icon icon="alert-triangle-outline"></nb-icon>
                This is a warning alert with an icon
              </nb-alert>
              <nb-alert status="danger">
                <nb-icon icon="close-circle-outline"></nb-icon>
                This is a danger alert with an icon
              </nb-alert>
            </div>
          </section>

          <!-- Tags Example -->
          <section class="example-section">
            <h3>Tags</h3>
            <div class="tag-examples">
              <nb-tag status="primary" text="Primary"></nb-tag>
              <nb-tag status="success" text="Success"></nb-tag>
              <nb-tag status="warning" text="Warning"></nb-tag>
              <nb-tag status="danger" text="Danger"></nb-tag>
              <nb-tag status="info" text="Info"></nb-tag>
            </div>

            <div class="tag-examples mt-3">
              <nb-tag appearance="outline" status="primary" text="Outline Primary"></nb-tag>
              <nb-tag appearance="outline" status="success" text="Outline Success"></nb-tag>
            </div>
          </section>
        </nb-card-body>
      </nb-card>

      <!-- Cards Example -->
      <section class="example-section">
        <h3>Cards</h3>
        <div class="card-grid">
          <nb-card *ngFor="let card of cards" class="service-card">
            <nb-card-header>
              <div class="card-header-content">
                <h5>{{ card.title }}</h5>
                <nb-tag
                  [status]="card.isOnline ? 'success' : 'basic'"
                  [text]="card.isOnline ? 'Online' : 'Away'"
                ></nb-tag>
              </div>
            </nb-card-header>
            <nb-card-body>
              <img [src]="card.image" [alt]="card.title" class="card-image" />
              <div class="card-details">
                <p class="location">
                  <nb-icon icon="pin-outline"></nb-icon>
                  {{ card.location }}
                </p>
                <div class="rating-row">
                  <app-star-rating [rating]="card.rating" [small]="true"></app-star-rating>
                  <span class="reviews">({{ card.reviews }} reviews)</span>
                </div>
                <p class="price">{{ card.price }}</p>
              </div>
            </nb-card-body>
            <nb-card-footer>
              <button nbButton status="primary" size="small">View Details</button>
              <button nbButton ghost status="primary" size="small">
                <nb-icon icon="heart-outline"></nb-icon>
              </button>
            </nb-card-footer>
          </nb-card>
        </div>
      </section>

      <!-- Form Example -->
      <section class="example-section">
        <nb-card>
          <nb-card-header>
            <h3>Contact Form</h3>
          </nb-card-header>
          <nb-card-body>
            <form (ngSubmit)="onSubmit()">
              <nb-form-field>
                <label for="name">Name</label>
                <input
                  nbInput
                  fullWidth
                  id="name"
                  placeholder="Enter your name"
                  [(ngModel)]="formData.name"
                  name="name"
                  required
                />
              </nb-form-field>

              <nb-form-field>
                <label for="email">Email</label>
                <input
                  nbInput
                  fullWidth
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  [(ngModel)]="formData.email"
                  name="email"
                  required
                />
              </nb-form-field>

              <nb-form-field>
                <label for="message">Message</label>
                <textarea
                  nbInput
                  fullWidth
                  id="message"
                  rows="3"
                  placeholder="Enter your message"
                  [(ngModel)]="formData.message"
                  name="message"
                  required
                ></textarea>
              </nb-form-field>

              <button nbButton status="primary" type="submit">Submit</button>
            </form>
          </nb-card-body>
        </nb-card>
      </section>
    </div>
  `,
  styles: [
    `
      .nebular-example {
        padding: var(--padding-lg);

        h2 {
          margin: 0;
          color: var(--text-basic-color);
        }

        h3 {
          margin-bottom: var(--margin-md);
          color: var(--text-basic-color);
        }

        .example-section {
          margin-bottom: var(--margin-xl);
        }

        // Button examples
        .button-examples {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing);
        }

        // Alert examples
        .alert-examples {
          display: flex;
          flex-direction: column;
          gap: var(--spacing);

          nb-icon {
            margin-right: var(--spacing-xs);
          }
        }

        // Tag examples
        .tag-examples {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing);
          align-items: center;
        }

        // Card grid
        .card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--spacing-lg);
        }

        // Service card styling
        .service-card {
          transition: transform 0.2s ease;

          &:hover {
            transform: translateY(-4px);
          }

          .card-header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;

            h5 {
              margin: 0;
              color: var(--text-basic-color);
            }
          }

          .card-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
            border-radius: var(--border-radius);
            margin-bottom: var(--margin);
          }

          .card-details {
            .location {
              display: flex;
              align-items: center;
              gap: var(--spacing-xs);
              color: var(--text-hint-color);
              margin-bottom: var(--margin-sm);

              nb-icon {
                font-size: 1rem;
              }
            }

            .rating-row {
              display: flex;
              align-items: center;
              gap: var(--spacing-sm);
              margin-bottom: var(--margin-sm);

              .reviews {
                color: var(--text-hint-color);
                font-size: 0.875rem;
              }
            }

            .price {
              font-weight: bold;
              color: var(--text-basic-color);
              margin: 0;
            }
          }

          nb-card-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
        }

        // Form styling
        nb-form-field {
          margin-bottom: var(--margin);

          label {
            display: block;
            margin-bottom: var(--margin-xs);
            color: var(--text-basic-color);
          }
        }

        // Utility classes
        .mt-3 {
          margin-top: var(--margin);
        }

        // Responsive adjustments
        @media (max-width: 768px) {
          .card-grid {
            grid-template-columns: 1fr;
          }

          .button-examples,
          .tag-examples {
            flex-wrap: wrap;
          }
        }
      }
    `,
  ],
})
export class NebularExampleComponent {
  // Sample data for the component
  cards = [
    {
      title: 'Professional Massage',
      location: 'Oslo, Norway',
      rating: 4.5,
      reviews: 24,
      price: '1500 NOK',
      image: 'https://via.placeholder.com/300x200',
      isOnline: true,
    },
    {
      title: 'Elegant Escort',
      location: 'Stockholm, Sweden',
      rating: 4.2,
      reviews: 18,
      price: '2500 SEK',
      image: 'https://via.placeholder.com/300x200',
      isOnline: false,
    },
    {
      title: 'Exotic Dance',
      location: 'Copenhagen, Denmark',
      rating: 4.8,
      reviews: 32,
      price: '2000 DKK',
      image: 'https://via.placeholder.com/300x200',
      isOnline: true,
    },
  ];

  // Form data
  formData = {
    name: '',
    email: '',
    message: '',
  };

  // Methods
  onSubmit(): void {
    // eslint-disable-next-line no-console
    console.log('Form submitted:', this.formData);
    // Reset form
    this.formData = {
      name: '',
      email: '',
      message: '',
    };
    // Show success message using Nebular's toastr service in a real app
    alert('Form submitted successfully!');
  }
}
