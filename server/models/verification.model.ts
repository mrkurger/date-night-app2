import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { IUserDocument } from './user.model.js'; // Ensuring .js extension for now

// Define Verification Status Enum
export enum VerificationStatus {
  NotSubmitted = 'not_submitted',
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}

// Define Document Type Enum for Identity Verification
export enum DocumentType {
  Passport = 'passport',
  NationalId = 'national_id',
  DriversLicense = 'drivers_license',
  Other = 'other',
}

// Interface for a single verification type (e.g., identity, photo)
export interface IVerificationTypeDetail {
  status: VerificationStatus;
  submittedDate?: Date;
  approvedDate?: Date;
  rejectedDate?: Date;
  rejectionReason?: string;
  notes?: string;
}

// Interface for Identity Verification
export interface IIdentityVerification extends IVerificationTypeDetail {
  documentType?: DocumentType;
  documentNumber?: string;
  expiryDate?: Date;
  documentImages?: string[]; // URLs to securely stored images
}

// Interface for Photo Verification
export interface IPhotoVerification extends IVerificationTypeDetail {
  verificationImage?: string; // URL to securely stored image
}

// Interface for Phone Verification
export interface IPhoneVerification extends IVerificationTypeDetail {
  phoneNumber?: string;
  verificationCode?: {
    code?: string;
    expiresAt?: Date;
  };
  verified?: boolean;
}

// Interface for Email Verification
export interface IEmailVerification extends IVerificationTypeDetail {
  email?: string;
  verificationCode?: {
    code?: string;
    expiresAt?: Date;
  };
  verified?: boolean;
}

// Interface for Address Verification
export interface IAddressVerification extends IVerificationTypeDetail {
  street?: string;
  city?: string;
  postalCode?: string;
  county?: string;
  country?: string;
  documentImage?: string; // URL to securely stored image of proof of address
}

// Interface for all verification types within a Verification document
export interface IVerificationTypes {
  identity: IIdentityVerification;
  photo: IPhotoVerification;
  phone: IPhoneVerification;
  email: IEmailVerification;
  address: IAddressVerification;
  [key: string]:
    | IIdentityVerification
    | IPhotoVerification
    | IPhoneVerification
    | IEmailVerification
    | IAddressVerification; // Index signature
}

// Define Overall Verification Status Enum
export enum OverallVerificationStatus {
  Unverified = 'unverified',
  PartiallyVerified = 'partially_verified',
  Verified = 'verified',
  Rejected = 'rejected', // Added missing Rejected status
}

// Main Verification Interface (Properties)
export interface IVerification {
  user: Types.ObjectId | IUserDocument;
  verificationTypes: IVerificationTypes;
  overallStatus: OverallVerificationStatus;
  verificationLevel: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for Verification Document (includes Mongoose Document properties and methods)
export interface IVerificationDocument extends IVerification, Document {
  submitIdentityVerification(_data: {
    documentType: DocumentType;
    documentNumber: string;
    expiryDate?: Date;
    documentImages?: string[];
    notes?: string;
  }): Promise<IVerificationDocument>;

  submitPhotoVerification(_data: {
    verificationImage: string;
    notes?: string;
  }): Promise<IVerificationDocument>;

  submitPhoneVerification(
    _phoneNumber: string
  ): Promise<{ verification: IVerificationDocument; verificationCode: string }>;

  verifyPhoneWithCode(_code: string): Promise<IVerificationDocument>;

  submitEmailVerification(
    _email: string
  ): Promise<{ verification: IVerificationDocument; verificationCode: string }>;

  verifyEmailWithCode(_code: string): Promise<IVerificationDocument>;

  submitAddressVerification(_data: {
    street: string;
    city: string;
    postalCode: string;
    county: string;
    country: string;
    documentImage?: string;
    notes?: string;
  }): Promise<IVerificationDocument>;

  approveVerification(
    _type: keyof IVerificationTypes,
    _notes?: string
  ): Promise<IVerificationDocument>;

  rejectVerification(
    _type: keyof IVerificationTypes,
    _notes?: string
  ): Promise<IVerificationDocument>;

