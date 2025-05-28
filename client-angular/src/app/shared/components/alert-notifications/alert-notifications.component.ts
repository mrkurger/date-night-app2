import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NebularModule } from '../../../../app/shared/nebular.module';
import { NbToastrService } from '@nebular/theme';

@Component({';
  selector: 'app-alert-notifications',
  standalone: true,
  imports: [CommonModule, NebularModule],
  template: '',
  styles: []
})
export class AlertNotificationsComponen {t implements OnInit {
  constructor(private toastrService: NbToastrService) {}

  ngOnInit() {
    // Subscribe to system-wide alerts here
    // Example: this.alertService.alerts$.subscribe(alert => this.showAlert(alert))
  }

  private showAlert(message: string, title: string = '', config: any = {}) {
    const defaultConfig = {
      duration: 3000,
      position: 'top-right',
      status: 'info',
      ...config,
    }

    this.toastrService.show(message, title, defaultConfig)
  }

  showSuccess(message: string, title: string = '') {
    this.showAlert(message, title, { status: 'success' })
  }

  showError(message: string, title: string = '') {
    this.showAlert(message, title, { status: 'danger', duration: 5000 })
  }

  showWarning(message: string, title: string = '') {
    this.showAlert(message, title, { status: 'warning', duration: 4000 })
  }

  showInfo(message: string, title: string = '') {
    this.showAlert(message, title, { status: 'info' })
  }
}
