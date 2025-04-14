
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for verification.model settings
// 
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
const mongoose = require('mongoose');

// Define the verification schema
const verificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  verificationTypes: {
    identity: {
      status: {
        type: String,
        enum: ['not_submitted', 'pending', 'approved', 'rejected'],
        default: 'not_submitted'
      },
      submittedDate: Date,
      approvedDate: Date,
      rejectedDate: Date,
      rejectionReason: String,
      documentType: {
        type: String,
        enum: ['passport', 'national_id', 'drivers_license', 'other'],
      },
      documentNumber: {
        type: String,
        select: false // Extra security to not return this in normal queries
      },
      expiryDate: Date,
      documentImages: [String], // URLs to securely stored images
      notes: String
    },
    photo: {
      status: {
        type: String,
        enum: ['not_submitted', 'pending', 'approved', 'rejected'],
        default: 'not_submitted'
      },
      submittedDate: Date,
      approvedDate: Date,
      rejectedDate: Date,
      rejectionReason: String,
      verificationImage: String, // URL to securely stored image
      notes: String
    },
    phone: {
      status: {
        type: String,
        enum: ['not_submitted', 'pending', 'approved', 'rejected'],
        default: 'not_submitted'
      },
      submittedDate: Date,
      approvedDate: Date,
      rejectedDate: Date,
      rejectionReason: String,
      phoneNumber: String,
      verificationCode: {
        code: String,
        expiresAt: Date
      },
      verified: {
        type: Boolean,
        default: false
      },
      notes: String
    },
    email: {
      status: {
        type: String,
        enum: ['not_submitted', 'pending', 'approved', 'rejected'],
        default: 'not_submitted'
      },
      submittedDate: Date,
      approvedDate: Date,
      rejectedDate: Date,
      rejectionReason: String,
      email: String,
      verificationCode: {
        code: String,
        expiresAt: Date
      },
      verified: {
        type: Boolean,
        default: false
      },
      notes: String
    },
    address: {
      status: {
        type: String,
        enum: ['not_submitted', 'pending', 'approved', 'rejected'],
        default: 'not_submitted'
      },
      submittedDate: Date,
      approvedDate: Date,
      rejectedDate: Date,
      rejectionReason: String,
      street: String,
      city: String,
      postalCode: String,
      county: String,
      country: String,
      documentImage: String, // URL to securely stored image of proof of address
      notes: String
    }
  },
  overallStatus: {
    type: String,
    enum: ['unverified', 'partially_verified', 'verified', 'rejected'],
    default: 'unverified'
  },
  verificationLevel: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for finding verifications by user
verificationSchema.index({ user: 1 });

// Index for finding verifications by status
verificationSchema.index({ overallStatus: 1 });

// Pre-save middleware to update the lastUpdated field
verificationSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  
  // Calculate verification level based on approved verifications
  let verificationCount = 0;
  let totalVerifications = 0;
  
  for (const type in this.verificationTypes) {
    if (this.verificationTypes[type].status === 'approved') {
      verificationCount++;
    }
    if (this.verificationTypes[type].status !== 'not_submitted') {
      totalVerifications++;
    }
  }
  
  // Set verification level (0-5)
  this.verificationLevel = Math.min(5, verificationCount);
  
  // Set overall status
  if (verificationCount === 0) {
    this.overallStatus = 'unverified';
  } else if (verificationCount < Object.keys(this.verificationTypes).length) {
    this.overallStatus = 'partially_verified';
  } else {
    this.overallStatus = 'verified';
  }
  
  // If any verification is rejected and none are approved, mark as rejected
  const hasRejected = Object.values(this.verificationTypes).some(v => v.status === 'rejected');
  if (hasRejected && verificationCount === 0) {
    this.overallStatus = 'rejected';
  }
  
  next();
});

// Method to submit identity verification
verificationSchema.methods.submitIdentityVerification = async function(data) {
  this.verificationTypes.identity = {
    ...this.verificationTypes.identity,
    status: 'pending',
    submittedDate: new Date(),
    documentType: data.documentType,
    documentNumber: data.documentNumber,
    expiryDate: data.expiryDate,
    documentImages: data.documentImages,
    notes: data.notes
  };
  
  return this.save();
};

// Method to submit photo verification
verificationSchema.methods.submitPhotoVerification = async function(data) {
  this.verificationTypes.photo = {
    ...this.verificationTypes.photo,
    status: 'pending',
    submittedDate: new Date(),
    verificationImage: data.verificationImage,
    notes: data.notes
  };
  
  return this.save();
};

