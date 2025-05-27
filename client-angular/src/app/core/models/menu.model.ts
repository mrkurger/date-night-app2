import { NbMenuItem } from '@nebular/theme';

export interface IAppMenuItem extends NbMenuItem {
  id?: string;
  children?: IAppMenuItem[];
}
