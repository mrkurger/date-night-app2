import { NbIconModule } from '@nebular/theme';
import { NbFormFieldModule } from '@nebular/theme';
import { NbAlertModule } from '@nebular/theme';
import { NbCardModule } from '@nebular/theme';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (payment.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, OnInit, ViewChild, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

// Nebular imports
import {
  NbCardModule,
  NbButtonModule,
  NbIconModule,
  NbSpinnerModule,
  NbFormFieldModule,
  NbInputModule,
  NbSelectModule,
  NbLayoutModule,
  NbListModule,
  NbBadgeModule,
  NbAlertModule,
} from '@nebular/theme';

import { PaymentService, SubscriptionPrice } from '../../core/services/payment.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { UserSubscription } from '../../core/models/user.interface';

// Stripe interfaces
interface StripeError {
  message: string;
}

interface StripeCardElementEvent {
  error?: StripeError;
  complete: boolean;
}

interface StripeCardElement {
  on(event: string, handler: (event: StripeCardElementEvent) => void): void;
  destroy(): void;
}

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbSpinnerModule,
    NbFormFieldModule,
    NbInputModule,
    NbSelectModule,
    NbLayoutModule,
    NbListModule,
    NbBadgeModule,
    NbAlertModule,
  ],
})
export class PaymentComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('cardElement') cardElement: ElementRef;

  subscriptionPrices: SubscriptionPrice[] = [];
  paymentForm: FormGroup;
  cardErrors = '';
  loading = false;
  selectedPrice: SubscriptionPrice | null = null;
  stripeCardElement: StripeCardElement;
  currentSubscription: UserSubscription | null = null;
  private subscriptions = new Subscription();

  constructor(
    private paymentService: PaymentService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadSubscriptionPrices();
    this.loadCurrentSubscription();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.stripeCardElement) {
      this.stripeCardElement.destroy();
    }
  }

  ngAfterViewInit(): void {
    this.initializeStripeElement();
  }

  /**
   * Initialize the payment form
   */
  private initForm(): void {
    this.paymentForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      priceId: ['', [Validators.required]],
    });

    // Pre-fill email from authenticated user
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.paymentForm.patchValue({
        email: currentUser.email,
      });
    }
  }

  /**
   * Initialize Stripe card element
   */
  private initializeStripeElement(): void {
    setTimeout(() => {
      this.stripeCardElement = this.paymentService.createCardElement('card-element');

      this.stripeCardElement.on('change', (event: StripeCardElementEvent) => {
        this.cardErrors = event.error ? event.error.message : '';
      });
    }, 100);
  }

  /**
   * Load subscription prices from the API
   */
  private loadSubscriptionPrices(): void {
    this.loading = true;
    const sub = this.paymentService.getSubscriptionPrices().subscribe(
      (response) => {
        this.subscriptionPrices = response.prices;
        this.loading = false;
      },
      (error) => {
        this.notificationService.error('Failed to load subscription options');
        console.error('Error loading subscription prices:', error);
        this.loading = false;
      },
    );
    this.subscriptions.add(sub);
  }

  /**
   * Load current user's subscription
   */
  private loadCurrentSubscription(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.currentSubscription = {
        tier: currentUser.subscription?.tier || 'free',
        expires: currentUser.subscription?.expires || '',
        status: currentUser.subscription?.status || 'inactive',
      };
    }
  }

  /**
   * Handle price selection
   * @param price Selected subscription price
   */
  selectPrice(price: SubscriptionPrice): void {
    this.selectedPrice = price;
    this.paymentForm.patchValue({
      priceId: price.id,
    });
  }

  /**
   * Format price for display
   * @param price Subscription price object
   */
  formatPrice(price: SubscriptionPrice): string {
    return `${this.paymentService.formatCurrency(price.unitAmount, price.currency)} / ${price.interval}`;
  }

  /**
   * Handle form submission
   */
  async onSubmit(): Promise<void> {
    if (this.paymentForm.invalid || !this.stripeCardElement) {
      return;
    }

    this.loading = true;

    try {
      // Create a setup intent to save the payment method
      const clientSecret = await this.paymentService.createSetupIntent();

      // Confirm card setup with Stripe
      const paymentMethod = await this.paymentService.confirmCardSetup(
        clientSecret,
        this.stripeCardElement,
      );

      // Create subscription with the payment method
      const sub = this.paymentService
        .createSubscription(this.paymentForm.value.priceId, paymentMethod.id)
        .subscribe(
          () => {
            this.notificationService.success('Subscription created successfully');
            this.loading = false;
            this.router.navigate(['/profile']);
          },
          (error) => {
            this.notificationService.error('Failed to create subscription');
            console.error('Subscription error:', error);
            this.loading = false;
          },
        );
      this.subscriptions.add(sub);
    } catch (error) {
      this.notificationService.error(error.message || 'Payment processing failed');
      console.error('Payment error:', error);
      this.loading = false;
    }
  }

  /**
   * Cancel current subscription
   */
  cancelSubscription(): void {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    this.loading = true;
    const sub = this.paymentService.cancelSubscription().subscribe(
      (result) => {
        this.notificationService.success('Subscription cancelled successfully');
        this.loading = false;
        this.currentSubscription = {
          ...this.currentSubscription,
          cancelAtPeriodEnd: true,
          currentPeriodEnd: result.currentPeriodEnd,
        };
      },
      (error) => {
        this.notificationService.error('Failed to cancel subscription');
        console.error('Cancellation error:', error);
        this.loading = false;
      },
    );
    this.subscriptions.add(sub);
  }
}
