import { CommonModule } from '@angular/common';

/**
 * Example component demonstrating the use of emerald-ui components
 * with the DateNight.io design system.
 */
@Component({
  selector: 'app-emerald-example',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './emerald-example.component.html',
  styleUrls: ['./emerald-example.component.scss'],
})
export class EmeraldExampleComponent {
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
    console.log('Form submitted:', this.formData);
    // Reset form
    this.formData = {
      name: '',
      email: '',
      message: '',
    };
    // Show success message (would use a proper notification service in a real app)
    alert('Form submitted successfully!');
  }

  // Helper method to generate star rating HTML
  getStarRating(rating: number): string {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let stars = '';

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars += '<i class="fas fa-star"></i>';
    }

    // Half star
    if (hasHalfStar) {
      stars += '<i class="fas fa-star-half-alt"></i>';
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars += '<i class="far fa-star"></i>';
    }

    return stars;
  }
}
