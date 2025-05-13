import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NbLayoutModule, NbCardModule } from '@nebular/theme';

@Component({
  selector: 'app-auth-layout',
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterOutlet, NbLayoutModule, NbCardModule],
})
export class AuthLayoutComponent {}
