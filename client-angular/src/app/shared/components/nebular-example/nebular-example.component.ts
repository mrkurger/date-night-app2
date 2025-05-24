import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { StarRatingComponent } from '../star-rating/star-rating.component';

/**
 * Example component demonstrating the use of PrimeNG components
 * with the DateNight.io design system.
 */
@Component({
  selector: 'app-nebular-example',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    MessageModule,
    MessagesModule,
    StarRatingComponent,
  ],
  template: `
    <div class="nebular-example">
      <p-card>
        <p-card-header>
          <h2>PrimeNG UI Example</h2>
        </p-card-header>
        <p-card-body>
          <p>
            This component demonstrates the use of PrimeNG components with the DateNight.io design
            system.
          </p>

          <!-- Buttons Example -->
          <section class="example-section">
            <h3>Buttons</h3>
            <div class="button-examples">
              <button pButton label="Primary" class="p-button-primary"></button>
              <button pButton label="Basic" class="p-button-secondary"></button>
              <button pButton label="Success" class="p-button-success"></button>
              <button pButton label="Danger" class="p-button-danger"></button>
              <button pButton label="Warning" class="p-button-warning"></button>
              <button pButton label="Info" class="p-button-info"></button>
              <button pButton label="Control" class="p-button-help"></button>
            </div>

            <div class="button-examples mt-3">
              <button
                pButton
                label="Outline Primary"
                class="p-button-outlined p-button-primary"
              ></button>
              <button pButton label="Outline Info" class="p-button-outlined p-button-info"></button>
            </div>

            <div class="button-examples mt-3">
              <button pButton label="Tiny" class="p-button-sm"></button>
              <button pButton label="Small" class="p-button-sm"></button>
              <button pButton label="Medium" class="p-button-md"></button>
              <button pButton label="Large" class="p-button-lg"></button>
              <button pButton label="Giant" class="p-button-lg"></button>
            </div>
          </section>

          <!-- Alerts Example -->
          <section class="example-section">
            <h3>Alerts</h3>
            <div class="alert-examples">
              <p-message severity="info" text="This is a primary alert"></p-message>
              <p-message severity="success" text="This is a success alert with an icon"></p-message>
              <p-message severity="warn" text="This is a warning alert with an icon"></p-message>
              <p-message severity="error" text="This is a danger alert with an icon"></p-message>
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
        </p-card-body>
      </p-card>

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
