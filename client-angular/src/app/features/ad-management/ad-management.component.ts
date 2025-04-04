import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RouterOutlet } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { AdService } from '../../core/services/ad.service';
import { AuthService } from '../../core/services/auth.service';
import { MatTabNav, MatTabNavPanel } from '@angular/material/tabs';

@Component({
  selector: 'app-ad-management',
  templateUrl: './ad-management.component.html',
  styleUrls: ['./ad-management.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    MaterialModule,
    MatTabNav,
    MatTabNavPanel
  ]
})
export class AdManagementComponent implements OnInit {
  ads: any[] = [];
  loading = false;
  error = '';
  isAdmin = false;

  constructor(
    private adService: AdService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkUserRole();
  }

  private checkUserRole(): void {
    const user = this.authService.getCurrentUser();
    this.isAdmin = user?.roles?.includes('admin') || false;
  }
}
