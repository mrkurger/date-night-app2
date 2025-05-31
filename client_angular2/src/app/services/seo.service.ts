import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  constructor(private titleService: Title, private metaService: Meta) {}

  // Set page title
  setTitle(title: string): void {
    this.titleService.setTitle(title);
  }

  // Update meta tags
  updateMetaTags(metaTags: { name: string; content: string }[]): void {
    metaTags.forEach(tag => {
      this.metaService.updateTag({ name: tag.name, content: tag.content });
    });
  }

  // Add Open Graph tags
  updateOpenGraphTags(ogTags: { property: string; content: string }[]): void {
    ogTags.forEach(tag => {
      this.metaService.updateTag({ property: tag.property, content: tag.content });
    });
  }

  // Add Twitter card tags
  updateTwitterTags(twitterTags: { name: string; content: string }[]): void {
    twitterTags.forEach(tag => {
      this.metaService.updateTag({ name: tag.name, content: tag.content });
    });
  }
}
