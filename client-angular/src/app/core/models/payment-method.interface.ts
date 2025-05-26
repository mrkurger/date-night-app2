/**
 *
 */
export interface PaymentMethod {
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
  type: string;
  /**
   *
   */
  name: string;
  /**
   *
   */
  isDefault: boolean;
  /**
   *
   */
  currency: string;
  /**
   *
   */
  provider?: string;
  /**
   *
   */
  cardDetails?: {
    /**
     *
     */
    brand: string;
    /**
     *
     */
    last4: string;
    /**
     *
     */
    expiryMonth: number;
    /**
     *
     */
    expiryYear: number;
  };
  /**
   *
   */
  bankDetails?: {
    /**
     *
     */
    bankName: string;
    /**
     *
     */
    accountType: string;
    /**
     *
     */
    last4: string;
    /**
     *
     */
    country?: string;
  };
  /**
   *
   */
  cryptoDetails?: {
    /**
     *
     */
    network: string;
    /**
     *
     */
    address: string;
  };
}