  // This method seems more generic, let's keep its original signature for now
  // and assume it's implemented in a way that handles different document types.
  // If it's specific to a certain type, it might need renaming or overloading.
  submitVerification(
    _type: keyof IVerificationTypes, // Which verification type is being submitted
    _documentPath: string, // Path to the uploaded document (if applicable)
    _documentMimeType: string // Mime type of the document (if applicable)
    // _notes?: string // Optional notes
  ): Promise<IVerificationDocument>;

  updateOverallStatus(): Promise<IVerificationDocument>;

  sendVerificationApprovedEmail(
    _user: Pick<IUserDocument, 'email' | 'firstName'>,
    _verificationType: string
  ): Promise<{ verification: IVerificationDocument; emailSent: boolean; error?: any }>;

  sendVerificationRejectedEmail(
    _user: Pick<IUserDocument, 'email' | 'firstName'>,
    _verificationType: string,
    _rejectionReason: string
  ): Promise<{ verification: IVerificationDocument; emailSent: boolean; error?: any }>;
}

// Interface for Verification Model (includes static methods)
export interface IVerificationModel extends Model<IVerificationDocument> {
  findPendingVerifications(): Promise<IVerificationDocument[]>;
  findVerifiedUsers(): Promise<IVerificationDocument[]>;
  // Example of a more specific static method if needed:
  // findByUserAndType(userId: Types.ObjectId, type: keyof IVerificationTypes): Promise<IVerificationDocument | null>;
}

const verificationTypeDetailSchemaFields = {
  status: {
    type: String,
    enum: Object.values(VerificationStatus),
    default: VerificationStatus.NotSubmitted,
  },
  submittedDate: Date,
  approvedDate: Date,
  rejectedDate: Date,
  rejectionReason: String,
  notes: String,
};

const verificationSchema = new Schema<IVerificationDocument, IVerificationModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    verificationTypes: {
      identity: {
        ...verificationTypeDetailSchemaFields,
        documentType: {
          type: String,
          enum: Object.values(DocumentType),
        },
        documentNumber: {
          type: String,
          select: false, // Sensitive data, do not select by default
        },
        expiryDate: Date,
        documentImages: [String], // Array of URLs
      },
      photo: {
        ...verificationTypeDetailSchemaFields,
        verificationImage: String, // URL
      },
      phone: {
        ...verificationTypeDetailSchemaFields,
        phoneNumber: String,
        verificationCode: {
          code: String,
          expiresAt: Date,
        },
        verified: {
          type: Boolean,
          default: false,
        },
      },
      email: {
        ...verificationTypeDetailSchemaFields,
        email: String, // Store the email that was verified
        verificationCode: {
          code: String,
          expiresAt: Date,
        },
        verified: {
          type: Boolean,
          default: false,
        },
      },
      address: {
        ...verificationTypeDetailSchemaFields,
        street: String,
        city: String,
        postalCode: String,
        county: String,
        country: String,
        documentImage: String, // URL
      },
    },
    overallStatus: {
      type: String,
      enum: Object.values(OverallVerificationStatus),
      default: OverallVerificationStatus.Unverified,
    },
    verificationLevel: {
      type: Number,
      min: 0,
      max: 5, // Assuming 5 levels of verification
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    // createdAt and updatedAt are handled by timestamps: true
  },
  {
    timestamps: true,
  }
);

// Indexes
verificationSchema.index({ user: 1 });
verificationSchema.index({ overallStatus: 1 });
verificationSchema.index({ 'verificationTypes.identity.status': 1 });
verificationSchema.index({ 'verificationTypes.photo.status': 1 });
// Add more indexes as needed for query performance

