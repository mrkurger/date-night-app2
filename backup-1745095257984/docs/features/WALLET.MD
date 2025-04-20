# Wallet System

## Overview

The Wallet System provides users with a comprehensive financial management solution within the application. It enables users to deposit, withdraw, and transfer funds, manage payment methods, and track transaction history. The system supports both fiat currencies and cryptocurrencies, offering a flexible and secure way to handle financial operations.

## User Experience

Users interact with the Wallet System through several interfaces:

- **Wallet Dashboard**: Displays balances, recent transactions, and quick action buttons
- **Transaction History**: Shows detailed transaction records with filtering options
- **Payment Methods**: Allows management of various payment methods (cards, bank accounts, crypto)
- **Deposit Interface**: Provides options to add funds to the wallet
- **Withdrawal Interface**: Enables users to withdraw funds to their preferred payment method
- **Transfer Interface**: Allows sending funds to other users
- **Settings Panel**: Controls wallet preferences and notification settings

## Architecture

### Client-Side Components

| Component                           | Path                                                                                      | Description                       |
| ----------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------- |
| `WalletComponent`                   | `/client-angular/src/app/features/wallet/wallet.component.ts`                             | Main wallet dashboard             |
| `DepositDialogComponent`            | `/client-angular/src/app/features/wallet/dialogs/deposit-dialog.component.ts`             | Dialog for depositing funds       |
| `WithdrawDialogComponent`           | `/client-angular/src/app/features/wallet/dialogs/withdraw-dialog.component.ts`            | Dialog for withdrawing funds      |
| `TransferDialogComponent`           | `/client-angular/src/app/features/wallet/dialogs/transfer-dialog.component.ts`            | Dialog for transferring funds     |
| `AddPaymentMethodDialogComponent`   | `/client-angular/src/app/features/wallet/dialogs/add-payment-method-dialog.component.ts`  | Dialog for adding payment methods |
| `TransactionDetailsDialogComponent` | `/client-angular/src/app/features/wallet/dialogs/transaction-details-dialog.component.ts` | Dialog for transaction details    |

### Client-Side Services

| Service          | Path                                                       | Description                |
| ---------------- | ---------------------------------------------------------- | -------------------------- |
| `WalletService`  | `/client-angular/src/app/core/services/wallet.service.ts`  | Manages wallet operations  |
| `PaymentService` | `/client-angular/src/app/core/services/payment.service.ts` | Handles payment processing |

### Server-Side Controllers

| Controller         | Path                                       | Description                          |
| ------------------ | ------------------------------------------ | ------------------------------------ |
| `WalletController` | `/server/controllers/wallet.controller.js` | Handles wallet-related HTTP requests |

### Server-Side Services

| Service         | Path                                 | Description                      |
| --------------- | ------------------------------------ | -------------------------------- |
| `WalletService` | `/server/services/wallet.service.js` | Implements wallet business logic |

### Server-Side Models

| Model    | Path                             | Description                     |
| -------- | -------------------------------- | ------------------------------- |
| `Wallet` | `/server/models/wallet.model.js` | Mongoose schema for wallet data |

## API Endpoints

| Endpoint                                  | Method | Description                    | Request Body                                              | Response                      |
| ----------------------------------------- | ------ | ------------------------------ | --------------------------------------------------------- | ----------------------------- |
| `/api/wallet`                             | GET    | Get user wallet                | N/A                                                       | Wallet object                 |
| `/api/wallet/balance`                     | GET    | Get wallet balance             | Query param: `currency` (optional)                        | Balance object(s)             |
| `/api/wallet/transactions`                | GET    | Get wallet transactions        | Query params: filters, pagination                         | Transactions with pagination  |
| `/api/wallet/payment-methods`             | GET    | Get payment methods            | N/A                                                       | Array of payment methods      |
| `/api/wallet/payment-methods`             | POST   | Add payment method             | Payment method data                                       | Created payment method        |
| `/api/wallet/payment-methods/:id`         | DELETE | Remove payment method          | N/A                                                       | Success message               |
| `/api/wallet/payment-methods/:id/default` | PATCH  | Set default payment method     | N/A                                                       | Updated payment method        |
| `/api/wallet/deposit/stripe`              | POST   | Deposit funds with Stripe      | `{amount, currency, paymentMethodId, description}`        | Transaction and client secret |
| `/api/wallet/deposit/crypto/:currency`    | GET    | Get crypto deposit address     | N/A                                                       | Crypto address details        |
| `/api/wallet/withdraw`                    | POST   | Withdraw funds                 | `{amount, currency, paymentMethodId, description}`        | Transaction object            |
| `/api/wallet/withdraw/crypto`             | POST   | Withdraw cryptocurrency        | `{amount, currency, address, network, memo, description}` | Transaction object            |
| `/api/wallet/transfer`                    | POST   | Transfer funds to another user | `{recipientUserId, amount, currency, description}`        | Transaction object            |
| `/api/wallet/settings`                    | PATCH  | Update wallet settings         | Settings object                                           | Updated settings              |
| `/api/wallet/exchange-rates`              | GET    | Get exchange rates             | Query params: `fromCurrency`, `toCurrency`                | Exchange rate object          |

