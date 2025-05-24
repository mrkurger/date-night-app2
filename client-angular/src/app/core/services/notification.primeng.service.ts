import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class NotificationPrimeNGService {
  constructor(private messageService: MessageService) {}

  success(message: string, options: { life?: number } = {}) {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
      life: options.life || 3000,
    });
  }

  error(message: string, options: { life?: number } = {}) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: options.life || 5000,
    });
  }

  warning(message: string, options: { life?: number } = {}) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Warning',
      detail: message,
      life: options.life || 4000,
    });
  }

  info(message: string, options: { life?: number } = {}) {
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: message,
      life: options.life || 3000,
    });
  }
}