// Pre-save hook to update lastUpdated and overallStatus
verificationSchema.pre<IVerificationDocument>('save', function (next) {
  this.lastUpdated = new Date();

  // Logic to update overallStatus and verificationLevel based on individual types
  let verifiedCount = 0;
  let pendingCount = 0;
  let rejectedCount = 0;
  const types = this.verificationTypes;
  const typeKeys = Object.keys(types) as Array<keyof IVerificationTypes>;

  for (const typeKey of typeKeys) {
    // Ensure that we are only accessing defined properties of IVerificationTypes
    if (Object.prototype.hasOwnProperty.call(types, typeKey)) {
      const verificationType = types[typeKey];
      if (verificationType) { // Check if verificationType is defined
        if (verificationType.status === VerificationStatus.Approved) {
          verifiedCount++;
        } else if (verificationType.status === VerificationStatus.Pending) {
          pendingCount++;
        } else if (verificationType.status === VerificationStatus.Rejected) {
          rejectedCount++;
        }
      }
    }
  }

  if (rejectedCount > 0) {
    this.overallStatus = OverallVerificationStatus.Rejected;
  } else if (verifiedCount === typeKeys.length) {
    this.overallStatus = OverallVerificationStatus.Verified;
  } else if (verifiedCount > 0 || pendingCount > 0) {
    this.overallStatus = OverallVerificationStatus.PartiallyVerified;
  } else {
    this.overallStatus = OverallVerificationStatus.Unverified;
  }

  // Example: Simple verification level calculation
  this.verificationLevel = verifiedCount;

  next();
});

// Methods
// (Example method, actual implementation would involve external services like AWS S3, Twilio, SendGrid etc.)