## Data Flow

The wallet system follows these data flows:

1. **Wallet Initialization**:

   - When a user first accesses the wallet, WalletComponent is loaded
   - WalletComponent calls WalletService.getWallet()
   - The request goes to the server's /api/wallet endpoint
   - WalletController.getWallet() handles the request
   - Server-side WalletService.getOrCreateWallet() is called
   - If the user doesn't have a wallet, one is created with default settings
   - The wallet data is returned to the client
   - Client-side WalletService updates its state with the wallet data
   - WalletComponent displays the wallet information

2. **Depositing Funds**:

   - User clicks "Deposit" button in WalletComponent
   - DepositDialogComponent opens with deposit options
   - User selects currency, amount, and payment method
   - For fiat deposits:
     - WalletService.depositFundsWithStripe() is called
     - Request goes to /api/wallet/deposit/stripe
     - Server processes the payment intent with Stripe
     - Transaction is created with "pending" status
     - Client receives transaction data and Stripe client secret
     - Client completes the payment using Stripe.js
     - Stripe webhook notifies the server when payment succeeds
     - Server updates transaction status to "completed"
     - User's balance is updated
   - For crypto deposits:
     - WalletService.getCryptoDepositAddress() is called
     - Request goes to /api/wallet/deposit/crypto/:currency
     - Server generates or retrieves a deposit address
     - Client displays the address with a QR code
     - User sends crypto to the address
     - Crypto provider webhook notifies the server when deposit is received
     - Server creates a transaction and updates user's balance

3. **Viewing Transactions**:

   - WalletComponent calls WalletService.getWalletTransactions()
   - Request goes to /api/wallet/transactions with filter parameters
   - Server retrieves transactions matching the filters
   - Transactions are returned with pagination data
   - WalletComponent displays the transactions in a table
   - User can click on a transaction to view details
   - TransactionDetailsDialogComponent shows detailed information

4. **Managing Payment Methods**:
   - WalletComponent calls WalletService.getWalletPaymentMethods()
   - Server returns the user's payment methods
   - WalletComponent displays the payment methods
   - User can add a new payment method via AddPaymentMethodDialogComponent
   - WalletService.addPaymentMethod() sends the data to the server
   - Server stores the payment method and returns it
   - WalletComponent updates the displayed payment methods

## State Management

The wallet system uses a combination of service-based state management:

- **WalletService**: Maintains wallet state with BehaviorSubject

  - `walletSubject`: Stores the current wallet data
  - `balancesSubject`: Stores the current balances
  - Exposes observables: `wallet$` and `balances$`
  - Components subscribe to these observables to react to changes

- **Component-level state**: Each component maintains its own UI state
  - Loading states
  - Form values
  - Selected filters
  - Pagination state

## Data Models

### Client-Side Models

```typescript
// Wallet balance
interface WalletBalance {
  currency: string;
  available: number;
  pending: number;
  reserved: number;
}

// Wallet transaction
interface WalletTransaction {
  _id: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'refund' | 'fee';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  metadata: {
    paymentIntentId?: string;
    paymentMethodId?: string;
    transactionId?: string;
    txHash?: string;
    blockConfirmations?: number;
    provider?: string;
    senderWalletId?: string;
    recipientWalletId?: string;
    adId?: string;
    serviceType?: string;
    address?: string;
    network?: string;
    memo?: string;
  };
  fee?: {
    amount: number;
    currency: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Payment method
interface PaymentMethod {
  _id: string;
  type: 'card' | 'bank_account' | 'crypto_address';
  provider: string;
  isDefault: boolean;
  cardDetails?: {
    lastFour: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
    tokenId: string;
  };
  bankDetails?: {
    accountType: string;
    lastFour: string;
    bankName: string;
    country: string;
    currency: string;
    tokenId: string;
  };
  cryptoDetails?: {
    currency: string;
    address: string;
    network: string;
    memo?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Wallet settings
interface WalletSettings {
  autoWithdrawal: {
    enabled: boolean;
    threshold: number;
    paymentMethodId: string;
  };
  defaultCurrency: string;
  notificationPreferences: {
    email: {
      deposit: boolean;
      withdrawal: boolean;
      payment: boolean;
    };
    push: {
      deposit: boolean;
      withdrawal: boolean;
      payment: boolean;
    };
  };
}

// Complete wallet
interface Wallet {
  _id: string;
  balances: WalletBalance[];
  paymentMethods: PaymentMethod[];
  settings: WalletSettings;
}
```

