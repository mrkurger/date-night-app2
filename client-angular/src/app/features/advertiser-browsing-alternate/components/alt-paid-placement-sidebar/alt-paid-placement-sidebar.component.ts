import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NebularModule } from '../../../../../app/shared/nebular.module';
import { NbCardModule } from '@nebular/theme';
interface Advertiser {
  id: number;
  name: string;
  image?: string;
  location?: string;
}

@Component({
  selector: 'app-alt-paid-placement-sidebar',
  standalone: true,
  imports: [NebularModule, CommonModule, NbCardModule],
  templateUrl: './alt-paid-placement-sidebar.component.html',
  styleUrls: ['./alt-paid-placement-sidebar.component.scss'],
})
export class AltPaidPlacementSidebarComponent {
  @Input() ads: Advertiser[] = [];
}
