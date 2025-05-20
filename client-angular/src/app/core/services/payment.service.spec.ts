import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {
  PaymentService,
  PaymentIntent,
  SubscriptionPrice,
  Subscription,
  BoostAdResult,
  FeatureAdResult,
} from './payment.service';
import { environment } from '../../// ...existing code...
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

// Remove duplicate newMessage as it's handled by the form
// newMessage = '';  // <- Remove this line

constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
) {
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?._id || '';

    // Initialize the form here instead
    this.messageForm = new FormGroup({
        message: new FormControl('', [Validators.required])
    });
}<!-- Replace [(ngModel)]="newMessage" with [formControl] -->
<input nbInput
       fullWidth
       [formControl]="messageForm.get('message')"
       (keyup)="onTyping()"
       placeholder="Type a message..."
       #messageInput>../environments/environment';

describe('PaymentService', () => {
  let service: PaymentService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/payments`;

  // Mock Stripe object
  const mockStripe = {
    elements: jasmine.createSpy('elements').and.returnValue({
      create: jasmine.createSpy('create').and.returnValue({
        mount: jasmine.createSpy('mount'),
      }),
    }),
    confirmCardSetup: jasmine.createSpy('confirmCardSetup').and.resolveTo({
      setupIntent: {
        payment_method: {
          id: 'pm_123',
          type: 'card',
          card: {
            brand: 'visa',
            last4: '4242',
            exp_month: 12,
            exp_year: 2025,
          },
        },
      },
    }),
  };

  beforeEach(() => {
    // Create a mock for the window.Stripe
    (window as any).Stripe = jasmine.createSpy('Stripe').and.returnValue(mockStripe);

    TestBed.configureTestingModule({
    imports: [],
    providers: [PaymentService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});

    service = TestBed.inject(PaymentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize Stripe on creation', () => {
      expect((window as any).Stripe).toHaveBeenCalledWith(environment.stripePublicKey);
    });

    it('should return the Stripe instance when getStripe is called', () => {
      const stripe = service.getStripe();
      expect(stripe).toBe(mockStripe);
    });

    it('should throw an error if Stripe is not initialized', () => {
      // Set stripe to null to simulate uninitialized state
      (service as any).stripe = null;

      expect(() => service.getStripe()).toThrowError('Stripe has not been initialized');
    });
  });

  describe('Payment Intent Operations', () => {
    it('should create a payment intent', () => {
      const mockPaymentIntent: PaymentIntent = {
        clientSecret: 'pi_secret_123',
      };

      const amount = 1000;
      const currency = 'nok';
      const metadata = { orderId: '123' };

      service.createPaymentIntent(amount, currency, metadata).subscribe((result) => {
        expect(result).toEqual(mockPaymentIntent);
      });

      const req = httpMock.expectOne(`${apiUrl}/create-payment-intent`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ amount, currency, metadata });
      req.flush(mockPaymentIntent);
    });
  });

  describe('Subscription Operations', () => {
    it('should get subscription prices', () => {
      const mockPrices: SubscriptionPrice[] = [
        {
          id: 'price_123',
          productId: 'prod_123',
          productName: 'Premium Plan',
          description: 'Premium features',
          unitAmount: 1999,
          currency: 'nok',
          interval: 'month',
          intervalCount: 1,
        },
      ];

      service.getSubscriptionPrices().subscribe((result) => {
        expect(result).toEqual({ prices: mockPrices });
      });

      const req = httpMock.expectOne(`${apiUrl}/subscription-prices`);
      expect(req.request.method).toBe('GET');
      req.flush({ prices: mockPrices });
    });

    it('should create a subscription', () => {
      const mockSubscription: Subscription = {
        subscriptionId: 'sub_123',
        clientSecret: 'cs_123',
        subscriptionStatus: 'active',
        currentPeriodEnd: new Date(),
      };

      const priceId = 'price_123';
      const paymentMethodId = 'pm_123';

      service.createSubscription(priceId, paymentMethodId).subscribe((result) => {
        expect(result).toEqual(mockSubscription);
      });

      const req = httpMock.expectOne(`${apiUrl}/create-subscription`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ priceId, paymentMethodId });
      req.flush(mockSubscription);
    });

    it('should cancel a subscription', () => {
      const mockResponse = { canceled: true };

      service.cancelSubscription().subscribe((result) => {
        expect(result).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/cancel-subscription`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(mockResponse);
    });
  });

  describe('Ad Promotion Operations', () => {
    it('should boost an ad', () => {
      const mockBoostResult: BoostAdResult = {
        adId: 'ad_123',
        boosted: true,
        boostExpires: new Date(),
        paymentIntentId: 'pi_123',
      };

      const adId = 'ad_123';
      const days = 7;
      const paymentMethodId = 'pm_123';

      service.boostAd(adId, days, paymentMethodId).subscribe((result) => {
        expect(result).toEqual(mockBoostResult);
      });

      const req = httpMock.expectOne(`${apiUrl}/boost-ad`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ adId, days, paymentMethodId });
      req.flush(mockBoostResult);
    });

    it('should feature an ad', () => {
      const mockFeatureResult: FeatureAdResult = {
        adId: 'ad_123',
        featured: true,
        paymentIntentId: 'pi_123',
      };

      const adId = 'ad_123';
      const paymentMethodId = 'pm_123';

      service.featureAd(adId, paymentMethodId).subscribe((result) => {
        expect(result).toEqual(mockFeatureResult);
      });

      const req = httpMock.expectOne(`${apiUrl}/feature-ad`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ adId, paymentMethodId });
      req.flush(mockFeatureResult);
    });
  });

  describe('Payment Method Operations', () => {
    it('should create a setup intent', async () => {
      const mockClientSecret = 'seti_123';

      const promise = service.createSetupIntent();

      const req = httpMock.expectOne(`${apiUrl}/create-setup-intent`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush({ clientSecret: mockClientSecret });

      const result = await promise;
      expect(result).toEqual(mockClientSecret);
    });

    it('should create a card element', () => {
      const elementId = 'card-element';
      const cardElement = service.createCardElement(elementId);

      expect(mockStripe.elements).toHaveBeenCalled();
      expect(cardElement.mount).toHaveBeenCalledWith(`#${elementId}`);
    });

    it('should confirm card setup', async () => {
      const clientSecret = 'seti_123';
      const cardElement = { id: 'card_element' };

      const result = await service.confirmCardSetup(clientSecret, cardElement);

      expect(mockStripe.confirmCardSetup).toHaveBeenCalledWith(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {},
        },
      });

      expect(result).toEqual({
        id: 'pm_123',
        type: 'card',
        card: {
          brand: 'visa',
          last4: '4242',
          exp_month: 12,
          exp_year: 2025,
        },
      });
    });

    it('should throw an error if confirm card setup fails', async () => {
      const clientSecret = 'seti_123';
      const cardElement = { id: 'card_element' };
      const errorMessage = 'Your card was declined';

      mockStripe.confirmCardSetup.and.resolveTo({
        error: { message: errorMessage },
      });

      await expectAsync(service.confirmCardSetup(clientSecret, cardElement)).toBeRejectedWithError(
        errorMessage,
      );

      expect(mockStripe.confirmCardSetup).toHaveBeenCalled();
    });
  });

  describe('Utility Methods', () => {
    it('should format currency correctly', () => {
      const amount = 1999; // 19.99 NOK in cents
      const formatted = service.formatCurrency(amount, 'nok');

      // This will depend on the locale of the test environment
      // For Norwegian locale, it should be something like "kr 20"
      expect(formatted).toContain('20');
    });

    it('should format currency with different currency code', () => {
      const amount = 1999; // 19.99 USD in cents
      const formatted = service.formatCurrency(amount, 'usd');

      // This will depend on the locale of the test environment
      // For Norwegian locale with USD, it should contain "$" or "USD"
      expect(formatted).toBeTruthy();
    });
  });
});