### Server-Side Models

The server uses Mongoose schemas that closely mirror the client-side interfaces:

- `walletSchema`: Main wallet schema with user reference, balances, transactions, payment methods, and settings
- `balanceSchema`: Schema for currency balances
- `transactionSchema`: Schema for wallet transactions
- `paymentMethodSchema`: Schema for payment methods

## Key Features

1. **Multi-Currency Support**:

   - Fiat currencies: NOK, USD, EUR, GBP
   - Cryptocurrencies: BTC, ETH, USDT, USDC
   - Currency conversion via exchange rates

2. **Payment Method Management**:

   - Credit/debit cards via Stripe
   - Bank accounts
   - Cryptocurrency addresses
   - Default payment method selection

3. **Transaction Types**:

   - Deposits (fiat and crypto)
   - Withdrawals (fiat and crypto)
   - Transfers between users
   - Payments for services
   - Refunds
   - Fee transactions

4. **Wallet Settings**:

   - Default currency preference
   - Auto-withdrawal configuration
   - Notification preferences

5. **Security Features**:
   - Transaction verification
   - Withdrawal confirmations
   - Payment method validation
   - Balance checks before transactions

## Security Considerations

1. **Transaction Validation**:

   - Server-side validation of all transactions
   - Balance checks before withdrawals and transfers
   - Minimum and maximum transaction limits

2. **Payment Provider Integration**:

   - Secure integration with Stripe for card payments
   - Secure integration with crypto providers
   - Webhook verification for payment confirmations

3. **Access Control**:

   - Authentication required for all wallet operations
   - Users can only access their own wallet
   - Rate limiting on sensitive operations

4. **Data Protection**:
   - Payment method details are tokenized
   - Sensitive data is not stored directly
   - Transactions are immutable once completed

## Testing

### Unit Tests

| Test File                  | Path                                                               | Description                |
| -------------------------- | ------------------------------------------------------------------ | -------------------------- |
| `wallet.service.spec.ts`   | `/client-angular/src/app/core/services/wallet.service.spec.ts`     | Tests for wallet service   |
| `wallet.component.spec.ts` | `/client-angular/src/app/features/wallet/wallet.component.spec.ts` | Tests for wallet component |

### Integration Tests

| Test File                   | Path                                                         | Description               |
| --------------------------- | ------------------------------------------------------------ | ------------------------- |
| `wallet.controller.test.js` | `/server/tests/integration/wallet/wallet.controller.test.js` | API integration tests     |
| `wallet.service.test.js`    | `/server/tests/integration/wallet/wallet.service.test.js`    | Service integration tests |
| `wallet.model.test.js`      | `/server/tests/integration/wallet/wallet.model.test.js`      | Database model tests      |

## Performance Considerations

1. **Pagination**:

   - Transaction history is paginated
   - Default limit of 20 transactions per page
   - Filtering to reduce result set size

2. **Indexing**:

   - MongoDB indexes on frequently queried fields
   - Compound indexes for complex queries
   - Index on userId for quick wallet lookup

3. **Caching**:
   - Exchange rates are cached
   - Wallet data is cached in the client service
   - Balance updates trigger cache invalidation

## Future Enhancements

1. **Advanced Analytics**:

   - Spending patterns visualization
   - Income/expense categorization
   - Financial reports and exports

2. **Enhanced Crypto Support**:

   - Additional cryptocurrencies
   - Cross-chain transactions
   - DeFi integrations

3. **Recurring Payments**:

   - Scheduled transfers
   - Subscription management
   - Automatic top-ups

4. **Multi-Wallet Support**:
   - Multiple wallets per user
   - Purpose-specific wallets
   - Shared wallets for teams
