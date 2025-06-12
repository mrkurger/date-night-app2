// Basic email utility module
// In a production app, this would use a proper email service like SendGrid, Mailgun, or AWS SES

/**
 * Send an email
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 */
export const sendEmail = async options => {
  // In a real implementation, this would connect to an email service
  console.log(`
    ========== EMAIL SENT ==========
    To: ${options.to}
    Subject: ${options.subject}
    Text: ${options.text}
    HTML: ${options.html}
    ===============================
  `);

  // Mock successful email sending
  return Promise.resolve();
};
