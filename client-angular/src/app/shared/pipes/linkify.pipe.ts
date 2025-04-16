import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'linkify',
  standalone: true,
})
export class LinkifyPipe implements PipeTransform {
  // URL pattern for detecting links in text
  private urlRegex = /(https?:\/\/[^\s]+)/g;

  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Transform text by converting URLs to clickable links
   * @param text The text to transform
   * @returns HTML with clickable links
   */
  transform(text: string): SafeHtml {
    if (!text) {
      return '';
    }

    // Replace URLs with anchor tags
    const replacedText = text.replace(this.urlRegex, url => {
      // Create a safe URL
      let displayUrl = url;
      if (url.length > 30) {
        displayUrl = url.substring(0, 27) + '...';
      }

      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${displayUrl}</a>`;
    });

    // Sanitize the HTML to prevent XSS attacks
    return this.sanitizer.bypassSecurityTrustHtml(replacedText);
  }
}
