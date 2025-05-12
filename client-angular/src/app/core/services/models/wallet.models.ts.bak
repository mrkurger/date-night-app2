export interface PaymentMethod {
  id: string;
  type: string;
  name: string;
  isDefault?: boolean;
}

export interface CryptoDepositAddress {
  address: string;
  currency: string;
  network?: string;
  memo?: string;
  memoType?: string;
}

export interface DepositRequest {
  amount: number;
  currency: string;
  paymentMethodId?: string;
  description?: string;
}

export interface DepositResult {
  success: boolean;
  transactionId?: string;
  clientSecret?: string;
  error?: string;
}
