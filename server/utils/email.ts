/**
 * Email service utility for sending transactional emails
 * Supports multiple email providers (Sendgrid, Mailgun, AWS SES)
 */
import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import Mailgun from 'mailgun.js';
import formData from 'form-data';

// Email options interface
export interface EmailOptions {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: Array<{
    filename?: string;
    content?: string | Buffer;
    path?: string;
    contentType?: string;
  }>;
}

// Configure email providers
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const mailgun = process.env.MAILGUN_API_KEY
  ? new Mailgun(formData).client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY,
      url: process.env.MAILGUN_URL || 'https://api.mailgun.net',
    })
  : null;

// Create a test SMTP transporter if no email provider config exists
let nodemailerTransporter =
  process.env.NODE_ENV === 'development'
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
        secure: process.env.SMTP_SECURE === 'true',
      })
    : null;

// If development environment and no transporter, create Ethereal test account
const setupTestTransporter = async () => {
  if (process.env.NODE_ENV === 'development' && !nodemailerTransporter) {
    try {
      const testAccount = await nodemailer.createTestAccount();
      nodemailerTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('📧 Ethereal test account created for email testing');
      console.log(`Username: ${testAccount.user}`);
      console.log(`Password: ${testAccount.pass}`);
    } catch (error) {
      console.error('Could not create test email account', error);
    }
  }
};

// Initialize test transporter if needed
setupTestTransporter();

/**
 * Send an email using the configured provider
 * Falls back to console output if no provider is configured
 *
 * @param options Email options
 * @returns Promise that resolves when email is sent
 */
export const sendEmail = async (options: EmailOptions): Promise<any> => {
  // Ensure sender address is set
  const from = options.from || process.env.EMAIL_FROM || 'noreply@date-night-app.com';

  try {
    // Try SendGrid if configured
    if (process.env.SENDGRID_API_KEY) {
      return await sgMail.send({
        to: options.to,
        from,
        subject: options.subject,
        text: options.text,
        html: options.html || '',
        ...(options.cc ? { cc: options.cc } : {}),
        ...(options.bcc ? { bcc: options.bcc } : {}),
        ...(options.replyTo ? { replyTo: options.replyTo } : {}),
        ...(options.attachments ? { attachments: options.attachments } : {}),
      });
    }

    // Try Mailgun if configured
    if (mailgun && process.env.MAILGUN_DOMAIN) {
      return await mailgun.messages.create(process.env.MAILGUN_DOMAIN, {
        from,
        to: Array.isArray(options.to) ? options.to.join(',') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html || '',
        ...(options.cc
          ? { cc: Array.isArray(options.cc) ? options.cc.join(',') : options.cc }
          : {}),
        ...(options.bcc
          ? { bcc: Array.isArray(options.bcc) ? options.bcc.join(',') : options.bcc }
          : {}),
        ...(options.replyTo ? { 'h:Reply-To': options.replyTo } : {}),
      });
    }

    // Try SMTP if configured
    if (nodemailerTransporter) {
      const info = await nodemailerTransporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html || '',
        ...(options.cc ? { cc: options.cc } : {}),
        ...(options.bcc ? { bcc: options.bcc } : {}),
        ...(options.replyTo ? { replyTo: options.replyTo } : {}),
        ...(options.attachments ? { attachments: options.attachments } : {}),
      });

      // If using Ethereal, log the URL to view the email
      if (process.env.NODE_ENV === 'development') {
        console.log(`📧 Email sent: ${nodemailer.getTestMessageUrl(info)}`);
      }

      return info;
    }

    // Fallback to logging (development/testing only)
    console.log(`
      ========== EMAIL SENT ==========
      From: ${from}
      To: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}
      Subject: ${options.subject}
      Text: ${options.text}
      HTML: ${options.html || 'No HTML content'}
      ===============================
    `);

    return Promise.resolve({
      success: true,
      message: 'Email logged to console (no email provider configured)',
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(
      `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

/**
 * Send a verification email to a user
 * @param to Recipient email address
 * @param token Verification token
 * @param name Recipient name
 */
export const sendVerificationEmail = async (
  to: string,
  token: string,
  name = 'there'
): Promise<any> => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

  return sendEmail({
    to,
    subject: 'Verify your email address - Date Night App',
    text: `Hi ${name},\n\nWelcome to Date Night App! Please verify your email by clicking the link below:\n\n${verificationUrl}\n\nThis link expires in 24 hours.\n\nIf you didn't create an account, please ignore this email.\n\nThanks,\nThe Date Night App Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #5c2d91;">Welcome to Date Night App!</h2>
        <p>Hi ${name},</p>
        <p>Thanks for signing up! Please verify your email address to start finding exciting date ideas.</p>
        <div style="margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #5c2d91; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 4px; font-weight: bold;">
            Verify Email Address
          </a>
        </div>
        <p>This link expires in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
        <p>Thanks,<br>The Date Night App Team</p>
      </div>
    `,
  });
};

/**
 * Send a password reset email
 * @param to Recipient email address
 * @param token Reset token
 * @param name Recipient name
 */
export const sendPasswordResetEmail = async (
  to: string,
  token: string,
  name = 'there'
): Promise<any> => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

  return sendEmail({
    to,
    subject: 'Reset your password - Date Night App',
    text: `Hi ${name},\n\nYou requested a password reset. Please click the link below to set a new password:\n\n${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nThanks,\nThe Date Night App Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #5c2d91;">Reset Your Password</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #5c2d91; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 4px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>Thanks,<br>The Date Night App Team</p>
      </div>
    `,
  });
};
