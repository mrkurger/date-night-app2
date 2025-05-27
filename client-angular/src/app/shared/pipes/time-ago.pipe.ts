import { Pipe, PipeTransform } from '@angular/core';

/**
 *
 */
@Pipe({
  name: 'timeAgo',
  standalone: true,
})
export class TimeAgoPipe implements PipeTransform {
  /**
   *
   */
  transform(value: string | Date): string {
    if (!value) return '';

    const date = value instanceof Date ? value : new Date(value);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Check for invalid date
    if (isNaN(date.getTime())) {
      return '';
    }

    // Less than a minute
    if (seconds < 60) {
      return 'just now';
    }

    // Less than an hour
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }

    // Less than a day
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }

    // Less than a week
    const days = Math.floor(hours / 24);
    if (days < 7) {
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }

    // Less than a month
    const weeks = Math.floor(days / 7);
    if (weeks < 4) {
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }

    // Less than a year
    const months = Math.floor(days / 30);
    if (months < 12) {
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }

    // More than a year
    const years = Math.floor(days / 365);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  }
}
