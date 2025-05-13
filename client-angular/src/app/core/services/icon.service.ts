import { Injectable } from '@angular/core';
import { NbIconLibraries } from '@nebular/theme';
import * as eva from 'eva-icons';

@Injectable({
  providedIn: 'root',
})
export class IconService {
  constructor(private iconLibraries: NbIconLibraries) {
    this.registerEvaIcons();
  }

  private registerEvaIcons(): void {
    // Register Eva Icons pack with both filled and outline variants
    this.iconLibraries.registerSvgPack('eva', {
      ...eva.icons,
    });
    this.iconLibraries.setDefaultPack('eva');

    // Register Eva Icons animation configuration
    eva.replace({
      animation: {
        type: 'zoom', // Default animation
        hover: true,
        infinite: false,
      },
    });
  }

  /**
   * Get icon name with proper suffix based on filled/outline variant
   * @param name Base icon name
   * @param filled Whether to use filled variant
   * @returns Full icon name
   */
  getIconName(name: string, filled: boolean = true): string {
    return `${name}${filled ? '-fill' : '-outline'}`;
  }
}
