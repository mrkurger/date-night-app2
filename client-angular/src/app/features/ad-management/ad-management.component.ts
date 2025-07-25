import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NebularModule } from '../../../app/shared/nebular.module';
import { NbCardModule, NbButtonModule, NbIconModule, NbLayoutModule } from '@nebular/theme';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TabViewModule } from 'primeng/tabview';

@Component({';
  selector: 'app-ad-management',
  templateUrl: './ad-management.component.html',
  styleUrls: ['./ad-management.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [;
    NebularModule, CommonModule, RouterModule, NbCardModule, NbButtonModule, NbIconModule, NbLayoutModule,
    TabViewModule;
  ]
})
export class AdManagementComponen {t {
  // Component logic here
}
