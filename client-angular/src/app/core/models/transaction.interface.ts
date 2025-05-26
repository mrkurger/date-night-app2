/**
 *
 */
export interface Transaction {
  /**
   *
   */
  _id?: string;
  /**
   *
   */
  id?: string;
  /**
   *
   */
  userId: string;
  /**
   *
   */
  type: string;
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
  status: string;
  /**
   *
   */
  createdAt: string;
  /**
   *
   */
  updatedAt?: string;
  /**
   *
   */
  description?: string;
  /**
   *
   */
  paymentMethodId?: string;
  /**
   *
   */
  recipientId?: string;
  /**
   *
   */
  reference?: string;
  /**
   *
   */
  fee?: number;
}
