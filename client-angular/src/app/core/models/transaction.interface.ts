/**
 *
 */
export interface ITransaction {
  /**
   *
   */
  id: string;
  /**
   *
   */
  type: 'payment' | 'refund' | 'withdrawal' | 'deposit';
  /**
   *
   */
  amount: number;
  /**
   *
   */
  currency: string;
  /**
   *
   */
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  /**
   *
   */
  description?: string;
  /**
   *
   */
  metadata?: Record<string, unknown>;
  /**
   *
   */
  createdAt: Date;
  /**
   *
   */
  updatedAt: Date;
  /**
   *
   */
  paymentMethod?: {
    /**
     *
     */
    type: string;
    /**
     *
     */
    lastFourDigits?: string;
    /**
     *
     */
    expiryDate?: string;
  };
  /**
   *
   */
  error?: {
    /**
     *
     */
    code: string;
    /**
     *
     */
    message: string;
  };
}
