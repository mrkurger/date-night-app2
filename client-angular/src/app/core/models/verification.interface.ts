/**
 *
 */
export interface IVerificationStatus {
  id: string;
  type: IVerificationType;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  processedAt?: Date;
  expiresAt?: Date;
  metadata?: {
    [key: string]: unknown;
  };
  notes?: string;
  reviewedBy?: string;
}

/**
 *
 */
export interface IVerificationType {
  id: string;
  name: string;
  description: string;
  required: boolean;
  expiration?: number;
  validationRules?: {
    [key: string]: unknown;
  };
}

/**
 *
 */
export interface IIdentityVerificationData {
  documentType: 'passport' | 'drivers_license' | 'id_card';
  documentNumber: string;
  expiryDate: Date;
  countryOfIssue: string;
  documentImages: string[];
}

/**
 *
 */
export interface IPhotoVerificationData {
  selfie: string;
  documentPhoto: string;
}

/**
 *
 */
export interface IPhoneVerificationData {
  phoneNumber: string;
  verificationCode: string;
}

/**
 *
 */
export interface IPhoneVerificationResponse {
  success: boolean;
  verificationId?: string;
  error?: string;
  nextStep?: 'submit_code' | 'verification_complete';
}

/**
 *
 */
export interface IEmailVerificationData {
  email: string;
  verificationCode: string;
}

/**
 *
 */
export interface IEmailVerificationResponse {
  success: boolean;
  verificationId?: string;
  error?: string;
  nextStep?: 'submit_code' | 'verification_complete';
}

/**
 *
 */
export interface IAddressVerificationData {
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  proofOfAddress: string[];
}

/**
 *
 */
export interface IUserVerificationStatus {
  userId: string;
  completedVerifications: IVerificationType['id'][];
  pendingVerifications: IVerificationType['id'][];
  failedVerifications: Array<{
    type: IVerificationType['id'];
    reason: string;
    failedAt: Date;
  }>;
  lastUpdated: Date;
  overallStatus: 'unverified' | 'partially_verified' | 'fully_verified';
}

/**
 *
 */
export interface IPendingVerification {
  userId: string;
  type: IVerificationType;
  submittedData:
    | IIdentityVerificationData
    | IPhotoVerificationData
    | IPhoneVerificationData
    | IEmailVerificationData
    | IAddressVerificationData;
  status: 'submitted' | 'processing' | 'requires_action';
  submittedAt: Date;
  expiresAt?: Date;
}
