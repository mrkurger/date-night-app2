'use client';

/**
 * PWA Service - Handles service worker registration and management
 * Used to enable offline functionality, caching, and push notifications
 */
export class PWAService {
  private static instance: PWAService;
  private swRegistration: ServiceWorkerRegistration | null = null;

  // Singleton pattern
  public static getInstance(): PWAService {
    if (!PWAService.instance) {
      PWAService.instance = new PWAService();
    }
    return PWAService.instance;
  }

  /**
   * Register the service worker
   * @returns Promise<ServiceWorkerRegistration | null>
   */
  public async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker is not supported in this browser');
      return null;
    }

    try {
      this.swRegistration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered with scope:', this.swRegistration.scope);
      return this.swRegistration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  /**
   * Check if the app is installed (in standalone mode)
   * @returns boolean
   */
  public isInstalled(): boolean {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  }

  /**
   * Check if the browser supports push notifications
   * @returns boolean
   */
  public supportsPushNotifications(): boolean {
    return 'Notification' in window && 'PushManager' in window;
  }

  /**
   * Request permission for push notifications
   * @returns Promise<NotificationPermission>
   */
  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!this.supportsPushNotifications()) {
      return 'denied';
    }

    return await Notification.requestPermission();
  }

  /**
   * Subscribe to push notifications
   * @param publicKey - VAPID public key for push notifications
   * @returns Promise<PushSubscription | null>
   */
  public async subscribeToPushNotifications(publicKey: string): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      await this.registerServiceWorker();
    }

    if (!this.swRegistration || !this.swRegistration.pushManager) {
      return null;
    }

    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(publicKey),
      });

      console.log('Push notification subscription:', subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  /**
   * Check if the app can be installed (has a manifest and meets criteria)
   * @returns Promise<boolean>
   */
  public async canInstall(): Promise<boolean> {
    if (!window.matchMedia('(display-mode: browser)').matches) {
      return false; // Already installed
    }

    // Check for the beforeinstallprompt event
    return new Promise<boolean>(resolve => {
      window.addEventListener('beforeinstallprompt', e => {
        e.preventDefault();
        resolve(true);
      });

      // If no event fired after a short timeout, assume can't install
      setTimeout(() => resolve(false), 1000);
    });
  }

  /**
   * Convert base64 string to Uint8Array for push subscription
   * @param base64String - Base64 encoded string
   * @returns Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}
