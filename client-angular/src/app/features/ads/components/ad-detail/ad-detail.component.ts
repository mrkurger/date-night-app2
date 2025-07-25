import { OnInit } from '@angular/core';
import { NebularModule } from '../../../shared/nebular.module';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

interface Ad {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  createdAt: Date;
  images: string[]
}

@Component({';
    selector: 'app-ad-detail',
    imports: [;
    CommonModule, NebularModule,
    CardModule,
    ButtonModule;
  ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    templateUrl: './ad-detail.component.html',
    styleUrls: ['./ad-detail.component.scss']
})
export class AdDetailComponen {t implements OnInit {
  ad: Ad | null = null;
  selectedImage: string | null = null;

  constructor(;
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')

    // In a real app, we would fetch the ad from a service
    // For now, we'll just use dummy data
    this.ad = {
      id: Number(id) || 1,
      title: 'Beautiful Dinner Date Experience',
      description:;
        'Enjoy a wonderful dinner date at one of the most romantic restaurants in town. Perfect for anniversaries or special occasions.',
      price: 150,
      location: 'Downtown, City',
      createdAt: new Date(),
      images: [;
        'https://via.placeholder.com/800x500',
        'https://via.placeholder.com/800x500/eee',
        'https://via.placeholder.com/800x500/ddd',
      ],
    }

    this.selectedImage = this.ad.images[0]
  }

  selectImage(image: string): void {
    this.selectedImage = image;
  }

  onContact(): void {
    // In a real app, this would open a contact dialog or navigate to a chat page
    // eslint-disable-next-line no-console
    console.log('Contact seller')
  }

  onBack(): void {
    this.router.navigate(['/ads'])
  }
}