// Method to submit phone verification
verificationSchema.methods.submitPhoneVerification = async function(phoneNumber) {
  // Generate a random 6-digit code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  
  this.verificationTypes.phone = {
    ...this.verificationTypes.phone,
    status: 'pending',
    submittedDate: new Date(),
    phoneNumber,
    verificationCode: {
      code: verificationCode,
      expiresAt
    },
    verified: false
  };
  
  return {
    verification: await this.save(),
    verificationCode
  };
};

// Method to verify phone with code
verificationSchema.methods.verifyPhoneWithCode = async function(code) {
  const phoneVerification = this.verificationTypes.phone;
  
  if (!phoneVerification || phoneVerification.status !== 'pending') {
    throw new Error('No pending phone verification found');
  }
  
  if (!phoneVerification.verificationCode || !phoneVerification.verificationCode.code) {
    throw new Error('No verification code found');
  }
  
  if (new Date() > phoneVerification.verificationCode.expiresAt) {
    throw new Error('Verification code has expired');
  }
  
  if (phoneVerification.verificationCode.code !== code) {
    throw new Error('Invalid verification code');
  }
  
  // Mark phone as verified
  this.verificationTypes.phone.verified = true;
  this.verificationTypes.phone.status = 'approved';
  this.verificationTypes.phone.approvedDate = new Date();
  
  return this.save();
};

// Method to submit email verification
verificationSchema.methods.submitEmailVerification = async function(email) {
  // Generate a random verification code
  const verificationCode = Math.random().toString(36).substring(2, 15) + 
                          Math.random().toString(36).substring(2, 15);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  this.verificationTypes.email = {
    ...this.verificationTypes.email,
    status: 'pending',
    submittedDate: new Date(),
    email,
    verificationCode: {
      code: verificationCode,
      expiresAt
    },
    verified: false
  };
  
  return {
    verification: await this.save(),
    verificationCode
  };
};

// Method to verify email with code
verificationSchema.methods.verifyEmailWithCode = async function(code) {
  const emailVerification = this.verificationTypes.email;
  
  if (!emailVerification || emailVerification.status !== 'pending') {
    throw new Error('No pending email verification found');
  }
  
  if (!emailVerification.verificationCode || !emailVerification.verificationCode.code) {
    throw new Error('No verification code found');
  }
  
  if (new Date() > emailVerification.verificationCode.expiresAt) {
    throw new Error('Verification code has expired');
  }
  
  if (emailVerification.verificationCode.code !== code) {
    throw new Error('Invalid verification code');
  }
  
  // Mark email as verified
  this.verificationTypes.email.verified = true;
  this.verificationTypes.email.status = 'approved';
  this.verificationTypes.email.approvedDate = new Date();
  
  return this.save();
};

// Method to submit address verification
verificationSchema.methods.submitAddressVerification = async function(data) {
  this.verificationTypes.address = {
    ...this.verificationTypes.address,
    status: 'pending',
    submittedDate: new Date(),
    street: data.street,
    city: data.city,
    postalCode: data.postalCode,
    county: data.county,
    country: data.country,
    documentImage: data.documentImage,
    notes: data.notes
  };
  
  return this.save();
};

// Method to approve a verification
verificationSchema.methods.approveVerification = async function(type, notes = '') {
  if (!this.verificationTypes[type]) {
    throw new Error(`Invalid verification type: ${type}`);
  }
  
  this.verificationTypes[type].status = 'approved';
  this.verificationTypes[type].approvedDate = new Date();
  
  if (notes) {
    this.verificationTypes[type].notes = notes;
  }
  
  return this.save();
};

// Method to reject a verification
verificationSchema.methods.rejectVerification = async function(type, reason, notes = '') {
  if (!this.verificationTypes[type]) {
    throw new Error(`Invalid verification type: ${type}`);
  }
  
  this.verificationTypes[type].status = 'rejected';
  this.verificationTypes[type].rejectedDate = new Date();
  this.verificationTypes[type].rejectionReason = reason;
  
  if (notes) {
    this.verificationTypes[type].notes = notes;
  }
  
  return this.save();
};

// Static method to find pending verifications
verificationSchema.statics.findPendingVerifications = function() {
  return this.find({
    $or: [
      { 'verificationTypes.identity.status': 'pending' },
      { 'verificationTypes.photo.status': 'pending' },
      { 'verificationTypes.address.status': 'pending' }
    ]
  }).populate('user', 'username email role');
};

// Static method to find verified users
verificationSchema.statics.findVerifiedUsers = function() {
  return this.find({
    overallStatus: 'verified'
  }).populate('user', 'username email role');
};

module.exports = mongoose.model('Verification', verificationSchema);