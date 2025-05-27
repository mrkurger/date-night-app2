/**
 *
 */
export interface IPaymentMethod {
  /**
   *
   */
  _id?: string;
  /**
   *
   */
  id: string;
  /**
   *
   */
  userId: string;
  /**
   *
   */
  type: 'credit_card' | 'debit_card' | 'bank_account' | 'crypto';
  /**
   *
   */
  name: string;
  /**
   *
   */
  lastFourDigits?: string;
  /**
   *
   */
  expiryDate?: string;
  /**
   *
   */
  isDefault: boolean;
  /**
   *
   */
  createdAt: Date;
  /**
   *
   */
  updatedAt: Date;
}
