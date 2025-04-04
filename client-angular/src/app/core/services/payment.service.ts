import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Stripe types
declare global {
  interface Window {
    Stripe?: any;
  }
}

export interface PaymentIntent {
  clientSecret: string;
}

export interface SubscriptionPrice {
  id: string;
  productId: string;
  productName: string;
  description: string;
  unitAmount: number;
  currency: string;
  interval: string;
  intervalCount: number;
}

export interface Subscription {
  subscriptionId: string;
  clientSecret: string;
  subscriptionStatus: string;
  currentPeriodEnd: Date;
}

export interface BoostAdResult {
  adId: string;
  boosted: boolean;
  boostExpires: Date;
  paymentIntentId: string;
}

export interface FeatureAdResult {
  adId: string;
  featured: boolean;
  paymentIntentId: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;
  private stripe: any;

  constructor(private http: HttpClient) {
    this.initStripe();
  }

  /**
   * Initialize Stripe
   */
  private async initStripe(): Promise<void> {
    if (!window.Stripe) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      document.body.appendChild(script);

      await new Promise<void>((resolve) => {
        script.onload = () => resolve();
      });
    }

    this.stripe = window.Stripe(environment.stripePublicKey);
  }

  /**
   * Get Stripe instance
   */
  getStripe(): any {
    if (!this.stripe) {
      throw new Error('Stripe has not been initialized');
    }
    return this.stripe;
  }

  /**
   * Create a payment intent
   * @param amount Amount in smallest currency unit (e.g., cents)
   * @param currency Currency code (e.g., 'usd', 'nok')
   * @param metadata Additional metadata for the payment
   */
  createPaymentIntent(amount: number, currency: string = 'nok', metadata: any = {}): Observable<PaymentIntent> {
    return this.http.post<PaymentIntent>(`${this.apiUrl}/create-payment-intent`, {
      amount,
      currency,
      metadata
    });
  }

  /**
   * Get subscription prices
   */
  getSubscriptionPrices(): Observable<{ prices: SubscriptionPrice[] }> {
    return this.http.get<{ prices: SubscriptionPrice[] }>(`${this.apiUrl}/subscription-prices`);
  }

  /**
   * Create a subscription
   * @param priceId Stripe price ID
   * @param paymentMethodId Stripe payment method ID
   */
  createSubscription(priceId: string, paymentMethodId: string): Observable<Subscription> {
    return this.http.post<Subscription>(`${this.apiUrl}/create-subscription`, {
      priceId,
      paymentMethodId
    });
  }

  /**
   * Cancel a subscription
   */
  cancelSubscription(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cancel-subscription`, {});
  }

  /**
   * Boost an ad
   * @param adId Ad ID
   * @param days Number of days to boost
   * @param paymentMethodId Stripe payment method ID
   */
  boostAd(adId: string, days: number = 7, paymentMethodId: string): Observable<BoostAdResult> {
    return this.http.post<BoostAdResult>(`${this.apiUrl}/boost-ad`, {
      adId,
      days,
      paymentMethodId
    });
  }

  /**
   * Feature an ad
   * @param adId Ad ID
   * @param paymentMethodId Stripe payment method ID
   */
  featureAd(adId: string, paymentMethodId: string): Observable<FeatureAdResult> {
    return this.http.post<FeatureAdResult>(`${this.apiUrl}/feature-ad`, {
      adId,
      paymentMethodId
    });
  }

  /**
   * Create a payment method setup
   */
  async createSetupIntent(): Promise<string> {
    const response = await this.http.post<{ clientSecret: string }>(`${this.apiUrl}/create-setup-intent`, {}).toPromise();
    return response.clientSecret;
  }

  /**
   * Create a card payment method element
   * @param elementId HTML element ID to mount the card element
   */
  createCardElement(elementId: string): any {
    const elements = this.getStripe().elements();
    const style = {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    };

    const cardElement = elements.create('card', { style });
    cardElement.mount(`#${elementId}`);
    return cardElement;
  }

  /**
   * Confirm card setup with the Stripe API
   * @param clientSecret Setup intent client secret
   * @param cardElement Stripe card element
   */
  async confirmCardSetup(clientSecret: string, cardElement: any): Promise<PaymentMethod> {
    const result = await this.getStripe().confirmCardSetup(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          // You can add billing details here if needed
        }
      }
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.setupIntent.payment_method;
  }

  /**
   * Format currency amount for display
   * @param amount Amount in smallest currency unit (e.g., cents)
   * @param currency Currency code (e.g., 'usd', 'nok')
   */
  formatCurrency(amount: number, currency: string = 'nok'): string {
    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0
    }).format(amount / 100);
  }
}