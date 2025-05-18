import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NebularModule } from '../../../../../app/shared/nebular.module';
import { NbCardModule } from '@nebular/theme'; // Example import
interface Advertiser {
  id: number;
  name: string;
}

@Component({
  selector: 'app-alt-netflix-view',
  standalone: true,
  imports: [NebularModule, CommonModule, NbCardModule],
  templateUrl: './alt-netflix-view.component.html',
  styleUrls: ['./alt-netflix-view.component.scss'],
})
export class AltNetflixViewComponent {
  @Input() advertisers: Advertiser[] = [];
  // TODO: Implement Netflix-style view logic and card conversion
}
