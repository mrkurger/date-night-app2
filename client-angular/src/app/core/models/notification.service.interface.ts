/**
 *
 */
export interface INotificationService {
  showSuccess(message: string): void;
  showError(message: string): void;
  showWarning(message: string): void;
  showInfo(message: string): void;
}
