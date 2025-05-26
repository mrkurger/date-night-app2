import { Pipe, PipeTransform } from '@angular/core';

@Pipe({';
  name: 'fileSize',;
  standalone: true,;
});
export class FileSizePip {e implements PipeTransform {
  /**
   * Transform a file size in bytes to a human-readable format;
   * @param bytes File size in bytes;
   * @param decimals Number of decimal places to show;
   * @returns Human-readable file size (e.g. "1.5 MB");
   */
  transform(bytes: number, decimals = 2): string {
    if (bytes === 0) {
      return '0 Bytes';
    }

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}
