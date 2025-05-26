/**
 *
 */
export interface VerificationStatus {
  /**
   *
   */
  overallStatus: 'unverified' | 'partially_verified' | 'verified' | 'rejected';
  /**
   *
   */
  verificationLevel: number;
  /**
   *
   */
  verificationTypes: {
    /**
     *
     */
    identity: VerificationType;
    /**
     *
     */
    photo: VerificationType;
    /**
     *
     */
    phone: VerificationType & {
      /**
       *
       */
      phoneNumber?: string;
      /**
       *
       */
      verified?: boolean;
    };
    /**
     *
     */
    email: VerificationType & {
      /**
       *
       */
      email?: string;
      /**
       *
       */
      verified?: boolean;
    };
    /**
     *
     */
    address: VerificationType & {
      /**
       *
       */
      city?: string;
      /**
       *
       */
      county?: string;
      /**
       *
       */
      country?: string;
    };
  };
}

/**
 *
 */
export interface VerificationType {
  /**
   *
   */
  status: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  /**
   *
   */
  submittedDate?: Date;
  /**
   *
   */
  approvedDate?: Date;
  /**
   *
   */
  rejectedDate?: Date;
  /**
   *
   */
  rejectionReason?: string;
  /**
   *
   */
  notes?: string;
}

/**
 *
 */
export interface IdentityVerificationData {
  /**
   *
   */
  documentType: 'passport' | 'national_id' | 'drivers_license' | 'other';
  /**
   *
   */
  documentNumber: string;
  /**
   *
   */
  expiryDate?: Date;
  /**
   *
   */
  notes?: string;
}

/**
 *
 */
export interface PhotoVerificationData {
  /**
   *
   */
  notes?: string;
}

/**
 *
 */
export interface PhoneVerificationData {
  /**
   *
   */
  phoneNumber: string;
}

/**
 *
 */
export interface PhoneVerificationResponse {
  /**
   *
   */
  status: 'pending';
  /**
   *
   */
  submittedDate: Date;
  /**
   *
   */
  phoneNumber: string;
  /**
   *
   */
  verificationCode?: string; // Only in development
}

/**
 *
 */
export interface EmailVerificationData {
  /**
   *
   */
  email: string;
}

/**
 *
 */
export interface EmailVerificationResponse {
  /**
   *
   */
  status: 'pending';
  /**
   *
   */
  submittedDate: Date;
  /**
   *
   */
  email: string;
  /**
   *
   */
  verificationCode?: string; // Only in development
}

/**
 *
 */
export interface AddressVerificationData {
  /**
   *
   */
  street: string;
  /**
   *
   */
  city: string;
  /**
   *
   */
  postalCode: string;
  /**
   *
   */
  county: string;
  /**
   *
   */
  country: string;
  /**
   *
   */
  notes?: string;
}

/**
 *
 */
export interface UserVerificationStatus {
  /**
   *
   */
  username: string;
  /**
   *
   */
  verificationLevel: number;
  /**
   *
   */
  verificationBadges: {
    /**
     *
     */
    identity: boolean;
    /**
     *
     */
    photo: boolean;
    /**
     *
     */
    phone: boolean;
    /**
     *
     */
    email: boolean;
    /**
     *
     */
    address: boolean;
  };
}

/**
 *
 */
export interface PendingVerification {
  /**
   *
   */
  _id: string;
  /**
   *
   */
  user: {
    /**
     *
     */
    _id: string;
    /**
     *
     */
    username: string;
    /**
     *
     */
    email: string;
    /**
     *
     */
    role: string;
  };
  /**
   *
   */
  overallStatus: string;
  /**
   *
   */
  verificationLevel: number;
  /**
   *
   */
  verificationTypes: {
    /**
     *
     */
    identity: VerificationType;
    /**
     *
     */
    photo: VerificationType;
    /**
     *
     */
    phone: VerificationType & {
      /**
       *
       */
      phoneNumber?: string;
    };
    /**
     *
     */
    email: VerificationType & {
      /**
       *
       */
      email?: string;
    };
    /**
     *
     */
    address: VerificationType & {
      /**
       *
       */
      street?: string;
      /**
       *
       */
      city?: string;
      /**
       *
       */
      postalCode?: string;
      /**
       *
       */
      county?: string;
      /**
       *
       */
      country?: string;
    };
  };
  /**
   *
   */
  lastUpdated: Date;
  /**
   *
   */
  createdAt: Date;
}
