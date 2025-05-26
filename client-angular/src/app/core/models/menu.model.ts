import { NbMenuItem } from '@nebular/theme';

export interface AppMenuItem extends NbMenuItem {
  id?: string;
  children?: AppMenuItem[];
}
';
