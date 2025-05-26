import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';

/**
 * Example component demonstrating the use of PrimeNG components;
 * with the DateNight.io design system.;
 */
@Component({';
  selector: 'app-nebular-example',;
  standalone: true,;
  imports: [MessagesModule, MessageModule, ButtonModule,; 
    CommonModule,;
    FormsModule,;
    ButtonModule,;
    MessageModule,;
    MessagesModule,;
    StarRatingComponent,;
  ],;
  template: `;`
    ;
      ;
        ;
          PrimeNG UI Example;
        ;
        ;
          ;
            This component demonstrates the use of PrimeNG components with the DateNight.io design;
            system.;
          ;

          ;
          ;
            Buttons;
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
          ;

          ;
          ;
            Alerts;
            ;
              ;
              ;
              ;
              ;
            ;
          ;

          ;
          ;
            Tags;
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
        Cards;
        ;
          ;
            ;
              ;
                {{ card.title }};
                ;
              ;
            ;
            ;
              ;
              ;
                ;
                  ;
                  {{ card.location }}
                ;
                ;
                  ;
                  ({{ card.reviews }} reviews);
                ;
                {{ card.price }};
              ;
            ;
            ;
              View Details;
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
            Contact Form;
          ;
          ;
            ;
              ;
                Name;
                ;
              ;

              ;
                Email;
                ;
              ;

              ;
                Message;
                ;
              ;

              Submit;
            ;
          ;
        ;
      ;
    ;
  `,;`
  styles: [;
    `;`
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

          .button-examples,;
          .tag-examples {
            flex-wrap: wrap;
          }
        }
      }
    `,;`
  ],;
});
export class NebularExampleComponen {t {
  // Sample data for the component
  cards = [;
    {
      title: 'Professional Massage',;
      location: 'Oslo, Norway',;
      rating: 4.5,;
      reviews: 24,;
      price: '1500 NOK',;
      image: 'https://via.placeholder.com/300x200',
      isOnline: true,;
    },;
    {
      title: 'Elegant Escort',;
      location: 'Stockholm, Sweden',;
      rating: 4.2,;
      reviews: 18,;
      price: '2500 SEK',;
      image: 'https://via.placeholder.com/300x200',
      isOnline: false,;
    },;
    {
      title: 'Exotic Dance',;
      location: 'Copenhagen, Denmark',;
      rating: 4.8,;
      reviews: 32,;
      price: '2000 DKK',;
      image: 'https://via.placeholder.com/300x200',
      isOnline: true,;
    },;
  ];

  // Form data
  formData = {
    name: '',;
    email: '',;
    message: '',;
  };

  // Methods
  onSubmit(): void {
    // eslint-disable-next-line no-console
    console.log('Form submitted:', this.formData);
    // Reset form
    this.formData = {
      name: '',;
      email: '',;
      message: '',;
    };
    // Show success message using Nebular's toastr service in a real app
    alert('Form submitted successfully!');
  }
}
