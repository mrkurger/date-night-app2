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
   * Maps Material icon names to Eva icon equivalents and adds appropriate suffix
   * @param name Material icon name
   * @param filled Whether to use filled variant
   * @returns Eva icon name with suffix
   */
  getIconName(name: string, filled: boolean = true): string {
    // Map of Material icon names to Eva icon names
    const materialToEva: { [key: string]: string } = {
      // Navigation
      menu: 'menu-2',
      close: 'close',
      chevron_right: 'chevron-right',
      chevron_left: 'chevron-left',
      arrow_forward: 'arrow-forward',
      arrow_back: 'arrow-back',

      // Actions
      edit: 'edit-2',
      delete: 'trash-2',
      add: 'plus',
      remove: 'minus',
      check: 'checkmark',
      settings: 'settings-2',
      refresh: 'refresh',
      search: 'search',
      share: 'share',

      // Status/Notifications
      warning: 'alert-triangle',
      error: 'alert-circle',
      info: 'info',
      help: 'question-mark-circle',
      notifications: 'bell',
      notifications_off: 'bell-off',

      // Content
      favorite: 'heart',
      favorite_border: 'heart',
      chat: 'message-square',
      email: 'email',
      attach_file: 'attach',
      photo: 'image',
      location_on: 'pin',
      event: 'calendar',
      note: 'file-text',
      visibility: 'eye',
      visibility_off: 'eye-off',
      attach_money: 'credit-card',
      priority_high: 'alert-circle',
      arrow_upward: 'arrow-up',
      arrow_downward: 'arrow-down',
      photo_library: 'image-2',
    };

    // Convert Material icon name to Eva icon name
    const evaName = materialToEva[name] || name;

    // For 'favorite_border' we want to force outline variant
    if (name === 'favorite_border') {
      return `${evaName}-outline`;
    }

    // For all other icons, use the filled parameter
    return `${evaName}${filled ? '-fill' : '-outline'}`;
  }
}