// Submit a generic verification document (e.g., identity document, photo)
// This is a placeholder and would need significant expansion
verificationSchema.methods.submitVerification = async function (
  this: IVerificationDocument,
  type: keyof IVerificationTypes,
  _documentPath: string, // Assuming this is a path to a locally stored temp file
  _documentMimeType: string, // e.g., 'image/jpeg'
  notes?: string
): Promise<IVerificationDocument> {
  const verificationDetail = this.verificationTypes[type];
  if (!verificationDetail) {
    throw new Error(\`Invalid verification type: \${type}\`);
  }

  // In a real app:
  // 1. Upload documentPath to secure storage (S3, etc.), get URL
  // 2. Update the relevant fields in verificationDetail
  //    e.g., if type is 'identity', update documentImages
  //    e.g., if type is 'photo', update verificationImage

  verificationDetail.status = VerificationStatus.Pending;
  verificationDetail.submittedDate = new Date();
  if (notes) {
    verificationDetail.notes = notes;
  }

  // Example for identity
  if (type === 'identity' && 'documentImages' in verificationDetail) {
    // Assuming _documentPath is the new image URL after upload
    (verificationDetail as IIdentityVerification).documentImages = [
      ...((verificationDetail as IIdentityVerification).documentImages || []),
      _documentPath, // This should be the URL from S3
    ];
  }
  // Example for photo
  if (type === 'photo' && 'verificationImage' in verificationDetail) {
    (verificationDetail as IPhotoVerification).verificationImage = _documentPath; // This should be the URL from S3
  }

  await this.save();
  return this;
};

verificationSchema.methods.approveVerification = async function (
  this: IVerificationDocument,
  type: keyof IVerificationTypes,
  notes?: string
): Promise<IVerificationDocument> {
  const verificationDetail = this.verificationTypes[type];
  if (!verificationDetail) {
    throw new Error(\`Invalid verification type: \${type}\`);
  }
  verificationDetail.status = VerificationStatus.Approved;
  verificationDetail.approvedDate = new Date();
  verificationDetail.rejectedDate = undefined;
  verificationDetail.rejectionReason = undefined;
  if (notes) {
    verificationDetail.notes = notes;
  }
  await this.save(); // This will trigger the pre-save hook for overallStatus
  return this;
};

verificationSchema.methods.rejectVerification = async function (
  this: IVerificationDocument,
  type: keyof IVerificationTypes,
  rejectionReason?: string,
  notes?: string
): Promise<IVerificationDocument> {
  const verificationDetail = this.verificationTypes[type];
  if (!verificationDetail) {
    throw new Error(\`Invalid verification type: \${type}\`);
  }
  verificationDetail.status = VerificationStatus.Rejected;
  verificationDetail.rejectedDate = new Date();
  verificationDetail.approvedDate = undefined;
  verificationDetail.rejectionReason = rejectionReason || 'Rejected without specific reason';
  if (notes) {
    verificationDetail.notes = notes;
  }
  await this.save(); // This will trigger the pre-save hook for overallStatus
  return this;
};

verificationSchema.methods.updateOverallStatus = async function (
  this: IVerificationDocument
): Promise<IVerificationDocument> {
  // The pre-save hook already handles this, but this method can be called explicitly if needed.
  // Or, it could contain more complex logic if the pre-save hook is too simple.
  // For now, just re-saving will trigger the hook.
  await this.save();
  return this;
};

// Static methods
verificationSchema.statics.findPendingVerifications = function (
  this: IVerificationModel
): Promise<IVerificationDocument[]> {
  return this.find({
    $or: [
      { 'verificationTypes.identity.status': VerificationStatus.Pending },
      { 'verificationTypes.photo.status': VerificationStatus.Pending },
      { 'verificationTypes.phone.status': VerificationStatus.Pending },
      { 'verificationTypes.email.status': VerificationStatus.Pending },
      { 'verificationTypes.address.status': VerificationStatus.Pending },
    ],
  }).populate('user', 'firstName lastName email profileImage'); // Populate user details
};

verificationSchema.statics.findVerifiedUsers = function (
  this: IVerificationModel
): Promise<IVerificationDocument[]> {
  return this.find({ overallStatus: OverallVerificationStatus.Verified }).populate(
    'user',
    'firstName lastName email profileImage'
  );
};

// Placeholder for email sending - in a real app, use a service like SendGrid/Nodemailer
async function sendEmail(
  _to: string,
  _subject: string,
  _htmlContent: string
): Promise<{ success: boolean; error?: any }> {
  console.log(\`Simulating email send to: \${_to}\`);
  console.log(\`Subject: \${_subject}\`);
  // console.log(\`HTML Content: \${_htmlContent}\`);
  // Simulate email sending success
  return { success: true };
}

verificationSchema.methods.sendVerificationApprovedEmail = async function (
  this: IVerificationDocument,
  user: Pick<IUserDocument, 'email' | 'firstName'>,
  verificationType: string // e.g., "Identity", "Photo ID"
): Promise<{ verification: IVerificationDocument; emailSent: boolean; error?: any }> {
  const subject = \`Your \${verificationType} Verification is Approved!\`;
  const htmlContent = \`
    <p>Hi \${user.firstName || 'User'},</p>
    <p>Great news! Your \${verificationType} has been successfully verified and approved.</p>
    <p>You can now enjoy all the features associated with this verification level.</p>
    <p>Thanks,</p>
    <p>The Date Night App Team</p>
  \`;
  try {
    const emailResult = await sendEmail(user.email, subject, htmlContent);
    return { verification: this, emailSent: emailResult.success, error: emailResult.error };
  } catch (error) {
    console.error('Error sending verification approved email:', error);
    return { verification: this, emailSent: false, error };
  }
};

verificationSchema.methods.sendVerificationRejectedEmail = async function (
  this: IVerificationDocument,
  user: Pick<IUserDocument, 'email' | 'firstName'>,
  verificationType: string, // e.g., "Identity", "Photo ID"
  rejectionReason: string
): Promise<{ verification: IVerificationDocument; emailSent: boolean; error?: any }> {
  const subject = \`Action Required: Your \${verificationType} Verification\`;
  const htmlContent = \`
    <p>Hi \${user.firstName || 'User'},</p>
    <p>We're writing to inform you that your recent \${verificationType} submission could not be approved at this time.</p>
    <p><strong>Reason for rejection:</strong> \${rejectionReason}</p>
    <p>Please review the reason and resubmit your verification documents if necessary through your profile settings.</p>
    <p>If you have any questions, please contact our support team.</p>
    <p>Thanks,</p>
    <p>The Date Night App Team</p>
  \`;
  try {
    const emailResult = await sendEmail(user.email, subject, htmlContent);
    return { verification: this, emailSent: emailResult.success, error: emailResult.error };
  } catch (error) {
    console.error('Error sending verification rejected email:', error);
    return { verification: this, emailSent: false, error };
  }
};


const VerificationModel = mongoose.model<IVerificationDocument, IVerificationModel>(
  'Verification',
  verificationSchema
);

export default VerificationModel;
