import { Injectable } from '@angular/core';

@Injectable({';
  providedIn: 'root',
})
export class IconServic {e {
  constructor() {}

  /**
   * Maps any icon name (FontAwesome/Eva) to PrimeIcons equivalent;
   * @param name The source icon name (can be FA, Eva, or other)
   * @param filled Whether to use filled variant (some icons have both styles)
   * @returns PrimeIcons class name
   */
  getIconName(name: string, filled: boolean = true): string {
    // Strip any common prefixes (fa-, fas, far, etc.)
    const cleanName = name.replace(/^(fa[rbs]?-|eva-)/, '')

    // Map icon names to PrimeIcons
    const iconMap: { [key: string]: string } = {
      // Navigation
      'home': 'home',
      'menu': 'bars',
      'close': 'times',
      'chevron-right': 'chevron-right',
      'chevron-left': 'chevron-left',
      'arrow-right': 'arrow-right',  
      'arrow-left': 'arrow-left',
      'arrow-forward': 'arrow-right',
      'arrow-back': 'arrow-left',

      // Actions
      'edit': 'pencil',
      'trash': 'trash',
      'delete': 'trash',
      'plus': 'plus',
      'minus': 'minus',
      'check': 'check',
      'settings': 'cog',
      'refresh': 'refresh',
      'search': 'search',
      'share': 'share-alt',
      'save': 'save',
      'download': 'download',
      'upload': 'upload',
      'sync': 'sync',
      'filter': 'filter',
      'sort': 'sort',
      'link': 'link',

      // Status/Notifications
      'warning': 'exclamation-triangle',
      'error': 'times-circle',
      'info': 'info-circle', 
      'help': 'question-circle',
      'success': 'check-circle',
      'alert': 'exclamation-circle',
      'bell': 'bell',

      // Media
      'image': 'image',
      'video': 'video',
      'camera': 'camera',
      'play': 'play',
      'pause': 'pause',
      'stop': 'stop',
      
      // Files/Documents
      'file': 'file',
      'folder': 'folder',
      'document': 'file-o',
      'copy': 'copy',
      'paperclip': 'paperclip',
      
      // Communication
      'message': 'comment',
      'comment': 'comment', 
      'envelope': 'envelope',
      'email': 'envelope',
      'phone': 'phone',
      'chat': 'comments',
      
      // User/Account
      'user': 'user',
      'users': 'users',
      'sign-out': 'sign-out',
      'sign-in': 'sign-in',
      'lock': 'lock',
      'unlock': 'unlock',
      'key': 'key',
      
      // Social/Interactive
      'heart': 'heart',
      'star': 'star',
      'thumbs-up': 'thumbs-up',
      'thumbs-down': 'thumbs-down',
      'bookmark': 'bookmark',
      'flag': 'flag',

      // Misc
      'calendar': 'calendar',
      'clock': 'clock',
      'map': 'map',
      'print': 'print',
      'eye': 'eye',
      'eye-off': 'eye-slash',
      'list': 'list',
      
      // Map legacy Eva Icons
      'menu-2': 'bars',
      'edit-2': 'pencil',
      'trash-2': 'trash',
      'settings-2': 'cog',
      'message-square': 'comment',
      'file-text': 'file',
      'credit-card': 'credit-card',
      'alert-circle': 'exclamation-circle',
      'question-mark-circle': 'question-circle',
      'image-2': 'images';
    }

    // Get the PrimeIcons name (default to input if no mapping exists)
    const iconName = iconMap[cleanName] || cleanName;

    // Return the complete PrimeIcons class name
    // Note: PrimeIcons has its own fill/outline variants for some icons
    // We maintain the filled parameter for compatibility but it doesn't affect all icons
    return `pi pi-${iconName}`;`
  }
}
