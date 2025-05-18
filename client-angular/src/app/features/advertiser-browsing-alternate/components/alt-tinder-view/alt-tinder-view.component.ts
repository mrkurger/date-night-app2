import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
// Import a potential custom Tinder card component if we create one, or NbCardModule
import { NebularModule } from '../../../../../app/shared/nebular.module';
import { NbCardModule } from '@nebular/theme';
interface Advertiser {
  id: number;
  name: string;
}

@Component({
  selector: 'app-alt-tinder-view',
  standalone: true,
  imports: [NebularModule, CommonModule, NbCardModule],
  templateUrl: './alt-tinder-view.component.html',
  styleUrls: ['./alt-tinder-view.component.scss'],
})
export class AltTinderViewComponent {
  @Input() advertisers: Advertiser[] = [];
  // TODO: Implement Tinder-style swipeable card view
}
