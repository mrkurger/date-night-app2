import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NbDialogRef,
  NbCardModule,
  NbButtonModule,
  NbIconModule,
  NbListModule,
} from '@nebular/theme';

interface ShortcutGroup {
  name: string;
  icon: string;
  shortcuts: {
    keys: string[];
    description: string;
  }[];
}

@Component({
    selector: 'app-keyboard-shortcuts-help',
    imports: [CommonModule, NbCardModule, NbButtonModule, NbIconModule, NbListModule],
    template: `
    <nb-card>
      <nb-card-header class="header">
        <div class="title">
          <nb-icon icon="keyboard-outline"></nb-icon>
          <h4>Keyboard Shortcuts</h4>
        </div>
        <button nbButton ghost size="small" (click)="close()">
          <nb-icon icon="close-outline"></nb-icon>
        </button>
      </nb-card-header>

      <nb-card-body>
        <div class="shortcut-groups">
          <div *ngFor="let group of shortcutGroups" class="shortcut-group">
            <div class="group-header">
              <nb-icon [icon]="group.icon"></nb-icon>
              <h5>{{ group.name }}</h5>
            </div>

            <div class="shortcuts">
              <div *ngFor="let shortcut of group.shortcuts" class="shortcut">
                <div class="keys">
                  <kbd *ngFor="let key of shortcut.keys">{{ key }}</kbd>
                </div>
                <div class="description">{{ shortcut.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </nb-card-body>

      <nb-card-footer>
        <p class="tip">
          <nb-icon icon="info-outline"></nb-icon>
          Press <kbd>?</kbd> anywhere to show this dialog
        </p>
      </nb-card-footer>
    </nb-card>
  `,
    styles: [
        `
      :host {
        display: block;
      }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
        border-bottom: 1px solid nb-theme(divider-color);

        .title {
          display: flex;
          align-items: center;
          gap: 0.5rem;

          h4 {
            margin: 0;
            font-size: 1.25rem;
            font-weight: nb-theme(text-heading-4-font-weight);
          }

          nb-icon {
            font-size: 1.5rem;
            color: nb-theme(text-hint-color);
          }
        }
      }

      .shortcut-groups {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        padding: 1rem;
      }

      .shortcut-group {
        .group-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;

          h5 {
            margin: 0;
            font-size: 1rem;
            font-weight: nb-theme(text-heading-5-font-weight);
            color: nb-theme(text-basic-color);
          }

          nb-icon {
            color: nb-theme(text-hint-color);
          }
        }

        .shortcuts {
          display: grid;
          gap: 0.75rem;
        }
      }

      .shortcut {
        display: flex;
        align-items: center;
        gap: 1rem;

        .keys {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          min-width: 120px;
        }

        .description {
          color: nb-theme(text-hint-color);
          font-size: 0.875rem;
        }
      }

      kbd {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 1.5rem;
        height: 1.5rem;
        padding: 0 0.375rem;
        font-family: monospace;
        font-size: 0.75rem;
        font-weight: 600;
        color: nb-theme(text-basic-color);
        background: nb-theme(background-basic-color-2);
        border: 1px solid nb-theme(border-basic-color-3);
        border-radius: 4px;
        box-shadow:
          0 1px 1px rgba(0, 0, 0, 0.1),
          inset 0 -1px 0 rgba(0, 0, 0, 0.1);
      }

      .tip {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0;
        color: nb-theme(text-hint-color);
        font-size: 0.875rem;

        nb-icon {
          font-size: 1rem;
        }

        kbd {
          margin: 0 0.25rem;
        }
      }
    `,
    ]
})
export class KeyboardShortcutsHelpComponent {
  shortcutGroups: ShortcutGroup[] = [
    {
      name: 'Navigation',
      icon: 'compass-outline',
      shortcuts: [
        { keys: ['?'], description: 'Show keyboard shortcuts' },
        { keys: ['⌘', 'K'], description: 'Open search' },
        { keys: ['G', 'H'], description: 'Go to home' },
        { keys: ['G', 'P'], description: 'Go to profile' },
        { keys: ['G', 'S'], description: 'Go to settings' },
      ],
    },
    {
      name: 'Actions',
      icon: 'flash-outline',
      shortcuts: [
        { keys: ['N'], description: 'Create new ad' },
        { keys: ['F'], description: 'Add to favorites' },
        { keys: ['L'], description: 'Toggle like' },
        { keys: ['S'], description: 'Save changes' },
        { keys: ['Esc'], description: 'Close dialog/menu' },
      ],
    },
    {
      name: 'View',
      icon: 'eye-outline',
      shortcuts: [
        { keys: ['\\'], description: 'Toggle sidebar' },
        { keys: ['B'], description: 'Toggle breadcrumbs' },
        { keys: ['T'], description: 'Toggle theme' },
        { keys: ['+'], description: 'Increase font size' },
        { keys: ['-'], description: 'Decrease font size' },
      ],
    },
  ];

  constructor(private dialogRef: NbDialogRef<KeyboardShortcutsHelpComponent>) {}

  close() {
    this.dialogRef.close();
  }
}
